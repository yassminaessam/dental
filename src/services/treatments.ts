import {
  generateDocumentId,
  listCollection,
  readDocument,
  saveDocument,
  removeDocument,
} from '@/services/datastore.server';
import { AppointmentsService, type AppointmentCreateInput } from '@/services/appointments';
import type {
  Appointment,
  AppointmentStatus,
  Treatment,
  TreatmentAppointment,
  TreatmentStatus,
} from '@/lib/types';

const COLLECTION = 'treatments';

type TreatmentAppointmentRecord = Omit<TreatmentAppointment, 'date'> & {
  date: string;
};

type TreatmentRecord = Omit<Treatment, 'appointments'> & {
  appointments: TreatmentAppointmentRecord[];
};

export interface TreatmentAppointmentInput {
  date: Date;
  time: string;
  duration: string;
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

export interface TreatmentUpdateInput {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  procedure: string;
  cost: string;
  notes?: string;
  appointments: TreatmentAppointmentInput[];
}

const toRecord = (treatment: Treatment): TreatmentRecord => ({
  ...treatment,
  appointments: treatment.appointments.map((appointment) => ({
    ...appointment,
    date: appointment.date.toISOString(),
  })),
});

const fromRecord = (record: TreatmentRecord): Treatment => ({
  ...record,
  appointments: record.appointments.map((appointment) => ({
    ...appointment,
    date: new Date(appointment.date),
  })),
});

async function list(): Promise<Treatment[]> {
  const records = await listCollection<TreatmentRecord>(COLLECTION);
  return records.map(fromRecord);
}

async function get(id: string): Promise<Treatment | null> {
  const record = await readDocument<TreatmentRecord>(COLLECTION, id);
  return record ? fromRecord(record) : null;
}

const buildAppointmentDateTime = (appointment: TreatmentAppointmentInput): Date => {
  const dateTime = new Date(appointment.date);
  const [hours, minutes] = appointment.time.split(':').map((value) => parseInt(value, 10));
  dateTime.setHours(hours);
  dateTime.setMinutes(minutes);
  return dateTime;
};

const buildAppointmentCreateInput = (
  data: TreatmentCreateInput | TreatmentUpdateInput,
  appointment: TreatmentAppointmentInput,
  treatmentId: string
): AppointmentCreateInput => {
  return {
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
  };
};

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

async function create(input: TreatmentCreateInput): Promise<Treatment> {
  const treatmentId = generateDocumentId('TRT');
  const createdAt = new Date();

  const appointmentResults: TreatmentAppointment[] = [];
  for (const appointment of input.appointments) {
    const created = await AppointmentsService.create(
      buildAppointmentCreateInput({ ...input, id: treatmentId }, appointment, treatmentId)
    );
    appointmentResults.push(normalizeAppointment(created, appointment));
  }

  const treatment: Treatment = {
    id: treatmentId,
    date: createdAt.toISOString(),
    patient: input.patientName,
    patientId: input.patientId,
    doctor: input.doctorName,
    doctorId: input.doctorId,
    procedure: input.procedure,
    cost: input.cost ?? `EGP ${Math.floor(500 + Math.random() * 2000)}`,
    status: deriveTreatmentStatus(appointmentResults),
    notes: input.notes ?? '',
    appointments: appointmentResults,
  };

  await saveDocument(COLLECTION, treatment.id, toRecord(treatment));
  return treatment;
}

function deriveTreatmentStatus(appointments: TreatmentAppointment[]): TreatmentStatus {
  if (appointments.length === 0) return 'Pending';
  const completed = appointments.every((appointment) => appointment.status === 'Completed');
  if (completed) return 'Completed';
  const inProgress = appointments.some((appointment) => appointment.status !== 'Pending');
  return inProgress ? 'In Progress' : 'Pending';
}

async function update(input: TreatmentUpdateInput): Promise<Treatment> {
  const existingRecord = await readDocument<TreatmentRecord>(COLLECTION, input.id);
  if (!existingRecord) {
    throw new Error(`Treatment not found: ${input.id}`);
  }

  const existing = fromRecord(existingRecord);
  const incomingIds = new Set(
    input.appointments.map((appointment) => appointment.appointmentId).filter(Boolean) as string[]
  );
  const existingIds = new Set(
    existing.appointments.map((appointment) => appointment.appointmentId).filter(Boolean) as string[]
  );

  // Remove appointments no longer linked to the treatment
  for (const appointmentId of existingIds) {
    if (!incomingIds.has(appointmentId)) {
      await AppointmentsService.remove(appointmentId);
    }
  }

  const nextAppointments: TreatmentAppointment[] = [];
  for (const appointment of input.appointments) {
    if (appointment.appointmentId) {
      await AppointmentsService.patch(appointment.appointmentId, buildAppointmentPatchInput(input, appointment));
      const updated = await AppointmentsService.get(appointment.appointmentId);
      if (updated) {
        nextAppointments.push(normalizeAppointment(updated, appointment));
      }
      continue;
    }

    const created = await AppointmentsService.create(
      buildAppointmentCreateInput(input, appointment, input.id)
    );
    nextAppointments.push(normalizeAppointment(created, appointment));
  }

  const nextTreatment: Treatment = {
    ...existing,
    patient: input.patientName,
    patientId: input.patientId,
    doctor: input.doctorName,
    doctorId: input.doctorId,
    procedure: input.procedure,
    cost: input.cost,
    notes: input.notes ?? '',
    appointments: nextAppointments,
    status: deriveTreatmentStatus(nextAppointments),
  };

  await saveDocument(COLLECTION, nextTreatment.id, toRecord(nextTreatment));
  return nextTreatment;
}

async function remove(id: string): Promise<void> {
  const treatment = await get(id);
  if (treatment) {
    for (const appointment of treatment.appointments) {
      if (appointment.appointmentId) {
        await AppointmentsService.remove(appointment.appointmentId);
      }
    }
  }
  await removeDocument(COLLECTION, id);
}

export const TreatmentsService = {
  list,
  get,
  create,
  update,
  remove,
};
