import { NextRequest, NextResponse } from 'next/server';
import { ReceptionShiftService } from '@/services/reception-shift';
import { HandoverType, HandoverStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const staffId = searchParams.get('staffId');
    const handoverType = searchParams.get('type') as HandoverType | null;
    const status = searchParams.get('status') as HandoverStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    switch (action) {
      case 'pending':
        if (!staffId) {
          return NextResponse.json({ error: 'Staff ID required' }, { status: 400 });
        }
        const pendingHandovers = await ReceptionShiftService.getPendingHandovers(staffId);
        return NextResponse.json({ handovers: pendingHandovers });

      default:
        const handovers = await ReceptionShiftService.getHandoverHistory({
          staffId: staffId || undefined,
          handoverType: handoverType || undefined,
          status: status || undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        });
        return NextResponse.json({ handovers });
    }
  } catch (error) {
    console.error('[handovers/route] GET error', error);
    return NextResponse.json(
      { error: 'Failed to fetch handovers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'create':
        const handover = await ReceptionShiftService.createHandover({
          fromStaffId: body.fromStaffId,
          toStaffId: body.toStaffId,
          fromShiftId: body.fromShiftId,
          toShiftId: body.toShiftId,
          handoverType: body.handoverType || 'Shift',
          handoverNotes: body.handoverNotes,
          pendingTasks: body.pendingTasks,
          importantNotes: body.importantNotes,
        });
        return NextResponse.json({ handover });

      case 'initiate-cash-handover':
        const cashHandover = await ReceptionShiftService.initiateCashDrawerHandover(
          body.fromStaffId,
          body.toStaffId,
          body.fromShiftId,
          body.cashAmount,
          body.notes
        );
        return NextResponse.json({ handover: cashHandover });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[handovers/route] POST error', error);
    return NextResponse.json(
      { error: 'Failed to create handover' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, handoverId } = body;

    if (!handoverId) {
      return NextResponse.json({ error: 'Handover ID required' }, { status: 400 });
    }

    switch (action) {
      case 'accept':
        const accepted = await ReceptionShiftService.acceptHandover({
          handoverId,
          acceptanceNotes: body.acceptanceNotes,
        });
        return NextResponse.json({ handover: accepted });

      case 'complete':
        const completed = await ReceptionShiftService.completeHandover(handoverId);
        return NextResponse.json({ handover: completed });

      case 'reject':
        const rejected = await ReceptionShiftService.rejectHandover(
          handoverId,
          body.reason
        );
        return NextResponse.json({ handover: rejected });

      case 'complete-cash-handover':
        const completedCash = await ReceptionShiftService.completeCashDrawerHandover(
          handoverId,
          body.toShiftId,
          body.confirmedCashAmount,
          body.acceptanceNotes
        );
        return NextResponse.json({ handover: completedCash });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[handovers/route] PATCH error', error);
    return NextResponse.json(
      { error: 'Failed to update handover' },
      { status: 500 }
    );
  }
}
