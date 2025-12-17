import prisma from '@/lib/db';
import type { ReferralStatus, ReferralUrgency } from '@prisma/client';

export interface ReferralData {
  id: string;
  patientId: string;
  patientName: string;
  specialty: string;
  specialist: string;
  reason: string;
  urgency: ReferralUrgency;
  status: ReferralStatus;
  referringDoctor?: string | null;
  referringDoctorId?: string | null;
  referralDate: Date;
  appointmentDate?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function mapRow(row: any): ReferralData {
  return {
    id: row.id,
    patientId: row.patientId,
    patientName: row.patientName,
    specialty: row.specialty,
    specialist: row.specialist,
    reason: row.reason,
    urgency: row.urgency,
    status: row.status,
    referringDoctor: row.referringDoctor ?? null,
    referringDoctorId: row.referringDoctorId ?? null,
    referralDate: row.referralDate,
    appointmentDate: row.appointmentDate ?? null,
    notes: row.notes ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const ReferralsService = {
  async list(): Promise<ReferralData[]> {
    const rows = await prisma.referral.findMany({ 
      orderBy: { createdAt: 'desc' } 
    });
    return rows.map(mapRow);
  },

  async get(id: string): Promise<ReferralData | null> {
    const row = await prisma.referral.findUnique({ where: { id } });
    return row ? mapRow(row) : null;
  },

  async create(data: {
    patientId: string;
    patientName: string;
    specialty: string;
    specialist: string;
    reason: string;
    urgency: ReferralUrgency;
    referringDoctor?: string;
    referringDoctorId?: string;
    notes?: string;
    appointmentDate?: Date;
  }): Promise<ReferralData> {
    const created = await prisma.referral.create({
      data: {
        patientId: data.patientId,
        patientName: data.patientName,
        specialty: data.specialty,
        specialist: data.specialist,
        reason: data.reason,
        urgency: data.urgency,
        status: 'pending',
        referringDoctor: data.referringDoctor ?? null,
        referringDoctorId: data.referringDoctorId ?? null,
        notes: data.notes ?? null,
        appointmentDate: data.appointmentDate ?? null,
      },
    });
    return mapRow(created);
  },

  async update(id: string, patch: Partial<{
    specialty: string;
    specialist: string;
    reason: string;
    urgency: ReferralUrgency;
    status: ReferralStatus;
    referringDoctor: string;
    referringDoctorId: string;
    notes: string;
    appointmentDate: Date | null;
  }>): Promise<ReferralData> {
    const updated = await prisma.referral.update({
      where: { id },
      data: patch,
    });
    return mapRow(updated);
  },

  async delete(id: string): Promise<void> {
    await prisma.referral.delete({ where: { id } });
  },

  async listByPatient(patientId: string): Promise<ReferralData[]> {
    const rows = await prisma.referral.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapRow);
  },

  async listByStatus(status: ReferralStatus): Promise<ReferralData[]> {
    const rows = await prisma.referral.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapRow);
  },
};
