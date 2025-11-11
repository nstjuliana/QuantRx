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
 * NDC format validation: 11 digits with optional hyphens
 * Examples: 12345-678-90, 1234567890
 */
const ndcRegex = /^(\d{5}-?\d{3}-?\d{2}|\d{11})$/;

/**
 * NDC validation with formatting
 */
export const NDCFormatSchema = z
  .string()
  .regex(ndcRegex, 'NDC must be 11 digits (format: 12345-678-90)')
  .transform((value) => {
    // Normalize to hyphenated format
    const clean = value.replace(/-/g, '');
    return `${clean.slice(0, 5)}-${clean.slice(5, 8)}-${clean.slice(8)}`;
  });

/**
 * NDC validation without formatting (preserves original format)
 */
export const NDCValidationSchema = z
  .string()
  .regex(ndcRegex, 'NDC must be 11 digits (format: 12345-678-90)');

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
