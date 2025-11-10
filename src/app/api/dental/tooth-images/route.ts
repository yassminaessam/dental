import { NextRequest, NextResponse } from 'next/server';
import { createDocument, listCollection } from '@/services/datastore.server';

// Collection name used for tooth images in generic document store
const COLLECTION = 'tooth-images';

export async function GET(request: NextRequest) {
  try {
    const toothId = request.nextUrl.searchParams.get('toothId');
    const items = await listCollection<Record<string, any>>(COLLECTION);
    const filtered = toothId ? items.filter(i => i.toothId === toothId) : items;
    return NextResponse.json({ items: filtered });
  } catch (error) {
    console.error('[api/dental/tooth-images] GET error', error);
    return NextResponse.json({ error: 'Failed to load tooth images.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body.' }, { status: 400 });
    }
    if (!body.toothId) {
      return NextResponse.json({ error: 'Missing toothId.' }, { status: 400 });
    }
    const id = await createDocument(COLLECTION, body as Record<string, any>);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('[api/dental/tooth-images] POST error', error);
    return NextResponse.json({ error: 'Failed to create tooth image.' }, { status: 500 });
  }
}
