/**
 * Audit logging utility for compliance and security tracking
 *
 * This utility provides audit logging functionality that saves structured
 * audit events to the database for compliance, security monitoring, and
 * troubleshooting. All audit logs are saved to the audit_logs table.
 *
 * @module lib/utils/audit
 */

import { supabase } from '../api/supabase.js';
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCE_TYPES,
  getAuditSeverity,
  maskSensitiveData
} from '../constants/audit.js';

/**
 * Log an audit event to the database
 * @param {string} action - Audit action type (from AUDIT_ACTIONS)
 * @param {string} resourceType - Resource type affected (from AUDIT_RESOURCE_TYPES)
 * @param {string} resourceId - ID of the affected resource
 * @param {Object} metadata - Additional context data for the audit event
 * @param {string} [userId] - User ID performing the action (will be extracted from auth if not provided)
 * @param {string} [ipAddress] - IP address of the request
 * @param {string} [userAgent] - User agent string from the request
 * @returns {Promise<Object>} Audit log record that was created
 */
export async function logAudit(
  action,
  resourceType,
  resourceId,
  metadata = {},
  userId = null,
  ipAddress = null,
  userAgent = null
) {
  try {
    // Get current user if not provided
    // Note: We use Auth0 for auth, not Supabase auth, so we can't get user from supabase.auth
    // If userId is not provided, set to null (database allows NULL for system actions)
    let actualUserId = userId || null;

    // Mask sensitive data in metadata
    const safeMetadata = maskSensitiveData(metadata);

    // Determine severity level
    const severity = getAuditSeverity(action);

    // Create audit log record
    const auditRecord = {
      user_id: actualUserId, // Can be null for system actions
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata: safeMetadata,
      ip_address: ipAddress,
      user_agent: userAgent,
      severity,
      created_at: new Date().toISOString()
    };

    console.log('[AUDIT] Creating audit log:', {
      action,
      resourceType,
      resourceId,
      userId: actualUserId
    });

    // Save to database using admin client to bypass RLS
    // Audit logs are system operations and should bypass RLS
    const { supabaseAdmin } = await import('../api/supabase.js');
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .insert(auditRecord)
      .select()
      .single();

    if (error) {
      // Log the error but don't throw - audit logging should not break the main flow
      console.error('[AUDIT] Failed to save audit log:', error);
      console.error('[AUDIT] Error code:', error.code);
      console.error('[AUDIT] Error message:', error.message);
      console.error('[AUDIT] Error details:', error.details);
      console.error('[AUDIT] Audit record that failed:', JSON.stringify(auditRecord, null, 2));
      return null;
    }

    console.log('[AUDIT] Audit log saved successfully:', data?.id);
    return data;
  } catch (error) {
    // Log the error but don't throw
    console.error('Audit logging error:', error);
    return null;
  }
}

/**
 * Log calculation creation
 * @param {string} calculationId - ID of the created calculation
 * @param {string} userId - User ID who created the calculation (UUID from users table)
 * @returns {Promise<Object>} Audit log record
 */
export async function logCalculationCreated(calculationId, userId) {
  return logAudit(
    AUDIT_ACTIONS.CALCULATION_CREATED,
    AUDIT_RESOURCE_TYPES.CALCULATION,
    calculationId,
    {
      calculationId,
      createdAt: new Date().toISOString()
    },
    userId
  );
}

/**
 * Log calculation verification
 * @param {string} calculationId - ID of the verified calculation
 * @param {string} verifierId - ID of the user who verified the calculation
 * @param {string} [userId] - Original calculation creator (if different from verifier)
 * @returns {Promise<Object>} Audit log record
 */
export async function logCalculationVerified(calculationId, verifierId, userId = null) {
  return logAudit(
    AUDIT_ACTIONS.CALCULATION_VERIFIED,
    AUDIT_RESOURCE_TYPES.CALCULATION,
    calculationId,
    {
      verifierId,
      verifiedAt: new Date().toISOString()
    },
    userId || verifierId
  );
}

/**
 * Log calculation export
 * @param {string} calculationId - ID of the exported calculation
 * @param {string} format - Export format (json, csv, pdf)
 * @param {string} [userId] - User who performed the export
 * @returns {Promise<Object>} Audit log record
 */
