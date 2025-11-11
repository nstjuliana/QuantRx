/**
 * API Route: /api/auth/login
 *
 * Handles Auth0 login flow initiation.
 */

import { auth0 } from '@/lib/auth0';

export async function GET(request) {
  const returnTo = request.nextUrl.searchParams.get('returnTo');

  console.log('[api/auth/login] Initiating Auth0 login', {
    returnTo,
    pathname: request.nextUrl.pathname,
  });

  return auth0.middleware(request);
}

