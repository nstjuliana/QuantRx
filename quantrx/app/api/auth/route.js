/**
 * API Route: /api/auth
 *
 * This route is not used directly. Auth0 routes are handled by:
 * - /api/auth/login - Login initiation
 * - /api/auth/logout - Logout
 * - /api/auth/callback - OAuth callback
 * - /api/auth/me - User profile (handled by Auth0 SDK)
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Auth0 routes are available at /api/auth/login, /api/auth/logout, and /api/auth/callback',
  });
}
