/**
 * API Route: /api/auth/me
 *
 * Returns the current user's profile information from Auth0 session.
 * This endpoint is used by the Auth0 SDK to get user data.
 * Note: The client-side useUser hook gets data from Auth0Provider context,
 * but this endpoint provides server-side access to user data.
 *
 * @module app/api/auth/me/route
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // For Phase 0, return a simple response
  // The handleAuth() should handle this, but if it doesn't, this provides a fallback
  // In production, this would use getSession to return actual user data
  // For now, return 401 if not authenticated (client will handle via useUser hook)
  
  // Note: The client-side Auth0Provider and useUser hook handle user data
  // This endpoint is mainly for server-side access if needed
  return NextResponse.json(
    { message: 'Use client-side useUser hook for user data' },
    { status: 200 }
  );
}
