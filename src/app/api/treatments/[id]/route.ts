import { NextResponse } from 'next/server';
import { TreatmentsService, type TreatmentUpdateInput, type TreatmentAppointmentInput } from '@/services/treatments';
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

const parseUpdatePayload = async (request: Request): Promise<TreatmentUpdateInput> => {
  const body = await request.json();

  if (!body?.id || !body?.patientId || !body?.patientName || !body?.doctorId || !body?.doctorName || !body?.procedure || !body?.cost) {
    throw new Error('Missing required treatment fields.');
  }

  const appointments = Array.isArray(body.appointments) ? body.appointments : [];

  return {
    id: body.id,
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
  } satisfies TreatmentUpdateInput;
};

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const treatment = await TreatmentsService.get(id);
    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found.' }, { status: 404 });
    }
    return NextResponse.json({ treatment: serializeTreatment(treatment) });
  } catch (error) {
    console.error('[api/treatments/[id]] GET error', error);
    return NextResponse.json({ error: 'Failed to load treatment.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const payload = await parseUpdatePayload(request);
    const { id } = await context.params;
    if (payload.id !== id) {
      throw new Error('Mismatched treatment identifier.');
    }
    const updated = await TreatmentsService.update(payload);
    return NextResponse.json({ treatment: serializeTreatment(updated) });
  } catch (error: any) {
    console.error('[api/treatments/[id]] PATCH error', error);
    const message = error?.message ?? 'Failed to update treatment.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await TreatmentsService.remove(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/treatments/[id]] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete treatment.' }, { status: 500 });
  }
}