import { NextResponse } from 'next/server';
import { LabManagementService } from '@/services/lab-management';

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
    return NextResponse.json(labCase);
  } catch (error) {
    console.error('Error fetching lab case:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab case' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const labCase = await LabManagementService.updateCase({ id, ...data });
    return NextResponse.json(labCase);
  } catch (error) {
    console.error('Error updating lab case:', error);
    return NextResponse.json(
      { error: 'Failed to update lab case' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await LabManagementService.deleteCase(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lab case:', error);
    return NextResponse.json(
      { error: 'Failed to delete lab case' },
      { status: 500 }
    );
  }
}
