import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/services/neon-auth';
import { prisma } from '@/lib/prisma';

// Helper to auth and optionally ensure admin OR self
async function authenticate(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.cookies.get('auth-token')?.value;
  if (!token) return null;
  return await neonAuth.verifyToken(token);
}

export async function GET(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  try {
    const params = await context.params as { id: string };
    const currentUser = await authenticate(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (currentUser.role !== 'admin' && currentUser.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const sanitized = {
      id: user.id,
      email: user.email,
      firstName: (user as any).firstName,
      lastName: (user as any).lastName,
      role: (user as any).role,
      permissions: (user as any).permissions || [],
      isActive: (user as any).isActive,
      lastLoginAt: (user as any).lastLoginAt,
      createdAt: (user as any).createdAt,
      phone: (user as any).phone || null,
      profileImageUrl: (user as any).profileImageUrl || null,
    };
    return NextResponse.json({ user: sanitized });
  } catch (error) {
    console.error('GET /api/auth/user/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  try {
    const params = await context.params as { id: string };
    const currentUser = await authenticate(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (currentUser.role !== 'admin' && currentUser.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const allowed: any = {};
    ['firstName','lastName','phone','profileImageUrl'].forEach(k => { if (body[k] !== undefined) allowed[k] = body[k]; });

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await prisma.user.update({ where: { id: params.id }, data: allowed });
    return NextResponse.json({ success: true, user: {
      id: updated.id,
      email: updated.email,
      firstName: (updated as any).firstName,
      lastName: (updated as any).lastName,
      role: (updated as any).role,
      permissions: (updated as any).permissions || [],
      isActive: (updated as any).isActive,
      lastLoginAt: (updated as any).lastLoginAt,
      createdAt: (updated as any).createdAt,
      phone: (updated as any).phone || null,
      profileImageUrl: (updated as any).profileImageUrl || null,
    }});
  } catch (error) {
    console.error('PUT /api/auth/user/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
