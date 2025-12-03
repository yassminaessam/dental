import { prisma } from '@/lib/prisma';
import type { AttendanceStatus, LeaveType, LeaveStatus } from '@prisma/client';

// ============================================
// Types
// ============================================

export interface AttendanceRecordInput {
  staffId: string;
  date: Date;
  status?: AttendanceStatus;
  clockIn?: Date;
  clockOut?: Date;
  breakStart?: Date;
  breakEnd?: Date;
  totalBreakMinutes?: number;
  clockInLocation?: { latitude: number; longitude: number; address?: string };
  clockOutLocation?: { latitude: number; longitude: number; address?: string };
  locationVerified?: boolean;
  scheduledHours?: number;
  workedHours?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  earlyDepartureMinutes?: number;
  notes?: string;
  approvedBy?: string;
}

export interface LeaveRequestInput {
  staffId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  attachmentUrl?: string;
}

export interface AttendanceReportParams {
  staffId?: string;
  startDate: Date;
  endDate: Date;
}

// ============================================
// Attendance Records
// ============================================

async function getAttendanceByDate(date: Date) {
  return prisma.attendanceRecord.findMany({
    where: {
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    },
    include: {
      staff: true,
    },
    orderBy: { clockIn: 'asc' },
  });
}

async function getAttendanceByStaff(staffId: string, startDate: Date, endDate: Date) {
  return prisma.attendanceRecord.findMany({
    where: {
      staffId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      staff: true,
    },
    orderBy: { date: 'desc' },
  });
}

async function getAttendanceRecord(staffId: string, date: Date) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  return prisma.attendanceRecord.findUnique({
    where: {
      staffId_date: {
        staffId,
        date: dateOnly,
      },
    },
    include: {
      staff: true,
    },
  });
}

async function clockIn(staffId: string, location?: { latitude: number; longitude: number; address?: string }) {
  const now = new Date();
  const dateOnly = new Date(now);
  dateOnly.setHours(0, 0, 0, 0);

  // Get attendance settings
  const settings = await getSettings();
  
  // Calculate if late
  const [startHour, startMinute] = settings.workStartTime.split(':').map(Number);
  const expectedStart = new Date(dateOnly);
  expectedStart.setHours(startHour, startMinute + settings.lateGraceMinutes, 0, 0);
  
  const lateMinutes = now > expectedStart 
    ? Math.floor((now.getTime() - expectedStart.getTime()) / 60000) 
    : 0;
  
  const status: AttendanceStatus = lateMinutes > 0 ? 'Late' : 'Present';

  // Verify location if enabled
  let locationVerified = false;
  if (settings.locationTrackingEnabled && location && settings.clinicLatitude && settings.clinicLongitude) {
    const distance = calculateDistance(
      Number(location.latitude),
      Number(location.longitude),
      Number(settings.clinicLatitude),
      Number(settings.clinicLongitude)
    );
    locationVerified = distance <= settings.allowedRadiusMeters;
  }

  return prisma.attendanceRecord.upsert({
    where: {
      staffId_date: {
        staffId,
        date: dateOnly,
      },
    },
    create: {
      staffId,
      date: dateOnly,
      clockIn: now,
      status,
      lateMinutes: lateMinutes > 0 ? lateMinutes : null,
      clockInLocation: location as any,
      locationVerified,
      scheduledHours: 8, // Default 8 hours
    },
    update: {
      clockIn: now,
      status,
      lateMinutes: lateMinutes > 0 ? lateMinutes : null,
      clockInLocation: location as any,
      locationVerified,
    },
    include: {
      staff: true,
    },
  });
}

async function clockOut(staffId: string, location?: { latitude: number; longitude: number; address?: string }) {
  const now = new Date();
  const dateOnly = new Date(now);
  dateOnly.setHours(0, 0, 0, 0);

  const existing = await getAttendanceRecord(staffId, dateOnly);
  if (!existing || !existing.clockIn) {
    throw new Error('No clock-in record found for today');
  }

  // Calculate worked hours
  const workedMs = now.getTime() - existing.clockIn.getTime();
  const breakMinutes = existing.totalBreakMinutes || 0;
  const workedHours = (workedMs / 3600000) - (breakMinutes / 60);

  // Get settings for overtime calculation
  const settings = await getSettings();
  const overtimeHours = settings.overtimeEnabled && workedHours > Number(settings.overtimeThresholdHours)
    ? workedHours - Number(settings.overtimeThresholdHours)
    : 0;

  // Calculate early departure
  const [endHour, endMinute] = settings.workEndTime.split(':').map(Number);
  const expectedEnd = new Date(dateOnly);
  expectedEnd.setHours(endHour, endMinute - settings.earlyLeaveGraceMinutes, 0, 0);
  
  const earlyDepartureMinutes = now < expectedEnd 
    ? Math.floor((expectedEnd.getTime() - now.getTime()) / 60000) 
    : 0;

  return prisma.attendanceRecord.update({
    where: { id: existing.id },
    data: {
      clockOut: now,
      workedHours,
      overtimeHours: overtimeHours > 0 ? overtimeHours : null,
      earlyDepartureMinutes: earlyDepartureMinutes > 0 ? earlyDepartureMinutes : null,
      clockOutLocation: location as any,
    },
    include: {
      staff: true,
    },
  });
}

