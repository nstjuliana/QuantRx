/**
 * FDA NDC Directory API client
 *
 * This module provides functions to interact with the FDA NDC Directory API
 * for retrieving NDC information. Supports both live API calls and mock mode
 * for development.
 *
 * @module lib/api/fda
 */

import {
  getMockFDASearchResponse,
  getMockNDCsByDrugName,
  getMockNDCByCode,
  isMockNDCActive,
  simulateApiDelay,
  simulateApiError
} from '../mocks/fda-fixtures.js';
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
 * Get the FDA API base URL
 * @returns {string} API base URL
 */
function getApiBaseUrl() {
  return process.env.FDA_API_BASE_URL || 'https://api.fda.gov/drug/ndc.json';
}

/**
 * Get NDCs for a drug by name
 * @param {string} drugName - Drug name to search for
 * @param {Object} [options] - Search options
 * @param {number} [options.limit] - Maximum number of results
 * @param {boolean} [options.includeInactive] - Include inactive NDCs
 * @param {string} [options.userId] - User ID for logging
 * @returns {Promise<Object>} NDC data with active/inactive separation
 */
export async function getNDCsByDrugName(drugName, options = {}) {
  const {
    limit = 50,
    includeInactive = false,
    userId = null
  } = options;

  // Start performance tracking
  const endPerformanceTracking = trackApiCall('fda-search', {
    drugName,
    includeInactive,
    userId
  });

  // Log API call start
  logApiCallStart(`${getApiBaseUrl()}?search=brand_name:${encodeURIComponent(drugName)}&limit=${limit}`, {
    method: 'GET'
  }, userId);

  try {
    let response;

    if (isMockMode()) {
      // Use mock data
      await simulateApiDelay();
      response = getMockFDASearchResponse(drugName);
    } else {
      // Real API call
      const searchQuery = `brand_name:"${drugName}"`;
      const url = `${getApiBaseUrl()}?search=${encodeURIComponent(searchQuery)}&limit=${limit}`;

      const apiResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'QuantRx/1.0'
        }
      });

      if (!apiResponse.ok) {
        throw new Error(`FDA API error: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      response = await apiResponse.json();
    }

    // Process and categorize NDCs
    const result = processFDAResponse(response, { includeInactive });

    // Log successful API call
    logApiCallCompleted(`${getApiBaseUrl()}`, 0, 200, userId);

    // Log audit event
    await logApiCall('fda', 'ndc.json', {
      search: `brand_name:${drugName}`,
      limit,
      includeInactive
    }, userId);

    // End performance tracking
    endPerformanceTracking({
      success: true,
      resultCount: result.active.length + result.inactive.length
    });

    return result;

  } catch (error) {
    // Log API error
    logApiCallError(`${getApiBaseUrl()}`, 0, error, userId);

    // End performance tracking with error
    endPerformanceTracking({ success: false, error: error.message });

    throw error;
  }
}

/**
 * Get NDCs by RxCUI (RxNorm Concept Unique Identifier)
 * @param {string} rxcui - RxNorm Concept Unique Identifier
 * @param {Object} [options] - Options
 * @param {boolean} [options.includeInactive] - Include inactive NDCs
 * @param {string} [options.userId] - User ID for logging
 * @returns {Promise<Object>} NDC data with active/inactive separation
 */
export async function getNDCsByRxCUI(rxcui, options = {}) {
  const { includeInactive = false, userId = null } = options;

  // Start performance tracking
  const endPerformanceTracking = trackApiCall('fda-rxcui', {
    rxcui,
    includeInactive,
    userId
  });

  // Log API call start
  logApiCallStart(`${getApiBaseUrl()}?search=rxcui:"${rxcui}"`, {
    method: 'GET'
  }, userId);

  try {
    let response;

    if (isMockMode()) {
      // Use mock data - simulate search by RxCUI
      await simulateApiDelay();
      // For mock mode, we'll use drug name search as proxy
      response = {
        meta: {
          disclaimer: 'Mock data for development',
          results: { skip: 0, limit: 50, total: 1 }
        },
        results: [] // Will be populated by processFDAResponse based on RxCUI
      };
    } else {
      // Real API call
      const searchQuery = `rxcui:"${rxcui}"`;
      const url = `${getApiBaseUrl()}?search=${encodeURIComponent(searchQuery)}&limit=100`;

      const apiResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'QuantRx/1.0'
        }
      });

      if (!apiResponse.ok) {
        throw new Error(`FDA API error: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      response = await apiResponse.json();
    }

    // Process and categorize NDCs
    const result = processFDAResponse(response, { includeInactive, rxcui });

    // Log successful API call
    logApiCallCompleted(`${getApiBaseUrl()}`, 0, 200, userId);

    // Log audit event
    await logApiCall('fda', 'ndc.json', {
      search: `rxcui:${rxcui}`,
      includeInactive
    }, userId);

    // End performance tracking
    endPerformanceTracking({
      success: true,
      resultCount: result.active.length + result.inactive.length
    });

    return result;

  } catch (error) {
    // Log API error
    logApiCallError(`${getApiBaseUrl()}`, 0, error, userId);

    // End performance tracking with error
    endPerformanceTracking({ success: false, error: error.message });

    throw error;
  }
}

