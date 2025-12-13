import { NextResponse } from 'next/server';
import { PurchaseOrdersService, type PurchaseOrderCreateInput, type PurchaseOrderItem } from '@/services/purchase-orders';

const parseItems = (raw: unknown): PurchaseOrderItem[] | undefined => {
  if (!Array.isArray(raw)) return undefined;
  return raw
    .map((item) => ({
      itemId: typeof item?.itemId === 'string' ? item.itemId : undefined,
      description: typeof item?.description === 'string' ? item.description : '',
      quantity: Number(item?.quantity ?? 0),
      unitPrice: Number(item?.unitPrice ?? 0),
    }))
    .filter((item) => item.description.length > 0);
};

const parseCreatePayload = async (req: Request): Promise<PurchaseOrderCreateInput> => {
  const body = await req.json();
  if (!body?.supplierName) throw new Error('Supplier name is required.');
  if (body?.total === undefined || body?.total === null) throw new Error('Total amount is required.');
  if (!body?.orderDate) throw new Error('Order date is required.');

  return {
    supplierId: body.supplierId ?? undefined,
    supplierName: String(body.supplierName),
    status: body.status,
    total: Number(body.total),
    orderDate: new Date(body.orderDate),
    expectedDelivery: body.expectedDelivery ? new Date(body.expectedDelivery) : undefined,
    items: parseItems(body.items),
  } satisfies PurchaseOrderCreateInput;
};

export async function GET() {
  try {
    const orders = await PurchaseOrdersService.list();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('[api/purchase-orders] GET error', error);
    return NextResponse.json({ error: 'Failed to load purchase orders.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await parseCreatePayload(req);
    const order = await PurchaseOrdersService.create(payload);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error('[api/purchase-orders] POST error', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to create purchase order.' }, { status: 400 });
  }
}
