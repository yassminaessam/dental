import { prisma } from '@/lib/prisma';
import { AppointmentsService, type AppointmentCreateInput } from '@/services/appointments';
import { InvoicesService } from '@/services/invoices';
import { syncInvoiceTransaction } from '@/services/transactions.server';
import type { Appointment, AppointmentStatus, Treatment, TreatmentAppointment, TreatmentStatus } from '@/lib/types';

// Inputs kept consistent with previous API layer
export interface TreatmentAppointmentInput {
  date: Date;
  time: string; // HH:MM 24h
  duration: string; // original string duration
  status?: AppointmentStatus;
  appointmentId?: string;
}

export interface TreatmentCreateInput {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  procedure: string;
  cost?: string;
  notes?: string;
  appointments: TreatmentAppointmentInput[];
  status?: TreatmentStatus;
}

export interface TreatmentUpdateInput extends TreatmentCreateInput {
  id: string;
  cost: string; // required when updating
}

const buildAppointmentDateTime = (appointment: TreatmentAppointmentInput): Date => {
  const dateTime = new Date(appointment.date);
  const [hours, minutes] = appointment.time.split(':').map((v) => parseInt(v, 10));
  dateTime.setHours(hours);
  dateTime.setMinutes(minutes);
  dateTime.setSeconds(0);
  dateTime.setMilliseconds(0);
  return dateTime;
};

const buildAppointmentCreateInput = (
  data: TreatmentCreateInput | TreatmentUpdateInput,
  appointment: TreatmentAppointmentInput,
  treatmentId: string,
  patientPhone?: string,
  patientEmail?: string
): AppointmentCreateInput => ({
  id: appointment.appointmentId,
  dateTime: buildAppointmentDateTime(appointment),
  patient: data.patientName,
  patientId: data.patientId,
  patientPhone,
  patientEmail,
  doctor: data.doctorName,
  doctorId: data.doctorId,
  type: data.procedure,
  duration: appointment.duration,
  status: appointment.status ?? 'Confirmed',
  treatmentId,
});

const buildAppointmentPatchInput = (
  data: TreatmentUpdateInput,
  appointment: TreatmentAppointmentInput,
  patientPhone?: string,
  patientEmail?: string
) => ({
  dateTime: buildAppointmentDateTime(appointment),
  patient: data.patientName,
  patientId: data.patientId,
  patientPhone,
  patientEmail,
  doctor: data.doctorName,
  doctorId: data.doctorId,
  type: data.procedure,
  duration: appointment.duration,
  status: appointment.status ?? 'Confirmed',
  treatmentId: data.id,
});

const normalizeAppointment = (
  appointment: Appointment,
  original: TreatmentAppointmentInput
): TreatmentAppointment => ({
  appointmentId: appointment.id,
  date: appointment.dateTime,
  time: original.time,
  duration: appointment.duration,
  status: appointment.status,
});

function deriveTreatmentStatus(appointments: TreatmentAppointment[]): TreatmentStatus {
  if (appointments.length === 0) return 'Pending';
  const completed = appointments.every((a) => a.status === 'Completed');
  if (completed) return 'Completed';
  const inProgress = appointments.some((a) => a.status !== 'Pending');
  return inProgress ? 'In Progress' : 'Pending';
}

type PrismaTreatmentStatus = 'Pending' | 'InProgress' | 'Completed';

const mapTreatmentStatusToPrisma = (status: TreatmentStatus): PrismaTreatmentStatus => {
  return status === 'In Progress' ? 'InProgress' : status;
};

const mapPrismaStatusToTreatment = (status: PrismaTreatmentStatus): TreatmentStatus => {
  return status === 'InProgress' ? 'In Progress' : status;
};

/**
 * Parse cost string (e.g., "EGP 1,500" or "1500") to numeric value
 */
