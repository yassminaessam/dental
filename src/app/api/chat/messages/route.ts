import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
