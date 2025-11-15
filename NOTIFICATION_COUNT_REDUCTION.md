# Notification Count Reduction Feature

## Overview
Implemented a smart notification system that reduces the notification bell count when users click on individual notifications. Works for both admin and patient users.

## Problem Solved
Previously, the notification bell showed a count of all notifications, but clicking on a notification didn't reduce the count. This caused confusion as users couldn't tell which notifications they had already seen.

## Solution Implemented

### 1. Created Custom Hook: `useNotifications`
**File:** `src/hooks/use-notifications.ts`

**Features:**
- Tracks which notifications have been viewed/read
- Stores read notification IDs in localStorage (persists across sessions)
- Provides functions to mark notifications as read
- Filters notifications to show only unread ones
- User-specific storage (each user has their own read notification list)

**Key Functions:**
```typescript
const {
  markAsRead,              // Mark single notification as read
  markMultipleAsRead,      // Mark multiple notifications as read
  isRead,                  // Check if notification is read
  filterUnread,            // Filter array to show only unread
  clearReadNotifications,  // Clear all (for testing/reset)
} = useNotifications(userId);
```

### 2. Updated Admin Notifications
**File:** `src/components/layout/DashboardLayout.tsx`

**Changes:**
- Integrated `useNotifications` hook
- Filters out read notifications from all categories:
  - Pending appointments
  - Low stock items
  - Patient messages
  - Chat messages
- Added `onClick` handler to mark notification as read when clicked
- Count now shows only unread notifications

**Before:**
```typescript
const notificationCount = 
  pendingAppointments.length + 
  lowStockItems.length + 
  unreadPatientMessages.length + 
  unreadChatMessages.length;
```

**After:**
```typescript
const unreadPendingAppointments = filterUnread(pendingAppointments);
const unreadLowStockItems = filterUnread(lowStockItems);
const unreadMessages = filterUnread(unreadPatientMessages);
const unreadChats = filterUnread(unreadChatMessages);

const notificationCount = 
  unreadPendingAppointments.length + 
  unreadLowStockItems.length + 
  unreadMessages.length + 
  unreadChats.length;
```

### 3. Updated Patient Notifications
**File:** `src/components/layout/PatientLayout.tsx`

**Changes:**
- Integrated `useNotifications` hook
- Filters out read notifications from:
  - Staff replies to messages
  - Chat messages
- Added `onClick` handler to mark notification as read
- Count now shows only unread notifications

## How It Works

### Step-by-Step Flow

#### 1. Initial State
```
User logs in
Notification bell shows: 4
Notifications:
  ✉️ Pending appointment (ID: apt-1)
  ✉️ Low stock alert (ID: inv-1)
  ✉️ New message (ID: msg-1)
  ✉️ Chat reply (ID: chat-1)
```

#### 2. User Clicks First Notification
```
User clicks on "Pending appointment"
→ handleNotificationClick('apt-1') is called
→ markAsRead('apt-1') adds ID to read set
→ localStorage updated: ["apt-1"]
→ filterUnread removes apt-1 from list
→ Notification bell updates to: 3 ✅
```

#### 3. User Clicks Second Notification
```
User clicks on "Low stock alert"
→ handleNotificationClick('inv-1') is called
→ markAsRead('inv-1') adds ID to read set
→ localStorage updated: ["apt-1", "inv-1"]
→ filterUnread removes both read notifications
→ Notification bell updates to: 2 ✅
```

#### 4. After Clicking All Notifications
```
localStorage: ["apt-1", "inv-1", "msg-1", "chat-1"]
Notification bell shows: 0 ✅
```

#### 5. Persistence Across Sessions
```
User logs out and logs back in
→ useNotifications loads from localStorage
→ Marks apt-1, inv-1, msg-1, chat-1 as read
→ Notification bell still shows: 0 ✅
→ New notifications will appear normally
```

## Data Storage

### LocalStorage Structure
```typescript
// Key format: readNotifications_{userId}
// Value: JSON array of notification IDs

Example:
Key: "readNotifications_user-123"
Value: ["apt-001", "inv-045", "msg-789", "chat-123"]
```

### Benefits of LocalStorage
- ✅ Persists across page refreshes
- ✅ Persists across browser sessions
- ✅ User-specific (each user has their own read list)
- ✅ No server calls needed
- ✅ Fast and efficient
- ✅ Automatic cleanup when user logs out (different user ID)

## User Experience

### Admin User Experience

**Scenario 1: Pending Appointment**
```
1. Bell shows: 4
2. Admin clicks "New appointment from John"
3. Redirected to /appointments page
4. Bell now shows: 3 ✅
5. Notification no longer appears in dropdown
```

**Scenario 2: Low Stock Alert**
```
1. Bell shows: 3
2. Admin clicks "Low stock: Dental masks"
3. Redirected to /inventory page
4. Bell now shows: 2 ✅
5. Can restock item
```

**Scenario 3: Patient Message**
```
1. Bell shows: 2
2. Admin clicks "New message from patient"
3. Redirected to /admin/chats page
4. Bell now shows: 1 ✅
5. Can reply to patient
```

### Patient User Experience

**Scenario 1: Staff Reply**
```
1. Bell shows: 2
2. Patient clicks "Reply from support team"
3. Redirected to /patient-messages page
4. Bell now shows: 1 ✅
5. Can read the reply
```

**Scenario 2: Chat Message**
```
1. Bell shows: 1
2. Patient clicks "Message from Dr. Smith"
3. Redirected to /patient-messages page
4. Bell now shows: 0 ✅
5. Notification dropdown now empty
```

## Visual Feedback

### Bell Icon States

