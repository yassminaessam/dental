import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/services/neon-auth';
import { prisma } from '@/lib/prisma';

// GET /api/auth/users?role=optionalRole
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await neonAuth.verifyToken(token);
    if (!currentUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only admins can list all users
    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    const where: any = {};
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const sanitized = users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: (u as any).firstName,
      lastName: (u as any).lastName,
      role: (u as any).role,
      permissions: (u as any).permissions || [],
      isActive: (u as any).isActive,
      lastLoginAt: (u as any).lastLoginAt,
      createdAt: (u as any).createdAt,
      phone: (u as any).phone || null,
    }));

    return NextResponse.json({ users: sanitized });
  } catch (error) {
    console.error('GET /api/auth/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
