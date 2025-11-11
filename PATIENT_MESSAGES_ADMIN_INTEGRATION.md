# Patient Messages - Admin Integration

## Overview
Patient messages sent from the patient portal are now fully integrated into the admin chat management system (إدارة المحادثات المباشرة).

## How It Works

### Patient Side
1. Patients navigate to **Patient Messages** page (`/patient-messages`)
2. They fill out the message form with:
   - Subject
   - Message content
3. Click "Send" button
4. Message is saved to `patient-messages` collection in the database

### Admin Side
1. Admins navigate to **إدارة المحادثات المباشرة** (`/admin/chats`)
2. The page now displays **BOTH**:
   - Live chat conversations (real-time chat)
   - Patient messages (from the messages form)

### Visual Distinction
- **Patient Messages**: Display a blue "رسالة" (Message) badge
- **Live Chats**: No special badge
- Patient messages show the subject in the preview
- All conversations sorted by most recent message

## Features Implemented

### 1. Unified View
**Location**: `/admin/chats`
- Combines live chat conversations and patient messages
- Single interface for all patient communications
- Sorted by latest message time

### 2. Message Grouping
**API Endpoint**: `/api/patient-messages/all`
- Groups patient messages by patient email
- Creates conversation threads per patient
- Maintains message history

### 3. Reply Functionality
**Admin can reply to patient messages**:
- Select a patient message conversation
- View all messages in the thread
- Type reply in the input box at the bottom
- Click send button (paper plane icon)
- Reply is saved to the same collection

**Reply Structure**:
- Uses patient's email and name
- Subject: "Re: [Original Subject]"
- From: "فريق الدعم" (Support Team)
- Linked to the same patient

### 4. Real-time Updates
- Conversations refresh every 5 seconds
- Messages refresh every 3 seconds when viewing a conversation
- New replies appear immediately after sending

## Technical Details

### Database Collections
1. **patient-messages** (Collection in datastore)
   - Stores all patient messages and staff replies
   - Fields: id, patientEmail, patientName, from, subject, content, status, date, createdAt

2. **ChatConversation & ChatMessage** (Prisma tables)
   - Stores live chat conversations
   - Different structure but merged in UI

### API Endpoints

#### `/api/patient-messages` (GET/POST)
- **GET**: Fetch messages filtered by patient email
- **POST**: Create new message or reply

#### `/api/patient-messages/all` (GET)
- Returns all patient messages grouped by patient
- Formatted as conversation objects
- Compatible with chat UI structure

### Message Types

#### Patient Message Conversation
```typescript
{
  id: 'patient-msg-[email]',
  patientName: string,
  patientEmail: string,
  status: 'Active',
  type: 'patient-message',
  lastMessageAt: string,
  messages: Array<{
    id: string,
    senderType: 'patient' | 'staff',
    senderName: string,
    message: string,
    subject?: string,
    createdAt: string
  }>
}
```

## User Flow

### Patient Sending a Message
1. Patient logs in
2. Goes to "Patient Messages" page
3. Fills out form
4. Clicks "Send Message"
5. Message saved with their email

### Admin Viewing and Replying
1. Admin logs in
2. Goes to "إدارة المحادثات المباشرة"
3. Sees new conversation with blue "رسالة" badge
4. Clicks on conversation
5. Reads patient's message(s)
6. Types reply in input box
7. Clicks send
8. Reply appears in thread

### Patient Viewing Reply
1. Patient goes back to "Patient Messages"
2. Sees staff reply in conversation thread
3. Can send follow-up messages

## Benefits

### For Admins
- **Single Interface**: Manage all communications in one place
- **Context**: See full conversation history
- **Easy Replies**: Simple input and send
- **Visual Indicators**: Distinguish message types at a glance

### For Patients
- **Asynchronous**: Send messages anytime
- **Thread History**: See all messages and replies
- **Simple**: Easy-to-use form interface
- **Reliable**: Messages stored permanently

## Future Enhancements

1. **Email Notifications**
   - Notify patients when staff replies
   - Notify staff when new messages arrive

2. **Message Status**
   - Read/Unread indicators
   - Delivery confirmation

3. **Attachments**
   - Allow file uploads
   - Image attachments

4. **Categories**
   - Tag messages by type (appointment, billing, medical question)
   - Filter conversations by category

5. **Auto-replies**
   - Set up automatic responses
   - Business hours notifications

## Testing Checklist

- [ ] Patient can send message
- [ ] Message appears in admin chats
- [ ] Admin can view message
- [ ] Admin can reply to message
- [ ] Patient can see reply
- [ ] Multiple messages create thread
- [ ] Conversations sorted correctly
- [ ] Visual badges display properly
- [ ] Both Arabic and English work

## Troubleshooting

### Messages not appearing in admin
- Check patient email is set correctly
- Verify API endpoint returns data
- Check console for errors

### Cannot send reply
- Verify admin has patient email context
- Check API endpoint permissions
- Ensure message format is correct

### Conversations not updating
- Check polling intervals
- Verify API responses
- Clear browser cache
