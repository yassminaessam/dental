# Currency Display Fix - Egyptian Pounds (جم)

## Overview
Updated currency display to consistently show "جم" (Egyptian Pounds) in both patient and admin portals, with support for Arabic and English formatting.

## Date
November 14, 2025

## Issue
- Admin billing page was using `Intl.NumberFormat` which displayed "EGP" or "E£" instead of "جم"
- Patient billing page was using `formatEGP` but needed language-aware formatting
- Currency formatting was inconsistent between portals

## Solution

### 1. Enhanced Currency Formatting Function
**File**: `src/lib/currency.ts`

**Changes**:
- Added `language` parameter to `formatEGP` function
- Implemented locale-specific number formatting:
  - Arabic (ar-EG): Uses Arabic numerals
  - English (en-US): Uses English numerals
- Always displays "جم" symbol regardless of language
- Maintains thousands separator for better readability

**Before**:
```typescript
export function formatEGP(amount: number | string, showSymbol: boolean = true): string {
  const formatted = numAmount.toFixed(2);
  return showSymbol ? `${formatted} جم` : formatted;
}
```

**After**:
```typescript
export function formatEGP(
  amount: number | string, 
  showSymbol: boolean = true, 
  language: string = 'ar'
): string {
  const formatted = numAmount.toLocaleString(
    language === 'ar' ? 'ar-EG' : 'en-US',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
  return showSymbol ? `${formatted} جم` : formatted;
}
```

### 2. Updated Admin Billing Page
**File**: `src/app/billing/page.tsx`

**Changes Made**:
1. **Removed all `Intl.NumberFormat` instances**
2. **Replaced with `formatEGP` calls**

**Locations Updated**:

#### Statistics Cards (Lines 164-170)
```typescript
// Before
const currency = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { 
  style: 'currency', 
  currency: 'EGP' 
});
return [
  { title: t('billing.stats.total_billed'), value: currency.format(totalBilled), ... },
  { title: t('billing.stats.outstanding'), value: currency.format(outstanding), ... },
  // ...more stats
];

// After
return [
  { title: t('billing.stats.total_billed'), value: formatEGP(totalBilled, true, language), ... },
  { title: t('billing.stats.outstanding'), value: formatEGP(outstanding, true, language), ... },
  // ...more stats
];
```

#### Insurance Applied Toast (Line 403-405)
```typescript
// Before
const currency = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { 
  style: 'currency', 
  currency: 'EGP' 
});
toast({
  description: `${currency.format(creditToApply)} ${t('billing.amount_paid')} - ${oldestInvoice.id}`,
});

// After
toast({
  description: `${formatEGP(creditToApply, true, language)} ${t('billing.amount_paid')} - ${oldestInvoice.id}`,
});
```

#### Payment Recorded Toast (Line 450)
```typescript
// Before
const currency = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { 
  style: 'currency', 
  currency: 'EGP' 
});
toast({ 
  description: `${currency.format(paymentAmount)} - ${invoiceId}` 
});

// After
toast({ 
  description: `${formatEGP(paymentAmount, true, language)} - ${invoiceId}` 
});
```

#### Invoice Table Display (Lines 756-757)
```typescript
// Already using formatEGP - no changes needed
<TableCell>{formatEGP(invoice.totalAmount, true, language)}</TableCell>
<TableCell>{formatEGP(invoice.amountPaid, true, language)}</TableCell>
```

### 3. Updated Patient Billing Page
**File**: `src/app/patient-billing/page.tsx`

**Changes Made**:
1. **Added language context**: `const { t, language } = useLanguage();`
2. **Updated all formatEGP calls to include language parameter**

**Locations Updated**:

#### Payment Handler (Line 85)
```typescript
// Before
description: `Processing payment of ${formatEGP(amount)} for ${invoiceId}...`

// After
description: `Processing payment of ${formatEGP(amount, true, language)} for ${invoiceId}...`
```

