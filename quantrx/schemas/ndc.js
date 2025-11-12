/**
 * Zod validation schemas for NDC (National Drug Code) data
 *
 * This file contains schemas for validating NDC formats, FDA API responses,
 * and NDC-related data structures.
 *
 * @module schemas/ndc
 */

import { z } from 'zod';

/**
 * NDC format validation: Supports 10 or 11 digits in four official FDA formats:
 * - 5-4-1: XXXXX-XXXX-X (e.g., 12345-6789-0)
 * - 5-3-2: XXXXX-XXX-XX (e.g., 12345-678-90)
 * - 4-4-2: XXXX-XXXX-XX (e.g., 1234-5678-90)
 * - 6-3-1: XXXXXX-XXX-X (e.g., 123456-789-0)
 * 
 * 11-digit versions include a leading zero (HIPAA billing standard)
 * Hyphens are optional in input but normalized in output
 */
const ndcRegex = /^(\d{5}-?\d{4}-?\d{1}|\d{5}-?\d{3}-?\d{2}|\d{4}-?\d{4}-?\d{2}|\d{6}-?\d{3}-?\d{1}|\d{10}|\d{11})$/;

/**
 * Normalize NDC to standard format
 * Converts 10-digit to 11-digit by adding leading zero, then formats appropriately
 */
function normalizeNDCFormat(value) {
  const clean = value.replace(/-/g, '');
  const normalized = clean.length === 10 ? `0${clean}` : clean;
  
  // Determine format based on digit distribution
  // Format: 5-4-1
  if (/^\d{5}\d{4}\d{1}$/.test(normalized)) {
    return `${normalized.slice(0, 5)}-${normalized.slice(5, 9)}-${normalized.slice(9)}`;
  }
  // Format: 5-3-2
  if (/^\d{5}\d{3}\d{2}$/.test(normalized)) {
    return `${normalized.slice(0, 5)}-${normalized.slice(5, 8)}-${normalized.slice(8)}`;
  }
  // Format: 4-4-2 (when normalized, first digit is leading zero from 10-digit input)
  if (/^0\d{4}\d{4}\d{2}$/.test(normalized)) {
    // Remove leading zero for 4-4-2 format
    const withoutLeadingZero = normalized.slice(1);
    return `${withoutLeadingZero.slice(0, 4)}-${withoutLeadingZero.slice(4, 8)}-${withoutLeadingZero.slice(8)}`;
  }
  // Format: 6-3-1
  if (/^\d{6}\d{3}\d{1}$/.test(normalized)) {
    return `${normalized.slice(0, 6)}-${normalized.slice(6, 9)}-${normalized.slice(9)}`;
  }
  
  // Default fallback (shouldn't reach here if validation works)
  return normalized;
}

/**
 * Validate NDC format
 * Checks if the NDC matches one of the four official FDA formats
 * Must check in order to avoid false positives (6-3-1, then 5-4-1, then 5-3-2, then 4-4-2)
 */
function validateNDCFormat(value) {
  if (!value) return false;
  const clean = value.replace(/-/g, '');
  if (!/^\d{10,11}$/.test(clean)) return false;
  
  const normalized = clean.length === 10 ? `0${clean}` : clean;
  
  // Check formats in order of specificity to avoid false matches
  // Format: 6-3-1 (most specific - 6 digits at start)
  if (/^\d{6}\d{3}\d{1}$/.test(normalized)) return true;
  // Format: 5-4-1 (5 digits, then 4 digits)
  if (/^\d{5}\d{4}\d{1}$/.test(normalized)) return true;
  // Format: 5-3-2 (5 digits, then 3 digits)
  if (/^\d{5}\d{3}\d{2}$/.test(normalized)) return true;
  // Format: 4-4-2 (only valid if normalized starts with 0 and rest is 4-4-2)
  // This means original was 10 digits in 4-4-2 format
  if (/^0\d{4}\d{4}\d{2}$/.test(normalized)) return true;
  
  return false;
}

