# Edit Employee - User Account Section Added ✅

## التحديث / Update

تم إضافة قسم **حساب المستخدم** إلى نموذج **تعديل الموظف** (Edit Employee).

Added **User Account** section to the **Edit Employee** (تعديل الموظف) form.

---

## 🎯 الميزات الجديدة / New Features

### 1. **Detect Existing User Account** / كشف حساب المستخدم الموجود
- ✅ Automatically checks if staff member has linked user account
- ✅ Fetches user details from `/api/users/{userId}`
- ✅ Shows current email and role

### 2. **Update Existing User Account** / تحديث حساب المستخدم الموجود
When employee has existing user account:
- ✅ **Email**: Update login email
- ✅ **New Password**: Change password (optional - leave empty to keep current)
- ✅ **Specialization**: For doctors/admins
- ✅ **Department**: For doctors/admins

### 3. **Create New User Account** / إنشاء حساب مستخدم جديد  
When employee doesn't have user account:
- ✅ **Checkbox**: "إنشاء حساب دخول للنظام"
- ✅ **Email**: Required for login
- ✅ **Password**: Required (min 8 characters)
- ✅ **Specialization**: For doctors
- ✅ **Department**: For doctors

---

## 📋 السيناريوهات / Scenarios

### Scenario 1: Employee WITH Existing User Account

```
1. Open تعديل الموظف for "Dr. Omar Youssef"
2. User Account section shows:
   
   حساب المستخدم
   ┌─────────────────────────────────────┐
   │ لديه حساب مستخدم موجود             │
   │ doctor2@cairodental.com • Doctor    │
   ├─────────────────────────────────────┤
   │ البريد الإلكتروني *                │
   │ [doctor2@cairodental.com]           │
   │ سيتم استخدام هذا البريد... │
   │                                     │
   │ كلمة مرور جديدة (اختياري)          │
   │ [**********]            [👁]         │
   │ اتركه فارغًا للاحتفاظ بكلمة...     │
   │                                     │
   │ التخصص                              │
   │ [General Dentistry]                 │
   │                                     │
   │ القسم                               │
   │ [Dental Surgery]                    │
   └─────────────────────────────────────┘

3. Can update:
   ✅ Email
   ✅ Password (optional)
   ✅ Specialization
   ✅ Department

4. Save → Updates both Staff and User records
```

### Scenario 2: Employee WITHOUT User Account

```
1. Open تعديل الموظف for "Hygienist Ahmed"
2. User Account section shows:
   
   حساب المستخدم
   ┌─────────────────────────────────────┐
   │ ☐ إنشاء حساب دخول للنظام            │
   │   السماح لهذا الموظف بتسجيل...      │
   └─────────────────────────────────────┘

3. ✅ Check the checkbox
4. Fields appear:
   - Email *
   - Password *
   - Specialization (if role is doctor)
   - Department (if role is doctor)

5. Fill and Save → Creates User account + links to Staff
```

---

## 🔧 التغييرات التقنية / Technical Changes

### 1. **Added State Management**
```typescript
const [showPassword, setShowPassword] = React.useState(false);
const [hasExistingUser, setHasExistingUser] = React.useState(false);
const [existingUser, setExistingUser] = React.useState<any>(null);
```

### 2. **Fetch Existing User on Load**
```typescript
React.useEffect(() => {
  if (staffMember && open) {
    // Check if staff member has linked user account
    if (staffMember.userId) {
      const response = await fetch(`/api/users/${staffMember.userId}`);
      if (response.ok) {
        const user = await response.json();
        setExistingUser(user);
        setHasExistingUser(true);
      }
    }
  }
}, [staffMember, form, open]);
```

### 3. **Conditional UI Rendering**
```typescript
{hasExistingUser && existingUser ? (
  // Show existing user account fields (update mode)
  <div>
    <p>Has existing user account</p>
    <Input name="email" defaultValue={existingUser.email} />
    <Input name="userPassword" placeholder="New password (optional)" />
  </div>
) : (
  // Show create user account checkbox
  <Checkbox label="Create login account for system access" />
)}
```

