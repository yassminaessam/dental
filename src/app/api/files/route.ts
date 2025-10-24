import { NextRequest, NextResponse } from 'next/server';
import { neonFileStorage } from '@/services/neon-file-storage';
import { neonAuth } from '@/services/neon-auth';

/**
 * File upload and management API endpoint
 * Handles file uploads with Neon database tracking
 */

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user
    const user = await neonAuth.verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const patientId = formData.get('patientId') as string;
    const treatmentId = formData.get('treatmentId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload file
    const uploadedFile = await neonFileStorage.uploadFile({
      userId: user.id,
      category: category as any,
      patientId: patientId || undefined,
      treatmentId: treatmentId || undefined,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      buffer
    });

    return NextResponse.json({
      success: true,
      file: uploadedFile,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('File upload API error:', error);
    return NextResponse.json(
      { error: 'File upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user
    const user = await neonAuth.verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const treatmentId = searchParams.get('treatmentId');
    const category = searchParams.get('category');
    const mimeType = searchParams.get('mimeType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Search files
    const files = await neonFileStorage.searchFiles({
      userId: user.role === 'patient' ? user.id : undefined, // Patients can only see their own files
      patientId: patientId || undefined,
      treatmentId: treatmentId || undefined,
      category: category || undefined,
      mimeType: mimeType || undefined
    }, limit, offset);

    return NextResponse.json({
      success: true,
      files
    });

  } catch (error) {
    console.error('File search API error:', error);
    return NextResponse.json(
      { error: 'File search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get auth token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user
    const user = await neonAuth.verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Delete file (soft delete)
    const success = await neonFileStorage.deleteFile(fileId, user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'File not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}