export async function logCalculationExported(calculationId, format, userId = null) {
  return logAudit(
    AUDIT_ACTIONS.CALCULATION_EXPORTED,
    AUDIT_RESOURCE_TYPES.CALCULATION,
    calculationId,
    {
      exportFormat: format,
      exportedAt: new Date().toISOString()
    },
    userId
  );
}

/**
 * Log API call for auditing
 * @param {string} apiName - Name of the API (rxnorm, fda)
 * @param {string} endpoint - API endpoint called
 * @param {Object} params - Request parameters (will be masked)
 * @param {string} [userId] - User who made the API call
 * @returns {Promise<Object>} Audit log record
 */
export async function logApiCall(apiName, endpoint, params = {}, userId = null) {
  const action = apiName === 'rxnorm'
    ? AUDIT_ACTIONS.API_RXNORM_CALLED
    : AUDIT_ACTIONS.API_FDA_CALLED;

  return logAudit(
    action,
    AUDIT_RESOURCE_TYPES.API,
    `${apiName}:${endpoint}`,
    {
      endpoint,
      paramCount: Object.keys(params).length,
      calledAt: new Date().toISOString()
    },
    userId
  );
}

/**
 * Log user authentication event
 * @param {string} event - Auth event type (login, logout)
 * @param {string} userId - User ID
 * @param {string} [ipAddress] - IP address
 * @param {string} [userAgent] - User agent
 * @returns {Promise<Object>} Audit log record
 */
export async function logAuthEvent(event, userId, ipAddress = null, userAgent = null) {
  const action = event === 'login'
    ? AUDIT_ACTIONS.USER_LOGIN
    : AUDIT_ACTIONS.USER_LOGOUT;

  return logAudit(
    action,
    AUDIT_RESOURCE_TYPES.USER,
    userId,
    {
      event,
      timestamp: new Date().toISOString()
    },
    userId,
    ipAddress,
    userAgent
  );
}

/**
 * Log permission denial
 * @param {string} action - Action that was denied
 * @param {string} resourceType - Type of resource being accessed
 * @param {string} resourceId - ID of the resource being accessed
 * @param {string} reason - Reason for denial
 * @param {string} userId - User who was denied access
 * @returns {Promise<Object>} Audit log record
 */
export async function logPermissionDenied(action, resourceType, resourceId, reason, userId) {
  return logAudit(
    'PERMISSION_DENIED', // Custom action for permission denials
    resourceType,
    resourceId,
    {
      attemptedAction: action,
      denialReason: reason,
      deniedAt: new Date().toISOString()
    },
    userId
  );
}

/**
 * Get audit logs for a specific resource
 * @param {string} resourceType - Type of resource
 * @param {string} resourceId - Resource ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of logs to return
 * @param {string} options.startDate - Start date for filtering
 * @param {string} options.endDate - End date for filtering
 * @returns {Promise<Array>} Array of audit log records
 */
export async function getAuditLogsForResource(
  resourceType,
  resourceId,
  options = {}
) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Audit log query error:', error);
    return [];
  }
}

/**
 * Get audit logs for a specific user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of logs to return
 * @param {string} options.startDate - Start date for filtering
 * @param {string} options.endDate - End date for filtering
 * @returns {Promise<Array>} Array of audit log records
 */
export async function getAuditLogsForUser(userId, options = {}) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.startDate) {
      query = query.gte('created_at', options.startDate);
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch user audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('User audit log query error:', error);
    return [];
  }
}

/**
 * Create audit middleware for API routes
 * @param {string} action - Audit action to log
 * @param {string} resourceType - Resource type
 * @param {Function} getResourceId - Function to extract resource ID from request
 * @returns {Function} Express-style middleware function
 */
export function createAuditMiddleware(action, resourceType, getResourceId) {
  return async (request, response, next) => {
    try {
      // Extract user ID from request
      const userId = request.user?.id || 'anonymous';

      // Extract resource ID
      const resourceId = getResourceId(request);

      // Log the audit event
      await logAudit(
        action,
        resourceType,
        resourceId,
        {
          method: request.method,
          url: request.url,
          userAgent: request.headers['user-agent']
        },
        userId,
        request.ip,
        request.headers['user-agent']
      );

      next();
    } catch (error) {
      // Don't break the request flow for audit logging errors
      console.error('Audit middleware error:', error);
      next();
    }
  };
}