### 4. **Updated onSubmit Handler**
```typescript
const onSubmit = async (data: EmployeeFormData) => {
  // 1. Save staff member
  onSave(updatedStaffMember);

  // 2. Create new user account (if checkbox enabled)
  if (data.createUserAccount && !hasExistingUser) {
    await fetch('/api/auth/register', { ... });
  }
  
  // 3. Update existing user account (if has one)
  if (hasExistingUser && existingUser) {
    await fetch(`/api/users/${existingUser.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.userPassword, // Only if provided
        specialization: data.userSpecialization,
        department: data.userDepartment,
      }),
    });
  }
};
```

### 5. **Email Field Moved**
Similar to Add Employee form:
- ✅ Email removed from basic contact section
- ✅ Email now in User Account section only
- ✅ Shows only when user account exists or is being created

---

## 📊 قبل وبعد / Before & After

### قبل / Before:
```
تعديل الموظف
├─ الاسم الأول | اسم العائلة
├─ البريد الإلكتروني | الهاتف
├─ الدور | تاريخ التعيين
├─ الراتب | الحالة
└─ ملاحظات

❌ No user account management
❌ Cannot create/update login credentials
❌ Email always visible even if no user account
```

### بعد / After:
```
تعديل الموظف
├─ الاسم الأول | اسم العائلة
├─ الهاتف                    ← Email moved
├─ الدور | تاريخ التعيين
├─ الراتب | الحالة
├─ ملاحظات

└─ حساب المستخدم ✨ NEW
   ├─ If has account:
   │  ├─ لديه حساب مستخدم موجود
   │  ├─ البريد الإلكتروني *
   │  ├─ كلمة مرور جديدة (اختياري)
   │  ├─ التخصص (للأطباء)
   │  └─ القسم (للأطباء)
   │
   └─ If no account:
      ├─ ☐ إنشاء حساب دخول
      └─ When checked:
         ├─ البريد الإلكتروني *
         ├─ كلمة المرور *
         ├─ التخصص (للأطباء)
         └─ القسم (للأطباء)
```

---

## 🌐 الترجمات الجديدة / New Translations

Added translation keys:

| Key | English | العربية |
|-----|---------|---------|
| `staff.existing_user_account` | Has existing user account | لديه حساب مستخدم موجود |
| `staff.new_password` | New Password (Optional) | كلمة مرور جديدة (اختياري) |
| `staff.new_password_placeholder` | Enter new password to change | أدخل كلمة مرور جديدة للتغيير |
| `staff.new_password_hint` | Leave empty to keep current password | اتركه فارغًا للاحتفاظ بكلمة المرور الحالية |

---

## 🧪 اختبار / Testing

### Test 1: Update Employee WITH User Account
```bash
1. Go to الموظفون
2. Click Edit on "Dr. Omar Youssef" (has user account)
3. User Account section shows:
   ✅ "Has existing user account"
   ✅ Email field with current email
   ✅ New Password field (optional)
   ✅ Specialization field
   ✅ Department field
4. Change email to: newemail@cairodental.com
5. Leave password empty (keep current)
6. Update specialization
7. Save
8. ✅ Staff updated
9. ✅ User account updated
10. ✅ Email changed for login
11. ✅ Password unchanged
```

### Test 2: Change Password for Existing User
```bash
1. Edit employee with user account
2. Enter new password: "NewPass123"
3. Save
4. ✅ Password updated
5. Logout and login with new password
6. ✅ Can login with new credentials
```

### Test 3: Create User Account for Existing Employee
```bash
1. Edit employee WITHOUT user account (e.g., Hygienist)
2. User Account section shows checkbox
3. ✅ Check "إنشاء حساب دخول للنظام"
4. Fill:
   - Email: hygienist@cairodental.com
   - Password: Pass1234
