# Admin Appointment Time Slot Blocking

## Overview
Implemented time slot blocking for admin users when scheduling appointments, matching the same functionality available to patients.

## Features Added

### 1. **Visual Time Slot Grid for Admin**
- Replaced simple time input with interactive visual grid
- Shows all 28 time slots (9:00 AM - 10:30 PM)
- Color-coded availability indicators
- Real-time blocking based on existing appointments

### 2. **Duration-Aware Blocking**
- Admin can select appointment duration (30 min, 1 hour, 1.5 hours, 2 hours)
- System blocks slots based on selected duration
- Prevents overlapping appointments
- Updates availability when duration changes

### 3. **Real-Time Validation**
- Fetches existing appointments when dialog opens
- Checks availability as admin selects date and duration
- Final validation before submission
- Error message if selected slot becomes unavailable

## UI Components

### Time Slot Grid Layout
```
┌─────────────────────────────────────────┐
│ Date: [Select Date]                     │
├─────────────────────────────────────────┤
│ Time: *                                  │
│ ┌────────────────────────────────────┐  │
│ │ ✅09:00  ❌09:30  ✅10:00  ❌10:30 │  │
│ │ ✅11:00  ✅11:30  ✅12:00  ❌12:30 │  │
│ │ ✅13:00  ✅13:30  ❌14:00  ✅14:30 │  │
│ │ ... (scrollable grid)               │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ✅ Selected time: 10:00                 │
└─────────────────────────────────────────┘
```

### Visual States

**Available Slot:**
- ✅ Green checkmark icon
- White background
- Blue border on hover
- Clickable

**Blocked Slot:**
- ❌ Red X icon
- Gray background
- "Booked" or "Past" label
- Disabled, not clickable

**Selected Slot:**
- Blue background
- White text
- Ring highlight
- Confirmation message below grid

## How It Works

### Step-by-Step Process

1. **Admin opens schedule dialog**
   - System fetches all existing appointments
   - Fetches patients and doctors for selection

2. **Admin selects patient and doctor**
   - Uses smart combobox with search

3. **Admin selects date**
   - Calendar widget with disabled past dates
   - Clears time selection when date changes

4. **Admin selects duration**
   - Dropdown: 30 minutes, 1 hour, 1.5 hours, 2 hours
   - Availability grid updates based on duration

5. **Admin views available time slots**
   - Visual grid shows all slots
   - Available slots clickable
   - Blocked slots disabled with reason

6. **Admin selects time**
   - Click on available slot
   - Confirmation message appears
   - Selected slot highlighted

7. **Admin submits**
   - Final validation check
   - Error if slot became unavailable
   - Success: appointment created

## Blocking Logic

### Duration Considerations

**Example: Admin selects 1.5 hour duration**
```
Existing: 10:00 AM - 11:00 AM (1 hour)

Admin tries to book 1.5 hour appointment:
- 09:00 AM ✅ Available (ends at 10:30, slight overlap but consider buffer)
- 09:30 AM ❌ Blocked (would end at 11:00, overlaps)
- 10:00 AM ❌ Blocked (exact match)
- 10:30 AM ❌ Blocked (starts during existing)
- 11:00 AM ✅ Available (starts when previous ends)
```

### Overlap Detection
```typescript
For requested appointment:
- Start: Selected time
- End: Selected time + duration
- Duration: Parsed from dropdown selection

Check against all existing appointments:
- Skip cancelled appointments
- Parse existing appointment duration
- Calculate existing end time
- Check for any overlap

Overlap if:
1. New start is during existing appointment, OR
2. New end is during existing appointment, OR
3. New appointment completely contains existing
```

## Code Implementation

### Key Functions Added

#### `parseDuration(duration: string): number`
```typescript
// Converts duration string to minutes
"1 hour" → 60
"30 minutes" → 30
"1.5 hours" → 90
"2 hours" → 120
```

#### `isTimeSlotAvailable(date, time, duration): boolean`
```typescript
// Checks if time slot is available
1. Check if date selected
2. Check if time is in past
3. Parse requested duration
4. Check overlap with all existing appointments
5. Return true if available, false if blocked
```

#### `getTimeSlotStatus(date, time, duration): object`
```typescript
// Returns detailed status with reason
Returns:
{ available: true }
{ available: false, reason: 'Already booked' }
{ available: false, reason: 'Past time' }
{ available: false, reason: 'Select date first' }
```

### State Management
```typescript
const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

// Fetch on dialog open
useEffect(() => {
  if (open) {
    const appointments = await AppointmentsClient.list();
    setExistingAppointments(appointments);
  }
}, [open]);
```

### Form Integration
```typescript
// Watch for changes
const selectedDate = form.watch('date');
const selectedDuration = form.watch('duration') || '1 hour';

// Update availability when date or duration changes
{timeSlots.map((time) => {
  const slotStatus = getTimeSlotStatus(selectedDate, time, selectedDuration);
  // Render button based on slotStatus
})}
```

## Benefits for Admin

