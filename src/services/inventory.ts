import { prisma } from '@/lib/prisma';

export type InventoryItemStatus = 'Normal' | 'LowStock' | 'OutOfStock';

export interface InventoryCreateInput {
  name: string;
  category?: string;
  supplierId?: string;
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  unitCost: number;
  status?: InventoryItemStatus;
  expires?: Date;
}

export type InventoryUpdateInput = Partial<InventoryCreateInput> & { id: string };

export interface InventoryItem {
  id: string;
  name: string;
  category?: string;
  supplierId?: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitCost: number;
  status: InventoryItemStatus;
  expires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mapRow = (row: any): InventoryItem => ({
  id: row.id,
  name: row.name,
  category: row.category ?? undefined,
  supplierId: row.supplierId ?? undefined,
  quantity: row.quantity,
  minQuantity: row.minQuantity,
  maxQuantity: row.maxQuantity,
  unitCost: Number(row.unitCost),
  status: row.status,
  expires: row.expires ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

async function list(): Promise<InventoryItem[]> {
  const rows = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  return rows.map(mapRow);
}

async function get(id: string): Promise<InventoryItem | null> {
  const row = await prisma.inventoryItem.findUnique({ where: { id } });
  return row ? mapRow(row) : null;
}

async function create(input: InventoryCreateInput): Promise<InventoryItem> {
  const created = await prisma.inventoryItem.create({
    data: {
      name: input.name,
      category: input.category ?? null,
      supplierId: input.supplierId ?? null,
      quantity: input.quantity,
      minQuantity: input.minQuantity ?? 0,
      maxQuantity: input.maxQuantity ?? 0,
      unitCost: input.unitCost,
      status: input.status ?? 'Normal',
      expires: input.expires ?? null,
    },
  });
  return mapRow(created);
}

async function update(input: InventoryUpdateInput): Promise<InventoryItem> {
  const updated = await prisma.inventoryItem.update({
    where: { id: input.id },
    data: {
      name: input.name,
      category: input.category,
      supplierId: input.supplierId,
      quantity: input.quantity,
      minQuantity: input.minQuantity,
      maxQuantity: input.maxQuantity,
      unitCost: input.unitCost,
      status: input.status as any,
      expires: input.expires,
    },
  });
  return mapRow(updated);
}

async function remove(id: string): Promise<void> {
  await prisma.inventoryItem.delete({ where: { id } });
}

async function listLowStock(threshold: number = 10): Promise<InventoryItem[]> {
  const rows = await prisma.inventoryItem.findMany({
    where: { quantity: { lte: threshold } },
    orderBy: { quantity: 'asc' },
  });
  return rows.map(mapRow);
}

export const InventoryService = { list, get, create, update, remove, listLowStock };
