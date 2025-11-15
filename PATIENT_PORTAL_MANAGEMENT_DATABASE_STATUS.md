# Patient Portal Management Database Status (إدارة بوابة المريض)

## Summary

**YES** ✅ - The Patient Portal Management (إدارة بوابة المريض) IS connected to the Neon database and reads/writes to real database tables.

## Database Connection

### **Architecture**

The Patient Portal Management uses a flexible document-based storage system built on top of Prisma and Neon PostgreSQL:

```
Patient Portal Admin Page
        ↓
Client: data-client.ts
        ↓
API: /api/collections/[collection]
        ↓
Server: datastore.server.ts
        ↓
Prisma ORM
        ↓
Neon PostgreSQL Database
```

### **Database Table Used**

**Table:** `CollectionDoc`

```prisma
model CollectionDoc {
  collection  String
  id          String
  data        Json        // Stores flexible JSON data
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@id([collection, id])
  @@index([collection])
  @@index([createdAt])
}
```

**Purpose:**
- Stores flexible document-style data
- Similar to MongoDB collections concept
- Allows storing complex data without schema changes
- Each document has a collection name, unique ID, and JSON data

### **How It Works**

1. **Collection-Based Storage**
   - Each "collection" is like a category of data
   - Documents within a collection are stored with their ID
   - Data field stores the actual document as JSON

2. **Collections Used by Patient Portal**
   - `patient-promotions` - Promotions and special offers
   - `patient-portal-content` - Portal configuration and settings
   - `portal-users` - Portal user accounts
   - `messages` - Patient messages
   - `shared-documents` - Documents shared with patients

## What Data is Stored in Neon Database?

### ✅ **Connected to Neon Database**

#### **1. Patient Promotions**
**Collection:** `patient-promotions`
**Data Structure:**
```typescript
{
  id: "promo-123",
  title: "New Patient Special",
  description: "Get 20% off your first visit",
  discount: "20% OFF",
  validUntil: "2025-12-31",
  code: "NEWPATIENT20",
  featured: true,
  active: true
}
```

**Operations:**
- ✅ Read promotions from Neon
- ✅ Create new promotions
- ✅ Update existing promotions (edit, activate/deactivate)
- ✅ Delete promotions

#### **2. Portal Content**
**Collection:** `patient-portal-content`
**Data Structure:**
```typescript
{
  id: "default",
  welcomeMessage: "Welcome to CairoDental",
  clinicInfo: {
    name: "CairoDental",
    description: "Your trusted dental care provider",
    phone: "+1 (555) 123-4567",
    email: "info@cairodental.com",
    address: "123 Dental Street, Cairo"
  },
  healthTips: [
    {
      id: "tip-1",
      title: "Daily Oral Care",
      content: "Brush twice daily...",
      icon: "Smile"
    }
  ],
  updatedAt: "2025-01-15T10:00:00Z",
  updatedBy: "Admin User"
}
```

**Operations:**
- ✅ Read portal configuration
- ✅ Update welcome message
- ✅ Update clinic information
- ✅ Manage health tips
- ✅ Track who updated and when

#### **3. Patient Messages**
**Collection:** `messages`
**Data Structure:**
```typescript
{
  id: "MSG-123",
  patient: "John Doe",
  type: "Email",
  status: "Unread",
  sent: "2025-01-15T10:00:00Z",
  date: "01/15/2025",
  subject: "Appointment Question",
  content: "When is my next appointment?",
  snippet: "When is my next...",
  fullMessage: "Full message text here...",
  category: "billing",
  priority: "normal"
}
```

**Operations:**
- ✅ Read patient messages
- ✅ Reply to messages
- ✅ Mark as read/unread
- ✅ Filter by category and priority

#### **4. Appointment Requests**
**Collection:** `appointments`
**Data Structure:**
```typescript
{
  id: "APT-123",
  patient: "Jane Smith",
  doctor: "Dr. Ahmed",
  dateTime: "2025-01-20T10:00:00Z",
  type: "Checkup",
  status: "Pending",
  duration: "30 minutes"
}
```

**Operations:**
- ✅ Read pending appointment requests
- ✅ Approve requests (change status to Confirmed)
- ✅ Decline requests (change status to Cancelled)

#### **5. Portal Users**
**Collection:** `portal-users`
**Data Structure:**
```typescript
{
  id: "USER-123",
  name: "John Doe",
  email: "john@example.com",
  status: "Active",
  lastLogin: "2025-01-15"
}
```

**Operations:**
- ✅ Read portal users
- ✅ Activate/Deactivate users
- ✅ Reset passwords (sends notification)

#### **6. Shared Documents**
**Collection:** `shared-documents`
**Data Structure:**
```typescript
{
  id: "DOC-123",
  name: "Treatment Plan 2025",
  patient: "John Doe",
  type: "Treatment Plan",
  sharedDate: "2025-01-15"
}
```

