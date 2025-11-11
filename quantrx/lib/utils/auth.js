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
 * Uses Auth0's built-in session verification for reliable authentication checking
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<{user: Object|null, session: Object|null}>} User and session objects
 */
export async function getSession(request) {
  try {
    // Use Auth0's built-in session verification
    // This works reliably in both local and production environments
    let session = null;

    try {
      if (request) {
        session = await auth0.getSession(request);
      } else {
        session = await auth0.getSession();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[lib/utils/auth] Falling back to cookie-scoped session lookup', {
          message: error.message,
        });
      }

      session = await auth0.getSession();
    }
    
    if (!session || !session.user) {
      return {
        user: null,
        session: null,
      };
    }

    // Return the actual session data from Auth0
    return {
      user: session.user,
      session: session,
    };
  } catch (error) {
    // If session verification fails, user is not authenticated
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
    if (process.env.NODE_ENV === 'development') {
      console.warn('[requireAuth] Unauthorized access attempt', {
        hasUser: Boolean(user),
        hasSession: Boolean(session),
      });
    }

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
 * @returns {Promise<string|null>} User ID (Auth0 sub) or null if not authenticated
 */
export async function getUserId(request) {
  const { user } = await getSession(request);
  // Auth0 user object has 'sub' field which is the unique user identifier
  return user?.sub || null;
}
