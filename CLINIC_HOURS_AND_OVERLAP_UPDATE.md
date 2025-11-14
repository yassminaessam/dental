# Clinic Hours and Overlap Blocking Update

## Changes Summary

Updated the appointment booking system to reflect the clinic's actual operating hours (9:00 AM - 11:00 PM) and re-implemented overlap blocking based on appointment duration.

## 1. Extended Clinic Hours

### Previous Hours
- 9:00 AM - 5:30 PM (limited availability)
- Missing evening slots

### New Hours
- **9:00 AM - 11:00 PM (23:00)**
- Full day coverage including evening appointments
- 28 available time slots (30-minute intervals)

### Available Time Slots
```
Morning:    09:00, 09:30, 10:00, 10:30, 11:00, 11:30
Noon:       12:00, 12:30, 13:00, 13:30
Afternoon:  14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30
Evening:    18:00, 18:30, 19:00, 19:30, 20:00, 20:30, 21:00, 21:30
Late:       22:00, 22:30
```

## 2. Duration-Based Overlap Blocking

### How It Works

The system now blocks time slots based on appointment duration to prevent overlapping appointments.

#### Example 1: 1-Hour Appointment
```
Existing: 10:00 AM - 11:00 AM (1 hour)

Blocked slots:
❌ 09:30 AM (would end at 10:30, overlaps)
❌ 10:00 AM (exact match)
❌ 10:30 AM (starts during appointment)

Available slots:
✅ 09:00 AM (ends at 10:00, no overlap)
✅ 11:00 AM (starts when previous ends)
✅ 11:30 AM (no overlap)
```

#### Example 2: 1.5-Hour Appointment
```
Existing: 14:00 PM - 15:30 PM (1.5 hours)

Blocked slots:
❌ 13:30 PM (would end at 14:30, overlaps)
❌ 14:00 PM (exact match)
❌ 14:30 PM (during appointment)
❌ 15:00 PM (during appointment)

Available slots:
✅ 13:00 PM (ends at 14:00, no overlap)
✅ 15:30 PM (starts when previous ends)
✅ 16:00 PM (no overlap)
```

#### Example 3: 30-Minute Appointment
```
Existing: 10:00 AM - 10:30 AM (30 minutes)

Blocked slots:
❌ 09:30 AM (would end at 10:30, overlaps)
❌ 10:00 AM (exact match)

Available slots:
✅ 09:00 AM (ends at 10:00, no overlap)
✅ 10:30 AM (starts when previous ends)
✅ 11:00 AM (no overlap)
```

### Overlap Detection Logic

```typescript
// For a requested time slot, check if it overlaps with existing appointments

Overlap occurs when:
1. Requested start time is during existing appointment
   (requestedStart >= aptStart AND requestedStart < aptEnd)

2. Requested end time is during existing appointment
   (requestedEnd > aptStart AND requestedEnd <= aptEnd)

3. Requested appointment completely contains existing appointment
   (requestedStart <= aptStart AND requestedEnd >= aptEnd)

If ANY condition is true → Block the slot
```

## 3. Duration Parsing

The system automatically parses appointment duration from various formats:

```typescript
"1 hour"      → 60 minutes
"30 minutes"  → 30 minutes
"1.5 hours"   → 90 minutes
"2 hours"     → 120 minutes
"45 minutes"  → 45 minutes
```

Default duration for patient bookings: **60 minutes (1 hour)**

## 4. Visual Representation

### Scenario: Busy Day Schedule

```
09:00 ✅ Available
09:30 ❌ Blocked (overlaps with 10:00-11:00)
10:00 ❌ Booked (Patient A: 1 hour)
10:30 ❌ Blocked (during Patient A)
11:00 ✅ Available
11:30 ❌ Blocked (overlaps with 12:00-13:30)
12:00 ❌ Booked (Patient B: 1.5 hours)
12:30 ❌ Blocked (during Patient B)
13:00 ❌ Blocked (during Patient B)
13:30 ✅ Available
14:00 ✅ Available
...
18:00 ❌ Booked (Patient C: 30 minutes)
18:30 ✅ Available
19:00 ✅ Available
20:00 ❌ Booked (Patient D: 2 hours)
20:30 ❌ Blocked (during Patient D)
21:00 ❌ Blocked (during Patient D)
21:30 ❌ Blocked (during Patient D)
22:00 ✅ Available
22:30 ✅ Available
```

## 5. Blocking Rules Summary

### What Gets Blocked:
✅ Past time slots (time has already passed)
✅ Time slots that overlap with existing appointments based on duration
✅ Active appointments (Pending, Confirmed, Completed status)

### What Doesn't Get Blocked:
❌ Cancelled appointments (free up the time)
❌ Future available time slots
❌ Weekends (clinic works 7 days)

### Duration Considerations:
- Patient bookings default to 1-hour duration
- Existing appointments checked for their actual duration
- Overlap calculated based on start + duration

## 6. Benefits

### For Patients:
1. **Evening Availability**: Can book appointments until 11:00 PM
2. **No Conflicts**: System prevents double-booking
3. **Clear Visibility**: See exactly which slots are free
4. **Smart Blocking**: Only blocks times that actually overlap

