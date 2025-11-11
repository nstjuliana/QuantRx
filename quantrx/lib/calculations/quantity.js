/**
 * Quantity calculation utilities
 *
 * This module provides functions to calculate total dispense quantities
 * based on parsed SIG information and days supply.
 *
 * @module lib/calculations/quantity
 */

import { isCountBasedUnit, isVolumeBasedUnit } from '../constants/dosage.js';

/**
 * Calculate total quantity to dispense based on SIG and days supply
 * @param {Object} parsedSIG - Parsed SIG object from sig-parsing.js
 * @param {number} daysSupply - Number of days the prescription should last
 * @returns {Object} Calculation result with quantity, unit, and metadata
 */
export function calculateQuantity(parsedSIG, daysSupply) {
  // Validate inputs
  const validation = validateCalculationInputs(parsedSIG, daysSupply);
  if (!validation.isValid) {
    return createCalculationResult(null, null, false, validation.error);
  }

  try {
    const { dose, frequency, unit } = parsedSIG;

    // Handle special cases
    if (frequency === null) {
      // "As needed" prescriptions - cannot calculate exact quantity
      return createCalculationResult(
        null,
        unit,
        false,
        'Cannot calculate quantity for "as needed" prescriptions. Please specify frequency or enter quantity manually.'
      );
    }

    if (frequency === 0) {
      return createCalculationResult(
        null,
        unit,
        false,
        'Invalid frequency: cannot be zero'
      );
    }

    // Core calculation: dose × frequency × days supply
    const totalQuantity = dose * frequency * daysSupply;

    // Round to appropriate precision based on unit type
    const roundedQuantity = roundQuantity(totalQuantity, unit);

    return createCalculationResult(roundedQuantity, unit, true, null, {
      dose,
      frequency,
      daysSupply,
      calculation: `${dose} × ${frequency} × ${daysSupply} = ${roundedQuantity}`
    });

  } catch (error) {
    return createCalculationResult(
      null,
      parsedSIG.unit,
      false,
      `Calculation error: ${error.message}`
    );
  }
}

/**
 * Validate inputs for quantity calculation
 * @param {Object} parsedSIG - Parsed SIG object
 * @param {number} daysSupply - Days supply
 * @returns {Object} Validation result
 */
function validateCalculationInputs(parsedSIG, daysSupply) {
  if (!parsedSIG) {
    return { isValid: false, error: 'Parsed SIG is required' };
  }

  if (!parsedSIG.parseSuccess) {
    return { isValid: false, error: parsedSIG.parseError || 'SIG parsing failed' };
  }

  if (typeof parsedSIG.dose !== 'number' || parsedSIG.dose <= 0) {
    return { isValid: false, error: 'Valid dose is required for calculation' };
  }

  if (parsedSIG.frequency !== null && (typeof parsedSIG.frequency !== 'number' || parsedSIG.frequency < 0)) {
    return { isValid: false, error: 'Valid frequency is required for calculation' };
  }

  if (!parsedSIG.unit) {
    return { isValid: false, error: 'Unit is required for calculation' };
  }

  if (typeof daysSupply !== 'number' || daysSupply <= 0) {
    return { isValid: false, error: 'Days supply must be a positive number' };
  }

  if (daysSupply > 365) {
    return { isValid: false, error: 'Days supply cannot exceed 365 days' };
  }

  return { isValid: true };
}

/**
 * Round quantity to appropriate precision based on unit type
 * @param {number} quantity - Raw calculated quantity
 * @param {string} unit - Unit of measurement
 * @returns {number} Rounded quantity
 */
function roundQuantity(quantity, unit) {
  // For count-based units (tablets, capsules), round up to next whole number
  if (isCountBasedUnit(unit)) {
    return Math.ceil(quantity);
  }

  // For volume/weight units, round to appropriate decimal places
  if (isVolumeBasedUnit(unit)) {
    // For very small quantities, keep more precision
    if (quantity < 1) {
      return Math.round(quantity * 100) / 100; // 2 decimal places
    }
    // For larger quantities, round to 1 decimal place
    if (quantity < 10) {
      return Math.round(quantity * 10) / 10;
    }
    // For large quantities, round to whole numbers
    return Math.round(quantity);
  }

  // For other units (special units like insulin), round up
  return Math.ceil(quantity);
}

/**
 * Create a standardized calculation result object
 * @param {number|null} quantity - Calculated quantity
 * @param {string|null} unit - Unit of measurement
 * @param {boolean} success - Whether calculation succeeded
 * @param {string|null} error - Error message if calculation failed
 * @param {Object} [metadata] - Additional calculation metadata
 * @returns {Object} Calculation result object
 */
function createCalculationResult(quantity, unit, success, error, metadata = {}) {
  return {
    quantity,
    unit,
    success,
    error,
    ...metadata
  };
}

/**
 * Calculate quantity with manual override option
 * @param {Object} parsedSIG - Parsed SIG object
 * @param {number} daysSupply - Days supply
 * @param {Object} [overrides] - Manual overrides for dose, frequency, or unit
 * @returns {Object} Calculation result
 */
