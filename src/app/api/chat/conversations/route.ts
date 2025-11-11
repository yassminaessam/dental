import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientName, patientEmail, patientId } = body;

    if (!patientName) {
      return NextResponse.json(
        { error: 'Patient name is required' },
        { status: 400 }
      );
    }

    // Create new conversation
    const conversation = await prisma.chatConversation.create({
      data: {
        patientName,
        patientEmail: patientEmail || null,
        patientId: patientId || null,
        status: 'Active',
      },
    });

    // Get messages for the conversation
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'Active';
    const limit = parseInt(searchParams.get('limit') || '50');

    const conversations = await prisma.chatConversation.findMany({
      where: {
        status: status as any,
      },
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
