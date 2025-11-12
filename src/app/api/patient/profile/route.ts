import { NextRequest, NextResponse } from 'next/server';
import { PatientsService } from '@/services/patients';
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
    const { patientId, ...updates } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required.' }, { status: 400 });
    }

    // Update patient profile
    const updatedPatient = await PatientsService.update(patientId, updates);

    // Serialize dates
    const serialized = {
      ...updatedPatient,
      dob: updatedPatient.dob.toISOString(),
    };

    return NextResponse.json({ patient: serialized });
  } catch (error) {
    console.error('[api/patient/profile] PATCH error', error);
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

    // Delete patient
    await PatientsService.remove(patientId);

    return NextResponse.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('[api/patient/profile] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete patient.' }, { status: 500 });
  }
}
