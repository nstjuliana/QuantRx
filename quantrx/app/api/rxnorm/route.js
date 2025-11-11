/**
 * API Route: /api/rxnorm
 *
 * Handles RxNorm API integration for drug normalization.
 * GET: Search for drug information and get RxCUI
 *
 * TODO: Implement in Phase 1
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: Implement RxNorm API integration in Phase 1
  return NextResponse.json({ message: 'Not implemented yet' }, { status: 501 });
}