async function startBreak(staffId: string) {
  const now = new Date();
  const dateOnly = new Date(now);
  dateOnly.setHours(0, 0, 0, 0);

  const existing = await getAttendanceRecord(staffId, dateOnly);
  if (!existing) {
    throw new Error('No attendance record found for today');
  }

  return prisma.attendanceRecord.update({
    where: { id: existing.id },
    data: {
      breakStart: now,
    },
    include: {
      staff: true,
    },
  });
}

async function endBreak(staffId: string) {
  const now = new Date();
  const dateOnly = new Date(now);
  dateOnly.setHours(0, 0, 0, 0);

  const existing = await getAttendanceRecord(staffId, dateOnly);
  if (!existing || !existing.breakStart) {
    throw new Error('No break start record found');
  }

  const breakMinutes = Math.floor((now.getTime() - existing.breakStart.getTime()) / 60000);
  const totalBreakMinutes = (existing.totalBreakMinutes || 0) + breakMinutes;

  return prisma.attendanceRecord.update({
    where: { id: existing.id },
    data: {
      breakEnd: now,
      totalBreakMinutes,
    },
    include: {
      staff: true,
    },
  });
}

async function updateAttendance(id: string, data: Partial<AttendanceRecordInput>) {
  return prisma.attendanceRecord.update({
    where: { id },
    data: {
      ...data,
      clockInLocation: data.clockInLocation as any,
      clockOutLocation: data.clockOutLocation as any,
    },
    include: {
      staff: true,
    },
  });
}

async function markAbsent(staffId: string, date: Date, notes?: string) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  return prisma.attendanceRecord.upsert({
    where: {
      staffId_date: {
        staffId,
        date: dateOnly,
      },
    },
    create: {
      staffId,
      date: dateOnly,
      status: 'Absent',
      notes,
    },
    update: {
      status: 'Absent',
      notes,
    },
    include: {
      staff: true,
    },
  });
}

// ============================================
// Leave Requests
// ============================================

async function createLeaveRequest(input: LeaveRequestInput) {
  return prisma.leaveRequest.create({
    data: input,
    include: {
      staff: true,
    },
  });
}

