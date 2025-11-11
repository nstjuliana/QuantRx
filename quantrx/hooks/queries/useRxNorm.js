/**
 * TanStack Query hook for RxNorm API integration
 *
 * Provides a React hook for searching drug information using the RxNorm API.
 * Includes caching, error handling, and retry logic.
 *
 * @module hooks/queries/useRxNorm
 */

import { useQuery } from '@tanstack/react-query';
import { RXNORM_QUERY_KEYS } from '@/lib/queries/keys';

/**
 * Hook for searching drugs by name using RxNorm API
 * @param {string} drugName - Drug name to search for
 * @param {Object} [options] - Query options
 * @param {boolean} [options.enabled] - Whether to run the query
 * @param {number} [options.staleTime] - How long to consider data fresh (default: 24 hours)
 * @param {number} [options.retry] - Number of retry attempts (default: 3)
 * @returns {Object} TanStack Query result object
 */
export function useRxNormSearch(drugName, options = {}) {
  const {
    enabled = !!drugName,
    staleTime = 24 * 60 * 60 * 1000, // 24 hours
    retry = 3,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: RXNORM_QUERY_KEYS.search(drugName),
    queryFn: async () => {
      const response = await fetch(`/api/rxnorm?name=${encodeURIComponent(drugName)}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to search for drug: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to search for drug');
      }

      return data.data;
    },
    enabled: enabled && !!drugName?.trim(),
    staleTime,
    retry,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    ...queryOptions
  });
}

/**
 * Hook for getting RxCUI for a drug name
 * @param {string} drugName - Drug name
 * @param {Object} [options] - Query options
 * @returns {Object} TanStack Query result object with RxCUI
 */
export function useRxCUI(drugName, options = {}) {
  const searchQuery = useRxNormSearch(drugName, {
    ...options,
    select: (data) => data?.rxcui || null
  });

  return {
    ...searchQuery,
    data: searchQuery.data // RxCUI string or null
  };
}

/**
 * Hook for getting drug information by RxCUI
 * @param {string} rxcui - RxNorm Concept Unique Identifier
 * @param {Object} [options] - Query options
 * @returns {Object} TanStack Query result object
 */
export function useRxNormDrug(rxcui, options = {}) {
  const {
    enabled = !!rxcui,
    staleTime = 24 * 60 * 60 * 1000, // 24 hours
    retry = 3,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: RXNORM_QUERY_KEYS.drug(rxcui),
    queryFn: async () => {
      // For now, we'll use the search endpoint
      // In a future iteration, we might add a dedicated RxCUI endpoint
      throw new Error('Direct RxCUI lookup not yet implemented');
    },
    enabled,
    staleTime,
    retry,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...queryOptions
  });
}

/**
 * Hook for validating drug names with RxNorm
 * @param {string} drugName - Drug name to validate
 * @param {Object} [options] - Query options
 * @returns {Object} Validation result
 */
export function useDrugNameValidation(drugName, options = {}) {
  const {
    enabled = !!drugName,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey: RXNORM_QUERY_KEYS.validation(drugName),
    queryFn: async () => {
      // Perform a lightweight validation without full search
      const response = await fetch(`/api/rxnorm?name=${encodeURIComponent(drugName)}&limit=1`);

      if (response.status === 400) {
        // Validation error (invalid format)
        return { isValid: false, reason: 'Invalid drug name format' };
      }

      if (response.status === 404) {
        // Not found but valid format
        return { isValid: true, found: false, reason: 'Drug not found in RxNorm' };
      }

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        isValid: true,
        found: !!data.success,
        drug: data.data || null
      };
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - validation results don't need to be cached long
    retry: 1, // Only retry once for validation
    ...queryOptions
  });
}

// Re-export with the expected name from the plan
export { useRxNormSearch as useRxNorm };
