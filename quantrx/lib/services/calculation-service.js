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

  console.log('[CALC-SERVICE] ===== RUN CALCULATION START =====');
  console.log('[CALC-SERVICE] Input:', JSON.stringify(input, null, 2));
  console.log('[CALC-SERVICE] Options:', JSON.stringify(options, null, 2));

  // Start performance tracking
  const endPerformanceTracking = trackCalculation('full_calculation', input);

  // Start calculation logging
  const requestId = logCalculationStart(input, userId);

  try {
    // Step 1: Normalize drug (if drug name provided)
    console.log('[CALC-SERVICE] Step 1: Normalizing drug...');
    console.log('[CALC-SERVICE] Input has drugName?', !!input.drugName);
    console.log('[CALC-SERVICE] Input has ndc?', !!input.ndc);
    
    const normalizationResult = await normalizeDrug(input, userId);
    console.log('[CALC-SERVICE] Normalization result:', JSON.stringify(normalizationResult, null, 2));
    
    if (!normalizationResult.success) {
      console.log('[CALC-SERVICE] Normalization failed, creating error result');
      const errorResult = createErrorResult(
        'normalization_failed',
        normalizationResult.error,
        { step: 'normalization', input }
      );
      console.log('[CALC-SERVICE] Error result created:', JSON.stringify(errorResult, null, 2));
      return errorResult;
    }
    
    console.log('[CALC-SERVICE] Normalization succeeded');

    // Step 2: Parse SIG (only if quantity not provided directly)
    let sigResult = { success: true, data: null, warnings: [] };
    let quantityResult = { success: true, data: null, warnings: [] };
    
    // Check if quantity is provided directly
    const hasDirectQuantity = input.quantity && input.quantity > 0;
    
    if (hasDirectQuantity) {
      console.log('[CALC-SERVICE] Using direct quantity:', input.quantity);
      console.log('[CALC-SERVICE] Direct quantity type:', typeof input.quantity);
      console.log('[CALC-SERVICE] Direct quantity value:', input.quantity);
      
      // Ensure quantity is a number
      const directQuantity = typeof input.quantity === 'string' 
        ? parseInt(input.quantity, 10) 
        : input.quantity;
      
      console.log('[CALC-SERVICE] Parsed direct quantity:', directQuantity);
      
      // Skip SIG parsing and quantity calculation
      quantityResult = {
        success: true,
        data: {
          quantity: directQuantity,
          unit: 'units', // Default unit, could be enhanced later
          calculation: `Direct quantity: ${directQuantity} units`
        },
        warnings: []
      };
      
      console.log('[CALC-SERVICE] Quantity result data:', JSON.stringify(quantityResult.data, null, 2));
    } else {
      // Step 2: Parse SIG
      console.log('[CALC-SERVICE] Step 2: Parsing SIG...');
      console.log('[CALC-SERVICE] SIG input:', input.sig);
      
      sigResult = await parseSIGStep(input.sig, userId);
      console.log('[CALC-SERVICE] SIG parsing result:', JSON.stringify(sigResult, null, 2));
      
      if (!sigResult.success) {
        console.log('[CALC-SERVICE] SIG parsing failed, creating error result');
        const errorResult = createErrorResult(
          'sig_parsing_failed',
          sigResult.error,
          { step: 'sig_parsing', input, normalization: normalizationResult.data }
        );
        console.log('[CALC-SERVICE] Error result created:', JSON.stringify(errorResult, null, 2));
        return errorResult;
      }
      
      console.log('[CALC-SERVICE] SIG parsing succeeded');

      // Step 3: Calculate quantity (if days supply provided)
      console.log('[CALC-SERVICE] Step 3: Calculating quantity...');
      console.log('[CALC-SERVICE] Days supply:', input.daysSupply);
      
      quantityResult = await calculateQuantityStep(
        sigResult.data,
        input.daysSupply,
        userId
      );
      console.log('[CALC-SERVICE] Quantity calculation result:', JSON.stringify(quantityResult, null, 2));
      
      if (!quantityResult.success) {
        console.log('[CALC-SERVICE] Quantity calculation failed, creating error result');
        const errorResult = createErrorResult(
          'quantity_calculation_failed',
          quantityResult.error,
          {
            step: 'quantity_calculation',
            input,
            normalization: normalizationResult.data,
            sig: sigResult.data
          }
        );
        console.log('[CALC-SERVICE] Error result created:', JSON.stringify(errorResult, null, 2));
        return errorResult;
      }
      
      console.log('[CALC-SERVICE] Quantity calculation succeeded');
    }

    // Step 4: Fetch NDCs
    console.log('[CALC-SERVICE] Step 4: Fetching NDCs...');
    const ndcIdentifier = normalizationResult.data?.rxcui || input.ndc;
    console.log('[CALC-SERVICE] NDC identifier:', ndcIdentifier);
    console.log('[CALC-SERVICE] Using rxcui?', !!normalizationResult.data?.rxcui);
    console.log('[CALC-SERVICE] Using ndc?', !!input.ndc);
    
    const ndcResult = await fetchNDCs(ndcIdentifier, userId);
    console.log('[CALC-SERVICE] NDC fetch result:', JSON.stringify(ndcResult, null, 2));
    
    if (!ndcResult.success) {
      console.log('[CALC-SERVICE] NDC fetch failed, creating error result');
      const errorResult = createErrorResult(
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
      console.log('[CALC-SERVICE] Error result created:', JSON.stringify(errorResult, null, 2));
      return errorResult;
    }
    
    console.log('[CALC-SERVICE] NDC fetch succeeded');
    console.log('[CALC-SERVICE] NDCs found:', ndcResult.data?.length || 0);

    // Step 5: Match optimal NDCs
    console.log('[CALC-SERVICE] Step 5: Matching optimal NDCs...');
    const quantity = quantityResult.data?.quantity || 0;
    console.log('[CALC-SERVICE] Quantity for matching:', quantity);
    
    const matchingResult = await matchNDCsStep(
      quantity,
      ndcResult.data,
      { maxAlternatives },
      userId
    );
    console.log('[CALC-SERVICE] Matching result:', JSON.stringify(matchingResult, null, 2));

    // Assemble final result
    console.log('[CALC-SERVICE] Assembling final result...');
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
    console.log('[CALC-SERVICE] Final result assembled:', JSON.stringify(finalResult, null, 2));
    console.log('[CALC-SERVICE] Final result status:', finalResult.status);
    console.log('[CALC-SERVICE] Final result success:', finalResult.success);

    // Log successful completion
    logCalculationCompleted(requestId, finalResult, 0, userId);

    // End performance tracking
    endPerformanceTracking(finalResult, null);

    console.log('[CALC-SERVICE] ===== RUN CALCULATION SUCCESS =====');
    return finalResult;

  } catch (error) {
    console.error('[CALC-SERVICE] ===== RUN CALCULATION ERROR =====');
    console.error('[CALC-SERVICE] Error type:', error.constructor.name);
    console.error('[CALC-SERVICE] Error message:', error.message);
    console.error('[CALC-SERVICE] Error stack:', error.stack);
    console.error('[CALC-SERVICE] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('[CALC-SERVICE] Input at error:', JSON.stringify(input, null, 2));
    
    // Log error
    logEvent('CALCULATION_ERROR', {
      requestId,
      error: error.message,
      stack: error.stack,
      input
    }, error);

    // End performance tracking with error
    endPerformanceTracking(null, error);

    const errorResult = createErrorResult(
      'unexpected_error',
      `Calculation failed: ${error.message}`,
      { requestId, input }
    );
    console.error('[CALC-SERVICE] Error result created:', JSON.stringify(errorResult, null, 2));
    console.error('[CALC-SERVICE] ===== RUN CALCULATION ERROR END =====');
    return errorResult;
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
  console.log('[CALC-SERVICE] assembleCalculationResult called');
  console.log('[CALC-SERVICE] Components:', JSON.stringify(components, null, 2));
  
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

  console.log('[CALC-SERVICE] hasErrors:', hasErrors);
  console.log('[CALC-SERVICE] hasWarnings:', hasWarnings);
  console.log('[CALC-SERVICE] hasRecommendations:', hasRecommendations);
  console.log('[CALC-SERVICE] warnings:', JSON.stringify(warnings, null, 2));

  let status = 'success';
  if (hasErrors) status = 'error';
  else if (hasWarnings && !hasRecommendations) status = 'partial';
  else if (hasWarnings) status = 'partial';

  console.log('[CALC-SERVICE] Calculated status:', status);

  const result = {
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
  
  console.log('[CALC-SERVICE] Assembled result:', JSON.stringify(result, null, 2));
  console.log('[CALC-SERVICE] Result status:', result.status);
  console.log('[CALC-SERVICE] Result success:', result.success);
  
  return result;
}

/**
 * Create error result
 * @param {string} errorType - Type of error
 * @param {string} message - Error message
 * @param {Object} [context] - Additional context
 * @returns {Object} Error result
 */
function createErrorResult(errorType, message, context = {}) {
  console.log('[CALC-SERVICE] createErrorResult called');
  console.log('[CALC-SERVICE] errorType:', errorType);
  console.log('[CALC-SERVICE] message:', message);
  console.log('[CALC-SERVICE] context:', JSON.stringify(context, null, 2));
  
  const errorResult = {
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
  
  console.log('[CALC-SERVICE] Error result created:', JSON.stringify(errorResult, null, 2));
  return errorResult;
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
