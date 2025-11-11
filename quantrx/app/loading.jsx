/**
 * Global Loading Page
 *
 * Global loading state for the QuantRx application.
 * Shows during route transitions and initial page loads.
 *
 * @module app/loading
 */

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

/**
 * Global Loading Component
 *
 * @returns {JSX.Element} Loading page for route transitions
 */
export default function Loading() {
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
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Loading Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          padding: '32px',
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
          border: '1px solid #E0E0E0',
        }}>
          <LoadingSpinner size="large" />

          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#212121',
            margin: '24px 0 8px 0',
          }}>
            Loading QuantRx
          </h2>

          <p style={{
            fontSize: '14px',
            color: '#757575',
            margin: 0,
            lineHeight: 1.43,
          }}>
            Please wait while we load the application...
          </p>
        </div>
      </div>
    </div>
  );
}
