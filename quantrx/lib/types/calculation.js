/**
 * Type definitions for calculation-related data structures
 *
 * This file defines JSDoc types for all core data structures used throughout
 * the calculation workflow. These provide pseudo-type safety in JavaScript
 * and serve as contracts between components.
 *
 * @module lib/types/calculation
 */

/**
 * @typedef {Object} ParsedSIG
 * @property {number} dose - Number of units per dose (e.g., 1 tablet)
 * @property {number} frequency - Number of times per day (e.g., 2 for "twice daily")
 * @property {string} unit - Unit of measurement (e.g., "tablet", "ml", "mg")
 * @property {string} [originalText] - Original SIG text for debugging/reference
 * @property {boolean} [parseSuccess] - Whether parsing was successful
 * @property {string} [parseError] - Error message if parsing failed
 */

/**
 * @typedef {Object} NDCRecord
 * @property {string} ndc - National Drug Code (11 digits, format: 12345-678-90)
 * @property {string} manufacturer - Drug manufacturer name
 * @property {number} packageSize - Number of units in package (e.g., 30 tablets)
 * @property {string} dosageForm - Dosage form (e.g., "tablet", "capsule", "injection")
 * @property {string} strength - Drug strength (e.g., "10 mg", "5 mg/ml")
 * @property {string} status - Status: "active" or "inactive"
 * @property {string} [marketingEndDate] - Date when NDC was discontinued (ISO format)
 * @property {string} [marketingStartDate] - Date when NDC was introduced (ISO format)
 * @property {string} [rxcui] - RxNorm Concept Unique Identifier
 * @property {number} [cost] - Estimated cost per package (future feature)
 */

/**
 * @typedef {Object} CalculationInput
 * @property {string} [drugName] - Drug name to search (either drugName or ndc required)
 * @property {string} [ndc] - NDC to validate (either drugName or ndc required)
 * @property {string} sig - Prescription directions (required)
 * @property {number} [daysSupply] - Number of days supply (optional, affects quantity calculation)
 */

/**
 * @typedef {Object} CalculationResult
 * @property {string} id - Unique calculation identifier (UUID)
 * @property {string} timestamp - Calculation timestamp (ISO format)
 * @property {Object} user - User information
 * @property {string} user.id - User ID
 * @property {string} user.name - User display name
 * @property {string} user.role - User role (technician/pharmacist/admin)
 * @property {CalculationInput} inputs - Original calculation inputs
 * @property {Object} normalization - Drug normalization results
 * @property {string} normalization.rxcui - RxNorm Concept Unique Identifier
 * @property {string} normalization.drugName - Normalized drug name
 * @property {string} normalization.dosageForm - Normalized dosage form
 * @property {string} normalization.strength - Drug strength
 * @property {Array<NDCRecord>} activeNDCs - List of active NDCs for this drug
 * @property {Array<NDCRecord>} inactiveNDCs - List of inactive NDCs for warnings
 * @property {Object} calculation - Quantity calculation results
 * @property {ParsedSIG} calculation.parsedSIG - Parsed SIG information
 * @property {number} calculation.calculatedQuantity - Total quantity to dispense
 * @property {string} calculation.unit - Unit of measurement
 * @property {Object} recommendation - Primary NDC recommendation
 * @property {NDCRecord} recommendation.ndc - Recommended NDC details
 * @property {number} recommendation.packages - Number of packages needed
 * @property {number} recommendation.totalQuantity - Total quantity from packages
 * @property {number} recommendation.overfill - Overfill amount (0 if exact match)
 * @property {string} recommendation.breakdown - Quantity breakdown description
 * @property {Array<Object>} alternatives - Alternative NDC options
 * @property {Array<Warning>} warnings - List of warnings/issues
 * @property {string} status - Calculation status: "success", "partial", "error"
 */

/**
 * @typedef {Object} Warning
 * @property {string} id - Unique warning identifier
 * @property {string} type - Warning type: "inactive_ndc", "sig_parse_error", "overfill", "underfill", "api_error"
 * @property {string} severity - Severity level: "info", "warning", "error"
 * @property {string} message - Human-readable warning message
 * @property {Object} [data] - Additional warning-specific data
 * @property {string} [data.ndc] - NDC associated with warning
 * @property {string} [data.originalText] - Original text that failed to parse
 * @property {number} [data.overfillAmount] - Amount of overfill
 * @property {string} [data.apiError] - API error details
 */

/**
 * @typedef {'pending' | 'verified'} CalculationStatus
 * Status of a calculation record in the database
 */

/**
 * @typedef {'CALCULATION_STARTED' | 'API_CALL' | 'API_ERROR' | 'CALCULATION_COMPLETED'} LogEventType
 * Types of events that can be logged for observability
 */

/**
 * @typedef {'CALCULATION_CREATED' | 'CALCULATION_VERIFIED' | 'CALCULATION_EXPORTED'} AuditAction
 * Types of audit actions that can be performed
 */

/**
 * @typedef {'CALCULATION' | 'NDC' | 'USER'} AuditResourceType
 * Types of resources that can be audited
 */

// Export an empty object to make this a proper module
export {};
