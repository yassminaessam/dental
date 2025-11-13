# Email Field Moved to User Account Section ✅

## التغيير / Change

تم نقل حقل **البريد الإلكتروني** من قسم معلومات الموظف الأساسية إلى قسم **حساب المستخدم**.

Moved the **Email** field from the basic employee information section to the **User Account** section.

---

## 🎯 السبب / Reasoning

### قبل / Before:
```
الاسم الأول | اسم العائلة
البريد الإلكتروني | الهاتف
الدور | تاريخ التعيين
الراتب

--- User Account Section ---
☑️ إنشاء حساب دخول
   كلمة المرور
```

**المشكلة:**
- البريد الإلكتروني إلزامي دائماً حتى لو لم يُنشأ حساب مستخدم
- غير منطقي: الموظف لا يحتاج بريد إلكتروني إذا لم يكن لديه حساب دخول

### بعد / After:
```
الاسم الأول | اسم العائلة
الهاتف
الدور | تاريخ التعيين
الراتب

--- User Account Section ---
☑️ إنشاء حساب دخول
   البريد الإلكتروني *
   كلمة المرور *
   التخصص (للأطباء)
   القسم (للأطباء)
```

**الفائدة:**
- ✅ البريد الإلكتروني مطلوب فقط عند إنشاء حساب مستخدم
- ✅ أكثر منطقية: البريد الإلكتروني = معلومات تسجيل الدخول
- ✅ يظهر فقط عند تفعيل checkbox "إنشاء حساب دخول"

---

## 🔧 التغييرات التقنية / Technical Changes

### 1. Updated Form Schema

#### Before:
```typescript
email: z.string().email().min(1, 'Email is required'),
```
- Email was always required

#### After:
```typescript
email: z.string().optional(),

.refine((data) => {
  // Email is required only when creating user account
  if (data.createUserAccount && !data.email) {
    return false;
  }
  // Validate email format if provided
  if (data.email && data.email.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return false;
    }
  }
  return true;
}, {
  message: t('staff.validation.email_required'),
  path: ['email'],
})
```
- Email is optional by default
- Required only when `createUserAccount` is true
- Validates email format when provided

### 2. Moved Email Field in UI

#### Before (in contact section):
```tsx
<div className="grid grid-cols-2 gap-4">
  <FormField name="email" ... />
  <FormField name="phone" ... />
</div>
```

#### After (in User Account section):
```tsx
{/* Phone field alone */}
<FormField name="phone" ... />

{/* User Account Section */}
{form.watch('createUserAccount') && (
  <div>
    <FormField name="email" ... /> {/* Now here */}
    <FormField name="userPassword" ... />
    <FormField name="userSpecialization" ... />
    <FormField name="userDepartment" ... />
  </div>
)}
```

### 3. Added Email Hint

```tsx
<p className="text-xs text-muted-foreground">
  {t('staff.email_hint')}
  // "This email will be used for login"
  // "سيتم استخدام هذا البريد الإلكتروني لتسجيل الدخول"
</p>
```

---

## 📋 الترجمات الجديدة / New Translations

Added `staff.email_hint` translation key:

| Language | Translation |
|----------|-------------|
| English | This email will be used for login |
| العربية | سيتم استخدام هذا البريد الإلكتروني لتسجيل الدخول |

---

## ✅ السلوك / Behavior

### Scenario 1: Add Employee WITHOUT User Account

```
1. Fill employee details:
   - First Name: محمد
   - Last Name: أحمد
   - Phone: 01234567890
   - Role: Hygienist
   - Salary: 40000

2. ❌ DON'T check "إنشاء حساب دخول"

3. Save

Result:
✅ Staff created without email
✅ No user account created
✅ Employee cannot login
```

### Scenario 2: Add Employee WITH User Account

```
1. Fill employee details:
   - First Name: أحمد
   - Last Name: محمد
   - Phone: 01234567890
   - Role: Doctor
   - Salary: 80000

2. ✅ CHECK "إنشاء حساب دخول"

3. User Account section appears:
   - Email: ahmed@cairodental.com * (REQUIRED)
   - Password: ******** * (REQUIRED)
   - Specialization: Orthodontics
   - Department: Orthodontics Dept

4. Save

Result:
✅ Staff created with email
✅ User account created
✅ Employee can login with ahmed@cairodental.com
```

### Scenario 3: Try to Create User Account Without Email

