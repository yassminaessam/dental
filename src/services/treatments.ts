import { prisma } from '@/lib/prisma';
import { AppointmentsService, type AppointmentCreateInput } from '@/services/appointments';
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
  treatmentId: string
): AppointmentCreateInput => ({
  id: appointment.appointmentId,
  dateTime: buildAppointmentDateTime(appointment),
  patient: data.patientName,
  patientId: data.patientId,
  doctor: data.doctorName,
  doctorId: data.doctorId,
  type: data.procedure,
  duration: appointment.duration,
  status: appointment.status ?? 'Confirmed',
  treatmentId,
});

const buildAppointmentPatchInput = (
  data: TreatmentUpdateInput,
  appointment: TreatmentAppointmentInput
) => ({
  dateTime: buildAppointmentDateTime(appointment),
  patient: data.patientName,
  patientId: data.patientId,
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

const mapTreatmentRow = async (row: any): Promise<Treatment> => {
  // row is a Prisma Treatment with appointments included
  const appointments: TreatmentAppointment[] = (row.appointments || []).map((ap: any) => ({
    appointmentId: ap.id,
    date: ap.dateTime,
    time: ap.dateTime.toISOString().substring(11, 16), // HH:MM from ISO
    duration: ap.duration,
    status: ap.status,
  }));

  return {
    id: row.id,
    date: row.createdAt.toISOString(),
    patient: row.patient,
    patientId: row.patientId || undefined,
    doctor: row.doctor,
    doctorId: row.doctorId || undefined,
    procedure: row.procedure,
    cost: row.cost,
    status: deriveTreatmentStatus(appointments),
    notes: row.notes || undefined,
    appointments,
  };
};

async function list(): Promise<Treatment[]> {
  const rows = await prisma.treatment.findMany({ include: { appointments: true } });
  return Promise.all(rows.map(mapTreatmentRow));
}

async function get(id: string): Promise<Treatment | null> {
  const row = await prisma.treatment.findUnique({ where: { id }, include: { appointments: true } });
  return row ? mapTreatmentRow(row) : null;
}

async function create(input: TreatmentCreateInput): Promise<Treatment> {
  const treatment = await prisma.treatment.create({
    data: {
      patient: input.patientName,
      patientId: input.patientId,
      doctor: input.doctorName,
      doctorId: input.doctorId,
      procedure: input.procedure,
      cost: input.cost ?? `EGP ${Math.floor(500 + Math.random() * 2000)}`,
      notes: input.notes,
    },
  });

  const createdAppointments: TreatmentAppointment[] = [];
  for (const ap of input.appointments) {
    const created = await AppointmentsService.create(
      buildAppointmentCreateInput(input, ap, treatment.id)
    );
    createdAppointments.push(normalizeAppointment(created, ap));
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
    status: deriveTreatmentStatus(createdAppointments),
    notes: treatment.notes || undefined,
    appointments: createdAppointments,
  };
}

async function update(input: TreatmentUpdateInput): Promise<Treatment> {
  const existing = await prisma.treatment.findUnique({ where: { id: input.id }, include: { appointments: true } });
  if (!existing) throw new Error(`Treatment not found: ${input.id}`);

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
      await AppointmentsService.patch(ap.appointmentId, buildAppointmentPatchInput(input, ap));
      const updated = await AppointmentsService.get(ap.appointmentId);
      if (updated) nextAppointments.push(normalizeAppointment(updated, ap));
    } else {
      const created = await AppointmentsService.create(
        buildAppointmentCreateInput(input, ap, input.id)
      );
      nextAppointments.push(normalizeAppointment(created, ap));
    }
  }

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
      // status derived, stored as enum value
      status: deriveTreatmentStatus(nextAppointments) === 'Completed'
        ? 'Completed'
        : deriveTreatmentStatus(nextAppointments) === 'In Progress'
          ? 'InProgress'
          : 'Pending',
    },
    include: { appointments: true },
  });

  return {
    id: updatedTreatment.id,
    date: updatedTreatment.createdAt.toISOString(),
    patient: updatedTreatment.patient,
    patientId: updatedTreatment.patientId || undefined,
    doctor: updatedTreatment.doctor,
    doctorId: updatedTreatment.doctorId || undefined,
    procedure: updatedTreatment.procedure,
    cost: updatedTreatment.cost,
    status: deriveTreatmentStatus(nextAppointments),
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

export const TreatmentsService = { list, get, create, update, remove };
