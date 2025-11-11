/**
 * Error Handling Utilities
 *
 * Utility functions for consistent error handling across the application.
 * Provides standardized error response formats and handling patterns.
 *
 * @module lib/utils/errors
 */

/**
 * Standard API error response format
 * @typedef {Object} ApiError
 * @property {string} message - Human-readable error message
 * @property {string} code - Error code for programmatic handling
 * @property {Object} [details] - Additional error details
 */

/**
 * Creates a standardized API error response
 *
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} [details] - Additional error details
 * @returns {ApiError} Standardized error object
 */
export function createApiError(message, code, details = {}) {
  return {
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handles API errors and returns NextResponse
 *
 * @param {Error} error - The error that occurred
 * @param {string} [defaultMessage] - Default error message if error doesn't have one
 * @returns {NextResponse} Next.js response with error
 */
export function handleApiError(error, defaultMessage = 'An unexpected error occurred') {
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return new Response(
      JSON.stringify(createApiError(
        'Validation failed',
        'VALIDATION_ERROR',
        { validationErrors }
      )),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Handle Supabase errors
  if (error.code) {
    const statusCode = getSupabaseStatusCode(error.code);
    return new Response(
      JSON.stringify(createApiError(
        error.message || defaultMessage,
        error.code,
        { hint: error.hint }
      )),
      {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Handle generic errors
  return new Response(
    JSON.stringify(createApiError(
      error.message || defaultMessage,
      'INTERNAL_ERROR'
    )),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Maps Supabase error codes to HTTP status codes
 *
 * @param {string} errorCode - Supabase error code
 * @returns {number} HTTP status code
 */
function getSupabaseStatusCode(errorCode) {
  const statusMap = {
    'PGRST116': 404, // No rows found
    '23505': 409,    // Unique constraint violation
    '23503': 400,    // Foreign key constraint violation
    '42501': 403,    // Insufficient privilege
    '23502': 400,    // Not null constraint violation
  };

  return statusMap[errorCode] || 500;
}

/**
 * Handles client-side errors with user-friendly messages
 *
 * @param {Error} error - The error that occurred
 * @returns {Object} User-friendly error information
 */
export function handleClientError(error) {
  console.error('Client Error:', error);

  // Network errors
  if (!navigator.onLine) {
    return {
      title: 'Connection Error',
      message: 'Please check your internet connection and try again.',
      type: 'error',
    };
  }

  // API errors with specific handling
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return {
          title: 'Invalid Request',
          message: data?.message || 'Please check your input and try again.',
          type: 'warning',
        };
      case 401:
        return {
          title: 'Authentication Required',
          message: 'Please sign in to continue.',
          type: 'error',
        };
      case 403:
        return {
          title: 'Access Denied',
          message: 'You do not have permission to perform this action.',
          type: 'error',
        };
      case 404:
        return {
          title: 'Not Found',
          message: 'The requested resource was not found.',
          type: 'warning',
        };
      case 429:
        return {
          title: 'Too Many Requests',
          message: 'Please wait a moment before trying again.',
          type: 'warning',
        };
      case 500:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          type: 'error',
        };
      default:
        return {
          title: 'Error',
          message: data?.message || 'An unexpected error occurred.',
          type: 'error',
        };
    }
  }

  // Generic errors
  return {
    title: 'Error',
    message: error.message || 'An unexpected error occurred.',
    type: 'error',
  };
}

/**
 * Logs errors for monitoring and debugging
 *
 * @param {Error} error - The error to log
 * @param {Object} [context] - Additional context information
 */
export function logError(error, context = {}) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    ...context,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }

  // In production, this would send to error tracking service
  // TODO: Integrate with Sentry or similar service in Phase 2
}
