# Where Does the Patient Name (اسم المريض) Come From in Appointments?

## Question
When logged in as admin at المواعيد (Appointments), from where does the system get اسم المريض (Patient Name) in the "Add New Appointment" form?

---

## Answer: From the Neon PostgreSQL Database

The patient names in the appointment form come from the **Neon PostgreSQL database**, specifically from the `Patient` table through the `CollectionDoc` table.

---

## 📊 Complete Data Flow

### 1. **User Opens Appointment Dialog**
**Location**: `src/app/appointments/page.tsx`
```typescript
<ScheduleAppointmentDialog onSave={handleSaveAppointment} />
```

### 2. **Dialog Component Fetches Patients**
**Location**: `src/components/dashboard/schedule-appointment-dialog.tsx`

When the dialog opens (`open` state becomes `true`), it triggers:

```typescript
React.useEffect(() => {
  async function fetchData() {
    try {
      // Fetch patients from API
      const patientData = await fetchCollection<Record<string, unknown>>('patients');
      setPatients(
        patientData.map((patient) => ({
          ...patient,
          dob: patient.dob ? new Date(patient.dob as string) : new Date(),
        })) as Patient[]
      );
      
      // Also fetches doctors
      const staffData = await fetchCollection<StaffMember>('staff');
      setDoctors(
        staffData.filter((s) => {
          const r = (s.role || '').toLowerCase();
          return r === 'dentist' || r === 'doctor';
        })
      );
    } catch (error) {
      console.error('Error loading scheduling data', error);
    }
  }
  if (open) {
    fetchData();
  }
}, [open]);
```

### 3. **API Endpoint Called**
**Endpoint**: `GET /api/collections/patients`
**Location**: `src/app/api/collections/[collection]/route.ts`

```typescript
export async function GET(_request: Request, context: { params: Promise<{ collection: string }> }) {
  try {
    const { collection } = await context.params;
    const items = await getCollection<Record<string, unknown>>(collection);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('[api/collections/[collection]] GET error', error);
    return NextResponse.json({ error: 'Failed to load collection.' }, { status: 500 });
  }
}
```

### 4. **Data Retrieved from Database**
**Location**: `src/services/datastore.server.ts`

```typescript
export async function getCollection<T>(collectionName: string): Promise<T[]> {
  if (collectionName === 'users') {
    const rows = await UsersService.listAll();
    return rows as unknown as T[];
  }
  
  // For 'patients' collection
  const rows = await prisma.collectionDoc.findMany({
    where: { collection: collectionName },
    orderBy: { createdAt: 'desc' }
  });
  
  return rows.map((r: PrismaCollectionDoc) => ({
    id: r.id,
    ...(r.data as Record<string, unknown>)
  } as T));
}
```

### 5. **Database Query Executed**
**Database**: Neon PostgreSQL
**Table**: `CollectionDoc`
**Query**: 
```sql
SELECT * FROM "CollectionDoc" 
WHERE collection = 'patients' 
ORDER BY "createdAt" DESC
```

### 6. **Data Structure in Database**

#### CollectionDoc Table Schema
```typescript
model CollectionDoc {
  id         String
  collection String
  data       Json      // Contains patient data
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@id([collection, id])
  @@index([collection])
}
```

#### Patient Data (stored in `data` JSON field)
```json
{
  "id": "patient-uuid",
  "name": "Ahmed Hassan",
  "lastName": "Mohamed",
  "email": "ahmed@example.com",
  "phone": "+20123456789",
  "dob": "1990-01-01",
  "status": "Active",
  "address": "Cairo, Egypt",
  "ecName": "Fatma Hassan",
  "ecPhone": "+20987654321",
  "ecRelationship": "Wife",
  "insuranceProvider": "Misr Insurance",
  "policyNumber": "POL123456",
  "medicalHistory": {}
}
```

### 7. **Patients Displayed in Dropdown**
**Location**: `src/components/dashboard/schedule-appointment-dialog.tsx`

```typescript
<FormField
  control={form.control}
  name="patient"
  render={({ field }) => (
    <FormItem>
      <FormLabel>{t('appointments.patient_name')} *</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={t('appointments.select_patient')} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {patients.map((patient) => (
            <SelectItem key={patient.id} value={patient.id}>
              {patient.name}  {/* Patient name displayed here */}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 🗄️ Database Tables Involved

### 1. **CollectionDoc Table** (Primary Source)
- **Purpose**: Stores legacy document-style data
- **Collection Name**: `"patients"`
- **Data Field**: JSON containing patient information
- **Used For**: Patient dropdown in appointment form

### 2. **Patient Table** (Also Available)
```prisma
model Patient {
  id                String        @id @default(uuid())
  name              String
  lastName          String
  email             String        @unique
  phone             String
  dob               DateTime
  lastVisit         DateTime?
  status            PatientStatus @default(Active)
  address           String?
  ecName            String?
  ecPhone           String?
  ecRelationship    String?
  insuranceProvider String?
  policyNumber      String?
  medicalHistory    Json?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  invoices          Invoice[]
  settings          PatientSettings?

  @@index([status])
  @@index([lastVisit])
}
```

**Note**: Currently, the appointment dialog uses `CollectionDoc` table (legacy approach) rather than the direct `Patient` table.

---

## 🔄 Complete Request Flow Diagram

```
Admin Opens Appointment Form
         ↓
