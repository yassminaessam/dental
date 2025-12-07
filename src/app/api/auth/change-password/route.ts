import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/services/neon-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, currentPassword, newPassword } = body;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'User ID, current password, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Verify the current user is authorized (either self or admin)
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await neonAuth.verifyToken(token);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow users to change their own password (or admin to change anyone's)
    if (currentUser.id !== userId && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Change the password
    await neonAuth.changePassword(userId, currentPassword, newPassword);

    return NextResponse.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error: any) {
    console.error('[api/auth/change-password] Error:', error);
    
    // Handle specific errors
    if (error.message === 'Current password is incorrect') {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to change password. Please try again.' },
      { status: 500 }
    );
  }
}
