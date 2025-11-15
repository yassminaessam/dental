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

    // Get upcoming appointments count
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        patientEmail: email,
        dateTime: { gte: new Date() },
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
        senderType: { not: 'patient' },
        isRead: false,
      },
    });

    // Get pending invoices count
    const pendingInvoices = await prisma.invoice.count({
      where: {
        patientId: patient.id,
        status: { in: ['Draft', 'Sent', 'Overdue'] },
      },
    });

    // Get pending invoices total amount
    const pendingInvoicesData = await prisma.invoice.findMany({
      where: {
        patientId: patient.id,
        status: { in: ['Draft', 'Sent', 'Overdue'] },
      },
      select: {
        amount: true,
      },
    });

    const pendingAmount = pendingInvoicesData.reduce((sum, invoice) => sum + Number(invoice.amount), 0);

    // Get last appointment
    const lastAppointment = await prisma.appointment.findFirst({
      where: {
        patientEmail: email,
        dateTime: { lt: new Date() },
      },
      orderBy: {
        dateTime: 'desc',
      },
    });

    // Get next appointment
    const nextAppointment = await prisma.appointment.findFirst({
      where: {
        patientEmail: email,
        dateTime: { gte: new Date() },
        status: {
          in: ['Pending', 'Confirmed'],
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    // Get recent messages (last 5 messages from staff/doctors)
    const recentMessages = await prisma.chatMessage.findMany({
      where: {
        conversation: {
          patientEmail: email,
        },
        senderType: { not: 'patient' },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
      include: {
        conversation: {
          select: {
            staffName: true,
            patientName: true,
          },
        },
      },
    });

    // Get health tips from portal content (if configured)
    const healthTips = await prisma.portalContent.findFirst({
      where: {
        type: 'health_tips',
      },
      select: {
        content: true,
      },
    }).catch(() => null);

    return NextResponse.json({
      stats: {
        upcomingAppointments,
        unreadMessages,
        pendingInvoices,
        pendingAmount,
        lastVisit: lastAppointment?.dateTime || null,
        nextAppointment: nextAppointment
          ? {
              id: nextAppointment.id,
              dateTime: nextAppointment.dateTime,
              type: nextAppointment.type,
              doctor: nextAppointment.doctor,
            }
          : null,
      },
      recentMessages: recentMessages.map(msg => ({
        id: msg.id,
        message: msg.message,
        senderName: msg.conversation.staffName || 'Staff',
        createdAt: msg.createdAt,
        isRead: msg.isRead,
      })),
      healthTips: healthTips?.content || null,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
