import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const COLLECTION = 'website_builder_state';
const DOCUMENT_ID = 'default';

type BuilderStatePayload = {
  templates: unknown[];
  canvasWidgets: unknown[];
  canvasSettings: Record<string, unknown>;
  defaultTemplates?: Record<string, unknown>;
};

export async function GET() {
  try {
    const doc = await prisma.collectionDoc.findUnique({
      where: {
        collection_id: {
          collection: COLLECTION,
          id: DOCUMENT_ID,
        },
      },
    });

    return NextResponse.json({
      data: doc?.data ?? null,
      updatedAt: doc?.updatedAt ?? null,
    });
  } catch (error) {
    console.error('Failed to fetch builder state', error);
    return NextResponse.json({ error: 'Failed to fetch builder state' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { templates, canvasWidgets, canvasSettings, defaultTemplates } = body as Partial<BuilderStatePayload>;

    if (!Array.isArray(templates) || !Array.isArray(canvasWidgets) || typeof canvasSettings !== 'object' || canvasSettings === null) {
      return NextResponse.json({ error: 'Invalid builder state payload' }, { status: 400 });
    }

    if (defaultTemplates !== undefined && (typeof defaultTemplates !== 'object' || defaultTemplates === null)) {
      return NextResponse.json({ error: 'Invalid default templates payload' }, { status: 400 });
    }

    await prisma.collectionDoc.upsert({
      where: {
        collection_id: {
          collection: COLLECTION,
          id: DOCUMENT_ID,
        },
      },
      update: { data: { templates, canvasWidgets, canvasSettings, defaultTemplates: defaultTemplates ?? null } },
      create: {
        collection: COLLECTION,
        id: DOCUMENT_ID,
        data: { templates, canvasWidgets, canvasSettings, defaultTemplates: defaultTemplates ?? null },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save builder state', error);
    return NextResponse.json({ error: 'Failed to save builder state' }, { status: 500 });
  }
}
