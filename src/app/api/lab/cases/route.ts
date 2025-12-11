import { NextResponse } from 'next/server';
import { LabManagementService, LabCaseStatus, LabCasePriority } from '@/services/lab-management';
import { InvoicesService } from '@/services/invoices';

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
    let labCase = await LabManagementService.createCase(data);
    
    // Auto-create invoice if cost is provided
    const cost = data.estimatedCost || data.actualCost;
    if (cost && cost > 0 && data.patientId) {
      try {
        const invoice = await InvoicesService.create({
          number: `INV-LAB-${Date.now()}`,
          patientId: data.patientId,
          patientNameSnapshot: data.patientName,
          date: new Date(),
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          status: 'Draft',
          notes: `Lab Case: ${labCase.caseNumber} - ${data.caseType}${data.labName ? ` (${data.labName})` : ''}`,
          items: [{
            description: `Lab Work: ${data.caseType}${data.toothNumbers ? ` - Teeth: ${data.toothNumbers}` : ''}`,
            quantity: 1,
            unitPrice: cost,
          }],
          createdBy: data.createdBy,
        });
        
        // Link the invoice to the lab case
        labCase = await LabManagementService.updateCase({
          id: labCase.id,
          invoiceId: invoice.id,
        });
      } catch (invoiceError) {
        console.error('Error creating invoice for lab case:', invoiceError);
        // Don't fail the case creation if invoice fails
      }
    }
    
    return NextResponse.json(labCase);
  } catch (error) {
    console.error('Error creating lab case:', error);
    return NextResponse.json(
      { error: 'Failed to create lab case' },
      { status: 500 }
    );
  }
}
