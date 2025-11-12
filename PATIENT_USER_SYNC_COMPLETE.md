# Patient-User Synchronization System

## Overview
This document describes the complete bidirectional synchronization system between the User Management (إدارة المستخدمين) and Patients (المرضى) systems. The system ensures that patient role users always have corresponding patient records and vice versa.

## Problem Statement
Previously, there were two separate systems:
1. **User Management** - Users with different roles (admin, doctor, receptionist, patient)
2. **Patients** - Patient demographic and medical information

These systems were not synchronized, leading to:
- Patient role users without patient records
- Patients without user accounts (unable to access patient portal)
- Inconsistent data between the two systems

## Solution Architecture

### Core Service: `PatientUserSyncService`
Location: `/src/services/patient-user-sync.ts`

This service provides bidirectional synchronization with the following features:

#### 1. **User → Patient Sync**
When a patient role user is created in User Management:
- Automatically creates a corresponding Patient record
- Links the user and patient via `User.patientId`
- Uses user's basic info (firstName, lastName, email, phone)

#### 2. **Patient → User Sync** (Optional)
When a patient is created in the Patients page:
- Can optionally create a user account for portal access
- Requires password to be provided
- Assigns 'patient' role with basic permissions

### Database Schema

#### User Table
```typescript
{
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole ('patient', 'admin', 'doctor', 'receptionist')
  patientId: string? // Link to Patient record
  phone: string?
  address: string?
  // ... other fields
}
```

#### Patient Table
```typescript
{
  id: string
  email: string
  name: string // firstName
  lastName: string
  phone: string
  dob: Date
  status: PatientStatus
  address: string?
  ecName: string? // Emergency contact
  ecPhone: string?
  insuranceProvider: string?
  policyNumber: string?
  // ... other fields
}
```

### Link Field
- `User.patientId` → `Patient.id` (foreign key relationship)

## Implementation Details

### 1. User Registration Flow

**Location**: `/src/app/api/auth/register/route.ts`

```typescript
// When a user registers with 'patient' role:
const user = await UsersService.create(userData);

if (user.role === 'patient') {
  // Automatically create patient record
  const patient = await PatientUserSyncService.createPatientFromUser(user, {
    dob: providedDOB || defaultDOB
  });
}
```

**What Happens:**
1. User account is created in `User` table
2. If role is 'patient', a Patient record is automatically created
3. User.patientId is set to link the records
4. Patient can now login and access patient portal

### 2. Patient Creation Flow

**Location**: `/src/app/api/patients/route.ts`

```typescript
// Create patient
const patient = await PatientsService.create(patientData);

// Optionally create user account
if (createUserAccount && password) {
  const user = await PatientUserSyncService.createUserFromPatient(
    patient,
    password
  );
}
```

**What Happens:**
1. Patient record is created in `Patient` table
2. If `createUserAccount` flag is true:
   - User account is created with provided password
   - User.patientId is set to link the records
   - Patient can login to patient portal

### 3. Admin User Management Page

**Location**: `/src/app/admin/users/page.tsx`

When admin creates a patient role user:
- User is created via `/api/auth/register`
- Patient record is automatically created
- User appears in User Management
- Patient appears in Patients page (المرضى)

### 4. Admin Patients Page

**Location**: `/src/app/patients/page.tsx`

When admin creates a patient:
- Patient is created via `/api/patients`
- Can optionally create user account by providing password
- Patient appears in Patients page
- If user created, appears in User Management

## API Endpoints

### 1. Patient Creation
```
POST /api/patients
Body: {
  name: string,
  lastName: string,
  email: string,
  phone: string,
  dob: string,
  createUserAccount?: boolean,
  userPassword?: string,
  // ... other fields
}
```

### 2. User Registration
```
POST /api/auth/register
Body: {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: UserRole,
  dob?: string, // For patient role
  // ... other fields
}
```

### 3. Create User Account for Existing Patient
```
POST /api/patients/[id]/create-account
Body: {
  password: string
}
```

### 4. Sync Existing Data
```
POST /api/admin/sync-patients-users
```
Synchronizes all existing patient role users and patients that are not linked.

## Complete Cycles

### Cycle 1: Admin Creates Patient Role User
```
User Management (إدارة المستخدمين)
↓
Create User with role='patient'
↓
POST /api/auth/register
↓
User created in User table
↓
Auto-trigger: PatientUserSyncService.createPatientFromUser()
↓
Patient created in Patient table
↓
User.patientId linked to Patient.id
↓
✅ User visible in User Management
✅ Patient visible in Patients page (المرضى)
✅ User can login to patient portal
```

### Cycle 2: Admin Creates Patient
```
Patients Page (المرضى)
↓
Create Patient (with optional user account)
↓
POST /api/patients
↓
Patient created in Patient table
↓
If createUserAccount=true:
  PatientUserSyncService.createUserFromPatient()
  ↓
  User created in User table with role='patient'
  ↓
  User.patientId linked to Patient.id
↓
✅ Patient visible in Patients page
✅ User visible in User Management (if created)
✅ Patient can login (if user created)
```

### Cycle 3: Patient Self-Registration
```
Registration Page
↓
Fill registration form
↓
POST /api/auth/register (role='patient')
↓
User created + Patient created automatically
↓
✅ Account ready for patient portal access
✅ Shows in both User Management and Patients
```

