/**
 * SIG (prescription directions) parsing utility
 *
 * This module provides regex-based parsing of prescription directions (SIG text)
 * to extract dose, frequency, and unit information. Designed to be extensible
 * for AI-powered parsing in Phase 2.
 *
 * @module lib/calculations/sig-parsing
 */

import {
  normalizeUnit,
  normalizeDosageForm,
  parseFrequency,
  FREQUENCY_PATTERNS,
  UNIT_ABBREVIATIONS,
  DOSAGE_ABBREVIATIONS
} from '../constants/dosage.js';

/**
 * Parse SIG text to extract dose, frequency, and unit information
 * @param {string} sigText - Prescription directions text
 * @returns {Object} Parsed SIG object with dose, frequency, unit, and metadata
 */
export function parseSIG(sigText) {
  if (!sigText || typeof sigText !== 'string') {
    return createParseResult(null, null, null, false, 'Invalid input: SIG text must be a non-empty string');
  }

  const trimmedText = sigText.trim();

  if (trimmedText.length === 0) {
    return createParseResult(null, null, null, false, 'Empty SIG text');
  }

  try {
    // Try different parsing strategies in order of specificity
    const strategies = [
      parseStructuredSIG,    // "Take 1 tablet twice daily"
      parseAbbreviatedSIG,   // "1 tab PO BID"
      parseSimpleSIG,        // "1 tablet daily"
      parseComplexSIG        // Fallback for complex patterns
    ];

    for (const strategy of strategies) {
      const result = strategy(trimmedText);
      if (result.parseSuccess) {
        return result;
      }
    }

    // If no strategy succeeded, return failure result
    return createParseResult(null, null, null, false, 'Unable to parse SIG text', trimmedText);

  } catch (error) {
    return createParseResult(null, null, null, false, `Parse error: ${error.message}`, trimmedText);
  }
}

/**
 * Parse structured SIG text like "Take 1 tablet twice daily"
 * @param {string} text - SIG text to parse
 * @returns {Object} Parse result
 */
function parseStructuredSIG(text) {
  // Pattern: "Take X unit(s) Y" where Y is frequency
  const pattern = /^take\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)$/i;

  const match = text.match(pattern);
  if (!match) {
    return createParseResult(null, null, null, false, 'No structured pattern match');
  }

  const [, doseStr, unitStr, frequencyStr] = match;
  const dose = parseFloat(doseStr);
  const unit = normalizeUnit(unitStr) || unitStr.toLowerCase();
  const frequency = parseFrequencyText(frequencyStr.trim());

  if (!frequency) {
    return createParseResult(dose, null, unit, false, 'Unable to parse frequency from structured text');
  }

  return createParseResult(dose, frequency, unit, true, null, text);
}

/**
 * Parse abbreviated SIG text like "1 tab PO BID"
 * @param {string} text - SIG text to parse
 * @returns {Object} Parse result
 */
function parseAbbreviatedSIG(text) {
  // Split by spaces and look for patterns
  const parts = text.toLowerCase().split(/\s+/);

  if (parts.length < 3) {
    return createParseResult(null, null, null, false, 'Abbreviated text too short');
  }

  // Look for dose (first numeric part)
  let dose = null;
  let doseIndex = -1;

  for (let i = 0; i < parts.length; i++) {
    const num = parseFloat(parts[i]);
    if (!isNaN(num) && num > 0) {
      dose = num;
      doseIndex = i;
      break;
    }
  }

  if (dose === null) {
    return createParseResult(null, null, null, false, 'No dose found in abbreviated text');
  }

  // Look for unit after dose
  let unit = null;
  if (doseIndex + 1 < parts.length) {
    const potentialUnit = parts[doseIndex + 1];
    unit = normalizeUnit(potentialUnit) || potentialUnit;

    // Skip route indicators like "po", "oral"
    if (unit === 'po' || unit === 'oral' || unit === 'im' || unit === 'iv') {
      if (doseIndex + 2 < parts.length) {
        unit = normalizeUnit(parts[doseIndex + 2]) || parts[doseIndex + 2];
      }
    }
  }

  // Look for frequency (usually at the end)
  const remainingParts = parts.slice(doseIndex + (unit ? 2 : 1));
  const frequencyStr = remainingParts.join(' ');
  const frequency = parseFrequencyText(frequencyStr);

  if (!frequency) {
    return createParseResult(dose, null, unit, false, 'Unable to parse frequency from abbreviated text');
  }

  return createParseResult(dose, frequency, unit, true, null, text);
}

