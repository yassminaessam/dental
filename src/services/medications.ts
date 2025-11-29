import { prisma } from '@/lib/prisma';

export type MedicationStatus = 'InStock' | 'LowStock' | 'OutOfStock';

export interface MedicationCreateInput {
  name: string;
  fullName?: string;
  strength?: string;
  form?: string;
  category?: string;
  stock: number;
  unitPrice: number;
  expiryDate?: Date;
  status?: MedicationStatus;
  inventoryItemId?: string;
}

export type MedicationUpdateInput = Partial<MedicationCreateInput> & { id: string };

export interface MedicationRecord {
  id: string;
  name: string;
  fullName?: string;
  strength?: string;
  form?: string;
  category?: string;
  stock: number;
  unitPrice: number;
  expiryDate?: Date;
  status: MedicationStatus;
  inventoryItemId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const resolveStatus = (stock: number): MedicationStatus => {
  if (stock <= 0) return 'OutOfStock';
  if (stock <= 20) return 'LowStock';
  return 'InStock';
};

const mapRow = (row: any): MedicationRecord => ({
  id: row.id,
  name: row.name,
  fullName: row.fullName ?? undefined,
  strength: row.strength ?? undefined,
  form: row.form ?? undefined,
  category: row.category ?? undefined,
  stock: row.stock,
  unitPrice: Number(row.unitPrice),
  expiryDate: row.expiryDate ?? undefined,
  status: row.status,
  inventoryItemId: row.inventoryItemId ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

async function list(): Promise<MedicationRecord[]> {
  const rows = await prisma.medication.findMany({ orderBy: { name: 'asc' } });
  return rows.map(mapRow);
}

async function get(id: string): Promise<MedicationRecord | null> {
  const row = await prisma.medication.findUnique({ where: { id } });
  return row ? mapRow(row) : null;
}

async function create(input: MedicationCreateInput): Promise<MedicationRecord> {
  const created = await prisma.medication.create({
    data: {
      name: input.name,
      fullName: input.fullName ?? null,
      strength: input.strength ?? null,
      form: input.form ?? null,
      category: input.category ?? null,
      stock: input.stock,
      unitPrice: input.unitPrice,
      expiryDate: input.expiryDate ?? null,
      status: input.status ?? resolveStatus(input.stock),
      inventoryItemId: input.inventoryItemId ?? null,
    },
  });
  return mapRow(created);
}

async function update(input: MedicationUpdateInput): Promise<MedicationRecord> {
  const updated = await prisma.medication.update({
    where: { id: input.id },
    data: {
      name: input.name,
      fullName: input.fullName,
      strength: input.strength,
      form: input.form,
      category: input.category,
      stock: input.stock,
      unitPrice: input.unitPrice,
      expiryDate: input.expiryDate,
      status: input.status ?? (input.stock != null ? resolveStatus(input.stock) : undefined),
      inventoryItemId: input.inventoryItemId,
    },
  });
  return mapRow(updated);
}

async function remove(id: string): Promise<void> {
  await prisma.medication.delete({ where: { id } });
}

export const MedicationsService = { list, get, create, update, remove, resolveStatus };
