/**
 * Calculation Service Layer
 *
 * Orchestrates the complete prescription calculation workflow by coordinating
 * drug normalization, SIG parsing, quantity calculation, and NDC matching.
 * This service layer separates business logic from API routing.
 *
 * @module lib/services/calculation-service
 */

import { searchDrugByName } from '../api/rxnorm.js';
import { getNDCsByRxCUI } from '../api/fda.js';
import { parseSIG } from '../calculations/sig-parsing.js';
import { calculateQuantity } from '../calculations/quantity.js';
import { selectOptimalNDCs } from '../calculations/ndc-matching.js';
import { logEvent, logCalculationStart, logCalculationCompleted } from '../utils/logger.js';
import { logCalculationCreated } from '../utils/audit.js';
import { trackCalculation } from '../utils/performance.js';

/**
 * Main calculation orchestration function
 * @param {Object} input - Calculation input
 * @param {string} [input.drugName] - Drug name (either drugName or ndc required)
 * @param {string} [input.ndc] - NDC code (either drugName or ndc required)
 * @param {string} input.sig - Prescription directions
 * @param {number} [input.daysSupply] - Days supply (optional)
 * @param {Object} [options] - Calculation options
 * @param {string} [options.userId] - User ID for logging
 * @param {number} [options.maxAlternatives] - Max NDC alternatives to return
 * @returns {Promise<Object>} Complete calculation result
 */
export async function runCalculation(input, options = {}) {
  const { userId = null, maxAlternatives = 5 } = options;

  // Start performance tracking
  const endPerformanceTracking = trackCalculation('full_calculation', input);

  // Start calculation logging
  const requestId = logCalculationStart(input, userId);

  try {
    // Step 1: Normalize drug (if drug name provided)
    const normalizationResult = await normalizeDrug(input, userId);
    if (!normalizationResult.success) {
      return createErrorResult(
        'normalization_failed',
        normalizationResult.error,
        { step: 'normalization', input }
      );
    }

    // Step 2: Parse SIG
    const sigResult = await parseSIGStep(input.sig, userId);
    if (!sigResult.success) {
      return createErrorResult(
        'sig_parsing_failed',
        sigResult.error,
        { step: 'sig_parsing', input, normalization: normalizationResult.data }
      );
    }

    // Step 3: Calculate quantity (if days supply provided)
    const quantityResult = await calculateQuantityStep(
      sigResult.data,
      input.daysSupply,
      userId
    );
    if (!quantityResult.success) {
      return createErrorResult(
        'quantity_calculation_failed',
        quantityResult.error,
        {
          step: 'quantity_calculation',
          input,
          normalization: normalizationResult.data,
          sig: sigResult.data
        }
      );
    }

    // Step 4: Fetch NDCs
    const ndcResult = await fetchNDCs(
      normalizationResult.data?.rxcui || input.ndc,
      userId
    );
    if (!ndcResult.success) {
      return createErrorResult(
        'ndc_fetch_failed',
        ndcResult.error,
        {
          step: 'ndc_fetch',
          input,
          normalization: normalizationResult.data,
          sig: sigResult.data,
          quantity: quantityResult.data
        }
      );
    }

    // Step 5: Match optimal NDCs
    const matchingResult = await matchNDCsStep(
      quantityResult.data?.quantity || 0,
      ndcResult.data,
      { maxAlternatives },
      userId
    );

    // Assemble final result
    const finalResult = assembleCalculationResult({
      input,
      normalization: normalizationResult.data,
      sig: sigResult.data,
      quantity: quantityResult.data,
      ndcs: ndcResult.data,
      recommendations: matchingResult.recommendations,
      alternatives: matchingResult.alternatives,
      warnings: [
        ...(sigResult.warnings || []),
        ...(quantityResult.warnings || []),
        ...(matchingResult.warnings || [])
      ]
    });

    // Log successful completion
    logCalculationCompleted(requestId, finalResult, 0, userId);

    // End performance tracking
    endPerformanceTracking(finalResult, null);

    return finalResult;

  } catch (error) {
    // Log error
    logEvent('CALCULATION_ERROR', {
      requestId,
      error: error.message,
      stack: error.stack,
      input
    }, error);

    // End performance tracking with error
    endPerformanceTracking(null, error);

    return createErrorResult(
      'unexpected_error',
      `Calculation failed: ${error.message}`,
      { requestId, input }
    );
  }
}

/**
 * Step 1: Drug normalization
 * @param {Object} input - Input data
 * @param {string} [userId] - User ID for logging
 * @returns {Promise<Object>} Normalization result
 */
