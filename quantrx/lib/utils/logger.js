/**
 * Lightweight logging utility for development and debugging
 *
 * This utility provides structured logging for application events, API calls,
 * and errors. In production, this can be extended to integrate with external
 * logging services like Sentry, LogRocket, or DataDog.
 *
 * @module lib/utils/logger
 */

import { AUDIT_ACTIONS, AUDIT_RESOURCE_TYPES } from '../constants/audit.js';

/**
 * Log levels for different types of messages
 */
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

/**
 * Log event types for structured logging
 */
export const LOG_EVENT_TYPES = {
  CALCULATION_STARTED: 'CALCULATION_STARTED',
  CALCULATION_COMPLETED: 'CALCULATION_COMPLETED',
  API_CALL_STARTED: 'API_CALL_STARTED',
  API_CALL_COMPLETED: 'API_CALL_COMPLETED',
  API_CALL_ERROR: 'API_CALL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  PERFORMANCE_WARNING: 'PERFORMANCE_WARNING',
  USER_ACTION: 'USER_ACTION',
  SYSTEM_ERROR: 'SYSTEM_ERROR'
};

/**
 * Create a structured log entry
 * @param {string} level - Log level (debug, info, warn, error)
 * @param {string} eventType - Type of event being logged
 * @param {Object} payload - Event data and context
 * @param {Error} [error] - Optional error object
 * @returns {Object} Structured log entry
 */
function createLogEntry(level, eventType, payload = {}, error = null) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    eventType,
    payload: {
      ...payload,
      // Add request context if available
      requestId: payload.requestId || generateRequestId(),
      userId: payload.userId || 'anonymous',
      sessionId: payload.sessionId || 'unknown'
    }
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    };
  }

  return entry;
}

/**
 * Generate a unique request ID for tracing
 * @returns {string} Unique request identifier
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format log entry for console output
 * @param {Object} entry - Log entry to format
 * @returns {string} Formatted log message
 */
function formatLogEntry(entry) {
  const { timestamp, level, eventType, payload, error } = entry;

  let message = `[${timestamp}] ${level.toUpperCase()} [${eventType}]`;

  // Add key payload information
  if (payload.userId && payload.userId !== 'anonymous') {
    message += ` user=${payload.userId}`;
  }

  if (payload.calculationId) {
    message += ` calculation=${payload.calculationId}`;
  }

  if (payload.ndc) {
    message += ` ndc=${payload.ndc}`;
  }

  if (payload.apiEndpoint) {
    message += ` endpoint=${payload.apiEndpoint}`;
  }

  if (payload.duration) {
    message += ` duration=${payload.duration}ms`;
  }

  if (error) {
    message += ` error="${error.message}"`;
  }

  return message;
}

/**
 * Log an event with structured data
 * @param {string} eventType - Type of event being logged
 * @param {Object} payload - Event data and context
 * @param {Error} [error] - Optional error object
 */
export function logEvent(eventType, payload = {}, error = null) {
  const level = error ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
  const entry = createLogEntry(level, eventType, payload, error);

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    const formatted = formatLogEntry(entry);

    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.debug(formatted, entry);
        break;
      case LOG_LEVELS.INFO:
        console.info(formatted, entry);
        break;
      case LOG_LEVELS.WARN:
        console.warn(formatted, entry);
        break;
      case LOG_LEVELS.ERROR:
        console.error(formatted, entry);
        break;
    }
  }

  // TODO: In production, send to external logging service
  // await sendToLoggingService(entry);

  return entry;
}

/**
 * Log API call start
 * @param {string} endpoint - API endpoint being called
 * @param {Object} params - Request parameters
 * @param {string} [userId] - User making the request
 */
export function logApiCallStart(endpoint, params = {}, userId = null) {
  return logEvent(LOG_EVENT_TYPES.API_CALL_STARTED, {
    apiEndpoint: endpoint,
    method: params.method || 'GET',
    userId,
    // Don't log sensitive parameters
    paramCount: Object.keys(params).length
  });
}

/**
 * Log API call completion
 * @param {string} endpoint - API endpoint that was called
 * @param {number} duration - Response time in milliseconds
 * @param {number} statusCode - HTTP status code
 * @param {string} [userId] - User who made the request
 */
