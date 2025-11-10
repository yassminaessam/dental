import { NextResponse } from 'next/server';
import { SuppliersService } from '@/services/suppliers';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supplier = await SuppliersService.get(params.id);
    if (!supplier) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ supplier });
  } catch (e) {
    console.error('[api/suppliers/[id]] GET error', e);
    return NextResponse.json({ error: 'Failed to load supplier.' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const supplier = await SuppliersService.update({ id: params.id, ...body });
    return NextResponse.json({ supplier });
  } catch (e: any) {
    console.error('[api/suppliers/[id]] PATCH error', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to update supplier.' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const existing = await SuppliersService.get(params.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await SuppliersService.remove(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/suppliers/[id]] DELETE error', e);
    return NextResponse.json({ error: 'Failed to delete supplier.' }, { status: 500 });
  }
}
