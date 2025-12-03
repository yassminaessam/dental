import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Normalize phone number by removing spaces and keeping only digits and + sign
const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');

export async function POST(request: Request) {
  try {
    const { phone, email, excludeId } = await request.json();

    if (phone) {
      const normalizedPhone = normalizePhone(phone);
      
      // Find all staff and check with normalized phone comparison
      const staffMembers = await prisma.staff.findMany({
        where: excludeId ? { id: { not: excludeId } } : {},
        select: { id: true, phone: true },
      });
      
      const existing = staffMembers.find(s => s.phone && normalizePhone(s.phone) === normalizedPhone);
      
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
