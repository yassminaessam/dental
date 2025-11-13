# Patient Data Flow - Current Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CairoDental Application                      │
│                                                                   │
│  ┌────────────────────┐         ┌────────────────────┐          │
│  │   Admin Pages      │         │  Patient Portal    │          │
│  │   (16 pages)       │         │  (Patient View)    │          │
│  └────────────────────┘         └────────────────────┘          │
│           │                              │                       │
│           ▼                              ▼                       │
│  ┌─────────────────────────────────────────────────┐            │
│  │           Patient Data Sources                   │            │
│  │  ┌──────────────┐      ┌──────────────┐        │            │
│  │  │  Neon DB     │      │  Legacy      │        │            │
│  │  │ (Prisma)     │      │  Firestore   │        │            │
│  │  └──────────────┘      └──────────────┘        │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Current Data Flow by Page

### ✅ Neon Database Flow (4 pages)

```
Dashboard ──────┐
Patients ───────┤
Billing ────────├──> /api/patients ──> PatientsService ──> Neon DB (Prisma)
Dental Chart ───┘                       (Correct ✅)
```

### ⚠️ Legacy Firestore Flow (Direct - 2 pages)

```
Reports ────────┐
Analytics ──────┼──> listDocuments('patients') ──> Firestore ──> ⚠️ Legacy Data
                │                                   (Needs Migration)
```

### ⚠️ Mixed/Indirect Flow (7 pages)

```
Referrals ──────┐
Financial ──────┤
Communications ─┤
Treatments ─────┼──> listDocuments('patients') ──> Firestore ──> ⚠️ Legacy Data
Medical Records ┤     (in components/dialogs)       (Needs Verification)
Insurance ──────┤
Pharmacy ───────┘
```

### ❌ No Direct Patient Fetch (2 pages)

```
Appointments ───> Uses patient names stored in appointment records
                  (Schedule dialog needs verification)

Treatments ─────> Uses /api/treatments endpoint
                  (May need patient data join)
```

---

## Detailed Component Architecture

### Current State: Fragmented Patient Fetching

```
┌────────────────────────────────────────────────────────────────┐
│                         Pages Layer                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Dashboard          Patients           Billing                 │
│      │                  │                  │                    │
│      ├─ AddPatientDialog                  │                    │
│      │                                     │                    │
│      └─ ScheduleDialog  ├─ EditDialog     ├─ NewInvoiceDialog │
│             │               │                     │             │
│             ▼               ▼                     ▼             │
│        ┌──────────────────────────────────────────────┐        │
│        │   Each fetches patients independently       │        │
│        │   (⚠️ No shared logic - duplication)         │        │
│        └──────────────────────────────────────────────┘        │
│                             │                                   │
│                             ▼                                   │
│              ┌──────────────────────────────┐                  │
│              │  Data Sources (Mixed)        │                  │
│              │  - Some use /api/patients    │                  │
│              │  - Some use listDocuments    │                  │
│              └──────────────────────────────┘                  │
└────────────────────────────────────────────────────────────────┘
```

---

## Recommended Architecture (After Migration)

### Future State: Centralized Patient Data

```
┌────────────────────────────────────────────────────────────────┐
│                         Pages Layer                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  All Pages and Components                                      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────┐                      │
│  │   usePatients() Hook / Context       │                      │
│  │   (Single source of truth)           │                      │
│  │   ✅ Centralized caching              │                      │
│  │   ✅ Consistent error handling        │                      │
│  │   ✅ Optimized performance            │                      │
│  └──────────────────────────────────────┘                      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────┐                      │
│  │   /api/patients Endpoint             │                      │
│  │   (REST API)                         │                      │
│  └──────────────────────────────────────┘                      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────┐                      │
│  │   PatientsService                    │                      │
│  │   (Business Logic)                   │                      │
│  └──────────────────────────────────────┘                      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────┐                      │
│  │   Neon Database (Prisma ORM)         │                      │
│  │   Patient Table ✅                    │                      │
│  └──────────────────────────────────────┘                      │
└────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Comparison

### Before Migration (Current)

```
Page Request
    │
    ├─> Option 1: fetch('/api/patients') ──> Neon DB ✅
    │
    ├─> Option 2: listDocuments('patients') ──> Firestore ⚠️
    │
    └─> Option 3: No fetch (uses embedded names) ❌

