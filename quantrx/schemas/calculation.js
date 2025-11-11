/**
 * Zod validation schemas for calculation-related forms and data
 *
 * This file contains Zod schemas for validating calculation inputs, form data,
 * and API responses. These schemas ensure data integrity and provide clear
 * validation messages for users.
 *
 * @module schemas/calculation
 */

import { z } from 'zod';

/**
 * NDC format validation: 11 digits with optional hyphens (e.g., 12345-678-90 or 1234567890)
 */
const ndcRegex = /^(\d{5}-?\d{3}-?\d{2}|\d{11})$/;

/**
 * Custom NDC validation function
 */
const validateNDC = (value) => {
  if (!value) return true; // Allow empty for optional fields
  const cleanNDC = value.replace(/-/g, '');
  return cleanNDC.length === 11 && /^\d+$/.test(cleanNDC);
};

/**
 * SIG validation - basic length and content checks
 * More detailed validation happens in the SIG parsing logic
 */
const validateSIG = (value) => {
  if (!value || value.trim().length === 0) return false;
  if (value.trim().length < 3) return false; // Too short to be meaningful
  if (value.trim().length > 500) return false; // Too long, likely invalid
  return true;
};

/**
 * Schema for calculation form inputs
 * Used by React Hook Form with Zod resolver
 */
export const CalculationFormSchema = z.object({
  drugName: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.trim().length >= 2,
      'Drug name must be at least 2 characters'
    ),

  ndc: z
    .string()
    .optional()
    .refine(
      validateNDC,
      'NDC must be 11 digits (format: 12345-678-90)'
    ),

  sig: z
    .string()
    .min(1, 'Directions are required')
    .refine(
      validateSIG,
      'Directions must be 3-500 characters and contain meaningful content'
    ),

  daysSupply: z
    .number()
    .optional()
    .refine(
      (value) => !value || (value >= 1 && value <= 365),
      'Days supply must be between 1 and 365 days'
    )
}).refine(
  (data) => data.drugName || data.ndc,
  {
    message: 'Either drug name or NDC is required',
    path: ['drugName'] // Error will appear on drugName field
  }
);

/**
 * Schema for calculation API input (from frontend)
 */
export const CalculationInputSchema = z.object({
  drugName: z.string().optional(),
  ndc: z.string().optional(),
  sig: z.string().min(1, 'Directions are required'),
  daysSupply: z.number().optional()
}).refine(
  (data) => data.drugName || data.ndc,
  {
    message: 'Either drug name or NDC is required',
    path: ['drugName']
  }
);

/**
 * Schema for parsed SIG data structure
 */
export const ParsedSIGSchema = z.object({
  dose: z.number().positive('Dose must be positive'),
  frequency: z.number().positive('Frequency must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  originalText: z.string().optional(),
  parseSuccess: z.boolean().optional(),
  parseError: z.string().optional()
});

/**
 * Schema for NDC record validation
 */
export const NDCRecordSchema = z.object({
  ndc: z.string().regex(ndcRegex, 'Invalid NDC format'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  packageSize: z.number().positive('Package size must be positive'),
  dosageForm: z.string().min(1, 'Dosage form is required'),
  strength: z.string().min(1, 'Strength is required'),
  status: z.enum(['active', 'inactive'], 'Status must be active or inactive'),
  marketingEndDate: z.string().optional(),
  marketingStartDate: z.string().optional(),
  rxcui: z.string().optional(),
  cost: z.number().optional()
});

/**
 * Schema for calculation result validation
 */
export const CalculationResultSchema = z.object({
  id: z.string().uuid('Invalid calculation ID'),
  timestamp: z.string().datetime('Invalid timestamp'),
  user: z.object({
    id: z.string().min(1, 'User ID is required'),
    name: z.string().min(1, 'User name is required'),
    role: z.enum(['technician', 'pharmacist', 'admin'], 'Invalid user role')
  }),
  inputs: CalculationInputSchema,
  normalization: z.object({
    rxcui: z.string().min(1, 'RxCUI is required'),
    drugName: z.string().min(1, 'Drug name is required'),
    dosageForm: z.string().min(1, 'Dosage form is required'),
    strength: z.string().min(1, 'Strength is required')
  }),
  activeNDCs: z.array(NDCRecordSchema),
  inactiveNDCs: z.array(NDCRecordSchema),
  calculation: z.object({
    parsedSIG: ParsedSIGSchema,
    calculatedQuantity: z.number().positive('Calculated quantity must be positive'),
    unit: z.string().min(1, 'Unit is required')
  }),
  recommendation: z.object({
    ndc: NDCRecordSchema,
    packages: z.number().positive('Packages must be positive'),
    totalQuantity: z.number().positive('Total quantity must be positive'),
    overfill: z.number().min(0, 'Overfill cannot be negative'),
    breakdown: z.string().min(1, 'Breakdown description is required')
  }),
  alternatives: z.array(z.object({
    ndc: NDCRecordSchema,
    packages: z.number().positive(),
    totalQuantity: z.number().positive(),
    overfill: z.number().min(0),
    breakdown: z.string().min(1)
  })),
  warnings: z.array(z.object({
    id: z.string().min(1, 'Warning ID is required'),
    type: z.enum(['inactive_ndc', 'sig_parse_error', 'overfill', 'underfill', 'api_error']),
    severity: z.enum(['info', 'warning', 'error']),
    message: z.string().min(1, 'Warning message is required'),
    data: z.record(z.any()).optional()
  })),
  status: z.enum(['success', 'partial', 'error'], 'Invalid calculation status')
});