5. Save
6. ✅ Staff updated
7. ✅ New user account created
8. ✅ Employee can now login
```

### Test 4: Password Validation
```bash
1. Edit employee with user account
2. Enter short password: "123"
3. Try to save
4. ✅ Validation error: "Password must be at least 8 characters"
5. Fix to: "Pass1234"
6. ✅ Saves successfully
```

### Test 5: Email Moved to User Account
```bash
1. Edit employee WITHOUT user account
2. ✅ Email field NOT in contact section
3. ✅ Email field NOT visible
4. Check "Create login account"
5. ✅ Email field appears in User Account section
```

---

## 📁 الملفات المعدلة / Modified Files

### 1. `src/components/staff/edit-employee-dialog.tsx`
**Major Changes:**
- ✅ Added imports: `Eye`, `EyeOff`, `Checkbox`
- ✅ Added state: `showPassword`, `hasExistingUser`, `existingUser`
- ✅ Added useEffect to fetch existing user account
- ✅ Updated form schema with user account fields
- ✅ Moved email field to User Account section
- ✅ Added conditional rendering for existing vs new user account
- ✅ Updated onSubmit to handle user account creation/update
- ✅ Added password field with show/hide toggle
- ✅ Added specialization and department fields

**Lines changed:** ~200+ lines

### 2. `src/contexts/LanguageContext.tsx`
**Added translations:**
- ✅ `staff.existing_user_account` (English + Arabic)
- ✅ `staff.new_password` (English + Arabic)
- ✅ `staff.new_password_placeholder` (English + Arabic)
- ✅ `staff.new_password_hint` (English + Arabic)

---

## ✅ الفوائد / Benefits

### 1. Unified Experience
- ✅ Same UX as Add Employee form
- ✅ Consistent email placement (in User Account section)
- ✅ Clear user account management

### 2. Flexibility
- ✅ Can update existing user accounts
- ✅ Can create new user accounts for existing staff
- ✅ Optional password change (keep current if empty)

### 3. Better Security
- ✅ Password show/hide toggle
- ✅ Password validation (min 8 characters)
- ✅ Clear hints for users

### 4. Smart Detection
- ✅ Automatically detects if staff has user account
- ✅ Shows appropriate UI (update vs create)
- ✅ Loads existing user data

### 5. Complete Management
- ✅ Edit staff details
- ✅ Edit user login credentials
- ✅ Change password
- ✅ Update email
- ✅ Update specialization/department

---

## 🔄 مقارنة مع إضافة موظف / Comparison with Add Employee

| Feature | إضافة موظف | تعديل الموظف |
|---------|-----------|-------------|
| Create user account | ✅ Yes (checkbox) | ✅ Yes (checkbox if no account) |
| Update user account | ❌ N/A | ✅ Yes (if has account) |
| Email in User Account section | ✅ Yes | ✅ Yes |
| Password field | ✅ Required | ✅ Optional (for update) |
| Show/hide password | ✅ Yes | ✅ Yes |
| Specialization | ✅ Yes | ✅ Yes |
| Department | ✅ Yes | ✅ Yes |
| Detect existing account | ❌ N/A | ✅ Yes |
| Change password | ❌ N/A | ✅ Yes |

---

## 🎯 استخدام / Usage

### Update Email:
```
1. تعديل الموظف → حساب المستخدم
2. Change email in البريد الإلكتروني field
3. Save
4. ✅ Login email updated
```

### Change Password:
```
1. تعديل الموظف → حساب المستخدم
2. Enter new password in كلمة مرور جديدة
3. Save
4. ✅ Password changed
```

### Create Account for Existing Staff:
```
1. تعديل الموظف → حساب المستخدم
2. ✅ Check "إنشاء حساب دخول"
3. Fill email + password
4. Save
5. ✅ User account created
```

### Keep Current Password:
```
1. تعديل الموظف → حساب المستخدم
2. Leave كلمة مرور جديدة empty
3. Save
4. ✅ Password unchanged
```

---

## ✅ الخلاصة / Summary

**What Was Added:**
- ✅ User Account section to Edit Employee form
- ✅ Automatic detection of existing user accounts
- ✅ Update existing user account (email, password, specialization, department)
- ✅ Create new user account for existing staff
- ✅ Optional password change (leave empty to keep current)
- ✅ Email field moved to User Account section
- ✅ Password show/hide toggle
- ✅ Proper validation and error handling
- ✅ 4 new translation keys (English + Arabic)

**Status:** ✅ Complete and ready to test!

---

🎉 **الآن يمكنك تعديل حسابات المستخدمين من نموذج تعديل الموظف!**  
🎉 **Now you can edit user accounts from Edit Employee form!**
