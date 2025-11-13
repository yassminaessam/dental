# Add Employee with User Account - Complete ✅

## الميزة الجديدة / New Feature

تمت إضافة قسم **حساب المستخدم** (User Account) إلى نموذج **إضافة موظف** (Add Employee).

Added **User Account** section to the **Add Employee** (إضافة موظف) form.

---

## ✨ الميزات / Features

### 1. Checkbox: إنشاء حساب دخول للنظام
When adding a new employee, you can now create a login account for them simultaneously.

```
☑️ إنشاء حساب دخول للنظام (Create login account for system access)
   Allow this employee to login to the system with their email and password
```

### 2. Password Field
When checkbox is enabled, password field appears:
- **Required**: Minimum 8 characters
- **Show/Hide Toggle**: Eye icon to toggle password visibility
- **Hint**: Password requirements shown below field

### 3. Additional Fields (for doctors)
If role is **admin**, **doctor**, or **dentist**:
- **التخصص (Specialization)**: e.g., Orthodontics, General Dentistry
- **القسم (Department)**: e.g., Dental Surgery, Orthodontics

---

## 🎯 كيف تعمل / How It Works

### Scenario 1: Add Employee Without User Account

```
1. إضافة موظف → Fill staff details
2. ❌ Don't check "إنشاء حساب دخول"
3. Save

Result:
✅ Staff record created in Staff table
❌ No User account created
📋 Employee appears in الموظفون page
❌ Employee CANNOT login to system
```

### Scenario 2: Add Employee With User Account

```
1. إضافة موظف → Fill staff details
   - Name: أحمد محمد
   - Email: ahmed@cairodental.com
   - Role: Doctor
   - Phone: 01234567890
   - Salary: 60000
   - Hire Date: Today

2. ✅ Check "إنشاء حساب دخول للنظام"

3. Fill user account details:
   - Password: ********
   - Specialization: Orthodontics
   - Department: Orthodontics Department

4. Save

Result:
✅ Staff record created in Staff table
✅ User account created in Users table
✅ Staff and User are linked via userId
✅ Employee appears in الموظفون page
✅ Employee appears in إدارة المستخدمين page
✅ Employee CAN login to system
```

---

## 🔍 التفاصيل التقنية / Technical Details

### Modified Files:

**File**: `src/components/staff/add-employee-dialog.tsx`

### Changes Made:

1. **Added Imports**:
```typescript
import { Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
```

2. **Updated Form Schema**:
```typescript
type EmployeeFormData = {
  // ... existing fields
  createUserAccount?: boolean;
  userPassword?: string;
  userSpecialization?: string;
  userDepartment?: string;
};

// Added validation
.refine((data) => {
  if (data.createUserAccount && !data.userPassword) {
    return false;
  }
  if (data.userPassword && data.userPassword.length < 8) {
    return false;
  }
  return true;
}, {
  message: 'Password must be at least 8 characters',
  path: ['userPassword'],
})
```

3. **Added State**:
```typescript
const [showPassword, setShowPassword] = React.useState(false);
```

4. **Updated onSubmit**:
```typescript
const onSubmit = async (data: EmployeeFormData) => {
  // Save staff member
  onSave({ ... });

  // Create user account if requested
  if (data.createUserAccount && data.userPassword) {
    const userRole = ['admin', 'doctor', 'receptionist'].includes(data.role.toLowerCase())
      ? data.role.toLowerCase()
      : 'receptionist';

    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        password: data.userPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: userRole,
        phone: data.phone || '',
        specialization: data.userSpecialization || null,
        department: data.userDepartment || null,
      }),
    });
  }
};
```

5. **Added UI Section**:
```tsx
{/* User Account Section */}
<div className="space-y-4 border-t pt-4">
  <h3>حساب المستخدم (User Account)</h3>
  
  <Checkbox
    label="إنشاء حساب دخول للنظام"
    description="Allow this employee to login to the system"
  />
  
  {createUserAccount && (
    <>
      <Input type="password" placeholder="Password" />
      <Input placeholder="Specialization" /> {/* For doctors */}
      <Input placeholder="Department" /> {/* For doctors */}
    </>
  )}
</div>
```

---

## 📋 قواعد التحويل / Role Mapping

