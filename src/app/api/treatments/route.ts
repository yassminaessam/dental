import { NextResponse } from 'next/server';
import { TreatmentsService, type TreatmentCreateInput, type TreatmentAppointmentInput } from '@/services/treatments';
import type { Appointment, Treatment } from '@/lib/types';

type SerializedTreatment = Omit<Treatment, 'appointments'> & {
  appointments: Array<{
    appointmentId?: string;
    date: string;
    time: string;
    duration: string;
    status: Appointment['status'];
  }>;
};

const serializeTreatment = (treatment: Treatment): SerializedTreatment => ({
  ...treatment,
  appointments: treatment.appointments.map((appointment) => ({
    appointmentId: appointment.appointmentId,
    date: appointment.date.toISOString(),
    time: appointment.time,
    duration: appointment.duration,
    status: appointment.status,
  })),
});

const parseCreatePayload = async (request: Request): Promise<TreatmentCreateInput> => {
  const body = await request.json();

  if (!body?.patientId || !body?.patientName || !body?.doctorId || !body?.doctorName || !body?.procedure) {
    throw new Error('Missing required treatment fields.');
  }

  const appointments = Array.isArray(body.appointments) ? body.appointments : [];

  return {
    patientId: body.patientId,
    patientName: body.patientName,
    doctorId: body.doctorId,
    doctorName: body.doctorName,
    procedure: body.procedure,
    cost: body.cost,
    notes: body.notes,
    appointments: appointments.map((appointment: any) => ({
      appointmentId: appointment.appointmentId,
      date: new Date(appointment.date),
      time: appointment.time,
      duration: appointment.duration,
      status: appointment.status,
    } as TreatmentAppointmentInput)),
  } satisfies TreatmentCreateInput;
};

export async function GET() {
  try {
    const treatments = await TreatmentsService.list();
    return NextResponse.json({ treatments: treatments.map(serializeTreatment) });
  } catch (error) {
    console.error('[api/treatments] GET error', error);
    return NextResponse.json({ error: 'Failed to load treatments.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseCreatePayload(request);
    const treatment = await TreatmentsService.create(payload);
    return NextResponse.json({ treatment: serializeTreatment(treatment) }, { status: 201 });
  } catch (error: any) {
    console.error('[api/treatments] POST error', error);
    const message = error?.message ?? 'Failed to create treatment.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}