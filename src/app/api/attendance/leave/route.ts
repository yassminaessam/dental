import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/services/attendance';

// GET /api/attendance/leave - Get leave requests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const staffId = searchParams.get('staffId');
    const status = searchParams.get('status') as 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | null;

    if (staffId) {
      const requests = await AttendanceService.getStaffLeaveRequests(staffId);
      return NextResponse.json({ requests });
    }

    const requests = await AttendanceService.getLeaveRequests(status || undefined);
    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('[api/attendance/leave] GET error', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch leave requests' }, { status: 500 });
  }
}

// POST /api/attendance/leave - Create leave request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffId, leaveType, startDate, endDate, totalDays, reason, attachmentUrl } = body;

    if (!staffId || !leaveType || !startDate || !endDate || !totalDays) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const leaveRequest = await AttendanceService.createLeaveRequest({
      staffId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays,
      reason,
      attachmentUrl,
    });

    return NextResponse.json({ request: leaveRequest }, { status: 201 });
  } catch (error: any) {
    console.error('[api/attendance/leave] POST error', error);
    return NextResponse.json({ error: error.message || 'Failed to create leave request' }, { status: 500 });
  }
}

// PATCH /api/attendance/leave - Review or cancel leave request
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, status, reviewedBy, reviewNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Leave request ID is required' }, { status: 400 });
    }

    if (action === 'cancel') {
      const leaveRequest = await AttendanceService.cancelLeaveRequest(id);
      return NextResponse.json({ request: leaveRequest });
    }

    if (action === 'review') {
      if (!status || !reviewedBy) {
        return NextResponse.json({ error: 'Status and reviewer are required' }, { status: 400 });
      }

      const leaveRequest = await AttendanceService.reviewLeaveRequest(
        id,
        status,
        reviewedBy,
        reviewNotes
      );
      return NextResponse.json({ request: leaveRequest });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[api/attendance/leave] PATCH error', error);
    return NextResponse.json({ error: error.message || 'Failed to update leave request' }, { status: 500 });
  }
}
