import { NextRequest, NextResponse } from 'next/server';
import { PatientUserSyncService } from '@/services/patient-user-sync';

/**
 * Admin endpoint to sync patients and users
 * POST - Run synchronization to create missing patient records for patient role users
 */
export async function POST(request: NextRequest) {
  try {
    const result = await PatientUserSyncService.syncExistingPatientsAndUsers();

    return NextResponse.json({
      success: true,
      message: 'Synchronization completed',
      result: {
        patientsCreated: result.patientsCreated,
        usersLinked: result.usersLinked,
        errors: result.errors
      }
    });
  } catch (error: any) {
    console.error('[api/admin/sync-patients-users] Error', error);
    return NextResponse.json(
      { error: 'Failed to sync patients and users', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Check sync status
 */
export async function GET(request: NextRequest) {
  try {
    // This would check how many users/patients need syncing
    // For now, return a simple status
    return NextResponse.json({
      message: 'Sync endpoint ready. Use POST to run synchronization.'
    });
  } catch (error: any) {
    console.error('[api/admin/sync-patients-users] Error', error);
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    );
  }
}
