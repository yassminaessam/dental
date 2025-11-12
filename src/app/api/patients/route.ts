import { NextRequest, NextResponse } from 'next/server';
import { PatientsService } from '@/services/patients';
import { PatientUserSyncService } from '@/services/patient-user-sync';

interface PatientCreatePayload {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address?: string;
  ecName?: string;
  ecPhone?: string;
  ecRelationship?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  medicalHistory?: any;
  createUserAccount?: boolean; // Optional flag to create user account
  userPassword?: string; // Password for user account if createUserAccount is true
}

export async function GET(request: NextRequest) {
  try {
    const patients = await PatientsService.list();
    
    // Serialize dates
    const serialized = patients.map(p => ({
      ...p,
      dob: p.dob.toISOString(),
    }));

    return NextResponse.json({ patients: serialized });
  } catch (error) {
    console.error('[api/patients] GET error', error);
    return NextResponse.json({ error: 'Failed to load patients.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as PatientCreatePayload;

    if (!payload.name || !payload.lastName || !payload.phone || !payload.dob || !payload.email) {
      return NextResponse.json({ error: 'Missing required patient fields.' }, { status: 400 });
    }

    // Create patient using PatientsService (Prisma)
    const patientData = {
      name: payload.name,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      dob: new Date(payload.dob),
      status: 'Active' as const,
      address: payload.address,
      ecName: payload.ecName,
      ecPhone: payload.ecPhone,
      ecRelationship: payload.ecRelationship,
      insuranceProvider: payload.insuranceProvider,
      policyNumber: payload.policyNumber,
      medicalHistory: payload.medicalHistory,
    };

    const patient = await PatientsService.create(patientData);

    // Optionally create user account for the patient
    if (payload.createUserAccount && payload.userPassword) {
      const user = await PatientUserSyncService.createUserFromPatient(
        patient,
        payload.userPassword
      );
      
      if (user) {
        console.log(`[api/patients] Created user account for patient ${patient.email}`);
      }
    }

    // Serialize dates
    const serialized = {
      ...patient,
      dob: patient.dob.toISOString(),
    };

    return NextResponse.json({ patient: serialized }, { status: 201 });
  } catch (error: any) {
    console.error('[api/patients] POST error', error);
    return NextResponse.json({ 
      error: 'Failed to create patient.',
      details: error.message 
    }, { status: 500 });
  }
}
