/**
 * API Route: /api/rxnorm
 *
 * Handles RxNorm API integration for drug normalization.
 * GET: Search for drug information and get RxCUI
 *
 * Query parameters:
 * - name: Drug name to search for (required)
 * - limit: Maximum number of results (optional, default: 10)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchDrugByName, validateDrugName } from '@/lib/api/rxnorm';
import { logEvent } from '@/lib/utils/logger';
import { requireAuth, getUserId } from '@/lib/utils/auth';

// Validation schema for query parameters
const RxNormQuerySchema = z.object({
  name: z.string().min(1, 'Drug name is required'),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10)
});

/**
 * GET /api/rxnorm
 * Searches for drug information using RxNorm API
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<NextResponse>} Response with drug data or error
 */
export async function GET(request) {
  // Check authentication
  const authError = await requireAuth(request);
  if (authError) {
    return authError;
  }

  // Get user ID for logging
  const userId = await getUserId(request);

  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryData = {
      name: searchParams.get('name'),
      limit: searchParams.get('limit') || undefined
    };

    const validationResult = RxNormQuerySchema.safeParse(queryData);

    if (!validationResult.success) {
      logEvent('VALIDATION_ERROR', {
        field: 'query',
        error: validationResult.error.message,
        endpoint: '/api/rxnorm'
      });

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { name, limit } = validationResult.data;

    // Additional validation for drug name
    if (!validateDrugName(name)) {
      logEvent('VALIDATION_ERROR', {
        field: 'drugName',
        error: 'Invalid drug name format',
        drugName: name,
        endpoint: '/api/rxnorm'
      });

      return NextResponse.json(
        {
          error: 'Invalid drug name',
          message: 'Drug name must be at least 2 characters and contain letters'
        },
        { status: 400 }
      );
    }

    // Search for the drug
    const drugData = await searchDrugByName(name, {
      limit,
      userId
    });

    if (!drugData) {
      logEvent('API_NO_RESULTS', {
        drugName: name,
        endpoint: '/api/rxnorm'
      });

      return NextResponse.json(
        {
          error: 'Drug not found',
          message: `No drug found matching "${name}". Try a different spelling or enter an NDC directly.`
        },
        { status: 404 }
      );
    }

    // Log successful search
    logEvent('RXNORM_SEARCH_SUCCESS', {
      drugName: name,
      rxcui: drugData.rxcui,
      endpoint: '/api/rxnorm'
    });

    // Return successful response
    return NextResponse.json({
      success: true,
      data: drugData,
      searchTerm: name
    });

  } catch (error) {
    // Log the error
    logEvent('RXNORM_API_ERROR', {
      error: error.message,
      stack: error.stack,
      endpoint: '/api/rxnorm'
    }, error);

    // Return error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to search for drug information. Please try again later.'
      },
      { status: 500 }
    );
  }
}