### For Clinic:
1. **Extended Hours**: Maximize clinic capacity
2. **Efficient Scheduling**: No manual conflict checking needed
3. **Accurate Blocking**: Duration-aware prevents mistakes
4. **Flexible**: Handles different appointment lengths

## 7. Technical Details

### Functions Updated:

#### `parseDuration(duration: string): number`
New helper function to parse duration strings.

```typescript
Input:  "1.5 hours"
Output: 90 (minutes)
```

#### `isTimeSlotAvailable(date: string, time: string): boolean`
Updated to check for duration-based overlaps.

```typescript
// Checks:
1. Is time in past? → false
2. Does it overlap with any active appointment? → false
3. Otherwise → true
```

#### `getTimeSlotStatus(date: string, time: string): object`
Returns detailed status with reason.

```typescript
// Returns:
{ available: true }
{ available: false, reason: 'Already booked' }
{ available: false, reason: 'Past time' }
```

### Time Slots Array:
Extended from 16 slots to 28 slots (9 AM - 10:30 PM at 30-min intervals)

## 8. Testing Scenarios

### Test Case 1: Standard 1-Hour Appointment
```
Setup:
- Existing: 10:00 AM (1 hour)

Expected Results:
✅ 09:00 AM available
❌ 09:30 AM blocked (overlaps)
❌ 10:00 AM blocked (exact)
❌ 10:30 AM blocked (during)
✅ 11:00 AM available
```

### Test Case 2: Long Appointment (2 hours)
```
Setup:
- Existing: 14:00 PM (2 hours)

Expected Results:
✅ 13:00 PM available
❌ 13:30 PM blocked (overlaps)
❌ 14:00 PM blocked (exact)
❌ 14:30 PM blocked (during)
❌ 15:00 PM blocked (during)
❌ 15:30 PM blocked (during)
✅ 16:00 PM available
```

### Test Case 3: Multiple Appointments
```
Setup:
- Appointment 1: 10:00 AM (1 hour)
- Appointment 2: 14:00 PM (30 minutes)
- Appointment 3: 19:00 PM (1.5 hours)

Available:
✅ 09:00 AM, 11:00 AM, 11:30 AM, 12:00 PM, 12:30 PM, 13:00 PM
✅ 14:30 PM, 15:00 PM, 15:30 PM, 16:00 PM, 17:00 PM, 18:00 PM
✅ 20:30 PM, 21:00 PM, 22:00 PM, 22:30 PM

Blocked:
❌ 09:30 AM (overlap with Apt 1)
❌ 10:00 AM, 10:30 AM (Apt 1)
❌ 13:30 PM, 14:00 PM (Apt 2)
❌ 18:30 PM, 19:00 PM, 19:30 PM, 20:00 PM (Apt 3)
```

### Test Case 4: Evening Appointments
```
Setup:
- Existing: 21:00 PM (1 hour)

Expected Results:
✅ 20:00 PM available
❌ 20:30 PM blocked (overlaps)
❌ 21:00 PM blocked (exact)
❌ 21:30 PM blocked (during)
✅ 22:00 PM available
✅ 22:30 PM available
```

### Test Case 5: Back-to-Back Appointments
```
Setup:
- Appointment 1: 10:00 AM - 11:00 AM
- Appointment 2: 11:00 AM - 12:00 PM

Expected Results:
❌ 09:30 AM blocked (overlaps Apt 1)
❌ 10:00 AM blocked (Apt 1)
❌ 10:30 AM blocked (Apt 1)
❌ 11:00 AM blocked (Apt 2)
❌ 11:30 AM blocked (Apt 2)
✅ 12:00 PM available
```

## 9. Implementation Files

### Modified Files:
- `src/components/appointments/patient-appointment-booking.tsx`
  - Extended `timeSlots` array (9 AM - 10:30 PM)
  - Added `parseDuration()` helper function
  - Updated `isTimeSlotAvailable()` with overlap logic
  - Updated `getTimeSlotStatus()` with overlap logic

### Related Files:
- `src/services/appointments.ts` - Duration field usage
- `src/app/api/appointments/route.ts` - Appointment creation
- `src/lib/types.ts` - Appointment type definition

## 10. Future Enhancements

Potential improvements:
1. **Variable Patient Duration**: Let patients select appointment length
2. **Doctor-Specific Schedules**: Different hours for different doctors
3. **Break Times**: Configure lunch/break periods
4. **Buffer Time**: Add 5-10 minute buffer between appointments
5. **Priority Booking**: VIP patients or emergency slots
6. **Multi-Room Support**: Multiple appointments at same time in different rooms
7. **Holiday Calendar**: Close on specific holidays
8. **Peak Hours Indicator**: Show busiest times

## Summary

✅ Clinic now operates 9:00 AM - 11:00 PM (28 time slots)
✅ Duration-based overlap blocking prevents conflicts
✅ Works 7 days a week
✅ Smart blocking considers appointment length
✅ Visual feedback shows availability clearly
✅ Handles various appointment durations (30 min - 2+ hours)

The system now provides comprehensive scheduling with intelligent conflict prevention!
