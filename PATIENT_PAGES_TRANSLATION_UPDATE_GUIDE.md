# Patient Pages Translation Update Guide

## Status

### ✅ Completed
1. **PatientLayout (Sidebar)** - All navigation items translated
2. **patient-appointments** - Page fully translated
3. **patient-messages** - Page fully translated

### ⏳ Remaining Pages to Update
4. **patient-records** 
5. **patient-billing**
6. **patient-profile**
7. **patient-settings**
8. **patient-home**

---

## Quick Update Pattern

For each remaining page, follow this pattern:

### Step 1: Add useLanguage hook
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export default function PageName() {
  const { t } = useLanguage();
  // ... rest of component
}
```

### Step 2: Replace hardcoded text with t() function

---

## patient-records Page

### Translations Needed:
```typescript
// Page title
<h1>{t('patient_pages.records.title')}</h1> // "Medical Records" / "السجلات الطبية"
<p>{t('patient_pages.records.subtitle')}</p> // subtitle

// Section headers
<h2>{t('patient_pages.records.documents')}</h2> // "Documents" / "المستندات"
<h2>{t('patient_pages.records.clinical_images')}</h2> // "Clinical Images" / "الصور السريرية"

// Buttons
<Button>{t('patient_pages.records.view')}</Button> // "View" / "عرض"
<Button>{t('patient_pages.records.download')}</Button> // "Download" / "تحميل"
<Button>{t('patient_pages.records.view_image')}</Button> // "View Image" / "عرض الصورة"

// Record types
{type === 'Treatment Plan' && t('patient_pages.records.treatment_plan')}
{type === 'X-Ray' && t('patient_pages.records.xray')}
{type === 'Clinical Note' && t('patient_pages.records.clinical_note')}
{type === 'Lab Result' && t('patient_pages.records.lab_result')}
```

---

## patient-billing Page

### Translations Needed:
```typescript
// Page title
<h1>{t('patient_pages.billing.title')}</h1> // "Billing" / "الفواتير"
<p>{t('patient_pages.billing.subtitle')}</p>

// Summary cards
<CardDescription>{t('patient_pages.billing.outstanding_balance')}</CardDescription>
<CardDescription>{t('patient_pages.billing.total_paid')}</CardDescription>
<CardDescription>{t('patient_pages.billing.insurance_coverage')}</CardDescription>

// Buttons
<Button>{t('patient_pages.billing.pay_now')}</Button> // "Pay Now" / "ادفع الآن"
<Button>{t('patient_pages.billing.download')}</Button> // "Download" / "تحميل"
<Button>{t('patient_pages.billing.pay')}</Button> // "Pay" / "دفع"

// Labels
{t('patient_pages.billing.invoices')} // "Invoices" / "الفواتير"
{t('patient_pages.billing.payment_history')} // "Payment History" / "سجل الدفع"
{t('patient_pages.billing.invoice_date')} // "Invoice Date" / "تاريخ الفاتورة"
{t('patient_pages.billing.due')} // "Due" / "مستحق"
{t('patient_pages.billing.paid')} // "Paid" / "مدفوع"
{t('patient_pages.billing.pending')} // "Pending" / "قيد الانتظار"
{t('patient_pages.billing.receipt')} // "Receipt" / "إيصال"
{t('patient_pages.billing.active')} // "Active" / "نشط"
```

---

## patient-profile Page

### Translations Needed:
```typescript
// Page title
<h1>{t('patient_pages.profile.title')}</h1> // "My Profile" / "ملفي الشخصي"
<p>{t('patient_pages.profile.subtitle')}</p>

// Profile section
<CardTitle>{t('patient_pages.profile.picture')}</CardTitle> // "Profile Picture"
<Button>{t('patient_pages.profile.change_photo')}</Button> // "Change Photo"

// Notifications
<CardTitle>{t('patient_pages.profile.notifications')}</CardTitle>
<Label>{t('patient_pages.profile.email_notifications')}</Label>
<Label>{t('patient_pages.profile.sms_notifications')}</Label>
<Label>{t('patient_pages.profile.appointment_reminders')}</Label>

// Personal Information
<CardTitle>{t('patient_pages.profile.personal_info')}</CardTitle>
<CardDescription>{t('patient_pages.profile.update_details')}</CardDescription>
<Label>{t('patient_pages.profile.first_name')}</Label>
<Label>{t('patient_pages.profile.last_name')}</Label>
<Label>{t('patient_pages.profile.email')}</Label>
<Label>{t('patient_pages.profile.phone')}</Label>
<Label>{t('patient_pages.profile.dob')}</Label>
<Label>{t('patient_pages.profile.gender')}</Label>
<option>{t('patient_pages.profile.male')}</option>
<option>{t('patient_pages.profile.female')}</option>
<option>{t('patient_pages.profile.other')}</option>
<Label>{t('patient_pages.profile.address')}</Label>
<Textarea placeholder={t('patient_pages.profile.address_placeholder')} />
<Button>{t('patient_pages.profile.save_changes')}</Button>

