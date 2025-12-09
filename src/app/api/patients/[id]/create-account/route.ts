import { NextRequest, NextResponse } from 'next/server';
import { PatientsService } from '@/services/patients';
import { PatientUserSyncService } from '@/services/patient-user-sync';

/**
 * Create a user account for an existing patient
 * POST /api/patients/[id]/create-account
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { password, email } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Check if patient exists
    let patient = await PatientsService.get(id);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Check if user already exists
    const hasAccount = await PatientUserSyncService.hasUserAccount(id);
    if (hasAccount) {
      return NextResponse.json(
        { error: 'User account already exists for this patient' },
        { status: 409 }
      );
    }

    // If email is provided and different from current, update patient email first
    if (email && email !== patient.email) {
      patient = await PatientsService.update(id, { email });
    }

    // Create user account
    const user = await PatientUserSyncService.createUserFromPatient(
      patient,
      password
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User account created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('[api/patients/[id]/create-account] Error', error);
    return NextResponse.json(
      { error: 'Failed to create user account', details: error.message },
      { status: 500 }
    );
  }
}
