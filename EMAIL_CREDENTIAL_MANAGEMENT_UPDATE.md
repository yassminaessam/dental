# Email Field Moved to User Account Section + Credential Management

## Summary
Moved the email field from "Personal Information" to "User Account" section in both Add and Edit Patient dialogs. Additionally, enhanced Edit Patient dialog to display and allow updating of user credentials (email and password) for patients who already have accounts.

## ✅ Changes Made

### 1. Add Patient Dialog - Email Moved

**Before**:
```
Personal Information:
├─ First Name *
├─ Last Name *
├─ Email          ← Was here
├─ Phone *
└─ Date of Birth *

User Account:
└─ [Create User Account checkbox]
    └─ Password *
```

**After**:
```
Personal Information:
├─ First Name *
├─ Last Name *
├─ Phone *
└─ Date of Birth *

User Account:
└─ [Create User Account checkbox]
    ├─ Email *        ← Moved here!
    └─ Password *
```

**Why**: Email is only needed when creating a user account for patient portal access.

### 2. Edit Patient Dialog - Email Moved + Credential Management

**Scenario A: Patient WITHOUT User Account**
```
Personal Information:
├─ First Name *
├─ Last Name *
├─ Phone *
└─ Date of Birth *

User Account:
└─ [Create User Account checkbox]
    ├─ Email *        ← Appears when checked
    └─ Password *     ← Appears when checked
```

**Scenario B: Patient WITH Existing Account**
```
Personal Information:
├─ First Name *
├─ Last Name *
├─ Phone *
└─ Date of Birth *

User Account:
├─ ✓ This patient already has a user account (green notice)
├─ Email *           ← Can UPDATE email
└─ New Password      ← Can UPDATE password (optional)
    └─ Leave blank to keep current password
```

## 🎯 Key Features

### Add Patient Dialog

#### 1. Email Only Shows When Needed
- ✅ Email field appears **only when** "Create User Account" is checked
- ✅ Email is **required** when creating account
- ✅ No email field cluttering personal information

#### 2. Logical Grouping
```
┌────────────────────────────────────────┐
│ User Account                           │
├────────────────────────────────────────┤
│ ☑️ Create User Account                 │
│    Patient can access patient portal  │
│                                        │
│ Email *                                │
│ ┌────────────────────────────────────┐ │
│ │ patient@example.com                │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Password *                             │
│ ┌────────────────────────────────────┐ │
│ │ ••••••••••••                    👁️ │ │
│ └────────────────────────────────────┘ │
│ ℹ️ Minimum 8 characters required       │
└────────────────────────────────────────┘
```

### Edit Patient Dialog

#### 1. Smart Credential Display

**For Patients WITHOUT Account**:
- Shows "Create User Account" checkbox
- Email & Password appear when checked (same as Add Patient)

**For Patients WITH Account**:
- Shows green notice: "✓ This patient already has a user account"
- **Always shows** Email field (can update)
- **Always shows** Password field (optional update)
- Password placeholder: "Leave blank to keep current password"

#### 2. Password Update Flexibility

```
┌────────────────────────────────────────┐
│ User Account                           │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ ✓ This patient already has a user  │ │
│ │   account                          │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Email *                                │
│ ┌────────────────────────────────────┐ │
│ │ patient@example.com                │ │
│ └────────────────────────────────────┘ │
│                                        │
│ New Password                           │
│ ┌────────────────────────────────────┐ │
│ │ Leave blank to keep current...  👁️ │ │
│ └────────────────────────────────────┘ │
│ ℹ️ Leave blank to keep current password│
│    or enter new password (min 8 chars) │
└────────────────────────────────────────┘
```

## 🔧 Technical Implementation

### Add Patient Dialog Changes

**File**: `/src/components/dashboard/add-patient-dialog.tsx`

**What Changed**:
1. ❌ **Removed** email field from Personal Information section
2. ✅ **Added** email field inside User Account section
3. ✅ Email only appears when `createUserAccount` is checked
4. ✅ Email wrapped in same conditional as password field

