/**
 * Auth0 Callback Page
 *
 * Handles Auth0 authentication callback after login/logout.
 * This page is automatically redirected to by Auth0.
 *
 * @module app/(auth)/callback/page
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Auth0 Callback Page Component
 *
 * Handles the callback from Auth0 after authentication.
 * Automatically redirects to the main application.
 *
 * @returns {JSX.Element} Loading page during callback processing
 */
export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // The Auth0 SDK automatically handles the callback
    // This page will be shown briefly during processing
    // Then the user will be redirected to the originally requested page
    // or the home page if no specific page was requested

    // For now, we'll redirect to home after a brief delay
    // In a production app, this would be handled automatically by Auth0
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

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
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #E0E0E0',
            borderTop: '4px solid #1976D2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px',
          }} />

          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#212121',
            margin: '0 0 16px 0',
          }}>
            Signing You In
          </h2>

          <p style={{
            fontSize: '14px',
            color: '#757575',
            margin: 0,
            lineHeight: 1.43,
          }}>
            Please wait while we complete your authentication...
          </p>
        </div>
      </div>

      {/* CSS Animation for spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
