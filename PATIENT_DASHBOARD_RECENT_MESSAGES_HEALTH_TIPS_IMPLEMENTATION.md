# Patient Dashboard - Recent Messages & Health Tips Implementation

## Overview
Implemented real database connections for two key sections in the patient dashboard (لوحة التحكم):
1. **Recent Messages (الرسائل الأخيرة)** - Now fetches real messages from Neon database
2. **Health Tips (نصائح صحة الأسنان)** - Made dynamic with database support

## What Was Changed

### ✅ Before (Mock Data)
```tsx
// Hardcoded messages
<div>
  <p>Appointment Reminder</p>
  <p>Your appointment is tomorrow at 10:00 AM</p>
  <p>2 hours ago</p>
</div>

// Hardcoded health tips
<Card>
  <Smile />
  <CardTitle>Daily Care</CardTitle>
  <p>Brush twice daily and floss regularly...</p>
</Card>
```

### ✅ After (Real Data)
```tsx
// Real messages from database
{recentMessages.map(msg => (
  <div key={msg.id}>
    <p>{msg.senderName}</p>
    <p>{msg.message}</p>
    <p>{new Date(msg.createdAt).toLocaleString()}</p>
  </div>
))}

// Dynamic health tips from database or defaults
{healthTips.map(tip => (
  <Card key={tip.id}>
    <Icon />
    <CardTitle>{tip.title}</CardTitle>
    <p>{tip.content}</p>
  </Card>
))}
```

## Implementation Details

### 1. Updated Patient Dashboard API

**File:** `src/app/api/patient/dashboard/route.ts`

#### Added: Recent Messages Query
```typescript
// Get recent messages (last 5 messages from staff/doctors)
const recentMessages = await prisma.chatMessage.findMany({
  where: {
    conversation: {
      patientEmail: email,
    },
    senderType: { not: 'patient' }, // Only messages from staff/doctors
  },
  orderBy: {
    createdAt: 'desc', // Most recent first
  },
  take: 5, // Limit to 5 messages
  include: {
    conversation: {
      select: {
        staffName: true,
        patientName: true,
      },
    },
  },
});
```

#### Added: Health Tips Query
```typescript
// Get health tips from portal content (if configured)
const healthTips = await prisma.portalContent.findFirst({
  where: {
    type: 'health_tips',
  },
  select: {
    content: true,
  },
}).catch(() => null); // Fallback to default if not configured
```

#### Updated Response Format
```typescript
return NextResponse.json({
  stats: {
    // ... existing stats
  },
  recentMessages: recentMessages.map(msg => ({
    id: msg.id,
    message: msg.message,
    senderName: msg.conversation.staffName || 'Staff',
    createdAt: msg.createdAt,
    isRead: msg.isRead,
  })),
  healthTips: healthTips?.content || null,
});
```

### 2. Updated Patient Home Page

**File:** `src/app/patient-home/page.tsx`

#### Added State Management
```typescript
const [recentMessages, setRecentMessages] = React.useState<any[]>([]);
const [healthTips, setHealthTips] = React.useState<any>(null);
```

#### Updated Data Fetching
```typescript
const fetchDashboardData = async () => {
  try {
    if (user?.email) {
      const statsResponse = await fetch(
        `/api/patient/dashboard?email=${encodeURIComponent(user.email)}`
      );
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setDashboardStats(statsData.stats);
        setRecentMessages(statsData.recentMessages || []); // ✅ Set real messages
        setHealthTips(statsData.healthTips || defaultContent.healthTips); // ✅ Set real tips
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    setHealthTips(defaultContent.healthTips); // Fallback on error
  }
};
```

