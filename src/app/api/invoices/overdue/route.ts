import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { not: 'Paid' },
        dueDate: { lt: new Date() }
      },
      orderBy: { dueDate: 'asc' },
      include: { items: true }
    });
    return NextResponse.json(invoices.map((row) => ({
      ...row,
      amount: Number(row.amount),
      items: row.items.map((it) => ({
        ...it,
        unitPrice: Number(it.unitPrice),
        total: Number(it.total)
      }))
    })));
  } catch (error) {
    console.error('[api/invoices/overdue] GET error', error);
    return NextResponse.json({ error: 'Failed to load overdue invoices.' }, { status: 500 });
  }
}
