import { NextRequest, NextResponse } from 'next/server';
import { ReceptionShiftService } from '@/services/reception-shift';
import { ShiftStatus, HandoverType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const staffId = searchParams.get('staffId');
    const shiftId = searchParams.get('shiftId');
    const status = searchParams.get('status') as ShiftStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    switch (action) {
      case 'active':
        if (staffId) {
          const shift = await ReceptionShiftService.getActiveShift(staffId);
          return NextResponse.json({ shift });
        }
        const activeShifts = await ReceptionShiftService.getActiveShifts();
        return NextResponse.json({ shifts: activeShifts });

      case 'single':
        if (!shiftId) {
          return NextResponse.json({ error: 'Shift ID required' }, { status: 400 });
        }
        const singleShift = await ReceptionShiftService.getShiftById(shiftId);
        return NextResponse.json({ shift: singleShift });

      case 'summary':
        const summary = await ReceptionShiftService.getTodayShiftsSummary();
        return NextResponse.json(summary);

      case 'report':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'Date range required' }, { status: 400 });
        }
        const report = await ReceptionShiftService.getShiftReport(
          new Date(startDate),
          new Date(endDate)
        );
        return NextResponse.json(report);

      case 'cash-balance':
        if (!shiftId) {
          return NextResponse.json({ error: 'Shift ID required' }, { status: 400 });
        }
        const balance = await ReceptionShiftService.getCurrentCashBalance(shiftId);
        return NextResponse.json({ balance });

      case 'cash-transactions':
        if (!shiftId) {
          return NextResponse.json({ error: 'Shift ID required' }, { status: 400 });
        }
        const transactions = await ReceptionShiftService.getCashTransactions(shiftId);
        return NextResponse.json({ transactions });

      default:
        const shifts = await ReceptionShiftService.getShifts({
          staffId: staffId || undefined,
          status: status || undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        });
        return NextResponse.json({ shifts });
    }
  } catch (error) {
    console.error('[shifts/route] GET error', error);
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
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
        const newShift = await ReceptionShiftService.createShift({
          staffId: body.staffId,
          scheduledStart: new Date(body.scheduledStart),
          scheduledEnd: new Date(body.scheduledEnd),
          shiftType: body.shiftType,
          openingCashAmount: body.openingCashAmount,
          notes: body.notes,
        });
        return NextResponse.json({ shift: newShift });

      case 'start':
        const startedShift = await ReceptionShiftService.startShift({
          shiftId: body.shiftId,
          openingCashAmount: body.openingCashAmount,
          notes: body.notes,
        });
        return NextResponse.json({ shift: startedShift });

      case 'end':
        const endedShift = await ReceptionShiftService.endShift({
          shiftId: body.shiftId,
          closingCashAmount: body.closingCashAmount,
          cashDiscrepancyNotes: body.cashDiscrepancyNotes,
          notes: body.notes,
        });
        return NextResponse.json({ shift: endedShift });

      case 'cash-transaction':
        const transaction = await ReceptionShiftService.createCashTransaction({
          shiftId: body.shiftId,
          staffId: body.staffId,
          type: body.type,
          amount: body.amount,
          previousBalance: body.previousBalance,
          newBalance: body.newBalance,
          cashAmount: body.cashAmount,
          cardAmount: body.cardAmount,
          otherAmount: body.otherAmount,
          referenceId: body.referenceId,
          referenceType: body.referenceType,
          description: body.description,
          notes: body.notes,
        });
        return NextResponse.json({ transaction });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[shifts/route] POST error', error);
    return NextResponse.json(
      { error: 'Failed to process shift action' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, shiftId } = body;

    switch (action) {
      case 'update-stats':
        const updatedShift = await ReceptionShiftService.updateShiftStats(shiftId, {
          totalTransactions: body.totalTransactions,
          totalRevenue: body.totalRevenue,
          totalAppointments: body.totalAppointments,
        });
        return NextResponse.json({ shift: updatedShift });

      case 'verify-transaction':
        const verified = await ReceptionShiftService.verifyCashTransaction(
          body.transactionId,
          body.verifiedBy
        );
        return NextResponse.json({ transaction: verified });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[shifts/route] PATCH error', error);
    return NextResponse.json(
      { error: 'Failed to update shift' },
      { status: 500 }
    );
  }
}
