/**
 * RxNorm API mock data fixtures
 *
 * This file contains sample responses from the RxNorm API for development
 * and testing purposes. The data matches the real RxNorm API response format.
 *
 * @module lib/mocks/rxnorm-fixtures
 */

/**
 * Mock RxNorm drug data
 * Each entry represents a drug that can be searched by name
 */
export const RXNORM_DRUG_FIXTURES = {
  // Common drugs with various search scenarios
  'lisinopril': {
    rxcui: '29046',
    name: 'lisinopril',
    synonym: 'Prinivil',
    tty: 'SCD', // Semantic Clinical Drug
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0065374'
  },

  'lisinopril 10 mg': {
    rxcui: '197884',
    name: 'lisinopril 10 MG Oral Tablet',
    synonym: 'Prinivil 10 MG Oral Tablet',
    tty: 'SCD',
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0970277'
  },

  'amoxicillin': {
    rxcui: '723',
    name: 'amoxicillin',
    synonym: 'Amoxil',
    tty: 'SCD',
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0002644'
  },

  'amoxicillin 500 mg': {
    rxcui: '308189',
    name: 'amoxicillin 500 MG Oral Capsule',
    synonym: 'Amoxil 500 MG Oral Capsule',
    tty: 'SCD',
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0970365'
  },

  'acetaminophen': {
    rxcui: '161',
    name: 'acetaminophen',
    synonym: 'Tylenol',
    tty: 'SCD',
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0000970'
  },

  'tylenol': {
    rxcui: '161',
    name: 'acetaminophen',
    synonym: 'Tylenol',
    tty: 'SCD',
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0000970'
  },

  'metformin': {
    rxcui: '6809',
    name: 'metformin',
    synonym: 'Glucophage',
    tty: 'SCD',
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0025598'
  },

  'atorvastatin': {
    rxcui: '83367',
    name: 'atorvastatin',
    synonym: 'Lipitor',
    tty: 'SCD',
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0286651'
  },

  'omeprazole': {
    rxcui: '7646',
    name: 'omeprazole',
    synonym: 'Prilosec',
    tty: 'SCD',
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0132569'
  },

  'simvastatin': {
    rxcui: '36567',
    name: 'simvastatin',
    synonym: 'Zocor',
    tty: 'SCD',
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0074554'
  },

  'ozempic': {
    rxcui: '198045',
    name: 'semaglutide',
    synonym: 'Ozempic',
    tty: 'SCD',
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0000000'
  },

  'semaglutide': {
    rxcui: '198045',
    name: 'semaglutide',
    synonym: 'Ozempic',
    tty: 'SCD',
    language: 'ENG',
    suppress: 'N',
    umlscui: 'C0000000'
  }
};

/**
 * Mock RxNorm search responses
 * These simulate the actual API response format
 */
export const RXNORM_SEARCH_RESPONSES = {
  // Successful search for "lisinopril"
  'lisinopril': {
    drugGroup: {
      conceptGroup: [
        {
          tty: 'SCD',
          conceptProperties: [
            RXNORM_DRUG_FIXTURES['lisinopril']
          ]
        }
      ]
    }
  },

  // Successful search for "lisinopril 10 mg"
  'lisinopril 10 mg': {
    drugGroup: {
      conceptGroup: [
        {
          tty: 'SCD',
          conceptProperties: [
            RXNORM_DRUG_FIXTURES['lisinopril 10 mg']
          ]
        }
      ]
    }
  },

  // Successful search for brand name "tylenol"
  'tylenol': {
    drugGroup: {
      conceptGroup: [
        {
          tty: 'SCD',
          conceptProperties: [
            RXNORM_DRUG_FIXTURES['tylenol']
          ]
        }
      ]
    }
  },

  // Multiple results for generic name search
  'amoxicillin': {
    drugGroup: {
      conceptGroup: [
        {
          tty: 'SCD',
          conceptProperties: [
            RXNORM_DRUG_FIXTURES['amoxicillin']
          ]
        }
      ]
    }
  },

  // No results found
  'nonexistentdrug123': {
    drugGroup: {
      conceptGroup: []
    }
  },

  // Empty search
  '': {
    drugGroup: {
      conceptGroup: []
    }
  },

  // Ozempic search
  'ozempic': {
    drugGroup: {
      conceptGroup: [
        {
          tty: 'SCD',
          conceptProperties: [
            RXNORM_DRUG_FIXTURES['ozempic']
          ]
        }
      ]
    }
  },

  // Semaglutide search (generic name for Ozempic)
  'semaglutide': {
    drugGroup: {
      conceptGroup: [
        {
          tty: 'SCD',
          conceptProperties: [
            RXNORM_DRUG_FIXTURES['semaglutide']
          ]
        }
      ]
    }
  }
};

