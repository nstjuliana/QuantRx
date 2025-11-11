/**
 * Auth0 Configuration
 *
 * Creates and exports the Auth0 instance for use in API routes and server components.
 * This is required for Auth0 v4 with Next.js App Router.
 *
 * The Auth0Client automatically reads configuration from environment variables:
 * - AUTH0_SECRET
 * - AUTH0_BASE_URL (or AUTH0_ISSUER_BASE_URL)
 * - AUTH0_CLIENT_ID
 * - AUTH0_CLIENT_SECRET
 */

import { Auth0Client } from '@auth0/nextjs-auth0/server';

// Create and export the Auth0 instance
// Configure routes to use /api/auth/* instead of default /auth/*
export const auth0 = new Auth0Client({
  routes: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    callback: '/api/auth/callback',
    profile: '/api/auth/me',
  },
});

