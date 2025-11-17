# Duplicate useLanguage() Hook Fix

## Problem
The application was showing runtime error: `ReferenceError: language is not defined`. This was caused by multiple components violating React Hooks rules by calling `useLanguage()` more than once in the same component tree.

## Root Cause
React Hooks cannot be called multiple times in the same component render cycle. Several components had nested helper functions or child components that called `useLanguage()`, and the parent component also called it, causing duplicate hook invocations.

## Pattern Identified
```tsx
// ❌ WRONG - Duplicate hook calls
function useChartConfig() {
  const { t } = useLanguage(); // First call
  return { /* config */ };
}

export default function MyChart() {
  const { language } = useLanguage(); // Second call - VIOLATES RULES
  const config = useChartConfig();
}
```

## Solution
Inline the helper function logic or pass values as props to child components:

```tsx
// ✅ CORRECT - Single hook call
export default function MyChart() {
  const { t, language } = useLanguage(); // Only one call
  const config = {
    /* inline config using t */
  };
}
```

## Files Fixed

### 1. Analytics Charts (4 files)
**Pattern**: Removed `useChartConfig()` functions, inlined chart configs
- `src/components/analytics/treatment-volume-chart.tsx`
- `src/components/analytics/staff-performance-chart.tsx`
- `src/components/analytics/patient-demographics-chart.tsx`
- `src/components/analytics/appointment-analytics-chart.tsx`

### 2. Financial Charts (2 files)
**Pattern**: Removed `useChartConfig()` functions, inlined chart configs
- `src/components/analytics/patient-satisfaction-chart.tsx`
- `src/components/financial/expenses-by-category-chart.tsx`

### 3. Dashboard Components (2 files)
**Pattern**: Pass `t`, `isRTL`, and `language` as props to nested components

#### kpi-suggestions.tsx
- Modified `SubmitButton` to accept `t` as prop
- Parent `KpiSuggestions` passes `t` prop

#### pending-appointments-manager.tsx
- Modified `AppointmentCard` to accept `t` and `isRTL` as props
- Parent `PendingAppointmentsManager` passes both props
- Added `isRTL` to parent's `useLanguage()` destructuring

### 4. Patient Portal (1 file)
**Pattern**: Pass `t` and `language` as props to nested components

#### AdminContent.tsx
- Modified `PromotionForm` to accept `t` as prop
- Modified `PortalContentForm` to accept `t` and `language` as props
- Parent `AdminContent` passes appropriate props to both components

## Summary
- **Total files fixed**: 9
- **Total duplicate hook calls eliminated**: 9
- **Pattern used**: 
  - For chart configs: Inline the config object
  - For nested components: Pass translation functions/values as props

## Verification
✅ TypeScript compilation: `npm run typecheck` - No errors
✅ React Hooks rules: No duplicate hook calls remain
✅ Runtime: Application should now run without "language is not defined" error

## Prevention
To avoid this issue in the future:
1. Never call hooks inside nested functions that aren't components
2. If a child component needs translation, pass `t` as a prop
3. Call `useLanguage()` only once per component, at the top level
4. Destructure all needed values in a single call: `const { t, language, isRTL } = useLanguage();`
