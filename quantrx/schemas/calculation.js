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
 * Custom NDC validation function
 * Validates that NDC is 10 or 11 digits and matches one of the four official formats
 * Checks formats in order of specificity to avoid false positives
 */
const validateNDC = (value) => {
  if (!value) return true; // Allow empty for optional fields
  
  // Remove hyphens for validation
  const cleanNDC = value.replace(/-/g, '');
  
  // Must be exactly 10 or 11 digits (all numeric)
  if (!/^\d{10,11}$/.test(cleanNDC)) {
    return false;
  }
  
  // Normalize to 11 digits by adding leading zero if needed
  const normalizedNDC = cleanNDC.length === 10 ? `0${cleanNDC}` : cleanNDC;
  
  // Check formats in order of specificity to avoid false matches
  // Format: 6-3-1 (most specific - 6 digits at start)
  if (/^\d{6}\d{3}\d{1}$/.test(normalizedNDC)) return true;
  // Format: 5-4-1 (5 digits, then 4 digits)
  if (/^\d{5}\d{4}\d{1}$/.test(normalizedNDC)) return true;
  // Format: 5-3-2 (5 digits, then 3 digits)
  if (/^\d{5}\d{3}\d{2}$/.test(normalizedNDC)) return true;
  // Format: 4-4-2 (only valid if normalized starts with 0 and rest is 4-4-2)
  if (/^0\d{4}\d{4}\d{2}$/.test(normalizedNDC)) return true;
  
  return false;
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
 * 
 * Supports two modes:
 * 1. Calculated quantity: Requires SIG and daysSupply
 * 2. Direct quantity: Requires quantity field, SIG and daysSupply are optional
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
      'NDC must be 10 or 11 digits in one of these formats: 12345-6789-0, 12345-678-90, 1234-5678-90, or 123456-789-0'
    ),

  sig: z
    .string()
    .optional(),

  daysSupply: z
    .union([z.number(), z.string()])
    .optional()
    .refine(
      (value) => {
        // Allow empty strings when quantity is provided (handled by parent refine)
        if (value === '' || value === null || value === undefined) return true;
        // If it's a string, try to parse it
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(numValue)) return false;
        return numValue >= 1 && numValue <= 365;
      },
      'Days supply must be between 1 and 365 days'
    ),

  quantity: z
    .union([z.number(), z.string()])
    .optional()
    .refine(
      (value) => {
        // Allow empty strings when SIG+daysSupply is provided (handled by parent refine)
        if (value === '' || value === null || value === undefined) return true;
        // If it's a string, try to parse it
        const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
        if (isNaN(numValue)) return false;
        return numValue > 0 && numValue <= 100000;
      },
      'Quantity must be between 1 and 100,000'
    )
}).refine(
  (data) => data.drugName || data.ndc,
  {
    message: 'Either drug name or NDC is required',
    path: ['drugName']
  }
).refine(
  (data) => {
    // Normalize quantity and daysSupply values for comparison
    const quantityValue = typeof data.quantity === 'string' 
      ? (data.quantity === '' ? 0 : parseInt(data.quantity, 10))
      : (data.quantity || 0);
    const daysSupplyValue = typeof data.daysSupply === 'string'
      ? (data.daysSupply === '' ? 0 : parseInt(data.daysSupply, 10))
      : (data.daysSupply || 0);
    
    // Either quantity is provided OR (SIG and daysSupply are provided)
    const hasQuantity = quantityValue > 0;
    const hasSigAndDays = data.sig && data.sig.trim().length > 0 && daysSupplyValue > 0;
    return hasQuantity || hasSigAndDays;
  },
  {
    message: 'Either enter a quantity directly, or provide SIG and days supply to calculate quantity',
    path: ['quantity']
  }
).refine(
  (data) => {
    // Normalize quantity value
    const quantityValue = typeof data.quantity === 'string' 
      ? (data.quantity === '' ? 0 : parseInt(data.quantity, 10))
      : (data.quantity || 0);
    const hasQuantity = quantityValue > 0;
    
    // If SIG is provided (and we're not using direct quantity), it must be valid
    if (hasQuantity) {
      return true; // SIG validation not needed when using direct quantity
    }
    if (data.sig && data.sig.trim().length > 0) {
      return validateSIG(data.sig);
    }
    return true; // SIG is optional if quantity is provided
  },
  {
    message: 'Directions must be 3-500 characters and contain meaningful content',
    path: ['sig']
  }
).refine(
  (data) => {
    // Normalize quantity value
    const quantityValue = typeof data.quantity === 'string' 
      ? (data.quantity === '' ? 0 : parseInt(data.quantity, 10))
      : (data.quantity || 0);
    const hasQuantity = quantityValue > 0;
    
    // If quantity is provided, daysSupply validation is not needed
    if (hasQuantity) {
      return true;
    }
    
    // Only validate daysSupply if it's provided and we're in calculated mode
    if (data.daysSupply === '' || data.daysSupply === null || data.daysSupply === undefined) {
      return true; // Empty is OK if quantity is provided (handled above)
    }
    
    const daysSupplyValue = typeof data.daysSupply === 'string'
      ? parseInt(data.daysSupply, 10)
      : data.daysSupply;
    
    if (isNaN(daysSupplyValue)) return false;
    return daysSupplyValue >= 1 && daysSupplyValue <= 365;
  },
  {
    message: 'Days supply must be between 1 and 365 days',
    path: ['daysSupply']
  }
);

/**
 * Schema for calculation API input (from frontend)
 * 
 * Supports two modes:
 * 1. Calculated quantity: Requires SIG and daysSupply
 * 2. Direct quantity: Requires quantity field, SIG and daysSupply are optional
 */
export const CalculationInputSchema = z.object({
  drugName: z.string().optional(),
  ndc: z.string().optional(),
  sig: z.string().optional(),
  daysSupply: z.number().optional(),
  quantity: z.number().optional()
}).refine(
  (data) => data.drugName || data.ndc,
  {
    message: 'Either drug name or NDC is required',
    path: ['drugName']
  }
).refine(
  (data) => {
    // Either quantity is provided OR (SIG and daysSupply are provided)
    const hasQuantity = data.quantity && data.quantity > 0;
    const hasSigAndDays = data.sig && data.sig.trim().length > 0 && data.daysSupply && data.daysSupply > 0;
    return hasQuantity || hasSigAndDays;
  },
  {
    message: 'Either enter a quantity directly, or provide SIG and days supply to calculate quantity',
    path: ['quantity']
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
