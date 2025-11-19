import { NextRequest, NextResponse } from 'next/server';
import * as ftp from 'basic-ftp';

export const runtime = 'nodejs';

// Proxy images from FTP server for local development
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');

    console.log('\n🔹 ==================== FTP PROXY REQUEST ====================');
    console.log('  Full URL:', request.url);
    console.log('  Image Path Param (from query):', imagePath);
    console.log('\n  Environment Variables:');
    console.log('    FTP_HOST:', process.env.FTP_HOST);
    console.log('    FTP_USER:', process.env.FTP_USER);
    console.log('    FTP_BASE_PATH:', process.env.FTP_BASE_PATH);
    console.log('    FTP_PASSWORD set?', !!process.env.FTP_PASSWORD);

    if (!imagePath) {
      console.error('❌ Missing path parameter');
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    if (!process.env.FTP_HOST || !process.env.FTP_USER || !process.env.FTP_PASSWORD) {
      console.error('❌ FTP credentials not configured in environment');
      console.error('   Make sure .env.local has FTP_HOST, FTP_USER, FTP_PASSWORD');
      return NextResponse.json({ error: 'FTP credentials not configured' }, { status: 500 });
    }

    const client = new ftp.Client();
    
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

      // Construct remote path
      // The imagePath should be relative: "clinical-images/patient-id/file.jpg"
      // If FTP_BASE_PATH is empty, user's home directory is already the assets folder
      // So we use relative path directly
      
      console.log('\n  Path Construction:');
      console.log('    Base Path:', process.env.FTP_BASE_PATH || '(empty - using FTP home directory)');
      console.log('    Relative Path:', imagePath);
      
      const remotePath = process.env.FTP_BASE_PATH 
        ? `${process.env.FTP_BASE_PATH}/${imagePath}`
        : imagePath;
      
      console.log('    Final FTP Path:', remotePath);
      
      // Check current working directory (FTP home) and ensure we're there
      const cwd = await client.pwd();
      console.log('    Current working directory (FTP home):', cwd);
      
      await client.cd('/');
      console.log('    Set to FTP home directory');
      console.log('\n🔹 Attempting to download from FTP...');

      // Download file to buffer
      const chunks: Buffer[] = [];
      const { Writable } = await import('stream');
      
      const downloadStream = new Writable({
        write(chunk: Buffer, encoding, callback) {
          chunks.push(chunk);
          callback();
        }
      });

      await client.downloadTo(downloadStream, remotePath);
      await new Promise((resolve) => downloadStream.end(resolve));
      
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
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Environment check:', {
      FTP_HOST: process.env.FTP_HOST ? '✅ Set' : '❌ Missing',
      FTP_USER: process.env.FTP_USER ? '✅ Set' : '❌ Missing',
      FTP_PASSWORD: process.env.FTP_PASSWORD ? '✅ Set' : '❌ Missing',
      FTP_BASE_PATH: process.env.FTP_BASE_PATH ? '✅ Set' : '❌ Missing',
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to proxy image from FTP', 
        details: error instanceof Error ? error.message : 'Unknown',
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
