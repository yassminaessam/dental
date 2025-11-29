import { NextResponse } from 'next/server';
import { getTransaction, updateTransaction, deleteTransaction } from '@/services/transactions.server';

const parsePatchPayload = async (req: Request) => {
  const body = await req.json();
  return {
    date: body.date,
    description: body.description,
    type: body.type,
    category: body.category,
    amount: body.amount != null ? Number(body.amount) : undefined,
    status: body.status,
    paymentMethod: body.paymentMethod,
    patient: body.patient,
    patientId: body.patientId,
    sourceId: body.sourceId,
    sourceType: body.sourceType,
    totalAmount: body.totalAmount != null ? Number(body.totalAmount) : undefined,
    outstandingAmount: body.outstandingAmount != null ? Number(body.outstandingAmount) : undefined,
    metadata: body.metadata,
    auto: body.auto,
  };
};

export async function GET(_req: Request, context: { params: { id: string } }) {
  try {
    const transaction = await getTransaction(context?.params?.id);
    if (!transaction) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('[api/transactions/:id] GET error', error);
    return NextResponse.json({ error: 'Failed to load transaction.' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const patch = await parsePatchPayload(req);
    const transaction = await updateTransaction(context?.params?.id, patch);
    return NextResponse.json({ transaction });
  } catch (error: any) {
    console.error('[api/transactions/:id] PATCH error', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to update transaction.' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: { params: { id: string } }) {
  try {
    await deleteTransaction(context?.params?.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/transactions/:id] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete transaction.' }, { status: 500 });
  }
}
