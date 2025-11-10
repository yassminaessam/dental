import { NextResponse } from 'next/server';
import { UsersService } from '@/services/users';
import bcrypt from 'bcryptjs';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('[sign-in] Request received');
    console.log('[sign-in] Email provided:', !!email, 'Length:', email?.length);
    console.log('[sign-in] Password provided:', !!password, 'Length:', password?.length);

    if (!email || !password) {
      console.log('[sign-in] Missing email or password');
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalized = normalizeEmail(email);
    console.log('[sign-in] Email normalized:', normalized);
    
    const user = await UsersService.getByEmail(normalized);
    console.log('[sign-in] User lookup result:', {
      found: !!user,
      hasHash: !!user?.hashedPassword,
      hashLength: user?.hashedPassword?.length,
      isActive: user?.isActive
    });
    
    if (!user?.hashedPassword) {
      console.log('[sign-in] FAIL: No user or no password hash');
      await new Promise(r => setTimeout(r, 100)); // Timing mitigation
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.hashedPassword);
    console.log('[sign-in] Password comparison result:', isValid);
    
    if (!isValid) {
      console.log('[sign-in] FAIL: Invalid password');
      await new Promise(r => setTimeout(r, 100));
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    if (!user.isActive) {
      console.log('[sign-in] FAIL: Account deactivated');
      return NextResponse.json({ error: 'Account is deactivated. Please contact your administrator.' }, { status: 403 });
    }

    console.log('[sign-in] SUCCESS: User authenticated:', user.id);
    await UsersService.updateLastLogin(user.id);

    const { hashedPassword: _ignored, ...sanitized } = user;
    return NextResponse.json({ user: sanitized }, { status: 200 });
  } catch (error) {
    console.error('[sign-in] ERROR:', error);
    return NextResponse.json({ error: 'Failed to sign in.' }, { status: 500 });
  }
}