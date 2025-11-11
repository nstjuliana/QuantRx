/**
 * Auth Profile Route
 *
 * Handles /auth/profile requests by redirecting to the correct Auth0 endpoint.
 * The Auth0 SDK's handleAuth() automatically provides /api/auth/me for user profile.
 * This route resolves 404 errors from client-side requests.
 *
 * @module app/auth/profile/route
 */

import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function GET(request) {
  // Determine the correct origin to avoid hard-coded localhost redirects
  const fallbackOrigin = request.nextUrl?.origin ?? env.AUTH0_BASE_URL;
  const profileUrl = new URL('/api/auth/me', env.AUTH0_BASE_URL || fallbackOrigin);

  console.log('[auth/profile] Redirecting to profile endpoint', {
    requestOrigin: request.nextUrl?.origin,
    target: profileUrl.toString(),
  });

  return NextResponse.redirect(profileUrl, 307);
}
