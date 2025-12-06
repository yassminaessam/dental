import { NextResponse } from 'next/server';
import { StaffService } from '@/services/staff';

export async function GET(_req: Request, context: any) {
  try {
    const member = await StaffService.get(context?.params?.id);
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ staff: member });
  } catch (e) {
    console.error('[api/staff/[id]] GET error', e);
    return NextResponse.json({ error: 'Failed to load staff member.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: any) {
  try {
    const body = await request.json();
    const updated = await StaffService.update({ id: context?.params?.id, ...body, hireDate: body.hireDate ? new Date(body.hireDate) : undefined });
    return NextResponse.json({ staff: updated });
  } catch (e: any) {
    console.error('[api/staff/[id]] PATCH error', e);
    
    // Check for unique constraint violations
    if (e?.code === 'P2002') {
      const target = e?.meta?.target;
      if (target?.includes('phone')) {
        return NextResponse.json({ 
          error: 'A staff member with this phone number already exists.',
          field: 'phone'
        }, { status: 409 });
      }
      if (target?.includes('email')) {
        return NextResponse.json({ 
          error: 'A staff member with this email already exists.',
          field: 'email'
        }, { status: 409 });
      }
    }
    
    return NextResponse.json({ error: e?.message ?? 'Failed to update staff.' }, { status: 400 });
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const body = await request.json();
    const updated = await StaffService.update({ id: context?.params?.id, ...body, hireDate: body.hireDate ? new Date(body.hireDate) : undefined });
    return NextResponse.json({ staff: updated });
  } catch (e: any) {
    console.error('[api/staff/[id]] PUT error', e);
    
    // Check for unique constraint violations
    if (e?.code === 'P2002') {
      const target = e?.meta?.target;
      if (target?.includes('phone')) {
        return NextResponse.json({ 
          error: 'A staff member with this phone number already exists.',
          field: 'phone'
        }, { status: 409 });
      }
      if (target?.includes('email')) {
        return NextResponse.json({ 
          error: 'A staff member with this email already exists.',
          field: 'email'
        }, { status: 409 });
      }
    }
    
    return NextResponse.json({ error: e?.message ?? 'Failed to update staff.' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: any) {
  try {
    const existing = await StaffService.get(context?.params?.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await StaffService.remove(context?.params?.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/staff/[id]] DELETE error', e);
    return NextResponse.json({ error: 'Failed to delete staff.' }, { status: 500 });
  }
}
