import { NextResponse } from 'next/server';
import { InvoicesService, type InvoiceCreateInput } from '@/services/invoices';
import { syncInvoiceTransaction } from '@/services/transactions.server';

const parseAmount = (value: unknown): number | undefined => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const parseCreatePayload = async (request: Request): Promise<InvoiceCreateInput> => {
  const body = await request.json();
  if (!body?.number || !body?.date || !Array.isArray(body?.items)) {
    throw new Error('Missing required invoice fields.');
  }
  const amountPaid = parseAmount(body.amountPaid);
  return {
    number: String(body.number),
    patientId: body.patientId || undefined,
    patientNameSnapshot: typeof body.patientNameSnapshot === 'string' ? body.patientNameSnapshot : undefined,
    patientPhoneSnapshot: typeof body.patientPhoneSnapshot === 'string' ? body.patientPhoneSnapshot : undefined,
    treatmentId: body.treatmentId || undefined,
    date: new Date(body.date),
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    status: body.status,
    notes: body.notes,
    amountPaid: amountPaid ?? 0,
    createdBy: typeof body.createdBy === 'string' ? body.createdBy : undefined,
    paymentMethod: typeof body.paymentMethod === 'string' ? body.paymentMethod : undefined,
    items: body.items.map((it: any) => ({
      description: String(it.description),
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
    })),
  } satisfies InvoiceCreateInput;
};

export async function GET() {
  try {
    const invoices = await InvoicesService.list();
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('[api/invoices] GET error', error);
    return NextResponse.json({ error: 'Failed to load invoices.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseCreatePayload(request);
    const invoice = await InvoicesService.create(payload);
    try {
      await syncInvoiceTransaction(invoice);
    } catch (error) {
      console.error('[api/invoices] transaction sync error', error);
    }
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    console.error('[api/invoices] POST error', error);
    const message = error?.message ?? 'Failed to create invoice.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
