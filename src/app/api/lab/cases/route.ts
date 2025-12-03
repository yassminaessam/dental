import { NextResponse } from 'next/server';
import { LabManagementService, LabCaseStatus, LabCasePriority } from '@/services/lab-management';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as LabCaseStatus | null;
    const labId = searchParams.get('labId');
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const priority = searchParams.get('priority') as LabCasePriority | null;
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const filters: any = {};
    if (status) filters.status = status;
    if (labId) filters.labId = labId;
    if (patientId) filters.patientId = patientId;
    if (doctorId) filters.doctorId = doctorId;
    if (priority) filters.priority = priority;
    if (fromDate) filters.fromDate = new Date(fromDate);
    if (toDate) filters.toDate = new Date(toDate);

    const cases = await LabManagementService.listCases(
      Object.keys(filters).length > 0 ? filters : undefined
    );
    return NextResponse.json(cases);
  } catch (error) {
    console.error('Error fetching lab cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab cases' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const labCase = await LabManagementService.createCase(data);
    return NextResponse.json(labCase);
  } catch (error) {
    console.error('Error creating lab case:', error);
    return NextResponse.json(
      { error: 'Failed to create lab case' },
      { status: 500 }
    );
  }
}
