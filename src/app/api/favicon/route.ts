import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET: Serve the favicon from database settings (admin-uploaded favicon only)
 * Returns 404 if no favicon is configured in settings
 */
export async function GET() {
  try {
    // Get favicon URL from database settings
    const settings = await prisma.clinicSettings.findUnique({
      where: { id: 'main' },
      select: { faviconUrl: true }
    });
    
    const faviconUrl = settings?.faviconUrl;
    
    if (!faviconUrl) {
      // No favicon configured in settings
      return NextResponse.json({ error: 'No favicon configured' }, { status: 404 });
    }
    
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
  } catch (err: unknown) {
    console.error('Favicon GET failed:', err);
    return NextResponse.json({ error: 'Failed to get favicon' }, { status: 500 });
  }
}
