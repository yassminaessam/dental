import prisma from '@/lib/db';
import type { Appointment, AppointmentStatus } from '@/lib/types';
import type { AppointmentCreateInput, AppointmentUpdateInput } from '@/services/appointments.types';
export type { AppointmentCreateInput, AppointmentUpdateInput } from '@/services/appointments.types';

function mapRowToAppointment(row: any, patientPhoneLookup?: string): Appointment {
  return {
    id: row.id,
    dateTime: new Date(row.dateTime),
    patient: row.patient,
    patientId: row.patientId ?? undefined,
    patientEmail: row.patientEmail ?? undefined,
    // Use patientPhone from appointment if available, otherwise use lookup from Patient table
    patientPhone: row.patientPhone ?? patientPhoneLookup ?? undefined,
    doctor: row.doctor,
    doctorId: row.doctorId ?? undefined,
    type: row.type,
    duration: row.duration,
    status: row.status as AppointmentStatus,
    treatmentId: row.treatmentId ?? undefined,
    notes: row.notes ?? undefined,
    bookedBy: row.bookedBy ?? undefined,
    createdAt: row.createdAt ?? undefined,
    updatedAt: row.updatedAt ?? undefined,
    reason: row.reason ?? undefined,
    urgency: row.urgency ?? undefined,
    confirmedAt: row.confirmedAt ?? undefined,
    confirmedBy: row.confirmedBy ?? undefined,
    rejectedAt: row.rejectedAt ?? undefined,
    rejectionReason: row.rejectionReason ?? undefined,
    rejectedBy: row.rejectedBy ?? undefined,
  };
}

async function get(id: string): Promise<Appointment | null> {
  const row = await prisma.appointment.findUnique({ where: { id } });
  if (!row) return null;
  
  // If patientPhone is missing but we have patientId, look it up from Patient table
  let patientPhoneLookup: string | undefined;
  if (!row.patientPhone && row.patientId) {
    const patient = await prisma.patient.findUnique({
      where: { id: row.patientId },
      select: { phone: true }
    });
    patientPhoneLookup = patient?.phone ?? undefined;
  }
  
  return mapRowToAppointment(row, patientPhoneLookup);
}

async function list(): Promise<Appointment[]> {
  const rows = await prisma.appointment.findMany({ orderBy: { dateTime: 'desc' } });
  
  // Get all patient IDs that need phone lookup
  const patientIdsNeedingLookup = rows
    .filter(row => !row.patientPhone && row.patientId)
    .map(row => row.patientId as string);
  
  // Fetch all patient phones in one query
  const patientPhoneMap = new Map<string, string>();
  if (patientIdsNeedingLookup.length > 0) {
    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIdsNeedingLookup } },
      select: { id: true, phone: true }
    });
    patients.forEach(p => {
      if (p.phone) patientPhoneMap.set(p.id, p.phone);
    });
  }
  
  return rows.map(row => {
    const lookupPhone = row.patientId ? patientPhoneMap.get(row.patientId) : undefined;
    return mapRowToAppointment(row, lookupPhone);
  });
}

async function create(input: AppointmentCreateInput): Promise<Appointment> {
  const created = await prisma.appointment.create({
    data: {
      id: input.id, // allow custom ids if provided
      dateTime: input.dateTime,
      patient: input.patient,
      patientId: input.patientId ?? null,
      patientEmail: input.patientEmail ?? null,
      patientPhone: input.patientPhone ?? null,
      doctor: input.doctor,
      doctorId: input.doctorId ?? null,
      type: input.type,
      duration: input.duration,
      status: (input.status ?? 'Confirmed') as any,
      treatmentId: input.treatmentId ?? null,
      notes: input.notes ?? null,
      bookedBy: input.bookedBy ?? null,
      reason: input.reason ?? null,
      urgency: input.urgency ?? null,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      confirmedAt: input.confirmedAt,
      confirmedBy: input.confirmedBy ?? null,
      rejectedAt: input.rejectedAt,
      rejectionReason: input.rejectionReason ?? null,
      rejectedBy: input.rejectedBy ?? null,
    },
  });
  return mapRowToAppointment(created);
}

async function update(appointment: Appointment): Promise<Appointment> {
  const updated = await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      dateTime: appointment.dateTime,
      patient: appointment.patient,
      patientId: appointment.patientId ?? null,
      patientEmail: appointment.patientEmail ?? null,
      patientPhone: appointment.patientPhone ?? null,
      doctor: appointment.doctor,
      doctorId: appointment.doctorId ?? null,
      type: appointment.type,
      duration: appointment.duration,
      status: appointment.status as any,
      treatmentId: appointment.treatmentId ?? null,
      notes: appointment.notes ?? null,
      bookedBy: appointment.bookedBy ?? null,
      reason: appointment.reason ?? null,
      urgency: appointment.urgency ?? null,
      confirmedAt: appointment.confirmedAt ?? null,
      confirmedBy: appointment.confirmedBy ?? null,
      rejectedAt: appointment.rejectedAt ?? null,
      rejectionReason: appointment.rejectionReason ?? null,
      rejectedBy: appointment.rejectedBy ?? null,
    },
  });
  return mapRowToAppointment(updated);
}

async function patch(id: string, patchInput: AppointmentUpdateInput): Promise<void> {
  const data: Record<string, any> = { ...patchInput };
  if ('patientId' in data) data.patientId ??= null;
  if ('patientEmail' in data) data.patientEmail ??= null;
  if ('patientPhone' in data) data.patientPhone ??= null;
  if ('doctorId' in data) data.doctorId ??= null;
  if ('treatmentId' in data) data.treatmentId ??= null;
  if ('notes' in data) data.notes ??= null;
  if ('bookedBy' in data) data.bookedBy ??= null;
  if ('reason' in data) data.reason ??= null;
  if ('urgency' in data) data.urgency ??= null;
  if ('confirmedAt' in data) data.confirmedAt ??= null;
  if ('confirmedBy' in data) data.confirmedBy ??= null;
  if ('rejectedAt' in data) data.rejectedAt ??= null;
  if ('rejectionReason' in data) data.rejectionReason ??= null;
  if ('rejectedBy' in data) data.rejectedBy ??= null;
  await prisma.appointment.update({ where: { id }, data });
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
  const rows = await prisma.appointment.findMany({ where: { status: 'Pending' as any }, orderBy: { dateTime: 'asc' } });
  
  // Get all patient IDs that need phone lookup
  const patientIdsNeedingLookup = rows
    .filter(row => !row.patientPhone && row.patientId)
    .map(row => row.patientId as string);
  
  // Fetch all patient phones in one query
  const patientPhoneMap = new Map<string, string>();
  if (patientIdsNeedingLookup.length > 0) {
    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIdsNeedingLookup } },
      select: { id: true, phone: true }
    });
    patients.forEach(p => {
      if (p.phone) patientPhoneMap.set(p.id, p.phone);
    });
  }
  
  return rows.map(row => {
    const lookupPhone = row.patientId ? patientPhoneMap.get(row.patientId) : undefined;
    return mapRowToAppointment(row, lookupPhone);
  });
}

async function remove(id: string): Promise<void> {
  await prisma.appointment.delete({ where: { id } });
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
