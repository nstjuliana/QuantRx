/**
 * API Route: /api/auth
 *
 * Handles Auth0 authentication callbacks and session management.
 * This route is automatically handled by Auth0 SDK.
 */

import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
