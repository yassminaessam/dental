import { PrismaClient, WalletTransactionType, WalletTransactionStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateWalletParams {
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  patientEmail?: string;
  initialDeposit?: number;
  autoPayEnabled?: boolean;
  lowBalanceAlert?: number;
  processedBy?: string;
  processedByName?: string;
}

interface DepositParams {
  walletId: string;
  amount: number;
  paymentMethod: string;
  description?: string;
  notes?: string;
  processedBy?: string;
  processedByName?: string;
}

interface WithdrawParams {
  walletId: string;
  amount: number;
  description?: string;
  notes?: string;
  processedBy?: string;
  processedByName?: string;
}

interface PaymentParams {
  walletId: string;
  amount: number;
  referenceId: string;
  referenceType: string;
  description?: string;
  notes?: string;
  processedBy?: string;
  processedByName?: string;
}

interface RefundParams {
  walletId: string;
  amount: number;
  referenceId?: string;
  referenceType?: string;
  description?: string;
  notes?: string;
  processedBy?: string;
  processedByName?: string;
}

interface AdjustmentParams {
  walletId: string;
  amount: number; // positive for credit, negative for debit
  description: string;
  notes?: string;
  processedBy?: string;
  processedByName?: string;
}

interface TransactionFilters {
  walletId?: string;
  patientId?: string;
  type?: WalletTransactionType;
  status?: WalletTransactionStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class PatientWalletService {
  /**
   * Create a new wallet for a patient
   */
  static async createWallet(params: CreateWalletParams) {
    const {
      patientId,
      patientName,
      patientPhone,
      patientEmail,
      initialDeposit = 0,
      autoPayEnabled = false,
      lowBalanceAlert,
      processedBy,
      processedByName,
    } = params;

    // Check if wallet already exists
    const existingWallet = await prisma.patientWallet.findUnique({
      where: { patientId },
    });

    if (existingWallet) {
      throw new Error('Wallet already exists for this patient');
    }

    // Create wallet with transaction
    const wallet = await prisma.$transaction(async (tx) => {
      const newWallet = await tx.patientWallet.create({
        data: {
          patientId,
          patientName,
          patientPhone,
          patientEmail,
          balance: initialDeposit,
          totalDeposits: initialDeposit,
          autoPayEnabled,
          lowBalanceAlert: lowBalanceAlert ? new Prisma.Decimal(lowBalanceAlert) : null,
          lastTransactionAt: initialDeposit > 0 ? new Date() : null,
        },
      });

      // If there's an initial deposit, create a transaction record
      if (initialDeposit > 0) {
        await tx.walletTransaction.create({
          data: {
            walletId: newWallet.id,
            type: 'Deposit',
            status: 'Completed',
            amount: initialDeposit,
            balanceBefore: 0,
            balanceAfter: initialDeposit,
            paymentMethod: 'Cash',
            description: 'Initial deposit',
            processedBy,
            processedByName,
            completedAt: new Date(),
          },
        });
      }

      return newWallet;
    });

    return wallet;
  }

  /**
   * Get wallet by patient ID
   */
  static async getWalletByPatientId(patientId: string) {
    const wallet = await prisma.patientWallet.findUnique({
      where: { patientId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return wallet;
  }

  /**
   * Get wallet by wallet ID
   */
  static async getWalletById(walletId: string) {
    const wallet = await prisma.patientWallet.findUnique({
      where: { id: walletId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return wallet;
  }

  /**
   * Get or create wallet for a patient
   */
  static async getOrCreateWallet(patientId: string, patientInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  }) {
    let wallet = await prisma.patientWallet.findUnique({
      where: { patientId },
    });

    if (!wallet) {
      wallet = await prisma.patientWallet.create({
        data: {
          patientId,
          patientName: patientInfo?.name,
          patientPhone: patientInfo?.phone,
          patientEmail: patientInfo?.email,
          balance: 0,
        },
      });
    }

    return wallet;
  }

  /**
   * Deposit money into wallet
   */
  static async deposit(params: DepositParams) {
    const {
      walletId,
      amount,
      paymentMethod,
      description = 'Wallet deposit',
      notes,
      processedBy,
      processedByName,
    } = params;

    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.patientWallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (!wallet.isActive) {
        throw new Error('Wallet is not active');
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + amount;

      // Create transaction
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          type: 'Deposit',
          status: 'Completed',
          amount,
          balanceBefore,
          balanceAfter,
          paymentMethod,
          description,
          notes,
          processedBy,
          processedByName,
          completedAt: new Date(),
        },
      });

      // Update wallet balance
      const updatedWallet = await tx.patientWallet.update({
        where: { id: walletId },
        data: {
          balance: balanceAfter,
          totalDeposits: { increment: amount },
          lastTransactionAt: new Date(),
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return result;
  }

  /**
   * Withdraw money from wallet
   */
  static async withdraw(params: WithdrawParams) {
    const {
      walletId,
      amount,
      description = 'Wallet withdrawal',
      notes,
      processedBy,
      processedByName,
    } = params;

    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.patientWallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (!wallet.isActive) {
        throw new Error('Wallet is not active');
      }

      const balanceBefore = Number(wallet.balance);
      
      if (balanceBefore < amount) {
        throw new Error('Insufficient wallet balance');
      }

      const balanceAfter = balanceBefore - amount;

      // Create transaction
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          type: 'Withdrawal',
          status: 'Completed',
          amount,
          balanceBefore,
          balanceAfter,
          description,
          notes,
          processedBy,
          processedByName,
          completedAt: new Date(),
        },
      });

      // Update wallet balance
      const updatedWallet = await tx.patientWallet.update({
        where: { id: walletId },
        data: {
          balance: balanceAfter,
          totalWithdrawals: { increment: amount },
          lastTransactionAt: new Date(),
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return result;
  }

  /**
   * Pay from wallet (for invoices/treatments)
   */
  static async pay(params: PaymentParams) {
    const {
      walletId,
      amount,
      referenceId,
      referenceType,
      description = 'Payment from wallet',
      notes,
      processedBy,
      processedByName,
    } = params;

    if (amount <= 0) {
      throw new Error('Payment amount must be positive');
    }

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.patientWallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (!wallet.isActive) {
        throw new Error('Wallet is not active');
      }

      const balanceBefore = Number(wallet.balance);
      
      if (balanceBefore < amount) {
        throw new Error('Insufficient wallet balance');
      }

      const balanceAfter = balanceBefore - amount;

      // Create transaction
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          type: 'Payment',
          status: 'Completed',
          amount,
          balanceBefore,
          balanceAfter,
          referenceId,
          referenceType,
          description,
          notes,
          processedBy,
          processedByName,
          completedAt: new Date(),
        },
      });

      // Update wallet balance
      const updatedWallet = await tx.patientWallet.update({
        where: { id: walletId },
        data: {
          balance: balanceAfter,
          totalPayments: { increment: amount },
          lastTransactionAt: new Date(),
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return result;
  }

  /**
   * Refund to wallet
   */
  static async refund(params: RefundParams) {
    const {
      walletId,
      amount,
      referenceId,
      referenceType,
      description = 'Refund to wallet',
      notes,
      processedBy,
      processedByName,
    } = params;

    if (amount <= 0) {
      throw new Error('Refund amount must be positive');
    }

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.patientWallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + amount;

      // Create transaction
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          type: 'Refund',
          status: 'Completed',
          amount,
          balanceBefore,
          balanceAfter,
          referenceId,
          referenceType,
          description,
          notes,
          processedBy,
          processedByName,
          completedAt: new Date(),
        },
      });

      // Update wallet balance
      const updatedWallet = await tx.patientWallet.update({
        where: { id: walletId },
        data: {
          balance: balanceAfter,
          totalRefunds: { increment: amount },
          lastTransactionAt: new Date(),
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return result;
  }

  /**
   * Manual adjustment (credit or debit)
   */
  static async adjust(params: AdjustmentParams) {
    const {
      walletId,
      amount,
      description,
      notes,
      processedBy,
      processedByName,
    } = params;

    if (amount === 0) {
      throw new Error('Adjustment amount cannot be zero');
    }

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.patientWallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + amount;

      if (balanceAfter < 0) {
        throw new Error('Adjustment would result in negative balance');
      }

      // Create transaction
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId,
          type: 'Adjustment',
          status: 'Completed',
          amount: Math.abs(amount),
          balanceBefore,
          balanceAfter,
          description: `${amount > 0 ? 'Credit' : 'Debit'} adjustment: ${description}`,
          notes,
          processedBy,
          processedByName,
          completedAt: new Date(),
        },
      });

      // Update wallet balance
      const updatedWallet = await tx.patientWallet.update({
        where: { id: walletId },
        data: {
          balance: balanceAfter,
          lastTransactionAt: new Date(),
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return result;
  }

  /**
   * Get wallet transactions with filters
   */
  static async getTransactions(filters: TransactionFilters) {
    const {
      walletId,
      patientId,
      type,
      status,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters;

    const where: Prisma.WalletTransactionWhereInput = {};

    if (walletId) {
      where.walletId = walletId;
    }

    if (patientId) {
      where.wallet = { patientId };
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          wallet: {
            select: {
              patientId: true,
              patientName: true,
            },
          },
        },
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return { transactions, total };
  }

  /**
   * Update wallet settings
   */
  static async updateSettings(walletId: string, settings: {
    autoPayEnabled?: boolean;
    lowBalanceAlert?: number | null;
    isActive?: boolean;
  }) {
    const wallet = await prisma.patientWallet.update({
      where: { id: walletId },
      data: {
        autoPayEnabled: settings.autoPayEnabled,
        lowBalanceAlert: settings.lowBalanceAlert !== undefined
          ? settings.lowBalanceAlert !== null
            ? new Prisma.Decimal(settings.lowBalanceAlert)
            : null
          : undefined,
        isActive: settings.isActive,
      },
    });

    return wallet;
  }

  /**
   * Get wallet statistics for a patient
   */
  static async getWalletStats(walletId: string) {
    const wallet = await prisma.patientWallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Get transaction counts by type
    const transactionCounts = await prisma.walletTransaction.groupBy({
      by: ['type'],
      where: { walletId },
      _count: true,
    });

    // Get recent transactions
    const recentTransactions = await prisma.walletTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      balance: Number(wallet.balance),
      totalDeposits: Number(wallet.totalDeposits),
      totalWithdrawals: Number(wallet.totalWithdrawals),
      totalPayments: Number(wallet.totalPayments),
      totalRefunds: Number(wallet.totalRefunds),
      isActive: wallet.isActive,
      autoPayEnabled: wallet.autoPayEnabled,
      lowBalanceAlert: wallet.lowBalanceAlert ? Number(wallet.lowBalanceAlert) : null,
      lastTransactionAt: wallet.lastTransactionAt,
      transactionCounts: transactionCounts.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentTransactions,
    };
  }

  /**
   * Get all wallets with optional filters
   */
  static async getAllWallets(filters?: {
    isActive?: boolean;
    hasBalance?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.PatientWalletWhereInput = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.hasBalance) {
      where.balance = { gt: 0 };
    }

    if (filters?.search) {
      where.OR = [
        { patientName: { contains: filters.search, mode: 'insensitive' } },
        { patientPhone: { contains: filters.search } },
        { patientEmail: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [wallets, total] = await Promise.all([
      prisma.patientWallet.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      prisma.patientWallet.count({ where }),
    ]);

    // Get patient IDs that need info lookup (missing name or phone)
    const patientIdsNeedingLookup = wallets
      .filter(w => !w.patientName || !w.patientPhone)
      .map(w => w.patientId);

    // Fetch patient info from Patient table for wallets missing info
    const patientInfoMap = new Map<string, { name: string; phone: string | null; email: string | null }>();
    if (patientIdsNeedingLookup.length > 0) {
      const patients = await prisma.patient.findMany({
        where: { id: { in: patientIdsNeedingLookup } },
        select: { id: true, name: true, phone: true, email: true }
      });
      patients.forEach(p => {
        patientInfoMap.set(p.id, { name: p.name, phone: p.phone, email: p.email });
      });
    }

    // Enrich wallets with patient info from lookup
    const enrichedWallets = wallets.map(wallet => {
      const patientInfo = patientInfoMap.get(wallet.patientId);
      return {
        ...wallet,
        patientName: wallet.patientName || patientInfo?.name || null,
        patientPhone: wallet.patientPhone || patientInfo?.phone || null,
        patientEmail: wallet.patientEmail || patientInfo?.email || null,
      };
    });

    return { wallets: enrichedWallets, total };
  }

  /**
   * Check if patient can pay from wallet
   */
  static async canPayFromWallet(patientId: string, amount: number): Promise<{
    canPay: boolean;
    balance: number;
    shortfall: number;
  }> {
    const wallet = await prisma.patientWallet.findUnique({
      where: { patientId },
    });

    if (!wallet || !wallet.isActive) {
      return {
        canPay: false,
        balance: 0,
        shortfall: amount,
      };
    }

    const balance = Number(wallet.balance);
    const canPay = balance >= amount;

    return {
      canPay,
      balance,
      shortfall: canPay ? 0 : amount - balance,
    };
  }

  /**
   * Pay for invoice from wallet
   */
  static async payInvoice(params: {
    patientId: string;
    invoiceId: string;
    amount: number;
    processedBy?: string;
    processedByName?: string;
  }) {
    const { patientId, invoiceId, amount, processedBy, processedByName } = params;

    const wallet = await prisma.patientWallet.findUnique({
      where: { patientId },
    });

    if (!wallet) {
      throw new Error('Patient wallet not found');
    }

    return this.pay({
      walletId: wallet.id,
      amount,
      referenceId: invoiceId,
      referenceType: 'Invoice',
      description: `Payment for invoice`,
      processedBy,
      processedByName,
    });
  }
}

export default PatientWalletService;
