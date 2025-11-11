/**
 * FDA NDC Directory API mock data fixtures
 *
 * This file contains sample responses from the FDA NDC Directory API for development
 * and testing purposes. The data matches the real FDA API response format.
 *
 * @module lib/mocks/fda-fixtures
 */

/**
 * Mock FDA NDC data
 * Each entry represents an NDC with its associated drug information
 */
export const FDA_NDC_FIXTURES = {
  // Lisinopril NDCs (various manufacturers and package sizes)
  '0009-0054': {
    product_ndc: '0009-0054',
    generic_name: 'LISINOPRIL',
    brand_name: 'PRINIVIL',
    dosage_form: 'TABLET',
    route: ['ORAL'],
    strength: ['10 mg/1'],
    package_description: ['30 TABLET in 1 BOTTLE (0009-0054-30)'],
    marketing_start_date: '19880101',
    marketing_end_date: null, // Active
    product_type: 'HUMAN PRESCRIPTION DRUG',
    brand_name_base: 'PRINIVIL',
    labeler_name: 'Merck Sharp & Dohme Corp.',
    finished: true,
    packaging: [
      {
        package_ndc: '0009-0054-30',
        description: '30 TABLET in 1 BOTTLE',
        marketing_start_date: '19880101',
        marketing_end_date: null,
        sample: false
      },
      {
        package_ndc: '0009-0054-90',
        description: '90 TABLET in 1 BOTTLE',
        marketing_start_date: '19880101',
        marketing_end_date: null,
        sample: false
      }
    ]
  },

  '00143-9835': {
    product_ndc: '00143-9835',
    generic_name: 'LISINOPRIL',
    brand_name: '',
    dosage_form: 'TABLET',
    route: ['ORAL'],
    strength: ['10 mg/1'],
    package_description: ['100 TABLET in 1 BOTTLE (00143-9835-01)'],
    marketing_start_date: '20100101',
    marketing_end_date: null, // Active
    product_type: 'HUMAN PRESCRIPTION DRUG',
    brand_name_base: null,
    labeler_name: 'West-Ward Pharmaceuticals Corp.',
    finished: true,
    packaging: [
      {
        package_ndc: '00143-9835-01',
        description: '100 TABLET in 1 BOTTLE',
        marketing_start_date: '20100101',
        marketing_end_date: null,
        sample: false
      }
    ]
  },

  '0071-0525': {
    product_ndc: '0071-0525',
    generic_name: 'LISINOPRIL',
    brand_name: '',
    dosage_form: 'TABLET',
    route: ['ORAL'],
    strength: ['10 mg/1'],
    package_description: ['30 TABLET in 1 BOTTLE (0071-0525-23)'],
    marketing_start_date: '19880101',
    marketing_end_date: '20231231', // Inactive (discontinued)
    product_type: 'HUMAN PRESCRIPTION DRUG',
    brand_name_base: null,
    labeler_name: 'Parke-Davis Div of Pfizer Inc',
    finished: true,
    packaging: [
      {
        package_ndc: '0071-0525-23',
        description: '30 TABLET in 1 BOTTLE',
        marketing_start_date: '19880101',
        marketing_end_date: '20231231',
        sample: false
      }
    ]
  },

  // Amoxicillin NDCs
  '65862-001': {
    product_ndc: '65862-001',
    generic_name: 'AMOXICILLIN',
    brand_name: '',
    dosage_form: 'CAPSULE',
    route: ['ORAL'],
    strength: ['500 mg/1'],
    package_description: ['20 CAPSULE in 1 BOTTLE (65862-001-20)'],
    marketing_start_date: '20150101',
    marketing_end_date: null, // Active
    product_type: 'HUMAN PRESCRIPTION DRUG',
    brand_name_base: null,
    labeler_name: 'Aurobindo Pharma Limited',
    finished: true,
    packaging: [
      {
        package_ndc: '65862-001-20',
        description: '20 CAPSULE in 1 BOTTLE',
        marketing_start_date: '20150101',
        marketing_end_date: null,
        sample: false
      },
      {
        package_ndc: '65862-001-05',
        description: '50 CAPSULE in 1 BOTTLE',
        marketing_start_date: '20150101',
        marketing_end_date: null,
        sample: false
      }
    ]
  },

  '65862-002': {
    product_ndc: '65862-002',
    generic_name: 'AMOXICILLIN',
    brand_name: '',
    dosage_form: 'CAPSULE',
    route: ['ORAL'],
    strength: ['250 mg/1'],
    package_description: ['30 CAPSULE in 1 BOTTLE (65862-002-30)'],
    marketing_start_date: '20150101',
    marketing_end_date: null, // Active
    product_type: 'HUMAN PRESCRIPTION DRUG',
    brand_name_base: null,
    labeler_name: 'Aurobindo Pharma Limited',
    finished: true,
    packaging: [
      {
        package_ndc: '65862-002-30',
        description: '30 CAPSULE in 1 BOTTLE',
        marketing_start_date: '20150101',
        marketing_end_date: null,
        sample: false
      }
    ]
  }
};

