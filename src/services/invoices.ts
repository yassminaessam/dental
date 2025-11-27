import { prisma } from '@/lib/prisma';

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number; // EGP numeric value
}

export interface InvoiceCreateInput {
  number: string; // external invoice number e.g. INV-2025-001
  patientId?: string;
  patientNameSnapshot?: string | null;
  patientPhoneSnapshot?: string | null;
  treatmentId?: string;
  date: Date;
  dueDate?: Date;
  status?: InvoiceStatus;
  notes?: string;
  items: InvoiceItemInput[];
  amountPaid?: number;
}

export interface InvoiceUpdateInput extends Partial<Omit<InvoiceCreateInput, 'number' | 'date' | 'items'>> {
  id: string;
  items?: InvoiceItemInput[]; // allow replacing items set
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  patientId?: string;
  patientNameSnapshot?: string | null;
  patientPhoneSnapshot?: string | null;
  treatmentId?: string;
  date: Date;
  dueDate?: Date;
  amount: number;
  amountPaid: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items: InvoiceItem[];
}

function mapRow(row: any): Invoice {
  const amount = Number(row.amount);
  const normalizedAmount = Number.isFinite(amount) ? amount : 0;
  const rawAmountPaid = row.amountPaid !== undefined && row.amountPaid !== null
    ? Number(row.amountPaid)
    : undefined;
  const numericAmountPaid = Number.isFinite(rawAmountPaid ?? NaN) ? (rawAmountPaid as number) : 0;
  const clampedAmountPaid = Math.min(Math.max(0, numericAmountPaid), normalizedAmount);
  const resolvedAmountPaid = row.status === 'Paid' && clampedAmountPaid < normalizedAmount
    ? normalizedAmount
    : clampedAmountPaid;

  return {
    id: row.id,
    number: row.number,
    patientId: row.patientId ?? undefined,
    patientNameSnapshot: row.patientNameSnapshot ?? undefined,
    patientPhoneSnapshot: row.patientPhoneSnapshot ?? undefined,
    treatmentId: row.treatmentId ?? undefined,
    date: row.date,
    dueDate: row.dueDate ?? undefined,
    amount: normalizedAmount,
    amountPaid: resolvedAmountPaid,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items: (row.items || []).map((it: any) => ({
      id: it.id,
      description: it.description,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      total: Number(it.total),
    }))
  };
}

async function list(): Promise<Invoice[]> {
  const rows = await prisma.invoice.findMany({ include: { items: true }, orderBy: { date: 'desc' } });
  return rows.map(mapRow);
}

async function get(id: string): Promise<Invoice | null> {
  const row = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  return row ? mapRow(row) : null;
}

async function create(input: InvoiceCreateInput): Promise<Invoice> {
  const amount = input.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const initialAmountPaid = Math.min(input.amountPaid ?? 0, amount);
  const created = await prisma.invoice.create({
    data: {
      number: input.number,
      patientId: input.patientId ?? null,
      patientNameSnapshot: input.patientNameSnapshot ?? null,
      patientPhoneSnapshot: input.patientPhoneSnapshot ?? null,
      treatmentId: input.treatmentId ?? null,
      date: input.date,
      dueDate: input.dueDate ?? null,
      amount: amount,
      amountPaid: initialAmountPaid,
      status: input.status ?? 'Draft',
      notes: input.notes ?? null,
      items: {
        create: input.items.map(it => ({
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.quantity * it.unitPrice,
        }))
      }
    },
    include: { items: true }
  });
  return mapRow(created);
}

async function update(input: InvoiceUpdateInput): Promise<Invoice> {
  const existing = await prisma.invoice.findUnique({ where: { id: input.id }, include: { items: true } });
  if (!existing) throw new Error(`Invoice not found: ${input.id}`);

  let itemsMutation: any = undefined;
  let amount = Number(existing.amount);
  if (input.items) {
    // Replace items: delete existing then create new set
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: input.id } });
    amount = input.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
    itemsMutation = {
      create: input.items.map(it => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.quantity * it.unitPrice,
      }))
    };
  }

  const requestedAmountPaid = input.amountPaid ?? Number(existing.amountPaid ?? 0);
  const clampedAmountPaid = Math.min(requestedAmountPaid, amount);

  const updated = await prisma.invoice.update({
    where: { id: input.id },
    data: {
      patientId: input.patientId ?? existing.patientId,
      patientNameSnapshot: input.patientNameSnapshot ?? existing.patientNameSnapshot,
      patientPhoneSnapshot: input.patientPhoneSnapshot ?? existing.patientPhoneSnapshot,
      treatmentId: input.treatmentId ?? existing.treatmentId,
      dueDate: input.dueDate ?? existing.dueDate,
      status: input.status ?? existing.status,
      notes: input.notes ?? existing.notes,
      amount,
      amountPaid: clampedAmountPaid,
      items: itemsMutation,
    },
    include: { items: true }
  });
  return mapRow(updated);
}

async function patch(id: string, data: Partial<InvoiceUpdateInput>): Promise<Invoice> {
  const existing = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  if (!existing) throw new Error(`Invoice not found: ${id}`);
  const requestedAmountPaid = data.amountPaid ?? Number(existing.amountPaid ?? 0);
  const clampedAmountPaid = Math.min(requestedAmountPaid, Number(existing.amount));
  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      patientId: data.patientId ?? existing.patientId,
      patientNameSnapshot: data.patientNameSnapshot ?? existing.patientNameSnapshot,
      patientPhoneSnapshot: data.patientPhoneSnapshot ?? existing.patientPhoneSnapshot,
      treatmentId: data.treatmentId ?? existing.treatmentId,
      dueDate: data.dueDate ?? existing.dueDate,
      status: data.status ?? existing.status,
      notes: data.notes ?? existing.notes,
      amountPaid: clampedAmountPaid,
    },
    include: { items: true }
  });
  return mapRow(updated);
}

async function remove(id: string): Promise<void> {
  await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
  await prisma.invoice.delete({ where: { id } });
}

export const InvoicesService = { list, get, create, update, patch, remove };