/**
 * API Route: /api/test/supabase
 *
 * Tests Supabase connection by attempting a simple query.
 * Returns connection status and any errors.
 *
 * @module app/api/test/supabase/route
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Import Supabase client (will fail if env vars are missing)
    const { supabase } = await import('@/lib/api/supabase');
    
    // Try a simple query to test connection
    // We'll query a table that should exist (users) or handle the error gracefully
    const { data, error } = await supabase
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
