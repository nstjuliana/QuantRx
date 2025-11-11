/**
 * NDC matching algorithm
 *
 * This module provides algorithms to match calculated quantities to optimal
 * NDC (National Drug Code) packages, considering package sizes and tolerance
 * for overfill/underfill.
 *
 * @module lib/calculations/ndc-matching
 */

/**
 * Tolerance constants for overfill/underfill
 */
export const TOLERANCE = {
  MAX_OVERFILL_PERCENTAGE: 10,    // Allow up to 10% overfill
  MAX_UNDERFILL_PERCENTAGE: 5,    // Allow up to 5% underfill (more conservative)
  PREFERRED_OVERFILL_PERCENTAGE: 5, // Prefer solutions with ≤5% overfill
};

/**
 * Match optimal NDC package(s) to calculated quantity
 * @param {number} quantity - Calculated quantity to dispense
 * @param {Array} availableNDCs - Array of available NDC objects
 * @param {Object} [options] - Matching options
 * @param {number} [options.maxAlternatives] - Maximum number of alternatives to return (default: 5)
 * @param {boolean} [options.allowMultiplePackages] - Allow using multiple packages of same NDC (default: true)
 * @returns {Object} Matching result with primary recommendation and alternatives
 */
export function selectOptimalNDCs(quantity, availableNDCs, options = {}) {
  const {
    maxAlternatives = 5,
    allowMultiplePackages = true
  } = options;

  // Validate inputs
  if (typeof quantity !== 'number' || quantity <= 0) {
    return createMatchingResult([], [], 'Invalid quantity: must be a positive number');
  }

  if (!Array.isArray(availableNDCs) || availableNDCs.length === 0) {
    return createMatchingResult([], [], 'No NDCs available for matching');
  }

  try {
    // Filter out inactive NDCs
    const activeNDCs = availableNDCs.filter(ndc => ndc.status === 'active');

    if (activeNDCs.length === 0) {
      return createMatchingResult([], [], 'No active NDCs available');
    }

    // Generate all possible combinations
    const combinations = generateCombinations(quantity, activeNDCs, allowMultiplePackages);

    if (combinations.length === 0) {
      return createMatchingResult([], [], 'No suitable NDC combinations found');
    }

    // Score and rank combinations
    const scoredCombinations = scoreCombinations(quantity, combinations);

    // Sort by score (best first)
    scoredCombinations.sort((a, b) => a.score - b.score);

    // Extract primary recommendation and alternatives
    const primary = scoredCombinations[0];
    const alternatives = scoredCombinations.slice(1, maxAlternatives + 1);

    // Generate warnings for inactive NDCs
    const warnings = generateInactiveNDCWarnings(availableNDCs);

    return createMatchingResult(
      [primary],
      alternatives,
      null,
      warnings
    );

  } catch (error) {
    return createMatchingResult([], [], `Matching error: ${error.message}`);
  }
}

/**
 * Generate all possible NDC combinations for a quantity
 * @param {number} targetQuantity - Target quantity to achieve
 * @param {Array} ndcs - Available NDC objects
 * @param {boolean} allowMultiple - Allow multiple packages of same NDC
 * @returns {Array} Array of possible combinations
 */
function generateCombinations(targetQuantity, ndcs, allowMultiple) {
  const combinations = [];

  // Sort NDCs by package size (largest first) for greedy approach
  const sortedNDCs = [...ndcs].sort((a, b) => b.packageSize - a.packageSize);

  for (const ndc of sortedNDCs) {
    // Single package combinations
    const singlePackageCombos = generateSinglePackageCombinations(targetQuantity, ndc, allowMultiple);
    combinations.push(...singlePackageCombos);

    // Multi-package combinations (if allowed)
    if (allowMultiple) {
      const multiPackageCombos = generateMultiPackageCombinations(targetQuantity, [ndc], sortedNDCs);
      combinations.push(...multiPackageCombos);
    }
  }

  return combinations;
}

/**
 * Generate combinations using single NDC with multiple packages
 * @param {number} targetQuantity - Target quantity
 * @param {Object} ndc - NDC object
 * @param {boolean} allowMultiple - Allow multiple packages
 * @returns {Array} Combinations for this NDC
 */
