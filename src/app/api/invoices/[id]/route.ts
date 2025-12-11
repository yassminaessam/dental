import { NextResponse } from 'next/server';
import { InvoicesService, type InvoiceUpdateInput } from '@/services/invoices';
import { removeInvoiceTransaction, syncInvoiceTransaction } from '@/services/transactions.server';

const parseAmount = (value: unknown): number | undefined => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const invoice = await InvoicesService.get(id);
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('[api/invoices/[id]] GET error', error);
    return NextResponse.json({ error: 'Failed to load invoice.' }, { status: 500 });
  }
}

const parsePatchPayload = async (request: Request, id: string): Promise<InvoiceUpdateInput> => {
  const body = await request.json();
  const amountPaid = parseAmount(body.amountPaid);
  return {
    id,
    patientId: body.patientId,
    patientNameSnapshot: body.patientNameSnapshot,
    patientPhoneSnapshot: body.patientPhoneSnapshot,
    treatmentId: body.treatmentId,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    status: body.status,
    notes: body.notes,
    amountPaid,
    lastModifiedBy: typeof body.lastModifiedBy === 'string' ? body.lastModifiedBy : undefined,
    paymentMethod: typeof body.paymentMethod === 'string' ? body.paymentMethod : undefined,
    items: Array.isArray(body.items)
      ? body.items.map((it: any) => ({
          description: String(it.description),
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        }))
      : undefined,
  } as InvoiceUpdateInput;
};

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = await parsePatchPayload(request, id);
    const updated = await InvoicesService.update(payload);
    try {
      await syncInvoiceTransaction(updated);
    } catch (error) {
      console.error('[api/invoices/[id]] transaction sync error', error);
    }
    return NextResponse.json({ invoice: updated });
  } catch (error: any) {
    console.error('[api/invoices/[id]] PATCH error', error);
    const message = error?.message ?? 'Failed to update invoice.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const invoice = await InvoicesService.get(id);
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await InvoicesService.remove(id);
    try {
      await removeInvoiceTransaction(invoice.id);
    } catch (error) {
      console.error('[api/invoices/[id]] remove transaction error', error);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/invoices/[id]] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete invoice.' }, { status: 500 });
  }
}
