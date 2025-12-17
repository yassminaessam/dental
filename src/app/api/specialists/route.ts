import { NextRequest, NextResponse } from 'next/server';
import { SpecialistsService } from '@/services/specialists';

interface SpecialistCreatePayload {
  name: string;
  specialty: string;
  phone?: string;
  email?: string;
  clinicName?: string;
}

export async function GET() {
  try {
    const specialists = await SpecialistsService.list();

    // Serialize dates if present
    const serialized = specialists.map((s) => ({
      ...s,
      createdAt: s.createdAt?.toISOString() || null,
      updatedAt: s.updatedAt?.toISOString() || null,
    }));

    return NextResponse.json({ specialists: serialized });
  } catch (error) {
    console.error('[api/specialists] GET error', error);
    return NextResponse.json({ error: 'Failed to load specialists.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SpecialistCreatePayload;

    if (!payload.name || !payload.specialty) {
      return NextResponse.json({ error: 'Name and specialty are required.' }, { status: 400 });
    }

    const specialist = await SpecialistsService.create({
      name: payload.name,
      specialty: payload.specialty,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
      clinicName: payload.clinicName ?? null,
    });

    // Serialize dates
    const serialized = {
      ...specialist,
      createdAt: specialist.createdAt?.toISOString() || null,
      updatedAt: specialist.updatedAt?.toISOString() || null,
    };

    return NextResponse.json({ specialist: serialized }, { status: 201 });
  } catch (error: any) {
    console.error('[api/specialists] POST error', error);
    return NextResponse.json({ 
      error: 'Failed to create specialist.',
      details: error.message 
    }, { status: 500 });
  }
}
