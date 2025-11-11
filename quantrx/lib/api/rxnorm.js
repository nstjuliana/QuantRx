/**
 * RxNorm API client
 *
 * This module provides functions to interact with the RxNorm API for drug normalization.
 * It supports both live API calls and mock mode for development.
 *
 * @module lib/api/rxnorm
 */

import {
  getMockDrugByName,
  getMockSearchResponse,
  getMockNDCResponse,
  simulateApiDelay,
  simulateApiError
} from '../mocks/rxnorm-fixtures.js';
import { logApiCallStart, logApiCallCompleted, logApiCallError } from '../utils/logger.js';
import { logApiCall } from '../utils/audit.js';
import { trackApiCall } from '../utils/performance.js';

/**
 * Check if mock mode is enabled
 * @returns {boolean} True if using mock APIs
 */
function isMockMode() {
  return process.env.USE_MOCK_APIS === 'true';
}

/**
 * Get the RxNorm API base URL
 * @returns {string} API base URL
 */
function getApiBaseUrl() {
  return process.env.RXNORM_API_BASE_URL || 'https://rxnav.nlm.nih.gov/REST';
}

/**
 * Search for drugs by name using RxNorm API
 * @param {string} drugName - Drug name to search for
 * @param {Object} [options] - Search options
 * @param {number} [options.limit] - Maximum number of results
 * @param {string} [options.userId] - User ID for logging
 * @returns {Promise<Object>} Normalized drug data with RxCUI
 */
