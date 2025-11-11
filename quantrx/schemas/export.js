/**
 * Zod validation schemas for export formats
 *
 * This file contains schemas for validating data structures used in
 * JSON exports, CSV exports, and other export formats.
 *
 * @module schemas/export
 */

import { z } from 'zod';

/**
 * Schema for JSON export structure
 * Canonical format for all export operations
 */
export const CalculationExportSchema = z.object({
  timestamp: z.string().datetime('Invalid timestamp'),
  user: z.object({
    id: z.string().min(1, 'User ID is required'),
    name: z.string().min(1, 'User name is required'),
    role: z.enum(['technician', 'pharmacist', 'admin'], 'Invalid user role')
  }),
  calculation: z.object({
    id: z.string().uuid('Invalid calculation ID'),
    status: z.enum(['success', 'partial', 'error'], 'Invalid calculation status')
  }),
  inputs: z.object({
    drugName: z.string().optional(),
    ndc: z.string().optional(),
    sig: z.string().min(1, 'SIG is required'),
    daysSupply: z.number().optional()
  }),
  normalization: z.object({
    rxcui: z.string().min(1, 'RxCUI is required'),
    drugName: z.string().min(1, 'Drug name is required'),
    dosageForm: z.string().min(1, 'Dosage form is required'),
    strength: z.string().min(1, 'Strength is required')
  }).optional(),
  calculation: z.object({
    parsedSIG: z.object({
      dose: z.number().positive(),
      frequency: z.number().positive(),
      unit: z.string().min(1),
      originalText: z.string().optional(),
      parseSuccess: z.boolean().optional(),
      parseError: z.string().optional()
    }),
    calculatedQuantity: z.number().positive(),
    unit: z.string().min(1)
  }),
  recommendation: z.object({
    ndc: z.string().regex(/^(\d{5}-?\d{3}-?\d{2}|\d{11})$/, 'Invalid NDC format'),
    manufacturer: z.string().min(1),
    packageSize: z.number().positive(),
    packages: z.number().positive(),
    totalQuantity: z.number().positive(),
    overfill: z.number().min(0),
    breakdown: z.string().min(1)
  }),
  alternatives: z.array(z.object({
    ndc: z.string().regex(/^(\d{5}-?\d{3}-?\d{2}|\d{11})$/, 'Invalid NDC format'),
    manufacturer: z.string().min(1),
    packageSize: z.number().positive(),
    packages: z.number().positive(),
    totalQuantity: z.number().positive(),
    overfill: z.number().min(0),
    breakdown: z.string().min(1)
  })).optional(),
  warnings: z.array(z.object({
    id: z.string().min(1),
    type: z.enum(['inactive_ndc', 'sig_parse_error', 'overfill', 'underfill', 'api_error']),
    severity: z.enum(['info', 'warning', 'error']),
    message: z.string().min(1),
    data: z.record(z.any()).optional()
  })).optional(),
  metadata: z.object({
    version: z.string().min(1, 'Version is required'),
    exportedAt: z.string().datetime(),
    exportFormat: z.enum(['json', 'csv', 'pdf'])
  })
});

/**
 * Schema for CSV export row
 */
export const CSVExportRowSchema = z.object({
  calculation_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  user_id: z.string(),
  user_name: z.string(),
  user_role: z.enum(['technician', 'pharmacist', 'admin']),
  drug_name: z.string().optional(),
  ndc_input: z.string().optional(),
  sig: z.string(),
  days_supply: z.number().optional(),
  rxcui: z.string().optional(),
  normalized_drug_name: z.string().optional(),
  dosage_form: z.string().optional(),
  strength: z.string().optional(),
  parsed_dose: z.number().optional(),
  parsed_frequency: z.number().optional(),
  parsed_unit: z.string().optional(),
  calculated_quantity: z.number().optional(),
  recommended_ndc: z.string().optional(),
  recommended_manufacturer: z.string().optional(),
  recommended_package_size: z.number().optional(),
  packages_needed: z.number().optional(),
  total_quantity: z.number().optional(),
  overfill_amount: z.number().optional(),
  quantity_breakdown: z.string().optional(),
  warnings_count: z.number().min(0),
  warnings_types: z.string().optional(), // Comma-separated list
  status: z.enum(['success', 'partial', 'error']),
  exported_at: z.string().datetime()
});

/**
 * Schema for CSV export configuration
 */
export const CSVExportConfigSchema = z.object({
  includeHeaders: z.boolean().default(true),
  delimiter: z.enum([',', ';', '\t']).default(','),
  quoteFields: z.boolean().default(true),
  dateFormat: z.enum(['ISO', 'US', 'EU']).default('ISO'),
  includeMetadata: z.boolean().default(false)
});

/**
 * Schema for export request parameters
 */
export const ExportRequestSchema = z.object({
  calculationId: z.string().uuid('Invalid calculation ID'),
  format: z.enum(['json', 'csv', 'clipboard'], 'Invalid export format'),
  config: CSVExportConfigSchema.optional()
});

/**
 * Schema for export response
 */
export const ExportResponseSchema = z.object({
  success: z.boolean(),
  format: z.enum(['json', 'csv', 'clipboard']),
  data: z.string(), // Base64 encoded or plain text
  filename: z.string().optional(),
  mimeType: z.string(),
  size: z.number().optional(), // File size in bytes
  timestamp: z.string().datetime()
});

/**
 * Schema for bulk export request
 */
export const BulkExportRequestSchema = z.object({
  calculationIds: z.array(z.string().uuid()).min(1).max(100, 'Maximum 100 calculations per export'),
  format: z.enum(['json', 'csv'], 'Bulk export only supports JSON and CSV'),
  config: CSVExportConfigSchema.optional()
});

/**
 * Schema for bulk export response
 */
export const BulkExportResponseSchema = z.object({
  success: z.boolean(),
  format: z.enum(['json', 'csv']),
  data: z.string(),
  filename: z.string(),
  totalCalculations: z.number(),
  timestamp: z.string().datetime(),
  summary: z.object({
    successful: z.number(),
    failed: z.number(),
    warnings: z.number()
  }).optional()
});
