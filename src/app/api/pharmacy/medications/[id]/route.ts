import { NextResponse } from 'next/server';
import { MedicationsService } from '@/services/medications';

const parsePatch = async (req: Request) => {
  const body = await req.json();
  return {
    name: body.name,
    fullName: body.fullName,
    strength: body.strength,
    form: body.form,
    category: body.category,
    stock: body.stock != null ? Number(body.stock) : undefined,
    unitPrice: body.unitPrice != null ? Number(body.unitPrice) : undefined,
    expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
    status: body.status,
    inventoryItemId: body.inventoryItemId,
  };
};

export async function GET(_req: Request, context: any) {
  try {
    const medication = await MedicationsService.get(context?.params?.id);
    if (!medication) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ medication });
  } catch (error) {
    console.error('[api/pharmacy/medications/:id] GET error', error);
    return NextResponse.json({ error: 'Failed to load medication.' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const patch = await parsePatch(req);
    const medication = await MedicationsService.update({ id: context?.params?.id, ...patch });
    return NextResponse.json({ medication });
  } catch (error: any) {
    console.error('[api/pharmacy/medications/:id] PATCH error', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to update medication.' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: any) {
  try {
    await MedicationsService.remove(context?.params?.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/pharmacy/medications/:id] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete medication.' }, { status: 500 });
  }
}