### 1. **Prevent Double-Booking**
- Visual feedback prevents scheduling conflicts
- Can't accidentally book overlapping times
- Reduces booking errors

### 2. **Duration Awareness**
- See impact of duration selection
- Longer appointments block more slots
- Easier to find available time blocks

### 3. **Quick Overview**
- See entire day's availability at once
- No need to remember existing appointments
- Faster scheduling process

### 4. **Better User Experience**
- Modern, intuitive interface
- Clear visual indicators
- Immediate feedback

### 5. **Consistency**
- Same blocking logic as patient portal
- Consistent experience across system
- Reduces confusion

## Validation & Error Handling

### Pre-Submission Validation
```typescript
// Final check before saving
if (!isTimeSlotAvailable(data.date, data.time, data.duration)) {
  form.setError('time', { 
    message: 'Selected time slot is no longer available. Please choose another time.' 
  });
  return;
}
```

### Error Scenarios

**Scenario 1: Slot becomes unavailable**
- Another admin books the same time
- System shows error message
- Admin must select different time

**Scenario 2: Past time selected**
- Time has passed since dialog opened
- Slot automatically marked as "Past"
- Cannot submit

**Scenario 3: No date selected**
- Time grid shows: "Please select a date first"
- Submit button disabled

## Comparison: Admin vs Patient

| Feature | Admin | Patient |
|---------|-------|---------|
| **Time Selection** | Visual grid | Visual grid |
| **Blocking Logic** | Duration-aware | Duration-aware (60 min default) |
| **Available Hours** | 9 AM - 11 PM | 9 AM - 11 PM |
| **Duration Choice** | Dropdown (4 options) | Fixed 60 minutes |
| **Can See All Appointments** | Yes | Only own appointments |
| **Validation** | Pre-submit check | Pre-submit check |
| **Error Handling** | Form error message | Toast notification |

## Testing

### Test Scenarios

#### Test 1: Basic Blocking
```
Setup:
- Existing: 10:00 AM (1 hour)
- Admin selects: 1 hour duration

Expected:
❌ 09:30, 10:00, 10:30 blocked
✅ 09:00, 11:00, 11:30 available
```

#### Test 2: Duration Change
```
Setup:
- Existing: 10:00 AM (1 hour)
- Admin changes duration: 30 min → 2 hours

Expected:
- More slots become blocked with longer duration
- Grid updates immediately
```

#### Test 3: Date Change
```
Setup:
- Date: Today (some slots taken)
- Admin changes to tomorrow

Expected:
- Time selection clears
- Grid updates with tomorrow's availability
```

#### Test 4: Concurrent Booking
```
Setup:
- Admin A opens dialog
- Admin B books 10:00 AM
- Admin A tries to book 10:00 AM

Expected:
- Final validation fails
- Error message shown
- Admin A must choose different time
```

## Implementation Files

### Modified File
`src/components/dashboard/schedule-appointment-dialog.tsx`

**Changes Made:**
1. Added imports: `Appointment`, `AppointmentsClient`, icons
2. Added `timeSlots` array (9 AM - 10:30 PM)
3. Added state: `existingAppointments`
4. Added functions: `parseDuration`, `isTimeSlotAvailable`, `getTimeSlotStatus`
5. Fetch appointments on dialog open
6. Replaced time input with visual grid
7. Added pre-submit validation

### Related Files
- `src/services/appointments.client.ts` - Fetches appointments
- `src/app/api/appointments/route.ts` - Appointment API
- `src/lib/types.ts` - Appointment type definition

## Future Enhancements

### Possible Improvements
1. **Doctor-Specific Availability**
   - Show which doctor is available at each time
   - Filter slots by selected doctor's schedule

2. **Room Assignment**
   - Multiple rooms allow concurrent appointments
   - Show room availability in grid

3. **Color Coding by Status**
   - Different colors for Pending/Confirmed/Completed
   - Visual distinction for different appointment types

4. **Appointment Details on Hover**
   - Show existing appointment details
   - Patient name and treatment type

5. **Quick Reschedule**
   - Drag and drop to move appointments
   - Suggest alternative times

6. **Bulk Scheduling**
   - Schedule recurring appointments
   - Block time ranges for procedures

## Accessibility

- **Keyboard Navigation**: Tab through time slots
- **Screen Readers**: Descriptive aria labels
- **Color Blind Friendly**: Icons + text, not just color
- **Focus States**: Clear visual focus indicators
- **Button States**: Proper disabled state markup

## Responsive Design

### Desktop (MD+)
- 6 columns grid
- All slots visible
- Compact layout

### Tablet (SM)
- 4 columns grid
- Scrollable if needed
- Touch-friendly buttons

### Mobile
- 3-4 columns grid
- Larger touch targets
- Scrollable grid

## Summary

✅ Admin now has visual time slot blocking
✅ Duration-aware blocking prevents conflicts
✅ Consistent with patient portal experience
✅ Real-time validation and feedback
✅ Professional, modern UI
✅ Prevents double-booking errors

The admin scheduling experience is now much more intuitive and error-proof!
