import { NextResponse } from 'next/server';
import { LabManagementService } from '@/services/lab-management';

// GET attachments for a case
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const labCase = await LabManagementService.getCase(id);
    if (!labCase) {
      return NextResponse.json(
        { error: 'Lab case not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(labCase.attachments || []);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    );
  }
}

// Add attachment to a case
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { fileName, fileUrl, fileType, fileSize, description, uploadedBy } = data;

    if (!fileName || !fileUrl || !fileType) {
      return NextResponse.json(
        { error: 'fileName, fileUrl, and fileType are required' },
        { status: 400 }
      );
    }

    const attachment = await LabManagementService.addAttachment(
      id,
      fileName,
      fileUrl,
      fileType,
      fileSize,
      description,
      uploadedBy
    );
    return NextResponse.json(attachment);
  } catch (error) {
    console.error('Error adding attachment:', error);
    return NextResponse.json(
      { error: 'Failed to add attachment' },
      { status: 500 }
    );
  }
}
