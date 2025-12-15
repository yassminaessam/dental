import { NextRequest, NextResponse } from 'next/server';
import { AppointmentsService, type AppointmentUpdateInput } from '@/services/appointments';
import { checkAndCreateInvoiceForCompletedTreatment } from '@/services/treatments';
import { prisma } from '@/lib/prisma';
import type { Appointment } from '@/lib/types';

// Helper function to create notification for patient when appointment status changes
async function createAppointmentNotificationForPatient(
  appointment: Appointment,
  newStatus: string,
  previousStatus?: string
) {
  try {
    if (!appointment.patientEmail) return;

    // Find the patient's user account by email
    const patientUser = await prisma.user.findUnique({
      where: { email: appointment.patientEmail },
      select: { id: true },
    });

    if (!patientUser) return;

    // Map status to notification type and message
    const statusConfig: Record<string, { type: string; title: string; message: string; priority: string }> = {
      'Confirmed': {
        type: 'APPOINTMENT_CONFIRMED',
        title: 'تم تأكيد موعدك | Appointment Confirmed',
        message: `تم تأكيد موعدك يوم ${appointment.dateTime.toLocaleDateString('ar-EG')} | Your appointment on ${appointment.dateTime.toLocaleDateString('en-US')} has been confirmed`,
        priority: 'NORMAL',
      },
      'Cancelled': {
        type: 'APPOINTMENT_CANCELLED',
        title: 'تم إلغاء موعدك | Appointment Cancelled',
        message: `تم إلغاء موعدك${appointment.rejectionReason ? `: ${appointment.rejectionReason}` : ''} | Your appointment has been cancelled`,
        priority: 'HIGH',
      },
      'Completed': {
        type: 'APPOINTMENT_COMPLETED',
        title: 'تم إكمال موعدك | Appointment Completed',
        message: `تم إكمال موعدك بنجاح - ${appointment.type} | Your appointment (${appointment.type}) has been completed`,
        priority: 'NORMAL',
      },
      'Pending': {
        type: 'APPOINTMENT_PENDING',
        title: 'موعد قيد الانتظار | Appointment Pending',
        message: `موعدك يوم ${appointment.dateTime.toLocaleDateString('ar-EG')} قيد المراجعة | Your appointment on ${appointment.dateTime.toLocaleDateString('en-US')} is pending review`,
        priority: 'NORMAL',
      },
    };

    const config = statusConfig[newStatus];
    if (!config) return;

    // Don't notify if status didn't actually change
    if (previousStatus === newStatus) return;

    await prisma.notification.create({
      data: {
        userId: patientUser.id,
        type: config.type as any,
        title: config.title,
        message: config.message,
        relatedId: appointment.id,
        relatedType: 'appointment',
        link: '/patient-appointments',
        priority: config.priority as any,
        metadata: { 
          appointmentType: appointment.type, 
          status: newStatus,
          dateTime: appointment.dateTime.toISOString(),
          doctor: appointment.doctor,
        },
      },
    });
  } catch (error) {
    console.error('[api/appointments] Failed to create patient notification:', error);
  }
}

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
  const previousStatus = appointmentBefore?.status;
  
  await AppointmentsService.patch(id, patch);
  const updated = await AppointmentsService.get(id);
    if (!updated) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    }

    // Create notification for patient if status changed
    if (patch.status && patch.status !== previousStatus) {
      await createAppointmentNotificationForPatient(updated, patch.status, previousStatus);
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
