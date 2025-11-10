import { NextResponse } from 'next/server';
import { SuppliersService, type SupplierCreateInput } from '@/services/suppliers';

const parseCreate = async (req: Request): Promise<SupplierCreateInput> => {
  const b = await req.json();
  if (!b?.name) throw new Error('Missing supplier name.');
  return {
    name: String(b.name),
    address: b.address,
    phone: b.phone,
    email: b.email,
    category: b.category,
    paymentTerms: b.paymentTerms,
    rating: b.rating != null ? Number(b.rating) : undefined,
    status: b.status,
  } satisfies SupplierCreateInput;
};

export async function GET() {
  try {
    const suppliers = await SuppliersService.list();
    return NextResponse.json({ suppliers });
  } catch (e) {
    console.error('[api/suppliers] GET error', e);
    return NextResponse.json({ error: 'Failed to load suppliers.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await parseCreate(req);
    const supplier = await SuppliersService.create(payload);
    return NextResponse.json({ supplier }, { status: 201 });
  } catch (e: any) {
    console.error('[api/suppliers] POST error', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to create supplier.' }, { status: 400 });
  }
}
