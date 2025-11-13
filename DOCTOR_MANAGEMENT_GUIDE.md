# Doctor Management Guide / دليل إدارة الأطباء

## إضافة طبيب جديد / Adding a New Doctor

### طريقة 1: عبر واجهة إدارة المستخدمين (الطريقة الموصى بها)

1. قم بتسجيل الدخول كمسؤول (Admin)
2. انتقل إلى **إدارة المستخدمين** (User Management)
3. اضغط على زر **إضافة مستخدم جديد** (Add New User)
4. املأ النموذج:
   - **الاسم الأول** (First Name): اسم الطبيب الأول
   - **اسم العائلة** (Last Name): اسم عائلة الطبيب
   - **البريد الإلكتروني** (Email): البريد الإلكتروني للطبيب
   - **كلمة المرور** (Password): كلمة مرور آمنة
   - **الدور** (Role): اختر **Doctor** (طبيب)
   - **رقم الهاتف** (Phone): رقم هاتف الطبيب
   - **التخصص** (Specialization): تخصص الطبيب (مثال: تقويم الأسنان، علاج الجذور، طب الأسنان العام)
   - **رقم الترخيص** (License Number): رقم الترخيص الطبي (اختياري)
   - **القسم** (Department): القسم أو العيادة (اختياري)

5. اضغط على **حفظ** (Save)

### Method 1: Via User Management Interface (Recommended)

1. Login as Admin
2. Navigate to **إدارة المستخدمين** (User Management)
3. Click **إضافة مستخدم جديد** (Add New User)
4. Fill in the form:
   - **First Name**: Doctor's first name
   - **Last Name**: Doctor's last name
   - **Email**: Doctor's email address
   - **Password**: Secure password
   - **Role**: Select **Doctor**
   - **Phone**: Doctor's phone number
   - **Specialization**: Doctor's specialty (e.g., Orthodontics, Endodontics, General Dentistry)
   - **License Number**: Medical license number (optional)
   - **Department**: Department or clinic (optional)

5. Click **Save**

---

### طريقة 2: عبر سطر الأوامر / Method 2: Via Command Line Script

يمكنك استخدام السكريبت المخصص لإضافة طبيب جديد:

You can use the dedicated script to add a new doctor:

```bash
node scripts/add-doctor.js
```

سيطلب منك السكريبت إدخال المعلومات التالية:
The script will prompt you for the following information:

1. **First Name** (الاسم الأول)
2. **Last Name** (اسم العائلة)
3. **Email** (البريد الإلكتروني)
4. **Password** (كلمة المرور)
5. **Phone** (رقم الهاتف)
6. **Specialization** (التخصص)
7. **License Number** (رقم الترخيص) - اختياري
8. **Department** (القسم) - اختياري

مثال على التخصصات الشائعة / Common Specializations:
- **تقويم الأسنان** / Orthodontics
- **علاج الجذور** / Endodontics
- **جراحة الفم والوجه والفكين** / Oral & Maxillofacial Surgery
- **طب أسنان الأطفال** / Pediatric Dentistry
- **تجميل الأسنان** / Cosmetic Dentistry
- **طب الأسنان العام** / General Dentistry
- **أمراض اللثة** / Periodontics
- **التركيبات السنية** / Prosthodontics

---

## عرض الأطباء في النظام / Viewing Doctors in the System

### في نموذج جدولة المواعيد / In the Schedule Appointment Form

عند إضافة موعد جديد في صفحة **المواعيد**، ستظهر قائمة الأطباء في حقل **الطبيب** مع:
- اسم الطبيب الكامل
- التخصص (إن وجد)
- رقم الهاتف (إن وجد)

When adding a new appointment in the **المواعيد** (Appointments) page, the doctor dropdown will show:
- Full doctor name
- Specialization (if available)
- Phone number (if available)

### البحث الذكي / Smart Search

يمكنك البحث عن الطبيب بـ:
- الاسم
- التخصص
- رقم الهاتف

You can search for doctors by:
- Name
- Specialization
- Phone number

---

## تحديث بيانات طبيب موجود / Updating Existing Doctor Information

### عبر واجهة إدارة المستخدمين / Via User Management Interface

