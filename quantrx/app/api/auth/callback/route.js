/**
 * API Route: /api/auth/callback
 *
 * Handles Auth0 callback after authentication.
 */

import { auth0 } from '@/lib/auth0';
import { NextRequest } from 'next/server';

export async function GET(request) {
  return auth0.middleware(request);
}

