import { NextResponse } from 'next/server';
import { PrescriptionsService, type PrescriptionCreateInput } from '@/services/prescriptions';

const parseBody = async (req: Request): Promise<PrescriptionCreateInput> => {
  const body = await req.json();
  if (!body?.patientName) throw new Error('Patient name is required.');
  if (!body?.doctorName) throw new Error('Doctor name is required.');
  if (!body?.medicationName) throw new Error('Medication name is required.');

  return {
    patientId: body.patientId ?? undefined,
    patientName: String(body.patientName),
    doctorId: body.doctorId ?? undefined,
    doctorName: String(body.doctorName),
    medicationId: body.medicationId ?? undefined,
    medicationName: String(body.medicationName),
    strength: body.strength,
    dosage: body.dosage,
    instructions: body.instructions,
    duration: body.duration,
    refills: body.refills != null ? Number(body.refills) : undefined,
    status: body.status,
    invoiceId: body.invoiceId,
    treatmentId: body.treatmentId,
    dispensedAt: body.dispensedAt ? new Date(body.dispensedAt) : undefined,
    dispensedQuantity: body.dispensedQuantity != null ? Number(body.dispensedQuantity) : undefined,
    totalAmount: body.totalAmount != null ? Number(body.totalAmount) : undefined,
  } satisfies PrescriptionCreateInput;
};

export async function GET() {
  try {
    const prescriptions = await PrescriptionsService.list();
    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error('[api/pharmacy/prescriptions] GET error', error);
    return NextResponse.json({ error: 'Failed to load prescriptions.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await parseBody(req);
    const prescription = await PrescriptionsService.create(payload);
    return NextResponse.json({ prescription }, { status: 201 });
  } catch (error: any) {
    console.error('[api/pharmacy/prescriptions] POST error', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to create prescription.' }, { status: 400 });
  }
}
