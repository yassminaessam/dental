import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'basic-ftp';

export const runtime = 'nodejs';

// Proxy images from FTP server for local development
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');

    if (!imagePath) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    console.log('🔹 FTP Proxy: Downloading image:', imagePath);

    const client = new Client();
    
    try {
      // Connect to FTP
      await client.access({
        host: process.env.FTP_HOST || '',
        user: process.env.FTP_USER || '',
        password: process.env.FTP_PASSWORD || '',
        secure: process.env.FTP_SECURE === 'true',
        secureOptions: {
          rejectUnauthorized: false,
        },
      });

      console.log('✅ Connected to FTP');

      // Download file to buffer
      const chunks: Buffer[] = [];
      const { Writable } = await import('stream');
      
      const downloadStream = new Writable({
        write(chunk: Buffer, encoding, callback) {
          chunks.push(chunk);
          callback();
        }
      });

      const remotePath = `${process.env.FTP_BASE_PATH}/${imagePath}`;
      console.log('🔹 Downloading from:', remotePath);

      await client.downloadTo(downloadStream, remotePath);
      
      const buffer = Buffer.concat(chunks);
      console.log('✅ Downloaded:', buffer.length, 'bytes');

      // Determine content type from file extension
      const ext = imagePath.split('.').pop()?.toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === 'png') contentType = 'image/png';
      else if (ext === 'gif') contentType = 'image/gif';
      else if (ext === 'webp') contentType = 'image/webp';

      // Return image
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } finally {
      client.close();
    }
  } catch (error) {
    console.error('❌ FTP Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image from FTP', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
