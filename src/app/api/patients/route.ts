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
  profilePhotoUrl?: string;
  allergies?: string[];
  bloodType?: string;
  createUserAccount?: boolean; // Optional flag to create user account
  userPassword?: string; // Password for user account if createUserAccount is true
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    const patients = await PatientsService.list();
    
    // Filter to only active patients if requested
    const filteredPatients = activeOnly 
      ? patients.filter(p => p.status === 'Active')
      : patients;
    
    // Serialize dates
    const serialized = filteredPatients.map(p => ({
      ...p,
      dob: p.dob.toISOString(),
      createdAt: p.createdAt?.toISOString() || null,
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
      profilePhotoUrl: payload.profilePhotoUrl,
      allergies: payload.allergies,
      bloodType: payload.bloodType,
    };

    const patient = await PatientsService.create(patientData);

    // Optionally create user account for the patient
    let userCreated = false;
    let userError: string | null = null;
    
    if (payload.createUserAccount && payload.userPassword && payload.userPassword.trim().length > 0) {
      try {
        const user = await PatientUserSyncService.createUserFromPatient(
          patient,
          payload.userPassword
        );
        
        if (user) {
          console.log(`[api/patients] Created user account for patient ${patient.email}, userId: ${user.id}`);
          userCreated = true;
        }
      } catch (error: any) {
        console.error(`[api/patients] Failed to create user account for patient ${patient.email}:`, error);
        userError = error.message || 'Failed to create user account';
      }
    }

    // Serialize dates
    const serialized = {
      ...patient,
      dob: patient.dob.toISOString(),
      createdAt: patient.createdAt?.toISOString() || null,
    };

    return NextResponse.json({ 
      patient: serialized,
      userCreated,
      userError 
    }, { status: 201 });
  } catch (error: any) {
    console.error('[api/patients] POST error', error);
    
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
    
    return NextResponse.json({ 
      error: 'Failed to create patient.',
      details: error.message 
    }, { status: 500 });
  }
}
