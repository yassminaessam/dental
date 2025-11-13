import { NextRequest, NextResponse } from 'next/server';
import { UsersService } from '@/services/users';

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');
    const email = request.nextUrl.searchParams.get('email');

    if (!phone && !email) {
      return NextResponse.json({ error: 'Missing phone or email parameter' }, { status: 400 });
    }

    const user = phone
      ? await UsersService.getByPhone(phone)
      : await UsersService.getByEmail(email as string);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[api/auth/users/lookup] Error', error);
    return NextResponse.json({ error: 'Failed to lookup user.' }, { status: 500 });
  }
}