**Operations:**
- ✅ Read shared documents
- ✅ View document details
- ✅ Revoke access (delete document)

## Data Flow Examples

### **Example 1: Creating a Promotion**

```
Admin User Action:
1. Opens Patient Portal Management
2. Clicks "Add Promotion"
3. Fills in:
   - Title: "Summer Special"
   - Discount: "30% OFF"
   - Code: "SUMMER30"
   - Valid Until: 2025-08-31
4. Clicks "Save"

Data Flow:
Admin Page (AdminContent.tsx)
    ↓
savePromotion() function
    ↓
data-client.ts: setDocument('patient-promotions', id, data)
    ↓
API: PUT /api/collections/patient-promotions/{id}
    ↓
datastore.server.ts: setDocument()
    ↓
Prisma: prisma.collectionDoc.upsert()
    ↓
Neon Database: INSERT INTO "CollectionDoc"
    VALUES ('patient-promotions', 'promo-123', { JSON data })

Result in Database:
╔═══════════════════════════════════════════════════╗
║ CollectionDoc Table                               ║
╠═══════════════════════════════════════════════════╣
║ collection         | patient-promotions           ║
║ id                 | promo-123                    ║
║ data               | { title: "Summer Special",   ║
║                    |   discount: "30% OFF", ... } ║
║ createdAt          | 2025-01-15 10:00:00          ║
║ updatedAt          | 2025-01-15 10:00:00          ║
╚═══════════════════════════════════════════════════╝
```

### **Example 2: Approving Appointment Request**

```
Admin User Action:
1. Opens "Pending Requests" tab
2. Sees appointment request from patient
3. Clicks "Approve"

Data Flow:
Patient Portal Page (page.tsx)
    ↓
handleRequestStatusChange(appointmentId, 'Confirmed')
    ↓
data-client.ts: updateDocument('appointments', id, { status: 'Confirmed' })
    ↓
API: PATCH /api/collections/appointments/{id}
    ↓
datastore.server.ts: updateDocument()
    ↓
Prisma: prisma.collectionDoc.update()
    ↓
Neon Database: UPDATE "CollectionDoc"
    SET data = jsonb_set(data, '{status}', '"Confirmed"')
    WHERE collection = 'appointments' AND id = 'APT-123'

Result:
✅ Appointment status changed from "Pending" to "Confirmed" in Neon
✅ Patient can see confirmed appointment in their portal
```

### **Example 3: Updating Portal Content**

```
Admin User Action:
1. Opens "Content Admin" tab
2. Updates welcome message
3. Updates clinic phone number
4. Clicks "Save Content"

Data Flow:
AdminContent.tsx
    ↓
savePortalContent(updatedContent)
    ↓
data-client.ts: setDocument('patient-portal-content', 'default', data)
    ↓
API: PUT /api/collections/patient-portal-content/default
    ↓
datastore.server.ts: setDocument()
    ↓
Prisma: prisma.collectionDoc.upsert()
    ↓
Neon Database: UPSERT "CollectionDoc"
    WHERE collection = 'patient-portal-content' AND id = 'default'

Result:
✅ Portal content updated in Neon
✅ All patients see updated welcome message and clinic info
✅ Tracks who made the change and when
```

## Database Queries

### **Read All Promotions**
```typescript
// Client code:
const promotions = await listDocuments('patient-promotions');

// Server-side query:
SELECT * FROM "CollectionDoc"
WHERE collection = 'patient-promotions'
ORDER BY "createdAt" DESC;
```

### **Create/Update Promotion**
```typescript
// Client code:
await setDocument('patient-promotions', 'promo-123', promotionData);

// Server-side query:
INSERT INTO "CollectionDoc" (collection, id, data, "createdAt", "updatedAt")
VALUES ('patient-promotions', 'promo-123', '{ JSON }', NOW(), NOW())
ON CONFLICT (collection, id)
DO UPDATE SET data = EXCLUDED.data, "updatedAt" = NOW();
```

### **Delete Promotion**
```typescript
// Client code:
await deleteDocument('patient-promotions', 'promo-123');

// Server-side query:
DELETE FROM "CollectionDoc"
WHERE collection = 'patient-promotions' AND id = 'promo-123';
```

## Features

### **✅ Fully Connected to Neon**

| Feature | Read | Write | Update | Delete |
|---------|------|-------|--------|--------|
| Promotions | ✅ | ✅ | ✅ | ✅ |
| Portal Content | ✅ | ✅ | ✅ | ❌ |
| Messages | ✅ | ✅ | ✅ | ❌ |
| Appointment Requests | ✅ | ❌ | ✅ | ❌ |
| Portal Users | ✅ | ❌ | ✅ | ❌ |
| Shared Documents | ✅ | ✅ | ❌ | ✅ |

### **Benefits of This Architecture**

1. **Flexibility**
   - No schema changes needed for new features
   - Can store complex nested data
   - Easy to add new collections

2. **Performance**
   - Indexed by collection name
   - Fast lookups by ID
   - Efficient JSON queries