/**
 * Mock FDA API search responses
 * These simulate the actual FDA API response format
 */
export const FDA_SEARCH_RESPONSES = {
  // Lisinopril search results
  'lisinopril': {
    meta: {
      disclaimer: 'Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated.',
      terms: 'https://open.fda.gov/terms/',
      license: 'https://open.fda.gov/license/',
      last_updated: '2024-01-01',
      results: {
        skip: 0,
        limit: 10,
        total: 3
      }
    },
    results: [
      FDA_NDC_FIXTURES['0009-0054'],
      FDA_NDC_FIXTURES['00143-9835'],
      FDA_NDC_FIXTURES['0071-0525'] // This one is inactive
    ]
  },

  // Amoxicillin search results
  'amoxicillin': {
    meta: {
      disclaimer: 'Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated.',
      terms: 'https://open.fda.gov/terms/',
      license: 'https://open.fda.gov/license/',
      last_updated: '2024-01-01',
      results: {
        skip: 0,
        limit: 10,
        total: 2
      }
    },
    results: [
      FDA_NDC_FIXTURES['65862-001'],
      FDA_NDC_FIXTURES['65862-002']
    ]
  },

  // No results found
  'nonexistentdrug123': {
    meta: {
      disclaimer: 'Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated.',
      terms: 'https://open.fda.gov/terms/',
      license: 'https://open.fda.gov/license/',
      last_updated: '2024-01-01',
      results: {
        skip: 0,
        limit: 10,
        total: 0
      }
    },
    results: []
  },

  // Empty search
  '': {
    meta: {
      disclaimer: 'Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated.',
      terms: 'https://open.fda.gov/terms/',
      license: 'https://open.fda.gov/license/',
      last_updated: '2024-01-01',
      results: {
        skip: 0,
        limit: 10,
        total: 0
      }
    },
    results: []
  }
};

/**
 * Processed NDC records (our internal format)
 * These represent the data after processing FDA API responses
 */
export const PROCESSED_NDC_RECORDS = {
  // Lisinopril 10mg - Merck (active)
  '0009-0054-30': {
    ndc: '0009-0054-30',
    manufacturer: 'Merck Sharp & Dohme Corp.',
    packageSize: 30,
    dosageForm: 'tablet',
    strength: '10 mg',
    status: 'active',
    marketingStartDate: '1988-01-01',
    marketingEndDate: null,
    rxcui: '29046',
    cost: null
  },

  '0009-0054-90': {
    ndc: '0009-0054-90',
    manufacturer: 'Merck Sharp & Dohme Corp.',
    packageSize: 90,
    dosageForm: 'tablet',
    strength: '10 mg',
    status: 'active',
    marketingStartDate: '1988-01-01',
    marketingEndDate: null,
    rxcui: '29046',
    cost: null
  },

  // Lisinopril 10mg - West-Ward (active)
  '00143-9835-01': {
    ndc: '00143-9835-01',
    manufacturer: 'West-Ward Pharmaceuticals Corp.',
    packageSize: 100,
    dosageForm: 'tablet',
    strength: '10 mg',
    status: 'active',
    marketingStartDate: '2010-01-01',
    marketingEndDate: null,
    rxcui: '29046',
    cost: null
  },

  // Lisinopril 10mg - Pfizer (inactive)
  '0071-0525-23': {
    ndc: '0071-0525-23',
    manufacturer: 'Parke-Davis Div of Pfizer Inc',
    packageSize: 30,
    dosageForm: 'tablet',
    strength: '10 mg',
    status: 'inactive',
    marketingStartDate: '1988-01-01',
    marketingEndDate: '2023-12-31',
    rxcui: '29046',
    cost: null
  },

  // Amoxicillin 500mg - Aurobindo (active)
  '65862-001-20': {
    ndc: '65862-001-20',
    manufacturer: 'Aurobindo Pharma Limited',
    packageSize: 20,
    dosageForm: 'capsule',
    strength: '500 mg',
    status: 'active',
    marketingStartDate: '2015-01-01',
    marketingEndDate: null,
    rxcui: '723',
    cost: null
  },

  '65862-001-05': {
    ndc: '65862-001-05',
    manufacturer: 'Aurobindo Pharma Limited',
    packageSize: 50,
    dosageForm: 'capsule',
    strength: '500 mg',
    status: 'active',
    marketingStartDate: '2015-01-01',
    marketingEndDate: null,
    rxcui: '723',
    cost: null
  },

  // Amoxicillin 250mg - Aurobindo (active)
  '65862-002-30': {
    ndc: '65862-002-30',
    manufacturer: 'Aurobindo Pharma Limited',
    packageSize: 30,
    dosageForm: 'capsule',
    strength: '250 mg',
    status: 'active',
    marketingStartDate: '2015-01-01',
    marketingEndDate: null,
    rxcui: '723',
    cost: null
  }
};

