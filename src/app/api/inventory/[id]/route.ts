import { NextResponse } from 'next/server';
import { InventoryService, type InventoryUpdateInput } from '@/services/inventory';

const parsePatch = async (req: Request): Promise<Partial<InventoryUpdateInput>> => {
  const b = await req.json();
  const patch: Partial<InventoryUpdateInput> = {};
  if ('name' in b) patch.name = b.name;
  if ('category' in b) patch.category = b.category;
  if ('supplierId' in b) patch.supplierId = b.supplierId;
  if ('supplierName' in b) patch.supplierName = b.supplierName;
  if ('quantity' in b) patch.quantity = Number(b.quantity);
  if ('minQuantity' in b) patch.minQuantity = b.minQuantity != null ? Number(b.minQuantity) : undefined;
  if ('maxQuantity' in b) patch.maxQuantity = b.maxQuantity != null ? Number(b.maxQuantity) : undefined;
  if ('unitCost' in b) patch.unitCost = Number(b.unitCost);
  if ('status' in b) patch.status = b.status;
  if ('expires' in b) patch.expires = b.expires ? new Date(b.expires) : undefined;
  if ('location' in b) patch.location = b.location;
  return patch;
};

export async function GET(_req: Request, ctx: any) {
  try {
    const item = await InventoryService.get(ctx?.params?.id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (e) {
    console.error('[api/inventory/:id] GET error', e);
    return NextResponse.json({ error: 'Failed to load inventory item.' }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: any) {
  try {
    const patch = await parsePatch(req);
    const item = await InventoryService.update({ id: ctx?.params?.id, ...patch } as InventoryUpdateInput);
    return NextResponse.json({ item });
  } catch (e: any) {
    console.error('[api/inventory/:id] PATCH error', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to update inventory item.' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: any) {
  try {
    await InventoryService.remove(ctx?.params?.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/inventory/:id] DELETE error', e);
    return NextResponse.json({ error: 'Failed to delete inventory item.' }, { status: 500 });
  }
}
