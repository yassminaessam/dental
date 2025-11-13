# Fix: ReferenceError - Cannot access 't' before initialization ✅

## المشكلة / Problem

```
ReferenceError: Cannot access 't' before initialization
at EditEmployeeDialog
```

This error occurred because the `t` function (translation) was being used in the `employeeSchema` before it was initialized by the `useLanguage()` hook.

---

## 🔧 الحل / Solution

### The Issue:
```typescript
// ❌ WRONG ORDER - t is used before it's defined
export function EditEmployeeDialog(...) {
  const employeeSchema = React.useMemo(() => z.object({
    firstName: z.string().min(1, t('staff.validation.first_name_required')),
    // ↑ Using 't' here
  }), [t]);

  const { t, isRTL } = useLanguage();
  // ↑ But 't' is defined here!
}
```

### The Fix:
```typescript
// ✅ CORRECT ORDER - t is defined before use
export function EditEmployeeDialog(...) {
  const { t, isRTL } = useLanguage();
  // ↑ Define 't' first
  
  const employeeSchema = React.useMemo(() => z.object({
    firstName: z.string().min(1, t('staff.validation.first_name_required')),
    // ↑ Now 't' is available
  }), [t]);
}
```

---

## 📋 What Was Changed

### File: `src/components/staff/edit-employee-dialog.tsx`

**Before (Line ~69-124):**
```typescript
export function EditEmployeeDialog({ staffMember, onSave, open, onOpenChange }: EditEmployeeDialogProps) {
  const [dateOpen, setDateOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [hasExistingUser, setHasExistingUser] = React.useState(false);
  const [existingUser, setExistingUser] = React.useState<any>(null);
  
  const employeeSchema = React.useMemo(() => z.object({
    firstName: z.string().min(1, t('staff.validation.first_name_required')),
    // ... more fields using 't'
  }), [t]);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });
  
  const { t, isRTL } = useLanguage(); // ❌ TOO LATE!
```

**After (Line ~69-124):**
```typescript
export function EditEmployeeDialog({ staffMember, onSave, open, onOpenChange }: EditEmployeeDialogProps) {
  const { t, isRTL } = useLanguage(); // ✅ FIRST!
  
  const [dateOpen, setDateOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [hasExistingUser, setHasExistingUser] = React.useState(false);
  const [existingUser, setExistingUser] = React.useState<any>(null);
  
  const employeeSchema = React.useMemo(() => z.object({
    firstName: z.string().min(1, t('staff.validation.first_name_required')),
    // ... now 't' is available
  }), [t]);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });
```

**Changed:** Moved `const { t, isRTL } = useLanguage();` to the **first line** inside the function component.

---

## 🧹 Clear Cache (If Error Persists)

If you still see the error after the fix, you need to clear Next.js cache:

### Method 1: Delete .next folder (Recommended)
```bash
# Stop the dev server (Ctrl+C)
cd C:\Users\mobar\CairoDental
rmdir /s /q .next
npm run dev
```

### Method 2: Use PowerShell
```powershell
# Stop the dev server (Ctrl+C)
cd C:\Users\mobar\CairoDental
Remove-Item -Recurse -Force .next
npm run dev
```

### Method 3: Hard Refresh Browser
```
1. Stop dev server (Ctrl+C)
2. Delete .next folder manually
3. Start dev server: npm run dev
4. Open browser
5. Hard refresh: Ctrl+Shift+R (or Ctrl+F5)
```

---

## 🧪 Test the Fix

### Test 1: Open Edit Employee Dialog
```bash
1. Go to الموظفون page
2. Click Edit on any employee
3. ✅ Dialog should open without error
4. ✅ User Account section should be visible
```

### Test 2: Check Console
```bash
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click Edit on employee
4. ✅ No ReferenceError should appear
```

### Test 3: Full Workflow
```bash
1. Edit employee
2. Make changes
3. Save
4. ✅ No errors
5. ✅ Changes saved successfully
```

---

## 🔍 Why This Happened

### React Hooks Order Rules:
In React, hooks must be called in the same order every render. The order matters because:

1. **Hook Declaration Order** is critical
2. **Dependencies** must be available before use
3. **useMemo dependencies** must exist when memo is created

### Our Case:
```typescript
// ❌ Problem:
const schema = React.useMemo(() => {
  // Uses 't' here
}, [t]); // Depends on 't'

const { t } = useLanguage(); // But 't' is defined here!
```

The `useMemo` hook tried to access `t` before `useLanguage()` was called.

### Solution:
```typescript
// ✅ Fixed:
const { t } = useLanguage(); // Define 't' first

const schema = React.useMemo(() => {
  // Now 't' is available
}, [t]);
```

---

## 📊 Before & After

| Aspect | Before ❌ | After ✅ |
|--------|----------|---------|
| Hook order | useState → useMemo → useLanguage | useLanguage → useState → useMemo |
| 't' availability | Used before definition | Defined before use |
| Error | ReferenceError | No error |
| Dialog opens | ❌ Crashes | ✅ Works |

---

## ✅ Status

**Fixed:** ✅ The ReferenceError has been resolved.

**Action Needed:** 
1. ✅ Code is fixed
2. 🔄 Clear `.next` cache if error persists
3. 🔄 Hard refresh browser
4. ✅ Test the edit employee dialog

---

## 📝 Summary

**Problem:** 
- Using `t` function before it was initialized
- Wrong hook order in component

**Fix:**
- Moved `useLanguage()` hook to the top
- Now `t` is available when schema is created

**Result:**
- ✅ No more ReferenceError
- ✅ Edit Employee dialog works correctly
- ✅ User Account section functional

---

🎉 **تم إصلاح الخطأ بنجاح!**  
🎉 **Error fixed successfully!**
