import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

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

    // Get clinical images from Neon database
    const clinicalImages = await prisma.clinicalImage.findMany({
      where: {
        patientId: patient.id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    const images = clinicalImages.map((image) => ({
      id: image.id,
      title: image.caption || 'Clinical Image',
      type: image.type,
      date: image.date,
      url: image.imageUrl,
      thumbnail: image.imageUrl,
      description: image.caption || '',
    }));

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
  }
}
