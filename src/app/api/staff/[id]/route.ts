import { NextResponse } from 'next/server';
import { StaffService } from '@/services/staff';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const member = await StaffService.get(params.id);
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ staff: member });
  } catch (e) {
    console.error('[api/staff/[id]] GET error', e);
    return NextResponse.json({ error: 'Failed to load staff member.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updated = await StaffService.update({ id: params.id, ...body, hireDate: body.hireDate ? new Date(body.hireDate) : undefined });
    return NextResponse.json({ staff: updated });
  } catch (e: any) {
    console.error('[api/staff/[id]] PATCH error', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to update staff.' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const existing = await StaffService.get(params.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await StaffService.remove(params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/staff/[id]] DELETE error', e);
    return NextResponse.json({ error: 'Failed to delete staff.' }, { status: 500 });
  }
}
