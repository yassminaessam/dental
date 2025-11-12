import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get patient by email
    const patient = await prisma.patient.findUnique({
      where: { email },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // For now, return empty array as we don't have an images table yet
    // This will be populated when file storage is implemented
    // TODO: Create MedicalImage model in Prisma schema
    // TODO: Integrate with Firebase Storage or similar

    // Placeholder structure for when images are available
    const images: any[] = [];

    // If you have images stored in CollectionDoc (old system), fetch them
    try {
      const collectionDocs = await prisma.collectionDoc.findMany({
        where: {
          collection: 'medical-images',
          data: {
            path: ['patientId'],
            equals: patient.id,
          },
        },
      });

      const legacyImages = collectionDocs.map((doc: any) => {
        const data = doc.data as any;
        return {
          id: doc.id,
          title: data.title || 'Medical Image',
          type: data.type || 'Image',
          date: data.date || doc.createdAt,
          url: data.url || '',
          thumbnail: data.thumbnail || data.url || '',
          description: data.description || '',
        };
      });

      images.push(...legacyImages);
    } catch (err) {
      console.log('No legacy images found');
    }

    return NextResponse.json({
      images: images.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
      patient: {
        id: patient.id,
        name: patient.name,
        lastName: patient.lastName,
      },
    });
  } catch (error) {
    console.error('Error fetching patient images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
