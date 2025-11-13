import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Fetch users with role 'doctor' from Neon database
    const doctors = await prisma.user.findMany({
      where: {
        role: 'doctor',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        specialization: true,
        licenseNumber: true,
        department: true,
        role: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    // Transform to match expected format (name = firstName + lastName)
    const formattedDoctors = doctors.map((doc) => ({
      id: doc.id,
      name: `${doc.firstName} ${doc.lastName}`.trim(),
      email: doc.email,
      phone: doc.phone || '',
      specialization: doc.specialization || '',
      licenseNumber: doc.licenseNumber || '',
      department: doc.department || '',
      role: 'doctor',
    }));

    return NextResponse.json({ doctors: formattedDoctors });
  } catch (e) {
    console.error('[api/doctors] GET error', e);
    return NextResponse.json({ error: 'Failed to load doctors.' }, { status: 500 });
  }
}
