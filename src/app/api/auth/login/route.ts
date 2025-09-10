import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/services/neon-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get client IP and user agent for session tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Attempt login
    const result = await neonAuth.login(
      { email, password },
      ipAddress,
      userAgent
    );

    // Set httpOnly cookie for token
    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
      message: 'Login successful'
    });

    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Login failed',
        success: false
      },
      { status: 401 }
    );
  }
}