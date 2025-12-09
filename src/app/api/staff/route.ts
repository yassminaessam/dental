import { NextRequest, NextResponse } from 'next/server';
import { StaffService, type StaffCreateInput } from '@/services/staff';

const parseCreate = async (req: Request): Promise<StaffCreateInput> => {
  const b = await req.json();
  // Required fields: name, role, schedule, salary, hireDate
  // Optional fields: email, phone (can be empty strings)
  if (!b?.name || !b?.role || !b?.schedule || !b?.salary || !b?.hireDate) {
    throw new Error('Missing required staff fields (name, role, schedule, salary, hireDate).');
  }
  return {
    name: String(b.name),
    role: String(b.role),
    email: b.email ? String(b.email) : '',
    phone: b.phone ? String(b.phone) : '',
    schedule: String(b.schedule),
    salary: String(b.salary),
    hireDate: new Date(b.hireDate),
    status: b.status,
    notes: b.notes,
    userId: b.userId,
  } satisfies StaffCreateInput;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    const staff = await StaffService.list();
    
    // Filter to only active staff if requested
    const filteredStaff = activeOnly 
      ? staff.filter(s => s.status === 'Active')
      : staff;
    
    return NextResponse.json({ staff: filteredStaff });
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
    
    return NextResponse.json({ error: e?.message ?? 'Failed to create staff.' }, { status: 400 });
  }
}
