import { NextResponse } from 'next/server';
import { InventoryService } from '@/services/inventory';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const t = url.searchParams.get('threshold');
    const threshold = t != null ? Number(t) : 5;
    const items = await InventoryService.listLowStock(threshold);
    return NextResponse.json({ items });
  } catch (e) {
    console.error('[api/inventory/low-stock] GET error', e);
    return NextResponse.json({ error: 'Failed to load low stock items.' }, { status: 500 });
  }
}
