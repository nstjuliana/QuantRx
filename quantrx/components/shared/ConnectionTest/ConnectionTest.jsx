/**
 * ConnectionTest Component
 *
 * Tests Auth0 and Supabase connections to verify environment configuration.
 * Displays connection status for debugging and verification.
 *
 * @component
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ConnectionTest Component
 *
 * @returns {JSX.Element} Connection test results display
 */
export function ConnectionTest() {
  const { user, isLoading: authLoading } = useAuth();
  const [supabaseStatus, setSupabaseStatus] = useState('testing');
  const [auth0Status, setAuth0Status] = useState('testing');
  const [supabaseError, setSupabaseError] = useState(null);
  const [auth0Error, setAuth0Error] = useState(null);

  // Test Supabase connection
  useEffect(() => {
    async function testSupabase() {
      try {
        // Call API route to test Supabase connection
        const response = await fetch('/api/test/supabase');
        const result = await response.json();
        
        if (result.status === 'connected') {
          setSupabaseStatus('connected');
          setSupabaseError(result.note || null);
        } else {
          setSupabaseStatus('error');
          setSupabaseError(result.error || 'Failed to connect to Supabase');
        }
      } catch (error) {
        setSupabaseStatus('error');
        setSupabaseError(error.message || 'Failed to test Supabase connection');
      }
    }

    testSupabase();
  }, []);

  // Test Auth0 connection
  useEffect(() => {
    async function testAuth0() {
      try {
        // Test if Auth0 API endpoint is accessible
        const response = await fetch('/api/auth/me');
        
        if (response.ok || response.status === 401) {
          // 401 is expected if not authenticated, but means Auth0 is working
          setAuth0Status('connected');
          setAuth0Error(null);
        } else {
          setAuth0Status('error');
          setAuth0Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        setAuth0Status('error');
        setAuth0Error(error.message || 'Failed to connect to Auth0');
      }
    }

    testAuth0();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return '#4CAF50'; // Green
      case 'error':
        return '#F44336'; // Red
      case 'testing':
        return '#FF9800'; // Orange
      default:
        return '#757575'; // Gray
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return '✅ Connected';
      case 'error':
        return '❌ Error';
      case 'testing':
        return '🔄 Testing...';
      default:
        return '❓ Unknown';
    }
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
      padding: '32px',
      boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
      border: '1px solid #E0E0E0',
      marginBottom: '32px',
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 600,
        color: '#212121',
        margin: '0 0 24px 0',
      }}>
        🔧 Connection Tests
      </h2>

      <p style={{
        fontSize: '14px',
        color: '#757575',
        margin: '0 0 24px 0',
        lineHeight: 1.43,
      }}>
        Verify that Auth0 and Supabase connections are working correctly.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
      }}>
        {/* Auth0 Test */}
        <div style={{
          padding: '20px',
          backgroundColor: '#F5F5F5',
          borderRadius: '4px',
          border: '1px solid #E0E0E0',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#212121',
              margin: 0,
            }}>
              Auth0
            </h3>
            <span style={{
              color: getStatusColor(auth0Status),
              fontWeight: 500,
              fontSize: '14px',
            }}>
              {getStatusText(auth0Status)}
            </span>
          </div>

          <div style={{
            fontSize: '12px',
            color: '#757575',
            marginBottom: '8px',
          }}>
            <strong>Status:</strong> {auth0Status === 'connected' ? 'API endpoint accessible' : auth0Status}
          </div>

          {authLoading && (
            <div style={{
              fontSize: '12px',
              color: '#FF9800',
              marginBottom: '8px',
            }}>
              ⏳ Checking authentication state...
            </div>
          )}

          {user && (
            <div style={{
              fontSize: '12px',
              color: '#4CAF50',
              marginBottom: '8px',
            }}>
              👤 User: {user.email || user.name || 'Authenticated'}
            </div>
          )}

          {auth0Error && (
            <div style={{
              fontSize: '12px',
              color: '#F44336',
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#FFEBEE',
              borderRadius: '4px',
            }}>
              <strong>Error:</strong> {auth0Error}
            </div>
          )}

          {auth0Status === 'connected' && !auth0Error && (
            <div style={{
              fontSize: '12px',
              color: '#4CAF50',
              marginTop: '8px',
            }}>
              ✓ Auth0 API routes are working correctly
            </div>
          )}
        </div>

        {/* Supabase Test */}
        <div style={{
          padding: '20px',
          backgroundColor: '#F5F5F5',
          borderRadius: '4px',
          border: '1px solid #E0E0E0',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#212121',
              margin: 0,
            }}>
              Supabase
            </h3>
            <span style={{
              color: getStatusColor(supabaseStatus),
              fontWeight: 500,
              fontSize: '14px',
            }}>
              {getStatusText(supabaseStatus)}
            </span>
          </div>

          <div style={{
            fontSize: '12px',
            color: '#757575',
            marginBottom: '8px',
          }}>
            <strong>Status:</strong> {supabaseStatus === 'connected' ? 'Database connection successful' : supabaseStatus}
          </div>

          {supabaseError && (
            <div style={{
              fontSize: '12px',
              color: supabaseStatus === 'connected' ? '#FF9800' : '#F44336',
              marginTop: '8px',
              padding: '8px',
              backgroundColor: supabaseStatus === 'connected' ? '#FFF3E0' : '#FFEBEE',
              borderRadius: '4px',
            }}>
              <strong>Note:</strong> {supabaseError}
            </div>
          )}

          {supabaseStatus === 'connected' && !supabaseError && (
            <div style={{
              fontSize: '12px',
              color: '#4CAF50',
              marginTop: '8px',
            }}>
              ✓ Supabase client connected successfully
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#E3F2FD',
        borderRadius: '4px',
        border: '1px solid #2196F3',
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#1565C0',
          margin: '0 0 8px 0',
        }}>
          📝 Setup Instructions
        </h4>
        <ul style={{
          fontSize: '12px',
          color: '#424242',
          margin: 0,
          paddingLeft: '20px',
          lineHeight: 1.6,
        }}>
          <li>Ensure all environment variables are set in <code>.env.local</code></li>
          <li>Run the database schema SQL in Supabase SQL Editor (<code>lib/database-schema.sql</code>)</li>
          <li>Configure Auth0 callback URLs in your Auth0 dashboard</li>
          <li>If Supabase shows "Table not found", run the schema SQL</li>
        </ul>
      </div>
    </div>
  );
}