## Sync Functions

### `createPatientFromUser(user, additionalData)`
Creates a Patient record from a User record.
- Checks if patient already exists (by email)
- Creates patient with user's basic info
- Links user.patientId to patient.id
- Returns the created patient

### `createUserFromPatient(patient, password)`
Creates a User account from a Patient record.
- Checks if user already exists (by email)
- Creates user with patient role
- Links user.patientId to patient.id
- Returns the created user

### `syncExistingPatientsAndUsers()`
One-time sync for existing data.
- Finds patient role users without patientId
- Creates patient records for them
- Finds patients with matching user emails
- Links them together
- Returns statistics of sync operation

### `getPatientForUser(userId)`
Retrieves the patient record for a given user.
- Returns Patient object or null

### `getUserForPatient(patientId)`
Retrieves the user account for a given patient.
- Returns User object or null

### `hasUserAccount(patientId)`
Checks if a patient has a user account.
- Returns boolean

### `hasPatientRecord(userId)`
Checks if a user has a patient record.
- Returns boolean

## Testing the System

### Test 1: Create Patient Role User in User Management
1. Go to `/admin/users`
2. Click "Add User"
3. Fill form with role = "patient"
4. Submit
5. **Expected Result**: 
   - User appears in User Management
   - Patient automatically appears in `/patients`
   - User can login to patient portal

### Test 2: Create Patient in Patients Page
1. Go to `/patients`
2. Click "Add Patient"
3. Fill form (email is required)
4. Submit
5. **Expected Result**:
   - Patient appears in Patients page
   - Check `/admin/users` - no user created (unless explicitly requested)

### Test 3: Create Patient with User Account
1. Use API directly or modify UI:
```javascript
POST /api/patients
{
  "name": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "123456789",
  "dob": "1990-01-01",
  "createUserAccount": true,
  "userPassword": "SecurePassword123"
}
```
2. **Expected Result**:
   - Patient created
   - User account created
   - Both linked via patientId
   - User can login

### Test 4: Sync Existing Data
1. Create some patient role users manually
2. Create some patients manually (not linked)
3. Call sync endpoint:
```
POST /api/admin/sync-patients-users
```
4. **Expected Result**:
   - Returns count of patients created
   - Returns count of users linked
   - All patient role users now have patient records

## Security Considerations

### Data Isolation
- Patient portal users can only see their own data
- Email is used as the unique identifier across both systems
- patientId link ensures data integrity

### Password Management
- Passwords are hashed using bcrypt
- Never stored in plain text
- Default password option available for admin-created accounts

### Access Control
- Patient role has limited permissions: `['view_own_data']`
- Cannot access other patients' data
- Cannot access admin features

## Benefits

### ✅ Automatic Synchronization
- No manual linking required
- Data consistency maintained automatically

### ✅ Flexible User Creation
- Patients can be created with or without user accounts
- User accounts can be added later if needed

### ✅ Single Source of Truth
- Email is the unique identifier
- patientId provides explicit linking
- No duplicate data

### ✅ Admin Control
- Admins can create patients directly
- Admins can manage user accounts
- Full visibility of both systems

### ✅ Patient Portal Access
- Patients with user accounts can login
- Access their appointments, billing, records
- Send messages to clinic

## Future Enhancements

### 1. Bulk Import
- Import patients from CSV/Excel
- Automatically create user accounts
- Send welcome emails with credentials

### 2. Password Reset
- Self-service password reset for patients
- Email verification
- Security questions

### 3. Account Invitation
- Admin sends invitation email to patient
- Patient sets their own password
- Account activated on first login

### 4. Merge Accounts
- Detect duplicate patients by email
- UI to merge duplicate records
- Maintain data integrity

### 5. Audit Trail
- Track when patients/users are created
- Track who created them
- Track linking operations

## Troubleshooting

### Issue: Patient role user without patient record
**Solution**: 
```javascript
// Manually trigger sync
POST /api/admin/sync-patients-users
```

### Issue: Patient without user account cannot login
**Solution**:
```javascript
// Create user account for patient
POST /api/patients/{patientId}/create-account
Body: { password: "TempPassword123" }
```

### Issue: Duplicate emails between User and Patient
**Solution**:
- Check if they should be linked
- Use sync endpoint to link them
- Or delete duplicate and recreate

### Issue: User.patientId is null but patient exists
**Solution**:
- Run sync endpoint
- Or manually update User.patientId

## Files Modified/Created

### New Files
- `/src/services/patient-user-sync.ts` - Core sync service
- `/src/app/api/admin/sync-patients-users/route.ts` - Sync endpoint
- `/src/app/api/patients/[id]/create-account/route.ts` - Create user for patient

### Modified Files
- `/src/app/api/auth/register/route.ts` - Auto-create patient on registration
- `/src/app/api/patients/route.ts` - Use Prisma, optional user creation
- `/src/app/patients/page.tsx` - Use new API endpoints
- `/src/app/api/patient/profile/route.ts` - Add DELETE endpoint

## Conclusion

The Patient-User synchronization system provides:
- ✅ Automatic bidirectional sync between users and patients
- ✅ Flexible user account creation options
- ✅ Complete data integrity
- ✅ Seamless admin and patient portal integration
- ✅ Easy maintenance and troubleshooting

Both cycles (User → Patient and Patient → User) work correctly and maintain data consistency across the entire system.
