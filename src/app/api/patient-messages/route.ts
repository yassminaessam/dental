import { NextRequest, NextResponse } from 'next/server';
import { getCollection, addDocument } from '@/services/datastore.server';

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
