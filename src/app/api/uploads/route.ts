import { NextRequest, NextResponse } from 'next/server';
import { createFtpsDriver } from '@/lib/storage/ftps-driver';
import type { StorageDriver } from '@/lib/storage';

// Simple driver factory (extend later with S3, local, etc.)
function getDriver(): StorageDriver {
  const driver = createFtpsDriver();
  if (!driver.isConfigured()) {
    console.warn('[uploads] FTPS driver not fully configured – falling back to error responses');
  }
  return driver;
}

export const runtime = 'nodejs';
export const preferredRegion = 'auto';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB temporary cap
const ALLOWED_TYPES = new Set(['image/png','image/jpeg','image/webp','application/pdf']);

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const category = (form.get('category') as string) || 'uploads';
    const subPath = (form.get('subPath') as string) || '';

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
    if (!driver.isConfigured()) {
      return NextResponse.json({ error: 'Storage not configured on server' }, { status: 500 });
    }

    const result = await driver.upload({
      buffer,
      originalName: file.name,
      contentType: file.type,
      category,
      subPath
    });

    return NextResponse.json({ url: result.url, path: result.path, driver: result.driver });
  } catch (err: any) {
    console.error('Upload failed', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
