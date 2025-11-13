import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get patient by email
    const patient = await prisma.patient.findUnique({
      where: { email },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Get medical records from Neon database
    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        patientId: patient.id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Get treatments (acts as medical records)
    const treatments = await prisma.treatment.findMany({
      where: {
        patientId: patient.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Get appointments history
    const appointments = await prisma.appointment.findMany({
      where: {
        patientEmail: email,
        status: 'Completed',
      },
      orderBy: {
        dateTime: 'desc',
      },
      take: 10,
    });

    // Transform Neon medical records
    const neonRecords = medicalRecords.map((record) => ({
      id: record.id,
      type: record.type || 'Medical Record',
      title: record.complaint || 'Medical Record',
      description: record.notes || record.complaint || '',
      date: record.date,
      doctor: record.provider,
      status: record.status,
      category: 'Medical Record',
      notes: record.notes,
    }));

    // Transform treatments into medical records format
    const treatmentRecords = treatments.map((treatment) => ({
      id: treatment.id,
      type: 'Treatment',
      title: treatment.procedure,
      description: treatment.notes || treatment.procedure,
      date: treatment.updatedAt,
      doctor: treatment.doctor,
      status: treatment.status,
      category: 'Treatment',
      cost: treatment.cost,
      notes: treatment.notes,
    }));

    // Add appointment records
    const appointmentRecords = appointments.map((apt) => ({
      id: apt.id,
      type: 'Visit',
      title: `${apt.type} - ${apt.doctor}`,
      description: apt.notes || `${apt.type} appointment`,
      date: apt.dateTime,
      doctor: apt.doctor,
      status: apt.status,
      category: 'Appointment',
      notes: apt.notes,
    }));

    // Combine all records and sort by date
    const allRecords = [...neonRecords, ...treatmentRecords, ...appointmentRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      records: allRecords,
      patient: {
        id: patient.id,
        name: patient.name,
        lastName: patient.lastName,
      },
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
