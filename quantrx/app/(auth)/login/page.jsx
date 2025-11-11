/**
 * Login Page
 *
 * Auth0 login page for the QuantRx application.
 * Provides login button and basic application branding.
 *
 * @module app/(auth)/login/page
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Login Page Component
 *
 * @returns {JSX.Element} Login page with Auth0 integration
 */
export default function LoginPage() {
  const { login, isLoading } = useAuth();

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
        {/* Application Logo/Branding */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#212121',
            marginBottom: '8px',
            letterSpacing: '-0.5px',
          }}>
            QuantRx
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#757575',
            margin: 0,
          }}>
            NDC Packaging & Quantity Calculator
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '4px',
          padding: '32px',
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
          border: '1px solid #E0E0E0',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#212121',
            margin: '0 0 24px 0',
          }}>
            Sign In
          </h2>

          <p style={{
            fontSize: '14px',
            color: '#757575',
            margin: '0 0 24px 0',
            lineHeight: 1.43,
          }}>
            Sign in with your credentials to access the QuantRx application.
          </p>

          {/* Login Button */}
          <button
            onClick={login}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: isLoading ? '#BDBDBD' : '#1976D2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 200ms',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#1565C0';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#1976D2';
            }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Additional Info */}
          <p style={{
            fontSize: '12px',
            color: '#9E9E9E',
            margin: '16px 0 0 0',
            lineHeight: 1.5,
          }}>
            Contact your administrator if you need access to the application.
          </p>
        </div>
      </div>
    </div>
  );
}
