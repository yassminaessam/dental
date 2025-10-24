import { NextRequest, NextResponse } from 'next/server';
import { createDocument, listCollection } from '@/services/datastore.server';

const normalizePayload = (data: unknown) => {
  if (!data || typeof data !== 'object') return {} as Record<string, unknown>;
  return data as Record<string, unknown>;
};

export async function GET(_request: Request, context: { params: Promise<{ collection: string }> }) {
  try {
    const { collection } = await context.params;
    const items = await listCollection<Record<string, unknown>>(collection);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('[api/collections/[collection]] GET error', error);
    return NextResponse.json({ error: 'Failed to load collection.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ collection: string }> }) {
  try {
    const body = normalizePayload(await request.json().catch(() => ({})));
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Missing request body.' }, { status: 400 });
    }

    const { collection } = await context.params;
    const id = await createDocument(collection, body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('[api/collections/[collection]] POST error', error);
    return NextResponse.json({ error: 'Failed to create document.' }, { status: 500 });
  }
}