**No Notifications:**
```
🔔 (just bell icon, no badge)
```

**Has Unread Notifications:**
```
🔔 [4] (bell with red pulsing badge)
```

**After Clicking One:**
```
🔔 [3] (bell with red pulsing badge)
```

**All Read:**
```
🔔 (bell, no badge)
```

## Implementation Details

### Notification Click Handler
```typescript
const handleNotificationClick = (notificationId: string) => {
  markAsRead(notificationId);
};

// Used in JSX:
<Link 
  href="/appointments"
  onClick={() => handleNotificationClick(appt.id)}
>
  {/* Notification content */}
</Link>
```

### Filtering Unread Notifications
```typescript
// Original array with all notifications
const pendingAppointments = [
  { id: 'apt-1', patient: 'John', ... },
  { id: 'apt-2', patient: 'Jane', ... },
  { id: 'apt-3', patient: 'Bob', ... },
];

// Filter out read notifications
const unreadPendingAppointments = filterUnread(
  pendingAppointments.map(a => ({ ...a, type: 'appointment' }))
);

// Result: Only unread appointments
// If apt-1 was clicked before: [apt-2, apt-3]
```

### Memoization for Performance
```typescript
const unreadPendingAppointments = React.useMemo(
  () => filterUnread(pendingAppointments.map(a => ({ ...a, type: 'appointment' }))),
  [pendingAppointments, filterUnread]
);
// Only recalculates when dependencies change
```

## Edge Cases Handled

### 1. Same Notification Appearing Multiple Times
```typescript
// If notification is refreshed from server but already read:
const isRead = readNotifications.has(notificationId);
// ✅ Still filtered out
```

### 2. Different Users on Same Browser
```typescript
// User A logs in
localStorage key: "readNotifications_userA"

// User A logs out, User B logs in
localStorage key: "readNotifications_userB"
// ✅ Separate storage per user
```

### 3. Notification Deleted from Server
```typescript
// Notification no longer exists on server
// Old ID still in readNotifications
// ✅ No problem - ID just won't match any new notifications
```

### 4. User Clears Browser Data
```typescript
// localStorage cleared
// ✅ All notifications appear as unread again (expected behavior)
```

## Testing

### Test Case 1: Basic Functionality
```
✅ Login as admin
✅ See 4 notifications in bell
✅ Click on one notification
✅ Bell count reduces to 3
✅ Clicked notification no longer appears in dropdown
```

### Test Case 2: Persistence
```
✅ Login as admin
✅ Click 2 notifications (bell shows 2)
✅ Refresh the page
✅ Bell still shows 2 (not 4)
✅ Previously clicked notifications still don't appear
```

### Test Case 3: New Notifications
```
✅ Login as admin
✅ Click all 4 notifications (bell shows 0)
✅ New appointment created
✅ Bell shows 1 (new notification)
✅ Old notifications still don't appear
```

### Test Case 4: Patient Side
```
✅ Login as patient
✅ See 2 staff replies
✅ Click on one
✅ Bell reduces from 2 to 1
✅ Clicked reply no longer appears
```

### Test Case 5: Multiple Users
```
✅ Login as User A, click 2 notifications
✅ Logout
✅ Login as User B
✅ User B sees all their notifications (not affected by User A's reads)
```

## Benefits

### For Users
1. **Clear Status**: Know which notifications are new
2. **No Repetition**: Don't see the same notification twice
3. **Better Organization**: Focus on what's unread
4. **Persistence**: Reads remembered across sessions
5. **Intuitive**: Works like email/messaging apps

### For System
1. **No Server Load**: Tracking done client-side
2. **Fast Performance**: No API calls for read/unread
3. **Scalable**: Works with any number of notifications
4. **Simple**: Easy to understand and maintain
5. **Flexible**: Easy to add new notification types

## Future Enhancements

### Possible Improvements
1. **Mark All as Read Button**
   ```typescript
   <Button onClick={() => markMultipleAsRead(allNotificationIds)}>
     Mark all as read
   </Button>
   ```

2. **Unread Indicator in List**
   ```tsx
   {!isRead(notification.id) && (
     <span className="w-2 h-2 bg-blue-500 rounded-full" />
   )}
   ```

3. **Auto-mark as Read on Page Visit**
   ```typescript
   // When user visits /appointments page
   useEffect(() => {
     markMultipleAsRead(appointmentIds);
   }, [pathname]);
   ```

4. **Server-Side Sync** (optional)
   - Store read status in database
   - Sync across devices
   - More reliable but requires server calls

5. **Expiration of Read Notifications**
   - Clear read notifications older than 30 days
   - Prevent localStorage from growing too large

6. **Notification History Page**
   - Show all notifications (read and unread)
   - Allow unread/reopen notifications
   - Search and filter

## Files Modified

### Created Files
1. `src/hooks/use-notifications.ts` - Custom notification tracking hook

### Modified Files
1. `src/components/layout/DashboardLayout.tsx`
   - Added useNotifications hook
   - Added filter for unread notifications
   - Added onClick handlers

2. `src/components/layout/PatientLayout.tsx`
   - Added useNotifications hook
   - Added filter for unread notifications
   - Added onClick handlers

## Summary

✅ **Implemented**: Smart notification count reduction
✅ **Works For**: Both admin and patient users
✅ **Persists**: Across page refreshes and browser sessions
✅ **User-Specific**: Each user has their own read notification list
✅ **Performance**: Client-side tracking, no server calls
✅ **Intuitive**: Works like familiar apps (email, messaging)

The notification system now provides clear feedback to users, showing exactly which notifications are new and reducing the count as notifications are clicked!
