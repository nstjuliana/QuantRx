/**
 * API Route: /api/auth/logout
 *
 * Handles Auth0 logout flow.
 */

import { auth0 } from '@/lib/auth0';
import { NextRequest } from 'next/server';

export async function GET(request) {
  return auth0.middleware(request);
}

