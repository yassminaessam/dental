import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, email, excludeId } = await request.json();

    if (phone) {
      const existing = await prisma.staff.findFirst({
        where: {
          phone: phone,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
      });
      
      if (existing) {
        return NextResponse.json({ 
          exists: true, 
          field: 'phone',
          message: 'Phone number already exists' 
        });
      }
    }

    if (email) {
      const existing = await prisma.staff.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        select: { id: true },
      });
      
      if (existing) {
        return NextResponse.json({ 
          exists: true, 
          field: 'email',
          message: 'Email already exists' 
        });
      }
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('[api/staff/check-duplicate] Error:', error);
    return NextResponse.json({ error: 'Failed to check duplicate' }, { status: 500 });
  }
}
