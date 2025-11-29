import { NextResponse } from 'next/server';
import { MedicationsService, type MedicationCreateInput } from '@/services/medications';

const parseBody = async (req: Request): Promise<MedicationCreateInput> => {
  const body = await req.json();
  if (!body?.name) throw new Error('Medication name is required.');
  if (body?.stock == null) throw new Error('Stock is required.');
  if (body?.unitPrice == null) throw new Error('Unit price is required.');

  return {
    name: String(body.name),
    fullName: body.fullName,
    strength: body.strength,
    form: body.form,
    category: body.category,
    stock: Number(body.stock),
    unitPrice: Number(body.unitPrice),
    expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
    status: body.status,
    inventoryItemId: body.inventoryItemId,
  } satisfies MedicationCreateInput;
};

export async function GET() {
  try {
    const medications = await MedicationsService.list();
    return NextResponse.json({ medications });
  } catch (error) {
    console.error('[api/pharmacy/medications] GET error', error);
    return NextResponse.json({ error: 'Failed to load medications.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await parseBody(req);
    const medication = await MedicationsService.create(payload);
    return NextResponse.json({ medication }, { status: 201 });
  } catch (error: any) {
    console.error('[api/pharmacy/medications] POST error', error);
    return NextResponse.json({ error: error?.message ?? 'Failed to create medication.' }, { status: 400 });
  }
}
