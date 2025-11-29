import { NextResponse } from 'next/server';
import { PurchaseOrdersService } from '@/services/purchase-orders';

const parsePatchPayload = async (req: Request) => {
  const body = await req.json();
  return {
    supplierId: body.supplierId,
    supplierName: body.supplierName,
    status: body.status,
    total: body.total != null ? Number(body.total) : undefined,
    orderDate: body.orderDate ? new Date(body.orderDate) : undefined,
    expectedDelivery: body.expectedDelivery ? new Date(body.expectedDelivery) : undefined,
    items: Array.isArray(body.items) ? body.items : undefined,
  };
};

export async function GET(_req: Request, context: any) {
  try {
    const order = await PurchaseOrdersService.get(context?.params?.id);
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    console.error('[api/purchase-orders/:id] GET error', error);
    return NextResponse.json({ error: 'Failed to load purchase order.' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const patch = await parsePatchPayload(req);
    const order = await PurchaseOrdersService.update({ id: context?.params?.id, ...patch });
    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('[api/purchase-orders/:id] PATCH error', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to update purchase order.' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: any) {
  try {
    await PurchaseOrdersService.remove(context?.params?.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/purchase-orders/:id] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete purchase order.' }, { status: 500 });
  }
}
