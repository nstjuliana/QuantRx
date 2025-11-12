/**
 * Supabase Client Configuration
 *
 * Configures and exports the Supabase client for database operations.
 * Uses environment variables validated by lib/env.js.
 *
 * @module lib/api/supabase
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../env.js';

// Create and export Supabase client (uses anon key, respects RLS)
export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      // Auth0 handles authentication, so we disable Supabase auth
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create service role client (bypasses RLS, use only for system operations)
// This should only be used for operations that need to bypass RLS, like:
// - Creating user records on first login
// - System-level operations
// - Admin operations
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Export for use in API routes and server components
export default supabase;