function generateSinglePackageCombinations(targetQuantity, ndc, allowMultiple) {
  const combinations = [];
  const packageSize = ndc.packageSize;

  if (!allowMultiple) {
    // Only single package allowed
    const totalQuantity = packageSize;
    const overfill = ((totalQuantity - targetQuantity) / targetQuantity) * 100;

    if (Math.abs(overfill) <= TOLERANCE.MAX_OVERFILL_PERCENTAGE) {
      combinations.push({
        ndcs: [ndc],
        packages: [1],
        totalQuantity,
        overfill,
        breakdown: `1 × ${packageSize}-count package = ${totalQuantity} units`
      });
    }
    return combinations;
  }

  // Try different numbers of packages
  const maxPackages = Math.ceil(targetQuantity / packageSize) + 2; // Allow some overfill

  for (let numPackages = 1; numPackages <= maxPackages; numPackages++) {
    const totalQuantity = numPackages * packageSize;
    const overfill = ((totalQuantity - targetQuantity) / targetQuantity) * 100;

    // Accept if within tolerance
    if (overfill <= TOLERANCE.MAX_OVERFILL_PERCENTAGE) {
      combinations.push({
        ndcs: [ndc],
        packages: [numPackages],
        totalQuantity,
        overfill,
        breakdown: `${numPackages} × ${packageSize}-count ${ndc.dosageForm}(s) = ${totalQuantity} units`
      });
    }
  }

  return combinations;
}

/**
 * Generate combinations using multiple different NDCs
 * @param {number} targetQuantity - Target quantity
 * @param {Array} selectedNDCs - Already selected NDCs
 * @param {Array} availableNDCs - All available NDCs
 * @returns {Array} Multi-NDC combinations
 */
function generateMultiPackageCombinations(targetQuantity, selectedNDCs, availableNDCs) {
  const combinations = [];
  const remainingQuantity = targetQuantity - selectedNDCs.reduce((sum, ndc, index) => {
    return sum + (ndc.packageSize * 1); // Assume 1 package each for simplicity
  }, 0);

  if (remainingQuantity <= 0) {
    return combinations;
  }

  // Try adding one more NDC
  for (const ndc of availableNDCs) {
    if (selectedNDCs.includes(ndc)) continue; // Don't use same NDC twice in multi-NDC combo

    const packageSize = ndc.packageSize;

    // Only add if it helps get closer to target
    if (packageSize <= remainingQuantity * 1.5) { // Allow 50% overfill
      const newSelectedNDCs = [...selectedNDCs, ndc];
      const newTotalQuantity = newSelectedNDCs.reduce((sum, n) => sum + n.packageSize, 0);
      const overfill = ((newTotalQuantity - targetQuantity) / targetQuantity) * 100;

      if (overfill <= TOLERANCE.MAX_OVERFILL_PERCENTAGE) {
        combinations.push({
          ndcs: newSelectedNDCs,
          packages: new Array(newSelectedNDCs.length).fill(1),
          totalQuantity: newTotalQuantity,
          overfill,
          breakdown: newSelectedNDCs.map((n, i) =>
            `1 × ${n.packageSize}-count ${n.dosageForm}`
          ).join(' + ') + ` = ${newTotalQuantity} units`
        });
      }
    }
  }

  return combinations;
}

/**
 * Score combinations by preference
 * @param {number} targetQuantity - Target quantity
 * @param {Array} combinations - Array of combinations to score
 * @returns {Array} Scored combinations
 */
function scoreCombinations(targetQuantity, combinations) {
  return combinations.map(combo => {
    let score = 0;

    // Prefer exact matches (score = 0 is best)
    if (combo.overfill === 0) {
      score = 0;
    } else if (combo.overfill > 0) {
      // Slight overfill is preferred over underfill
      score = combo.overfill;
    } else {
      // Underfill (negative overfill) - penalize more
      score = Math.abs(combo.overfill) * 2;
    }

    // Prefer fewer packages
    const totalPackages = combo.packages.reduce((sum, p) => sum + p, 0);
    score += totalPackages * 0.1; // Small penalty for each additional package

    // Prefer fewer different NDCs
    const uniqueNDCs = combo.ndcs.length;
    score += uniqueNDCs * 0.05; // Small penalty for each additional NDC type

    // Prefer larger package sizes (less waste)
    const avgPackageSize = combo.totalQuantity / totalPackages;
    score -= avgPackageSize * 0.001; // Small bonus for larger packages

    return {
      ...combo,
      score: Math.round(score * 100) / 100, // Round to 2 decimal places
      matchQuality: getMatchQuality(combo.overfill)
    };
  });
}

/**
 * Get match quality description
 * @param {number} overfill - Overfill percentage
 * @returns {string} Quality description
 */
