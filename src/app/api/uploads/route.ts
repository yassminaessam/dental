import { NextRequest, NextResponse } from 'next/server';
import { createLocalDriver } from '@/lib/storage/local-driver';
import { createFTPDriver } from '@/lib/storage/ftp-driver';
import type { StorageDriver } from '@/lib/storage';

// Use FTP driver if configured, otherwise use local driver
function getDriver(): StorageDriver {
  const useFTP = process.env.USE_FTP_STORAGE === 'true';
  
  if (useFTP) {
    const ftpConfig = {
      host: process.env.FTP_HOST || '',
      user: process.env.FTP_USER || '',
      password: process.env.FTP_PASSWORD || '',
      secure: process.env.FTP_SECURE === 'true', // FTPS
      basePath: process.env.FTP_BASE_PATH || '/www',
      publicUrl: process.env.FTP_PUBLIC_URL || '',
    };
    
    const driver = createFTPDriver(ftpConfig);
    
    if (!driver.isConfigured()) {
      console.warn('FTP storage not properly configured, falling back to local storage');
      return createLocalDriver();
    }
    
    return driver;
  }
  
  return createLocalDriver();
}

export const runtime = 'nodejs';

const MAX_BYTES = 15 * 1024 * 1024; // 15MB cap
const ALLOWED_TYPES = new Set(['image/png','image/jpeg','image/webp','image/gif','application/pdf']);

export async function POST(req: NextRequest) {
  try {
    console.log('📤 Upload API - Receiving file upload request');
    const form = await req.formData();
    const file = form.get('file');
    const category = (form.get('category') as string) || 'clinical-images';
    const patientId = (form.get('patientId') as string) || '';
    const imageType = (form.get('imageType') as string) || '';

    console.log('📤 Upload details:');
    console.log('  Category:', category);
    console.log('  Patient ID:', patientId);
    console.log('  Image Type:', imageType);

    if (!file || !(file instanceof File)) {
      console.error('❌ Missing file');
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    
    console.log('  File name:', file.name);
    console.log('  File type:', file.type);
    console.log('  File size:', file.size, 'bytes');
    
    if (file.size > MAX_BYTES) {
      console.error('❌ File too large:', file.size, 'bytes');
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      console.error('❌ Unsupported content type:', file.type);
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
    }

    console.log('✅ File validation passed, converting to buffer...');
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('✅ Buffer created, size:', buffer.length, 'bytes');
    
    console.log('🔹 Getting storage driver...');
    const driver = getDriver();
    console.log('✅ Using driver:', driver.name);
    
    const timestamp = Date.now();
    const baseName = `${patientId || 'anon'}_${imageType || 'image'}_${timestamp}`;
    const finalFileName = baseName + '_' + file.name.replace(/[^A-Za-z0-9._-]/g, '');
    
    console.log('🔹 Uploading with parameters:');
    console.log('  Final file name:', finalFileName);
    console.log('  Category:', category);
    console.log('  Sub path:', patientId || 'none');
    
    const result = await driver.upload({
      buffer,
      originalName: file.name,
      contentType: file.type,
      category,
      subPath: patientId ? patientId : undefined,
      fileName: finalFileName
    });

    console.log('✅✅ Upload completed successfully!');
    console.log('  URL:', result.url);
    console.log('  Path:', result.path);
    console.log('  Driver:', result.driver);
    console.log('  Size:', result.size);
    
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