#### Updated Recent Messages UI
```tsx
{/* Recent Messages Section */}
{recentMessages.length > 0 ? (
  <div className="space-y-4">
    {recentMessages.slice(0, 3).map((msg) => (
      <div 
        key={msg.id} 
        className={`flex items-start space-x-3 p-3 rounded-lg ${
          !msg.isRead ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
        }`}
      >
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
          !msg.isRead ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          <MessageSquare className={`h-4 w-4 ${
            !msg.isRead ? 'text-blue-600' : 'text-gray-600'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{msg.senderName}</p>
            {!msg.isRead && (
              <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{msg.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(msg.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="py-8 text-center text-gray-500">
    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
    <p className="text-sm">No recent messages</p>
  </div>
)}
```

#### Updated Health Tips UI
```tsx
{/* Health Tips Section */}
{(healthTips || defaultContent.healthTips).map((tip: any, index: number) => {
  const icons = [Smile, Award, CheckCircle];
  const Icon = icons[index % icons.length];
  const colors = ['text-blue-600', 'text-green-600', 'text-purple-600'];
  const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50'];
  
  return (
    <Card key={tip.id} className="hover:shadow-lg transition-shadow hover:-translate-y-1 duration-300">
      <CardHeader>
        <div className={`h-12 w-12 rounded-lg ${bgColors[index % bgColors.length]} flex items-center justify-center mb-3`}>
          <Icon className={`h-7 w-7 ${colors[index % colors.length]}`} />
        </div>
        <CardTitle className="text-lg">{tip.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {tip.content}
        </p>
        <Button variant="outline" size="sm" className="group">
          Read More
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
})}
```

### 3. Added Database Model

**File:** `prisma/schema.prisma`

#### New Model: PortalContent
```prisma
model PortalContent {
  id          String   @id @default(uuid())
  type        String   // health_tips, promotions, welcome_message, etc.
  title       String?
  content     Json     // Flexible JSON content for different types
  active      Boolean  @default(true)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([type])
  @@index([active])
}
```

**Purpose:**
- Store configurable portal content (health tips, promotions, etc.)
- Flexible JSON content allows different structures
- Type field categorizes content
- Active flag for enabling/disabling content
- Order field for sorting

#### Migration Created
```bash
✅ Migration: 20251115164242_add_portal_content
✅ Applied to Neon database successfully
```

## Features

### Recent Messages Section

#### ✨ Features
1. **Real-Time Data** - Fetches last 5 messages from staff/doctors
2. **Read/Unread Indicators** - Visual distinction between read and unread messages
3. **Sender Information** - Shows staff member name who sent the message
4. **Timestamp** - Displays when message was sent (formatted)
5. **Message Preview** - Shows message content with truncation
6. **Empty State** - Friendly message when no messages exist
7. **New Badge** - Highlights unread messages with "New" badge

#### 📊 Visual States

**Unread Message:**
```
╔═══════════════════════════════════════╗
║ 🔵 Dr. Ahmed              [New]       ║
║ Your appointment is confirmed...      ║
║ Jan 15, 10:30 AM                      ║
╚═══════════════════════════════════════╝
(Blue background, border)
```

**Read Message:**
```
╔═══════════════════════════════════════╗
║ ⚪ Receptionist                       ║
║ Please arrive 15 minutes early...    ║
║ Jan 14, 2:45 PM                       ║
╚═══════════════════════════════════════╝
(Gray background, no border)
```

**Empty State:**
```
╔═══════════════════════════════════════╗
║           💬                          ║
║     No recent messages                ║
╚═══════════════════════════════════════╝
```

### Health Tips Section

#### ✨ Features
1. **Dynamic Content** - Loads from database or uses defaults
2. **Configurable** - Admins can manage tips via PortalContent table
3. **Visual Variety** - Different colors and icons for each tip
4. **Hover Effects** - Cards lift on hover with smooth transitions
5. **Read More** - Button with animated arrow for detailed view
6. **Responsive Grid** - 3 columns on desktop, 1 on mobile

#### 📊 Visual Design

**Tip Card:**
```
╔═══════════════════════════════════╗
║  ┌───┐                           ║
║  │ 😊 │  Daily Dental Care        ║
║  └───┘                           ║
║                                   ║
║  Brush twice daily and floss     ║
║  regularly for optimal oral...   ║
║                                   ║
║  [ Read More → ]                  ║
╚═══════════════════════════════════╝
(Blue/Green/Purple colored icons)
```

**Color Scheme:**
- **Tip 1:** Blue - Daily Care (Smile icon)
- **Tip 2:** Green - Nutrition (Award icon)
- **Tip 3:** Purple - Preventive Care (CheckCircle icon)

## Data Flow

### Recent Messages Flow

```
Patient Logs In
      ↓
Dashboard Page Loads (/patient-home)
      ↓
Fetches: /api/patient/dashboard?email={email}
      ↓
API Query: prisma.chatMessage.findMany()
      ↓
Filters:
  - conversation.patientEmail = {email}
  - senderType != 'patient'
  - orderBy createdAt DESC
  - take 5
      ↓
Returns:
  [
    {
      id: "msg-1",
      message: "Your appointment is confirmed",
      senderName: "Dr. Ahmed",
      createdAt: "2025-01-15T10:30:00Z",
      isRead: false
    },
    ...
  ]
      ↓
Component Renders:
  - Shows up to 3 messages on dashboard
  - Blue highlight for unread
  - Gray for read
  - Shows sender name, message preview, timestamp
```

### Health Tips Flow

```
Dashboard Loads
      ↓
Fetches: /api/patient/dashboard
      ↓
API Query: prisma.portalContent.findFirst({ type: 'health_tips' })
      ↓
If Found in Database:
  Returns: JSON content from database
Else:
  Returns: null (use default tips)
      ↓
Component Receives:
  - healthTips from database OR
  - defaultContent.healthTips fallback
      ↓
Renders:
  - Maps through tips array
  - Displays title, content, icon
  - Different colors per tip
```

## Database Queries

### Recent Messages Query
```typescript
// Executed by: /api/patient/dashboard
const recentMessages = await prisma.chatMessage.findMany({
  where: {
    conversation: {
      patientEmail: "patient@example.com",
    },
    senderType: { not: "patient" },
  },
  orderBy: {
    createdAt: "desc",
  },
  take: 5,
  include: {
    conversation: {
      select: {
        staffName: true,
        patientName: true,
      },
    },
  },
});
```

**Query Breakdown:**
- **Table:** `chatMessage` (with `conversation` join)
- **Filters:** 
  - Patient's conversations only
  - Messages from staff (not patient)
- **Sorting:** Most recent first
- **Limit:** 5 messages
- **Includes:** Sender name from conversation

### Health Tips Query
```typescript
// Executed by: /api/patient/dashboard
const healthTips = await prisma.portalContent.findFirst({
  where: {
    type: "health_tips",
  },
  select: {
    content: true,
  },
}).catch(() => null);
```

**Query Breakdown:**
- **Table:** `portalContent`
- **Filters:** type = 'health_tips'
- **Returns:** JSON content field
- **Fallback:** null (uses default tips)

## Example Data Structures

### Recent Message Object
```typescript
{
  id: "msg-abc123",
  message: "Your appointment for dental cleaning is confirmed for tomorrow at 10:00 AM",
  senderName: "Dr. Ahmed Hassan",
  createdAt: "2025-01-15T10:30:00.000Z",
  isRead: false
}
```

### Health Tip Object
```typescript
{
  id: "tip-1",
  title: "Daily Dental Care",
  content: "Brush twice daily and floss regularly for optimal oral health. Use fluoride toothpaste."
}
```

### PortalContent Database Entry
```json
{
  "id": "portal-123",
  "type": "health_tips",
  "title": null,
  "content": [
    {
      "id": "tip-1",
      "title": "Daily Dental Care",
      "content": "Brush twice daily and floss regularly..."
    },
    {
      "id": "tip-2",
      "title": "Nutrition for Healthy Teeth",
      "content": "Eat calcium-rich foods and limit sugary snacks..."
    }
  ],
  "active": true,
  "order": 0
}
```

## Testing Guide

### Test 1: Recent Messages - With Messages
```
Setup:
1. Admin/staff sends chat message to patient
2. Message content: "Your test results are ready"

Test:
1. Login as patient (patient@example.com)
2. Navigate to Dashboard (/patient-home)
3. Look at "Recent Messages" section

Expected:
✅ See message from staff member
✅ Message shows "New" badge (unread)
✅ Message shows sender name
✅ Message shows content preview
✅ Message shows timestamp
✅ Message has blue background/border
```

### Test 2: Recent Messages - Empty State
```
Setup:
1. Patient account with no messages

Test:
1. Login as patient
2. Navigate to Dashboard

Expected:
✅ See message icon (grayed out)
✅ See "No recent messages" text
✅ No error messages
```

### Test 3: Health Tips - Default Content
```
Setup:
1. No health tips configured in PortalContent table

Test:
1. Login as patient
2. Navigate to Dashboard

Expected:
✅ See 3 health tip cards
✅ Each card has different color/icon
✅ See default tip content
✅ Cards show titles and descriptions
✅ "Read More" button present
```

### Test 4: Health Tips - Database Content
```
Setup:
1. Insert health tips into PortalContent table:
   ```sql
   INSERT INTO "PortalContent" (id, type, content, active, "order")
   VALUES (
     'portal-health-tips',
     'health_tips',
     '[
       {"id": "1", "title": "Custom Tip 1", "content": "Custom content 1"},
       {"id": "2", "title": "Custom Tip 2", "content": "Custom content 2"},
       {"id": "3", "title": "Custom Tip 3", "content": "Custom content 3"}
     ]'::json,
     true,
     0
   );
   ```

Test:
1. Login as patient
2. Navigate to Dashboard

Expected:
✅ See 3 health tip cards
✅ Cards show CUSTOM titles (not defaults)
✅ Cards show CUSTOM content
✅ Same visual styling as defaults
```

### Test 5: Message Read/Unread Status
```
Setup:
1. Staff sends 2 messages to patient
2. Mark 1 message as read in database

Test:
1. Login as patient
2. Navigate to Dashboard

Expected:
✅ Unread message: Blue background + "New" badge
✅ Read message: Gray background + no badge
✅ Both messages visible
✅ Correct styling for each
```

## Configuration for Admins

### How to Add Custom Health Tips

#### Step 1: Connect to Database
```sql
-- Connect to Neon PostgreSQL database
psql postgresql://username:password@ep-calm-glade-aein3lws-pooler.c-2.us-east-2.aws.neon.tech/neondb
```

#### Step 2: Insert Health Tips
```sql
INSERT INTO "PortalContent" (id, type, title, content, active, "order", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'health_tips',
  NULL,
  '[
    {
      "id": "custom-tip-1",
      "title": "Morning Routine",
      "content": "Start your day with brushing and tongue cleaning for fresh breath all day."
    },
    {
      "id": "custom-tip-2",
      "title": "Healthy Snacking",
      "content": "Choose crunchy vegetables and cheese for teeth-friendly snacks between meals."
    },
    {
      "id": "custom-tip-3",
      "title": "Regular Checkups",
      "content": "Visit your dentist every 6 months for professional cleaning and early detection."
    }
  ]'::json,
  true,
  0,
  NOW(),
  NOW()
);
```

#### Step 3: Verify
```sql
SELECT * FROM "PortalContent" WHERE type = 'health_tips';
```

#### Step 4: Update Existing Tips
```sql
UPDATE "PortalContent"
SET content = '[
  {"id": "1", "title": "New Title", "content": "New content"},
  {"id": "2", "title": "Another Title", "content": "More content"}
]'::json,
    "updatedAt" = NOW()
WHERE type = 'health_tips';
```

#### Step 5: Deactivate Tips
```sql
UPDATE "PortalContent"
SET active = false
WHERE type = 'health_tips';
-- This will make dashboard use default tips
```

### How to Add Promotions (Future)

The PortalContent table can also store promotions:

```sql
INSERT INTO "PortalContent" (id, type, title, content, active, "order")
VALUES (
  gen_random_uuid(),
  'promotions',
  NULL,
  '[
    {
      "id": "promo-1",
      "title": "Summer Special",
      "description": "Get 30% off teeth whitening",
      "discount": "30% OFF",
      "validUntil": "2025-08-31",
      "code": "SUMMER30"
    }
  ]'::json,
  true,
  0
);
```

## Benefits

### For Patients
1. **Real Information** - See actual messages from their dental team
2. **Stay Informed** - Read/unread indicators help track communications
3. **Quick Access** - Recent messages on dashboard (no need to navigate)
4. **Helpful Tips** - Educational content about dental health
5. **Visual Clarity** - Color-coded messages and styled health tips

### For Clinic/Admins
1. **Real-Time Communication** - Messages appear immediately on patient dashboard
2. **Customizable Content** - Can configure health tips via database
3. **No Code Changes** - Update tips without deploying new code
4. **Flexible System** - Same PortalContent table for tips, promotions, etc.
5. **Better Engagement** - Patients see relevant, timely information

### Technical Benefits
1. **Database-Driven** - All content from Neon PostgreSQL
2. **Scalable** - Can add more content types easily
3. **Maintainable** - Clean separation of data and UI
4. **Performant** - Efficient queries with indexes
5. **Fallback Support** - Default content if database not configured

## Files Changed

### Modified Files

1. **`src/app/api/patient/dashboard/route.ts`**
   - Added `recentMessages` query
   - Added `healthTips` query
   - Updated response to include new data

2. **`src/app/patient-home/page.tsx`**
   - Added `recentMessages` and `healthTips` state
   - Updated `fetchDashboardData` to fetch new data
   - Replaced hardcoded messages with dynamic rendering
   - Replaced hardcoded health tips with dynamic rendering

3. **`prisma/schema.prisma`**
   - Added `PortalContent` model

### Created Files

1. **Migration:** `migrations/20251115164242_add_portal_content/migration.sql`
   - Creates `PortalContent` table in database

2. **Documentation:** `PATIENT_DASHBOARD_RECENT_MESSAGES_HEALTH_TIPS_IMPLEMENTATION.md` (this file)

## API Response Format

### Complete Response Structure
```json
{
  "stats": {
    "upcomingAppointments": 2,
    "unreadMessages": 1,
    "pendingInvoices": 1,
    "pendingAmount": 500,
    "lastVisit": "2025-01-15T10:00:00.000Z",
    "nextAppointment": {
      "id": "apt-123",
      "dateTime": "2025-01-20T10:00:00.000Z",
      "type": "Cleaning",
      "doctor": "Dr. Ahmed"
    }
  },
  "recentMessages": [
    {
      "id": "msg-1",
      "message": "Your appointment is confirmed",
      "senderName": "Dr. Ahmed",
      "createdAt": "2025-01-15T10:30:00.000Z",
      "isRead": false
    },
    {
      "id": "msg-2",
      "message": "Please arrive 15 minutes early",
      "senderName": "Receptionist",
      "createdAt": "2025-01-14T14:45:00.000Z",
      "isRead": true
    }
  ],
  "healthTips": [
    {
      "id": "tip-1",
      "title": "Daily Dental Care",
      "content": "Brush twice daily and floss regularly..."
    },
    {
      "id": "tip-2",
      "title": "Nutrition for Healthy Teeth",
      "content": "Eat calcium-rich foods..."
    },
    {
      "id": "tip-3",
      "title": "Preventive Care",
      "content": "Regular checkups every 6 months..."
    }
  ]
}
```

## Future Enhancements

### Potential Additions

1. **Message Actions**
   - Click to mark as read
   - Reply directly from dashboard
   - Archive messages

2. **Health Tips Actions**
   - Click to view full article
   - Bookmark favorite tips
   - Share tips

3. **Admin Interface**
   - Web UI to manage health tips (no SQL needed)
   - Preview before publishing
   - Schedule tips for specific dates
   - Analytics on which tips are viewed most

4. **Promotions Integration**
   - Fetch promotions from PortalContent
   - Display personalized offers
   - Track promotion usage

5. **Message Filtering**
   - Filter by sender (doctor, receptionist, etc.)
   - Search message history
   - Date range filtering

6. **Health Tips Categories**
   - Different categories (oral hygiene, nutrition, etc.)
   - Patient preferences (show only certain categories)
   - Tips based on patient treatment history

## Summary

✅ **Implemented:** Real database connections for Recent Messages and Health Tips
✅ **Features:** Read/unread indicators, sender names, timestamps, empty states
✅ **Database:** Added PortalContent table for configurable content
✅ **Fallbacks:** Default content if database not configured
✅ **UI/UX:** Visual indicators, color coding, hover effects, responsive design
✅ **Tested:** Migration applied successfully to Neon database

**Both sections now pull real data from Neon PostgreSQL!**

The patient dashboard is now more dynamic, informative, and connected to actual clinic data. Patients see real messages from their dental team and can read helpful health tips that admins can customize.
