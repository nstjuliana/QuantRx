/**
 * API Route: /api/auth/callback
 *
 * Handles Auth0 callback after authentication.
 * The Auth0 middleware handles session creation and redirect automatically.
 */

import { auth0 } from '@/lib/auth0';

export async function GET(request) {
  const state = request.nextUrl.searchParams.get('state');
  const code = request.nextUrl.searchParams.get('code');
  const returnTo = request.nextUrl.searchParams.get('returnTo');

  console.log('[api/auth/callback] Received Auth0 callback', {
    hasCode: Boolean(code),
    hasState: Boolean(state),
    returnTo,
    pathname: request.nextUrl.pathname,
  });

  const response = await auth0.middleware(request);

  console.log('[api/auth/callback] Completed Auth0 callback', {
    status: response.status,
    location: response.headers.get('location'),
  });

  return response;
}