ScheduleAppointmentDialog Component
         ↓
React.useEffect triggers on open
         ↓
fetchCollection('patients') called
         ↓
HTTP GET /api/collections/patients
         ↓
API Route Handler
         ↓
getCollection() service function
         ↓
Prisma Query to CollectionDoc table
         ↓
WHERE collection = 'patients'
         ↓
Neon PostgreSQL Database Query
         ↓
Returns patient records (JSON data)
         ↓
Data mapped to Patient objects
         ↓
setPatients(patientData) updates state
         ↓
Dropdown populated with patient names
         ↓
Admin selects patient from dropdown
```

---

## 📝 Key Points

### Data Source
✅ **Neon PostgreSQL Database** (not hardcoded or mock data)
✅ **CollectionDoc table** with `collection = 'patients'`
✅ **Patient data stored in JSON format** in the `data` field

### How Patients Are Added
Patients can be added through:
1. **المرضى (Patients) page** - Admin can add new patients
2. **API endpoint** - `POST /api/patients`
3. **Database directly** - Via Prisma migrations or seed scripts

### Patient Display
- **ID stored**: `patient.id` (UUID)
- **Name displayed**: `patient.name` field
- **Format**: First name only (not full name with last name)

### Doctor Selection (Similar Process)
- Fetched from: `GET /api/collections/staff`
- Filtered by: `role === 'dentist' || role === 'doctor'`
- Stored in: `CollectionDoc` table with `collection = 'staff'`

---

## 🔧 Technical Implementation Details

### fetchCollection Helper Function
```typescript
async function fetchCollection<T>(collection: string): Promise<T[]> {
  const response = await fetch(`/api/collections/${collection}`);
  if (!response.ok) throw new Error(`Failed to fetch ${collection}`);
  const payload = await response.json();
  return (payload.items ?? payload.data ?? []) as T[];
}
```

### When Appointment Is Saved
```typescript
const patientName = patients.find(p => p.id === data.patient)?.name;
const doctorName = doctors.find(d => d.id === data.doctor)?.name;

await onSave({
  dateTime,
  patient: patientName || data.patient,  // Name stored, not ID
  patientId: data.patient,               // ID also stored
  doctor: doctorName || data.doctor,     // Name stored
  doctorId: data.doctor,                 // ID also stored
  type: data.type,
  duration: data.duration,
  notes: data.notes,
  bookedBy: 'staff',
});
```

### Appointment Storage
Appointments are stored with:
- `patient` (string): Patient name (e.g., "Ahmed Hassan")
- `patientId` (string): Patient UUID reference
- `doctor` (string): Doctor name
- `doctorId` (string): Doctor UUID reference

---

## 🎯 Answer Summary

**Where does اسم المريض come from?**

The patient names in the appointment form dropdown come from the **Neon PostgreSQL database**, specifically:

1. **Database**: Neon PostgreSQL
2. **Table**: `CollectionDoc`
3. **Filter**: `WHERE collection = 'patients'`
4. **Field**: `data.name` (JSON field containing patient name)
5. **Fetched via**: `GET /api/collections/patients`
6. **Displayed in**: Dropdown menu with `<SelectItem>`

The system fetches all active patients from the database when the appointment dialog opens, then populates the dropdown menu with their names for the admin to select.

---

## 🔍 How to Verify

### 1. Check Database Content
```sql
-- View all patients in CollectionDoc table
SELECT id, data->>'name' as patient_name 
FROM "CollectionDoc" 
WHERE collection = 'patients';
```

### 2. Test API Endpoint
```bash
# Fetch patients via API
curl http://localhost:3000/api/collections/patients
```

### 3. Check Browser Network Tab
1. Open Appointments page as admin
2. Click "Add New Appointment"
3. Open Browser DevTools → Network tab
4. Look for request: `GET /api/collections/patients`
5. View response with patient list

---

## 📊 Related Database Tables

The appointment system involves these related tables:

1. **CollectionDoc** - Stores patient data (current source)
2. **Patient** - Direct patient table (alternative source)
3. **Appointment** - Stores appointment records
4. **User** - User accounts (some patients have user accounts)
5. **Staff** - Doctor/dentist records

---

**In summary**: The patient names (اسم المريض) are loaded from the Neon PostgreSQL database through the CollectionDoc table when the admin opens the appointment scheduling dialog. ✅
