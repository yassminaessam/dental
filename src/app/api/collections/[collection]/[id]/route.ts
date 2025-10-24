import { NextRequest, NextResponse } from 'next/server';
import {
  patchDocument,
  readDocument,
  removeDocument,
  saveDocument
} from '@/services/datastore.server';

const normalizePayload = (data: unknown) => {
  if (!data || typeof data !== 'object') return {} as Record<string, unknown>;
  return data as Record<string, unknown>;
};

export async function GET(_request: NextRequest, context: { params: Promise<{ collection: string; id: string }> }) {
  try {
    const { collection, id } = await context.params;
    const document = await readDocument<Record<string, unknown>>(collection, id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }
    return NextResponse.json({ document });
  } catch (error) {
    console.error('[api/collections/[collection]/[id]] GET error', error);
    return NextResponse.json({ error: 'Failed to read document.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ collection: string; id: string }> }) {
  try {
    const body = normalizePayload(await request.json().catch(() => ({})));
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Missing request body.' }, { status: 400 });
    }

    const { collection, id } = await context.params;
    await saveDocument(collection, id, body);
    return NextResponse.json({ id });
  } catch (error) {
    console.error('[api/collections/[collection]/[id]] PUT error', error);
    return NextResponse.json({ error: 'Failed to upsert document.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ collection: string; id: string }> }) {
  try {
    const body = normalizePayload(await request.json().catch(() => ({})));
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Missing request body.' }, { status: 400 });
    }

    const { collection, id } = await context.params;
    await patchDocument(collection, id, body);
    return NextResponse.json({ id });
  } catch (error) {
    console.error('[api/collections/[collection]/[id]] PATCH error', error);
    return NextResponse.json({ error: 'Failed to patch document.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ collection: string; id: string }> }) {
  try {
    const { collection, id } = await context.params;
    await removeDocument(collection, id);
    return NextResponse.json({ id });
  } catch (error) {
    console.error('[api/collections/[collection]/[id]] DELETE error', error);
    return NextResponse.json({ error: 'Failed to delete document.' }, { status: 500 });
  }
}
