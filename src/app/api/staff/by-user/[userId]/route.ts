import { NextRequest, NextResponse } from 'next/server';
import { StaffService } from '@/services/staff';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const staff = await StaffService.getByUserId(userId);
    
    if (!staff) {
      return NextResponse.json({ staff: null });
    }
    
    return NextResponse.json({ staff });
  } catch (error: any) {
    console.error('[api/staff/by-user/[userId]] GET error', error);
    return NextResponse.json({ error: 'Failed to fetch staff member' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    
    if (body.status) {
      const updated = await StaffService.updateStatusByUserId(userId, body.status);
      
      if (!updated) {
        return NextResponse.json({ staff: null, message: 'No linked staff member found' });
      }
      
      return NextResponse.json({ staff: updated });
    }
    
    return NextResponse.json({ error: 'No status provided' }, { status: 400 });
  } catch (error: any) {
    console.error('[api/staff/by-user/[userId]] PATCH error', error);
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}