function getMatchQuality(overfill) {
  const absOverfill = Math.abs(overfill);

  if (absOverfill === 0) return 'exact';
  if (overfill > 0) {
    if (absOverfill <= TOLERANCE.PREFERRED_OVERFILL_PERCENTAGE) return 'slight_overfill';
    if (absOverfill <= TOLERANCE.MAX_OVERFILL_PERCENTAGE) return 'moderate_overfill';
    return 'excessive_overfill';
  } else {
    if (absOverfill <= TOLERANCE.MAX_UNDERFILL_PERCENTAGE) return 'slight_underfill';
    return 'significant_underfill';
  }
}

/**
 * Generate warnings for inactive NDCs
 * @param {Array} allNDCs - All NDCs (active and inactive)
 * @returns {Array} Warning objects
 */
function generateInactiveNDCWarnings(allNDCs) {
  const warnings = [];
  const inactiveNDCs = allNDCs.filter(ndc => ndc.status === 'inactive');

  for (const ndc of inactiveNDCs) {
    warnings.push({
      id: `inactive_ndc_${ndc.ndc}`,
      type: 'inactive_ndc',
      severity: 'warning',
      message: `NDC ${ndc.ndc} (${ndc.manufacturer}) is inactive and should not be used`,
      data: {
        ndc: ndc.ndc,
        manufacturer: ndc.manufacturer,
        discontinuedDate: ndc.marketingEndDate
      }
    });
  }

  return warnings;
}

/**
 * Create a standardized matching result object
 * @param {Array} recommendations - Primary recommendations
 * @param {Array} alternatives - Alternative options
 * @param {string|null} error - Error message if matching failed
 * @param {Array} [warnings] - Warning objects
 * @returns {Object} Matching result
 */
function createMatchingResult(recommendations, alternatives, error, warnings = []) {
  return {
    recommendations,
    alternatives,
    error,
    warnings,
    success: !error && recommendations.length > 0
  };
}

/**
 * Find best single NDC match (simplified version for basic use)
 * @param {number} quantity - Target quantity
 * @param {Array} ndcs - Available NDCs
 * @returns {Object|null} Best match or null
 */
export function findBestSingleNDC(quantity, ndcs) {
  if (!Array.isArray(ndcs) || ndcs.length === 0) {
    return null;
  }

  const activeNDCs = ndcs.filter(ndc => ndc.status === 'active');

  let bestMatch = null;
  let bestOverfill = Infinity;

  for (const ndc of activeNDCs) {
    const packageSize = ndc.packageSize;

    // Calculate how many packages needed
    const packagesNeeded = Math.ceil(quantity / packageSize);
    const totalQuantity = packagesNeeded * packageSize;
    const overfill = ((totalQuantity - quantity) / quantity) * 100;

    // Accept if within tolerance and better than current best
    if (overfill <= TOLERANCE.MAX_OVERFILL_PERCENTAGE && overfill < bestOverfill) {
      bestMatch = {
        ndc,
        packages: packagesNeeded,
        totalQuantity,
        overfill,
        breakdown: `${packagesNeeded} × ${packageSize}-count package(s) = ${totalQuantity} units`
      };
      bestOverfill = overfill;
    }
  }

  return bestMatch;
}

/**
 * Calculate overfill/underfill percentage
 * @param {number} actualQuantity - Actual quantity provided
 * @param {number} targetQuantity - Target quantity needed
 * @returns {number} Overfill percentage (positive) or underfill percentage (negative)
 */
export function calculateOverfillPercentage(actualQuantity, targetQuantity) {
  if (targetQuantity === 0) return 0;
  return ((actualQuantity - targetQuantity) / targetQuantity) * 100;
}

/**
 * Check if overfill is within acceptable tolerance
 * @param {number} overfillPercentage - Overfill percentage
 * @returns {boolean} True if within tolerance
 */
export function isWithinTolerance(overfillPercentage) {
  return overfillPercentage >= -TOLERANCE.MAX_UNDERFILL_PERCENTAGE &&
         overfillPercentage <= TOLERANCE.MAX_OVERFILL_PERCENTAGE;
}

/**
 * Get tolerance thresholds for display
 * @returns {Object} Tolerance configuration
 */
export function getToleranceConfig() {
  return {
    maxOverfill: TOLERANCE.MAX_OVERFILL_PERCENTAGE,
    maxUnderfill: TOLERANCE.MAX_UNDERFILL_PERCENTAGE,
    preferredOverfill: TOLERANCE.PREFERRED_OVERFILL_PERCENTAGE
  };
}
