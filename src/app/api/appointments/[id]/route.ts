import { NextRequest, NextResponse } from 'next/server';
import { AppointmentsService, type AppointmentUpdateInput } from '@/services/appointments';
import { checkAndCreateInvoiceForCompletedTreatment } from '@/services/treatments';
import type { Appointment } from '@/lib/types';

const DATE_FIELDS: Array<keyof AppointmentUpdateInput> = [
  'dateTime',
  'createdAt',
  'updatedAt',
  'confirmedAt',
  'rejectedAt',
];

const serializeAppointment = (appointment: Appointment) => ({
  ...appointment,
  dateTime: appointment.dateTime.toISOString(),
  createdAt: appointment.createdAt?.toISOString(),
  updatedAt: appointment.updatedAt?.toISOString(),
  confirmedAt: appointment.confirmedAt?.toISOString(),
  rejectedAt: appointment.rejectedAt?.toISOString(),
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const body = (await request.json()) as Partial<Record<string, unknown>>;
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Missing update payload.' }, { status: 400 });
    }

    const patch: AppointmentUpdateInput = {};
    for (const [key, value] of Object.entries(body)) {
      if (DATE_FIELDS.includes(key as keyof AppointmentUpdateInput)) {
        if (typeof value === 'string') {
          (patch as Record<string, unknown>)[key] = new Date(value);
        }
      } else {
        (patch as Record<string, unknown>)[key] = value;
      }
    }

  const { id } = await context.params;
  
  // Get appointment before update to check if status is changing to Completed
  const appointmentBefore = await AppointmentsService.get(id);
  const wasCompleted = appointmentBefore?.status === 'Completed';
  const willBeCompleted = patch.status === 'Completed';
  
  await AppointmentsService.patch(id, patch);
  const updated = await AppointmentsService.get(id);
    if (!updated) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    }

    // If appointment was just marked as completed and belongs to a treatment,
    // check if all treatment appointments are now completed
    if (!wasCompleted && willBeCompleted && updated.treatmentId) {
      await checkAndCreateInvoiceForCompletedTreatment(updated.treatmentId);
    }

    return NextResponse.json({ appointment: serializeAppointment(updated) });
  } catch (error) {
    console.error('[api/appointments/[id]] PATCH error', error);
    return NextResponse.json({ error: 'Failed to update appointment.' }, { status: 500 });
  }
}