Result: Inconsistent data sources, potential data mismatch
```

### After Migration (Target)

```
Page Request
    │
    └──> usePatients() hook
            │
            ├─> Check cache (if available)
            │
            └─> fetch('/api/patients')
                    │
                    └──> PatientsService
                            │
                            └──> Neon DB (Single Source of Truth) ✅

Result: Consistent, cached, optimized patient data
```

---

## Component Dependency Map

### High-Priority Components Using Patient Data

```
PatientSelect (Shared Component - TO CREATE)
    │
    ├─> Used by:
    │   ├─ ScheduleAppointmentDialog
    │   ├─ NewTreatmentPlanDialog
    │   ├─ NewInvoiceDialog
    │   ├─ NewPrescriptionDialog
    │   ├─ AddTransactionDialog
    │   ├─ NewMessageDialog
    │   ├─ UploadImageDialog
    │   ├─ NewRecordDialog
    │   ├─ NewReferralDialog
    │   └─ NewClaimDialog
    │
    └─> Fetches from: usePatients() hook ──> /api/patients ──> Neon DB
```

---

## Migration Path Visualization

### Phase 1: Critical Pages (Week 1)

```
Reports Page
    │
    ├─ Current:  listDocuments('patients')
    │                 │
    │                 ▼
    │            Firestore ⚠️
    │
    └─ After:    fetch('/api/patients')
                      │
                      ▼
                  Neon DB ✅

Analytics Page
    │
    └─ (Same transformation as Reports)

Referrals Page
    │
    └─ (Same transformation as Reports)
```

### Phase 2: Component Standardization (Week 2)

```
Before:
    NewInvoiceDialog ──> local fetchPatients() ──> listDocuments('patients')
    NewMessageDialog ──> local fetchPatients() ──> listDocuments('patients')
    UploadImageDialog ─> local fetchPatients() ──> listDocuments('patients')
                            ⚠️ Duplicate logic

After:
    All Dialogs ──> usePatients() hook ──> /api/patients ──> Neon DB
                        ✅ Shared, cached, consistent
```

### Phase 3: Architecture (Weeks 3-4)

```
Before:
    [Patient Name in Appointment] ──> String reference ⚠️
                                      (No data integrity)

After:
    [Patient ID in Appointment] ──> Foreign Key ──> Patient Table ✅
                                     (Referential integrity)
```

---

## API Endpoint Architecture

### Current Endpoints

```
GET  /api/patients          ✅ Returns all patients from Neon
POST /api/patients          ✅ Creates patient in Neon
POST /api/patients/[id]/create-account  ✅ Creates user account

