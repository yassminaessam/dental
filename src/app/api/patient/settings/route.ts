import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Find or create patient settings
    let settings = await prisma.patientSettings.findUnique({
      where: { userId },
    });

    // If no settings exist, create default settings
    if (!settings) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { patientId: true },
      });

      settings = await prisma.patientSettings.create({
        data: {
          userId,
          patientId: user?.patientId || null,
          emailNotifications: true,
          smsNotifications: true,
          appointmentReminders: true,
          promotionalEmails: false,
          language: 'en',
          timezone: 'Africa/Cairo',
          darkMode: false,
          twoFactorEnabled: false,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('[api/patient/settings] GET error', error);
    return NextResponse.json({ error: 'Failed to load settings.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Check if settings exist
    const existingSettings = await prisma.patientSettings.findUnique({
      where: { userId },
    });

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.patientSettings.update({
        where: { userId },
        data: updates,
      });
    } else {
      // Create new settings if they don't exist
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { patientId: true },
      });

      settings = await prisma.patientSettings.create({
        data: {
          userId,
          patientId: user?.patientId || null,
          ...updates,
        },
      });
    }

    return NextResponse.json({ settings, message: 'Settings saved successfully.' });
  } catch (error) {
    console.error('[api/patient/settings] PUT error', error);
    return NextResponse.json({ error: 'Failed to save settings.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Partial update of settings
    const settings = await prisma.patientSettings.update({
      where: { userId },
      data: updates,
    });

    return NextResponse.json({ settings, message: 'Settings updated successfully.' });
  } catch (error) {
    console.error('[api/patient/settings] PATCH error', error);
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}
