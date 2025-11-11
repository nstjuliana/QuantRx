/**
 * Environment variable validation with Zod schema
 *
 * This file validates all required environment variables at application startup.
 * If any required variables are missing or invalid, the application will fail fast
 * with clear error messages.
 *
 * @module lib/env
 */

import { z } from 'zod';

const envSchema = z.object({
  AUTH0_SECRET: z.string().min(1, 'AUTH0_SECRET is required'),
  AUTH0_BASE_URL: z.string().url('AUTH0_BASE_URL must be a valid URL'),
  AUTH0_ISSUER_BASE_URL: z.string().min(1, 'AUTH0_ISSUER_BASE_URL is required'),
  AUTH0_CLIENT_ID: z.string().min(1, 'AUTH0_CLIENT_ID is required'),
  AUTH0_CLIENT_SECRET: z.string().min(1, 'AUTH0_CLIENT_SECRET is required'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
});

const computedEnv = {
  ...process.env,
  // In Vercel deployments, derive AUTH0_BASE_URL from VERCEL_URL if not explicitly set
  AUTH0_BASE_URL:
    process.env.AUTH0_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
};

// Parse and export - will throw error if validation fails
export const env = envSchema.parse(computedEnv);
