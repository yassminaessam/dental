import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/services/neon-auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  try {
    const params = await context.params as { id: string };
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentUser = await neonAuth.verifyToken(token);
    if (!currentUser || currentUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    if (!Array.isArray(body.permissions)) {
      return NextResponse.json({ error: 'permissions must be an array' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { permissions: body.permissions }
    });

    return NextResponse.json({ success: true, userId: updated.id, permissions: body.permissions });
  } catch (error) {
    console.error('PUT update permissions error:', error);
    return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
  }
}
