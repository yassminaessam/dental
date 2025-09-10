import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/services/neon-auth';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role
    } = data;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, firstName, and lastName are required' },
        { status: 400 }
      );
    }

    // Register user using Neon auth service
    const result = await neonAuth.register({
      email,
      password,
      firstName,
      lastName,
      role: role || 'patient'
    });

    // Set httpOnly cookie for token
    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
      message: 'Registration successful'
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
    console.error('Registration API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Registration failed',
        success: false
      },
      { status: 400 }
    );
  }
}