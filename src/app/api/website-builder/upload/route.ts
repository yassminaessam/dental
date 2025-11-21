import { NextRequest, NextResponse } from 'next/server';
import Client from 'ftp';
import { Readable } from 'stream';

const FTP_CONFIG = {
  host: process.env.NEXT_PUBLIC_FTP_HOST || 'cairodental.freehostia.com',
  user: process.env.NEXT_PUBLIC_FTP_USER || 'cairodental',
  password: process.env.NEXT_PUBLIC_FTP_PASSWORD || 'Aa@123456',
  port: 21,
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'website-assets';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${category}_${timestamp}_${randomStr}.${fileExtension}`;
    const filePath = `/uploads/website-builder/${category}/${fileName}`;

    // Upload to FTP
    const uploadSuccess = await uploadToFTP(buffer, filePath);
    
    if (!uploadSuccess) {
      return NextResponse.json({ error: 'FTP upload failed' }, { status: 500 });
    }

    // Return the public URL
    const publicUrl = `http://${FTP_CONFIG.host}${filePath}`;
    
    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      path: filePath,
      filename: fileName
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, { status: 500 });
  }
}

async function uploadToFTP(buffer: Buffer, filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const client = new Client();
    
    client.on('ready', async () => {
      try {
        // Ensure directory exists
        const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
        await ensureDirectoryExists(client, dirPath);
        
        // Upload file
        const stream = Readable.from(buffer);
        client.put(stream, filePath, (err) => {
          client.end();
          if (err) {
            console.error('FTP upload error:', err);
            resolve(false);
          } else {
            console.log('File uploaded successfully:', filePath);
            resolve(true);
          }
        });
      } catch (err) {
        console.error('FTP operation error:', err);
        client.end();
        resolve(false);
      }
    });
    
    client.on('error', (err) => {
      console.error('FTP connection error:', err);
      resolve(false);
    });
    
    client.connect(FTP_CONFIG);
  });
}

async function ensureDirectoryExists(client: any, dirPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const parts = dirPath.split('/').filter(Boolean);
    let currentPath = '';
    
    const createNextDir = (index: number) => {
      if (index >= parts.length) {
        resolve();
        return;
      }
      
      currentPath += '/' + parts[index];
      
      client.mkdir(currentPath, true, (err: any) => {
        // Ignore error if directory already exists
        createNextDir(index + 1);
      });
    };
    
    createNextDir(0);
  });
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const filePath = url.searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    const fileData = await readFromFTP(filePath);
    
    if (!fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Determine content type based on extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    const contentType = getContentType(extension || '');

    return new NextResponse(fileData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error: any) {
    console.error('Read error:', error);
    return NextResponse.json({ 
      error: 'Failed to read file', 
      details: error.message 
    }, { status: 500 });
  }
}

async function readFromFTP(filePath: string): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    const client = new Client();
    
    client.on('ready', () => {
      client.get(filePath, (err, stream) => {
        if (err) {
          console.error('FTP read error:', err);
          client.end();
          resolve(null);
          return;
        }
        
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => {
          client.end();
          resolve(Buffer.concat(chunks));
        });
        stream.on('error', (err: Error) => {
          console.error('Stream error:', err);
          client.end();
          resolve(null);
        });
      });
    });
    
    client.on('error', (err) => {
      console.error('FTP connection error:', err);
      resolve(null);
    });
    
    client.connect(FTP_CONFIG);
  });
}

function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    'pdf': 'application/pdf',
    'json': 'application/json',
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html',
  };
  
  return contentTypes[extension] || 'application/octet-stream';
}
