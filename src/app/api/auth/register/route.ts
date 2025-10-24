import { NextResponse } from 'next/server';
import { UsersService } from '@/services/users';
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

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error('[api/auth/register] Error', error);
    const message = error?.message ?? 'Failed to create user.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}