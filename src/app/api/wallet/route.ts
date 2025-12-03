import { NextResponse } from 'next/server';
import { PatientWalletService } from '@/services/patient-wallet';
import { WalletTransactionType, WalletTransactionStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const patientId = searchParams.get('patientId');
    const walletId = searchParams.get('walletId');

    // Get wallet by patient ID
    if (action === 'get-by-patient' && patientId) {
      const wallet = await PatientWalletService.getWalletByPatientId(patientId);
      return NextResponse.json({ wallet });
    }

    // Get wallet by wallet ID
    if (action === 'get-by-id' && walletId) {
      const wallet = await PatientWalletService.getWalletById(walletId);
      return NextResponse.json({ wallet });
    }

    // Get wallet statistics
    if (action === 'stats' && walletId) {
      const stats = await PatientWalletService.getWalletStats(walletId);
      return NextResponse.json({ stats });
    }

    // Check if can pay from wallet
    if (action === 'can-pay' && patientId) {
      const amount = parseFloat(searchParams.get('amount') || '0');
      const result = await PatientWalletService.canPayFromWallet(patientId, amount);
      return NextResponse.json(result);
    }

    // Get transactions
    if (action === 'transactions') {
      const type = searchParams.get('type') as WalletTransactionType | null;
      const status = searchParams.get('status') as WalletTransactionStatus | null;
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const result = await PatientWalletService.getTransactions({
        walletId: walletId || undefined,
        patientId: patientId || undefined,
        type: type || undefined,
        status: status || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit,
        offset,
      });

      return NextResponse.json(result);
    }

    // Get all wallets (for admin view)
    if (action === 'list') {
      const search = searchParams.get('search') || undefined;
      const isActive = searchParams.get('isActive');
      const hasBalance = searchParams.get('hasBalance') === 'true';
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      const result = await PatientWalletService.getAllWallets({
        search,
        isActive: isActive !== null ? isActive === 'true' : undefined,
        hasBalance,
        limit,
        offset,
      });

      return NextResponse.json(result);
    }

    // Get or create wallet for patient
    if (patientId) {
      const wallet = await PatientWalletService.getOrCreateWallet(patientId);
      return NextResponse.json({ wallet });
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // Create new wallet
    if (action === 'create') {
      const {
        patientId,
        patientName,
        patientPhone,
        patientEmail,
        initialDeposit,
        autoPayEnabled,
        lowBalanceAlert,
        processedBy,
        processedByName,
      } = body;

      if (!patientId) {
        return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
      }

      const wallet = await PatientWalletService.createWallet({
        patientId,
        patientName,
        patientPhone,
        patientEmail,
        initialDeposit: initialDeposit ? parseFloat(initialDeposit) : 0,
        autoPayEnabled,
        lowBalanceAlert: lowBalanceAlert ? parseFloat(lowBalanceAlert) : undefined,
        processedBy,
        processedByName,
      });

      return NextResponse.json({ wallet });
    }

    // Deposit to wallet
    if (action === 'deposit') {
      const { walletId, amount, paymentMethod, description, notes, processedBy, processedByName } = body;

      if (!walletId || !amount || !paymentMethod) {
        return NextResponse.json({ error: 'Wallet ID, amount, and payment method are required' }, { status: 400 });
      }

      const result = await PatientWalletService.deposit({
        walletId,
        amount: parseFloat(amount),
        paymentMethod,
        description,
        notes,
        processedBy,
        processedByName,
      });

      return NextResponse.json(result);
    }

    // Withdraw from wallet
    if (action === 'withdraw') {
      const { walletId, amount, description, notes, processedBy, processedByName } = body;

      if (!walletId || !amount) {
        return NextResponse.json({ error: 'Wallet ID and amount are required' }, { status: 400 });
      }

      const result = await PatientWalletService.withdraw({
        walletId,
        amount: parseFloat(amount),
        description,
        notes,
        processedBy,
        processedByName,
      });

      return NextResponse.json(result);
    }

    // Pay from wallet
    if (action === 'pay') {
      const { walletId, amount, referenceId, referenceType, description, notes, processedBy, processedByName } = body;

      if (!walletId || !amount || !referenceId || !referenceType) {
        return NextResponse.json({ error: 'Wallet ID, amount, reference ID, and reference type are required' }, { status: 400 });
      }

      const result = await PatientWalletService.pay({
        walletId,
        amount: parseFloat(amount),
        referenceId,
        referenceType,
        description,
        notes,
        processedBy,
        processedByName,
      });

      return NextResponse.json(result);
    }

    // Pay invoice from wallet
    if (action === 'pay-invoice') {
      const { patientId, invoiceId, amount, processedBy, processedByName } = body;

      if (!patientId || !invoiceId || !amount) {
        return NextResponse.json({ error: 'Patient ID, invoice ID, and amount are required' }, { status: 400 });
      }

      const result = await PatientWalletService.payInvoice({
        patientId,
        invoiceId,
        amount: parseFloat(amount),
        processedBy,
        processedByName,
      });

      return NextResponse.json(result);
    }

    // Refund to wallet
    if (action === 'refund') {
      const { walletId, amount, referenceId, referenceType, description, notes, processedBy, processedByName } = body;

      if (!walletId || !amount) {
        return NextResponse.json({ error: 'Wallet ID and amount are required' }, { status: 400 });
      }

      const result = await PatientWalletService.refund({
        walletId,
        amount: parseFloat(amount),
        referenceId,
        referenceType,
        description,
        notes,
        processedBy,
        processedByName,
      });

      return NextResponse.json(result);
    }

    // Manual adjustment
    if (action === 'adjust') {
      const { walletId, amount, description, notes, processedBy, processedByName } = body;

      if (!walletId || amount === undefined || !description) {
        return NextResponse.json({ error: 'Wallet ID, amount, and description are required' }, { status: 400 });
      }

      const result = await PatientWalletService.adjust({
        walletId,
        amount: parseFloat(amount),
        description,
        notes,
        processedBy,
        processedByName,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Wallet POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process wallet operation' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { walletId, autoPayEnabled, lowBalanceAlert, isActive } = body;

    if (!walletId) {
      return NextResponse.json({ error: 'Wallet ID is required' }, { status: 400 });
    }

    const wallet = await PatientWalletService.updateSettings(walletId, {
      autoPayEnabled,
      lowBalanceAlert: lowBalanceAlert !== undefined
        ? lowBalanceAlert !== null
          ? parseFloat(lowBalanceAlert)
          : null
        : undefined,
      isActive,
    });

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error('Wallet PATCH error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update wallet settings' },
      { status: 500 }
    );
  }
}