// Emergency Contact
<CardTitle>{t('patient_pages.profile.emergency_contact')}</CardTitle>
<CardDescription>{t('patient_pages.profile.emergency_info')}</CardDescription>
<Label>{t('patient_pages.profile.contact_name')}</Label>
<Input placeholder={t('patient_pages.profile.contact_name_placeholder')} />
<Label>{t('patient_pages.profile.relationship')}</Label>
<Input placeholder={t('patient_pages.profile.relationship_placeholder')} />
<Label>{t('patient_pages.profile.emergency_phone')}</Label>
<Label>{t('patient_pages.profile.emergency_email')}</Label>
<Button>{t('patient_pages.profile.save_emergency')}</Button>

// Insurance
<CardTitle>{t('patient_pages.profile.insurance_info')}</CardTitle>
<CardDescription>{t('patient_pages.profile.insurance_details')}</CardDescription>
<Label>{t('patient_pages.profile.insurance_provider')}</Label>
<Input placeholder={t('patient_pages.profile.provider_placeholder')} />
<Label>{t('patient_pages.profile.policy_number')}</Label>
<Input placeholder={t('patient_pages.profile.policy_placeholder')} />
<Label>{t('patient_pages.profile.group_number')}</Label>
<Input placeholder={t('patient_pages.profile.group_placeholder')} />
<Label>{t('patient_pages.profile.policy_holder')}</Label>
<Input placeholder={t('patient_pages.profile.holder_placeholder')} />
<Button>{t('patient_pages.profile.update_insurance')}</Button>

// Security
<CardTitle>{t('patient_pages.profile.security')}</CardTitle>
<CardDescription>{t('patient_pages.profile.change_password')}</CardDescription>
<Label>{t('patient_pages.profile.current_password')}</Label>
<Label>{t('patient_pages.profile.new_password')}</Label>
<Label>{t('patient_pages.profile.confirm_password')}</Label>
<Button>{t('patient_pages.profile.save_changes')}</Button>
```

---

## patient-settings Page

### Translations Needed:
```typescript
// Page title
<h1>{t('patient_pages.settings.title')}</h1> // "Settings" / "الإعدادات"
<p>{t('patient_pages.settings.subtitle')}</p>

// Notifications Section
<CardTitle>{t('patient_pages.settings.notifications')}</CardTitle>
<CardDescription>{t('patient_pages.settings.notifications_desc')}</CardDescription>
<Label>{t('patient_pages.settings.email_notifications')}</Label>
<p>{t('patient_pages.settings.email_desc')}</p>
<Label>{t('patient_pages.settings.sms_notifications')}</Label>
<p>{t('patient_pages.settings.sms_desc')}</p>
<Label>{t('patient_pages.settings.appointment_reminders')}</Label>
<p>{t('patient_pages.settings.reminders_desc')}</p>
<Label>{t('patient_pages.settings.promotional_emails')}</Label>
<p>{t('patient_pages.settings.promotional_desc')}</p>

// Language & Region
<CardTitle>{t('patient_pages.settings.language_region')}</CardTitle>
<CardDescription>{t('patient_pages.settings.language_desc')}</CardDescription>
<Label>{t('patient_pages.settings.language')}</Label>
<option value="en">{t('patient_pages.settings.english')}</option>
<option value="ar">{t('patient_pages.settings.arabic')}</option>
<Label>{t('patient_pages.settings.timezone')}</Label>
<option>{t('patient_pages.settings.egypt_time')}</option>
<option>{t('patient_pages.settings.utc')}</option>

// Appearance
<CardTitle>{t('patient_pages.settings.appearance')}</CardTitle>
<CardDescription>{t('patient_pages.settings.appearance_desc')}</CardDescription>
<Label>{t('patient_pages.settings.dark_mode')}</Label>
<p>{t('patient_pages.settings.dark_mode_desc')}</p>

// Privacy & Security
<CardTitle>{t('patient_pages.settings.privacy_security')}</CardTitle>
<CardDescription>{t('patient_pages.settings.privacy_desc')}</CardDescription>
<Label>{t('patient_pages.settings.share_data')}</Label>
<p>{t('patient_pages.settings.share_desc')}</p>
<Label>{t('patient_pages.settings.two_factor')}</Label>
<p>{t('patient_pages.settings.two_factor_desc')}</p>
<Button>{t('patient_pages.settings.enable')}</Button>

// Save button
<Button>{t('patient_pages.settings.save_all')}</Button>
```

---

## patient-home Page

### Translations Needed:
```typescript
// Welcome message
<h1>{t('patient_pages.home.welcome')} {user?.firstName} 👋</h1>
<p>{t('patient_pages.home.dashboard_desc')}</p>

