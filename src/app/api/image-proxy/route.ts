import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return new NextResponse('Missing url parameter', { status: 400 });
    }

    // Validate it's from our allowed domain
    if (!url.includes('dental.adsolutions-eg.com')) {
      return new NextResponse('Invalid domain', { status: 403 });
    }

    console.log('🖼️ Proxying image:', url);

    // Fetch the image from the external URL
    const imageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!imageResponse.ok) {
      console.error('❌ Image fetch failed:', imageResponse.status, imageResponse.statusText);
      return new NextResponse(`Image not found: ${imageResponse.statusText}`, { 
        status: imageResponse.status 
      });
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const buffer = await imageResponse.arrayBuffer();

    console.log('✅ Image fetched successfully, size:', buffer.byteLength, 'bytes');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('❌ Image proxy error:', error);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
