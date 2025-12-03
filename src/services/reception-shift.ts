import { prisma } from '@/lib/prisma';
import { ShiftStatus, HandoverStatus, HandoverType } from '@prisma/client';

export interface CreateShiftInput {
  staffId: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  shiftType?: string;
  openingCashAmount?: number;
  notes?: string;
}

export interface StartShiftInput {
  shiftId: string;
  openingCashAmount: number;
  notes?: string;
}

export interface EndShiftInput {
  shiftId: string;
  closingCashAmount: number;
  cashDiscrepancyNotes?: string;
  notes?: string;
}

export interface CreateHandoverInput {
  fromStaffId: string;
  toStaffId: string;
  fromShiftId?: string;
  toShiftId?: string;
  handoverType: HandoverType;
  handoverNotes?: string;
  pendingTasks?: any[];
  importantNotes?: any[];
}

export interface AcceptHandoverInput {
  handoverId: string;
  acceptanceNotes?: string;
}

export interface CashDrawerTransactionInput {
  shiftId: string;
  staffId: string;
  type: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  cashAmount?: number;
  cardAmount?: number;
  otherAmount?: number;
  referenceId?: string;
  referenceType?: string;
  description?: string;
  notes?: string;
}

export class ReceptionShiftService {
  // ============================================
  // Shift Management
  // ============================================

  static async createShift(input: CreateShiftInput) {
    return prisma.receptionShift.create({
      data: {
        staffId: input.staffId,
        scheduledStart: input.scheduledStart,
        scheduledEnd: input.scheduledEnd,
        shiftType: input.shiftType || 'Regular',
        openingCashAmount: input.openingCashAmount,
        notes: input.notes,
        status: 'Active',
      },
      include: {
        staff: true,
      },
    });
  }

  static async startShift(input: StartShiftInput) {
    const shift = await prisma.receptionShift.update({
      where: { id: input.shiftId },
      data: {
        actualStart: new Date(),
        openingCashAmount: input.openingCashAmount,
        notes: input.notes,
        status: 'Active',
      },
      include: {
        staff: true,
      },
    });

    // Create opening cash drawer transaction
    await this.createCashTransaction({
      shiftId: shift.id,
      staffId: shift.staffId,
      type: 'Opening',
      amount: input.openingCashAmount,
      previousBalance: 0,
      newBalance: input.openingCashAmount,
      description: 'Opening cash drawer balance',
    });

    return shift;
  }

  static async endShift(input: EndShiftInput) {
    const shift = await prisma.receptionShift.findUnique({
      where: { id: input.shiftId },
      include: { cashDrawerTransactions: true },
    });

    if (!shift) throw new Error('Shift not found');

    const expectedCash = shift.openingCashAmount?.toNumber() || 0;
    const discrepancy = input.closingCashAmount - expectedCash;

    const updatedShift = await prisma.receptionShift.update({
      where: { id: input.shiftId },
      data: {
        actualEnd: new Date(),
        closingCashAmount: input.closingCashAmount,
        expectedCashAmount: expectedCash,
        cashDiscrepancy: discrepancy,
        cashDiscrepancyNotes: input.cashDiscrepancyNotes,
        notes: input.notes,
        status: 'Completed',
      },
      include: {
        staff: true,
      },
    });

    // Create closing cash drawer transaction
    await this.createCashTransaction({
      shiftId: shift.id,
      staffId: shift.staffId,
      type: 'Closing',
      amount: input.closingCashAmount,
      previousBalance: expectedCash,
      newBalance: input.closingCashAmount,
      description: 'Closing cash drawer balance',
      notes: discrepancy !== 0 ? `Discrepancy: ${discrepancy}` : undefined,
    });

    return updatedShift;
  }

