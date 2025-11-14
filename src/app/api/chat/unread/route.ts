import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET unread chat messages for notifications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userType = searchParams.get('userType'); // 'admin' or 'patient'
    const patientEmail = searchParams.get('patientEmail'); // for patient users
    const limit = parseInt(searchParams.get('limit') || '10');

    if (userType === 'patient' && !patientEmail) {
      return NextResponse.json(
        { error: 'Patient email is required' },
        { status: 400 }
      );
    }

    let unreadMessages = [];

    if (userType === 'admin') {
      // Get unread messages from patients for admin
      unreadMessages = await prisma.chatMessage.findMany({
        where: {
          senderType: 'patient',
          isRead: false,
        },
        include: {
          conversation: {
            select: {
              id: true,
              patientName: true,
              patientEmail: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } else if (userType === 'patient') {
      // Get unread messages from staff for a specific patient
      const conversations = await prisma.chatConversation.findMany({
        where: {
          patientEmail: patientEmail,
        },
        select: {
          id: true,
        },
      });

      const conversationIds = conversations.map(c => c.id);

      unreadMessages = await prisma.chatMessage.findMany({
        where: {
          conversationId: { in: conversationIds },
          senderType: 'staff',
          isRead: false,
        },
        include: {
          conversation: {
            select: {
              id: true,
              patientName: true,
              staffName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    }

    return NextResponse.json({ 
      unreadMessages,
      count: unreadMessages.length 
    });
  } catch (error) {
    console.error('Error fetching unread messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread messages' },
      { status: 500 }
    );
  }
}
