import { NextResponse } from 'next/server';
import { LabManagementService, LabCaseStatus } from '@/services/lab-management';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { status, message, updatedBy, shareWithLab } = data;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const labCase = await LabManagementService.updateCaseStatus(
      id,
      status as LabCaseStatus,
      message,
      updatedBy,
      shareWithLab
    );
    return NextResponse.json(labCase);
  } catch (error) {
    console.error('Error updating lab case status:', error);
    return NextResponse.json(
      { error: 'Failed to update lab case status' },
      { status: 500 }
    );
  }
}
