import { NextResponse } from 'next/server';
import { LabManagementService, LabCaseStatus } from '@/services/lab-management';
import { prisma } from '@/lib/prisma';

// Helper function to create notification for patient when lab case status changes
async function createLabStatusNotificationForPatient(
  labCase: any,
  newStatus: LabCaseStatus,
  message?: string
) {
  try {
    if (!labCase.patientId) return;

    // Find the patient in the Patient table to get their email
    const patient = await prisma.patient.findUnique({
      where: { id: labCase.patientId },
      select: { email: true, name: true },
    });

    if (!patient?.email) return;

    // Find the patient's user account by email
    const patientUser = await prisma.user.findUnique({
      where: { email: patient.email },
      select: { id: true },
    });

    if (!patientUser) return;

    // Map status to human-readable text (bilingual)
    const statusMap: Record<LabCaseStatus, string> = {
      'Draft': 'مسودة | Draft',
      'Submitted': 'تم الإرسال للمعمل | Submitted to Lab',
      'InProgress': 'قيد التنفيذ | In Progress',
      'QualityCheck': 'فحص الجودة | Quality Check',
      'Completed': 'مكتمل | Completed',
      'Delivered': 'تم التسليم | Delivered',
      'Cancelled': 'ملغي | Cancelled',
    };

    const notificationType = newStatus === 'Completed' || newStatus === 'Delivered' 
      ? 'LAB_CASE_COMPLETED' 
      : 'LAB_STATUS_UPDATE';

    await prisma.notification.create({
      data: {
        userId: patientUser.id,
        type: notificationType,
        title: `تحديث حالة المعمل | Lab Case Update`,
        message: `${labCase.caseType}: ${statusMap[newStatus]}${message ? ` - ${message}` : ''}`,
        relatedId: labCase.id,
        relatedType: 'lab-case',
        link: '/patient-lab',
        priority: newStatus === 'Completed' || newStatus === 'Delivered' ? 'HIGH' : 'NORMAL',
        metadata: { 
          caseType: labCase.caseType, 
          status: newStatus, 
          caseNumber: labCase.caseNumber 
        },
      },
    });
  } catch (error) {
    console.error('[api/lab/cases/status] Failed to create patient notification:', error);
  }
}

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

    // Create notification for the patient about the status change
    await createLabStatusNotificationForPatient(labCase, status as LabCaseStatus, message);

    return NextResponse.json(labCase);
  } catch (error) {
    console.error('Error updating lab case status:', error);
    return NextResponse.json(
      { error: 'Failed to update lab case status' },
      { status: 500 }
    );
  }
}