// Quick Actions
// Book Appointment button
<div className="font-semibold">{t('patient_pages.home.book_appointment')}</div>
// Send Message button
<div className="font-semibold">{t('patient_pages.home.send_message')}</div>
<div className="text-sm text-gray-600">{t('patient_pages.home.contact_team')}</div>
// View Records button
<div className="font-semibold">{t('patient_pages.home.view_records')}</div>
<div className="text-sm text-gray-600">{t('patient_pages.home.access_history')}</div>

// Special Offers Section
<h2>{t('patient_pages.home.special_offers')}</h2>
<Button>{t('patient_pages.home.view_all_offers')}</Button>
<div className="bg-primary text-white">{t('patient_pages.home.featured_offer')}</div>
<span>{t('patient_pages.home.valid_until')}:</span>
<span>{t('patient_pages.home.promo_code')}:</span>
<Button>{t('patient_pages.home.book_save')}</Button>

// Appointments
<CardTitle>{t('patient_pages.home.upcoming_appointments')}</CardTitle>
<Button>{t('patient_pages.appointments.view_all')}</Button>

// Health Stats
<CardTitle>{t('patient_pages.home.dental_health')}</CardTitle>
<span>{t('patient_pages.home.last_visit')}</span>
<span>{t('patient_pages.home.next_cleaning')}</span>
<span>{t('patient_pages.home.outstanding_balance')}</span>
<span>{t('patient_pages.home.insurance_status')}</span>
<Badge>{t('patient_pages.billing.active')}</Badge>
<Button>{t('patient_pages.home.view_billing')}</Button>

// Messages
<CardTitle>{t('patient_pages.home.recent_messages')}</CardTitle>
<Button>{t('patient_pages.home.view_all_messages')}</Button>

// Health Tips
<h2>{t('patient_pages.home.health_tips')}</h2>
<CardTitle>{t('patient_pages.home.daily_care')}</CardTitle>
<p>{t('patient_pages.home.daily_care_desc')}</p>
<Button>{t('patient_pages.home.read_more')}</Button>

<CardTitle>{t('patient_pages.home.nutrition')}</CardTitle>
<p>{t('patient_pages.home.nutrition_desc')}</p>
<Button>{t('patient_pages.home.learn_more')}</Button>

<CardTitle>{t('patient_pages.home.preventive_care')}</CardTitle>
<p>{t('patient_pages.home.preventive_desc')}</p>
<Button>{t('patient_pages.home.find_out_more')}</Button>
```

---

## Quick Implementation Steps

For each page:

1. **Import useLanguage at top**:
   ```typescript
   import { useLanguage } from '@/contexts/LanguageContext';
   ```

2. **Add hook in component**:
   ```typescript
   const { t } = useLanguage();
   ```

3. **Replace all hardcoded English text** with `t('translation.key')`

4. **Test in both languages** by clicking the EN/AR toggle

---

## Testing Checklist

After updating each page:
- [ ] Page loads without errors
- [ ] All text appears in English
- [ ] Click AR button - all text changes to Arabic
- [ ] Click EN button - text changes back to English
- [ ] RTL layout works correctly in Arabic
- [ ] No missing translations (check console for warnings)
- [ ] All buttons show translated text
- [ ] All form labels are translated
- [ ] All placeholders are translated

---

## Translation Key Reference

All translation keys are already added to `src/contexts/LanguageContext.tsx`:
- Lines 1393-1563: English translations (173 keys)
- Lines 3489-3659: Arabic translations (173 keys)

---

## Priority Order

1. **High Priority**: patient-billing, patient-profile (most used)
2. **Medium Priority**: patient-records, patient-settings
3. **Lower Priority**: patient-home (already has most content)

---

## Estimated Time

- Per page: 10-15 minutes
- Total remaining: ~1 hour for all 5 pages

---

## Common Patterns

### Button with Icon
```typescript
<Button>
  <Icon className="h-4 w-4 mr-2" />
  {t('key')}
</Button>
```

### Card Title
```typescript
<CardTitle>{t('key')}</CardTitle>
<CardDescription>{t('key_desc')}</CardDescription>
```

### Form Label
```typescript
<Label htmlFor="field">{t('key')}</Label>
<Input placeholder={t('key_placeholder')} />
```

### Conditional Text
```typescript
{status === 'Active' ? t('patient_pages.billing.active') : status}
```

---

## Notes

- All translation keys follow the pattern: `patient_pages.{page}.{element}`
- English keys match Arabic keys exactly
- RTL layout is automatically handled by the LanguageContext
- No changes needed to CSS or layout - only text replacement

---

## Completion

Once all pages are updated:
1. Test each page in both languages
2. Check for any console errors
3. Verify RTL layout works correctly
4. Document any issues found
5. Create a final testing report

---

**Status**: 3/8 pages completed (37.5%)  
**Remaining**: 5 pages to update
