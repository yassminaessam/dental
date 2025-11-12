import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Get upcoming appointments count
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        patientEmail: email,
        date: {
          gte: new Date(),
        },
        status: {
          in: ['Pending', 'Confirmed'],
        },
      },
    });

    // Get unread messages count
    const unreadMessages = await prisma.chatMessage.count({
      where: {
        conversation: {
          patientEmail: email,
        },
        senderRole: {
          not: 'patient',
        },
        read: false,
      },
    });

    // Get pending invoices count
    const pendingInvoices = await prisma.invoice.count({
      where: {
        patientId: patient.id,
        status: 'Pending',
      },
    });

    // Get pending invoices total amount
    const pendingInvoicesData = await prisma.invoice.findMany({
      where: {
        patientId: patient.id,
        status: 'Pending',
      },
      select: {
        total: true,
      },
    });

    const pendingAmount = pendingInvoicesData.reduce(
      (sum, invoice) => sum + invoice.total,
      0
    );

    // Get last appointment
    const lastAppointment = await prisma.appointment.findFirst({
      where: {
        patientEmail: email,
        date: {
          lt: new Date(),
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Get next appointment
    const nextAppointment = await prisma.appointment.findFirst({
      where: {
        patientEmail: email,
        date: {
          gte: new Date(),
        },
        status: {
          in: ['Pending', 'Confirmed'],
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({
      stats: {
        upcomingAppointments,
        unreadMessages,
        pendingInvoices,
        pendingAmount,
        lastVisit: lastAppointment?.date || null,
        nextAppointment: nextAppointment
          ? {
              id: nextAppointment.id,
              date: nextAppointment.date,
              time: nextAppointment.time,
              treatmentType: nextAppointment.treatmentType,
              doctor: nextAppointment.doctor,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
