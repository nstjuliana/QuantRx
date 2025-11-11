/**
 * Global Error Boundary
 *
 * Global error boundary for the QuantRx application.
 * Catches and displays errors that occur during rendering.
 *
 * @module app/error
 */

'use client';

import { useEffect } from 'react';
import { logError } from '@/lib/utils/errors';

/**
 * Global Error Boundary Component
 *
 * @param {Object} props - Error boundary props
 * @param {Error} props.error - The error that was thrown
 * @param {Function} props.reset - Function to reset the error boundary
 * @returns {JSX.Element} Error display with recovery options
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the error for monitoring
    logError(error, {
      component: 'GlobalErrorBoundary',
      action: 'render_error',
    });
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: '#FAFAFA',
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Error Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          padding: '32px',
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
          border: '1px solid #E0E0E0',
          marginBottom: '24px',
        }}>
          {/* Error Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FFEBEE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px',
          }}>
            ⚠️
          </div>

          <h1 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#212121',
            margin: '0 0 16px 0',
          }}>
            Something went wrong
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#424242',
            margin: '0 0 24px 0',
            lineHeight: 1.5,
          }}>
            We encountered an unexpected error. This has been logged and our team has been notified.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              backgroundColor: '#F5F5F5',
              border: '1px solid #E0E0E0',
              borderRadius: '4px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'left',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#D32F2F',
                margin: '0 0 8px 0',
              }}>
                Error Details (Development Only)
              </h3>
              <code style={{
                fontSize: '12px',
                color: '#424242',
                fontFamily: 'Monaco, "SF Mono", monospace',
                wordBreak: 'break-word',
              }}>
                {error.message}
              </code>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                backgroundColor: '#1976D2',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 200ms',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1565C0';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#1976D2';
              }}
            >
              Try Again
            </button>

            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#1976D2',
                border: '1px solid #1976D2',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#1976D2';
                e.target.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#1976D2';
              }}
            >
              Go Home
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <p style={{
          fontSize: '14px',
          color: '#757575',
          margin: 0,
          lineHeight: 1.43,
        }}>
          If this problem persists, please contact support or try refreshing the page.
        </p>
      </div>
    </div>
  );
}
