/**
 * API Route: /api/auth/login
 *
 * Handles Auth0 login flow initiation.
 */

import { auth0 } from '@/lib/auth0';
import { NextRequest } from 'next/server';

export async function GET(request) {
  return auth0.middleware(request);
}

