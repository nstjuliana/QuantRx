/**
 * Audit logging constants and configuration
 *
 * This file defines all audit-related constants used throughout the application
 * for consistent audit logging and compliance tracking.
 *
 * @module lib/constants/audit
 */

/**
 * Audit action types for tracking user activities
 * Used in audit_logs table to categorize different types of actions
 */
export const AUDIT_ACTIONS = {
  // Calculation actions
  CALCULATION_CREATED: 'CALCULATION_CREATED',
  CALCULATION_VERIFIED: 'CALCULATION_VERIFIED',
  CALCULATION_UPDATED: 'CALCULATION_UPDATED',
  CALCULATION_DELETED: 'CALCULATION_DELETED',
  CALCULATION_EXPORTED: 'CALCULATION_EXPORTED',
  CALCULATION_VIEWED: 'CALCULATION_VIEWED',

  // User actions
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',

  // API actions
  API_RXNORM_CALLED: 'API_RXNORM_CALLED',
  API_FDA_CALLED: 'API_FDA_CALLED',
  API_CALCULATION_EXECUTED: 'API_CALCULATION_EXECUTED',

  // System actions
  SYSTEM_CONFIG_CHANGED: 'SYSTEM_CONFIG_CHANGED',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE'
};

/**
 * Resource types for audit logging
 * Used to categorize what type of resource was affected by an action
 */
export const AUDIT_RESOURCE_TYPES = {
  CALCULATION: 'CALCULATION',
  USER: 'USER',
  NDC: 'NDC',
  DRUG: 'DRUG',
  SYSTEM: 'SYSTEM',
  API: 'API'
};

/**
 * Audit severity levels for compliance and monitoring
 */
export const AUDIT_SEVERITY = {
  LOW: 'LOW',       // Routine operations (logins, views)
  MEDIUM: 'MEDIUM', // Important actions (calculations, exports)
  HIGH: 'HIGH',     // Critical actions (verifications, deletions)
  CRITICAL: 'CRITICAL' // Security events (failed auth, suspicious activity)
};

/**
 * Map of audit actions to their severity levels
 * Used to automatically determine log severity based on action type
 */
export const AUDIT_ACTION_SEVERITY = {
  [AUDIT_ACTIONS.CALCULATION_CREATED]: AUDIT_SEVERITY.MEDIUM,
  [AUDIT_ACTIONS.CALCULATION_VERIFIED]: AUDIT_SEVERITY.HIGH,
  [AUDIT_ACTIONS.CALCULATION_UPDATED]: AUDIT_SEVERITY.MEDIUM,
  [AUDIT_ACTIONS.CALCULATION_DELETED]: AUDIT_SEVERITY.HIGH,
  [AUDIT_ACTIONS.CALCULATION_EXPORTED]: AUDIT_SEVERITY.MEDIUM,
  [AUDIT_ACTIONS.CALCULATION_VIEWED]: AUDIT_SEVERITY.LOW,

  [AUDIT_ACTIONS.USER_LOGIN]: AUDIT_SEVERITY.LOW,
  [AUDIT_ACTIONS.USER_LOGOUT]: AUDIT_SEVERITY.LOW,
  [AUDIT_ACTIONS.USER_PROFILE_UPDATED]: AUDIT_SEVERITY.MEDIUM,

  [AUDIT_ACTIONS.API_RXNORM_CALLED]: AUDIT_SEVERITY.LOW,
  [AUDIT_ACTIONS.API_FDA_CALLED]: AUDIT_SEVERITY.LOW,
  [AUDIT_ACTIONS.API_CALCULATION_EXECUTED]: AUDIT_SEVERITY.MEDIUM,

  [AUDIT_ACTIONS.SYSTEM_CONFIG_CHANGED]: AUDIT_SEVERITY.CRITICAL,
  [AUDIT_ACTIONS.SYSTEM_MAINTENANCE]: AUDIT_SEVERITY.LOW
};

/**
 * Audit log retention periods (in days)
 * Different retention periods for different severity levels
 */
export const AUDIT_RETENTION = {
  [AUDIT_SEVERITY.LOW]: 90,      // 3 months
  [AUDIT_SEVERITY.MEDIUM]: 365,  // 1 year
  [AUDIT_SEVERITY.HIGH]: 2555,   // 7 years (HIPAA requirement)
  [AUDIT_SEVERITY.CRITICAL]: 2555 // 7 years (HIPAA requirement)
};

/**
 * Sensitive fields that should be masked in audit logs
 * These fields will be replaced with [REDACTED] in audit metadata
 */
export const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'auth0_secret',
  'supabase_service_role_key',
  'openai_api_key'
];

/**
 * Audit log structure constants
 */
export const AUDIT_LOG_FIELDS = {
  ID: 'id',
  USER_ID: 'user_id',
  ACTION: 'action',
  RESOURCE_TYPE: 'resource_type',
  RESOURCE_ID: 'resource_id',
  METADATA: 'metadata',
  IP_ADDRESS: 'ip_address',
  USER_AGENT: 'user_agent',
  CREATED_AT: 'created_at',
  SEVERITY: 'severity'
};

/**
 * Helper functions for audit logging
 */

/**
 * Get severity level for an audit action
 * @param {string} action - Audit action
 * @returns {string} Severity level
 */
export function getAuditSeverity(action) {
  return AUDIT_ACTION_SEVERITY[action] || AUDIT_SEVERITY.MEDIUM;
}

/**
 * Check if a field should be masked in audit logs
 * @param {string} fieldName - Field name to check
 * @returns {boolean} True if field should be masked
 */
export function isSensitiveField(fieldName) {
  return SENSITIVE_FIELDS.some(sensitive =>
    fieldName.toLowerCase().includes(sensitive.toLowerCase())
  );
}

/**
 * Mask sensitive data in audit metadata
 * @param {Object} metadata - Audit metadata object
 * @returns {Object} Metadata with sensitive fields masked
 */
export function maskSensitiveData(metadata) {
  if (!metadata || typeof metadata !== 'object') {
    return metadata;
  }

  const masked = { ...metadata };

  for (const [key, value] of Object.entries(masked)) {
    if (isSensitiveField(key)) {
      masked[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    }
  }

  return masked;
}
