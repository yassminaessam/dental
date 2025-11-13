# Medical Records Neon Database Migration

## Summary
Medical records and clinical images have been migrated from Firestore to the Neon PostgreSQL database for better performance, consistency, and patient portal integration.

## Changes Made

### 1. Database Schema Updates (`prisma/schema.prisma`)

Added two new models:

#### MedicalRecord Model
```prisma
enum MedicalRecordStatus {
  Draft
  Final
}

model MedicalRecord {
  id         String              @id @default(uuid())
  patient    String
  patientId  String?
  type       String              // SOAP, Clinical Note, Treatment Plan, Consultation
  complaint  String?
  provider   String
  providerId String?
  date       DateTime            @default(now())
  status     MedicalRecordStatus @default(Final)
  notes      String?             @db.Text
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt

  @@index([patientId])
  @@index([status])
  @@index([date])
}
```

#### ClinicalImage Model
```prisma
model ClinicalImage {
  id         String   @id @default(uuid())
  patient    String
  patientId  String?
  type       String
  imageUrl   String
  caption    String?  @db.Text
  date       DateTime @default(now())
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([patientId])
  @@index([date])
}
```

### 2. API Endpoints Created

#### Medical Records APIs
- `GET /api/medical-records` - List all medical records (with optional `?patientId` filter)
- `POST /api/medical-records` - Create a new medical record
- `GET /api/medical-records/[id]` - Get a specific medical record
- `PUT /api/medical-records/[id]` - Update a medical record
- `DELETE /api/medical-records/[id]` - Delete a medical record

#### Clinical Images APIs
- `GET /api/clinical-images` - List all clinical images (with optional `?patientId` filter)
- `POST /api/clinical-images` - Create a new clinical image

### 3. Patient Portal APIs Updated

#### `/api/patient/medical-records`
- Now fetches from Neon database `MedicalRecord` table
- Combines medical records, treatments, and appointments
- Properly filters by `patientId` instead of patient name matching

#### `/api/patient/images`
- Now fetches from Neon database `ClinicalImage` table
- Returns clinical images for the logged-in patient

## Migration Steps

### Step 1: Run Prisma Migration

```bash
# Generate and apply the migration
npx prisma migrate dev --name add_medical_records_and_clinical_images

# Generate Prisma Client
npx prisma generate
```

### Step 2: Update Admin Medical Records Page

The admin medical records page (`src/app/medical-records/page.tsx`) currently uses Firestore. It needs to be updated to use the Neon database API endpoints.

**Current (Firestore):**
```typescript
import { listMedicalRecords, createMedicalRecord } from '@/services/medical-records';
```

**New (Neon API):**
```typescript
// Fetch medical records
const response = await fetch('/api/medical-records');
const { records } = await response.json();

// Create medical record
const response = await fetch('/api/medical-records', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patient: patientName,
    patientId: patientId,
    type: 'SOAP',
    complaint: 'complaint text',
    provider: providerName,
    providerId: providerId,
    date: new Date().toISOString(),
    status: 'Final',
    notes: 'notes text',
  }),
});
```

### Step 3: Update Medical Record Dialog Components

Update the following components to send `patientId` along with patient name:

1. **`src/components/medical-records/new-record-dialog.tsx`**
   - Update `onSubmit` to send `patientId`
   - Change from Firestore service to API call

2. **`src/components/medical-records/edit-record-dialog.tsx`**
   - Update to use PUT `/api/medical-records/[id]`

3. **`src/components/medical-records/upload-image-dialog.tsx`**
   - Update to POST to `/api/clinical-images`
   - Include `patientId` in the request

### Step 4: Data Migration (Optional)

If you have existing medical records in Firestore that need to be migrated:

```typescript
// migration-script.ts
import { getCollection } from '@/services/firestore.server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateMedicalRecords() {
  // Fetch from Firestore
  const firestoreRecords = await getCollection('medical-records');
  
  // Get all patients to match names to IDs
  const patients = await prisma.patient.findMany();
  
  for (const record of firestoreRecords) {
    // Find matching patient
    const patient = patients.find(p => 
      p.name === record.patient || 
      `${p.name} ${p.lastName}` === record.patient
    );
    
    await prisma.medicalRecord.create({
      data: {
        patient: record.patient,
        patientId: patient?.id,
        type: record.type,
        complaint: record.complaint,
        provider: record.provider,
        providerId: null, // Would need to match provider names to IDs
        date: new Date(record.date),
        status: record.status,
        notes: record.notes,
      },
    });
  }
}
```

## Benefits

1. **Patient Portal Integration**: Patients can now see their medical records created by admin
2. **Better Performance**: Database queries are faster than Firestore
3. **Data Consistency**: All data now in one database (Neon)
4. **Proper Relationships**: Can use `patientId` foreign keys instead of name matching
5. **Phone Column**: Medical records table now shows patient phone numbers by joining with patient data

## Testing Checklist

- [ ] Run Prisma migration successfully
- [ ] Create a new medical record from admin page
- [ ] View medical records list on admin page
- [ ] Edit a medical record
- [ ] Delete a medical record
- [ ] Login as patient and verify medical records appear
- [ ] Upload clinical image from admin page
- [ ] View clinical images on admin page
- [ ] Login as patient and verify clinical images appear

## Notes

- The admin medical records page still needs to be updated to use the new API endpoints
- Make sure to update `patientId` when creating new records (not just patient name)
- The phone column now works properly in the medical records table