**Code Structure**:
```typescript
{form.watch('createUserAccount') && (
  <>
    {/* Email Field */}
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('patients.email')} *</FormLabel>
          <FormControl>
            <Input type="email" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    
    {/* Password Field */}
    <FormField
      control={form.control}
      name="userPassword"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('patients.user_password')} *</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                {...field}
                className="h-10 pr-10"
              />
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
)}
```

### Edit Patient Dialog Changes

**File**: `/src/components/patients/edit-patient-dialog.tsx`

**What Changed**:
1. ❌ **Removed** email field from Personal Information section
2. ✅ **Added** email field inside User Account section
3. ✅ Email always shows when account exists OR checkbox is checked
4. ✅ Password label changes: "Password" vs "New Password"
5. ✅ Password placeholder changes based on account status
6. ✅ Password hint changes based on account status
7. ✅ Green notice moved inside User Account section

**Code Structure**:
```typescript
<div className="border-t pt-4">
  <h3>{t('patients.user_account')}</h3>
  <div className="space-y-4">
    {/* Checkbox only for patients WITHOUT account */}
    {!hasUserAccount && (
      <FormField name="createUserAccount">
        {/* Create User Account checkbox */}
      </FormField>
    )}
    
    {/* Green notice for patients WITH account */}
    {hasUserAccount && (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-4">
        <p className="text-sm text-green-800">
          ✓ {t('patients.user_account_exists')}
        </p>
      </div>
    )}
    
    {/* Email & Password fields show when account exists OR checkbox checked */}
    {(hasUserAccount || form.watch('createUserAccount')) && (
      <>
        <FormField name="email">
          {/* Email field */}
        </FormField>
        
        <FormField name="userPassword">
          <FormLabel>
            {hasUserAccount 
              ? t('patients.new_password')     // "New Password"
              : t('patients.user_password')    // "Password *"
            }
            {!hasUserAccount && '*'}
          </FormLabel>
          <Input 
            placeholder={hasUserAccount 
              ? t('patients.new_password_placeholder')    // "Leave blank..."
              : t('patients.user_password_placeholder')   // "Enter password..."
            }
          />
          <p className="text-xs text-muted-foreground">
            {hasUserAccount 
              ? t('patients.password_update_hint')        // "Leave blank or enter new..."
              : t('patients.password_requirements')       // "Minimum 8 characters"
            }
          </p>
        </FormField>
      </>
    )}
  </div>
</div>
```

## 🌐 New Translations Added

### English Translations

**Location**: `/src/contexts/LanguageContext.tsx` (en section)

```typescript
'patients.new_password': 'New Password',
'patients.new_password_placeholder': 'Leave blank to keep current password',
'patients.password_update_hint': 'Leave blank to keep current password, or enter new password (min 8 characters)',
```

### Arabic Translations (العربية)

**Location**: `/src/contexts/LanguageContext.tsx` (ar section)

```typescript
'patients.new_password': 'كلمة مرور جديدة',
'patients.new_password_placeholder': 'اتركه فارغًا للاحتفاظ بكلمة المرور الحالية',
'patients.password_update_hint': 'اتركه فارغًا للاحتفاظ بكلمة المرور الحالية، أو أدخل كلمة مرور جديدة (8 أحرف على الأقل)',
```

## 📱 User Experience Flows

### Flow 1: Add New Patient WITH User Account

**Admin Actions**:
1. Click "Add Patient" (إضافة مريض)
2. Fill First Name: "أحمد"
3. Fill Last Name: "محمد"
4. Fill Phone: "+20123456789"
5. Select Date of Birth
6. Fill Address (optional)
7. Scroll down to "User Account" section
8. Check ☑️ "Create User Account"
9. **Email field appears** → Enter: "ahmed@example.com"
10. **Password field appears** → Enter password
11. Click eye icon to verify password
12. Click "Add Patient"
13. ✅ Patient created with user account!

### Flow 2: Add New Patient WITHOUT User Account

**Admin Actions**:
1. Click "Add Patient"
2. Fill personal information
3. Scroll to "User Account" section
4. **Leave checkbox unchecked** ☐
5. No email or password fields appear
6. Click "Add Patient"
7. ✅ Patient created without user account