/**
 * Validate an NDC and get its details
 * @param {string} ndc - National Drug Code to validate
 * @param {Object} [options] - Options
 * @param {string} [options.userId] - User ID for logging
 * @returns {Promise<Object>} NDC validation result
 */
export async function validateNDC(ndc, options = {}) {
  const { userId = null } = options;

  // Start performance tracking
  const endPerformanceTracking = trackApiCall('fda-validate', {
    ndc,
    userId
  });

  // Log API call start
  logApiCallStart(`${getApiBaseUrl()}?search=product_ndc:"${ndc}"`, {
    method: 'GET'
  }, userId);

  try {
    let response;

    if (isMockMode()) {
      // Use mock data
      await simulateApiDelay();
      const mockNDC = getMockNDCByCode(ndc);
      if (mockNDC) {
        response = {
          meta: {
            disclaimer: 'Mock data for development',
            results: { skip: 0, limit: 1, total: 1 }
          },
          results: [{
            product_ndc: mockNDC.ndc,
            generic_name: mockNDC.dosageForm === 'capsule' ? 'AMOXICILLIN' : 'LISINOPRIL',
            brand_name: '',
            dosage_form: mockNDC.dosageForm.toUpperCase(),
            route: ['ORAL'],
            strength: [`${mockNDC.strength}`],
            package_description: [`${mockNDC.packageSize} ${mockNDC.dosageForm.toUpperCase()} in 1 BOTTLE`],
            marketing_start_date: mockNDC.marketingStartDate || '20200101',
            marketing_end_date: mockNDC.marketingEndDate || null,
            product_type: 'HUMAN PRESCRIPTION DRUG',
            labeler_name: mockNDC.manufacturer,
            finished: true
          }]
        };
      } else {
        response = {
          meta: {
            disclaimer: 'Mock data for development',
            results: { skip: 0, limit: 1, total: 0 }
          },
          results: []
        };
      }
    } else {
      // Real API call
      const searchQuery = `product_ndc:"${ndc}"`;
      const url = `${getApiBaseUrl()}?search=${encodeURIComponent(searchQuery)}&limit=1`;

      const apiResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'QuantRx/1.0'
        }
      });

      if (!apiResponse.ok) {
        throw new Error(`FDA API error: ${apiResponse.status} ${apiResponse.statusText}`);
      }

      response = await apiResponse.json();
    }

    // Process validation result
    const result = {
      ndc,
      isValid: response.results && response.results.length > 0,
      isActive: false,
      record: null
    };

    if (result.isValid) {
      const processedRecord = processFDARecord(response.results[0]);
      result.isActive = processedRecord.status === 'active';
      result.record = processedRecord;
    }

    // Log successful API call
    logApiCallCompleted(`${getApiBaseUrl()}`, 0, 200, userId);

    // Log audit event
    await logApiCall('fda', 'ndc.json', {
      search: `product_ndc:${ndc}`,
      validation: true
    }, userId);

    // End performance tracking
    endPerformanceTracking({
      success: true,
      isValid: result.isValid,
      isActive: result.isActive
    });

    return result;

  } catch (error) {
    // Log API error
    logApiCallError(`${getApiBaseUrl()}`, 0, error, userId);

    // End performance tracking with error
    endPerformanceTracking({ success: false, error: error.message });

    throw error;
  }
}

