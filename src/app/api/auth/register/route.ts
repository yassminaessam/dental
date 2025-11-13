import { NextResponse } from 'next/server';
import { UsersService } from '@/services/users';
import { PatientUserSyncService } from '@/services/patient-user-sync';
import { ROLE_PERMISSIONS, type UserPermission, type UserRole } from '@/lib/types';

type RegisterPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  employeeId?: string;
  department?: string;
  permissions?: UserPermission[];
  dob?: string; // For patient role users
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload;

    if (!payload.email || !payload.password || !payload.firstName || !payload.lastName || !payload.role) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const user = await UsersService.create({
      ...payload,
      permissions: payload.permissions ?? ROLE_PERMISSIONS[payload.role],
    });

    // If the user is a patient, automatically create a patient record
    if (user.role === 'patient') {
      const patientData = {
        dob: payload.dob ? new Date(payload.dob) : new Date(2000, 0, 1),
      };
      
      const patient = await PatientUserSyncService.createPatientFromUser(user, patientData);
      
      if (patient) {
        console.log(`[api/auth/register] Created patient record for user ${user.email}`);
      }
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error('[api/auth/register] Error:', error);
    console.error('[api/auth/register] Error stack:', error?.stack);
    console.error('[api/auth/register] Error code:', error?.code);
    
    let message = 'Failed to create user.';
    
    // Handle Prisma-specific errors
    if (error?.code === 'P2002') {
      const target = error?.meta?.target;
      if (target?.includes('email')) {
        message = 'A user with this email already exists.';
      } else {
        message = `Unique constraint failed on: ${target?.join(', ')}`;
      }
    } else if (error?.message) {
      message = error.message;
    }
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}