const parseCostToNumber = (cost: string): number => {
  const match = cost.replace(/,/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

/**
 * Automatically creates an invoice when a treatment is completed.
 * This function checks if an invoice already exists for the treatment,
 * and if not, creates one with the treatment cost as the invoice amount.
 */
async function autoCreateInvoiceForCompletedTreatment(
  treatmentId: string,
  previousStatus: TreatmentStatus,
  newStatus: TreatmentStatus
): Promise<void> {
  // Only trigger when status changes TO 'Completed'
  if (newStatus !== 'Completed' || previousStatus === 'Completed') {
    return;
  }

  try {
    // Check if invoice already exists for this treatment
    const existingInvoice = await prisma.invoice.findFirst({
      where: { treatmentId },
    });

    if (existingInvoice) {
      console.log(`[auto-invoice] Invoice already exists for treatment ${treatmentId}`);
      return;
    }

    // Get full treatment details
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: { appointments: true },
    });

    if (!treatment || !treatment.patientId) {
      console.log(`[auto-invoice] Cannot create invoice: treatment or patientId missing`);
      return;
    }

    // Get patient details
    const patient = await prisma.patient.findUnique({
      where: { id: treatment.patientId },
    });

    if (!patient) {
      console.log(`[auto-invoice] Cannot create invoice: patient not found`);
      return;
    }

    // Parse cost from treatment
    const amount = parseCostToNumber(treatment.cost);
    if (amount <= 0) {
      console.log(`[auto-invoice] Cannot create invoice: invalid cost amount`);
      return;
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    // Create the invoice
    const invoice = await InvoicesService.create({
      number: invoiceNumber,
      patientId: treatment.patientId,
      patientNameSnapshot: `${patient.name} ${patient.lastName ?? ''}`.trim(),
      patientPhoneSnapshot: patient.phone,
      treatmentId: treatment.id,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'Sent', // Auto-created invoices are immediately sent
      notes: `Auto-generated invoice for completed treatment: ${treatment.procedure}`,
      amountPaid: 0,
      items: [
        {
          description: treatment.procedure,
          quantity: 1,
          unitPrice: amount,
        },
      ],
    });

    // Sync with transactions
    try {
      await syncInvoiceTransaction(invoice);
    } catch (error) {
      console.error('[auto-invoice] Transaction sync error:', error);
    }

    console.log(`[auto-invoice] Successfully created invoice ${invoice.number} for treatment ${treatmentId}`);
  } catch (error) {
    console.error('[auto-invoice] Error creating invoice:', error);
    // Don't throw - we don't want to fail the treatment update
  }
}

const mapTreatmentRow = async (row: any): Promise<Treatment> => {
  // row is a Prisma Treatment with appointments included
  const appointments: TreatmentAppointment[] = (row.appointments || []).map((ap: any) => ({
    appointmentId: ap.id,
    date: ap.dateTime,
    time: ap.dateTime.toISOString().substring(11, 16), // HH:MM from ISO
    duration: ap.duration,
    status: ap.status,
  }));

  const storedStatus = mapPrismaStatusToTreatment(row.status);
  const derivedStatus = deriveTreatmentStatus(appointments);
  const status = appointments.length === 0 ? storedStatus : derivedStatus;

  return {
    id: row.id,
    date: row.createdAt.toISOString(),
    patient: row.patient,
    patientId: row.patientId || undefined,
    doctor: row.doctor,
    doctorId: row.doctorId || undefined,
    procedure: row.procedure,
    cost: row.cost,
    status,
    notes: row.notes || undefined,
    appointments,
  };
};

async function list(): Promise<Treatment[]> {
  const rows = await prisma.treatment.findMany({ 
    include: { appointments: true },
    orderBy: { createdAt: 'desc' }  // Newest first
  });
  return Promise.all(rows.map(mapTreatmentRow));
}

async function get(id: string): Promise<Treatment | null> {
  const row = await prisma.treatment.findUnique({ where: { id }, include: { appointments: true } });
  return row ? mapTreatmentRow(row) : null;
}

async function create(input: TreatmentCreateInput): Promise<Treatment> {
  const requestedStatus = input.status ?? 'Pending';

  // Look up patient phone and email from the database
  let patientPhone: string | undefined;
  let patientEmail: string | undefined;
  if (input.patientId) {
    const patient = await prisma.patient.findUnique({
      where: { id: input.patientId },
      select: { phone: true, email: true },
    });
    patientPhone = patient?.phone ?? undefined;
    patientEmail = patient?.email ?? undefined;
  }

  const treatment = await prisma.treatment.create({
    data: {
      patient: input.patientName,
      patientId: input.patientId,
      doctor: input.doctorName,
      doctorId: input.doctorId,
      procedure: input.procedure,
      cost: input.cost ?? `EGP ${Math.floor(500 + Math.random() * 2000)}`,
      notes: input.notes,
      status: mapTreatmentStatusToPrisma(requestedStatus),
    },
  });

  const createdAppointments: TreatmentAppointment[] = [];
  for (const ap of input.appointments) {
    const created = await AppointmentsService.create(
      buildAppointmentCreateInput(input, ap, treatment.id, patientPhone, patientEmail)
    );
    createdAppointments.push(normalizeAppointment(created, ap));
  }

  const finalStatus = input.status ?? deriveTreatmentStatus(createdAppointments);
  const finalPrismaStatus = mapTreatmentStatusToPrisma(finalStatus);
  if (finalPrismaStatus !== mapTreatmentStatusToPrisma(requestedStatus)) {
    await prisma.treatment.update({
      where: { id: treatment.id },
      data: { status: finalPrismaStatus },
    });
  }

  return {
    id: treatment.id,
    date: treatment.createdAt.toISOString(),
    patient: treatment.patient,
    patientId: treatment.patientId || undefined,
    doctor: treatment.doctor,
    doctorId: treatment.doctorId || undefined,
    procedure: treatment.procedure,
    cost: treatment.cost,
    status: finalStatus,
    notes: treatment.notes || undefined,
    appointments: createdAppointments,
  };
}

async function update(input: TreatmentUpdateInput): Promise<Treatment> {
  const existing = await prisma.treatment.findUnique({ where: { id: input.id }, include: { appointments: true } });
  if (!existing) throw new Error(`Treatment not found: ${input.id}`);

  // Get previous status for auto-invoice check
  const previousStatus = mapPrismaStatusToTreatment(existing.status as PrismaTreatmentStatus);

  // Look up patient phone and email from the database
  let patientPhone: string | undefined;
  let patientEmail: string | undefined;
  if (input.patientId) {
    const patient = await prisma.patient.findUnique({
      where: { id: input.patientId },
      select: { phone: true, email: true },
    });
    patientPhone = patient?.phone ?? undefined;
    patientEmail = patient?.email ?? undefined;
  }

  // Fetch existing linked appointments via service for consistent mapping
  const existingAppointments = await Promise.all(
    existing.appointments.map(async (ap) => AppointmentsService.get(ap.id))
  );
  const filteredExisting = existingAppointments.filter(Boolean) as Appointment[];
  const incomingIds = new Set(
    input.appointments.map((a) => a.appointmentId).filter(Boolean) as string[]
  );
  const existingIds = new Set(filteredExisting.map((a) => a.id));

  for (const id of existingIds) {
    if (!incomingIds.has(id)) await AppointmentsService.remove(id);
  }

  const nextAppointments: TreatmentAppointment[] = [];
  for (const ap of input.appointments) {
    if (ap.appointmentId) {
      await AppointmentsService.patch(ap.appointmentId, buildAppointmentPatchInput(input, ap, patientPhone, patientEmail));
      const updated = await AppointmentsService.get(ap.appointmentId);
      if (updated) nextAppointments.push(normalizeAppointment(updated, ap));
    } else {
      const created = await AppointmentsService.create(
        buildAppointmentCreateInput(input, ap, input.id, patientPhone, patientEmail)
      );
      nextAppointments.push(normalizeAppointment(created, ap));
    }
  }

  const updatedStatus = deriveTreatmentStatus(nextAppointments);

  const updatedTreatment = await prisma.treatment.update({
    where: { id: input.id },
    data: {
      patient: input.patientName,
      patientId: input.patientId,
      doctor: input.doctorName,
      doctorId: input.doctorId,
      procedure: input.procedure,
      cost: input.cost,
      notes: input.notes,
      status: mapTreatmentStatusToPrisma(updatedStatus),
    },
    include: { appointments: true },
  });

  // Auto-create invoice when treatment is completed
  await autoCreateInvoiceForCompletedTreatment(input.id, previousStatus, updatedStatus);

  return {
    id: updatedTreatment.id,
    date: updatedTreatment.createdAt.toISOString(),
    patient: updatedTreatment.patient,
    patientId: updatedTreatment.patientId || undefined,
    doctor: updatedTreatment.doctor,
    doctorId: updatedTreatment.doctorId || undefined,
    procedure: updatedTreatment.procedure,
    cost: updatedTreatment.cost,
    status: updatedStatus,
    notes: updatedTreatment.notes || undefined,
    appointments: nextAppointments,
  };
}

async function remove(id: string): Promise<void> {
  const treatment = await get(id);
  if (treatment) {
    for (const ap of treatment.appointments) {
      if (ap.appointmentId) await AppointmentsService.remove(ap.appointmentId);
    }
  }
  await prisma.treatment.delete({ where: { id } }).catch(() => {});
}

/**
 * Check if a treatment is now completed (all appointments completed)
 * and automatically create an invoice if so.
 * This is called when an appointment status is changed to Completed.
 */
export async function checkAndCreateInvoiceForCompletedTreatment(treatmentId: string): Promise<void> {
  try {
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      include: { appointments: true },
    });

    if (!treatment) return;

    // Check if all appointments are completed
    const allCompleted = treatment.appointments.length > 0 && 
      treatment.appointments.every((ap) => ap.status === 'Completed');

    if (!allCompleted) return;

    // Get the previous status before this might have made it complete
    const previousStatus = mapPrismaStatusToTreatment(treatment.status as PrismaTreatmentStatus);
    
    // Update treatment status to Completed if not already
    if (previousStatus !== 'Completed') {
      await prisma.treatment.update({
        where: { id: treatmentId },
        data: { status: 'Completed' },
      });
    }

    // Create invoice for the completed treatment
    await autoCreateInvoiceForCompletedTreatment(treatmentId, previousStatus, 'Completed');
  } catch (error) {
    console.error('[checkAndCreateInvoiceForCompletedTreatment] Error:', error);
  }
}

export const TreatmentsService = { list, get, create, update, remove };
