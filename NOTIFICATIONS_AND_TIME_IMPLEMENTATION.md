# Notifications and Time Display Implementation

## Overview
Added real-time notifications for both admin and patients, plus time display for all messages.

## Features Implemented

### 1. ✅ Admin Notifications (إدارة المحادثات المباشرة)

**Location**: Top navigation bar bell icon

**What Shows**:
- **Patient Messages**: When patients send new messages
- **Pending Appointments**: Appointments awaiting confirmation
- **Low Stock Items**: Inventory alerts

**Patient Message Notifications Include**:
- Patient name
- Message subject
- **Time sent** (e.g., "02:30 م")
- Blue bell icon indicator

**Features**:
- Real-time updates (refreshes every 30 seconds)
- Badge counter on bell icon shows total unread count
- Click notification to go directly to chat management page
- "View All Notifications" link at bottom

**Implementation**:
```typescript
// Fetches patient messages and filters out staff replies
const messages = await listDocuments('patient-messages');
const unreadPatientMessages = messages.filter(
  m => m.from !== 'فريق الدعم' && m.from !== 'Staff'
);
```

### 2. ✅ Patient Notifications (Patient Portal)

**Location**: Top navigation bar bell icon

**What Shows**:
- **Staff Replies**: When admin/staff reply to patient messages
- Shows message subject
- **Time of reply** (e.g., "02:30 PM" or "02:30 م")
- Blue message icon indicator

**Features**:
- Real-time updates (refreshes every 30 seconds)
- Badge counter shows number of new replies
- Click notification to go to messages page
- "View All Messages" link

**Implementation**:
```typescript
// Fetches messages for current patient email
const response = await fetch(`/api/patient-messages?patientEmail=${user.email}`);
const replies = messages.filter(
  m => m.from === 'فريق الدعم' || m.from === 'Staff'
);
```

### 3. ✅ Time Display on Messages

**Admin Chat Interface**:
- Each message bubble shows time in bottom corner
- Format: "02:30 م" (Arabic time format)
- Positioned based on sender (left for patient, right for staff)
- Gray text with slight opacity

**Patient Messages Interface**:
- Messages show time in notification dropdown
- Full message thread shows timestamps
- Time format adapts to language selection

**Time Formatting**:
```typescript
new Date(message.createdAt).toLocaleTimeString('ar-EG', {
  hour: '2-digit',
  minute: '2-digit',
})
```

### 4. ✅ Conversation List Time Display

**Admin Chats**:
- Each conversation shows last message time
- Format: "02:30 م"
- Updates automatically as new messages arrive
- Conversations sorted by most recent

**Features**:
- Time displayed in gray text next to status badge
- Shows when last activity occurred
- Helps prioritize conversations

## Visual Indicators

### Notification Badge
- **Color**: Gradient from blue to cyan (patient notifications)
- **Color**: Gradient from red to orange (admin notifications)
- **Animation**: Pulse effect
- **Position**: Top-right corner of bell icon
- **Shows**: Number of unread items

### Message Time Stamps
- **Font**: Small text (text-xs)
- **Color**: Muted gray (text-muted-foreground)
- **Opacity**: 70% for subtle appearance
- **Format**: 12-hour format with AM/PM or Arabic equivalent

## Auto-Refresh Intervals

### Admin Dashboard
- **Notifications**: Every 30 seconds
- **Chat Conversations**: Every 5 seconds
- **Active Chat Messages**: Every 3 seconds

### Patient Portal
- **Notifications**: Every 30 seconds
- **Message List**: Manual refresh or page reload

## User Experience Flow

### For Admins:
1. Patient sends message → Notification appears with bell icon
2. Admin clicks bell → Sees patient name, subject, and time
3. Admin clicks notification → Goes to chat management page
4. Admin sees full conversation with timestamps
5. Admin replies → Patient gets notification

### For Patients:
1. Staff replies to message → Notification appears with bell icon
2. Patient clicks bell → Sees "New reply from staff" with time
3. Patient clicks notification → Goes to messages page
4. Patient sees staff reply with timestamp
5. Patient can reply → Staff gets notification

## Translation Support

### English Notifications:
- "New reply from staff"
- "View All Messages"
- "Message Sent"
- Time format: "02:30 PM"

### Arabic Notifications:
- "رسالة جديدة من مريض" (New message from patient)
- "رد جديد من الفريق" (New reply from staff)
- "عرض جميع الرسائل" (View all messages)
- Time format: "02:30 م"

## Technical Implementation

### Admin Notification State
```typescript
const [unreadPatientMessages, setUnreadPatientMessages] = useState([]);
const notificationCount = pendingAppointments.length + 
                         lowStockItems.length + 
                         unreadPatientMessages.length;
```

### Patient Notification State
```typescript
const [staffReplies, setStaffReplies] = useState([]);
const [notificationCount, setNotificationCount] = useState(0);
```

### Time Display Component
```typescript
<p className="text-xs text-muted-foreground opacity-70">
  {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  })}
</p>
```

## Database Fields Used

### Patient Messages Collection
- `id`: Unique message identifier
- `patientEmail`: Filter for patient-specific messages
- `patientName`: Display in notifications
- `from`: Determine sender (patient vs staff)
- `subject`: Show in notifications
- `content`: Message body
- `date` or `createdAt`: Timestamp for sorting and display
- `status`: Track read/unread (future enhancement)

## Benefits

### For Clinic Staff:
- **Never miss patient messages**: Real-time notifications
- **Quick triage**: See message time to prioritize urgent ones
- **Efficient workflow**: Direct link from notification to chat
- **Context awareness**: See last activity time per conversation

### For Patients:
- **Stay informed**: Know immediately when staff responds
- **Convenience**: Don't need to keep checking messages page
- **Transparency**: See exactly when messages were sent/received
- **Trust**: Professional communication with timestamps

## Future Enhancements

1. **Mark as Read**
   - Mark notifications as read when clicked
   - Track read/unread status in database
   - Show unread count separately

2. **Sound Notifications**
   - Optional sound when new notification arrives
   - User preference toggle

3. **Browser Notifications**
   - Desktop/mobile push notifications
   - Requires user permission
   - Works even when tab not active

4. **Email Notifications**
   - Send email when message received
   - Daily digest option
   - Email notification preferences

5. **Unread Badge**
   - Show unread indicator on messages
   - Highlight unread conversations
   - Clear when viewed

6. **Date Display**
   - Show full date for older messages
   - "Today", "Yesterday" labels
   - Relative time ("5 minutes ago")

## Testing Checklist

- [x] Admin sees notification when patient sends message
- [x] Patient sees notification when admin replies
- [x] Notification count badge displays correctly
- [x] Time displays in correct format (12-hour)
- [x] Time adapts to language (AR/EN)
- [x] Notifications refresh automatically
- [x] Click notification navigates to correct page
- [x] Message timestamps show in chat interface
- [x] Conversation list shows last message time
- [x] Notifications work for multiple messages
- [x] Badge count updates in real-time

## Code Locations

- Admin notifications: `src/components/layout/DashboardLayout.tsx`
- Patient notifications: `src/components/layout/PatientLayout.tsx`
- Translation keys: `src/contexts/LanguageContext.tsx`
- Chat interface: `src/app/admin/chats/page.tsx`
- Message API: `src/app/api/patient-messages/route.ts`
