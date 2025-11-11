/**
 * Next.js Middleware
 *
 * Route protection middleware using Auth0.
 * For Phase 0, we use a simple pass-through approach.
 * Full Auth0 middleware protection will be implemented in Phase 1.
 *
 * @module middleware
 */

import { NextResponse } from 'next/server';

export function middleware(request) {
  // For Phase 0, we allow all routes through
  // Authentication is handled at the page/component level
  // Full middleware protection will be added in Phase 1
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
