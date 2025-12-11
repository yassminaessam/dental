import { NextResponse } from 'next/server';
import { LabManagementService } from '@/services/lab-management';
import { InvoicesService } from '@/services/invoices';

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
    
    // Get existing case to check if invoice needs to be created/updated
    const existingCase = await LabManagementService.getCase(id);
    if (!existingCase) {
      return NextResponse.json(
        { error: 'Lab case not found' },
        { status: 404 }
      );
    }
    
    let labCase = await LabManagementService.updateCase({ id, ...data });
    
    // Check if we need to create or update invoice
    const newCost = data.actualCost || data.estimatedCost;
    const existingCost = existingCase.actualCost || existingCase.estimatedCost;
    const patientId = data.patientId || existingCase.patientId;
    
    // Create invoice if cost is added and no invoice exists
    if (newCost && newCost > 0 && patientId && !existingCase.invoiceId) {
      try {
        const invoice = await InvoicesService.create({
          number: `INV-LAB-${Date.now()}`,
          patientId: patientId,
          patientNameSnapshot: existingCase.patientName,
          date: new Date(),
          dueDate: labCase.dueDate ? new Date(labCase.dueDate) : undefined,
          status: 'Draft',
          notes: `Lab Case: ${labCase.caseNumber} - ${labCase.caseType}${labCase.labName ? ` (${labCase.labName})` : ''}`,
          items: [{
            description: `Lab Work: ${labCase.caseType}${labCase.toothNumbers ? ` - Teeth: ${labCase.toothNumbers}` : ''}`,
            quantity: 1,
            unitPrice: newCost,
          }],
        });
        
        // Link the invoice to the lab case
        labCase = await LabManagementService.updateCase({
          id: labCase.id,
          invoiceId: invoice.id,
        });
      } catch (invoiceError) {
        console.error('Error creating invoice for lab case:', invoiceError);
      }
    }
    // Update existing invoice if cost changed
    else if (existingCase.invoiceId && newCost && newCost !== existingCost) {
      try {
        await InvoicesService.update({
          id: existingCase.invoiceId,
          items: [{
            description: `Lab Work: ${labCase.caseType}${labCase.toothNumbers ? ` - Teeth: ${labCase.toothNumbers}` : ''}`,
            quantity: 1,
            unitPrice: newCost,
          }],
        });
      } catch (invoiceError) {
        console.error('Error updating invoice for lab case:', invoiceError);
      }
    }
    
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