```
1. Fill employee details
2. ✅ CHECK "إنشاء حساب دخول"
3. Enter password but leave email EMPTY
4. Try to save

Result:
❌ Validation error
📝 "Email is required" / "البريد الإلكتروني مطلوب"
❌ Form doesn't submit
```

---

## 📊 قبل وبعد / Before & After Comparison

| Feature | Before | After |
|---------|--------|-------|
| Email field location | Contact section | User Account section |
| Email visibility | Always visible | Only when creating user account |
| Email required | Always | Only when creating user account |
| Email purpose | General contact | Login credentials |
| Logic | Confusing | Clear and intuitive |

---

## 🧪 اختبار / Testing

### Test 1: Employee Without User Account
```bash
1. Go to الموظفون
2. Click إضافة موظف
3. Fill: Name, Phone, Role, Salary
4. ❌ Don't check "إنشاء حساب دخول"
5. Verify: Email field NOT visible
6. Save
7. ✅ Success without email
```

### Test 2: Employee With User Account
```bash
1. Go to الموظفون
2. Click إضافة موظف
3. Fill: Name, Phone, Role, Salary
4. ✅ Check "إنشاء حساب دخول"
5. Verify: Email field appears
6. Fill: Email + Password
7. Save
8. ✅ Success with user account
```

### Test 3: Email Validation
```bash
1. Check "إنشاء حساب دخول"
2. Enter invalid email: "notanemail"
3. Try to save
4. ✅ Validation error shown
5. Enter valid email: "test@example.com"
6. ✅ Validation passes
```

### Test 4: Email Required When Checkbox Enabled
```bash
1. Check "إنشاء حساب دخول"
2. Leave email empty
3. Enter password
4. Try to save
5. ✅ Error: "Email is required"
```

---

## 📁 الملفات المعدلة / Modified Files

### 1. `src/components/staff/add-employee-dialog.tsx`
**Changes:**
- ✅ Moved email field from contact section to User Account section
- ✅ Email now appears only when `createUserAccount` is true
- ✅ Added email hint text
- ✅ Updated validation logic

**Lines changed:**
- Schema validation: Lines ~115-140
- UI layout: Lines ~250-470

### 2. `src/contexts/LanguageContext.tsx`
**Changes:**
- ✅ Added `staff.email_hint` translation (English)
- ✅ Added `staff.email_hint` translation (Arabic)

**Lines changed:**
- English: Line ~2011
- Arabic: Line ~4154

---

## 🎯 الفوائد / Benefits

### 1. Better UX
- ✅ Fields only appear when needed
- ✅ Less clutter in the form
- ✅ Clear purpose for each field

### 2. Logical Grouping
- ✅ Email is part of login credentials
- ✅ All user account fields together
- ✅ Easier to understand

### 3. Conditional Validation
- ✅ Email required only when creating account
- ✅ Can add employees without email
- ✅ More flexible

### 4. Clear Intent
- ✅ User knows email is for login
- ✅ Hint text explains purpose
- ✅ No confusion

---

## 📋 خلاصة الحقول / Field Summary

### Basic Employee Info:
```
✅ First Name *
✅ Last Name *
✅ Phone
✅ Role *
✅ Hire Date *
✅ Salary *
```

### User Account Section (Conditional):
```
☑️ Create login account

When enabled:
✅ Email * (NEW LOCATION)
✅ Password *
✅ Specialization (for doctors)
✅ Department (for doctors)
```

---

## 🔄 الترقية من النسخة السابقة / Migration from Previous Version

### For Existing Employees:
- ✅ No change needed
- ✅ Existing staff records unaffected
- ✅ Can still edit and update

### For New Employees:
- ✅ Email now in User Account section
- ✅ Optional unless creating user account
- ✅ Better user experience

---

## ✅ الخلاصة / Summary

**What Changed:**
- 📧 Email field moved to User Account section
- 🔒 Email required only when creating user account
- 📝 Added hint text: "This email will be used for login"
- ✅ Cleaner form layout
- ✅ Better validation logic

**Why It's Better:**
- ✅ More intuitive
- ✅ Clearer purpose
- ✅ Conditional requirements
- ✅ Better UX

**Status:** ✅ Complete and tested!

---

🎉 **البريد الإلكتروني الآن في قسم حساب المستخدم!**  
🎉 **Email now in User Account section!**
