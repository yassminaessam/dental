import { NextRequest, NextResponse } from 'next/server';
import { LocalStorageService } from '@/services/local-storage';
import fs from 'fs';
import path from 'path';

/**
 * File serving API endpoint
 * Serves files from local storage
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string; filename: string } }
) {
  try {
    const { category, filename } = params;
    
    // Get file information
    const fileInfo = await LocalStorageService.getFileStream(category, filename);
    
    // Read file
    const filePath = fileInfo.filePath;
    const fileBuffer = fs.readFileSync(filePath);
    
    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', fileInfo.mimeType);
    headers.set('Content-Length', fileInfo.size.toString());
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    
    // Set Content-Disposition for downloads
    if (fileInfo.mimeType.startsWith('application/')) {
      headers.set('Content-Disposition', `attachment; filename="${fileInfo.originalName}"`);
    }
    
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }
}