  static async getActiveShift(staffId: string) {
    return prisma.receptionShift.findFirst({
      where: {
        staffId,
        status: 'Active',
      },
      include: {
        staff: true,
        cashDrawerTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  static async getActiveShifts() {
    return prisma.receptionShift.findMany({
      where: {
        status: 'Active',
      },
      include: {
        staff: true,
      },
      orderBy: { actualStart: 'desc' },
    });
  }

  static async getShifts(options?: {
    staffId?: string;
    status?: ShiftStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    
    if (options?.staffId) where.staffId = options.staffId;
    if (options?.status) where.status = options.status;
    if (options?.startDate || options?.endDate) {
      where.scheduledStart = {};
      if (options.startDate) where.scheduledStart.gte = options.startDate;
      if (options.endDate) where.scheduledStart.lte = options.endDate;
    }

    return prisma.receptionShift.findMany({
      where,
      include: {
        staff: true,
        handoversFrom: {
          include: { toStaff: true },
        },
        handoversTo: {
          include: { fromStaff: true },
        },
      },
      orderBy: { scheduledStart: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  }

  static async getShiftById(shiftId: string) {
    return prisma.receptionShift.findUnique({
      where: { id: shiftId },
      include: {
        staff: true,
        cashDrawerTransactions: {
          orderBy: { createdAt: 'desc' },
        },
        handoversFrom: {
          include: { toStaff: true },
        },
        handoversTo: {
          include: { fromStaff: true },
        },
      },
    });
  }

  static async updateShiftStats(shiftId: string, stats: {
    totalTransactions?: number;
    totalRevenue?: number;
    totalAppointments?: number;
  }) {
    return prisma.receptionShift.update({
      where: { id: shiftId },
      data: stats,
    });
  }

  // ============================================
  // Handover Management
  // ============================================

  static async createHandover(input: CreateHandoverInput) {
    return prisma.shiftHandover.create({
      data: {
        fromStaffId: input.fromStaffId,
        toStaffId: input.toStaffId,
        fromShiftId: input.fromShiftId,
        toShiftId: input.toShiftId,
        handoverType: input.handoverType,
        handoverNotes: input.handoverNotes,
        pendingTasks: input.pendingTasks,
        importantNotes: input.importantNotes,
        status: 'Pending',
      },
      include: {
        fromStaff: true,
        toStaff: true,
        fromShift: true,
        toShift: true,
      },
    });
  }

  static async acceptHandover(input: AcceptHandoverInput) {
    return prisma.shiftHandover.update({
      where: { id: input.handoverId },
      data: {
        status: 'Accepted',
        acceptedAt: new Date(),
        acceptanceNotes: input.acceptanceNotes,
      },
      include: {
        fromStaff: true,
        toStaff: true,
      },
    });
  }

  static async completeHandover(handoverId: string) {
    return prisma.shiftHandover.update({
      where: { id: handoverId },
      data: {
        status: 'Completed',
        completedAt: new Date(),
      },
      include: {
        fromStaff: true,
        toStaff: true,
      },
    });
  }

  static async rejectHandover(handoverId: string, reason?: string) {
    return prisma.shiftHandover.update({
      where: { id: handoverId },
      data: {
        status: 'Rejected',
        acceptanceNotes: reason,
      },
    });
  }

  static async getPendingHandovers(staffId: string) {
    return prisma.shiftHandover.findMany({
      where: {
        toStaffId: staffId,
        status: 'Pending',
      },
      include: {
        fromStaff: true,
        toStaff: true,
        fromShift: true,
      },
      orderBy: { handoverTime: 'desc' },
    });
  }

  static async getHandoverHistory(options?: {
    staffId?: string;
    handoverType?: HandoverType;
    status?: HandoverStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: any = {};
    
    if (options?.staffId) {
      where.OR = [
        { fromStaffId: options.staffId },
        { toStaffId: options.staffId },
      ];
    }
    if (options?.handoverType) where.handoverType = options.handoverType;
    if (options?.status) where.status = options.status;
    if (options?.startDate || options?.endDate) {
      where.handoverTime = {};
      if (options.startDate) where.handoverTime.gte = options.startDate;
      if (options.endDate) where.handoverTime.lte = options.endDate;
    }

    return prisma.shiftHandover.findMany({
      where,
      include: {
        fromStaff: true,
        toStaff: true,
        fromShift: true,
        toShift: true,
      },
      orderBy: { handoverTime: 'desc' },
      take: options?.limit || 50,
    });
  }

  // ============================================
  // Cash Drawer Management
  // ============================================

  static async createCashTransaction(input: CashDrawerTransactionInput) {
    return prisma.cashDrawerTransaction.create({
      data: {
        shiftId: input.shiftId,
        staffId: input.staffId,
        type: input.type,
        amount: input.amount,
        previousBalance: input.previousBalance,
        newBalance: input.newBalance,
        cashAmount: input.cashAmount,
        cardAmount: input.cardAmount,
        otherAmount: input.otherAmount,
        referenceId: input.referenceId,
        referenceType: input.referenceType,
        description: input.description,
        notes: input.notes,
      },
      include: {
        staff: true,
        shift: true,
      },
    });
  }

  static async getCashTransactions(shiftId: string) {
    return prisma.cashDrawerTransaction.findMany({
      where: { shiftId },
      include: {
        staff: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getCurrentCashBalance(shiftId: string) {
    const lastTransaction = await prisma.cashDrawerTransaction.findFirst({
      where: { shiftId },
      orderBy: { createdAt: 'desc' },
    });
    return lastTransaction?.newBalance?.toNumber() || 0;
  }

  static async verifyCashTransaction(transactionId: string, verifiedBy: string) {
    return prisma.cashDrawerTransaction.update({
      where: { id: transactionId },
      data: {
        verifiedBy,
        verifiedAt: new Date(),
      },
    });
  }

  // ============================================
  // Cash Drawer Handover (Transfer)
  // ============================================

  static async initiateCashDrawerHandover(
    fromStaffId: string,
    toStaffId: string,
    fromShiftId: string,
    cashAmount: number,
    notes?: string
  ) {
    // Create handover record
    const handover = await this.createHandover({
      fromStaffId,
      toStaffId,
      fromShiftId,
      handoverType: 'CashDrawer',
      handoverNotes: notes,
      importantNotes: [{ cashAmount, timestamp: new Date().toISOString() }],
    });

    return handover;
  }

  static async completeCashDrawerHandover(
    handoverId: string,
    toShiftId: string,
    confirmedCashAmount: number,
    acceptanceNotes?: string
  ) {
    const handover = await prisma.shiftHandover.findUnique({
      where: { id: handoverId },
      include: { fromShift: true },
    });

    if (!handover) throw new Error('Handover not found');
    if (handover.handoverType !== 'CashDrawer') throw new Error('Invalid handover type');

    // Update handover status
    const updatedHandover = await prisma.shiftHandover.update({
      where: { id: handoverId },
      data: {
        status: 'Completed',
        toShiftId,
        acceptedAt: new Date(),
        completedAt: new Date(),
        acceptanceNotes,
      },
      include: {
        fromStaff: true,
        toStaff: true,
      },
    });

    // Create cash transaction for receiving staff
    await this.createCashTransaction({
      shiftId: toShiftId,
      staffId: handover.toStaffId,
      type: 'Handover',
      amount: confirmedCashAmount,
      previousBalance: 0,
      newBalance: confirmedCashAmount,
      description: `Cash drawer handover from ${handover.fromStaffId}`,
      notes: acceptanceNotes,
    });

    return updatedHandover;
  }

  // ============================================
  // Summary & Reports
  // ============================================

  static async getTodayShiftsSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [activeShifts, completedShifts, pendingHandovers] = await Promise.all([
      prisma.receptionShift.count({
        where: { status: 'Active' },
      }),
      prisma.receptionShift.count({
        where: {
          status: 'Completed',
          actualEnd: { gte: today, lt: tomorrow },
        },
      }),
      prisma.shiftHandover.count({
        where: { status: 'Pending' },
      }),
    ]);

    return {
      activeShifts,
      completedShifts,
      pendingHandovers,
    };
  }

  static async getShiftReport(startDate: Date, endDate: Date) {
    const shifts = await prisma.receptionShift.findMany({
      where: {
        scheduledStart: { gte: startDate, lte: endDate },
      },
      include: {
        staff: true,
        cashDrawerTransactions: true,
      },
    });

    const totalRevenue = shifts.reduce((sum, shift) => 
      sum + (shift.totalRevenue?.toNumber() || 0), 0
    );
    
    const totalDiscrepancy = shifts.reduce((sum, shift) => 
      sum + (shift.cashDiscrepancy?.toNumber() || 0), 0
    );

    return {
      shifts,
      summary: {
        totalShifts: shifts.length,
        completedShifts: shifts.filter(s => s.status === 'Completed').length,
        totalRevenue,
        totalDiscrepancy,
        averageShiftDuration: this.calculateAverageShiftDuration(shifts),
      },
    };
  }

  private static calculateAverageShiftDuration(shifts: any[]) {
    const completedShifts = shifts.filter(s => s.actualStart && s.actualEnd);
    if (completedShifts.length === 0) return 0;

    const totalMinutes = completedShifts.reduce((sum, shift) => {
      const start = new Date(shift.actualStart).getTime();
      const end = new Date(shift.actualEnd).getTime();
      return sum + (end - start) / 60000;
    }, 0);

    return Math.round(totalMinutes / completedShifts.length);
  }
}