1. انتقل إلى **إدارة المستخدمين** (User Management)
2. ابحث عن الطبيب في القائمة
3. اضغط على زر **تعديل** (Edit) بجانب اسم الطبيب
4. قم بتحديث المعلومات المطلوبة:
   - التخصص (Specialization)
   - رقم الهاتف (Phone)
   - رقم الترخيص (License Number)
   - القسم (Department)
5. اضغط على **حفظ التغييرات** (Save Changes)

1. Navigate to **إدارة المستخدمين** (User Management)
2. Search for the doctor in the list
3. Click the **Edit** button next to the doctor's name
4. Update the required information:
   - Specialization
   - Phone
   - License Number
   - Department
5. Click **Save Changes**

---

## الصلاحيات الافتراضية للأطباء / Default Doctor Permissions

عند إضافة طبيب جديد، يتم منحه الصلاحيات التالية تلقائياً:

When adding a new doctor, they are automatically granted the following permissions:

✅ **عرض وتعديل** (View & Edit):
- المرضى (Patients)
- المواعيد (Appointments)
- العلاجات (Treatments)
- السجلات الطبية (Medical Records)
- مخطط الأسنان (Dental Chart)

✅ **عرض فقط** (View Only):
- الفواتير (Billing)
- المخزون (Inventory)
- البيانات الخاصة (Own Data)

❌ **غير مسموح** (Not Allowed):
- إدارة الموظفين (Staff Management)
- إدارة المستخدمين (User Management)
- حذف السجلات (Deleting Records)

---

## استكشاف الأخطاء / Troubleshooting

### المشكلة: لا تظهر الأطباء في القائمة المنسدلة
**Problem: Doctors not showing in dropdown**

✅ **الحلول / Solutions:**

1. **تحقق من دور المستخدم** / Check User Role:
   - تأكد أن الدور = `doctor` في إدارة المستخدمين
   - Make sure Role = `doctor` in User Management

2. **تحقق من حالة النشاط** / Check Active Status:
   - تأكد أن المستخدم نشط (isActive = true)
   - Make sure user is active (isActive = true)

3. **أعد تحميل الصفحة** / Refresh the Page:
   - قم بتحديث الصفحة (F5)
   - Refresh the page (F5)

4. **تحقق من قاعدة البيانات** / Check Database:
   ```bash
   # افحص الأطباء في قاعدة البيانات
   # Check doctors in database
   node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.user.findMany({where: {role: 'doctor'}}).then(d => console.log(d)).finally(() => p.$disconnect())"
   ```

---

## أمثلة على البيانات / Data Examples

### مثال لطبيب تقويم أسنان / Orthodontist Example:
```
First Name: أحمد / Ahmed
Last Name: محمد / Mohamed
Email: ahmed.mohamed@clinic.com
Phone: +201234567890
Specialization: تقويم الأسنان / Orthodontics
License Number: DDS-12345
Department: قسم التقويم / Orthodontics Department
```

### مثال لطبيب أسنان عام / General Dentist Example:
```
First Name: سارة / Sara
Last Name: علي / Ali
Email: sara.ali@clinic.com
Phone: +201098765432
Specialization: طب الأسنان العام / General Dentistry
License Number: DDS-67890
Department: العيادة العامة / General Clinic
```

---

## ملاحظات هامة / Important Notes

⚠️ **أمان كلمات المرور** / Password Security:
- استخدم كلمة مرور قوية (8 أحرف على الأقل)
- امزج بين الأحرف الكبيرة والصغيرة والأرقام
- Use strong passwords (at least 8 characters)
- Mix uppercase, lowercase, and numbers

⚠️ **البريد الإلكتروني الفريد** / Unique Email:
- كل طبيب يجب أن يكون له بريد إلكتروني فريد
- لا يمكن استخدام نفس البريد الإلكتروني لأكثر من مستخدم
- Each doctor must have a unique email
- Cannot use the same email for multiple users

✅ **أفضل الممارسات** / Best Practices:
- أضف التخصص لتسهيل البحث والتنظيم
- حافظ على تحديث معلومات الاتصال
- راجع الصلاحيات بانتظام
- Add specialization for easier search and organization
- Keep contact information updated
- Review permissions regularly
