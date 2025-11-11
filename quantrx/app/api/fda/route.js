/**
 * API Route: /api/fda
 *
 * Handles FDA NDC Directory API integration.
 * GET: Retrieve NDC information and package sizes
 *
 * Query parameters:
 * - drug: Drug name to search for NDCs
 * - rxcui: RxNorm Concept Unique Identifier
 * - includeInactive: Include inactive NDCs (default: false)
 * - limit: Maximum number of results (default: 50)
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getNDCsByDrugName, getNDCsByRxCUI, validateNDCFormat } from '@/lib/api/fda';
import { logEvent } from '@/lib/utils/logger';
import { requireAuth, getUserId } from '@/lib/utils/auth';

// Validation schema for query parameters
const FDAQuerySchema = z.object({
  drug: z.string().optional(),
  rxcui: z.string().optional(),
  includeInactive: z.string().optional().transform(val => val === 'true'),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 50)
}).refine(
  (data) => data.drug || data.rxcui,
  {
    message: 'Either drug name or RxCUI is required',
    path: ['drug']
  }
);

/**
 * GET /api/fda
 * Retrieves NDC information from FDA Directory API
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<NextResponse>} Response with NDC data or error
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
      drug: searchParams.get('drug') || undefined,
      rxcui: searchParams.get('rxcui') || undefined,
      includeInactive: searchParams.get('includeInactive') || undefined,
      limit: searchParams.get('limit') || undefined
    };

    const validationResult = FDAQuerySchema.safeParse(queryData);

    if (!validationResult.success) {
      logEvent('VALIDATION_ERROR', {
        field: 'query',
        error: validationResult.error.message,
        endpoint: '/api/fda'
      });

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    const { drug, rxcui, includeInactive, limit } = validationResult.data;

    // Search for NDCs
    let result;
    if (drug) {
      result = await getNDCsByDrugName(drug, {
        limit,
        includeInactive,
        userId
      });
    } else if (rxcui) {
      result = await getNDCsByRxCUI(rxcui, {
        includeInactive,
        userId
      });
    }

    if (!result || (result.active.length === 0 && result.inactive.length === 0)) {
      logEvent('API_NO_RESULTS', {
        drug,
        rxcui,
        includeInactive,
        endpoint: '/api/fda'
      });

      return NextResponse.json(
        {
          error: 'No NDCs found',
          message: `No NDCs found for ${drug ? `drug "${drug}"` : `RxCUI "${rxcui}"`}. ${includeInactive ? '' : 'Try including inactive NDCs.'}`
        },
        { status: 404 }
      );
    }

    // Log successful search
    logEvent('FDA_SEARCH_SUCCESS', {
      drug,
      rxcui,
      activeCount: result.active.length,
      inactiveCount: result.inactive.length,
      includeInactive,
      endpoint: '/api/fda'
    });

    // Return successful response
    return NextResponse.json({
      success: true,
      data: result,
      searchParams: {
        drug,
        rxcui,
        includeInactive,
        limit
      }
    });

  } catch (error) {
    // Log the error
    logEvent('FDA_API_ERROR', {
      error: error.message,
      stack: error.stack,
      endpoint: '/api/fda'
    }, error);

    // Return error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve NDC information. Please try again later.'
      },
      { status: 500 }
    );
  }
}
