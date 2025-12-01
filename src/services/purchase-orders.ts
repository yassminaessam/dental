import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export type PurchaseOrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface PurchaseOrderItem {
  itemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrderCreateInput {
  supplierId?: string;
  supplierName: string;
  status?: PurchaseOrderStatus;
  total: number;
  orderDate: Date;
  expectedDelivery?: Date;
  items?: PurchaseOrderItem[];
}

export type PurchaseOrderUpdateInput = Partial<PurchaseOrderCreateInput> & { id: string };

export interface PurchaseOrder {
  id: string;
  supplierId?: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  total: number;
  orderDate: Date;
  expectedDelivery?: Date;
  items: PurchaseOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const mapRow = (row: any): PurchaseOrder => ({
  id: row.id,
  supplierId: row.supplierId ?? undefined,
  supplierName: row.supplierName,
  status: row.status,
  total: Number(row.total),
  orderDate: row.orderDate,
  expectedDelivery: row.expectedDelivery ?? undefined,
  items: Array.isArray(row.items) ? row.items : (row.items ?? []),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

async function list(): Promise<PurchaseOrder[]> {
  const rows = await prisma.purchaseOrder.findMany({ orderBy: { orderDate: 'desc' } });
  return rows.map(mapRow);
}

async function get(id: string): Promise<PurchaseOrder | null> {
  const row = await prisma.purchaseOrder.findUnique({ where: { id } });
  return row ? mapRow(row) : null;
}

async function create(input: PurchaseOrderCreateInput): Promise<PurchaseOrder> {
  const created = await prisma.purchaseOrder.create({
    data: {
      supplierId: input.supplierId ?? null,
      supplierName: input.supplierName,
      status: input.status ?? 'Pending',
      total: input.total,
      orderDate: input.orderDate,
      expectedDelivery: input.expectedDelivery ?? null,
      items: (input.items ?? []) as unknown as Prisma.InputJsonValue,
    },
  });
  return mapRow(created);
}

async function update(input: PurchaseOrderUpdateInput): Promise<PurchaseOrder> {
  const updated = await prisma.purchaseOrder.update({
    where: { id: input.id },
    data: {
      supplierId: input.supplierId,
      supplierName: input.supplierName,
      status: input.status,
      total: input.total,
      orderDate: input.orderDate,
      expectedDelivery: input.expectedDelivery,
      items: input.items as Prisma.InputJsonValue | undefined,
    },
  });
  return mapRow(updated);
}

async function remove(id: string): Promise<void> {
  await prisma.purchaseOrder.delete({ where: { id } });
}

export const PurchaseOrdersService = { list, get, create, update, remove };
