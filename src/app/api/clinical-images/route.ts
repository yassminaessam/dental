import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/clinical-images - List all clinical images
export async function GET(request: NextRequest) {
  try {
    console.log('🖼️ Fetching clinical images from database...');
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    const where = patientId ? { patientId } : {};
    console.log('Query where clause:', where);

    const images = await prisma.clinicalImage.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });

    console.log(`✅ Successfully fetched ${images.length} clinical images`);
    return NextResponse.json({ images });
  } catch (error) {
    console.error('❌ Error fetching clinical images:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to fetch clinical images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/clinical-images - Create a new clinical image
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new clinical image...');
    const body = await request.json();
    const { patient, patientId, type, imageUrl, caption, date, toothNumber } = body;

    console.log('Request body:', { patient, patientId, type, imageUrl, caption, date, toothNumber });

    if (!patient || !type || !imageUrl) {
      console.warn('⚠️ Missing required fields');
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
        toothNumber: toothNumber ? parseInt(toothNumber) : null,
      },
    });

    console.log('✅ Clinical image created successfully:', image.id);
    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating clinical image:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to create clinical image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE /api/clinical-images?id=xxx - Delete a clinical image
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting clinical image...');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.warn('⚠️ Missing image ID');
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    await prisma.clinicalImage.delete({
      where: { id },
    });

    console.log('✅ Clinical image deleted successfully:', id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Error deleting clinical image:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to delete clinical image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
