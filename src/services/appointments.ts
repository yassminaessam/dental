import { generateDocumentId, listCollection, saveDocument, patchDocument, readDocument, removeDocument } from '@/services/datastore.server';
import type { Appointment, AppointmentStatus } from '@/lib/types';
import type { AppointmentCreateInput, AppointmentUpdateInput } from '@/services/appointments.types';
export type { AppointmentCreateInput, AppointmentUpdateInput } from '@/services/appointments.types';

const COLLECTION = 'appointments';

type AppointmentRecord = Omit<Appointment, 'dateTime' | 'createdAt' | 'updatedAt' | 'confirmedAt' | 'rejectedAt'> & {
  dateTime: string;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string;
  rejectedAt?: string;
};

type AppointmentRecordPatch = Partial<Omit<AppointmentRecord, 'id'>> & { id?: string };

const toRecord = (appointment: Appointment): AppointmentRecord => ({
  ...appointment,
  dateTime: appointment.dateTime.toISOString(),
  createdAt: appointment.createdAt ? appointment.createdAt.toISOString() : undefined,
  updatedAt: appointment.updatedAt ? appointment.updatedAt.toISOString() : undefined,
  confirmedAt: appointment.confirmedAt ? appointment.confirmedAt.toISOString() : undefined,
  rejectedAt: appointment.rejectedAt ? appointment.rejectedAt.toISOString() : undefined,
});

const fromRecord = (record: AppointmentRecord): Appointment => ({
  ...record,
  dateTime: new Date(record.dateTime),
  createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
  updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined,
  confirmedAt: record.confirmedAt ? new Date(record.confirmedAt) : undefined,
  rejectedAt: record.rejectedAt ? new Date(record.rejectedAt) : undefined,
});

const serializePatch = (patch: AppointmentUpdateInput): AppointmentRecordPatch => {
  const result: AppointmentRecordPatch = { ...(patch as Record<string, unknown>) };

  if (patch.dateTime) result.dateTime = patch.dateTime.toISOString();
  if (patch.createdAt) result.createdAt = patch.createdAt.toISOString();
  if (patch.updatedAt) result.updatedAt = patch.updatedAt.toISOString();
  if (patch.confirmedAt) result.confirmedAt = patch.confirmedAt.toISOString();
  if (patch.rejectedAt) result.rejectedAt = patch.rejectedAt.toISOString();

  return result;
};

// Types moved to appointments.types.ts for shared use (client/server)

async function get(id: string): Promise<Appointment | null> {
  const record = await readDocument<AppointmentRecord>(COLLECTION, id);
  return record ? fromRecord(record) : null;
}

async function list(): Promise<Appointment[]> {
  const records = await listCollection<AppointmentRecord>(COLLECTION);
  return records.map(fromRecord);
}

async function create(input: AppointmentCreateInput): Promise<Appointment> {
  const now = new Date();
  const appointment: Appointment = {
    id: input.id ?? generateDocumentId('APT'),
    dateTime: input.dateTime,
    patient: input.patient,
    patientId: input.patientId,
    patientEmail: input.patientEmail,
    patientPhone: input.patientPhone,
    doctor: input.doctor,
    doctorId: input.doctorId,
    type: input.type,
    duration: input.duration,
    status: input.status ?? 'Confirmed',
    treatmentId: input.treatmentId,
    notes: input.notes,
    bookedBy: input.bookedBy,
    reason: input.reason,
    urgency: input.urgency,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };

  await saveDocument(COLLECTION, appointment.id, toRecord(appointment));
  return appointment;
}

async function update(appointment: Appointment): Promise<Appointment> {
  const next: Appointment = {
    ...appointment,
    updatedAt: new Date(),
  };
  await saveDocument(COLLECTION, appointment.id, toRecord(next));
  return next;
}

async function patch(id: string, patchInput: AppointmentUpdateInput): Promise<void> {
  const payload = serializePatch({ ...patchInput, updatedAt: patchInput.updatedAt ?? new Date() });
  await patchDocument<AppointmentRecord>(COLLECTION, id, payload);
}

async function updateStatus(
  id: string,
  status: AppointmentStatus,
  metadata?: AppointmentUpdateInput
): Promise<Appointment | null> {
  await patch(id, { status, ...(metadata ?? {}) });
  return get(id);
}

async function listPending(): Promise<Appointment[]> {
  const appointments = await list();
  return appointments
    .filter((appointment) => appointment.status === 'Pending')
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
}

async function remove(id: string): Promise<void> {
  await removeDocument(COLLECTION, id);
}

export const AppointmentsService = {
  list,
  listPending,
  get,
  create,
  update,
  patch,
  updateStatus,
  remove,
};
