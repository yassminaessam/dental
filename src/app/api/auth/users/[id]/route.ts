import { NextRequest, NextResponse } from 'next/server';
import { UsersService } from '@/services/users';
import { PatientUserSyncService } from '@/services/patient-user-sync';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await UsersService.getById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('[api/auth/users/[id]] GET Error', error);
    return NextResponse.json({ error: 'Failed to fetch user.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const data = await request.json();
    if (data.lastLoginAt) {
      data.lastLoginAt = new Date(data.lastLoginAt);
    }
    const { id } = await context.params;
    
    // Get current user to check if they have a linked patient
    const currentUser = await UsersService.getById(id);
    
    // Update the user
    const updated = await UsersService.update(id, data);
    
    // If user has a linked patient and email/name/phone changed, sync to patient
    if (currentUser?.patientId && (data.email || data.firstName || data.lastName || data.phone || data.address)) {
      await PatientUserSyncService.updatePatientFromUser(id, data);
    }
    
    return NextResponse.json({ user: updated });
  } catch (error: any) {
    console.error('[api/auth/users/[id]] PATCH Error', error);
    
    // Check for unique constraint violations
    if (error?.code === 'P2002') {
      const target = error?.meta?.target;
      if (target?.includes('email')) {
        return NextResponse.json({ 
          error: 'A user with this email already exists.',
          field: 'email'
        }, { status: 409 });
      }
    }
    
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}