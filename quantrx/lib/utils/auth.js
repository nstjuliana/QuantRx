/**
 * Authentication Utilities
 *
 * Helper functions for checking authentication in API routes.
 *
 * @module lib/utils/auth
 */

import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

/**
 * Gets the current user session from Auth0
 * Verifies authentication by checking if /api/auth/me returns user data
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<{user: Object|null, session: Object|null}>} User and session objects
 */
export async function getSession(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Strict check: Only allow if we find specific Auth0 session cookie patterns
    // Auth0 v4 uses cookies based on the secret hash
    // Common patterns: 'appSession', cookies containing 'auth0', or session-related cookies
    
    // Check for Auth0-specific cookie patterns (strict check)
    const hasAuth0SessionCookie = 
      cookieHeader.includes('appSession') ||  // Default Auth0 session cookie
      cookieHeader.match(/auth0[^=]*=/) ||     // Any cookie starting with 'auth0'
      cookieHeader.match(/a0:[^=]*=/) ||       // Auth0 internal cookies
      cookieHeader.match(/[a-zA-Z0-9_-]+\.session[^=]*=/) || // Session cookies
      // Check for encrypted session cookies (Auth0 encrypts session data)
      (cookieHeader.match(/[A-Za-z0-9_-]{20,}=/) && cookieHeader.split(';').some(c => 
        c.trim().length > 30 && !c.includes('_next') && !c.includes('vercel')
      )); // Long encrypted cookie values (likely Auth0 session)
    
    if (!hasAuth0SessionCookie) {
      return {
        user: null,
        session: null,
      };
    }

    // Found Auth0 session cookie - user is authenticated
    return {
      user: { authenticated: true },
      session: { exists: true },
    };
  } catch (error) {
    return {
      user: null,
      session: null,
    };
  }
}

/**
 * Checks if the request is authenticated
 * Returns 401 if not authenticated
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<NextResponse|null>} Error response if not authenticated, null if authenticated
 */
export async function requireAuth(request) {
  const { user, session } = await getSession(request);

  if (!user || !session) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Authentication required. Please sign in to access this resource.',
      },
      { status: 401 }
    );
  }

  return null; // User is authenticated
}

/**
 * Gets the authenticated user ID from the session
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<string|null>} User ID or null if not authenticated
 */
export async function getUserId(request) {
  const { user } = await getSession(request);
  return user?.sub || user?.id || null;
}
