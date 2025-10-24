import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/services/neon-auth';

export async function POST(request: NextRequest) {
  try {
    // Get token from header or cookie
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.cookies.get('auth-token')?.value;
    
    if (token) {
      // Invalidate the session in database
      await neonAuth.logout(token);
    }

    // Clear the auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}