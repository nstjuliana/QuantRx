/**
 * AuthProvider Component
 *
 * Provides Auth0 authentication context to the application.
 * Wraps the application with Auth0Provider from @auth0/nextjs-auth0.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 */

'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0/client';

/**
 * AuthProvider Component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element} Auth0 Auth0Provider wrapper
 */
export function AuthProvider({ children }) {
  return (
    <Auth0Provider
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin + '/api/auth/callback' : undefined,
      }}
    >
      {children}
    </Auth0Provider>
  );
}
