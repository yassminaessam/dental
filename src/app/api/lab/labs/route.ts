import { NextResponse } from 'next/server';
import { LabManagementService } from '@/services/lab-management';

export async function GET() {
  try {
    const labs = await LabManagementService.listLabs();
    return NextResponse.json(labs);
  } catch (error) {
    console.error('Error fetching labs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const lab = await LabManagementService.createLab(data);
    return NextResponse.json(lab);
  } catch (error) {
    console.error('Error creating lab:', error);
    return NextResponse.json(
      { error: 'Failed to create lab' },
      { status: 500 }
    );
  }
}
