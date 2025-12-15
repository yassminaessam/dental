import { NextRequest, NextResponse } from 'next/server';
import { AppointmentsService, type AppointmentCreateInput } from '@/services/appointments';
import { prisma } from '@/lib/prisma';
import type { Appointment } from '@/lib/types';

// Helper function to create notifications for admin/staff when a new appointment is booked
async function createAppointmentNotificationForAdmins(appointment: Appointment) {
  try {
    // Only notify for appointments booked by patients (status Pending)
    if (appointment.status !== 'Pending' && appointment.bookedBy !== 'patient') return;

    // Get all admin and receptionist users who should receive notifications
    const staffUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'receptionist'],
        },
        isActive: true,
      },
      select: { id: true },
    });

    if (staffUsers.length === 0) return;

    // Format date for display
    const dateStr = appointment.dateTime.toLocaleDateString('ar-EG');
    const timeStr = appointment.dateTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    // Create notifications for all staff users
    const notifications = staffUsers.map((user) => ({
      userId: user.id,
      type: 'APPOINTMENT_PENDING' as const,
      title: 'طلب موعد جديد | New Appointment Request',
      message: `${appointment.patient} - ${appointment.type} | ${dateStr} ${timeStr}`,
      relatedId: appointment.id,
      relatedType: 'appointment',
      link: `/appointments?id=${appointment.id}`,
      priority: appointment.urgency === 'High' ? 'HIGH' as const : 'NORMAL' as const,
      metadata: { 
        patientName: appointment.patient, 
        appointmentType: appointment.type,
        dateTime: appointment.dateTime.toISOString(),
        urgency: appointment.urgency,
      },
    }));

    await prisma.notification.createMany({
      data: notifications,
    });
  } catch (error) {
    console.error('[api/appointments] Failed to create admin notifications:', error);
  }
}

type SerializedAppointment = Omit<Appointment, 'dateTime' | 'createdAt' | 'updatedAt' | 'confirmedAt' | 'rejectedAt'> & {
  dateTime: string;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string;
  rejectedAt?: string;
};

const serializeAppointment = (appointment: Appointment): SerializedAppointment => ({
  ...appointment,
  dateTime: appointment.dateTime.toISOString(),
  createdAt: appointment.createdAt?.toISOString(),
  updatedAt: appointment.updatedAt?.toISOString(),
  confirmedAt: appointment.confirmedAt?.toISOString(),
  rejectedAt: appointment.rejectedAt?.toISOString(),
});

type AppointmentCreateRequest = Omit<AppointmentCreateInput,
  'dateTime' | 'createdAt' | 'updatedAt' | 'confirmedAt' | 'rejectedAt'
> & {
  dateTime: string;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string;
  rejectedAt?: string;
};

export async function GET() {
  try {
    const appointments = await AppointmentsService.list();
    return NextResponse.json({ appointments: appointments.map(serializeAppointment) });
  } catch (error) {
    console.error('[api/appointments] GET error', error);
    return NextResponse.json({ error: 'Failed to load appointments.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<AppointmentCreateRequest> & { dateTime: string };
    const normalizeDate = (value?: string) => (value ? new Date(value) : undefined);

    if (!payload?.dateTime || !payload.patient || !payload.doctor || !payload.type || !payload.duration) {
      return NextResponse.json({ error: 'Missing required appointment fields.' }, { status: 400 });
    }

    const appointment = await AppointmentsService.create({
      ...payload,
      dateTime: new Date(payload.dateTime),
      createdAt: normalizeDate(payload.createdAt),
      updatedAt: normalizeDate(payload.updatedAt),
      confirmedAt: normalizeDate(payload.confirmedAt),
      rejectedAt: normalizeDate(payload.rejectedAt),
    } as AppointmentCreateInput);

    // Create notification for admin/staff about new appointment request
    await createAppointmentNotificationForAdmins(appointment);

    return NextResponse.json({ appointment: serializeAppointment(appointment) }, { status: 201 });
  } catch (error) {
    console.error('[api/appointments] POST error', error);
    return NextResponse.json({ error: 'Failed to create appointment.' }, { status: 500 });
  }
}