export async function searchDrugByName(drugName, options = {}) {
  const { limit = 10, userId = null } = options;

  // Start performance tracking
  const endPerformanceTracking = trackApiCall('rxnorm-search', {
    drugName,
    userId
  });

  // Log API call start
  const requestId = logApiCallStart(`${getApiBaseUrl()}/drugs.json?name=${encodeURIComponent(drugName)}`, {
    method: 'GET'
  }, userId);

  try {
    let result;

    if (isMockMode()) {
      // Use mock data
      await simulateApiDelay();
      result = getMockSearchResponse(drugName);
    } else {
      // Real API call
      const url = `${getApiBaseUrl()}/drugs.json?name=${encodeURIComponent(drugName)}&limit=${limit}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'QuantRx/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`RxNorm API error: ${response.status} ${response.statusText}`);
      }

      result = await response.json();
    }

    // Log successful API call
    logApiCallCompleted(`${getApiBaseUrl()}/drugs.json`, 0, 200, userId);

    // Extract the first/best result
    const drugData = extractDrugFromResponse(result);

    // Log audit event
    await logApiCall('rxnorm', 'drugs.json', {
      name: drugName,
      limit
    }, userId);

    // End performance tracking
    endPerformanceTracking({ success: true, resultCount: drugData ? 1 : 0 });

    return drugData;

  } catch (error) {
    // Log API error
    logApiCallError(`${getApiBaseUrl()}/drugs.json`, 0, error, userId);

    // End performance tracking with error
    endPerformanceTracking({ success: false, error: error.message });

    throw error;
  }
}

/**
 * Get RxCUI for a drug name
 * @param {string} drugName - Drug name
 * @param {Object} [options] - Options
 * @param {string} [options.userId] - User ID for logging
 * @returns {Promise<string|null>} RxCUI or null if not found
 */
export async function getRxCUI(drugName, options = {}) {
  const { userId = null } = options;

  try {
    const drugData = await searchDrugByName(drugName, { userId });
    return drugData?.rxcui || null;
  } catch (error) {
    console.error('Failed to get RxCUI:', error);
    return null;
  }
}

/**
 * Get drug information by RxCUI
 * @param {string} rxcui - RxNorm Concept Unique Identifier
 * @param {Object} [options] - Options
 * @param {string} [options.userId] - User ID for logging
 * @returns {Promise<Object|null>} Drug information
 */
export async function getDrugByRxCUI(rxcui, options = {}) {
  const { userId = null } = options;

  // Start performance tracking
  const endPerformanceTracking = trackApiCall('rxnorm-rxcui', {
    rxcui,
    userId
  });

  // Log API call start
  logApiCallStart(`${getApiBaseUrl()}/rxcui/${rxcui}.json`, {
    method: 'GET'
  }, userId);

  try {
    let result;

    if (isMockMode()) {
      // Use mock data
      await simulateApiDelay();
      result = getMockNDCResponse(rxcui);
    } else {
      // Real API call
      const url = `${getApiBaseUrl()}/rxcui/${rxcui}.json`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'QuantRx/1.0'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // RxCUI not found
          logApiCallCompleted(`${getApiBaseUrl()}/rxcui/${rxcui}.json`, 0, 404, userId);
          endPerformanceTracking({ success: true, found: false });
          return null;
        }
        throw new Error(`RxNorm API error: ${response.status} ${response.statusText}`);
      }

      result = await response.json();
    }

    // Log successful API call
    logApiCallCompleted(`${getApiBaseUrl()}/rxcui/${rxcui}.json`, 0, 200, userId);

    // Extract drug data
    const drugData = extractDrugFromRxCUIResponse(result);

    // Log audit event
    await logApiCall('rxnorm', `rxcui/${rxcui}.json`, {
      rxcui
    }, userId);

    // End performance tracking
    endPerformanceTracking({ success: true, found: !!drugData });

    return drugData;

  } catch (error) {
    // Log API error
    logApiCallError(`${getApiBaseUrl()}/rxcui/${rxcui}.json`, 0, error, userId);

    // End performance tracking with error
    endPerformanceTracking({ success: false, error: error.message });

    throw error;
  }
}

/**
 * Extract drug data from RxNorm search response
 * @param {Object} response - RxNorm API response
 * @returns {Object|null} Normalized drug data
 */
function extractDrugFromResponse(response) {
  try {
    const conceptGroups = response?.drugGroup?.conceptGroup || [];

    // Find the first SCD (Semantic Clinical Drug) group
    const scdGroup = conceptGroups.find(group =>
      group.tty === 'SCD' && group.conceptProperties?.length > 0
    );

    if (!scdGroup) {
      return null;
    }

    const drug = scdGroup.conceptProperties[0];

    return {
      rxcui: drug.rxcui,
      name: drug.name,
      synonym: drug.synonym || '',
      tty: drug.tty,
      language: drug.language,
      suppress: drug.suppress,
      umlscui: drug.umlscui
    };
  } catch (error) {
    console.error('Failed to extract drug from RxNorm response:', error);
    return null;
  }
}

/**
 * Extract drug data from RxNorm RxCUI response
 * @param {Object} response - RxNorm API response
 * @returns {Object|null} Normalized drug data
 */
function extractDrugFromRxCUIResponse(response) {
  try {
    const conceptGroups = response?.ndcGroup?.conceptGroup || [];

    // Find the first relevant group
    const drugGroup = conceptGroups.find(group =>
      group.conceptProperties?.length > 0
    );

    if (!drugGroup) {
      return null;
    }

    const drug = drugGroup.conceptProperties[0];

    return {
      rxcui: drug.rxcui,
      name: drug.name,
      synonym: drug.synonym || '',
      tty: drug.tty
    };
  } catch (error) {
    console.error('Failed to extract drug from RxCUI response:', error);
    return null;
  }
}

/**
 * Validate if a drug name is likely to be found in RxNorm
 * @param {string} drugName - Drug name to validate
 * @returns {boolean} True if drug name looks valid
 */
export function validateDrugName(drugName) {
  if (!drugName || typeof drugName !== 'string') {
    return false;
  }

  const trimmed = drugName.trim();

  // Must have at least 2 characters
  if (trimmed.length < 2) {
    return false;
  }

  // Must have at least one letter
  if (!/[a-zA-Z]/.test(trimmed)) {
    return false;
  }

  // Should not be just numbers or special characters
  if (/^[^a-zA-Z]*$/.test(trimmed)) {
    return false;
  }

  return true;
}
