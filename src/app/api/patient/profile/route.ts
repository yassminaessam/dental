import { NextRequest, NextResponse } from 'next/server';
import { PatientsService } from '@/services/patients';
import { PatientUserSyncService } from '@/services/patient-user-sync';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const patientId = searchParams.get('patientId');

    if (!email && !patientId) {
      return NextResponse.json({ error: 'Email or patientId is required.' }, { status: 400 });
    }

    // Find patient by email or ID
    let patient = null;
    
    if (patientId) {
      patient = await PatientsService.get(patientId);
    } else if (email) {
      const patientRecord = await prisma.patient.findUnique({ where: { email } });
      if (patientRecord) {
        patient = await PatientsService.get(patientRecord.id);
      }
    }

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found.' }, { status: 404 });
    }

    // Serialize dates
    const serialized = {
      ...patient,
      dob: patient.dob.toISOString(),
    };

    return NextResponse.json({ patient: serialized });
  } catch (error) {
    console.error('[api/patient/profile] GET error', error);
    return NextResponse.json({ error: 'Failed to load patient profile.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, createUserAccount, userPassword, ...updates } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required.' }, { status: 400 });
    }

    // Get current patient to check if status is changing
    const currentPatient = await PatientsService.get(patientId);
    const statusChanged = currentPatient && updates.status && currentPatient.status !== updates.status;

    // Update patient profile
    const updatedPatient = await PatientsService.update(patientId, updates);

    // Sync user account if patient has one
    await PatientUserSyncService.updateUserFromPatient(patientId, updates);

    // If status changed, sync to user account
    if (statusChanged && updates.status) {
      await PatientUserSyncService.syncPatientStatusToUser(patientId, updates.status);
      console.log(`[api/patient/profile] Synced patient status ${updates.status} to user account`);
    }

    // If creating new user account
    if (createUserAccount && userPassword && userPassword.trim().length > 0) {
      const hasAccount = await PatientUserSyncService.hasUserAccount(patientId);
      if (!hasAccount) {
        const user = await PatientUserSyncService.createUserFromPatient(updatedPatient, userPassword);
        if (user) {
          console.log(`[api/patient/profile] Created user account for patient ${updatedPatient.email}`);
        }
      }
    }

    // Update user password if provided and user exists
    if (userPassword && !createUserAccount) {
      const user = await PatientUserSyncService.getUserForPatient(patientId);
      if (user) {
        const { UsersService } = await import('@/services/users');
        await UsersService.update(user.id, { password: userPassword });
        console.log(`[api/patient/profile] Updated password for user ${user.email}`);
      }
    }

    // Serialize dates
    const serialized = {
      ...updatedPatient,
      dob: updatedPatient.dob.toISOString(),
    };

    return NextResponse.json({ patient: serialized });
  } catch (error: any) {
    console.error('[api/patient/profile] PATCH error', error);
    
    // Check for unique constraint violations
    if (error?.code === 'P2002') {
      const target = error?.meta?.target;
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
    
    return NextResponse.json({ error: 'Failed to update patient profile.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required.' }, { status: 400 });
    }

    // First, delete associated user account if exists
    const userDeleted = await PatientUserSyncService.deleteUserForPatient(patientId);
    console.log(`[api/patient/profile] User account deleted: ${userDeleted}`);

    // Delete patient
    await PatientsService.remove(patientId);

    return NextResponse.json({ 
      success: true, 
      message: 'Patient deleted successfully',
      userDeleted 
    });
  } catch (error) {
    console.error('[api/patient/profile] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete patient.' }, { status: 500 });
  }
}