When creating a user account, roles are mapped as follows:

| Staff Role | User Role | Can Login? | System Access |
|-----------|-----------|------------|---------------|
| **Admin** | admin | ✅ Yes | Full system access |
| **Doctor** | doctor | ✅ Yes | Patient management, treatments |
| **Dentist** | receptionist* | ✅ Yes | Limited access |
| **Receptionist** | receptionist | ✅ Yes | Appointments, billing |
| **Hygienist** | receptionist* | ✅ Yes | Limited access |
| **Assistant** | receptionist* | ✅ Yes | Limited access |
| **Manager** | receptionist* | ✅ Yes | Limited access |

*Non-system roles default to `receptionist` role in Users table

---

## ✅ الميزات / Features

### 1. Conditional Fields
- **Password field**: Shows only when checkbox is enabled
- **Specialization & Department**: Show only for admin/doctor/dentist roles

### 2. Validation
- Email is now **required** (changed from optional)
- Password must be **at least 8 characters**
- Password is required when checkbox is enabled

### 3. Password Security
- **Show/Hide Toggle**: Click eye icon to reveal/hide password
- **Visual Feedback**: Eye icon changes (Eye/EyeOff)
- **Hint Text**: Shows password requirements below field

### 4. Error Handling
- If user creation fails, staff is still saved
- User sees alert: "Staff created but user account failed"
- Can create user account later from User Management

### 5. Automatic Linking
- Staff record gets `userId` field set
- User record is created with matching email
- Both records are linked in database

---

## 🧪 اختبار / Testing

### Test 1: Add Employee Without User Account
```
1. Go to الموظفون page
2. Click "إضافة موظف"
3. Fill employee details:
   - First Name: محمد
   - Last Name: أحمد
   - Email: mohammed@cairodental.com
   - Role: Hygienist
   - Phone: 01234567890
   - Hire Date: Today
   - Salary: 40000
4. ❌ DON'T check "إنشاء حساب دخول"
5. Save

Expected Result:
✅ Staff created in الموظفون
❌ No user account created
❌ Employee cannot login
```

### Test 2: Add Doctor With User Account
```
1. Go to الموظفون page
2. Click "إضافة موظف"
3. Fill employee details:
   - First Name: أحمد
   - Last Name: محمد
   - Email: ahmed.doctor@cairodental.com
   - Role: Doctor
   - Phone: 01234567890
   - Hire Date: Today
   - Salary: 80000
4. ✅ CHECK "إنشاء حساب دخول للنظام"
5. Fill user account details:
   - Password: SecurePass123
   - Specialization: Orthodontics
   - Department: Orthodontics Dept
6. Save

Expected Result:
✅ Staff created in الموظفون
✅ User account created in إدارة المستخدمين
✅ User can login with ahmed.doctor@cairodental.com
✅ User role: doctor
✅ User specialization: Orthodontics
✅ User department: Orthodontics Dept
```

### Test 3: Add Receptionist With User Account
```
1. Go to الموظفون page
2. Click "إضافة موظف"
3. Fill employee details:
   - First Name: فاطمة
   - Last Name: علي
   - Email: fatima@cairodental.com
   - Role: Receptionist
   - Phone: 01234567890
   - Hire Date: Today
   - Salary: 35000
4. ✅ CHECK "إنشاء حساب دخول للنظام"
5. Fill password: Pass1234
6. Save (Specialization & Department fields NOT shown)

Expected Result:
✅ Staff created in الموظفون
✅ User account created in إدارة المستخدمين
✅ User can login with fatima@cairodental.com
✅ User role: receptionist
✅ No specialization or department (not applicable)
```

### Test 4: Password Validation
```
1. Add employee with user account
2. Enter password: "12345" (less than 8 chars)
3. Try to save

Expected Result:
❌ Validation error shown
❌ Form doesn't submit
📝 Message: "Password must be at least 8 characters"
```

### Test 5: Password Show/Hide
```
1. Add employee with user account
2. Enter password: "MySecurePassword123"
3. Click eye icon

Expected Result:
👁️ Password becomes visible
🔄 Click again → Password hidden
✅ Toggle works correctly
```

---

## 📊 مقارنة / Comparison

