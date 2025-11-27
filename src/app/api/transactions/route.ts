import { NextResponse } from 'next/server';
import { z } from 'zod';

import { recordTransaction } from '@/services/transactions.server';

const transactionSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1),
  amount: z.union([
    z.number(),
    z.string().min(1),
  ]),
  type: z.enum(['Revenue', 'Expense']),
  category: z.string().min(1),
  status: z.enum(['Pending', 'Completed']).optional(),
  paymentMethod: z.string().optional(),
  date: z.union([z.string(), z.date()]).optional(),
  patientId: z.string().optional(),
  patient: z.string().optional(),
  sourceId: z.string().optional(),
  sourceType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

function parseAmount(raw: number | string): number {
  if (typeof raw === 'number') return raw;
  const parsed = parseFloat(raw.replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(request: Request) {
  try {
    const data = transactionSchema.parse(await request.json());
    const amountValue = parseAmount(data.amount);
    const id = await recordTransaction({
      ...data,
      amount: amountValue,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('[api/transactions] POST error', error);
    const message = error instanceof Error ? error.message : 'Failed to record transaction.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
