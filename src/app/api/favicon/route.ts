import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

/**
 * This API endpoint saves the favicon to the local /public/ folder
 * so it becomes the default fallback favicon.
 * 
 * Note: This only works in environments where the filesystem is writable
 * (local development, self-hosted). On Vercel/serverless, this will fail silently.
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 1MB for favicon)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 1MB)' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Determine the file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || 'svg';
    const isSvg = file.type === 'image/svg+xml' || extension === 'svg';
    
    // Path to the public folder
    const publicDir = path.join(process.cwd(), 'public');
    
    // Save as favicon.svg or favicon.ico/png depending on type
    const faviconFileName = isSvg ? 'favicon.svg' : `favicon.${extension}`;
    const faviconPath = path.join(publicDir, faviconFileName);
    
    // Also save as apple-touch-icon for iOS Safari
    const appleTouchIconPath = path.join(publicDir, isSvg ? 'apple-touch-icon.svg' : `apple-touch-icon.${extension}`);
    
    try {
      // Write the favicon file
      await fs.writeFile(faviconPath, buffer);
      console.log('✅ Favicon saved to:', faviconPath);
      
      // Write the apple-touch-icon file (same image)
      await fs.writeFile(appleTouchIconPath, buffer);
      console.log('✅ Apple touch icon saved to:', appleTouchIconPath);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Favicon files updated locally',
        files: [faviconFileName, isSvg ? 'apple-touch-icon.svg' : `apple-touch-icon.${extension}`]
      });
    } catch (writeError: any) {
      // This is expected to fail on read-only filesystems (Vercel, etc.)
      console.warn('⚠️ Could not write favicon to local filesystem (expected on serverless):', writeError.message);
      return NextResponse.json({ 
        success: false, 
        message: 'Filesystem is read-only (serverless environment). Favicon will be loaded dynamically.',
        error: writeError.message
      });
    }
  } catch (err: any) {
    console.error('Favicon save failed:', err);
    return NextResponse.json({ error: 'Failed to save favicon' }, { status: 500 });
  }
}
