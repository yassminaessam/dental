import { NextResponse } from 'next/server';
import { InventoryService, type InventoryCreateInput } from '@/services/inventory';

const parseCreate = async (req: Request): Promise<InventoryCreateInput> => {
  const b = await req.json();
  if (!b?.name || b.quantity == null || b.unitCost == null) {
    throw new Error('Missing required inventory fields.');
  }
  return {
    name: String(b.name),
    category: b.category,
    supplierId: b.supplierId,
    quantity: Number(b.quantity),
    minQuantity: b.minQuantity != null ? Number(b.minQuantity) : undefined,
    maxQuantity: b.maxQuantity != null ? Number(b.maxQuantity) : undefined,
    unitCost: Number(b.unitCost),
    status: b.status,
    expires: b.expires ? new Date(b.expires) : undefined,
  } satisfies InventoryCreateInput;
};

export async function GET() {
  try {
    const items = await InventoryService.list();
    return NextResponse.json({ items });
  } catch (e) {
    console.error('[api/inventory] GET error', e);
    return NextResponse.json({ error: 'Failed to load inventory.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await parseCreate(req);
    const item = await InventoryService.create(payload);
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    console.error('[api/inventory] POST error', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to create inventory item.' }, { status: 400 });
  }
}
