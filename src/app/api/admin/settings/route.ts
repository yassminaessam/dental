import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    // Find or create clinic settings
    let settings = await prisma.clinicSettings.findUnique({
      where: { id: 'main' },
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.clinicSettings.create({
        data: {
          id: 'main',
          clinicName: '',
          phoneNumber: '',
          email: '',
          website: '',
          address: '',
          businessHours: 'mon-fri-8-6',
          timezone: 'eastern',
          appointmentDuration: '60',
          bookingLimit: '90',
          allowOnlineBooking: true,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[api/admin/settings] GET error', error);
    return NextResponse.json(
      { error: 'Failed to load settings.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, createdAt, updatedAt, ...updateData } = body;

    // Upsert clinic settings
    const settings = await prisma.clinicSettings.upsert({
      where: { id: 'main' },
      create: {
        id: 'main',
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json({
      settings,
      message: 'Settings saved successfully.',
    });
  } catch (error) {
    console.error('[api/admin/settings] PUT error', error);
    return NextResponse.json(
      { error: 'Failed to save settings.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Partial update of settings
    const settings = await prisma.clinicSettings.update({
      where: { id: 'main' },
      data: body,
    });

    return NextResponse.json({
      settings,
      message: 'Settings updated successfully.',
    });
  } catch (error) {
    console.error('[api/admin/settings] PATCH error', error);
    return NextResponse.json(
      { error: 'Failed to update settings.' },
      { status: 500 }
    );
  }
}
