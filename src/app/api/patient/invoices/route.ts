import { NextRequest, NextResponse } from 'next/server';
import { InvoicesService } from '@/services/invoices';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required.' }, { status: 400 });
    }

    // Get all invoices and filter by patient ID
    const allInvoices = await InvoicesService.list();
    const patientInvoices = allInvoices.filter(inv => inv.patientId === patientId);

    // Serialize dates
    const serialized = patientInvoices.map(inv => ({
      ...inv,
      date: inv.date.toISOString(),
      dueDate: inv.dueDate?.toISOString(),
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
    }));

    return NextResponse.json({ invoices: serialized });
  } catch (error) {
    console.error('[api/patient/invoices] GET error', error);
    return NextResponse.json({ error: 'Failed to load patient invoices.' }, { status: 500 });
  }
}
