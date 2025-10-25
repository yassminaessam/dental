import type { Appointment } from '@/lib/types';
import type { AppointmentCreateInput, AppointmentUpdateInput } from '@/services/appointments.types';

// Serialized shape used by the API
interface SerializedAppointment extends Omit<Appointment, 'dateTime' | 'createdAt' | 'updatedAt' | 'confirmedAt' | 'rejectedAt'> {
  dateTime: string;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string;
  rejectedAt?: string;
}

function toAppointment(s: SerializedAppointment): Appointment {
  return {
    ...s,
    dateTime: new Date(s.dateTime),
    createdAt: s.createdAt ? new Date(s.createdAt) : undefined,
    updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
    confirmedAt: s.confirmedAt ? new Date(s.confirmedAt) : undefined,
    rejectedAt: s.rejectedAt ? new Date(s.rejectedAt) : undefined,
  };
}

function toSerializedPatch(patch: AppointmentUpdateInput): Partial<SerializedAppointment> {
  const out: Record<string, unknown> = { ...patch };
  if (patch.dateTime) out.dateTime = patch.dateTime.toISOString();
  if (patch.createdAt) out.createdAt = patch.createdAt.toISOString();
  if (patch.updatedAt) out.updatedAt = patch.updatedAt.toISOString();
  if (patch.confirmedAt) out.confirmedAt = patch.confirmedAt.toISOString();
  if (patch.rejectedAt) out.rejectedAt = patch.rejectedAt.toISOString();
  return out as Partial<SerializedAppointment>;
}

async function list(): Promise<Appointment[]> {
  const res = await fetch('/api/appointments', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load appointments');
  const data: { appointments: SerializedAppointment[] } = await res.json();
  return data.appointments.map(toAppointment);
}

async function create(input: AppointmentCreateInput): Promise<Appointment> {
  const body: Record<string, unknown> = { ...input, dateTime: input.dateTime.toISOString() };
  if (input.createdAt) body.createdAt = input.createdAt.toISOString();
  if (input.updatedAt) body.updatedAt = input.updatedAt.toISOString();
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create appointment');
  const data: { appointment: SerializedAppointment } = await res.json();
  return toAppointment(data.appointment);
}

async function update(appointment: Appointment): Promise<Appointment> {
  const res = await fetch(`/api/appointments/${encodeURIComponent(appointment.id)}` , {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSerializedPatch({ ...appointment })),
  });
  if (!res.ok) throw new Error('Failed to update appointment');
  const data: { appointment: SerializedAppointment } = await res.json();
  return toAppointment(data.appointment);
}

async function patch(id: string, patchInput: AppointmentUpdateInput): Promise<void> {
  const res = await fetch(`/api/appointments/${encodeURIComponent(id)}` , {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSerializedPatch(patchInput)),
  });
  if (!res.ok) throw new Error('Failed to update appointment');
}

async function updateStatus(id: string, status: Appointment['status']): Promise<Appointment | null> {
  await patch(id, { status, updatedAt: new Date() });
  // Fetch latest
  const res = await fetch(`/api/appointments/${encodeURIComponent(id)}` , { method: 'GET' });
  if (!res.ok) return null;
  const data: { appointment: SerializedAppointment } = await res.json();
  return toAppointment(data.appointment);
}

export const AppointmentsClient = {
  list,
  create,
  update,
  patch,
  updateStatus,
};
