import { NextResponse } from 'next/server';
import { InventoryService, type InventoryUpdateInput } from '@/services/inventory';
import { prisma } from '@/lib/prisma';

// Helper function to create notifications for admins when stock is low or out
async function createLowStockNotificationForAdmins(
  itemId: string,
  itemName: string,
  quantity: number,
  minQuantity: number
) {
  try {
    // Only notify if quantity is at or below minimum
    if (quantity > minQuantity) return;

    // Get all admin users who should receive notifications
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'admin',
        isActive: true,
      },
      select: { id: true },
    });

    if (adminUsers.length === 0) return;

    const isOutOfStock = quantity === 0;
    const notificationType = isOutOfStock ? 'INVENTORY_OUT_OF_STOCK' : 'INVENTORY_LOW_STOCK';
    const title = isOutOfStock 
      ? 'نفاد المخزون | Out of Stock' 
      : 'مخزون منخفض | Low Stock Alert';
    const message = isOutOfStock
      ? `${itemName} نفذ من المخزون | ${itemName} is out of stock`
      : `${itemName} - الكمية المتبقية: ${quantity} | Remaining: ${quantity}`;

    // Create notifications for admin users
    const notifications = adminUsers.map((user) => ({
      userId: user.id,
      type: notificationType as any,
      title,
      message,
      relatedId: itemId,
      relatedType: 'inventory',
      link: `/inventory?id=${itemId}`,
      priority: isOutOfStock ? 'URGENT' as const : 'HIGH' as const,
      metadata: { itemName, quantity, minQuantity },
    }));

    await prisma.notification.createMany({
      data: notifications,
    });
  } catch (error) {
    console.error('[api/inventory] Failed to create low stock notification:', error);
  }
}

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
    
    // Check if we need to send low stock notification
    if (item.minQuantity != null && item.quantity <= item.minQuantity) {
      await createLowStockNotificationForAdmins(
        item.id,
        item.name,
        item.quantity,
        item.minQuantity
      );
    }
    
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
