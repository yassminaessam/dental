import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Patient email is required' },
        { status: 400 }
      );
    }

    // First, find the patient by email
    const patient = await prisma.patient.findFirst({
      where: { email: email },
      select: { id: true, name: true }
    });

    if (!patient) {
      return NextResponse.json(
        { labCases: [], message: 'Patient not found' },
        { status: 200 }
      );
    }

    // Fetch lab cases for this patient
    const labCases = await prisma.labCase.findMany({
      where: { patientId: patient.id },
      include: {
        lab: {
          select: {
            id: true,
            name: true,
          }
        },
        updates: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Only show last 5 status updates
          select: {
            id: true,
            status: true,
            message: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform the data for patient view (hide internal details)
    const patientLabCases = labCases.map(labCase => ({
      id: labCase.id,
      caseNumber: labCase.caseNumber,
      caseType: labCase.caseType,
      toothNumbers: labCase.toothNumbers,
      shade: labCase.shade,
      material: labCase.material,
      status: labCase.status,
      priority: labCase.priority,
      requestDate: labCase.requestDate,
      dueDate: labCase.dueDate,
      sentToLabDate: labCase.sentToLabDate,
      receivedDate: labCase.receivedDate,
      deliveredDate: labCase.deliveredDate,
      description: labCase.description,
      labName: labCase.lab?.name || labCase.labName,
      // Status history for tracking
      statusHistory: labCase.updates.map((update, index, arr) => ({
        id: update.id,
        fromStatus: index < arr.length - 1 ? arr[index + 1].status : 'Draft',
        toStatus: update.status,
        message: update.message,
        date: update.createdAt,
      }))
    }));

    return NextResponse.json({
      labCases: patientLabCases,
      patientName: patient.name
    });

  } catch (error) {
    console.error('Error fetching patient lab cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lab cases' },
      { status: 500 }
    );
  }
}
