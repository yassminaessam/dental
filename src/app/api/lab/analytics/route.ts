import { NextResponse } from 'next/server';
import { LabManagementService } from '@/services/lab-management';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const analytics = await LabManagementService.getAnalytics(
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined
    );
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching lab analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab analytics' },
      { status: 500 }
    );
  }
}
