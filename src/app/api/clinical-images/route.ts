import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/clinical-images - List all clinical images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    const where = patientId ? { patientId } : {};

    const images = await prisma.clinicalImage.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching clinical images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinical images' },
      { status: 500 }
    );
  }
}

// POST /api/clinical-images - Create a new clinical image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient, patientId, type, imageUrl, caption, date } = body;

    if (!patient || !type || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: patient, type, imageUrl' },
        { status: 400 }
      );
    }

    const image = await prisma.clinicalImage.create({
      data: {
        patient,
        patientId,
        type,
        imageUrl,
        caption: caption || '',
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error('Error creating clinical image:', error);
    return NextResponse.json(
      { error: 'Failed to create clinical image' },
      { status: 500 }
    );
  }
}
