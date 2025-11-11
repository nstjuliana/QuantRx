/**
 * API Route: /api/auth/me
 *
 * Returns the current user's profile information from Auth0 session.
 * This endpoint is used by the Auth0 SDK's useUser hook to fetch user data.
 *
 * @module app/api/auth/me/route
 */

import { auth0 } from '@/lib/auth0';
import { NextRequest } from 'next/server';

export async function GET(request) {
  // Auth0 middleware handles fetching the session and returning user data
  // The useUser hook calls this endpoint to get the current user
  return auth0.middleware(request);
}
