import { NextRequest, NextResponse } from 'next/server';
import { PatientUserSyncService } from '@/services/patient-user-sync';

/**
 * Check if a patient has a user account
 * GET /api/patients/[id]/check-account
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check if user account exists for this patient
    const hasAccount = await PatientUserSyncService.hasUserAccount(id);

    return NextResponse.json({
      hasAccount,
      patientId: id
    });
  } catch (error: any) {
    console.error('[api/patients/[id]/check-account] Error', error);
    return NextResponse.json(
      { error: 'Failed to check account status', details: error.message },
      { status: 500 }
    );
  }
}
