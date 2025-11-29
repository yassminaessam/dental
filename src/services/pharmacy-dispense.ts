import { prisma } from '@/lib/prisma';

export interface PharmacyDispenseCreateInput {
  prescriptionId?: string;
  medicationId?: string;
  patientId?: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  invoiceId?: string;
  treatmentId?: string;
  notes?: string;
  dispensedBy?: string;
  dispensedAt?: Date;
}

export interface PharmacyDispenseRecord {
  id: string;
  prescriptionId?: string;
  medicationId?: string;
  patientId?: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  invoiceId?: string;
  treatmentId?: string;
  notes?: string;
  dispensedBy?: string;
  dispensedAt: Date;
  createdAt: Date;
}

const mapRow = (row: any): PharmacyDispenseRecord => ({
  id: row.id,
  prescriptionId: row.prescriptionId ?? undefined,
  medicationId: row.medicationId ?? undefined,
  patientId: row.patientId ?? undefined,
  patientName: row.patientName,
  doctorId: row.doctorId ?? undefined,
  doctorName: row.doctorName ?? undefined,
  quantity: row.quantity,
  unitPrice: Number(row.unitPrice),
  totalAmount: Number(row.totalAmount),
  invoiceId: row.invoiceId ?? undefined,
  treatmentId: row.treatmentId ?? undefined,
  notes: row.notes ?? undefined,
  dispensedBy: row.dispensedBy ?? undefined,
  dispensedAt: row.dispensedAt,
  createdAt: row.createdAt,
});

async function list(): Promise<PharmacyDispenseRecord[]> {
  const rows = await prisma.pharmacyDispense.findMany({ orderBy: { dispensedAt: 'desc' } });
  return rows.map(mapRow);
}

async function create(input: PharmacyDispenseCreateInput): Promise<PharmacyDispenseRecord> {
  const created = await prisma.pharmacyDispense.create({
    data: {
      prescriptionId: input.prescriptionId ?? null,
      medicationId: input.medicationId ?? null,
      patientId: input.patientId ?? null,
      patientName: input.patientName,
      doctorId: input.doctorId ?? null,
      doctorName: input.doctorName ?? null,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      totalAmount: input.totalAmount,
      invoiceId: input.invoiceId ?? null,
      treatmentId: input.treatmentId ?? null,
      notes: input.notes ?? null,
      dispensedBy: input.dispensedBy ?? null,
      dispensedAt: input.dispensedAt ?? new Date(),
    },
  });
  return mapRow(created);
}

export const PharmacyDispenseService = { list, create };
