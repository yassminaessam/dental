import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/services/attendance';

// GET /api/attendance/settings - Get attendance settings
export async function GET() {
  try {
    const settings = await AttendanceService.getSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('[api/attendance/settings] GET error', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/attendance/settings - Update attendance settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = await AttendanceService.updateSettings(body);
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('[api/attendance/settings] PUT error', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
