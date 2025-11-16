# Notification System Documentation

## Overview

The Cairo Dental clinic now has a complete **database-backed notification system** that:
- ✅ Stores all notifications in **Neon PostgreSQL database**
- ✅ Syncs notification read status **across all devices**
- ✅ Persists notification history permanently
- ✅ Supports multiple notification types with priorities
- ✅ Provides real-time updates via API polling

---

## Database Schema

### Notification Model

```prisma
model Notification {
  id              String              @id @default(uuid())
  userId          String              // User who receives the notification
  type            NotificationType    // Type of notification
  title           String              // Notification title (Arabic/English)
  message         String              // Notification message content
  relatedId       String?             // ID of related entity (appointment, inventory, etc.)
  relatedType     String?             // Type: "appointment", "inventory", "chat", etc.
  link            String?             // Navigation link when clicked
  isRead          Boolean             @default(false)
  readAt          DateTime?           // When notification was read
  priority        NotificationPriority @default(NORMAL)
  metadata        Json?               // Additional data (JSON)
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  user            User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, isRead])
  @@index([createdAt])
  @@index([type])
}
```

### Enums

```prisma
enum NotificationType {
  APPOINTMENT_PENDING
  APPOINTMENT_CONFIRMED
  APPOINTMENT_CANCELLED
  INVENTORY_LOW_STOCK
  INVENTORY_OUT_OF_STOCK
  MESSAGE_RECEIVED
  CHAT_MESSAGE
  SYSTEM
  REMINDER
}

enum NotificationPriority {
  LOW       // Green badge
  NORMAL    // No special styling
  HIGH      // Orange badge
  URGENT    // Red badge with pulse animation
}
```

---

## API Endpoints

### 1. Get Notifications
```
GET /api/notifications
Authorization: Bearer <token>
Query Params:
  - unreadOnly=true/false (default: false)
  - limit=50 (default: 50)
  - offset=0 (default: 0)

Response:
{
  "notifications": [...],
  "totalCount": 125,
  "unreadCount": 8,
  "hasMore": true
}
```

### 2. Create Notification
```
POST /api/notifications
Authorization: Bearer <token>
Body:
{
  "userId": "user-uuid",
  "type": "APPOINTMENT_PENDING",
  "title": "موعد جديد",
  "message": "موعد من أحمد محمد",
  "relatedId": "appointment-id",
  "relatedType": "appointment",
  "link": "/appointments?id=123",
  "priority": "HIGH",
  "metadata": { "patientName": "أحمد محمد" }
}
```

### 3. Mark as Read
```
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

### 4. Mark All as Read
```
POST /api/notifications/mark-all-read
Authorization: Bearer <token>
```

### 5. Delete Notification
```
DELETE /api/notifications/:id/read
Authorization: Bearer <token>
```

### 6. Delete Old Read Notifications
```
DELETE /api/notifications
Authorization: Bearer <token>
```
Deletes notifications older than 30 days that are marked as read.

---

## Frontend Hook: useNotifications

### Usage

```typescript
import { useNotifications } from '@/hooks/use-notifications';

function MyComponent() {
  const {
    notifications,        // All notifications
    unreadNotifications,  // Only unread
    unreadCount,          // Count of unread
    loading,              // Loading state
    error,                // Error message
    markAsRead,           // Mark single as read
    markMultipleAsRead,   // Mark multiple as read
    markAllAsRead,        // Mark all as read
    deleteNotification,   // Delete single notification
    refetch,              // Manually refresh notifications
  } = useNotifications(user?.id);

  return (
    <div>
      {notifications.map(notification => (
        <div key={notification.id} onClick={() => markAsRead(notification.id)}>
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
        </div>
      ))}
    </div>
  );
}
```

### Auto-refresh
The hook automatically fetches notifications on mount and when userId changes. For auto-polling:

```typescript
React.useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 30000); // Refresh every 30 seconds
  
  return () => clearInterval(interval);
}, [refetch]);
```

---

## NotificationService

Helper service for creating notifications:

```typescript
import { NotificationService } from '@/services/notification-service';

// Pending Appointment
await NotificationService.notifyPendingAppointment(
  userId,
  appointmentId,
  'أحمد محمد',
  'فحص دوري'
);

// Low Stock
await NotificationService.notifyLowStock(
  userId,
  itemId,
  'قفازات طبية',
  15
);

// Patient Message
await NotificationService.notifyPatientMessage(
  userId,
  messageId,
  'سارة أحمد',
  'sara@example.com',
  'استفسار عن الأسعار'
);

// Chat Message
await NotificationService.notifyChatMessage(
  userId,
  conversationId,
  'محمد علي',
  'متى يمكنني الحضور؟'
);