/**
 * Parse simple SIG text like "1 tablet daily"
 * @param {string} text - SIG text to parse
 * @returns {Object} Parse result
 */
function parseSimpleSIG(text) {
  // Pattern: "X unit Y" where Y is frequency
  const pattern = /^(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)$/i;

  const match = text.match(pattern);
  if (!match) {
    return createParseResult(null, null, null, false, 'No simple pattern match');
  }

  const [, doseStr, unitStr, frequencyStr] = match;
  const dose = parseFloat(doseStr);
  const unit = normalizeUnit(unitStr) || unitStr.toLowerCase();
  const frequency = parseFrequencyText(frequencyStr.trim());

  if (!frequency) {
    return createParseResult(dose, null, unit, false, 'Unable to parse frequency from simple text');
  }

  return createParseResult(dose, frequency, unit, true, null, text);
}

/**
 * Parse complex SIG text (fallback for patterns that don't match above)
 * @param {string} text - SIG text to parse
 * @returns {Object} Parse result
 */
function parseComplexSIG(text) {
  // Try to extract numbers and frequency words
  const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (!numberMatch) {
    return createParseResult(null, null, null, false, 'No numbers found in complex text');
  }

  const dose = parseFloat(numberMatch[1]);

  // Look for frequency indicators
  const frequency = parseFrequencyText(text);

  // Try to infer unit from common words
  let unit = null;
  const lowerText = text.toLowerCase();

  // Check for tablet/capsule indicators
  if (lowerText.includes('tablet') || lowerText.includes('tab')) {
    unit = 'tablet';
  } else if (lowerText.includes('capsule') || lowerText.includes('cap')) {
    unit = 'capsule';
  } else if (lowerText.includes('ml') || lowerText.includes('milliliter')) {
    unit = 'ml';
  } else if (lowerText.includes('mg') || lowerText.includes('milligram')) {
    unit = 'mg';
  }

  if (!frequency || !unit) {
    return createParseResult(dose, frequency, unit, false, 'Incomplete parsing in complex text');
  }

  return createParseResult(dose, frequency, unit, true, null, text);
}

/**
 * Parse frequency text to extract times per day
 * @param {string} frequencyText - Text describing frequency
 * @returns {number|null} Frequency (times per day) or null if unparseable
 */
function parseFrequencyText(frequencyText) {
  if (!frequencyText) return null;

  const lowerText = frequencyText.toLowerCase().trim();

  // Direct lookup in frequency patterns
  if (FREQUENCY_PATTERNS[lowerText]) {
    return FREQUENCY_PATTERNS[lowerText];
  }

  // Try partial matches
  for (const [pattern, freq] of Object.entries(FREQUENCY_PATTERNS)) {
    if (lowerText.includes(pattern) || pattern.includes(lowerText)) {
      return freq;
    }
  }

  // Special handling for "as needed" patterns
  if (lowerText.includes('as needed') || lowerText.includes('prn') ||
      lowerText.includes('as required')) {
    return null; // Special case - frequency cannot be determined
  }

  // Try to extract numbers followed by time indicators
  const timePatterns = [
    { regex: /(\d+)\s+times?\s+(?:a|per)\s+day/i, factor: 1 },
    { regex: /(\d+)\s+times?\s+ daily/i, factor: 1 },
    { regex: /(\d+)\s+times?\s+(?:a|per)\s+week/i, factor: 1/7 },
    { regex: /(\d+)\s+times?\s+weekly/i, factor: 1/7 },
    { regex: /every\s+(\d+)\s+hours?/i, factor: 24 },
    { regex: /q(\d+)h/i, factor: 24 } // q4h = every 4 hours
  ];

  for (const { regex, factor } of timePatterns) {
    const match = frequencyText.match(regex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (regex.source.includes('hours')) {
        return factor / num; // every 4 hours = 24/4 = 6 times per day
      } else {
        return num * factor; // X times per day/week
      }
    }
  }

  return null;
}

