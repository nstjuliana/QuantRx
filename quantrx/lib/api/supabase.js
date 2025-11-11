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

// Create and export Supabase client
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

// Export for use in API routes and server components
export default supabase;
