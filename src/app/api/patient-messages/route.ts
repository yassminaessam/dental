import { NextRequest, NextResponse } from 'next/server';
import { getCollection, addDocument } from '@/services/datastore.server';
import { prisma } from '@/lib/prisma';

// Helper function to create notifications for admin/staff when patient sends a message
async function createMessageNotificationForAdmins(
  messageId: string,
  patientName: string,
  patientEmail: string,
  subject: string
) {
  try {
    // Get all admin and receptionist users who should receive notifications
    const staffUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'receptionist'],
        },
        isActive: true,
      },
      select: { id: true },
    });

    if (staffUsers.length === 0) return;

    // Create notifications for all staff users
    const notifications = staffUsers.map((user) => ({
      userId: user.id,
      type: 'MESSAGE_RECEIVED' as const,
      title: 'رسالة جديدة من مريض | New Patient Message',
      message: `${patientName}: ${subject.substring(0, 100)}${subject.length > 100 ? '...' : ''}`,
      relatedId: messageId,
      relatedType: 'patient-message',
      link: `/communications?messageId=${messageId}`,
      priority: 'NORMAL' as const,
      metadata: { patientName, patientEmail, subject },
    }));

    await prisma.notification.createMany({
      data: notifications,
    });
  } catch (error) {
    console.error('[api/patient-messages] Failed to create admin notifications:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientEmail = searchParams.get('patientEmail');

    if (!patientEmail) {
      return NextResponse.json({ error: 'Patient email required' }, { status: 400 });
    }

    const messages = await getCollection('patient-messages');

    // Filter messages by patient email
    const filteredMessages = messages.filter((msg: any) => msg.patientEmail === patientEmail);

    return NextResponse.json({ messages: filteredMessages || [] });
  } catch (error) {
    console.error('[api/patient-messages] GET error', error);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientEmail, patientName, subject, message, from } = body;

    if (!patientEmail || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newMessage = {
      patientEmail,
      patientName: patientName || 'Patient',
      from: from || 'Patient',
      subject,
      content: message,
      status: 'unread',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const newId = await addDocument('patient-messages', newMessage);

    // Create notification for admin/staff about new patient message
    await createMessageNotificationForAdmins(newId, patientName || 'Patient', patientEmail, subject);

    return NextResponse.json({ 
      success: true, 
      messageId: newId,
      message: { ...newMessage, id: newId }
    }, { status: 201 });
  } catch (error) {
    console.error('[api/patient-messages] POST error', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
