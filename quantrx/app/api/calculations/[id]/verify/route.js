/**
 * Verification API Route: /api/calculations/[id]/verify
 *
 * Handles verification of calculations by pharmacists and administrators.
 * POST: Mark a calculation as verified
 *
 * @module app/api/calculations/[id]/verify/route
 */

import { NextResponse } from 'next/server';
import { requireAuth, getUserId } from '@/lib/utils/auth.js';
import { logAudit } from '@/lib/utils/audit.js';
import { logEvent } from '@/lib/utils/logger.js';
import supabase from '@/lib/api/supabase.js';

/**
 * POST /api/calculations/[id]/verify
 * Marks a calculation as verified by a pharmacist or administrator
 *
 * @param {Request} request - Next.js request object
 * @param {Object} params - Route parameters
 * @param {string} params.id - Calculation ID to verify
 * @returns {Promise<NextResponse>} Response with verification result or error
 */
export async function POST(request, { params }) {
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

    const calculationId = params.id;

    // Validate calculation ID format (UUID)
    if (!calculationId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(calculationId)) {
      return NextResponse.json(
        { error: 'Invalid ID', message: 'Calculation ID must be a valid UUID' },
        { status: 400 }
      );
    }

    // Check user role - only pharmacists and admins can verify
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('auth0_id', userId)
      .single();

    if (userError || !userRecord) {
      logEvent('API_ERROR', {
        operation: 'VERIFY_CALCULATION',
        error: 'User record not found',
        userId,
        calculationId
      });

      return NextResponse.json(
        { error: 'User Error', message: 'User record not found' },
        { status: 500 }
      );
    }

    // Check if user has permission to verify (pharmacist or admin)
    if (!['pharmacist', 'admin'].includes(userRecord.role)) {
      logEvent('PERMISSION_DENIED', {
        operation: 'VERIFY_CALCULATION',
        userId,
        userRole: userRecord.role,
        calculationId
      });

      // Log audit event for permission denial
      await logAudit(
        'CALCULATION_VERIFY_ATTEMPT_DENIED',
        'CALCULATION',
        calculationId,
        {
          reason: 'Insufficient permissions',
          userRole: userRecord.role,
          requiredRoles: ['pharmacist', 'admin']
        },
        userId
      );

      return NextResponse.json(
        { error: 'Forbidden', message: 'Only pharmacists and administrators can verify calculations' },
        { status: 403 }
      );
    }

    // Check if calculation exists and belongs to user or user can verify all
    const { data: calculation, error: calcError } = await supabase
      .from('calculations')
      .select('id, user_id, status, verified_by, verified_at')
      .eq('id', calculationId)
      .single();

    if (calcError || !calculation) {
      logEvent('API_ERROR', {
        operation: 'VERIFY_CALCULATION',
        error: 'Calculation not found',
        userId,
        calculationId
      });

      return NextResponse.json(
        { error: 'Not Found', message: 'Calculation not found' },
        { status: 404 }
      );
    }

    // Check if calculation is already verified
    if (calculation.status === 'verified') {
      return NextResponse.json(
        { error: 'Already Verified', message: 'This calculation is already verified' },
        { status: 409 }
      );
    }

    // Verify the calculation
    const verificationData = {
      status: 'verified',
      verified_by: userRecord.id,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: updatedCalculation, error: updateError } = await supabase
      .from('calculations')
      .update(verificationData)
      .eq('id', calculationId)
      .select('id, verified_by, verified_at, updated_at')
      .single();

    if (updateError) {
      logEvent('API_ERROR', {
        operation: 'VERIFY_CALCULATION',
        error: updateError.message,
        userId,
        calculationId
      });

      return NextResponse.json(
        { error: 'Database Error', message: 'Failed to verify calculation' },
        { status: 500 }
      );
    }

    // Log successful verification
    logEvent('CALCULATION_VERIFIED', {
      calculationId,
      verifiedBy: userRecord.id,
      userId
    });

    // Log audit event
    await logAudit(
      'CALCULATION_VERIFIED',
      'CALCULATION',
      calculationId,
      {
        verifiedBy: userRecord.id,
        previousStatus: calculation.status,
        newStatus: 'verified'
      },
      userId
    );

    return NextResponse.json({
      success: true,
      message: 'Calculation verified successfully',
      data: {
        id: updatedCalculation.id,
        verifiedBy: updatedCalculation.verified_by,
        verifiedAt: updatedCalculation.verified_at,
        updatedAt: updatedCalculation.updated_at
      }
    });

  } catch (error) {
    logEvent('API_ERROR', {
      operation: 'VERIFY_CALCULATION',
      error: error.message,
      stack: error.stack,
      calculationId: params?.id
    });

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
