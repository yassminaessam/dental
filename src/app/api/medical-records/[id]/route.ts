import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/medical-records/[id] - Get a specific medical record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: params.id },
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Medical record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error('Error fetching medical record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical record' },
      { status: 500 }
    );
  }
}

// PUT /api/medical-records/[id] - Update a medical record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { patient, patientId, type, complaint, provider, providerId, date, status, notes } = body;

    const record = await prisma.medicalRecord.update({
      where: { id: params.id },
      data: {
        patient,
        patientId,
        type,
        complaint,
        provider,
        providerId,
        date: date ? new Date(date) : undefined,
        status,
        notes,
      },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error('Error updating medical record:', error);
    return NextResponse.json(
      { error: 'Failed to update medical record' },
      { status: 500 }
    );
  }
}

// DELETE /api/medical-records/[id] - Delete a medical record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.medicalRecord.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    return NextResponse.json(
      { error: 'Failed to delete medical record' },
      { status: 500 }
    );
  }
}
