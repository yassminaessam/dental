import 'server-only';

import prisma from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { Invoice } from '@/services/invoices';
import { generateDocumentId } from '@/services/datastore.server';

const TRANSACTION_COLLECTION = 'transactions';

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

type StoredTransaction = {
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

const currencyFormatter = new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAmount(amount: number): string {
  if (!Number.isFinite(amount)) {
    return currencyFormatter.format(0);
  }
  return currencyFormatter.format(amount);
}

function normalizeDate(value?: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date().toISOString();
}

async function findTransactionDoc(id: string): Promise<StoredTransaction | null> {
  const row = await prisma.collectionDoc.findUnique({
    where: { collection_id: { collection: TRANSACTION_COLLECTION, id } },
  });
  return row ? ((row.data as StoredTransaction) ?? null) : null;
}

async function upsertTransactionDoc(id: string, payload: Partial<StoredTransaction>): Promise<StoredTransaction> {
  const existing = await findTransactionDoc(id);
  const merged: StoredTransaction = {
    id,
    date: existing?.date ?? normalizeDate(),
    description: existing?.description ?? '',
    amount: existing?.amount ?? formatAmount(0),
    amountValue: existing?.amountValue ?? 0,
    totalAmount: existing?.totalAmount ?? existing?.amountValue ?? 0,
    outstandingAmount: existing?.outstandingAmount ?? 0,
    type: existing?.type ?? 'Revenue',
    category: existing?.category ?? 'Patient Payment',
    status: existing?.status ?? 'Pending',
    ...payload,
  } as StoredTransaction;

  await prisma.collectionDoc.upsert({
    where: { collection_id: { collection: TRANSACTION_COLLECTION, id } },
    create: {
      collection: TRANSACTION_COLLECTION,
      id,
      data: merged,
    },
    update: {
      data: merged,
    },
  });

  return merged;
}

export async function recordTransaction(input: TransactionRecord): Promise<string> {
  const id = input.id ?? generateDocumentId('TRX');
  const amountValue = Number(input.amount ?? 0) || 0;

  await upsertTransactionDoc(id, {
    id,
    date: normalizeDate(input.date),
    description: input.description,
    type: input.type,
    category: input.category,
    amount: formatAmount(amountValue),
    amountValue,
    totalAmount: Number.isFinite(input.totalAmount ?? NaN)
      ? Number(input.totalAmount)
      : amountValue,
    outstandingAmount: Number.isFinite(input.outstandingAmount ?? NaN)
      ? Number(input.outstandingAmount)
      : 0,
    status: input.status ?? 'Completed',
    paymentMethod: input.paymentMethod,
    patient: input.patient,
    patientId: input.patientId,
    sourceId: input.sourceId,
    sourceType: input.sourceType,
    metadata: input.metadata,
    auto: input.auto ?? true,
    completedAt:
      (input.status ?? 'Completed') === 'Completed' ? normalizeDate(input.date ?? new Date()) : undefined,
  });

  return id;
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
  const existing = await findTransactionDoc(transactionId);
  const wasCompleted = existing?.status === 'Completed';
  const existingMetadata = existing?.metadata && typeof existing.metadata === 'object' && !Array.isArray(existing.metadata)
    ? (existing.metadata as Record<string, unknown>)
    : {};
  const description = invoice.notes?.trim().length
    ? `${invoice.number} · ${invoice.notes}`
    : `Invoice ${invoice.number}`;

  const basePayload: Partial<StoredTransaction> = {
    id: transactionId,
    date: normalizeDate(invoice.date),
    description,
    type: 'Revenue',
    category: 'Patient Payment',
    amount: formatAmount(amountValue),
    amountValue,
    totalAmount,
    outstandingAmount,
    status,
    paymentMethod: options?.paymentMethod ?? existing?.paymentMethod ?? 'Invoice',
    patient: invoice.patientNameSnapshot ?? existing?.patient,
    patientId: invoice.patientId ?? existing?.patientId,
    sourceId: invoice.id,
    sourceType: 'invoice',
    auto: true,
    metadata: {
      ...existingMetadata,
      invoiceNumber: invoice.number,
      totalAmount,
      collectedAmount: amountValue,
      outstandingAmount,
      invoiceStatus: invoice.status,
      treatmentId: invoice.treatmentId,
      doctorId: (invoice as unknown as { doctorId?: string }).doctorId,
    } as Prisma.InputJsonValue,
  };

  if (status === 'Completed') {
    basePayload.completedAt = wasCompleted
      ? existing?.completedAt ?? normalizeDate(options?.completedAt)
      : normalizeDate(options?.completedAt ?? new Date());
  }

  await upsertTransactionDoc(transactionId, basePayload);
}

export async function removeInvoiceTransaction(invoiceId: string): Promise<void> {
  try {
    await prisma.collectionDoc.delete({
      where: { collection_id: { collection: TRANSACTION_COLLECTION, id: invoiceTransactionId(invoiceId) } },
    });
  } catch (_error) {
    // Ignore missing rows
  }
}
