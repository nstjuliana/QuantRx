/**
 * 404 Not Found Page
 *
 * Custom 404 page for the QuantRx application.
 * Provides navigation back to the main application.
 *
 * @module app/not-found
 */

'use client';

import { useRouter } from 'next/navigation';

/**
 * Not Found Page Component
 *
 * @returns {JSX.Element} 404 page with navigation options
 */
export default function NotFound() {
  const router = useRouter();

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
        {/* 404 Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          padding: '32px',
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
          border: '1px solid #E0E0E0',
          marginBottom: '24px',
        }}>
          {/* 404 Icon/Graphic */}
          <div style={{
            fontSize: '72px',
            marginBottom: '24px',
            opacity: 0.7,
          }}>
            🔍
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#212121',
            margin: '0 0 16px 0',
            letterSpacing: '-1px',
          }}>
            404
          </h1>

          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#424242',
            margin: '0 0 16px 0',
          }}>
            Page Not Found
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#757575',
            margin: '0 0 32px 0',
            lineHeight: 1.5,
          }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back to the QuantRx application.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={() => router.push('/')}
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
              Go Home
            </button>

            <button
              onClick={() => router.back()}
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
              Go Back
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          padding: '24px',
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
          border: '1px solid #E0E0E0',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#212121',
            margin: '0 0 12px 0',
          }}>
            Need Help?
          </h3>

          <p style={{
            fontSize: '14px',
            color: '#757575',
            margin: '0 0 16px 0',
            lineHeight: 1.43,
          }}>
            If you believe this page should exist, please contact support with the URL you were trying to access.
          </p>

          <div style={{
            fontSize: '12px',
            color: '#9E9E9E',
            fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", "Courier New", monospace',
            backgroundColor: '#F5F5F5',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
          }}>
            {typeof window !== 'undefined' ? window.location.href : 'Current URL'}
          </div>
        </div>
      </div>
    </div>
  );
}
