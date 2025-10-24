import { NextRequest, NextResponse } from 'next/server';
import { UsersService } from '@/services/users';
import type { UserRole } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const roleParam = request.nextUrl.searchParams.get('role');
    const role = roleParam ? (roleParam as UserRole) : null;

    const users = role ? await UsersService.listByRole(role) : await UsersService.listAll();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('[api/auth/users] Error', error);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}