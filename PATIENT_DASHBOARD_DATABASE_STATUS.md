# Patient Dashboard (لوحة التحكم) Database Connection Status

## Summary

**YES** - The patient dashboard is connected to Neon database and reads real data for most features. However, some features still use default/mock data.

## What's Connected to Neon Database ✅

### 1. **Dashboard Statistics** ✅
**API:** `/api/patient/dashboard?email={email}`
**Database:** Neon PostgreSQL via Prisma

**Real Data Displayed:**
- ✅ **Upcoming Appointments Count** - `prisma.appointment.count()`
- ✅ **Next Appointment Details** - `prisma.appointment.findFirst()`
  - Appointment type
  - Doctor name
  - Date and time
- ✅ **Last Visit Date** - `prisma.appointment.findFirst()` (past dates)
- ✅ **Unread Messages Count** - `prisma.chatMessage.count()`
- ✅ **Outstanding Balance** - `prisma.invoice` (sum of pending amounts)
- ✅ **Pending Invoices Count** - `prisma.invoice.count()`

### 2. **Appointments Section** ✅
- Shows next appointment from Neon database
- Shows total count of upcoming appointments
- Links to full appointments page (also from Neon)

### 3. **Health Stats Section** ✅
- Last visit from real appointments data
- Upcoming count from real data
- Balance from real invoices data
- Unread messages from real chat data

## What's Using Mock/Default Data ❌

### 1. **Promotions** ❌
**Currently:** Hardcoded default promotions
```typescript
const defaultPromotions = [
  {
    title: "New Patient Special",
    discount: "20% OFF",
    ...
  },
  {
    title: "Family Dental Plan",
    discount: "15% OFF",
    ...
  }
];
```

**Status:** Mock data, not from database
**Note:** Code has TODO comment: "Create admin endpoints to manage these"

### 2. **Portal Content** ❌
**Currently:** Hardcoded default content
```typescript
const defaultContent = {
  welcomeMessage: 'Welcome to your dental care portal',
  clinicInfo: { ... },
  healthTips: [ ... ],
};
```

**Status:** Mock data, not from database

### 3. **Testimonials** ❌
**Currently:** Hardcoded array in component
```typescript
const testimonials = [
  { name: "Sarah Johnson", rating: 5, ... },
  { name: "Michael Chen", rating: 5, ... },
  { name: "Emma Rodriguez", rating: 5, ... },
];
```

**Status:** Mock data, not from database

### 4. **Services** ❌
**Currently:** Hardcoded array in component
```typescript
const services = [
  { title: "General Dentistry", ... },
  { title: "Cosmetic Dentistry", ... },
  { title: "Orthodontics", ... },
];
```

**Status:** Mock data, not from database

## API Endpoint Details

### Patient Dashboard API
**File:** `src/app/api/patient/dashboard/route.ts`

**Database Queries:**
```typescript
// 1. Get patient by email
const patient = await prisma.patient.findUnique({
  where: { email },
});

// 2. Count upcoming appointments
const upcomingAppointments = await prisma.appointment.count({
  where: {
    patientEmail: email,
    dateTime: { gte: new Date() },
    status: { in: ['Pending', 'Confirmed'] },
  },
});

// 3. Count unread messages
const unreadMessages = await prisma.chatMessage.count({
  where: {
    conversation: { patientEmail: email },
    senderType: { not: 'patient' },
    isRead: false,
  },
});

// 4. Count pending invoices
const pendingInvoices = await prisma.invoice.count({
  where: {
    patientId: patient.id,
    status: { in: ['Draft', 'Sent', 'Overdue'] },
  },
});

// 5. Calculate pending amount
const pendingInvoicesData = await prisma.invoice.findMany({
  where: {
    patientId: patient.id,
    status: { in: ['Draft', 'Sent', 'Overdue'] },
  },
  select: { amount: true },
});

// 6. Get last appointment
const lastAppointment = await prisma.appointment.findFirst({
  where: {
    patientEmail: email,
    dateTime: { lt: new Date() },
  },
  orderBy: { dateTime: 'desc' },
});

// 7. Get next appointment
const nextAppointment = await prisma.appointment.findFirst({
  where: {
    patientEmail: email,
    dateTime: { gte: new Date() },
    status: { in: ['Pending', 'Confirmed'] },
  },
  orderBy: { dateTime: 'asc' },
});
```

