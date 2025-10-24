import { NextRequest, NextResponse } from 'next/server';
import { UsersService } from '@/services/users';

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
    const updated = await UsersService.update(id, data);
    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('[api/auth/users/[id]] PATCH Error', error);
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}