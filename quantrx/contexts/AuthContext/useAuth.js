/**
 * useAuth Hook
 *
 * Custom hook for accessing Auth0 authentication state and methods.
 * Provides user information, login/logout functions, and role checking utilities.
 *
 * @module hooks/useAuth
 */

import { useUser } from '@auth0/nextjs-auth0/client';

/**
 * Custom authentication hook that wraps Auth0's useUser hook
 * and provides additional utilities for the QuantRx application.
 *
 * @returns {Object} Authentication state and methods
 * @property {Object|null} user - Current authenticated user object
 * @property {boolean} isLoading - Whether authentication state is loading
 * @property {Error|null} error - Authentication error if any
 * @property {Function} login - Function to initiate login flow
 * @property {Function} logout - Function to logout user
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {string[]} roles - User roles from Auth0 claims (technician, admin)
 * @property {boolean} isTechnician - Whether user has technician role
 * @property {boolean} isAdmin - Whether user has admin role
 */
export function useAuth() {
  const { user, isLoading, error } = useUser();

  // Check if user is authenticated
  // Only consider authenticated if:
  // 1. We're not loading
  // 2. We have a user object
  // 3. The user object has at least an email or sub property (Auth0 user identifiers)
  const isAuthenticated = !isLoading && !!user && (!!user.email || !!user.sub || !!user.nickname);
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    if (isLoading) {
      console.log('[useAuth] Loading authentication state...');
    } else if (user) {
      console.log('[useAuth] User found:', { email: user.email, sub: user.sub, hasRoles: !!user['https://quantrx.app/roles'] });
    } else {
      console.log('[useAuth] No user found - not authenticated');
    }
  }

  // Extract roles from Auth0 user object
  // Note: Role enforcement logic will be implemented in Phase 1
  const roles = user?.['https://quantrx.app/roles'] || [];
  const isTechnician = roles.includes('technician') || roles.length === 0; // Default to technician
  const isAdmin = roles.includes('admin');

  /**
   * Initiates the Auth0 login flow
   * Redirects user to Auth0 login page
   */
  const login = () => {
    window.location.href = '/api/auth/login';
  };

  /**
   * Logs out the current user
   * Redirects to Auth0 logout and then back to application
   */
  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  return {
    // Auth0 state
    user,
    isLoading,
    error,

    // Computed state
    isAuthenticated,
    roles,
    isTechnician,
    isAdmin,

    // Actions
    login,
    logout,
  };
}
