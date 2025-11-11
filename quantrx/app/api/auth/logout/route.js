/**
 * API Route: /api/auth/logout
 *
 * Handles Auth0 logout flow.
 */

import { auth0 } from '@/lib/auth0';

export async function GET(request) {
  const returnTo = request.nextUrl.searchParams.get('returnTo');
  const federated = request.nextUrl.searchParams.has('federated');

  console.log('[api/auth/logout] Initiating Auth0 logout', {
    returnTo,
    federated,
  });

  const response = await auth0.middleware(request);

  console.log('[api/auth/logout] Logout response', {
    status: response.status,
    location: response.headers.get('location'),
  });

  return response;
}

