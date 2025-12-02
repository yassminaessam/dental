import { NextRequest, NextResponse } from 'next/server';
import { UsersService } from '@/services/users';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const user = await UsersService.getById(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('[api/users/[id]] GET error', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    
    const user = await UsersService.update(id, body);
    
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('[api/users/[id]] PUT error', error);
    
    // Check for unique constraint violations
    if (error?.code === 'P2002') {
      const target = error?.meta?.target;
      if (target?.includes('phone')) {
        return NextResponse.json({ 
          error: 'A user with this phone number already exists.',
          field: 'phone'
        }, { status: 409 });
      }
      if (target?.includes('email')) {
        return NextResponse.json({ 
          error: 'A user with this email already exists.',
          field: 'email'
        }, { status: 409 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to update user',
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    // Note: We should add a delete method to UsersService
    // For now, just return not implemented
    return NextResponse.json({ 
      error: 'Delete user not implemented yet' 
    }, { status: 501 });
  } catch (error: any) {
    console.error('[api/users/[id]] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