### Flow 3: Edit Patient - Update Credentials

**Admin Actions**:
1. Click "Edit" on patient "فاطمة علي"
2. Patient already has account
3. Scroll to "User Account" section
4. See green notice: "✓ This patient already has a user account"
5. **Email field shown** with current email
6. Change email: "fatima.ali.new@example.com"
7. **Password field shown** with placeholder "Leave blank to keep current password"
8. **Option 1**: Leave password blank → keeps current password
9. **Option 2**: Enter new password → updates password
10. Click "Save Changes"
11. ✅ Credentials updated!

### Flow 4: Edit Patient - Create Account

**Admin Actions**:
1. Click "Edit" on patient "عمر سالم"
2. Patient has NO account
3. Scroll to "User Account" section
4. Check ☑️ "Create User Account"
5. Email field appears → Enter email
6. Password field appears → Enter password
7. Click "Save Changes"
8. ✅ User account created!

## 🎨 Visual Comparison

### Add Patient - Before vs After

#### Before:
```
┌─────────────────────────────────────┐
│ Personal Information                │
├─────────────────────────────────────┤
│ First Name *   [____________]       │
│ Last Name *    [____________]       │
│ Email          [____________] ← Was here
│ Phone *        [____________]       │
│ DOB *          [____________]       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ User Account                        │
├─────────────────────────────────────┤
│ ☐ Create User Account               │
└─────────────────────────────────────┘
```

#### After:
```
┌─────────────────────────────────────┐
│ Personal Information                │
├─────────────────────────────────────┤
│ First Name *   [____________]       │
│ Last Name *    [____________]       │
│ Phone *        [____________]       │
│ DOB *          [____________]       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ User Account                        │
├─────────────────────────────────────┤
│ ☑️ Create User Account              │
│                                     │
│ Email *        [____________] ← Here!
│ Password *     [____________] 👁️   │
└─────────────────────────────────────┘
```

### Edit Patient - Before vs After

#### Before (Patient WITH Account):
```
┌─────────────────────────────────────┐
│ Personal Information                │
├─────────────────────────────────────┤
│ First Name *   [Ahmed______]        │
│ Last Name *    [Mohamed____]        │
│ Email          [ahmed@ex___] ← Was here
│ Phone *        [+201234____]        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ This patient already has account  │
└─────────────────────────────────────┘
(No way to update credentials!)
```

#### After (Patient WITH Account):
```
┌─────────────────────────────────────┐
│ Personal Information                │
├─────────────────────────────────────┤
│ First Name *   [Ahmed______]        │
│ Last Name *    [Mohamed____]        │
│ Phone *        [+201234____]        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ User Account                        │
├─────────────────────────────────────┤
│ ✓ This patient already has account  │
│                                     │
│ Email *        [ahmed@ex___] ← Update!
│ New Password   [Leave blank ] 👁️   │
│ ℹ️ Leave blank to keep current      │
└─────────────────────────────────────┘
```

## ✅ Benefits

### For Admins
✅ **Cleaner UI** - Email only shows when relevant
✅ **Logical Grouping** - Credentials grouped together
✅ **Update Flexibility** - Can update email and password anytime
✅ **Optional Password Update** - Don't need to re-enter password every time
✅ **Clear Instructions** - Placeholder tells what to do
✅ **Consistent Experience** - Same flow in Add and Edit dialogs

### For System
✅ **Data Integrity** - Email required only for user accounts
✅ **Security** - Password can be updated when needed
✅ **Flexibility** - Support both scenarios (with/without account)
✅ **No Breaking Changes** - Existing patients unaffected

### For UX
✅ **Progressive Disclosure** - Fields appear only when needed
✅ **Clear Feedback** - Green notice shows account exists
✅ **Smart Labeling** - "Password" vs "New Password"
✅ **Helpful Hints** - "Leave blank to keep current..."
✅ **Bilingual** - Full English and Arabic support

## 🔄 Complete Feature Matrix

