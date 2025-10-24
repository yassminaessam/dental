import { NextRequest, NextResponse } from 'next/server';
import { AppointmentsService, type AppointmentCreateInput } from '@/services/appointments';
import type { Appointment } from '@/lib/types';

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

    return NextResponse.json({ appointment: serializeAppointment(appointment) }, { status: 201 });
  } catch (error) {
    console.error('[api/appointments] POST error', error);
    return NextResponse.json({ error: 'Failed to create appointment.' }, { status: 500 });
  }
}