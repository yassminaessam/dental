import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Try to find existing user settings
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!userSettings) {
      // Return default settings if none exist
      return NextResponse.json({
        settings: {
          emailNotifications: true,
          appointmentReminders: true,
          systemAlerts: true,
          language: 'en',
          timezone: 'Africa/Cairo',
          darkMode: false,
          twoFactorEnabled: false,
        },
      });
    }

    return NextResponse.json({ settings: userSettings });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      emailNotifications,
      appointmentReminders,
      systemAlerts,
      language,
      timezone,
      darkMode,
      twoFactorEnabled,
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert user settings
    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        emailNotifications: emailNotifications ?? true,
        appointmentReminders: appointmentReminders ?? true,
        systemAlerts: systemAlerts ?? true,
        language: language || 'en',
        timezone: timezone || 'Africa/Cairo',
        darkMode: darkMode ?? false,
        twoFactorEnabled: twoFactorEnabled ?? false,
        updatedAt: new Date(),
      },
      create: {
        userId,
        emailNotifications: emailNotifications ?? true,
        appointmentReminders: appointmentReminders ?? true,
        systemAlerts: systemAlerts ?? true,
        language: language || 'en',
        timezone: timezone || 'Africa/Cairo',
        darkMode: darkMode ?? false,
        twoFactorEnabled: twoFactorEnabled ?? false,
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error saving user settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
