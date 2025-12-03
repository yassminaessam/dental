import { NextResponse } from 'next/server';
import { LabManagementService } from '@/services/lab-management';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lab = await LabManagementService.getLab(id);
    if (!lab) {
      return NextResponse.json(
        { error: 'Lab not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(lab);
  } catch (error) {
    console.error('Error fetching lab:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab' },
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
    const lab = await LabManagementService.updateLab(id, data);
    return NextResponse.json(lab);
  } catch (error) {
    console.error('Error updating lab:', error);
    return NextResponse.json(
      { error: 'Failed to update lab' },
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
    await LabManagementService.deleteLab(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lab:', error);
    return NextResponse.json(
      { error: 'Failed to delete lab' },
      { status: 500 }
    );
  }
}
