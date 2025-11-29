import { NextResponse } from 'next/server';
import { PrescriptionsService } from '@/services/prescriptions';

const parsePatch = async (req: Request) => {
  const body = await req.json();
  return {
    patientId: body.patientId,
    patientName: body.patientName,
    doctorId: body.doctorId,
    doctorName: body.doctorName,
    medicationId: body.medicationId,
    medicationName: body.medicationName,
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
  };
};

export async function GET(_req: Request, context: any) {
  try {
    const prescription = await PrescriptionsService.get(context?.params?.id);
    if (!prescription) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ prescription });
  } catch (error) {
    console.error('[api/pharmacy/prescriptions/:id] GET error', error);
    return NextResponse.json({ error: 'Failed to load prescription.' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const patch = await parsePatch(req);
    const prescription = await PrescriptionsService.update({ id: context?.params?.id, ...patch });
    return NextResponse.json({ prescription });
  } catch (error: any) {
    console.error('[api/pharmacy/prescriptions/:id] PATCH error', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to update prescription.' }, { status: 400 });
  }
}

export async function DELETE(_req: Request, context: any) {
  try {
    await PrescriptionsService.remove(context?.params?.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/pharmacy/prescriptions/:id] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete prescription.' }, { status: 500 });
  }
}
