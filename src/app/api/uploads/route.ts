import { NextRequest, NextResponse } from 'next/server';
import { createLocalDriver } from '@/lib/storage/local-driver';
import type { StorageDriver } from '@/lib/storage';

// Use local driver (writes to public/) – suitable for dev or non-serverless env.
function getDriver(): StorageDriver {
  return createLocalDriver();
}

export const runtime = 'nodejs';

const MAX_BYTES = 15 * 1024 * 1024; // 15MB cap
const ALLOWED_TYPES = new Set(['image/png','image/jpeg','image/webp','image/gif','application/pdf']);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const category = (form.get('category') as string) || 'clinical-images';
    const patientId = (form.get('patientId') as string) || '';
    const imageType = (form.get('imageType') as string) || '';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const driver = getDriver();
    const timestamp = Date.now();
    const baseName = `${patientId || 'anon'}_${imageType || 'image'}_${timestamp}`;
    const result = await driver.upload({
      buffer,
      originalName: file.name,
      contentType: file.type,
      category,
      subPath: patientId ? patientId : undefined,
      fileName: baseName + '_' + file.name.replace(/[^A-Za-z0-9._-]/g, '')
    });

    return NextResponse.json({ url: result.url, path: result.path, driver: result.driver });
  } catch (err: any) {
    console.error('Upload failed', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const urlParam = req.nextUrl.searchParams.get('url');
    if (!urlParam) {
      return NextResponse.json({ error: 'url query param is required' }, { status: 400 });
    }
    const driver = getDriver();
    await driver.delete(urlParam);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Delete failed', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
