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
  // Get base URL from environment variable or fallback to window.location.origin
  // This ensures consistency between server and client, and works in production
  const getBaseURL = () => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    
    // Use environment variable if available (set in Vercel), otherwise use window.location.origin
    // Note: Client-side env vars need NEXT_PUBLIC_ prefix, but AUTH0_BASE_URL is server-only
    // So we'll use window.location.origin which should match AUTH0_BASE_URL in production
    return window.location.origin;
  };

  const baseURL = getBaseURL();
  const redirectURI = baseURL ? `${baseURL}/api/auth/callback` : undefined;

  return (
    <Auth0Provider
      baseURL={baseURL}
      authorizationParams={{
        redirect_uri: redirectURI,
      }}
    >
      {children}
    </Auth0Provider>
  );
}
