import { NextResponse } from 'next/server';
import { StaffService, type StaffCreateInput } from '@/services/staff';

const parseCreate = async (req: Request): Promise<StaffCreateInput> => {
  const b = await req.json();
  if (!b?.name || !b?.role || !b?.email || !b?.phone || !b?.schedule || !b?.salary || !b?.hireDate) {
    throw new Error('Missing required staff fields.');
  }
  return {
    name: String(b.name),
    role: String(b.role),
    email: String(b.email),
    phone: String(b.phone),
    schedule: String(b.schedule),
    salary: String(b.salary),
    hireDate: new Date(b.hireDate),
    status: b.status,
    notes: b.notes,
    userId: b.userId,
  } satisfies StaffCreateInput;
};

export async function GET() {
  try {
    const staff = await StaffService.list();
    return NextResponse.json({ staff });
  } catch (e) {
    console.error('[api/staff] GET error', e);
    return NextResponse.json({ error: 'Failed to load staff.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseCreate(request);
    const member = await StaffService.create(payload);
    return NextResponse.json({ staff: member }, { status: 201 });
  } catch (e: any) {
    console.error('[api/staff] POST error', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to create staff.' }, { status: 400 });
  }
}