export async function normalizeDrug(input, userId = null) {
  try {
    if (input.ndc) {
      // Direct NDC entry - skip normalization
      logEvent('NORMALIZATION_SKIPPED', {
        reason: 'direct_ndc_entry',
        ndc: input.ndc
      }, null, userId);

      return {
        success: true,
        data: {
          source: 'direct_ndc',
          ndc: input.ndc
        }
      };
    }

    if (!input.drugName) {
      return {
        success: false,
        error: 'Either drug name or NDC must be provided'
      };
    }

    // Search for drug using RxNorm
    const drugData = await searchDrugByName(input.drugName, { userId });

    if (!drugData) {
      return {
        success: false,
        error: `Drug "${input.drugName}" not found. Try a different spelling or enter NDC directly.`
      };
    }

    return {
      success: true,
      data: {
        source: 'rxnorm',
        rxcui: drugData.rxcui,
        drugName: drugData.name,
        synonym: drugData.synonym,
        dosageForm: extractDosageForm(drugData.name),
        strength: extractStrength(drugData.name)
      }
    };

  } catch (error) {
    logEvent('NORMALIZATION_ERROR', {
      drugName: input.drugName,
      ndc: input.ndc,
      error: error.message
    }, error, userId);

    return {
      success: false,
      error: `Drug lookup failed: ${error.message}`
    };
  }
}

/**
 * Step 2: SIG parsing
 * @param {string} sig - SIG text
 * @param {string} [userId] - User ID for logging
 * @returns {Promise<Object>} SIG parsing result
 */
export async function parseSIGStep(sig, userId = null) {
  try {
    const parsedSIG = parseSIG(sig);

    if (!parsedSIG.parseSuccess) {
      return {
        success: false,
        error: parsedSIG.parseError || 'Failed to parse prescription directions',
        warnings: [{
          id: 'sig_parse_warning',
          type: 'sig_parse_error',
          severity: 'warning',
          message: 'Could not automatically parse directions. Manual entry recommended.',
          data: { originalText: sig }
        }]
      };
    }

    return {
      success: true,
      data: parsedSIG,
      warnings: []
    };

  } catch (error) {
    logEvent('SIG_PARSING_ERROR', {
      sig,
      error: error.message
    }, error, userId);

    return {
      success: false,
      error: `SIG parsing failed: ${error.message}`
    };
  }
}

/**
 * Step 3: Quantity calculation
 * @param {Object} parsedSIG - Parsed SIG object
 * @param {number} [daysSupply] - Days supply
 * @param {string} [userId] - User ID for logging
 * @returns {Promise<Object>} Quantity calculation result
 */
export async function calculateQuantityStep(parsedSIG, daysSupply, userId = null) {
  try {
    if (!daysSupply) {
      // No quantity calculation requested
      return {
        success: true,
        data: null,
        warnings: []
      };
    }

    const quantityResult = calculateQuantity(parsedSIG, daysSupply);

    if (!quantityResult.success) {
      return {
        success: false,
        error: quantityResult.error,
        warnings: []
      };
    }

    return {
      success: true,
      data: quantityResult,
      warnings: []
    };

  } catch (error) {
    logEvent('QUANTITY_CALCULATION_ERROR', {
      parsedSIG,
      daysSupply,
      error: error.message
    }, error, userId);

    return {
      success: false,
      error: `Quantity calculation failed: ${error.message}`
    };
  }
}

/**
 * Step 4: Fetch NDCs
 * @param {string} identifier - RxCUI or NDC
 * @param {string} [userId] - User ID for logging
 * @returns {Promise<Object>} NDC fetch result
 */
export async function fetchNDCs(identifier, userId = null) {
  try {
    if (!identifier) {
      return {
        success: false,
        error: 'No drug identifier provided for NDC lookup'
      };
    }

    // Try RxCUI first (from drug normalization)
    if (identifier.match(/^\d+$/) && identifier.length > 4) {
      const ndcResult = await getNDCsByRxCUI(identifier, { userId });

      if (ndcResult.active && ndcResult.active.length > 0) {
        return {
          success: true,
          data: {
            active: ndcResult.active,
            inactive: ndcResult.inactive || []
          }
        };
      }
    }

    // Fallback: search by drug name (this would be the name from NDC validation)
    // For now, return empty result with warning
    logEvent('NDC_FETCH_LIMITED', {
      identifier,
      reason: 'RxCUI search returned no results'
    }, null, userId);

    return {
      success: true,
      data: {
        active: [],
        inactive: []
      },
      warnings: [{
        id: 'no_ndcs_found',
        type: 'api_error',
        severity: 'warning',
        message: 'No NDCs found for this drug. Manual NDC entry may be required.',
        data: { identifier }
      }]
    };

  } catch (error) {
    logEvent('NDC_FETCH_ERROR', {
      identifier,
      error: error.message
    }, error, userId);

    return {
      success: false,
      error: `NDC lookup failed: ${error.message}`
    };
  }
}

