// API Route for File Download
import { NextRequest, NextResponse } from 'next/server';
import { neonFileStorage } from '@/services/neon-file-storage';
import { neonAuth } from '@/services/neon-auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  try {
    // Get auth token from header or query param
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.nextUrl.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user
    const user = await neonAuth.verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const params = await context.params;
    const fileId = params.fileId;

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Get file buffer
    const result = await neonFileStorage.getFileBuffer(fileId);

    if (!result) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const { buffer, file } = result;

    // Check if user has permission to access this file
    if (user.role === 'patient' && file.userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', file.mimeType);
    headers.set('Content-Length', file.size.toString());
    headers.set('Content-Disposition', `inline; filename="${file.originalName}"`);
    headers.set('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour

    return new NextResponse(buffer as any, { headers });

  } catch (error) {
    console.error('File download API error:', error);
    return NextResponse.json(
      { error: 'File download failed' },
      { status: 500 }
    );
  }
}