async function getLeaveRequests(status?: LeaveStatus) {
  return prisma.leaveRequest.findMany({
    where: status ? { status } : undefined,
    include: {
      staff: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getStaffLeaveRequests(staffId: string) {
  return prisma.leaveRequest.findMany({
    where: { staffId },
    include: {
      staff: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function reviewLeaveRequest(
  id: string, 
  status: 'Approved' | 'Rejected', 
  reviewedBy: string,
  reviewNotes?: string
) {
  const leave = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status,
      reviewedBy,
      reviewedAt: new Date(),
      reviewNotes,
    },
    include: {
      staff: true,
    },
  });

  // If approved, create attendance records for leave days
  if (status === 'Approved') {
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      await prisma.attendanceRecord.upsert({
        where: {
          staffId_date: {
            staffId: leave.staffId,
            date: new Date(d),
          },
        },
        create: {
          staffId: leave.staffId,
          date: new Date(d),
          status: 'OnLeave',
          notes: `Leave: ${leave.leaveType}`,
        },
        update: {
          status: 'OnLeave',
          notes: `Leave: ${leave.leaveType}`,
        },
      });
    }
  }

  return leave;
}

async function cancelLeaveRequest(id: string) {
  return prisma.leaveRequest.update({
    where: { id },
    data: {
      status: 'Cancelled',
    },
    include: {
      staff: true,
    },
  });
}

// ============================================
// Settings
// ============================================

async function getSettings() {
  let settings = await prisma.attendanceSettings.findUnique({
    where: { id: 'main' },
  });

  if (!settings) {
    settings = await prisma.attendanceSettings.create({
      data: { id: 'main' },
    });
  }

  return settings;
}

async function updateSettings(data: Partial<{
  workStartTime: string;
  workEndTime: string;
  lunchBreakMinutes: number;
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
  overtimeEnabled: boolean;
  overtimeThresholdHours: number;
  locationTrackingEnabled: boolean;
  clinicLatitude: number;
  clinicLongitude: number;
  allowedRadiusMeters: number;
  workDays: string;
}>) {
  return prisma.attendanceSettings.upsert({
    where: { id: 'main' },
    create: { id: 'main', ...data },
    update: data,
  });
}

// ============================================
// Reports & Analytics
// ============================================

async function getAttendanceReport(params: AttendanceReportParams) {
  const where: any = {
    date: {
      gte: params.startDate,
      lte: params.endDate,
    },
  };

  if (params.staffId) {
    where.staffId = params.staffId;
  }

  const records = await prisma.attendanceRecord.findMany({
    where,
    include: {
      staff: true,
    },
    orderBy: [{ date: 'asc' }, { staffId: 'asc' }],
  });

  // Calculate summary statistics
  const summary = {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    halfDays: 0,
    leaveDays: 0,
    totalWorkedHours: 0,
    totalOvertimeHours: 0,
    averageLateMinutes: 0,
  };

  const staffStats: Record<string, typeof summary & { staffName: string; staffRole: string }> = {};

  records.forEach((record) => {
    summary.totalDays++;
    
    if (!staffStats[record.staffId]) {
      staffStats[record.staffId] = {
        ...summary,
        totalDays: 0,
        staffName: record.staff.name,
        staffRole: record.staff.role,
      };
    }

    const staffStat = staffStats[record.staffId];
    staffStat.totalDays++;

    switch (record.status) {
      case 'Present':
        summary.presentDays++;
        staffStat.presentDays++;
        break;
      case 'Absent':
        summary.absentDays++;
        staffStat.absentDays++;
        break;
      case 'Late':
        summary.lateDays++;
        staffStat.lateDays++;
        summary.presentDays++;
        staffStat.presentDays++;
        break;
      case 'HalfDay':
        summary.halfDays++;
        staffStat.halfDays++;
        break;
      case 'OnLeave':
        summary.leaveDays++;
        staffStat.leaveDays++;
        break;
    }

    if (record.workedHours) {
      const hours = Number(record.workedHours);
      summary.totalWorkedHours += hours;
      staffStat.totalWorkedHours += hours;
    }

    if (record.overtimeHours) {
      const hours = Number(record.overtimeHours);
      summary.totalOvertimeHours += hours;
      staffStat.totalOvertimeHours += hours;
    }

    if (record.lateMinutes) {
      summary.averageLateMinutes += record.lateMinutes;
      staffStat.averageLateMinutes += record.lateMinutes;
    }
  });

  if (summary.lateDays > 0) {
    summary.averageLateMinutes = Math.round(summary.averageLateMinutes / summary.lateDays);
  }

  Object.values(staffStats).forEach((stat) => {
    if (stat.lateDays > 0) {
      stat.averageLateMinutes = Math.round(stat.averageLateMinutes / stat.lateDays);
    }
  });

  return {
    records,
    summary,
    staffStats: Object.values(staffStats),
  };
}

async function getTodayAttendanceSummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [records, totalStaff] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: { date: today },
      include: { staff: true },
    }),
    prisma.staff.count({ where: { status: 'Active' } }),
  ]);

  const present = records.filter((r) => 
    r.status === 'Present' || r.status === 'Late'
  ).length;
  const late = records.filter((r) => r.status === 'Late').length;
  const onLeave = records.filter((r) => r.status === 'OnLeave').length;
  const absent = totalStaff - present - onLeave;

  return {
    totalStaff,
    present,
    absent,
    late,
    onLeave,
    attendanceRate: totalStaff > 0 ? Math.round((present / totalStaff) * 100) : 0,
    records,
  };
}

// ============================================
// Utility Functions
// ============================================

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export const AttendanceService = {
  // Records
  getAttendanceByDate,
  getAttendanceByStaff,
  getAttendanceRecord,
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  updateAttendance,
  markAbsent,
  
  // Leave
  createLeaveRequest,
  getLeaveRequests,
  getStaffLeaveRequests,
  reviewLeaveRequest,
  cancelLeaveRequest,
  
  // Settings
  getSettings,
  updateSettings,
  
  // Reports
  getAttendanceReport,
  getTodayAttendanceSummary,
};
