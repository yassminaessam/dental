import { NextResponse } from 'next/server';
import { InvoicesService, type InvoiceUpdateInput } from '@/services/invoices';

export async function GET(_req: Request, context: any) {
  try {
    const invoice = await InvoicesService.get(context?.params?.id);
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('[api/invoices/[id]] GET error', error);
    return NextResponse.json({ error: 'Failed to load invoice.' }, { status: 500 });
  }
}

const parsePatchPayload = async (request: Request, id: string): Promise<InvoiceUpdateInput> => {
  const body = await request.json();
  return {
    id,
    patientId: body.patientId,
    treatmentId: body.treatmentId,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    status: body.status,
    notes: body.notes,
    items: Array.isArray(body.items)
      ? body.items.map((it: any) => ({
          description: String(it.description),
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
        }))
      : undefined,
  } as InvoiceUpdateInput;
};

export async function PATCH(request: Request, context: any) {
  try {
    const payload = await parsePatchPayload(request, context?.params?.id);
    const updated = await InvoicesService.update(payload);
    return NextResponse.json({ invoice: updated });
  } catch (error: any) {
    console.error('[api/invoices/[id]] PATCH error', error);
    const message = error?.message ?? 'Failed to update invoice.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: any) {
  try {
    const invoice = await InvoicesService.get(context?.params?.id);
    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await InvoicesService.remove(context?.params?.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/invoices/[id]] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete invoice.' }, { status: 500 });
  }
}
