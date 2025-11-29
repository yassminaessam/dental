import { NextResponse } from 'next/server';
import { PharmacyDispenseService, type PharmacyDispenseCreateInput } from '@/services/pharmacy-dispense';

const parseBody = async (req: Request): Promise<PharmacyDispenseCreateInput> => {
  const body = await req.json();
  if (!body?.patientName) throw new Error('Patient name is required.');
  if (body?.quantity == null) throw new Error('Quantity is required.');
  if (body?.unitPrice == null) throw new Error('Unit price is required.');
  if (body?.totalAmount == null) throw new Error('Total amount is required.');

  return {
    prescriptionId: body.prescriptionId ?? undefined,
    medicationId: body.medicationId ?? undefined,
    patientId: body.patientId ?? undefined,
    patientName: String(body.patientName),
    doctorId: body.doctorId ?? undefined,
    doctorName: body.doctorName ?? undefined,
    quantity: Number(body.quantity),
    unitPrice: Number(body.unitPrice),
    totalAmount: Number(body.totalAmount),
    invoiceId: body.invoiceId ?? undefined,
    treatmentId: body.treatmentId ?? undefined,
    notes: body.notes ?? undefined,
    dispensedBy: body.dispensedBy ?? undefined,
    dispensedAt: body.dispensedAt ? new Date(body.dispensedAt) : undefined,
  } satisfies PharmacyDispenseCreateInput;
};

export async function POST(req: Request) {
  try {
    const payload = await parseBody(req);
    const dispense = await PharmacyDispenseService.create(payload);
    return NextResponse.json({ dispense }, { status: 201 });
  } catch (error: any) {
    console.error('[api/pharmacy/dispenses] POST error', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to record dispense.' }, { status: 400 });
  }
}

export async function GET() {
  try {
    const dispenses = await PharmacyDispenseService.list();
    return NextResponse.json({ dispenses });
  } catch (error) {
    console.error('[api/pharmacy/dispenses] GET error', error);
    return NextResponse.json({ error: 'Failed to load dispensing records.' }, { status: 500 });
  }
}
