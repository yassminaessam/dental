import { prisma } from '@/lib/prisma';

export type PrescriptionStatus = 'Active' | 'Completed';

export interface PrescriptionCreateInput {
  patientId?: string;
  patientName: string;
  doctorId?: string;
  doctorName: string;
  medicationId?: string;
  medicationName: string;
  strength?: string;
  dosage?: string;
  instructions?: string;
  duration?: string;
  refills?: number;
  status?: PrescriptionStatus;
  invoiceId?: string;
  treatmentId?: string;
  dispensedAt?: Date;
  dispensedQuantity?: number;
  totalAmount?: number;
}

export type PrescriptionUpdateInput = Partial<PrescriptionCreateInput> & { id: string };

export interface PrescriptionRecord {
  id: string;
  patientId?: string;
  patientName: string;
  doctorId?: string;
  doctorName: string;
  medicationId?: string;
  medicationName: string;
  strength?: string;
  dosage?: string;
  instructions?: string;
  duration?: string;
  refills: number;
  status: PrescriptionStatus;
  invoiceId?: string;
  treatmentId?: string;
  dispensedAt?: Date;
  dispensedQuantity?: number;
  totalAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const mapRow = (row: any): PrescriptionRecord => ({
  id: row.id,
  patientId: row.patientId ?? undefined,
  patientName: row.patientName,
  doctorId: row.doctorId ?? undefined,
  doctorName: row.doctorName,
  medicationId: row.medicationId ?? undefined,
  medicationName: row.medicationName,
  strength: row.strength ?? undefined,
  dosage: row.dosage ?? undefined,
  instructions: row.instructions ?? undefined,
  duration: row.duration ?? undefined,
  refills: row.refills ?? 0,
  status: row.status,
  invoiceId: row.invoiceId ?? undefined,
  treatmentId: row.treatmentId ?? undefined,
  dispensedAt: row.dispensedAt ?? undefined,
  dispensedQuantity: row.dispensedQuantity ?? undefined,
  totalAmount: row.totalAmount != null ? Number(row.totalAmount) : undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

async function list(): Promise<PrescriptionRecord[]> {
  const rows = await prisma.prescription.findMany({ orderBy: { createdAt: 'desc' } });
  return rows.map(mapRow);
}

async function get(id: string): Promise<PrescriptionRecord | null> {
  const row = await prisma.prescription.findUnique({ where: { id } });
  return row ? mapRow(row) : null;
}

async function create(input: PrescriptionCreateInput): Promise<PrescriptionRecord> {
  const created = await prisma.prescription.create({
    data: {
      patientId: input.patientId ?? null,
      patientName: input.patientName,
      doctorId: input.doctorId ?? null,
      doctorName: input.doctorName,
      medicationId: input.medicationId ?? null,
      medicationName: input.medicationName,
      strength: input.strength ?? null,
      dosage: input.dosage ?? null,
      instructions: input.instructions ?? null,
      duration: input.duration ?? null,
      refills: input.refills ?? 0,
      status: input.status ?? 'Active',
      invoiceId: input.invoiceId ?? null,
      treatmentId: input.treatmentId ?? null,
      dispensedAt: input.dispensedAt ?? null,
      dispensedQuantity: input.dispensedQuantity ?? null,
      totalAmount: input.totalAmount ?? null,
    },
  });
  return mapRow(created);
}

async function update(input: PrescriptionUpdateInput): Promise<PrescriptionRecord> {
  const updated = await prisma.prescription.update({
    where: { id: input.id },
    data: {
      patientId: input.patientId,
      patientName: input.patientName,
      doctorId: input.doctorId,
      doctorName: input.doctorName,
      medicationId: input.medicationId,
      medicationName: input.medicationName,
      strength: input.strength,
      dosage: input.dosage,
      instructions: input.instructions,
      duration: input.duration,
      refills: input.refills,
      status: input.status,
      invoiceId: input.invoiceId,
      treatmentId: input.treatmentId,
      dispensedAt: input.dispensedAt,
      dispensedQuantity: input.dispensedQuantity,
      totalAmount: input.totalAmount,
    },
  });
  return mapRow(updated);
}

async function remove(id: string): Promise<void> {
  await prisma.prescription.delete({ where: { id } });
}

export const PrescriptionsService = { list, get, create, update, remove };
