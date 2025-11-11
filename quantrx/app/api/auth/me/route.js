/**
 * API Route: /api/auth/me
 *
 * Returns the current user's profile information from Auth0 session.
 * This endpoint is used by the Auth0 SDK's useUser hook to fetch user data.
 *
 * @module app/api/auth/me/route
 */

import { auth0 } from '@/lib/auth0';

export async function GET(request) {
  let sessionSummary = null;

  try {
    const session = await auth0.getSession();
    sessionSummary = {
      isAuthenticated: Boolean(session),
      hasUser: Boolean(session?.user),
    };
  } catch (error) {
    console.warn('[api/auth/me] Failed to read session before middleware', error);
  }

  if (sessionSummary) {
    console.log('[api/auth/me] Session snapshot', sessionSummary);
  }

  const response = await auth0.middleware(request);

  console.log('[api/auth/me] Response dispatched', {
    status: response.status,
  });

  return response;
}
