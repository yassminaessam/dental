import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/services/attendance';

// GET /api/attendance - Get attendance records
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const staffId = searchParams.get('staffId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const summary = searchParams.get('summary');

    // Get today's summary
    if (summary === 'today') {
      const data = await AttendanceService.getTodayAttendanceSummary();
      return NextResponse.json(data);
    }

    // Get attendance by date
    if (date) {
      const records = await AttendanceService.getAttendanceByDate(new Date(date));
      return NextResponse.json({ records });
    }

    // Get attendance by staff and date range
    if (staffId && startDate && endDate) {
      const records = await AttendanceService.getAttendanceByStaff(
        staffId,
        new Date(startDate),
        new Date(endDate)
      );
      return NextResponse.json({ records });
    }

    // Get attendance report
    if (startDate && endDate) {
      const report = await AttendanceService.getAttendanceReport({
        staffId: staffId || undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      return NextResponse.json(report);
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  } catch (error: any) {
    console.error('[api/attendance] GET error', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch attendance' }, { status: 500 });
  }
}

// POST /api/attendance - Clock in/out, mark attendance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, staffId, date, location, status, notes } = body;

    switch (action) {
      case 'clockIn': {
        const record = await AttendanceService.clockIn(staffId, location);
        return NextResponse.json({ record }, { status: 201 });
      }

      case 'clockOut': {
        const record = await AttendanceService.clockOut(staffId, location);
        return NextResponse.json({ record });
      }

      case 'startBreak': {
        const record = await AttendanceService.startBreak(staffId);
        return NextResponse.json({ record });
      }

      case 'endBreak': {
        const record = await AttendanceService.endBreak(staffId);
        return NextResponse.json({ record });
      }

      case 'markAbsent': {
        const record = await AttendanceService.markAbsent(staffId, new Date(date), notes);
        return NextResponse.json({ record });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[api/attendance] POST error', error);
    return NextResponse.json({ error: error.message || 'Failed to process attendance' }, { status: 500 });
  }
}

// PATCH /api/attendance - Update attendance record
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const record = await AttendanceService.updateAttendance(id, data);
    return NextResponse.json({ record });
  } catch (error: any) {
    console.error('[api/attendance] PATCH error', error);
    return NextResponse.json({ error: error.message || 'Failed to update attendance' }, { status: 500 });
  }
}