/**
 * Create a standardized parse result object
 * @param {number|null} dose - Parsed dose
 * @param {number|null} frequency - Parsed frequency (times per day)
 * @param {string|null} unit - Parsed unit
 * @param {boolean} parseSuccess - Whether parsing succeeded
 * @param {string|null} parseError - Error message if parsing failed
 * @param {string} [originalText] - Original SIG text
 * @returns {Object} Standardized parse result
 */
function createParseResult(dose, frequency, unit, parseSuccess, parseError, originalText = null) {
  return {
    dose,
    frequency,
    unit,
    originalText,
    parseSuccess,
    parseError
  };
}

/**
 * Validate a parsed SIG object
 * @param {Object} parsedSIG - Parsed SIG object
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export function validateParsedSIG(parsedSIG) {
  const errors = [];

  if (!parsedSIG) {
    return { isValid: false, errors: ['Parsed SIG is null or undefined'] };
  }

  if (typeof parsedSIG.dose !== 'number' || parsedSIG.dose <= 0) {
    errors.push('Dose must be a positive number');
  }

  if (parsedSIG.frequency !== null && (typeof parsedSIG.frequency !== 'number' || parsedSIG.frequency <= 0)) {
    errors.push('Frequency must be a positive number or null');
  }

  if (!parsedSIG.unit || typeof parsedSIG.unit !== 'string') {
    errors.push('Unit must be a non-empty string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get parsing confidence score (for future AI integration)
 * @param {Object} parsedSIG - Parsed SIG object
 * @returns {number} Confidence score 0-1
 */
export function getParsingConfidence(parsedSIG) {
  if (!parsedSIG || !parsedSIG.parseSuccess) {
    return 0;
  }

  let confidence = 0.5; // Base confidence for successful regex parsing

  // Higher confidence for structured parsing
  if (parsedSIG.originalText && parsedSIG.originalText.toLowerCase().includes('take')) {
    confidence += 0.2;
  }

  // Higher confidence for standard units
  if (parsedSIG.unit && normalizeUnit(parsedSIG.unit)) {
    confidence += 0.1;
  }

  // Higher confidence for standard frequencies
  if (parsedSIG.frequency && Object.values(FREQUENCY_PATTERNS).includes(parsedSIG.frequency)) {
    confidence += 0.1;
  }

  // Cap at 0.9 for regex parsing (leave room for AI confidence)
  return Math.min(confidence, 0.9);
}

/**
 * Extension point for Phase 2 AI integration
 * This function can be replaced with AI-powered parsing
 * @param {string} sigText - SIG text to parse
 * @returns {Promise<Object>} Parse result (currently falls back to regex)
 */
export async function parseSIGWithAI(sigText) {
  // TODO: Phase 2 - Integrate with OpenAI or similar for complex SIG parsing
  // For now, fall back to regex parsing
  return parseSIG(sigText);
}

/**
 * Get examples of supported SIG formats
 * @returns {Array<string>} Array of example SIG texts
 */
export function getSIGExamples() {
  return [
    'Take 1 tablet twice daily',
    'Take 2 tablets every 6 hours',
    '1 tablet daily',
    '2 capsules three times daily',
    'Take 0.5 ml every 8 hours',
    '1 tab PO BID',
    '2 caps TID',
    'Take 1 tablet every morning',
    'Take 2 tablets twice weekly'
  ];
}