// Notify All Admins
const adminIds = await getAdminUserIds();
await NotificationService.notifyAllAdmins(
  adminIds,
  'SYSTEM',
  'تحديث النظام',
  'تم تثبيت تحديثات جديدة',
  {
    priority: 'HIGH',
    link: '/settings',
  }
);
```

---

## Integration Points

### Where to Create Notifications

1. **Appointments** (`/api/appointments`)
   - When new appointment created → `APPOINTMENT_PENDING`
   - When appointment confirmed → `APPOINTMENT_CONFIRMED`
   - When appointment cancelled → `APPOINTMENT_CANCELLED`

2. **Inventory** (`/api/inventory`)
   - When stock falls below threshold → `INVENTORY_LOW_STOCK`
   - When stock reaches zero → `INVENTORY_OUT_OF_STOCK`

3. **Chats** (`/api/chat/messages`)
   - When patient sends message → `CHAT_MESSAGE`

4. **Patient Messages** (`/api/patient-messages`)
   - When patient submits contact form → `MESSAGE_RECEIVED`

### Example Integration

```typescript
// In /api/appointments/route.ts
import { NotificationService } from '@/services/notification-service';

export async function POST(request: Request) {
  // ... create appointment logic ...
  
  if (appointment.status === 'Pending') {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: { role: 'admin', isActive: true },
    });
    
    // Notify all admins
    for (const admin of admins) {
      await NotificationService.notifyPendingAppointment(
        admin.id,
        appointment.id,
        appointment.patientName,
        appointment.type
      );
    }
  }
  
  return NextResponse.json(appointment);
}
```

---

## UI Components

### DashboardLayout Bell Icon

The bell icon in the top bar automatically:
- Shows unread count badge
- Displays all unread notifications grouped by type
- Marks notifications as read on click
- Navigates to related page via notification.link
- Refreshes every 30 seconds

### Notification Display

Notifications are grouped by type:
- **Appointments** 🕒 (Clock icon, orange)
- **Chats** 💬 (MessageSquare icon, purple)
- **Messages** 🔔 (Bell icon, blue)
- **Inventory** 📦 (Package icon, red)
- **Other** 🔔 (Bell icon, default)

---

## Testing

### 1. Seed Test Notifications

```bash
node seed-notifications.js
```

This creates 5 sample notifications for the first admin user.

### 2. Manual Testing

1. Login as admin user
2. Check bell icon shows notification count
3. Click bell to see notifications
4. Click notification - should mark as read and navigate
5. Refresh page - notification should stay read
6. Login on different device/browser - should sync read status

### 3. API Testing

```bash
# Get token from localStorage after login
$token = "your-jwt-token"

# Get notifications
curl http://localhost:3000/api/notifications `
  -H "Authorization: Bearer $token"

# Mark as read
curl -X PATCH http://localhost:3000/api/notifications/notification-id/read `
  -H "Authorization: Bearer $token"
```

---

## Migration

### Applied Migration

File: `prisma/migrations/20251116103810_add_notification_system/migration.sql`

Creates:
- `NotificationType` enum
- `NotificationPriority` enum  
- `Notification` table with indexes
- Foreign key to User table with CASCADE delete

### Database Indexes

Optimized for common queries:
- `userId` - Get user's notifications
- `userId, isRead` - Get unread notifications
- `createdAt` - Sort by date
- `type` - Filter by type

---

## Benefits

### Before (localStorage)
- ❌ Read status stored only in browser
- ❌ Cleared when cache cleared
- ❌ Not synced across devices
- ❌ No notification history
- ❌ No server-side filtering

### After (Neon Database)
- ✅ Read status persists forever
- ✅ Syncs across all devices
- ✅ Complete notification history
- ✅ Server-side filtering and pagination
- ✅ Can query notification analytics
- ✅ Can send push notifications later
- ✅ Can implement notification preferences

---

## Future Enhancements

1. **Push Notifications**
   - Web Push API for browser notifications
   - Email notifications for urgent items

2. **Notification Preferences**
   - User can enable/disable notification types
   - Set priority thresholds

3. **Notification Center Page**
   - Dedicated page to view all notifications
   - Filter by type, date, priority
   - Bulk actions (delete, mark all read)

4. **Real-time Updates**
   - WebSocket connection for instant delivery
   - No need for polling every 30 seconds

5. **Analytics**
   - Track notification click rates
   - Measure response times
   - Optimize notification content

---

## Troubleshooting

### Notifications Not Appearing

1. Check user is logged in: `user?.id` exists
2. Check database connection: `npx prisma studio`
3. Check API endpoint: Browser DevTools → Network tab
4. Check authorization token in localStorage

### Read Status Not Syncing

1. Verify API call succeeds: Check Network tab
2. Check Prisma schema has `onDelete: Cascade`
3. Verify `refetch()` is called after marking as read

### Migration Issues

If Prisma client generation fails (Windows file lock):
1. Stop dev server
2. Run `npx prisma generate`
3. Restart dev server

---

## Summary

The notification system is now fully integrated with Neon database and provides:
- Persistent storage ✅
- Cross-device sync ✅
- Notification history ✅
- Type-based grouping ✅
- Priority levels ✅
- One-click navigation ✅

All notifications are automatically saved to the database and synced across all devices!
