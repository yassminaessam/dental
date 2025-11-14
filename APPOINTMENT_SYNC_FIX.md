# Appointment Synchronization Fix

## Problem
Appointments created by admin were not visible to patients because the `patientEmail` and `patientPhone` fields were not being saved when admin created appointments.

## Root Cause
- **Admin appointment creation**: `schedule-appointment-dialog.tsx` was only saving `patientId` and `patient` (name), but not `patientEmail` or `patientPhone`
- **Patient appointment fetching**: `/api/patient/appointments` filters by `patientEmail` or `patientId`
- **Result**: Admin-created appointments without `patientEmail` were not returned to patients

## Data Flow

### Before Fix
```
Admin creates appointment → Only saves: patientId, patient name
Patient fetches appointments → Filters by: patientEmail === user.email
Result: No match found ❌
```

### After Fix
```
Admin creates appointment → Saves: patientId, patient name, patientEmail, patientPhone ✅
Patient fetches appointments → Filters by: patientEmail === user.email
Result: Match found and appointment displayed ✅
```

## Changes Made

### 1. Updated Schedule Appointment Dialog (`src/components/dashboard/schedule-appointment-dialog.tsx`)
**Changed:**
```typescript
const onSubmit = async (data: AppointmentFormData) => {
  // ... date/time setup ...
  
  const selectedPatient = patients.find(p => p.id === data.patient);
  const patientName = selectedPatient?.name;
  const patientEmail = selectedPatient?.email;      // ✅ NEW
  const patientPhone = selectedPatient?.phone;      // ✅ NEW
  const doctorName = doctors.find(d => d.id === data.doctor)?.name;

  await onSave({
    dateTime,
    patient: patientName || data.patient,
    patientId: data.patient,
    patientEmail: patientEmail,                     // ✅ NEW
    patientPhone: patientPhone,                     // ✅ NEW
    doctor: doctorName || data.doctor,
    doctorId: data.doctor,
    type: data.type,
    duration: data.duration,
    notes: data.notes,
    bookedBy: 'staff',
  });
};
```

### 2. Updated Edit Appointment Dialog (`src/components/appointments/edit-appointment-dialog.tsx`)
**Changed:**
```typescript
const onSubmit = (data: AppointmentFormData) => {
  // ... date/time setup ...
  
  const selectedPatient = patients.find(p => p.id === data.patient);
  const patientName = selectedPatient?.name;
  const patientEmail = selectedPatient?.email;      // ✅ NEW
  const patientPhone = selectedPatient?.phone;      // ✅ NEW
  const doctorName = doctors.find(d => d.id === data.doctor)?.name;

  const updatedAppointment: Appointment = {
    ...appointment,
    patient: patientName || appointment.patient,
    patientId: data.patient,
    patientEmail: patientEmail || appointment.patientEmail,    // ✅ NEW
    patientPhone: patientPhone || appointment.patientPhone,    // ✅ NEW
    doctor: doctorName || appointment.doctor,
    doctorId: data.doctor,
    dateTime,
    type: data.type,
    duration: data.duration,
    notes: data.notes ?? appointment.notes,
  };
  onSave(updatedAppointment);
};
```

## Verification

### Admin Side
1. Login as admin
2. Go to Appointments page (`/appointments`)
3. Create new appointment for a patient
4. **Verify**: `patientEmail` and `patientPhone` are saved in the database

### Patient Side
1. Login as patient
2. Go to My Appointments page (`/patient-appointments`)
3. **Verify**: Appointments created by admin are now visible
4. **Verify**: Can view appointment details, cancel, or reschedule

### Database Check
```sql
SELECT 
  id, 
  patient, 
  patientId, 
  patientEmail,    -- Should be populated
  patientPhone,    -- Should be populated
  doctor, 
  dateTime, 
  status 
FROM appointments 
WHERE "bookedBy" = 'staff';
```

## Bidirectional Sync Status

| Direction | Status | Details |
|-----------|--------|---------|
| **Patient → Admin** | ✅ Working | Patients book appointments with email/phone, admin sees all appointments |
| **Admin → Patient** | ✅ Fixed | Admin creates appointments with email/phone, patients can now see them |

## Testing Checklist

- [ ] Admin creates appointment for patient
- [ ] Patient logs in and sees the appointment
- [ ] Patient can view appointment details
- [ ] Patient can cancel appointment (status changes visible to admin)
- [ ] Admin edits appointment (changes visible to patient)
- [ ] Patient creates appointment (visible to admin)
- [ ] Verify database has patientEmail and patientPhone for all new appointments

## Related Files
- `src/components/dashboard/schedule-appointment-dialog.tsx` - Admin appointment creation
- `src/components/appointments/edit-appointment-dialog.tsx` - Admin appointment editing
- `src/components/appointments/patient-appointment-booking.tsx` - Patient appointment creation
- `src/app/api/patient/appointments/route.ts` - Patient appointment fetching API
- `src/app/api/appointments/route.ts` - Admin appointment API
- `src/services/appointments.ts` - Appointment service (Neon database operations)

## Notes
- All appointments are stored in the Neon database using Prisma ORM
- The `patientEmail` field is critical for the patient portal to filter and display appointments
- The `patientId` can also be used for filtering, but most patient pages use email-based filtering
- Existing appointments created before this fix may need to be backfilled with patient email data