| Feature | Add Patient | Edit Patient (No Account) | Edit Patient (Has Account) |
|---------|-------------|---------------------------|----------------------------|
| Email in Personal Info | ❌ No | ❌ No | ❌ No |
| Email in User Account | ✅ Yes (conditional) | ✅ Yes (conditional) | ✅ Yes (always) |
| Create Account Checkbox | ✅ Yes | ✅ Yes | ❌ No |
| Green Notice | ❌ No | ❌ No | ✅ Yes |
| Password Field | ✅ "Password *" | ✅ "Password *" | ✅ "New Password" |
| Password Required | ✅ Yes | ✅ Yes | ❌ No (optional) |
| Password Placeholder | "Enter password..." | "Enter password..." | "Leave blank..." |
| Password Hint | "Min 8 characters" | "Min 8 characters" | "Leave blank or enter new" |
| Eye Icon Toggle | ✅ Yes | ✅ Yes | ✅ Yes |
| Email Required | ✅ Yes | ✅ Yes | ✅ Yes |

## 🧪 Testing Scenarios

### Test 1: Add Patient Without Account
1. Open Add Patient dialog
2. Don't check "Create User Account"
3. Verify email field does NOT appear
4. Verify password field does NOT appear
5. Save patient
6. Verify patient created without account

### Test 2: Add Patient With Account
1. Open Add Patient dialog
2. Check "Create User Account"
3. Verify email field appears
4. Verify password field appears
5. Try to submit without email → should fail
6. Try to submit without password → should fail
7. Enter valid email and password
8. Save patient
9. Verify patient created with account

### Test 3: Edit Patient - No Account, Create One
1. Open Edit dialog for patient without account
2. Verify green notice does NOT appear
3. Check "Create User Account"
4. Verify email and password fields appear
5. Enter credentials
6. Save
7. Verify account created

### Test 4: Edit Patient - Has Account, Update Email
1. Open Edit dialog for patient with account
2. Verify green notice appears
3. Verify email field shows current email
4. Change email
5. Leave password blank
6. Save
7. Verify email updated, password unchanged

### Test 5: Edit Patient - Has Account, Update Password
1. Open Edit dialog for patient with account
2. Leave email unchanged
3. Enter new password in "New Password" field
4. Use eye icon to verify password
5. Save
6. Verify password updated

### Test 6: Edit Patient - Has Account, Update Both
1. Open Edit dialog for patient with account
2. Change email
3. Enter new password
4. Save
5. Verify both email and password updated

### Test 7: Arabic Language
1. Switch to Arabic (العربية)
2. Test all above scenarios
3. Verify RTL layout correct
4. Verify translations correct
5. Verify eye icon positioned correctly

## 📝 Files Modified

1. **`/src/components/dashboard/add-patient-dialog.tsx`**
   - Removed email field from Personal Information grid
   - Added email field inside User Account conditional section
   - Email now appears only when createUserAccount is checked

2. **`/src/components/patients/edit-patient-dialog.tsx`**
   - Removed email field from Personal Information grid
   - Added email field inside User Account section
   - Email always shows when account exists or checkbox checked
   - Changed password label conditionally (Password vs New Password)
   - Changed password placeholder conditionally
   - Changed password hint conditionally
   - Moved green notice inside User Account section

3. **`/src/contexts/LanguageContext.tsx`**
   - Added 3 English translations for password updates
   - Added 3 Arabic translations for password updates

## 🎯 Result

### What Changed:
1. ✅ **Email moved** from Personal Info to User Account section
2. ✅ **Conditional display** - Email only when needed
3. ✅ **Credential management** - Can update email and password in Edit dialog
4. ✅ **Smart labeling** - Different labels for create vs update
5. ✅ **Flexible password** - Optional when updating, required when creating
6. ✅ **Clear instructions** - Helpful placeholders and hints

### Admin Can Now:
- ✅ Add patients **without** worrying about email if no account needed
- ✅ Add patients **with** account and provide credentials together
- ✅ **Update email** for existing patient accounts
- ✅ **Update password** for existing patient accounts
- ✅ **Keep current password** when only updating email
- ✅ See **clear feedback** about account status

Perfect! Email is now logically grouped with user account credentials! 🎉
