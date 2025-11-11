/**
 * Auth0 Configuration
 *
 * Creates and exports the Auth0 instance for use in API routes and server components.
 * This is required for Auth0 v4 with Next.js App Router.
 *
 * Reads configuration from environment variables:
 * - AUTH0_SECRET
 * - AUTH0_BASE_URL (maps to appBaseUrl)
 * - AUTH0_ISSUER_BASE_URL (extract domain from this URL)
 * - AUTH0_CLIENT_ID
 * - AUTH0_CLIENT_SECRET
 */

import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { env } from './env';

// Extract domain from issuer URL (e.g., https://dev-abc123.auth0.com -> dev-abc123.auth0.com)
const extractDomain = (issuerUrl) => {
  try {
    const url = new URL(issuerUrl);
    return url.hostname;
  } catch (error) {
    throw new Error(`Invalid AUTH0_ISSUER_BASE_URL: ${issuerUrl}`);
  }
};

// Create and export the Auth0 instance
// Configure routes to use /api/auth/* instead of default /auth/*
export const auth0 = new Auth0Client({
  domain: extractDomain(env.AUTH0_ISSUER_BASE_URL),
  appBaseUrl: env.AUTH0_BASE_URL,
  clientId: env.AUTH0_CLIENT_ID,
  clientSecret: env.AUTH0_CLIENT_SECRET,
  secret: env.AUTH0_SECRET,
  routes: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    callback: '/api/auth/callback',
    profile: '/api/auth/me',
  },
});

