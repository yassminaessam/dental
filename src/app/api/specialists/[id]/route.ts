import { NextRequest, NextResponse } from 'next/server';
import { SpecialistsService } from '@/services/specialists';

interface SpecialistUpdatePayload {
  name?: string;
  specialty?: string;
  phone?: string | null;
  email?: string | null;
  clinicName?: string | null;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const specialist = await SpecialistsService.get(id);

    if (!specialist) {
      return NextResponse.json({ error: 'Specialist not found.' }, { status: 404 });
    }

    // Serialize dates
    const serialized = {
      ...specialist,
      createdAt: specialist.createdAt?.toISOString() || null,
      updatedAt: specialist.updatedAt?.toISOString() || null,
    };

    return NextResponse.json({ specialist: serialized });
  } catch (error) {
    console.error('[api/specialists/[id]] GET error', error);
    return NextResponse.json({ error: 'Failed to load specialist.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payload = (await request.json()) as SpecialistUpdatePayload;

    // Check if specialist exists
    const existing = await SpecialistsService.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Specialist not found.' }, { status: 404 });
    }

    // Build update object
    const updateData: Partial<SpecialistUpdatePayload> = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.specialty !== undefined) updateData.specialty = payload.specialty;
    if (payload.phone !== undefined) updateData.phone = payload.phone;
    if (payload.email !== undefined) updateData.email = payload.email;
    if (payload.clinicName !== undefined) updateData.clinicName = payload.clinicName;

    const specialist = await SpecialistsService.update(id, updateData);

    // Serialize dates
    const serialized = {
      ...specialist,
      createdAt: specialist.createdAt?.toISOString() || null,
      updatedAt: specialist.updatedAt?.toISOString() || null,
    };

    return NextResponse.json({ specialist: serialized });
  } catch (error: any) {
    console.error('[api/specialists/[id]] PATCH error', error);
    return NextResponse.json({ 
      error: 'Failed to update specialist.',
      details: error.message 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // PUT acts same as PATCH for backward compatibility
  return PATCH(request, context);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check if specialist exists
    const existing = await SpecialistsService.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Specialist not found.' }, { status: 404 });
    }

    await SpecialistsService.delete(id);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[api/specialists/[id]] DELETE error', error);
    return NextResponse.json({ 
      error: 'Failed to delete specialist.',
      details: error.message 
    }, { status: 500 });
  }
}
