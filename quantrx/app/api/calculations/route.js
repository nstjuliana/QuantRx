/**
 * API Route: /api/calculations
 *
 * Handles calculation creation and retrieval.
 * POST: Create new calculation
 * GET: Retrieve calculations (with query params for filtering)
 *
 * @module app/api/calculations/route
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runCalculation } from '@/lib/services/calculation-service.js';
import { CalculationInputSchema } from '@/schemas/calculation.js';
import { requireAuth, getUserId, getSession } from '@/lib/utils/auth.js';
import { logCalculationCreated } from '@/lib/utils/audit.js';
import { logEvent } from '@/lib/utils/logger.js';
import supabase, { supabaseAdmin } from '@/lib/api/supabase.js';

/**
 * GET /api/calculations
 * Retrieves calculations with optional filtering
 *
 * Query parameters:
 * - limit: Maximum number of results (default: 10)
 * - offset: Pagination offset (default: 0)
 * - status: Filter by status ('pending', 'verified')
 * - sortBy: Sort field ('created_at', 'updated_at', default: 'created_at')
 * - sortOrder: Sort order ('asc', 'desc', default: 'desc')
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<NextResponse>} Response with calculations array or error
 */
export async function GET(request) {
  try {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User ID not found' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100); // Max 100
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // 'pending', 'verified', or null
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate query parameters
    const validSortFields = ['created_at', 'updated_at'];
    const validSortOrders = ['asc', 'desc'];
    const validStatuses = ['pending', 'verified'];

    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: 'Invalid Parameter', message: `sortBy must be one of: ${validSortFields.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validSortOrders.includes(sortOrder)) {
      return NextResponse.json(
        { error: 'Invalid Parameter', message: `sortOrder must be one of: ${validSortOrders.join(', ')}` },
        { status: 400 }
      );
    }

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid Parameter', message: `status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Get user's calculations from database
    let query = supabase
      .from('calculations')
      .select(`
        id,
        drug_name,
        ndc,
        sig,
        days_supply,
        calculated_quantity,
        rxcui,
        recommended_ndc,
        alternatives,
        warnings,
        status,
        verified_by,
        verified_at,
        created_at,
        updated_at
      `)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: calculations, error: dbError } = await query;

    if (dbError) {
      logEvent('API_ERROR', {
        operation: 'GET_CALCULATIONS',
        error: dbError.message,
        userId
      });

      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to retrieve calculations' },
        { status: 500 }
      );
    }

    // Log successful retrieval
    logEvent('CALCULATION_LIST_RETRIEVED', {
      count: calculations?.length || 0,
      filters: { status, limit, offset },
      userId
    });

    return NextResponse.json({
      success: true,
      data: calculations || [],
      meta: {
        limit,
        offset,
        total: calculations?.length || 0,
        hasMore: (calculations?.length || 0) === limit
      }
    });

  } catch (error) {
    logEvent('API_ERROR', {
      operation: 'GET_CALCULATIONS',
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calculations
 * Creates a new calculation record
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<NextResponse>} Response with calculation data or error
 */
export async function POST(request) {
  try {
    // Check authentication
    const authError = await requireAuth(request);
    if (authError) {
      return authError;
    }

    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User ID not found' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON', message: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }

    // Validate input with Zod schema
    const validationResult = CalculationInputSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.format();

      // Log validation errors
      logEvent('VALIDATION_ERROR', {
        operation: 'CREATE_CALCULATION',
        errors: validationResult.error.errors,
        userId
      });

      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid input data',
          details: errors
        },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Log calculation start
    logEvent('CALCULATION_STARTED', {
      input,
      userId
    });

    // Debug: Log input being sent to calculation service
    console.log('[API] ===== CALCULATION REQUEST START =====');
    console.log('[API] Input received:', JSON.stringify(input, null, 2));
    console.log('[API] User ID:', userId);

    // Call calculation service
    let calculationResult;
    try {
      console.log('[API] Calling runCalculation...');
      calculationResult = await runCalculation(input, { userId });
      console.log('[API] runCalculation completed successfully');
    } catch (serviceError) {
      // If the service itself throws an error
      console.error('[API] ===== CALCULATION SERVICE THREW ERROR =====');
      console.error('[API] Error type:', serviceError.constructor.name);
      console.error('[API] Error message:', serviceError.message);
      console.error('[API] Error stack:', serviceError.stack);
      console.error('[API] Full error object:', JSON.stringify(serviceError, Object.getOwnPropertyNames(serviceError), 2));
      
      logEvent('CALCULATION_SERVICE_ERROR', {
        input,
        error: serviceError.message,
        stack: serviceError.stack,
        userId
      });

      return NextResponse.json(
        {
          error: 'Calculation Service Error',
          message: `Calculation service failed: ${serviceError.message}`,
          details: { step: 'service_execution' }
        },
        { status: 500 }
      );
    }

    // Comprehensive debug logging
    console.log('[API] ===== CALCULATION RESULT RECEIVED =====');
    console.log('[API] Calculation result (full):', JSON.stringify(calculationResult, null, 2));
    console.log('[API] Calculation result type:', typeof calculationResult);
    console.log('[API] Calculation result is null?', calculationResult === null);
    console.log('[API] Calculation result is undefined?', calculationResult === undefined);
    if (calculationResult) {
      console.log('[API] Calculation result.status:', calculationResult.status);
      console.log('[API] Calculation result.success:', calculationResult.success);
      console.log('[API] Calculation result.error:', calculationResult.error);
      console.log('[API] Calculation result.error type:', typeof calculationResult.error);
      if (calculationResult.error) {
        console.log('[API] Calculation result.error (stringified):', JSON.stringify(calculationResult.error, null, 2));
      }
      console.log('[API] Calculation result.message:', calculationResult.message);
      console.log('[API] Calculation result keys:', Object.keys(calculationResult || {}));
    }

    // Check if calculation succeeded
    console.log('[API] ===== CHECKING CALCULATION RESULT =====');
    console.log('[API] !calculationResult:', !calculationResult);
    console.log('[API] calculationResult.status === "error":', calculationResult?.status === 'error');
    console.log('[API] calculationResult.success === false:', calculationResult?.success === false);
    
    if (!calculationResult || calculationResult.status === 'error' || calculationResult.success === false) {
      console.log('[API] ===== CALCULATION FAILED - EXTRACTING ERROR =====');
      
      // Extract error message from various possible structures
      let errorMessage = 'Unable to complete calculation';
      let errorType = 'unknown_error';
      let errorContext = null;

      console.log('[API] calculationResult.error exists?', !!calculationResult?.error);
      console.log('[API] calculationResult.error type:', typeof calculationResult?.error);
      console.log('[API] calculationResult.warnings exists?', !!calculationResult?.warnings);
      console.log('[API] calculationResult.warnings:', JSON.stringify(calculationResult?.warnings, null, 2));
      
      if (calculationResult?.error) {
        if (typeof calculationResult.error === 'string') {
          console.log('[API] Error is string:', calculationResult.error);
          errorMessage = calculationResult.error;
        } else if (calculationResult.error.message) {
          console.log('[API] Error has message property:', calculationResult.error.message);
          console.log('[API] Error has type property:', calculationResult.error.type);
          console.log('[API] Error has context property:', calculationResult.error.context);
          errorMessage = calculationResult.error.message;
          errorType = calculationResult.error.type || 'unknown_error';
          errorContext = calculationResult.error.context || null;
        } else {
          console.log('[API] Error object structure:', JSON.stringify(calculationResult.error, null, 2));
          errorMessage = JSON.stringify(calculationResult.error);
        }
      } else if (calculationResult?.warnings && Array.isArray(calculationResult.warnings)) {
        // Extract error from warnings array if no explicit error property
        const errorWarnings = calculationResult.warnings.filter(w => w.severity === 'error');
        if (errorWarnings.length > 0) {
          console.log('[API] Found error in warnings array:', JSON.stringify(errorWarnings, null, 2));
          const firstError = errorWarnings[0];
          errorMessage = firstError.message || 'An error occurred during calculation';
          errorType = firstError.type || 'unknown_error';
          errorContext = firstError.data || null;
          console.log('[API] Extracted error message from warnings:', errorMessage);
          console.log('[API] Extracted error type from warnings:', errorType);
        } else {
          console.log('[API] No error-level warnings found');
        }
      } else if (calculationResult?.message) {
        console.log('[API] Using calculationResult.message:', calculationResult.message);
        errorMessage = calculationResult.message;
      } else {
        console.log('[API] No error found in expected locations, using default message');
      }

      console.log('[API] Final error message:', errorMessage);
      console.log('[API] Final error type:', errorType);
      console.log('[API] Final error context:', errorContext);

      logEvent('CALCULATION_FAILED', {
        input,
        error: errorMessage,
        errorType,
        calculationResult: JSON.stringify(calculationResult),
        userId
      });

      console.log('[API] ===== RETURNING ERROR RESPONSE =====');
      console.log('[API] Response payload:', JSON.stringify({
        error: 'Calculation Failed',
        message: errorMessage,
        details: errorContext,
        errorType
      }, null, 2));

      return NextResponse.json(
        {
          error: 'Calculation Failed',
          message: errorMessage,
          details: errorContext,
          errorType
        },
        { status: 400 }
      );
    }

    console.log('[API] ===== CALCULATION SUCCEEDED =====');

    // Get user info for database record
    let { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('auth0_id', userId)
      .single();

    // If user doesn't exist, create them automatically
    if (userError || !userRecord) {
      console.log('[API] User record not found, creating new user...');
      console.log('[API] UserError code:', userError?.code);
      console.log('[API] UserError message:', userError?.message);
      console.log('[API] UserId:', userId);
      
      // Get user email from Auth0 session
      const { user: auth0User } = await getSession(request);
      const userEmail = auth0User?.email || auth0User?.name || 'unknown@example.com';
      
      console.log('[API] Creating user with:', {
        auth0_id: userId,
        email: userEmail
      });

      // Create user record (default role is 'technician')
      // Use admin client to bypass RLS for user creation (system operation)
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          auth0_id: userId,
          email: userEmail,
          role: 'technician'
        })
        .select('id, email')
        .single();

      if (createError) {
        // If user already exists (unique constraint violation), try to fetch again
        if (createError.code === '23505' || createError.message?.includes('duplicate') || createError.message?.includes('unique')) {
          console.log('[API] User already exists, fetching again...');
          // Use admin client to fetch user (bypasses RLS)
          const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('id, email')
            .eq('auth0_id', userId)
            .single();
          
          if (fetchError || !existingUser) {
            console.error('[API] Failed to fetch existing user:', fetchError);
      logEvent('API_ERROR', {
        operation: 'CREATE_CALCULATION',
              error: 'Failed to fetch user record after creation attempt',
              userId,
              fetchError: fetchError?.message
      });

      return NextResponse.json(
              { error: 'User Error', message: 'Failed to retrieve user record' },
        { status: 500 }
      );
          }
          
          console.log('[API] Found existing user:', existingUser);
          userRecord = existingUser;
        } else {
          console.error('[API] Failed to create user:', createError);
          logEvent('API_ERROR', {
            operation: 'CREATE_CALCULATION',
            error: 'Failed to create user record',
            userId,
            createError: createError?.message,
            createErrorCode: createError?.code
          });

          return NextResponse.json(
            { error: 'User Error', message: 'Failed to create user record' },
            { status: 500 }
          );
        }
      } else if (newUser) {
        console.log('[API] User created successfully:', newUser);
        userRecord = newUser;
      } else {
        console.error('[API] User creation returned no data');
        return NextResponse.json(
          { error: 'User Error', message: 'Failed to create user record' },
          { status: 500 }
        );
      }
    } else {
      console.log('[API] User record found:', userRecord);
    }

    // Prepare database record
    // If using direct quantity, provide a placeholder SIG since database requires it
    const sigValue = input.sig || (input.quantity ? 'Direct quantity entry' : null);
    
    const dbRecord = {
      user_id: userRecord.id,
      drug_name: input.drugName || null,
      ndc: input.ndc || null,
      sig: sigValue, // Use placeholder if direct quantity was used
      days_supply: input.daysSupply || null,
      calculated_quantity: calculationResult.calculation?.calculatedQuantity || null,
      rxcui: calculationResult.normalization?.rxcui || null,
      recommended_ndc: calculationResult.recommendation ? JSON.stringify(calculationResult.recommendation.ndc) : null,
      alternatives: calculationResult.alternatives ? JSON.stringify(calculationResult.alternatives) : null,
      warnings: calculationResult.warnings ? JSON.stringify(calculationResult.warnings) : null,
      status: 'pending'
    };
    
    console.log('[API] Database record sig value:', sigValue);
    console.log('[API] Input quantity:', input.quantity);
    console.log('[API] Calculation result quantity:', calculationResult.calculation?.calculatedQuantity);

    console.log('[API] Preparing to insert calculation record...');
    console.log('[API] Database record:', JSON.stringify(dbRecord, null, 2));

    // Insert into database
    // Use admin client to bypass RLS since we've already verified authentication via Auth0
    // The RLS policy checks Auth0 JWT claims which aren't available with the anon key
    const { data: insertedRecord, error: insertError } = await supabaseAdmin
      .from('calculations')
      .insert(dbRecord)
      .select('id, created_at')
      .single();

    console.log('[API] Insert result - error?', !!insertError);
    console.log('[API] Insert result - data?', !!insertedRecord);

    if (insertError) {
      console.error('[API] Failed to insert calculation:', insertError);
      console.error('[API] Insert error code:', insertError.code);
      console.error('[API] Insert error message:', insertError.message);
      console.error('[API] Insert error details:', insertError.details);
      console.error('[API] Insert error hint:', insertError.hint);
      
      logEvent('API_ERROR', {
        operation: 'CREATE_CALCULATION',
        error: insertError.message,
        errorCode: insertError.code,
        errorDetails: insertError.details,
        userId
      });

      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to save calculation', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('[API] Calculation saved successfully:', insertedRecord);

    // Log successful creation (don't await - fire and forget, shouldn't block response)
    logCalculationCreated(insertedRecord.id, userRecord.id).catch(err => {
      console.error('[API] Failed to create audit log (non-blocking):', err);
    });

    // Prepare response
    const response = {
      success: true,
      data: {
        id: insertedRecord.id,
        timestamp: insertedRecord.created_at,
        user: {
          id: userRecord.id,
          name: userRecord.email, // Use email as display name for now
          role: 'technician' // Default role, will be updated when roles are implemented
        },
        inputs: input,
        normalization: calculationResult.normalization,
        activeNDCs: calculationResult.activeNDCs || [],
        inactiveNDCs: calculationResult.inactiveNDCs || [],
        calculation: calculationResult.calculation,
        recommendation: calculationResult.recommendation,
        alternatives: calculationResult.alternatives || [],
        warnings: calculationResult.warnings || [],
        status: calculationResult.status
      }
    };

    // Log successful completion
    logEvent('CALCULATION_COMPLETED', {
      calculationId: insertedRecord.id,
      status: calculationResult.status,
      userId
    });

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    logEvent('API_ERROR', {
      operation: 'CREATE_CALCULATION',
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