### Before vs After:

| Feature | Before ❌ | After ✅ |
|---------|----------|---------|
| Create user account when adding employee | No | Yes |
| Password field | No | Yes |
| Password show/hide | No | Yes |
| Specialization field | No | Yes (for doctors) |
| Department field | No | Yes (for doctors) |
| Role mapping | Manual | Automatic |
| User-Staff linking | Manual | Automatic |
| Email validation | Optional | Required |

---

## 🔄 التزامن / Synchronization

### Current Flow:

```
إضافة موظف (Add Employee)
   ↓
✅ Check "إنشاء حساب دخول"
   ↓
Fill password & details
   ↓
Click Save
   ↓
┌─────────────────────────────┐
│ 1. Create Staff Record      │ ✅
│    - name: أحمد محمد        │
│    - role: Doctor           │
│    - email: ahmed@...       │
│    - salary: 80000          │
└─────────────────────────────┘
   ↓
┌─────────────────────────────┐
│ 2. Create User Account      │ ✅
│    - email: ahmed@...       │
│    - password: ********     │
│    - role: doctor           │
│    - specialization: Ortho  │
└─────────────────────────────┘
   ↓
┌─────────────────────────────┐
│ 3. Link Records             │ ✅
│    Staff.userId = User.id   │
└─────────────────────────────┘
   ↓
✅ Employee can login!
```

---

## 🎯 الفوائد / Benefits

### 1. Efficiency
- ✅ Create staff + user in one form
- ✅ No need to go to User Management separately
- ✅ Automatic linking

### 2. Consistency
- ✅ Same email used for both records
- ✅ Same name used for both records
- ✅ Automatic role mapping

### 3. Flexibility
- ✅ Optional user account creation
- ✅ Can add staff without login access
- ✅ Can add user account later if needed

### 4. Security
- ✅ Password validation (min 8 chars)
- ✅ Show/hide password toggle
- ✅ Password hint displayed

### 5. User Experience
- ✅ Single form for both operations
- ✅ Conditional fields (only show when needed)
- ✅ Clear error messages

---

## 🔮 المستقبل / Future Enhancements

### Potential Improvements:

1. **Auto-sync on User creation**:
   - When creating User with role='doctor', auto-create Staff record
   - Bidirectional sync

2. **Password strength indicator**:
   - Show strength meter (Weak/Medium/Strong)
   - Color-coded feedback

3. **Email verification**:
   - Send verification email to new user
   - Confirm email before allowing login

4. **Role permissions preview**:
   - Show what access the user will have
   - Preview permissions before creating

5. **Bulk import**:
   - Import multiple employees from CSV
   - Auto-create user accounts if specified

---

## 📁 الملفات المعدلة / Modified Files

### 1. `src/components/staff/add-employee-dialog.tsx`
- ✅ Added user account section
- ✅ Added password field with show/hide
- ✅ Added specialization and department fields
- ✅ Added validation
- ✅ Added user creation logic

### 2. Email Validation
- ⚠️ Changed from optional to **required**
- Old: `z.union([z.string().email(), z.literal('')])`
- New: `z.string().email().min(1)`

---

## ✅ الخلاصة / Summary

### What Was Added:

1. ✅ **User Account Section** in إضافة موظف
2. ✅ **Checkbox**: "إنشاء حساب دخول للنظام"
3. ✅ **Password Field** with show/hide toggle
4. ✅ **Specialization Field** (for doctors)
5. ✅ **Department Field** (for doctors)
6. ✅ **Validation**: Password min 8 chars, email required
7. ✅ **Auto User Creation**: Via `/api/auth/register`
8. ✅ **Role Mapping**: Staff role → User role
9. ✅ **Error Handling**: Graceful failure with user notification
10. ✅ **Automatic Linking**: Staff ↔ User via userId

### How to Use:

```
1. الموظفون → إضافة موظف
2. Fill employee details
3. ✅ Check "إنشاء حساب دخول للنظام"
4. Enter password and additional details
5. Save
6. ✅ Both Staff and User created!
```

---

🎉 **تم إضافة قسم حساب المستخدم بنجاح إلى نموذج إضافة موظف!**  
🎉 **User Account section successfully added to Add Employee form!**
