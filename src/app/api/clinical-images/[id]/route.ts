import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/clinical-images/[id] - Get a specific clinical image
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const image = await prisma.clinicalImage.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json(
        { error: 'Clinical image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ image });
  } catch (error) {
    console.error('Error fetching clinical image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinical image' },
      { status: 500 }
    );
  }
}

// PUT /api/clinical-images/[id] - Update a clinical image
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { patient, patientId, type, imageUrl, caption, date } = body;

    const image = await prisma.clinicalImage.update({
      where: { id },
      data: {
        patient,
        patientId,
        type,
        imageUrl,
        caption,
        date: date ? new Date(date) : undefined,
      },
    });

    return NextResponse.json({ image });
  } catch (error) {
    console.error('Error updating clinical image:', error);
    return NextResponse.json(
      { error: 'Failed to update clinical image' },
      { status: 500 }
    );
  }
}

// DELETE /api/clinical-images/[id] - Delete a clinical image
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await prisma.clinicalImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting clinical image:', error);
    return NextResponse.json(
      { error: 'Failed to delete clinical image' },
      { status: 500 }
    );
  }
}
