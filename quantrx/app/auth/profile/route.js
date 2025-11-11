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

export async function GET() {
  // Redirect to the correct Auth0 profile endpoint
  // The handleAuth() in /api/auth/route.js provides /api/auth/me
  return NextResponse.redirect(new URL('/api/auth/me', process.env.AUTH0_BASE_URL || 'http://localhost:3000'), 307);
}