/**
 * NDC validation with formatting
 */
export const NDCFormatSchema = z
  .string()
  .refine(validateNDCFormat, 'NDC must be 10 or 11 digits in one of these formats: 12345-6789-0, 12345-678-90, 1234-5678-90, or 123456-789-0')
  .transform((value) => normalizeNDCFormat(value));

/**
 * NDC validation without formatting (preserves original format)
 */
export const NDCValidationSchema = z
  .string()
  .refine(validateNDCFormat, 'NDC must be 10 or 11 digits in one of these formats: 12345-6789-0, 12345-678-90, 1234-5678-90, or 123456-789-0');

/**
 * Schema for NDC search/filter parameters
 */
export const NDCSearchSchema = z.object({
  ndc: NDCValidationSchema.optional(),
  rxcui: z.string().optional(),
  manufacturer: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0)
});

/**
 * Schema for FDA NDC API response structure
 * Based on open.fda.gov/drug/ndc API
 */
export const FDANDCRecordSchema = z.object({
  product_ndc: z.string(),
  generic_name: z.string().optional(),
  brand_name: z.string().optional(),
  dosage_form: z.string().optional(),
  route: z.array(z.string()).optional(),
  strength: z.array(z.string()).optional(),
  package_description: z.array(z.string()).optional(),
  marketing_start_date: z.string().optional(),
  marketing_end_date: z.string().optional(),
  product_type: z.string().optional(),
  brand_name_base: z.string().optional(),
  labeler_name: z.string().optional(),
  finished: z.boolean().optional(),
  packaging: z.array(z.object({
    package_ndc: z.string(),
    description: z.string(),
    marketing_start_date: z.string().optional(),
    marketing_end_date: z.string().optional(),
    sample: z.boolean().optional()
  })).optional()
});

/**
 * Schema for FDA API search response wrapper
 */
export const FDAAPIResponseSchema = z.object({
  meta: z.object({
    disclaimer: z.string(),
    terms: z.string(),
    license: z.string(),
    last_updated: z.string(),
    results: z.object({
      skip: z.number(),
      limit: z.number(),
      total: z.number()
    })
  }),
  results: z.array(FDANDCRecordSchema)
});

/**
 * Schema for processed NDC record (our internal format)
 */
export const ProcessedNDCRecordSchema = z.object({
  ndc: NDCFormatSchema,
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  packageSize: z.number().positive('Package size must be positive'),
  dosageForm: z.string().min(1, 'Dosage form is required'),
  strength: z.string().min(1, 'Strength is required'),
  status: z.enum(['active', 'inactive']),
  marketingStartDate: z.string().optional(),
  marketingEndDate: z.string().optional(),
  rxcui: z.string().optional(),
  cost: z.number().optional(),
  originalData: z.record(z.any()).optional() // Store original FDA data for debugging
});

/**
 * Schema for NDC validation request
 */
export const NDCValidationRequestSchema = z.object({
  ndc: NDCValidationSchema,
  includeInactive: z.boolean().optional().default(false)
});

/**
 * Schema for NDC validation response
 */
export const NDCValidationResponseSchema = z.object({
  ndc: NDCFormatSchema,
  isValid: z.boolean(),
  isActive: z.boolean(),
  record: ProcessedNDCRecordSchema.optional(),
  error: z.string().optional()
});

/**
 * Schema for batch NDC validation
 */
export const BatchNDCValidationSchema = z.object({
  ndcs: z.array(NDCValidationSchema).min(1).max(50, 'Maximum 50 NDCs per batch'),
  includeInactive: z.boolean().optional().default(false)
});

/**
 * Schema for batch NDC validation response
 */
export const BatchNDCValidationResponseSchema = z.object({
  results: z.array(NDCValidationResponseSchema),
  summary: z.object({
    total: z.number(),
    valid: z.number(),
    active: z.number(),
    inactive: z.number(),
    invalid: z.number()
  })
});