/**
 * Helper function to get mock FDA search response
 * @param {string} searchTerm - Drug name to search for
 * @returns {Object} Mock FDA API response
 */
export function getMockFDASearchResponse(searchTerm) {
  const normalizedTerm = searchTerm?.toLowerCase().trim() || '';

  // Check for exact matches first
  if (FDA_SEARCH_RESPONSES[normalizedTerm]) {
    return FDA_SEARCH_RESPONSES[normalizedTerm];
  }

  // Check for partial matches
  for (const [key, response] of Object.entries(FDA_SEARCH_RESPONSES)) {
    if (key.includes(normalizedTerm) || normalizedTerm.includes(key)) {
      return response;
    }
  }

  // Return no results for unknown terms
  return FDA_SEARCH_RESPONSES['nonexistentdrug123'];
}

/**
 * Helper function to get processed NDC records by drug name
 * @param {string} drugName - Drug name
 * @returns {Array} Array of processed NDC records
 */
export function getMockNDCsByDrugName(drugName) {
  const normalizedName = drugName?.toLowerCase().trim() || '';

  if (normalizedName.includes('lisinopril')) {
    return [
      PROCESSED_NDC_RECORDS['0009-0054-30'],
      PROCESSED_NDC_RECORDS['0009-0054-90'],
      PROCESSED_NDC_RECORDS['00143-9835-01'],
      PROCESSED_NDC_RECORDS['0071-0525-23'] // Include inactive for testing
    ];
  }

  if (normalizedName.includes('amoxicillin')) {
    return [
      PROCESSED_NDC_RECORDS['65862-001-20'],
      PROCESSED_NDC_RECORDS['65862-001-05'],
      PROCESSED_NDC_RECORDS['65862-002-30']
    ];
  }

  return [];
}

/**
 * Helper function to get a specific NDC record
 * @param {string} ndc - NDC to retrieve
 * @returns {Object|null} NDC record or null if not found
 */
export function getMockNDCByCode(ndc) {
  return PROCESSED_NDC_RECORDS[ndc] || null;
}

/**
 * Helper function to check if an NDC is active
 * @param {string} ndc - NDC to check
 * @returns {boolean} True if NDC is active
 */
export function isMockNDCActive(ndc) {
  const record = getMockNDCByCode(ndc);
  return record?.status === 'active';
}

/**
 * Simulate API delay for realistic testing
 * @param {number} minDelay - Minimum delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {Promise} Promise that resolves after random delay
 */
export function simulateApiDelay(minDelay = 200, maxDelay = 800) {
  const delay = Math.random() * (maxDelay - minDelay) + minDelay;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Simulate API error for testing error handling
 * @param {string} errorType - Type of error to simulate
 * @returns {Error} Simulated error
 */
export function simulateApiError(errorType = 'network') {
  const errors = {
    network: new Error('Failed to fetch from FDA API'),
    timeout: new Error('Request timeout'),
    rateLimit: new Error('Rate limit exceeded'),
    server: new Error('FDA API server error'),
    parsing: new Error('Failed to parse FDA API response')
  };

  return errors[errorType] || errors.network;
}
