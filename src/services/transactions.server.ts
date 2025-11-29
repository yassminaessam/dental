import 'server-only';

import prisma from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { Invoice } from '@/services/invoices';
import { formatEGP } from '@/lib/currency';

const randomId = (prefix?: string): string => {
  const base = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`);
  return prefix ? `${prefix}_${base}` : base;
};

export type TransactionType = 'Revenue' | 'Expense';
export type TransactionStatus = 'Pending' | 'Completed';

export interface TransactionRecord {
  id?: string;
  date?: Date | string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  status?: TransactionStatus;
  paymentMethod?: string;
  patientId?: string;
  patient?: string;
  sourceId?: string;
  sourceType?: string;
  totalAmount?: number;
  outstandingAmount?: number;
  metadata?: Prisma.InputJsonValue;
  auto?: boolean;
}

export type StoredTransaction = {
  id: string;
  date: string;
  description: string;
  amount: string;
  amountValue: number;
  totalAmount?: number;
  outstandingAmount?: number;
  type: TransactionType;
  category: string;
  status: TransactionStatus;
  paymentMethod?: string;
  patientId?: string;
  patient?: string;
  sourceId?: string;
  sourceType?: string;
  metadata?: Prisma.InputJsonValue;
  auto?: boolean;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type TransactionRow = Awaited<ReturnType<typeof prisma.pharmacyTransaction.findMany>>[number];

const formatAmountDisplay = (amount: Prisma.Decimal | number | null | undefined): string => {
  const numeric = amount ? Number(amount) : 0;
  return formatEGP(numeric, true, 'en');
};

const normalizeDate = (value?: Date | string): Date => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

const mapRowToStored = (row: TransactionRow): StoredTransaction => ({
  id: row.id,
  date: row.date.toISOString(),
  description: row.description,
  amount: formatAmountDisplay(row.amount),
  amountValue: Number(row.amountValue ?? row.amount ?? 0),
  totalAmount: row.totalAmount != null ? Number(row.totalAmount) : undefined,
  outstandingAmount: row.outstandingAmount != null ? Number(row.outstandingAmount) : undefined,
  type: row.type as TransactionType,
  category: row.category ?? 'Patient Payment',
  status: row.status as TransactionStatus,
  paymentMethod: row.paymentMethod ?? undefined,
  patient: row.patientName ?? undefined,
  patientId: row.patientId ?? undefined,
  sourceId: row.sourceId ?? undefined,
  sourceType: row.sourceType ?? undefined,
  metadata: row.metadata ?? undefined,
  auto: row.auto ?? undefined,
  completedAt: row.completedAt?.toISOString(),
  createdAt: row.createdAt?.toISOString(),
  updatedAt: row.updatedAt?.toISOString(),
});

const toDatabasePayload = (input: TransactionRecord) => {
  const amountValue = Number(input.amount ?? 0) || 0;
  const totalAmount = Number.isFinite(input.totalAmount ?? NaN)
    ? Number(input.totalAmount)
    : amountValue;
  const outstandingAmount = Number.isFinite(input.outstandingAmount ?? NaN)
    ? Number(input.outstandingAmount)
    : Math.max(totalAmount - amountValue, 0);
  return {
    date: normalizeDate(input.date),
    description: input.description,
    type: input.type,
    category: input.category,
    amount: amountValue,
    amountValue,
    totalAmount,
    outstandingAmount,
    status: input.status ?? 'Completed',
    paymentMethod: input.paymentMethod ?? null,
    patientName: input.patient ?? null,
    patientId: input.patientId ?? null,
    sourceId: input.sourceId ?? null,
    sourceType: input.sourceType ?? null,
    metadata: input.metadata ?? null,
    auto: input.auto ?? true,
    completedAt: (input.status ?? 'Completed') === 'Completed' ? normalizeDate(input.date) : null,
  } satisfies Prisma.PharmacyTransactionUncheckedCreateInput;
};

export async function listTransactions(): Promise<StoredTransaction[]> {
  const rows = await prisma.pharmacyTransaction.findMany({ orderBy: { date: 'desc' } });
  return rows.map(mapRowToStored);
}

export async function getTransaction(id: string): Promise<StoredTransaction | null> {
  const row = await prisma.pharmacyTransaction.findUnique({ where: { id } });
  return row ? mapRowToStored(row) : null;
}

export async function recordTransaction(input: TransactionRecord): Promise<string> {
  const id = input.id ?? randomId('TRX');
  const payload = toDatabasePayload(input);
  await prisma.pharmacyTransaction.upsert({
    where: { id },
    create: { id, ...payload },
    update: payload,
  });
  return id;
}

export async function updateTransaction(id: string, patch: Partial<TransactionRecord>): Promise<StoredTransaction> {
  const existing = await prisma.pharmacyTransaction.findUnique({ where: { id } });
  if (!existing) throw new Error('Transaction not found');
  const record: TransactionRecord = {
    id,
    amount: patch.amount ?? Number(existing.amount),
    description: patch.description ?? existing.description,
    category: patch.category ?? existing.category ?? 'Patient Payment',
    type: patch.type ?? (existing.type as TransactionType),
    date: patch.date ?? existing.date,
    paymentMethod: patch.paymentMethod ?? existing.paymentMethod ?? undefined,
    patient: patch.patient ?? existing.patientName ?? undefined,
    patientId: patch.patientId ?? existing.patientId ?? undefined,
    sourceId: patch.sourceId ?? existing.sourceId ?? undefined,
    sourceType: patch.sourceType ?? existing.sourceType ?? undefined,
    metadata: patch.metadata ?? existing.metadata ?? undefined,
    auto: patch.auto ?? existing.auto ?? true,
    totalAmount: patch.totalAmount ?? (existing.totalAmount != null ? Number(existing.totalAmount) : undefined),
    outstandingAmount: patch.outstandingAmount ?? (existing.outstandingAmount != null ? Number(existing.outstandingAmount) : undefined),
    status: patch.status ?? (existing.status as TransactionStatus),
  };
  const payload = toDatabasePayload(record);
  const row = await prisma.pharmacyTransaction.update({ where: { id }, data: payload });
  return mapRowToStored(row);
}

export async function deleteTransaction(id: string): Promise<void> {
  await prisma.pharmacyTransaction.delete({ where: { id } }).catch(() => undefined);
}

function invoiceTransactionId(invoiceId: string): string {
  return `TRX-INV-${invoiceId}`;
}

export async function syncInvoiceTransaction(invoice: Invoice, options?: {
  paymentMethod?: string;
  statusOverride?: TransactionStatus;
  completedAt?: Date | string;
}): Promise<void> {
  const transactionId = invoiceTransactionId(invoice.id);
  const totalAmount = Number(invoice.amount) || 0;
  const paidAmountRaw = Number(invoice.amountPaid ?? 0);
  const amountValue = Number.isFinite(paidAmountRaw)
    ? Math.min(Math.max(paidAmountRaw, 0), totalAmount || paidAmountRaw)
    : 0;
  const outstandingAmount = Math.max(totalAmount - amountValue, 0);
  const status: TransactionStatus = options?.statusOverride
    ?? (outstandingAmount <= 0 ? 'Completed' : 'Pending');

  await prisma.pharmacyTransaction.upsert({
    where: { id: transactionId },
    create: {
      id: transactionId,
      date: normalizeDate(invoice.date),
      description: invoice.notes?.trim().length
        ? `${invoice.number} · ${invoice.notes}`
        : `Invoice ${invoice.number}`,
      type: 'Revenue',
      category: 'Patient Payment',
      amount: amountValue,
      amountValue,
      totalAmount,
      outstandingAmount,
      status,
      paymentMethod: options?.paymentMethod ?? 'Invoice',
      patientName: invoice.patientNameSnapshot ?? null,
      patientId: invoice.patientId ?? null,
      sourceId: invoice.id,
      sourceType: 'invoice',
      auto: true,
      completedAt: status === 'Completed'
        ? normalizeDate(options?.completedAt ?? new Date())
        : null,
      metadata: {
        invoiceNumber: invoice.number,
        totalAmount,
        collectedAmount: amountValue,
        outstandingAmount,
        invoiceStatus: invoice.status,
        treatmentId: invoice.treatmentId,
        doctorId: (invoice as unknown as { doctorId?: string }).doctorId,
      },
    },
    update: {
      date: normalizeDate(invoice.date),
      description: invoice.notes?.trim().length
        ? `${invoice.number} · ${invoice.notes}`
        : `Invoice ${invoice.number}`,
      amount: amountValue,
      amountValue,
      totalAmount,
      outstandingAmount,
      status,
      paymentMethod: options?.paymentMethod ?? 'Invoice',
      patientName: invoice.patientNameSnapshot ?? null,
      patientId: invoice.patientId ?? null,
      auto: true,
      completedAt: status === 'Completed'
        ? normalizeDate(options?.completedAt ?? new Date())
        : null,
      metadata: {
        invoiceNumber: invoice.number,
        totalAmount,
        collectedAmount: amountValue,
        outstandingAmount,
        invoiceStatus: invoice.status,
        treatmentId: invoice.treatmentId,
        doctorId: (invoice as unknown as { doctorId?: string }).doctorId,
      },
    },
  });
}

export async function removeInvoiceTransaction(invoiceId: string): Promise<void> {
  await prisma.pharmacyTransaction.delete({ where: { id: invoiceTransactionId(invoiceId) } }).catch(() => undefined);
}
