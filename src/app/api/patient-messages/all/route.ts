import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/services/datastore.server';

export async function GET(request: NextRequest) {
  try {
    const messages = await getCollection('patient-messages');

    // Group messages by patient email to create conversations
    const conversationMap = new Map<string, any>();

    messages.forEach((msg: any) => {
      const key = msg.patientEmail || msg.patientName;
      
      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          id: `patient-msg-${key}`,
          patientName: msg.patientName || 'Patient',
          patientEmail: msg.patientEmail,
          status: 'Active',
          lastMessageAt: msg.date || msg.createdAt,
          type: 'patient-message', // Add type to distinguish from live chat
          messages: [],
        });
      }

      const conversation = conversationMap.get(key);
      conversation.messages.push({
        id: msg.id,
        senderType: msg.from === 'Staff' || msg.from === 'فريق الدعم' ? 'staff' : 'patient',
        senderName: msg.from,
        message: msg.content,
        subject: msg.subject,
        createdAt: msg.date || msg.createdAt,
      });

      // Update last message time
      if (new Date(msg.date || msg.createdAt) > new Date(conversation.lastMessageAt)) {
        conversation.lastMessageAt = msg.date || msg.createdAt;
      }
    });

    // Convert map to array and sort messages within each conversation
    const conversations = Array.from(conversationMap.values()).map(conv => ({
      ...conv,
      messages: conv.messages.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    }));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('[api/patient-messages/all] GET error', error);
    return NextResponse.json({ error: 'Failed to load patient messages' }, { status: 500 });
  }
}
