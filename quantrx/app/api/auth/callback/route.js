/**
 * API Route: /api/auth/callback
 *
 * Handles Auth0 callback after authentication.
 * The Auth0 middleware handles session creation and redirect automatically.
 */

import { auth0 } from '@/lib/auth0';
import { NextRequest } from 'next/server';

export async function GET(request) {
  // Auth0 middleware handles:
  // 1. Processing the OAuth callback
  // 2. Creating the session cookie
  // 3. Redirecting to the returnTo URL or home page
  return auth0.middleware(request);
}

