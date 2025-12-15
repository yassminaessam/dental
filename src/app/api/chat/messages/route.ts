import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper function to create notification for patient when staff replies
async function createNotificationForPatient(
  conversationId: string,
  staffName: string,
  messagePreview: string
) {
  try {
    // Get the conversation to find the patient's user account
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId },
      select: { patientEmail: true, patientName: true, patientId: true },
    });

    if (!conversation?.patientEmail) return;

    // Find the patient's user account by email
    const patientUser = await prisma.user.findUnique({
      where: { email: conversation.patientEmail },
      select: { id: true },
    });

    if (!patientUser) return;

    // Create notification for the patient
    await prisma.notification.create({
      data: {
        userId: patientUser.id,
        type: 'CHAT_MESSAGE',
        title: 'رد جديد من الطاقم | New Staff Reply',
        message: `${staffName}: ${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}`,
        relatedId: conversationId,
        relatedType: 'chat',
        link: '/patient-messages',
        priority: 'NORMAL',
        metadata: { staffName, messagePreview: messagePreview.substring(0, 200) },
      },
    });
  } catch (error) {
    console.error('[api/chat/messages] Failed to create patient notification:', error);
    // Don't throw - notification failure shouldn't break the chat
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message, senderType, senderName, senderId } = body;

    if (!conversationId || !message || !senderType || !senderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create message
    const newMessage = await prisma.chatMessage.create({
      data: {
        conversationId,
        message,
        senderType,
        senderName,
        senderId: senderId || null,
      },
    });

    // Update conversation's lastMessageAt
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { 
        lastMessageAt: new Date(),
        ...(senderType === 'staff' && { staffId: senderId, staffName: senderName }),
      },
    });

    // If staff is sending a message, create notification for the patient
    if (senderType === 'staff') {
      await createNotificationForPatient(conversationId, senderName, message);
    }

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages as read if they're from staff
    await prisma.chatMessage.updateMany({
      where: {
        conversationId,
        senderType: 'staff',
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
