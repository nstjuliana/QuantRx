/**
 * API Route: /api/test/supabase
 *
 * Tests Supabase connection by attempting a simple query.
 * Returns connection status and any errors.
 * Requires authentication to prevent unauthorized access.
 *
 * @module app/api/test/supabase/route
 */

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/utils/auth';

export async function GET(request) {
  // Check authentication
  const authError = await requireAuth(request);
  if (authError) {
    return authError;
  }
  try {
    // Import Supabase client and env for service role key
    const { supabase } = await import('@/lib/api/supabase');
    const { env } = await import('@/lib/env');
    const { createClient } = await import('@supabase/supabase-js');
    
    // Create a service role client for testing (bypasses RLS)
    // This is safe because we've already verified authentication above
    const serviceRoleClient = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Try a simple query to test connection
    // Use service role to bypass RLS for connection testing
    const { data, error } = await serviceRoleClient
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      // If table doesn't exist, connection still works - just schema not run
      if (error.code === '42P01') {
        return NextResponse.json({
          status: 'connected',
          message: 'Supabase connection successful',
          note: 'Database schema not yet created (run lib/database-schema.sql)',
          error: error.message,
        });
      }
      
      // Check for RLS/permission errors (shouldn't happen with service role, but handle gracefully)
      if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('Unauthorized')) {
        return NextResponse.json({
          status: 'connected',
          message: 'Supabase connection successful',
          note: 'Connection works, but RLS policies may need configuration',
          error: error.message,
        });
      }
      
      // Other errors indicate connection issues
      return NextResponse.json({
        status: 'error',
        message: 'Supabase connection error',
        error: error.message,
        code: error.code,
      }, { status: 500 });
    }
    
    // Success - connection works and table exists
    return NextResponse.json({
      status: 'connected',
      message: 'Supabase connection successful',
      tableExists: true,
    });
  } catch (error) {
    // Check if it's an environment variable error
    const errorMessage = error.message || '';
    if (errorMessage.includes('AUTH0') || errorMessage.includes('SUPABASE') || errorMessage.includes('required')) {
      return NextResponse.json({
        status: 'error',
        message: 'Environment variables not configured',
        error: 'Missing required environment variables. Check .env.local file.',
        details: errorMessage,
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to Supabase',
      error: error.message || 'Unknown error',
    }, { status: 500 });
  }
}