export function calculateQuantityWithOverrides(parsedSIG, daysSupply, overrides = {}) {
  // Start with parsed SIG values
  let { dose, frequency, unit } = parsedSIG;

  // Apply overrides
  if (overrides.dose !== undefined) {
    dose = overrides.dose;
  }
  if (overrides.frequency !== undefined) {
    frequency = overrides.frequency;
  }
  if (overrides.unit !== undefined) {
    unit = overrides.unit;
  }

  // Create modified SIG object
  const modifiedSIG = {
    ...parsedSIG,
    dose,
    frequency,
    unit
  };

  // Calculate with modified values
  const result = calculateQuantity(modifiedSIG, daysSupply);

  // Add override information to result
  if (Object.keys(overrides).length > 0) {
    result.overrides = overrides;
    result.overrideApplied = true;
  }

  return result;
}

/**
 * Estimate days supply from quantity and SIG
 * @param {number} quantity - Available quantity
 * @param {Object} parsedSIG - Parsed SIG object
 * @returns {Object} Days supply estimation result
 */
export function estimateDaysSupply(quantity, parsedSIG) {
  const validation = validateCalculationInputs(parsedSIG, 1); // Use dummy days supply for validation
  if (!validation.isValid) {
    return createCalculationResult(null, null, false, validation.error);
  }

  try {
    const { dose, frequency, unit } = parsedSIG;

    if (frequency === null || frequency === 0) {
      return createCalculationResult(
        null,
        null,
        false,
        'Cannot estimate days supply for "as needed" prescriptions'
      );
    }

    // Reverse calculation: quantity / (dose × frequency)
    const estimatedDays = quantity / (dose * frequency);

    if (estimatedDays <= 0) {
      return createCalculationResult(
        null,
        null,
        false,
        'Invalid quantity for estimation'
      );
    }

    // Round to 1 decimal place for readability
    const roundedDays = Math.round(estimatedDays * 10) / 10;

    return createCalculationResult(roundedDays, 'days', true, null, {
      quantity,
      dose,
      frequency,
      unit,
      calculation: `${quantity} ÷ (${dose} × ${frequency}) = ${roundedDays}`
    });

  } catch (error) {
    return createCalculationResult(
      null,
      null,
      false,
      `Estimation error: ${error.message}`
    );
  }
}

/**
 * Check if calculated quantity is reasonable
 * @param {number} quantity - Calculated quantity
 * @param {string} unit - Unit of measurement
 * @param {number} daysSupply - Days supply
 * @returns {Object} Reasonableness check result
 */
export function checkQuantityReasonableness(quantity, unit, daysSupply) {
  const issues = [];

  // Basic bounds checking based on unit type
  if (isCountBasedUnit(unit)) {
    // For tablets/capsules, check for extremely high quantities
    const maxReasonablePerDay = 20; // Very high threshold
    const maxQuantity = maxReasonablePerDay * daysSupply;

    if (quantity > maxQuantity) {
      issues.push({
        type: 'excessive_quantity',
        severity: 'warning',
        message: `Calculated quantity (${quantity}) seems unusually high for ${daysSupply} days`
      });
    }

    // Check for very small quantities that might indicate calculation errors
    if (quantity < 1) {
      issues.push({
        type: 'very_small_quantity',
        severity: 'warning',
        message: 'Calculated quantity is less than 1 unit'
      });
    }
  }

  if (isVolumeBasedUnit(unit)) {
    // For liquids, check for reasonable volumes
    const maxReasonablePerDay = 1000; // 1000ml per day threshold
    const maxQuantity = maxReasonablePerDay * daysSupply;

    if (quantity > maxQuantity) {
      issues.push({
        type: 'excessive_volume',
        severity: 'warning',
        message: `Calculated volume (${quantity} ${unit}) seems unusually high for ${daysSupply} days`
      });
    }
  }

  return {
    isReasonable: issues.length === 0,
    issues
  };
}

/**
 * Format quantity for display
 * @param {number} quantity - Quantity to format
 * @param {string} unit - Unit of measurement
 * @returns {string} Formatted quantity string
 */
export function formatQuantity(quantity, unit) {
  if (typeof quantity !== 'number' || isNaN(quantity)) {
    return 'Invalid quantity';
  }

  // Format number with appropriate precision
  let formattedNumber;
  if (isCountBasedUnit(unit)) {
    formattedNumber = Math.round(quantity).toString();
  } else if (isVolumeBasedUnit(unit)) {
    if (quantity < 1) {
      formattedNumber = quantity.toFixed(2);
    } else if (quantity < 10) {
      formattedNumber = quantity.toFixed(1);
    } else {
      formattedNumber = Math.round(quantity).toString();
    }
  } else {
    formattedNumber = quantity.toString();
  }

  return `${formattedNumber} ${unit}${quantity === 1 ? '' : 's'}`;
}