## Data Flow Diagram

```
Patient Logs In (email: patient@example.com)
         ↓
Opens Dashboard (/patient-home)
         ↓
Fetches: /api/patient/dashboard?email=patient@example.com
         ↓
┌────────────────────────────────────────┐
│      Neon PostgreSQL Database          │
├────────────────────────────────────────┤
│ ✅ patients table                      │
│ ✅ appointments table                  │
│ ✅ chatMessage table                   │
│ ✅ invoice table                       │
└───────────────┬────────────────────────┘
                ↓
Returns Real Data:
- upcomingAppointments: 2
- nextAppointment: { date, doctor, type }
- lastVisit: 2025-01-15
- unreadMessages: 1
- pendingAmount: 500 EGP
                ↓
Dashboard Displays Real Data ✅
```

## Patient Dashboard Components

### Components Using Real Data ✅

#### 1. Next Appointment Card
```tsx
{dashboardStats?.nextAppointment ? (
  <div>
    <p>{dashboardStats.nextAppointment.type}</p>
    <p>{dashboardStats.nextAppointment.doctor}</p>
    <p>{new Date(dashboardStats.nextAppointment.dateTime).toLocaleDateString()}</p>
  </div>
) : (
  <p>No upcoming appointments</p>
)}
```
**Status:** ✅ Connected to Neon

#### 2. Dental Health Stats
```tsx
<div>
  <span>Last Visit:</span>
  <span>
    {dashboardStats?.lastVisit 
      ? new Date(dashboardStats.lastVisit).toLocaleDateString()
      : 'No visits'}
  </span>
</div>
<div>
  <span>Upcoming Appointments:</span>
  <span>{dashboardStats?.upcomingAppointments || 0}</span>
</div>
<div>
  <span>Outstanding Balance:</span>
  <span>{formatEGP(dashboardStats?.pendingAmount || 0)}</span>
</div>
<div>
  <span>Unread Messages:</span>
  <Badge>{dashboardStats?.unreadMessages || 0}</Badge>
</div>
```
**Status:** ✅ Connected to Neon

### Components Using Mock Data ❌

#### 1. Promotions Section
```tsx
{promotions.map((promo) => (
  <Card key={promo.id}>
    <CardTitle>{promo.title}</CardTitle>
    <p>{promo.description}</p>
    <Badge>{promo.discount}</Badge>
  </Card>
))}
```
**Status:** ❌ Using `defaultPromotions` array

#### 2. Educational Content
```tsx
<Card>
  <Smile className="h-8 w-8" />
  <CardTitle>Daily Care</CardTitle>
  <p>Brush twice daily...</p>
</Card>
```
**Status:** ❌ Hardcoded in component

## Testing Verification

### Test 1: Real Appointment Data
```
1. Admin creates appointment for patient@example.com at 10:00 AM tomorrow
2. Patient logs in as patient@example.com
3. Dashboard shows:
   ✅ "Next Appointment: Tomorrow at 10:00 AM"
   ✅ "Upcoming Appointments: 1"
```

### Test 2: Real Invoice Data
```
1. Admin creates invoice for patient (500 EGP, status: Sent)
2. Patient logs in
3. Dashboard shows:
   ✅ "Outstanding Balance: 500.00 EGP"
   ✅ "Pending Invoices: 1"
```

### Test 3: Real Message Data
```
1. Staff sends chat message to patient
2. Patient logs in (hasn't read message yet)
3. Dashboard shows:
   ✅ "Unread Messages: 1"
```