/**
 * Mock RxNorm NDC retrieval responses
 * These simulate responses when getting NDCs for a specific RxCUI
 */
export const RXNORM_NDC_RESPONSES = {
  // Lisinopril RxCUI
  '29046': {
    ndcGroup: {
      conceptGroup: [
        {
          tty: 'SCD',
          conceptProperties: [
            {
              rxcui: '29046',
              name: 'lisinopril',
              synonym: ''
            }
          ]
        }
      ]
    }
  },

  // Amoxicillin RxCUI
  '723': {
    ndcGroup: {
      conceptGroup: [
        {
          tty: 'SCD',
          conceptProperties: [
            {
              rxcui: '723',
              name: 'amoxicillin',
              synonym: ''
            }
          ]
        }
      ]
    }
  },

  // Invalid RxCUI
  '999999': {
    ndcGroup: {
      conceptGroup: []
    }
  }
};

/**
 * Helper function to get mock drug data by name
 * @param {string} drugName - Drug name to search for
 * @returns {Object|null} Mock drug data or null if not found
 */
export function getMockDrugByName(drugName) {
  if (!drugName || drugName.trim() === '') {
    return null;
  }

  const normalizedName = drugName.toLowerCase().trim();

  // Direct match
  if (RXNORM_DRUG_FIXTURES[normalizedName]) {
    return RXNORM_DRUG_FIXTURES[normalizedName];
  }

  // Partial match (for fuzzy searching simulation)
  for (const [key, drug] of Object.entries(RXNORM_DRUG_FIXTURES)) {
    if (key.includes(normalizedName) || normalizedName.includes(key)) {
      return drug;
    }
  }

  return null;
}

/**
 * Helper function to get mock search response
 * @param {string} searchTerm - Search term
 * @returns {Object} Mock API response
 */
export function getMockSearchResponse(searchTerm) {
  const normalizedTerm = searchTerm?.toLowerCase().trim() || '';

  // Check for exact matches first
  if (RXNORM_SEARCH_RESPONSES[normalizedTerm]) {
    return RXNORM_SEARCH_RESPONSES[normalizedTerm];
  }

  // Check for partial matches
  for (const [key, response] of Object.entries(RXNORM_SEARCH_RESPONSES)) {
    if (key.includes(normalizedTerm) || normalizedTerm.includes(key)) {
      return response;
    }
  }

  // Return no results for unknown terms
  return RXNORM_SEARCH_RESPONSES['nonexistentdrug123'];
}

/**
 * Helper function to get mock NDC response for RxCUI
 * @param {string} rxcui - RxNorm Concept Unique Identifier
 * @returns {Object} Mock API response
 */
export function getMockNDCResponse(rxcui) {
  return RXNORM_NDC_RESPONSES[rxcui] || RXNORM_NDC_RESPONSES['999999'];
}

/**
 * Simulate API delay for realistic testing
 * @param {number} minDelay - Minimum delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {Promise} Promise that resolves after random delay
 */
export function simulateApiDelay(minDelay = 100, maxDelay = 500) {
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
    network: new Error('Network request failed'),
    timeout: new Error('Request timeout'),
    rateLimit: new Error('Rate limit exceeded'),
    server: new Error('Internal server error')
  };

  return errors[errorType] || errors.network;
}
