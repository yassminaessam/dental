import { NextRequest, NextResponse } from 'next/server';
import { AppointmentsService } from '@/services/appointments';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const patientId = searchParams.get('patientId');

    if (!email && !patientId) {
      return NextResponse.json({ error: 'Email or patientId is required.' }, { status: 400 });
    }

    // Get all appointments and filter by patient email or ID
    const allAppointments = await AppointmentsService.list();
    
    const patientAppointments = allAppointments.filter(apt => {
      if (email && apt.patientEmail === email) return true;
      if (patientId && apt.patientId === patientId) return true;
      return false;
    });

    // Serialize dates
    const serialized = patientAppointments.map(apt => ({
      ...apt,
      dateTime: apt.dateTime.toISOString(),
      createdAt: apt.createdAt?.toISOString(),
      updatedAt: apt.updatedAt?.toISOString(),
      confirmedAt: apt.confirmedAt?.toISOString(),
      rejectedAt: apt.rejectedAt?.toISOString(),
    }));

    return NextResponse.json({ appointments: serialized });
  } catch (error) {
    console.error('[api/patient/appointments] GET error', error);
    return NextResponse.json({ error: 'Failed to load patient appointments.' }, { status: 500 });
  }
}