/**
 * Get detailed NDC information
 * @param {string} ndc - National Drug Code
 * @param {Object} [options] - Options
 * @param {string} [options.userId] - User ID for logging
 * @returns {Promise<Object|null>} Detailed NDC information
 */
export async function getNDCDetails(ndc, options = {}) {
  const { userId = null } = options;

  const validationResult = await validateNDC(ndc, { userId });

  return validationResult.isValid ? validationResult.record : null;
}

/**
 * Process FDA API response and categorize NDCs
 * @param {Object} response - FDA API response
 * @param {Object} options - Processing options
 * @returns {Object} Processed NDC data
 */
function processFDAResponse(response, options = {}) {
  const { includeInactive = false, rxcui = null } = options;

  let rawResults = response.results || [];

  // If we have RxCUI filtering in mock mode
  if (isMockMode() && rxcui) {
    // Simulate RxCUI-based filtering - get all NDCs and filter by RxCUI
    const allMockNDCs = [
      ...getMockNDCsByDrugName('lisinopril'),
      ...getMockNDCsByDrugName('amoxicillin')
    ];
    rawResults = allMockNDCs
      .filter(ndc => ndc.rxcui === rxcui)
      .map(ndc => ({
        product_ndc: ndc.ndc,
        generic_name: ndc.dosageForm === 'capsule' ? 'AMOXICILLIN' : 'LISINOPRIL',
        brand_name: '',
        dosage_form: ndc.dosageForm.toUpperCase(),
        route: ['ORAL'],
        strength: [ndc.strength],
        package_description: [`${ndc.packageSize} ${ndc.dosageForm.toUpperCase()} in 1 BOTTLE`],
        marketing_start_date: ndc.marketingStartDate || '20200101',
        marketing_end_date: ndc.marketingEndDate || null,
        product_type: 'HUMAN PRESCRIPTION DRUG',
        labeler_name: ndc.manufacturer,
        finished: true
      }));
  }

  const active = [];
  const inactive = [];

  for (const record of rawResults) {
    const processedRecord = processFDARecord(record);

    if (processedRecord.status === 'active') {
      active.push(processedRecord);
    } else if (includeInactive) {
      inactive.push(processedRecord);
    }
  }

  return {
    active,
    inactive,
    total: active.length + inactive.length,
    meta: response.meta || {}
  };
}

/**
 * Process individual FDA record into our internal format
 * @param {Object} record - FDA API record
 * @returns {Object} Processed NDC record
 */
function processFDARecord(record) {
  // Extract package size from description
  const packageSize = extractPackageSize(record.package_description?.[0] || '');
  const strength = record.strength?.[0] || '';
  const dosageForm = record.dosage_form?.toLowerCase() || '';

  // Determine status based on marketing_end_date
  const marketingEndDate = record.marketing_end_date;
  const isActive = !marketingEndDate || marketingEndDate === 'null' || marketingEndDate === '';

  return {
    ndc: record.product_ndc,
    manufacturer: record.labeler_name || '',
    packageSize,
    dosageForm,
    strength,
    status: isActive ? 'active' : 'inactive',
    marketingStartDate: record.marketing_start_date || null,
    marketingEndDate: marketingEndDate || null,
    rxcui: null, // Would need additional API call to get RxCUI
    cost: null
  };
}

/**
 * Extract package size from FDA package description
 * @param {string} description - Package description
 * @returns {number} Package size
 */
function extractPackageSize(description) {
  if (!description) return 1;

  // Look for patterns like "30 TABLET in 1 BOTTLE" or "20 CAPSULE in 1 BOTTLE"
  const match = description.match(/^(\d+)\s+/);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Validate NDC format
 * @param {string} ndc - NDC to validate
 * @returns {boolean} True if valid format
 */
export function validateNDCFormat(ndc) {
  if (!ndc || typeof ndc !== 'string') {
    return false;
  }

  // Remove hyphens for validation
  const cleanNDC = ndc.replace(/-/g, '');

  // Must be exactly 11 digits
  return /^\d{11}$/.test(cleanNDC);
}
