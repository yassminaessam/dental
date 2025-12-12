import { NextRequest, NextResponse } from 'next/server';
import { PatientsService } from '@/services/patients';
import { PatientUserSyncService } from '@/services/patient-user-sync';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const patient = await PatientsService.get(id);
    
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Serialize dates
    const serialized = {
      ...patient,
      dob: patient.dob.toISOString(),
      createdAt: patient.createdAt?.toISOString() || null,
    };

    return NextResponse.json({ patient: serialized });
  } catch (error) {
    console.error('[api/patients/[id]] GET error', error);
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Get current patient to check if update affects linked user
    const currentPatient = await PatientsService.get(id);
    if (!currentPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Update the patient
    const updated = await PatientsService.update(id, body);

    // Sync changes to linked user account if applicable
    if (body.email || body.name || body.lastName || body.phone || body.profilePhotoUrl) {
      try {
        await PatientUserSyncService.updateUserFromPatient(id, body);
      } catch (syncError) {
        console.error('[api/patients/[id]] PATCH - User sync error:', syncError);
        // Don't fail the request if sync fails
      }
    }

    // Serialize dates
    const serialized = {
      ...updated,
      dob: updated.dob.toISOString(),
      createdAt: updated.createdAt?.toISOString() || null,
    };

    return NextResponse.json({ patient: serialized });
  } catch (error: any) {
    console.error('[api/patients/[id]] PATCH error', error);
    
    // Check for unique constraint violations
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('phone')) {
        return NextResponse.json({ 
          error: 'A patient with this phone number already exists.',
          field: 'phone'
        }, { status: 409 });
      }
      if (target?.includes('email')) {
        return NextResponse.json({ 
          error: 'A patient with this email already exists.',
          field: 'email'
        }, { status: 409 });
      }
    }
    
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // Check if patient exists
    const patient = await PatientsService.get(id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Soft delete - set status to Inactive
    await PatientsService.update(id, { status: 'Inactive' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/patients/[id]] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