3. **Simplicity**
   - One table for multiple features
   - Easy to understand
   - Simple API

4. **Scalability**
   - Can handle thousands of documents
   - PostgreSQL JSON performance
   - Neon auto-scaling

## Testing

### **Test 1: Create Promotion**
```
1. Login as admin
2. Navigate to Patient Portal Management
3. Click "Content Admin" tab
4. Click "Add Promotion"
5. Fill in promotion details
6. Click "Save Promotion"

Expected:
✅ Promotion appears in the list
✅ Data saved to Neon database
✅ Query database:
   SELECT * FROM "CollectionDoc"
   WHERE collection = 'patient-promotions'
✅ See the new promotion in results
```

### **Test 2: Update Portal Content**
```
1. Login as admin
2. Navigate to Patient Portal Management
3. Click "Content Admin" tab
4. Update clinic phone number
5. Click "Save Content"

Expected:
✅ Success toast message
✅ Phone number updated
✅ Query database:
   SELECT data->'clinicInfo'->>'phone' as phone
   FROM "CollectionDoc"
   WHERE collection = 'patient-portal-content' AND id = 'default'
✅ See updated phone number
```

### **Test 3: Approve Appointment**
```
1. Patient creates appointment request
2. Admin opens Patient Portal Management
3. Clicks "Pending Requests" tab
4. Clicks "Approve" on request

Expected:
✅ Request status changes to "Confirmed"
✅ Database updated
✅ Patient sees confirmed appointment
```

## Comparison with Other Features

### **Patient Portal Management vs Other Admin Features**

| Feature | Storage | Connection |
|---------|---------|------------|
| Patients | Dedicated `patients` table | ✅ Direct Prisma |
| Appointments | Dedicated `appointments` table | ✅ Direct Prisma |
| Billing | Dedicated `invoice` table | ✅ Direct Prisma |
| **Patient Portal** | **`CollectionDoc` table (JSON)** | **✅ Prisma + Neon** |
| Dental Chart | Dedicated `dentalChart` table | ✅ Direct Prisma |

**Why CollectionDoc?**
- Patient Portal needs flexible data structures
- Promotions, messages, and content vary greatly
- Easier to iterate on features
- No migrations needed for small changes

## Database Schema

### **CollectionDoc Table Structure**

```sql
CREATE TABLE "CollectionDoc" (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    data JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "CollectionDoc_pkey" PRIMARY KEY (collection, id)
);

CREATE INDEX "CollectionDoc_collection_idx" ON "CollectionDoc"(collection);
CREATE INDEX "CollectionDoc_createdAt_idx" ON "CollectionDoc"("createdAt");
```

**Indexes:**
- Primary key on (collection, id) - Fast lookups
- Index on collection - Fast filtering by collection type
- Index on createdAt - Efficient ordering

## Code References

### **Key Files**

1. **`src/app/patient-portal/page.tsx`**
   - Main Patient Portal Management page
   - Tabs for Messages, Requests, Users, Documents, Settings
   - Uses `listDocuments`, `setDocument`, `updateDocument`, `deleteDocument`

2. **`src/components/patient-portal/AdminContent.tsx`**
   - Content Management tab
   - Promotions management
   - Portal content settings

3. **`src/lib/data-client.ts`**
   - Client-side API wrapper
   - Functions for CRUD operations
   - Calls `/api/collections/` endpoints

4. **`src/app/api/collections/[collection]/route.ts`**
   - GET /api/collections/[collection] - List documents
   - POST /api/collections/[collection] - Create document

5. **`src/app/api/collections/[collection]/[id]/route.ts`**
   - GET - Read document
   - PUT - Create/update document
   - PATCH - Partial update
   - DELETE - Delete document

6. **`src/services/datastore.server.ts`**
   - Server-side data access layer
   - Uses Prisma to interact with `CollectionDoc` table
   - Document-style API built on PostgreSQL

7. **`prisma/schema.prisma`**
   - `CollectionDoc` model definition
   - Indexes and constraints

## Migration History

The `CollectionDoc` table was created to provide flexible document storage for features that don't fit well into traditional relational tables. This allows:
- Rapid prototyping of features
- Complex nested data structures
- Backward compatibility with Firebase-style code

## Summary

✅ **YES** - Patient Portal Management (إدارة بوابة المريض) IS connected to Neon database
✅ **Storage:** Uses `CollectionDoc` table in PostgreSQL
✅ **Read Operations:** Fetches promotions, content, messages, etc. from Neon
✅ **Write Operations:** Creates/updates promotions, content, messages in Neon
✅ **Update Operations:** Modifies appointment status, user status, content
✅ **Delete Operations:** Removes promotions, shared documents

**Architecture:** Client → API → Prisma → Neon PostgreSQL → `CollectionDoc` table

The Patient Portal Management is fully integrated with the Neon database using a flexible document-based storage model built on top of PostgreSQL!
