/**
 * TanStack Query key factories
 *
 * Provides consistent, hierarchical query keys for caching and invalidation.
 * Following TanStack Query best practices for key structure.
 *
 * @module lib/queries/keys
 */

/**
 * RxNorm API query keys
 */
export const RXNORM_QUERY_KEYS = {
  /**
   * All RxNorm-related queries
   */
  all: ['rxnorm'],

  /**
   * Drug search queries
   * @param {string} drugName - Drug name being searched
   * @returns {Array} Query key array
   */
  search: (drugName) => ['rxnorm', 'search', drugName?.toLowerCase().trim()],

  /**
   * Drug information by RxCUI
   * @param {string} rxcui - RxNorm Concept Unique Identifier
   * @returns {Array} Query key array
   */
  drug: (rxcui) => ['rxnorm', 'drug', rxcui],

  /**
   * Drug name validation
   * @param {string} drugName - Drug name to validate
   * @returns {Array} Query key array
   */
  validation: (drugName) => ['rxnorm', 'validation', drugName?.toLowerCase().trim()]
};

/**
 * FDA NDC Directory API query keys
 */
export const FDA_QUERY_KEYS = {
  /**
   * All FDA-related queries
   */
  all: ['fda'],

  /**
   * NDC search by drug name
   * @param {string} drugName - Drug name
   * @returns {Array} Query key array
   */
  searchByName: (drugName) => ['fda', 'search', 'name', drugName?.toLowerCase().trim()],

  /**
   * NDC search by RxCUI
   * @param {string} rxcui - RxNorm Concept Unique Identifier
   * @returns {Array} Query key array
   */
  searchByRxCUI: (rxcui) => ['fda', 'search', 'rxcui', rxcui],

  /**
   * Individual NDC lookup
   * @param {string} ndc - National Drug Code
   * @returns {Array} Query key array
   */
  ndc: (ndc) => ['fda', 'ndc', ndc],

  /**
   * NDC validation
   * @param {string} ndc - National Drug Code
   * @returns {Array} Query key array
   */
  validation: (ndc) => ['fda', 'validation', ndc],

  /**
   * Active NDCs for a drug
   * @param {string} drugName - Drug name
   * @returns {Array} Query key array
   */
  active: (drugName) => ['fda', 'active', drugName?.toLowerCase().trim()]
};

/**
 * Calculation query keys
 */
export const CALCULATION_QUERY_KEYS = {
  /**
   * All calculation-related queries
   */
  all: ['calculations'],

  /**
   * List of calculations
   * @param {Object} filters - Filter parameters
   * @returns {Array} Query key array
   */
  list: (filters = {}) => ['calculations', 'list', filters],

  /**
   * Individual calculation
   * @param {string} id - Calculation ID
   * @returns {Array} Query key array
   */
  detail: (id) => ['calculations', 'detail', id],

  /**
   * User's calculations
   * @param {string} userId - User ID
   * @param {Object} filters - Filter parameters
   * @returns {Array} Query key array
   */
  user: (userId, filters = {}) => ['calculations', 'user', userId, filters],

  /**
   * Recent calculations for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of recent calculations
   * @returns {Array} Query key array
   */
  recent: (userId, limit = 10) => ['calculations', 'recent', userId, limit],

  /**
   * Calculation statistics
   * @param {string} userId - User ID
   * @param {string} timeRange - Time range for statistics
   * @returns {Array} Query key array
   */
  stats: (userId, timeRange = '30d') => ['calculations', 'stats', userId, timeRange]
};

/**
 * User query keys
 */
export const USER_QUERY_KEYS = {
  /**
   * All user-related queries
   */
  all: ['users'],

  /**
   * Current user profile
   */
  current: ['users', 'current'],

  /**
   * User profile by ID
   * @param {string} userId - User ID
   * @returns {Array} Query key array
   */
  profile: (userId) => ['users', 'profile', userId],

  /**
   * User statistics
   * @param {string} userId - User ID
   * @returns {Array} Query key array
   */
  stats: (userId) => ['users', 'stats', userId]
};

/**
 * Audit log query keys
 */
export const AUDIT_QUERY_KEYS = {
  /**
   * All audit-related queries
   */
  all: ['audit'],

  /**
   * Audit logs for a resource
   * @param {string} resourceType - Type of resource
   * @param {string} resourceId - Resource ID
   * @param {Object} filters - Filter parameters
   * @returns {Array} Query key array
   */
  resource: (resourceType, resourceId, filters = {}) => [
    'audit', 'resource', resourceType, resourceId, filters
  ],

  /**
   * Audit logs for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter parameters
   * @returns {Array} Query key array
   */
  user: (userId, filters = {}) => ['audit', 'user', userId, filters],

  /**
   * Audit statistics
   * @param {Object} filters - Filter parameters
   * @returns {Array} Query key array
   */
  stats: (filters = {}) => ['audit', 'stats', filters]
};

/**
 * Utility functions for query key management
 */
export const queryKeyUtils = {
  /**
   * Get all query keys that match a pattern
   * @param {Array} pattern - Query key pattern to match
   * @returns {Function} Function that checks if a key matches the pattern
   */
  matches: (pattern) => (queryKey) => {
    if (!Array.isArray(queryKey) || !Array.isArray(pattern)) {
      return false;
    }

    if (pattern.length > queryKey.length) {
      return false;
    }

    return pattern.every((part, index) => queryKey[index] === part);
  },

  /**
   * Invalidate all queries matching a pattern
   * @param {Array} pattern - Query key pattern
   * @returns {Array} Query key pattern for invalidation
   */
  invalidate: (pattern) => pattern,

  /**
   * Create a query key with filters
   * @param {Array} baseKey - Base query key
   * @param {Object} filters - Filter object
   * @returns {Array} Query key with sorted filters
   */
  withFilters: (baseKey, filters = {}) => {
    const sortedFilters = Object.keys(filters)
      .sort()
      .reduce((result, key) => {
        result[key] = filters[key];
        return result;
      }, {});

    return [...baseKey, sortedFilters];
  }
};

/**
 * Query key constants for common operations
 */
export const QUERY_KEYS = {
  // RxNorm
  RXNORM_SEARCH: (drugName) => RXNORM_QUERY_KEYS.search(drugName),
  RXNORM_DRUG: (rxcui) => RXNORM_QUERY_KEYS.drug(rxcui),

  // FDA
  FDA_SEARCH: (drugName) => FDA_QUERY_KEYS.searchByName(drugName),
  FDA_NDC: (ndc) => FDA_QUERY_KEYS.ndc(ndc),
  FDA_ACTIVE: (drugName) => FDA_QUERY_KEYS.active(drugName),

  // Calculations
  CALCULATIONS_LIST: (filters) => CALCULATION_QUERY_KEYS.list(filters),
  CALCULATION_DETAIL: (id) => CALCULATION_QUERY_KEYS.detail(id),
  USER_CALCULATIONS: (userId, filters) => CALCULATION_QUERY_KEYS.user(userId, filters),

  // Users
  USER_PROFILE: (userId) => USER_QUERY_KEYS.profile(userId),

  // Audit
  AUDIT_LOGS: (resourceType, resourceId, filters) =>
    AUDIT_QUERY_KEYS.resource(resourceType, resourceId, filters)
};