/**
 * Step 5: Match optimal NDCs
 * @param {number} quantity - Quantity to match
 * @param {Object} ndcData - NDC data with active/inactive arrays
 * @param {Object} [options] - Matching options
 * @param {string} [userId] - User ID for logging
 * @returns {Promise<Object>} NDC matching result
 */
export async function matchNDCsStep(quantity, ndcData, options = {}, userId = null) {
  try {
    if (!quantity || quantity <= 0) {
      return {
        success: true,
        recommendations: [],
        alternatives: [],
        warnings: [{
          id: 'no_quantity_for_matching',
          type: 'info',
          severity: 'info',
          message: 'No quantity calculated, NDC matching skipped',
          data: { quantity }
        }]
      };
    }

    const allNDCs = [
      ...(ndcData.active || []),
      ...(ndcData.inactive || [])
    ];

    if (allNDCs.length === 0) {
      return {
        success: true,
        recommendations: [],
        alternatives: [],
        warnings: [{
          id: 'no_ndcs_for_matching',
          type: 'api_error',
          severity: 'error',
          message: 'No NDCs available for matching',
          data: { quantity }
        }]
      };
    }

    const matchingResult = selectOptimalNDCs(quantity, allNDCs, options);

    if (!matchingResult.success) {
      return {
        success: false,
        error: matchingResult.error,
        recommendations: [],
        alternatives: [],
        warnings: matchingResult.warnings || []
      };
    }

    return {
      success: true,
      recommendations: matchingResult.recommendations,
      alternatives: matchingResult.alternatives,
      warnings: matchingResult.warnings || []
    };

  } catch (error) {
    logEvent('NDC_MATCHING_ERROR', {
      quantity,
      ndcCount: ndcData?.active?.length + ndcData?.inactive?.length,
      error: error.message
    }, error, userId);

    return {
      success: false,
      error: `NDC matching failed: ${error.message}`,
      recommendations: [],
      alternatives: [],
      warnings: []
    };
  }
}

/**
 * Assemble final calculation result
 * @param {Object} components - All calculation components
 * @returns {Object} Complete calculation result
 */
function assembleCalculationResult(components) {
  const {
    input,
    normalization,
    sig,
    quantity,
    ndcs,
    recommendations,
    alternatives,
    warnings
  } = components;

  // Determine overall status
  const hasErrors = warnings.some(w => w.severity === 'error');
  const hasWarnings = warnings.length > 0;
  const hasRecommendations = recommendations && recommendations.length > 0;

  let status = 'success';
  if (hasErrors) status = 'error';
  else if (hasWarnings && !hasRecommendations) status = 'partial';
  else if (hasWarnings) status = 'partial';

  return {
    id: generateCalculationId(),
    timestamp: new Date().toISOString(),
    status,
    inputs: input,
    normalization,
    calculation: quantity ? {
      parsedSIG: sig,
      calculatedQuantity: quantity.quantity,
      unit: quantity.unit,
      breakdown: quantity.calculation
    } : null,
    activeNDCs: ndcs?.active || [],
    inactiveNDCs: ndcs?.inactive || [],
    recommendation: recommendations?.[0] || null,
    alternatives: alternatives || [],
    warnings,
    success: !hasErrors
  };
}

/**
 * Create error result
 * @param {string} errorType - Type of error
 * @param {string} message - Error message
 * @param {Object} [context] - Additional context
 * @returns {Object} Error result
 */
function createErrorResult(errorType, message, context = {}) {
  return {
    id: generateCalculationId(),
    timestamp: new Date().toISOString(),
    status: 'error',
    error: {
      type: errorType,
      message,
      context
    },
    success: false,
    warnings: [{
      id: `error_${errorType}`,
      type: 'error',
      severity: 'error',
      message,
      data: context
    }]
  };
}

/**
 * Generate unique calculation ID
 * @returns {string} UUID-like calculation ID
 */
function generateCalculationId() {
  return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract dosage form from drug name
 * @param {string} drugName - Full drug name
 * @returns {string|null} Dosage form
 */
function extractDosageForm(drugName) {
  if (!drugName) return null;

  const lowerName = drugName.toLowerCase();

  if (lowerName.includes('tablet')) return 'tablet';
  if (lowerName.includes('capsule')) return 'capsule';
  if (lowerName.includes('solution')) return 'solution';
  if (lowerName.includes('suspension')) return 'suspension';
  if (lowerName.includes('injection')) return 'injection';
  if (lowerName.includes('cream')) return 'cream';
  if (lowerName.includes('ointment')) return 'ointment';

  return null;
}

/**
 * Extract strength from drug name
 * @param {string} drugName - Full drug name
 * @returns {string|null} Strength
 */
function extractStrength(drugName) {
  if (!drugName) return null;

  // Look for patterns like "10 mg", "5 mg/ml", etc.
  const strengthMatch = drugName.match(/(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|units?|iu)[^a-z]*)/i);
  return strengthMatch ? strengthMatch[1].trim() : null;
}