export function logApiCallCompleted(endpoint, duration, statusCode, userId = null) {
  return logEvent(LOG_EVENT_TYPES.API_CALL_COMPLETED, {
    apiEndpoint: endpoint,
    duration,
    statusCode,
    userId
  });
}

/**
 * Log API call error
 * @param {string} endpoint - API endpoint that failed
 * @param {number} duration - Time spent before failure
 * @param {Error} error - Error that occurred
 * @param {string} [userId] - User who made the request
 */
export function logApiCallError(endpoint, duration, error, userId = null) {
  return logEvent(LOG_EVENT_TYPES.API_CALL_ERROR, {
    apiEndpoint: endpoint,
    duration,
    userId
  }, error);
}

/**
 * Log calculation start
 * @param {Object} inputs - Calculation input parameters
 * @param {string} [userId] - User starting the calculation
 * @returns {string} Request ID for tracking this calculation
 */
export function logCalculationStart(inputs, userId = null) {
  const requestId = generateRequestId();

  logEvent(LOG_EVENT_TYPES.CALCULATION_STARTED, {
    requestId,
    userId,
    inputs: {
      hasDrugName: !!inputs.drugName,
      hasNdc: !!inputs.ndc,
      sigLength: inputs.sig?.length || 0,
      daysSupply: inputs.daysSupply
    }
  });

  return requestId;
}

/**
 * Log calculation completion
 * @param {string} requestId - Request ID from calculation start
 * @param {Object} result - Calculation result summary
 * @param {number} duration - Total calculation time
 * @param {string} [userId] - User who performed the calculation
 */
export function logCalculationCompleted(requestId, result, duration, userId = null) {
  logEvent(LOG_EVENT_TYPES.CALCULATION_COMPLETED, {
    requestId,
    userId,
    duration,
    result: {
      status: result.status,
      calculatedQuantity: result.calculation?.calculatedQuantity,
      recommendedNDC: result.recommendation?.ndc?.ndc,
      warningsCount: result.warnings?.length || 0
    }
  });
}

/**
 * Log validation error
 * @param {string} field - Field that failed validation
 * @param {string} error - Validation error message
 * @param {string} [userId] - User who triggered the validation
 */
export function logValidationError(field, error, userId = null) {
  logEvent(LOG_EVENT_TYPES.VALIDATION_ERROR, {
    field,
    error,
    userId
  });
}

/**
 * Log performance warning
 * @param {string} operation - Operation that was slow
 * @param {number} duration - Duration in milliseconds
 * @param {Object} context - Additional context about the operation
 */
export function logPerformanceWarning(operation, duration, context = {}) {
  logEvent(LOG_EVENT_TYPES.PERFORMANCE_WARNING, {
    operation,
    duration,
    ...context
  });
}

/**
 * Log user action for analytics
 * @param {string} action - User action (e.g., 'button_click', 'form_submit')
 * @param {Object} details - Action details
 * @param {string} userId - User performing the action
 */
export function logUserAction(action, details, userId) {
  logEvent(LOG_EVENT_TYPES.USER_ACTION, {
    action,
    details,
    userId
  });
}

/**
 * Log system error
 * @param {Error} error - System error
 * @param {Object} context - Additional error context
 */
export function logSystemError(error, context = {}) {
  logEvent(LOG_EVENT_TYPES.SYSTEM_ERROR, context, error);
}

/**
 * Create a logger instance with predefined context
 * @param {Object} defaultContext - Default context to include in all logs
 * @returns {Object} Logger instance with contextual logging methods
 */
export function createContextualLogger(defaultContext = {}) {
  return {
    logEvent: (eventType, payload = {}, error = null) =>
      logEvent(eventType, { ...defaultContext, ...payload }, error),

    logApiCallStart: (endpoint, params = {}) =>
      logApiCallStart(endpoint, params, defaultContext.userId),

    logApiCallCompleted: (endpoint, duration, statusCode) =>
      logApiCallCompleted(endpoint, duration, statusCode, defaultContext.userId),

    logApiCallError: (endpoint, duration, error) =>
      logApiCallError(endpoint, duration, error, defaultContext.userId),

    logCalculationStart: (inputs) =>
      logCalculationStart(inputs, defaultContext.userId),

    logValidationError: (field, error) =>
      logValidationError(field, error, defaultContext.userId),

    logUserAction: (action, details) =>
      logUserAction(action, details, defaultContext.userId)
  };
}
