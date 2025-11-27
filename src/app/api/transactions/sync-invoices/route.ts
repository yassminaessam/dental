import { NextResponse } from 'next/server';
import { InvoicesService } from '@/services/invoices';
import { syncInvoiceTransaction } from '@/services/transactions.server';

export async function POST() {
  try {
    const invoices = await InvoicesService.list();
    let synced = 0;
    for (const invoice of invoices) {
      const paidAmount = Number((invoice as unknown as { amountPaid?: number }).amountPaid ?? 0);
      if (!Number.isFinite(paidAmount) || paidAmount <= 0) continue;
      await syncInvoiceTransaction(invoice);
      synced += 1;
    }
    return NextResponse.json({ synced });
  } catch (error) {
    console.error('[api/transactions/sync-invoices] error', error);
    return NextResponse.json({ error: 'Failed to sync invoice transactions.' }, { status: 500 });
  }
}
