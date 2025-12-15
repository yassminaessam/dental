import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Helper function to create notifications for all admin/staff users
async function createNotificationForAdmins(
  conversationId: string,
  patientName: string,
  messagePreview: string
) {
  try {
    // Get all admin and staff users who should receive notifications
    const staffUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'doctor', 'receptionist'],
        },
        isActive: true,
      },
      select: { id: true },
    });

    if (staffUsers.length === 0) return;

    // Create notifications for all staff users
    const notifications = staffUsers.map((user) => ({
      userId: user.id,
      type: 'CHAT_MESSAGE' as const,
      title: 'رسالة محادثة جديدة | New Chat Message',
      message: `${patientName}: ${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}`,
      relatedId: conversationId,
      relatedType: 'chat',
      link: `/admin/chats?conversation=${conversationId}`,
      priority: 'NORMAL' as const,
      metadata: { patientName, messagePreview: messagePreview.substring(0, 200) },
    }));

    await prisma.notification.createMany({
      data: notifications,
    });
  } catch (error) {
    console.error('[api/patient/chat] Failed to create notifications:', error);
    // Don't throw - notification failure shouldn't break the chat
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientEmail = searchParams.get('patientEmail');
    const patientId = searchParams.get('patientId');

    if (!patientEmail && !patientId) {
      return NextResponse.json({ error: 'Patient email or ID is required.' }, { status: 400 });
    }

    // Find conversations for this patient
    const conversations = await prisma.chatConversation.findMany({
      where: {
        OR: [
          patientEmail ? { patientEmail } : {},
          patientId ? { patientId } : {},
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50, // Last 50 messages per conversation
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Serialize dates
    const serialized = conversations.map(conv => ({
      ...conv,
      lastMessageAt: conv.lastMessageAt.toISOString(),
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: conv.messages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt.toISOString(),
        readAt: msg.readAt?.toISOString(),
      })),
    }));

    return NextResponse.json({ conversations: serialized });
  } catch (error) {
    console.error('[api/patient/chat] GET error', error);
    return NextResponse.json({ error: 'Failed to load patient conversations.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, patientName, patientEmail, message } = body;

    if (!patientName || !message) {
      return NextResponse.json({ error: 'Patient name and message are required.' }, { status: 400 });
    }

    // Find or create conversation
    let conversation = await prisma.chatConversation.findFirst({
      where: {
        OR: [
          patientEmail ? { patientEmail } : {},
          patientId ? { patientId } : {},
        ],
      },
    });

    if (!conversation) {
      // Create new conversation
      conversation = await prisma.chatConversation.create({
        data: {
          patientId: patientId || null,
          patientName,
          patientEmail: patientEmail || null,
          status: 'Active',
        },
      });
    }

    // Create message
    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        senderType: 'patient',
        senderId: patientId || null,
        senderName: patientName,
        message,
      },
    });

    // Update conversation lastMessageAt
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // Create notifications for admin/staff users
    await createNotificationForAdmins(conversation.id, patientName, message);

    return NextResponse.json({ 
      message: {
        ...newMessage,
        createdAt: newMessage.createdAt.toISOString(),
        readAt: newMessage.readAt?.toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[api/patient/chat] POST error', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
