import { NextResponse } from 'next/server';
import { UsersService } from '@/services/users';
import bcrypt from 'bcryptjs';
import { ROLE_PERMISSIONS, type UserRole } from '@/lib/types';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const DEFAULT_ACCOUNTS: Array<{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}> = [
  {
    email: 'admin@cairodental.com',
    password: 'Admin123!',
    firstName: 'System',
    lastName: 'Admin',
    role: 'admin',
  },
  {
    email: 'doctor2@cairodental.com',
    password: 'Doctor@123',
    firstName: 'Demo',
    lastName: 'Doctor',
    role: 'doctor',
  },
  {
    email: 'receptionist@cairodental.com',
    password: 'Receptionist@123',
    firstName: 'Frontdesk',
    lastName: 'Staff',
    role: 'receptionist',
  },
  {
    email: 'patient@cairodental.com',
    password: 'Patient@123',
    firstName: 'Demo',
    lastName: 'Patient',
    role: 'patient',
  },
];

async function ensureDefaultAccount(email: string) {
  const match = DEFAULT_ACCOUNTS.find((account) => account.email === email);
  if (!match) return;
  const existing = await UsersService.getByEmail(email);
  if (existing) return;
  console.log('[sign-in] Seeding default account for', email);
  await UsersService.create({
    email: match.email,
    password: match.password,
    firstName: match.firstName,
    lastName: match.lastName,
    role: match.role,
    permissions: ROLE_PERMISSIONS[match.role] ?? [],
  });
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
    await ensureDefaultAccount(normalized);
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