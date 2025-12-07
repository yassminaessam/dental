import { NextRequest, NextResponse } from 'next/server';
import { PatientUserSyncService } from '@/services/patient-user-sync';

/**
 * POST /api/patient/sync-status
 * Sync user isActive status to patient status
 * 
 * Body: { userId: string, isActive: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, isActive } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }

    const patient = await PatientUserSyncService.syncUserStatusToPatient(userId, isActive);

    if (!patient) {
      return NextResponse.json(
        { message: 'No patient record found for this user or user is not a patient' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        name: patient.name,
        status: patient.status,
      },
    });
  } catch (error) {
    console.error('[api/patient/sync-status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to sync patient status' },
      { status: 500 }
    );
  }
}
