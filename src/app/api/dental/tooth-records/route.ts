import { NextRequest, NextResponse } from 'next/server';
import { addDocument, getCollection } from '@/services/database';

const COLLECTION = 'tooth-medical-records';

export async function GET(request: NextRequest) {
  try {
    const toothId = request.nextUrl.searchParams.get('toothId');
    const items = await getCollection<Record<string, any>>(COLLECTION);
    const filtered = toothId ? items.filter(i => i.toothId === toothId) : items;
    return NextResponse.json({ items: filtered });
  } catch (error) {
    console.error('[api/dental/tooth-records] GET error', error);
    return NextResponse.json({ error: 'Failed to load tooth medical records.' }, { status: 500 });
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
    const result = await addDocument<Record<string, any>>(COLLECTION, body as Record<string, any>);
    return NextResponse.json({ id: result.id }, { status: 201 });
  } catch (error) {
    console.error('[api/dental/tooth-records] POST error', error);
    return NextResponse.json({ error: 'Failed to create tooth medical record.' }, { status: 500 });
  }
}