GET  /api/appointments      ⚠️ Returns appointments with patient names
GET  /api/treatments        ⚠️ Returns treatments with patient names
GET  /api/invoices          ✅ Recently migrated, uses Neon patients
```

### Recommended Improvements

```
GET  /api/patients/[id]              (Add: Get single patient)
PUT  /api/patients/[id]              (Add: Update patient)
DELETE /api/patients/[id]            (Add: Delete patient)
GET  /api/patients/[id]/appointments (Add: Patient's appointments)
GET  /api/patients/[id]/treatments   (Add: Patient's treatments)
GET  /api/patients/[id]/invoices     (Add: Patient's invoices)
```

---

## Database Schema Relationships (Recommended)

### Current Schema (Simplified)

```
Patient Table (Neon)
├─ id: UUID
├─ name: String
├─ email: String
├─ phone: String
└─ ... other fields

Appointment Collection (Firestore)
├─ id: String
├─ patient: String  ⚠️ Just a name, no FK
└─ ... other fields

Treatment Collection (Firestore)
├─ id: String
├─ patient: String  ⚠️ Just a name, no FK
└─ ... other fields
```

### Recommended Schema (After Full Migration)

```
Patient Table (Neon)
├─ id: UUID (PRIMARY KEY)
├─ name: String
├─ email: String
├─ phone: String
└─ ... other fields
    │
    ├──> Appointment Table (Neon)
    │    ├─ id: UUID
    │    ├─ patientId: UUID (FOREIGN KEY → Patient.id) ✅
    │    ├─ patientName: String (denormalized for display)
    │    └─ ... other fields
    │
    ├──> Treatment Table (Neon)
    │    ├─ id: UUID
    │    ├─ patientId: UUID (FOREIGN KEY → Patient.id) ✅
    │    ├─ patientName: String (denormalized for display)
    │    └─ ... other fields
    │
    └──> Invoice Table (Neon)
         ├─ id: UUID
         ├─ patientId: UUID (FOREIGN KEY → Patient.id) ✅
         ├─ patientName: String (denormalized for display)
         └─ ... other fields
```

**Benefits:**
- ✅ Data integrity enforced
- ✅ Can query patient's related data efficiently
- ✅ Updates to patient name propagate correctly
- ✅ Can't delete patient with active appointments

---

## Performance Considerations

### Current Performance Issues

```
Problem 1: Multiple Fetches
    Dashboard loads ──> fetches patients
    Opens NewInvoiceDialog ──> fetches patients again ⚠️
    Opens ScheduleDialog ──> fetches patients again ⚠️
    Result: 3x network requests for same data

Problem 2: Mixed Sources
    Some components: /api/patients ──> Fast (Neon)
    Other components: listDocuments ──> Slow (Firestore)
    Result: Inconsistent performance

Problem 3: No Caching
    Every component re-fetches on mount
    Result: Unnecessary API calls
```

### After Optimization

```
Solution: Shared Hook with Caching

usePatients() implementation:
    1. Check if patients in cache
       ├─ Yes: Return cached data (instant) ✅
       └─ No: Fetch from API, cache result ✅
    
    2. All components use same cached data
       Result: 1 API call per page load ✅
    
    3. Cache invalidation on updates
       Result: Always fresh data ✅

Performance improvement: 3x reduction in API calls
```

---

## Migration Checklist

### ✅ Completed
- [x] Dashboard using Neon DB
- [x] Patients page using Neon DB
- [x] Billing page using Neon DB
- [x] Dental Chart using Neon DB
- [x] `/api/patients` endpoint created
- [x] PatientsService with Prisma

### ⏳ In Progress (This Audit)
- [x] Audit all pages
- [x] Document current state
- [x] Create migration plan
- [ ] Execute migrations

### 📋 To Do (Phases 1-4)
- [ ] Migrate Reports page
- [ ] Migrate Analytics page
- [ ] Migrate Referrals page
- [ ] Create usePatients hook
- [ ] Create PatientSelect component
- [ ] Update all dialogs
- [ ] Add caching layer
- [ ] Normalize database relationships
- [ ] Integration testing
- [ ] Performance testing

---

## Success Metrics

### Current Baseline
```
Pages using Neon DB:     4 / 16  (25%)
API response time:       ~200ms (varied)
Duplicate fetches:       3-5 per page load
Data consistency:        Mixed (Neon + Firestore)
```

### Target After Migration
```
Pages using Neon DB:     16 / 16  (100%) ✅
API response time:       <150ms (optimized)
Duplicate fetches:       1 per page load (cached)
Data consistency:        Single source (Neon only) ✅
```

---

## Quick Reference

**Need patient data in a page?**
```typescript
// ✅ CORRECT WAY
const response = await fetch('/api/patients');
const { patients } = await response.json();
```

**Need patient data in a component?**
```typescript
// ✅ CORRECT WAY (after Phase 2)
const { patients, loading } = usePatients();
```

**Creating new feature that needs patients?**
1. Use `/api/patients` endpoint
2. Store patient ID (not name)
3. Use shared PatientSelect component
4. Follow existing Neon DB patterns

---

**For full details, see:** `PATIENT_DATA_NEON_AUDIT_REPORT.md`