#### Outstanding Balance Card (Line 140)
```typescript
// Before
<CardTitle className="text-3xl text-red-600">
  {formatEGP(totalPending)}
</CardTitle>

// After
<CardTitle className="text-3xl text-red-600">
  {formatEGP(totalPending, true, language)}
</CardTitle>
```

#### Total Paid Card (Line 158)
```typescript
// Before
<CardTitle className="text-3xl text-green-600">
  {formatEGP(totalPaid)}
</CardTitle>

// After
<CardTitle className="text-3xl text-green-600">
  {formatEGP(totalPaid, true, language)}
</CardTitle>
```

#### Payment History (Line 277)
```typescript
// Before
<p className="font-bold text-green-600">
  {formatEGP(Number(invoice.total || invoice.amount))}
</p>

// After
<p className="font-bold text-green-600">
  {formatEGP(Number(invoice.total || invoice.amount), true, language)}
</p>
```

## Results

### Currency Display Examples

#### Arabic Language (ar):
- **Format**: `٢٬٥٠٠٫٠٠ جم`
- Uses Arabic numerals
- Shows thousands separator
- Always shows "جم" symbol

#### English Language (en):
- **Format**: `2,500.00 جم`
- Uses English numerals
- Shows thousands separator
- Always shows "جم" symbol

### Benefits

1. **Consistency**: All currency displays now use the same formatting across the application
2. **Localization**: Numbers format according to user's language preference
3. **Egyptian Currency**: Always shows "جم" symbol instead of "EGP" or "E£"
4. **Readability**: Thousands separators make large amounts easier to read
5. **Maintainability**: Single source of truth for currency formatting

## Testing

### Patient Portal Testing

1. **Login as patient**:
   - Email: `patient@cairodental.com`
   
2. **Navigate to Billing page** (`/patient-billing`)

3. **Verify currency display**:
   - [ ] Outstanding Balance shows "جم"
   - [ ] Total Paid shows "جم"
   - [ ] Invoice amounts show "جم"
   - [ ] Payment history shows "جم"
   - [ ] Toast notifications show "جم"

4. **Switch language** (if applicable):
   - [ ] Arabic: Numbers in Arabic numerals with "جم"
   - [ ] English: Numbers in English numerals with "جم"

### Admin Portal Testing

1. **Login as admin**

2. **Navigate to Billing page** (`/billing`)

3. **Verify currency display**:
   - [ ] Statistics cards show "جم"
   - [ ] Invoice table amounts show "جم"
   - [ ] Toast notifications show "جم"
   - [ ] Payment dialogs show "جم"

4. **Test operations**:
   - [ ] Create new invoice
   - [ ] Record payment
   - [ ] Apply insurance credit
   - [ ] View invoice details

5. **Switch language**:
   - [ ] Arabic: Numbers in Arabic numerals with "جم"
   - [ ] English: Numbers in English numerals with "جم"

## Files Modified

1. ✅ `src/lib/currency.ts` - Enhanced formatEGP function
2. ✅ `src/app/billing/page.tsx` - Admin billing page
3. ✅ `src/app/patient-billing/page.tsx` - Patient billing page

## Migration Notes

### For Developers

If you need to display currency anywhere in the application:

```typescript
import { formatEGP } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';

function MyComponent() {
  const { language } = useLanguage();
  
  return (
    <div>
      {/* Always pass language parameter */}
      {formatEGP(1234.56, true, language)}
      {/* Output: 1,234.56 جم (English) or ١٬٢٣٤٫٥٦ جم (Arabic) */}
    </div>
  );
}
```

### Best Practices

1. **Always import language context**: `const { language } = useLanguage();`
2. **Pass language parameter**: `formatEGP(amount, true, language)`
3. **Use formatEGP consistently**: Don't use `Intl.NumberFormat` for currency
4. **Show symbol by default**: Only hide if space is very limited

## Backward Compatibility

The changes are backward compatible:
- Default language is 'ar' (Arabic)
- Function signature is extended, not changed
- Existing calls without language parameter will work with default Arabic formatting

## Status

✅ **COMPLETED**

All currency displays now consistently show "جم" (Egyptian Pounds) in both patient and admin portals with proper localization support.