### Test 4: Last Visit
```
1. Patient had appointment 2 weeks ago (completed)
2. Patient logs in
3. Dashboard shows:
   ✅ "Last Visit: [2 weeks ago date]"
```

## Database Tables Used

### 1. **patients**
- Used to find patient by email
- Used to get patient ID for invoices

### 2. **appointments**
- Upcoming appointments count
- Next appointment details
- Last visit date

### 3. **chatMessage** (with conversation)
- Unread messages count
- Filters by patientEmail and senderType

### 4. **invoice**
- Pending invoices count
- Pending amount sum
- Filters by patientId and status

## What Happens on Dashboard Load

### Successful Load
```
1. User logs in → user.email = "patient@example.com"
2. useEffect triggers fetchDashboardData()
3. Fetches /api/patient/dashboard?email=patient@example.com
4. API queries Neon database via Prisma
5. Returns real stats
6. Dashboard displays real data ✅
7. Promotions show default data ❌
```

### Error Handling
```
1. API call fails
2. catch block executes
3. Still shows default promotions and content
4. Stats section shows: 0 appointments, 0 messages, 0 balance
```

## Percentage Breakdown

### Data Source Analysis

**Connected to Neon Database: ~60%**
- ✅ All statistics (appointments, messages, invoices)
- ✅ Next appointment details
- ✅ Last visit information
- ✅ Financial data

**Using Mock Data: ~40%**
- ❌ Promotions (offers/discounts)
- ❌ Portal welcome content
- ❌ Health tips
- ❌ Testimonials
- ❌ Services list

## Recommendations

### To Make 100% Neon-Connected:

1. **Create Promotions Table**
```sql
CREATE TABLE promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount TEXT,
  valid_until DATE,
  code TEXT,
  featured BOOLEAN,
  active BOOLEAN
);
```

2. **Create Portal Content Table**
```sql
CREATE TABLE portal_content (
  id TEXT PRIMARY KEY,
  welcome_message TEXT,
  clinic_info JSONB,
  health_tips JSONB,
  updated_at TIMESTAMP
);
```

3. **Create Testimonials Table**
```sql
CREATE TABLE testimonials (
  id TEXT PRIMARY KEY,
  patient_name TEXT,
  rating INTEGER,
  comment TEXT,
  treatment TEXT,
  date DATE
);
```

4. **Update Patient Dashboard**
- Fetch promotions from database
- Fetch portal content from database
- Fetch testimonials from database

## Summary Table

| Feature | Database Status | Data Source |
|---------|----------------|-------------|
| Upcoming Appointments Count | ✅ Neon | `appointments` table |
| Next Appointment Details | ✅ Neon | `appointments` table |
| Last Visit Date | ✅ Neon | `appointments` table |
| Unread Messages Count | ✅ Neon | `chatMessage` table |
| Outstanding Balance | ✅ Neon | `invoice` table |
| Pending Invoices Count | ✅ Neon | `invoice` table |
| Promotions/Offers | ❌ Mock | Hardcoded array |
| Welcome Message | ❌ Mock | Hardcoded object |
| Health Tips | ❌ Mock | Hardcoded array |
| Testimonials | ❌ Mock | Hardcoded array |
| Services List | ❌ Mock | Hardcoded array |

## Conclusion

**YES**, the patient dashboard (لوحة التحكم) **IS connected to Neon database** for the most important features:

✅ **Core Stats**: All appointment, message, and billing data comes from Neon
✅ **Real-Time Data**: Shows actual patient appointments and invoices
✅ **Dynamic Content**: Updates when appointments/invoices change

❌ **Marketing Content**: Promotions, testimonials, and educational content are still hardcoded

The critical patient-specific data (appointments, messages, billing) is 100% from Neon database. The decorative/marketing content (promotions, tips) uses default values.
