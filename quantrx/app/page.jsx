/**
 * Home Page
 *
 * Main page of the QuantRx application.
 * Placeholder for the calculation interface (implemented in Phase 1).
 *
 * @module app/page
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ConnectionTest } from '@/components/shared/ConnectionTest';

/**
 * Home Page Component
 *
 * @returns {JSX.Element} Home page with welcome message and placeholder content
 */
export default function HomePage() {
  const { isAuthenticated, user, isTechnician, isAdmin } = useAuth();

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
    }}>
      {/* Welcome Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '48px',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#212121',
          margin: '0 0 16px 0',
          letterSpacing: '-0.5px',
        }}>
          Welcome to QuantRx
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#757575',
          margin: 0,
          lineHeight: 1.5,
        }}>
          NDC Packaging & Quantity Calculator
        </p>
      </div>

      {/* Status Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '4px',
        padding: '32px',
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        border: '1px solid #E0E0E0',
        marginBottom: '32px',
      }}>
        {isAuthenticated ? (
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#212121',
              margin: '0 0 16px 0',
            }}>
              ✅ Authentication Successful
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#424242',
              margin: '0 0 16px 0',
              lineHeight: 1.5,
            }}>
              Welcome back, <strong>{user?.name || user?.email || 'User'}</strong>!
            </p>

            {/* Role Information */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
            }}>
              {isAdmin && (
                <span style={{
                  backgroundColor: '#FF9800',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Administrator
                </span>
              )}
              {isTechnician && (
                <span style={{
                  backgroundColor: '#4CAF50',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Technician
                </span>
              )}
            </div>

            <p style={{
              fontSize: '14px',
              color: '#757575',
              margin: 0,
              lineHeight: 1.43,
            }}>
              You are successfully authenticated and ready to use the QuantRx application.
            </p>
          </div>
        ) : (
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#212121',
              margin: '0 0 16px 0',
            }}>
              🔐 Authentication Required
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#424242',
              margin: 0,
              lineHeight: 1.5,
            }}>
              Please sign in to access the QuantRx application.
            </p>
          </div>
        )}
      </div>

      {/* Connection Tests */}
      <ConnectionTest />

      {/* Phase 0 Status */}
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
          margin: '0 0 16px 0',
        }}>
          🚀 Phase 0 Complete
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#424242',
          margin: '0 0 24px 0',
          lineHeight: 1.5,
        }}>
          This is the setup phase of QuantRx. The application infrastructure is now in place with:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#F5F5F5',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1976D2',
              margin: '0 0 8px 0',
            }}>
              ✅ Authentication
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#757575',
              margin: 0,
              lineHeight: 1.43,
            }}>
              Auth0 integration with role-based access control
            </p>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#F5F5F5',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1976D2',
              margin: '0 0 8px 0',
            }}>
              ✅ Database
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#757575',
              margin: 0,
              lineHeight: 1.43,
            }}>
              Supabase setup with Row-Level Security
            </p>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#F5F5F5',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1976D2',
              margin: '0 0 8px 0',
            }}>
              ✅ UI Framework
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#757575',
              margin: 0,
              lineHeight: 1.43,
            }}>
              Material-UI theme with healthcare-optimized design
            </p>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#F5F5F5',
            borderRadius: '4px',
            border: '1px solid #E0E0E0',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#FF9800',
              margin: '0 0 8px 0',
            }}>
              🔄 Next Steps
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#757575',
              margin: 0,
              lineHeight: 1.43,
            }}>
              Phase 1: MVP with calculation engine and API integrations
            </p>
          </div>
        </div>

        <p style={{
          fontSize: '14px',
          color: '#757575',
          margin: 0,
          fontStyle: 'italic',
        }}>
          The core calculation features and API integrations will be implemented in Phase 1.
        </p>
      </div>
    </div>
  );
}
