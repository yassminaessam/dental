import { NextResponse } from 'next/server';
import { UsersService } from '@/services/users';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await UsersService.getByEmail(email);
    if (!user?.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated. Please contact your administrator.' }, { status: 403 });
    }

    await UsersService.updateLastLogin(user.id);

    const { passwordHash: _ignored, ...sanitized } = user;
    return NextResponse.json({ user: sanitized });
  } catch (error) {
    console.error('[api/auth/sign-in] Error', error);
    return NextResponse.json({ error: 'Failed to sign in.' }, { status: 500 });
  }
}