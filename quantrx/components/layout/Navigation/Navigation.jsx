/**
 * Navigation Component
 *
 * Main navigation bar for the QuantRx application.
 * Displays application branding and user authentication status.
 *
 * @component
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Navigation Component
 *
 * @returns {JSX.Element} Navigation bar with branding and auth controls
 */
export function Navigation() {
  const { user, isAuthenticated, login, logout, isTechnician, isAdmin } = useAuth();

  return (
    <nav style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E0E0E0',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      {/* Application Branding */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#1976D2',
          margin: 0,
          letterSpacing: '-0.5px',
        }}>
          QuantRx
        </h1>
        <span style={{
          fontSize: '12px',
          color: '#757575',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 500,
        }}>
          NDC Calculator
        </span>
      </div>

      {/* User Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        {isAuthenticated ? (
          <>
            {/* User Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#1976D2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
              }}>
                {(user?.name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#212121',
                  margin: 0,
                }}>
                  {user?.name || user?.email || 'User'}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#757575',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  {isAdmin && (
                    <span style={{
                      backgroundColor: '#FF9800',
                      color: '#FFFFFF',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Admin
                    </span>
                  )}
                  {isTechnician && !isAdmin && (
                    <span style={{
                      backgroundColor: '#757575',
                      color: '#FFFFFF',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Technician
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
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
              Sign Out
            </button>
          </>
        ) : (
          /* Login Button */
          <button
            onClick={login}
            style={{
              padding: '8px 16px',
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
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
