'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const router = useRouter();
  // Print to PDF via browser print dialog
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className={cn('container mx-auto max-w-4xl py-8', 'rtl')}
         dir="rtl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">دليل المساعدة</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()} aria-label="رجوع">رجوع</Button>
          <Button asChild variant="secondary" aria-label="العودة للتطبيق">
            <Link href="/">العودة للتطبيق</Link>
          </Button>
          <Button onClick={handlePrint} variant="outline">طباعة / حفظ كملف PDF</Button>
        </div>
      </div>

      <p className="text-muted-foreground mb-6">
        هذا الدليل يشرح كيفية استخدام النظام خطوة بخطوة من البداية للنهاية. يمكن حفظ الصفحة كـ PDF عن طريق زر الطباعة.
      </p>

      <nav className="mb-8 border rounded-lg p-4 bg-card">
        <h2 className="font-semibold mb-3">جدول المحتويات</h2>
        <ol className="list-decimal list-inside grid gap-1">
          <li><a href="#quickstart" className="hover:underline">البدء السريع</a></li>
          <li><a href="#patients" className="hover:underline">المرضى</a></li>
          <li><a href="#appointments" className="hover:underline">المواعيد</a></li>
          <li><a href="#treatments" className="hover:underline">العلاجات</a></li>
          <li><a href="#billing" className="hover:underline">الفوترة والمالية</a></li>
          <li><a href="#insurance" className="hover:underline">التأمين</a></li>
          <li><a href="#inventory" className="hover:underline">المخزون</a></li>
          <li><a href="#pharmacy" className="hover:underline">الصيدلية</a></li>
          <li><a href="#referrals" className="hover:underline">التحويلات</a></li>
          <li><a href="#communications" className="hover:underline">الاتصالات</a></li>
          <li><a href="#staff" className="hover:underline">الموظفون</a></li>
          <li><a href="#suppliers" className="hover:underline">الموردون</a></li>
          <li><a href="#analytics" className="hover:underline">التقارير والتحليلات</a></li>
          <li><a href="#settings" className="hover:underline">الإعدادات</a></li>
          <li><a href="#permissions" className="hover:underline">الصلاحيات</a></li>
          <li><a href="#portal" className="hover:underline">بوابة المريض</a></li>
          <li><a href="#notes" className="hover:underline">ملاحظات عملية</a></li>
        </ol>
      </nav>

      <section id="quickstart" className="space-y-3 mb-10">
        <h2 className="text-xl font-semibold">البدء السريع</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>سجّل الدخول بحساب الأدمن أو أنشئ حساب أدمن من صفحة إنشاء الأدمن.</li>
          <li>اختر اللغة المفضلة (عربي/إنجليزي) من شريط التطبيق.</li>
          <li>ابدأ بإضافة الموظفين والموردين، ثم أضف المرضى والمواعيد.</li>
        </ol>
        <div className="rounded-lg border bg-card p-3">
          <Image src="/help/screenshot-login.svg" alt="شاشة الدخول" width={1024} height={560} className="w-full h-auto" />
          <p className="text-sm text-muted-foreground mt-2">شكل توضيحي: شاشة تسجيل الدخول (صورة نموذجية).</p>
        </div>
      </section>

      <SectionWithShot id="patients" title="المرضى">
        <ul className="list-disc list-inside space-y-1">
          <li>إضافة مريض: الاسم الأول، اسم العائلة، الهاتف، تاريخ الميلاد (البريد الإلكتروني اختياري).</li>
          <li>تحرير بيانات المريض وعرض الملف والتاريخ المرضي والتأمين.</li>
        </ul>
        <Shot path="/help/screenshot-patients.svg" caption="قائمة المرضى وإضافة مريض جديد." />
      </SectionWithShot>

      <SectionWithShot id="appointments" title="المواعيد">
        <ul className="list-disc list-inside space-y-1">
          <li>إنشاء موعد للمريض وتخصيص الطبيب والوقت.</li>
          <li>تعديل/إلغاء الموعد وإرسال تذكيرات.</li>
        </ul>
        <Shot path="/help/screenshot-appointments.svg" caption="الجدول الزمني للمواعيد." />
      </SectionWithShot>

      <SectionWithShot id="treatments" title="العلاجات">
        <ul className="list-disc list-inside space-y-1">
          <li>بدء خطة علاج وإضافة إجراءات لكل سن.</li>
          <li>تحديث حالة العلاج وربط الفاتورة.</li>
        </ul>
        <Shot path="/help/screenshot-treatments.svg" caption="إدارة الإجراءات العلاجية." />
      </SectionWithShot>

      <SectionWithShot id="billing" title="الفوترة والمالية">
        <ul className="list-disc list-inside space-y-1">
          <li>إنشاء فاتورة من العلاجات أو من شاشة الفوترة.</li>
          <li>تسجيل المدفوعات (كامل/جزئي) وطريقة الدفع.</li>
        </ul>
        <Shot path="/help/screenshot-billing.svg" caption="إنشاء فاتورة وتحصيل المدفوعات." />
      </SectionWithShot>

      <SectionWithShot id="insurance" title="التأمين">
        <ul className="list-disc list-inside space-y-1">
          <li>إضافة مزوّد وربط المريض بالوثيقة.</li>
          <li>إنشاء مطالبات ومتابعة حالتها.</li>
        </ul>
        <Shot path="/help/screenshot-insurance.svg" caption="إدارة مزوّدي التأمين والمطالبات." />
      </SectionWithShot>

      <SectionWithShot id="inventory" title="المخزون">
        <ul className="list-disc list-inside space-y-1">
          <li>إضافة الأصناف وتحديد الحد الأدنى.</li>
          <li>تسجّل الحركات واستلم تنبيهات النقص.</li>
        </ul>
        <Shot path="/help/screenshot-inventory.svg" caption="مراقبة المخزون وطلبات الشراء." />
      </SectionWithShot>

      <SectionWithShot id="pharmacy" title="الصيدلية">
        <ul className="list-disc list-inside space-y-1">
          <li>إصدار وصفة بمعلومات الجرعة والمدة.</li>
          <li>صرف الدواء وتسجيل الكميات المصروفة.</li>
        </ul>
        <Shot path="/help/screenshot-pharmacy.svg" caption="الوصفات وصرف الأدوية." />
      </SectionWithShot>

      <SectionWithShot id="referrals" title="التحويلات">
        <ul className="list-disc list-inside space-y-1">
          <li>إضافة أخصائيين واستصدار تحويل من ملف المريض.</li>
          <li>إرفاق مستندات/صور إن لزم.</li>
        </ul>
        <Shot path="/help/screenshot-referrals.svg" caption="إدارة التحويلات للأخصائيين." />
      </SectionWithShot>

      <SectionWithShot id="communications" title="الاتصالات">
        <ul className="list-disc list-inside space-y-1">
          <li>إرسال تذكيرات وتعليمات ما بعد العلاج.</li>
          <li>استخدام القوالب الجاهزة لتسريع العمل.</li>
        </ul>
        <Shot path="/help/screenshot-communications.svg" caption="التواصل مع المرضى." />
      </SectionWithShot>

      <SectionWithShot id="staff" title="الموظفون">
        <ul className="list-disc list-inside space-y-1">
          <li>إضافة موظف (البريد الإلكتروني اختياري)، تحديد الدور وتاريخ التعيين.</li>
          <li>تعديل الحالة والملاحظات.</li>
        </ul>
        <Shot path="/help/screenshot-staff.svg" caption="إدارة الموظفين والأدوار." />
      </SectionWithShot>

      <SectionWithShot id="suppliers" title="الموردون">
        <ul className="list-disc list-inside space-y-1">
          <li>إضافة/تحرير مورد، وربط الأصناف لسهولة إعادة الطلب.</li>
        </ul>
        <Shot path="/help/screenshot-suppliers.svg" caption="الموردون وربطهم بالمخزون." />
      </SectionWithShot>

      <SectionWithShot id="analytics" title="التقارير والتحليلات">
        <ul className="list-disc list-inside space-y-1">
          <li>عرض الإيرادات والزيارات والأداء بحسب الطبيب والفترة.</li>
          <li>التصفية والتصدير عند الحاجة.</li>
        </ul>
        <Shot path="/help/screenshot-analytics.svg" caption="لوحة التحليلات ونظرة الأداء." />
      </SectionWithShot>

      <SectionWithShot id="settings" title="الإعدادات">
        <ul className="list-disc list-inside space-y-1">
          <li>الهوية البصرية، اللغة/الاتجاه، والتكاملات.</li>
        </ul>
        <Shot path="/help/screenshot-settings.svg" caption="إعدادات النظام واللغة." />
      </SectionWithShot>

      <SectionWithShot id="permissions" title="الصلاحيات">
        <ul className="list-disc list-inside space-y-1">
          <li>تحديث صلاحيات الأدمن والأدوار (طبيب/استقبال/مدير...).</li>
        </ul>
        <Shot path="/help/screenshot-permissions.svg" caption="التحكم في الأذونات حسب الدور." />
      </SectionWithShot>

      <SectionWithShot id="portal" title="بوابة المريض">
        <ul className="list-disc list-inside space-y-1">
          <li>اطلاع المريض على مواعيده وفواتيره وربما حجز المواعيد.</li>
        </ul>
        <Shot path="/help/screenshot-portal.svg" caption="تجربة بوابة المريض." />
      </SectionWithShot>

      <section id="notes" className="space-y-2 mt-10">
        <h2 className="text-xl font-semibold">ملاحظات عملية</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>الحقول المطلوبة مميزة بنجمة. البريد الإلكتروني اختياري في أغلب النماذج (لا يشمل تسجيل الدخول).</li>
          <li>استخدم البحث والتصفية للجداول الكبيرة.</li>
          <li>عند ظهور رسالة خطأ، راجع الحقل المظلل أو المحتوى المفقود.</li>
        </ul>
      </section>
    </div>
  );
}

function SectionWithShot({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}

function Shot({ path, caption }: { path: string; caption: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <Image src={path} alt={caption} width={1200} height={640} className="w-full h-auto" />
      <p className="text-sm text-muted-foreground mt-2">{caption}</p>
    </div>
  );
}
