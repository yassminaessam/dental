import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/medical-records - List all medical records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    const where = patientId ? { patientId } : {};

    const records = await prisma.medicalRecord.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical records' },
      { status: 500 }
    );
  }
}

// POST /api/medical-records - Create a new medical record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient, patientId, type, complaint, provider, providerId, date, status, notes } = body;

    if (!patient || !type || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: patient, type, provider' },
        { status: 400 }
      );
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patient,
        patientId,
        type,
        complaint: complaint || '',
        provider,
        providerId,
        date: date ? new Date(date) : new Date(),
        status: status || 'Final',
        notes: notes || '',
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error('Error creating medical record:', error);
    return NextResponse.json(
      { error: 'Failed to create medical record' },
      { status: 500 }
    );
  }
}
