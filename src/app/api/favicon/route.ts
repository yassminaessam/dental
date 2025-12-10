import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET: Serve the favicon from database settings or fallback to local file
 * This ensures browsers always get the correct favicon with proper cache headers
 */
export async function GET(req: NextRequest) {
  try {
    // Try to get favicon URL from database settings
    const settings = await prisma.clinicSettings.findUnique({
      where: { id: 'main' },
      select: { faviconUrl: true }
    });
    
    const faviconUrl = settings?.faviconUrl;
    
    if (faviconUrl) {
      // Redirect to the FTP-hosted favicon with cache-busting
      const redirectUrl = faviconUrl.includes('?') 
        ? `${faviconUrl}&v=${Date.now()}` 
        : `${faviconUrl}?v=${Date.now()}`;
      
      return NextResponse.redirect(redirectUrl, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }
    
    // Fallback: serve local favicon.svg
    const publicDir = path.join(process.cwd(), 'public');
    const faviconPath = path.join(publicDir, 'favicon.svg');
    
    try {
      const faviconBuffer = await fs.readFile(faviconPath);
      return new NextResponse(new Uint8Array(faviconBuffer), {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    } catch {
      return NextResponse.json({ error: 'Favicon not found' }, { status: 404 });
    }
  } catch (err: any) {
    console.error('Favicon GET failed:', err);
    return NextResponse.json({ error: 'Failed to get favicon' }, { status: 500 });
  }
}

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
    
    // Always save as favicon.svg (convert extension if needed for consistency)
    const faviconPath = path.join(publicDir, 'favicon.svg');
    const appleTouchIconPath = path.join(publicDir, 'apple-touch-icon.svg');
    
    // For non-SVG files, also save with original extension
    const originalExtPath = !isSvg ? path.join(publicDir, `favicon.${extension}`) : null;
    
    try {
      // Write the main favicon file
      await fs.writeFile(faviconPath, buffer);
      console.log('✅ Favicon saved to:', faviconPath);
      
      // Write the apple-touch-icon file (same image)
      await fs.writeFile(appleTouchIconPath, buffer);
      console.log('✅ Apple touch icon saved to:', appleTouchIconPath);
      
      // If not SVG, also save with original extension for compatibility
      if (originalExtPath) {
        await fs.writeFile(originalExtPath, buffer);
        console.log('✅ Original format favicon saved to:', originalExtPath);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Favicon files updated locally',
        files: ['favicon.svg', 'apple-touch-icon.svg', originalExtPath ? `favicon.${extension}` : null].filter(Boolean)
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
