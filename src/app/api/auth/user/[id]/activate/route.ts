import { NextRequest, NextResponse } from 'next/server';
import { neonAuth } from '@/services/neon-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, context: { params: Promise<Record<string, string>> }) {
  try {
    const params = await context.params as { id: string };
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const currentUser = await neonAuth.verifyToken(token);
    if (!currentUser || currentUser.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updated = await prisma.user.update({ where: { id: params.id }, data: { isActive: true } });
    return NextResponse.json({ success: true, userId: updated.id });
  } catch (error) {
    console.error('POST activate user error:', error);
    return NextResponse.json({ error: 'Failed to activate user' }, { status: 500 });
  }
}
