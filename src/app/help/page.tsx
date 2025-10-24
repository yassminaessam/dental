'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const router = useRouter();
  const [activeId, setActiveId] = React.useState<string>('quickstart');
  const [query, setQuery] = React.useState('');
  const [showTop, setShowTop] = React.useState(false);

  const handlePrint = () => typeof window !== 'undefined' && window.print();

  type SectionData = {
    id: string;
    title: string;
    type: 'list' | 'ordered';
    items: string[];
    screenshot?: string;
    caption?: string;
    keywords?: string[];
  };

  const sections: SectionData[] = [
    {
      id: 'quickstart',
      title: 'البدء السريع',
      type: 'ordered',
      items: [
        'سجّل الدخول بحساب الأدمن أو أنشئ حساب أدمن من صفحة إنشاء الأدمن.',
        'اختر اللغة المفضلة (عربي/إنجليزي) من شريط التطبيق.',
        'ابدأ بإضافة الموظفين والموردين، ثم أضف المرضى والمواعيد.'
      ],
      screenshot: '/help/screenshot-login.svg',
      caption: 'شكل توضيحي: شاشة تسجيل الدخول (صورة نموذجية).',
      keywords: ['تسجيل', 'لغة', 'أدمن']
    },
    {
      id: 'patients', title: 'المرضى', type: 'list',
      items: [
        'إضافة مريض: الاسم الأول، اسم العائلة، الهاتف، تاريخ الميلاد (البريد الإلكتروني اختياري).',
        'تحرير بيانات المريض وعرض الملف والتاريخ المرضي والتأمين.'
      ], screenshot: '/help/screenshot-patients.svg', caption: 'قائمة المرضى وإضافة مريض جديد.'
    },
    { id: 'appointments', title: 'المواعيد', type: 'list', items: ['إنشاء موعد للمريض وتخصيص الطبيب والوقت.', 'تعديل/إلغاء الموعد وإرسال تذكيرات.'], screenshot: '/help/screenshot-appointments.svg', caption: 'الجدول الزمني للمواعيد.' },
    { id: 'treatments', title: 'العلاجات', type: 'list', items: ['بدء خطة علاج وإضافة إجراءات لكل سن.', 'تحديث حالة العلاج وربط الفاتورة.'], screenshot: '/help/screenshot-treatments.svg', caption: 'إدارة الإجراءات العلاجية.' },
    { id: 'billing', title: 'الفوترة والمالية', type: 'list', items: ['إنشاء فاتورة من العلاجات أو من شاشة الفوترة.', 'تسجيل المدفوعات (كامل/جزئي) وطريقة الدفع.'], screenshot: '/help/screenshot-billing.svg', caption: 'إنشاء فاتورة وتحصيل المدفوعات.' },
    { id: 'insurance', title: 'التأمين', type: 'list', items: ['إضافة مزوّد وربط المريض بالوثيقة.', 'إنشاء مطالبات ومتابعة حالتها.'], screenshot: '/help/screenshot-insurance.svg', caption: 'إدارة مزوّدي التأمين والمطالبات.' },
    { id: 'inventory', title: 'المخزون', type: 'list', items: ['إضافة الأصناف وتحديد الحد الأدنى.', 'تسجّل الحركات واستلم تنبيهات النقص.'], screenshot: '/help/screenshot-inventory.svg', caption: 'مراقبة المخزون وطلبات الشراء.' },
    { id: 'pharmacy', title: 'الصيدلية', type: 'list', items: ['إصدار وصفة بمعلومات الجرعة والمدة.', 'صرف الدواء وتسجيل الكميات المصروفة.'], screenshot: '/help/screenshot-pharmacy.svg', caption: 'الوصفات وصرف الأدوية.' },
    { id: 'referrals', title: 'التحويلات', type: 'list', items: ['إضافة أخصائيين واستصدار تحويل من ملف المريض.', 'إرفاق مستندات/صور إن لزم.'], screenshot: '/help/screenshot-referrals.svg', caption: 'إدارة التحويلات للأخصائيين.' },
    { id: 'communications', title: 'الاتصالات', type: 'list', items: ['إرسال تذكيرات وتعليمات ما بعد العلاج.', 'استخدام القوالب الجاهزة لتسريع العمل.'], screenshot: '/help/screenshot-communications.svg', caption: 'التواصل مع المرضى.' },
    { id: 'staff', title: 'الموظفون', type: 'list', items: ['إضافة موظف (البريد الإلكتروني اختياري)، تحديد الدور وتاريخ التعيين.', 'تعديل الحالة والملاحظات.'], screenshot: '/help/screenshot-staff.svg', caption: 'إدارة الموظفين والأدوار.' },
    { id: 'suppliers', title: 'الموردون', type: 'list', items: ['إضافة/تحرير مورد، وربط الأصناف لسهولة إعادة الطلب.'], screenshot: '/help/screenshot-suppliers.svg', caption: 'الموردون وربطهم بالمخزون.' },
    { id: 'analytics', title: 'التقارير والتحليلات', type: 'list', items: ['عرض الإيرادات والزيارات والأداء بحسب الطبيب والفترة.', 'التصفية والتصدير عند الحاجة.'], screenshot: '/help/screenshot-analytics.svg', caption: 'لوحة التحليلات ونظرة الأداء.' },
    { id: 'settings', title: 'الإعدادات', type: 'list', items: ['الهوية البصرية، اللغة/الاتجاه، والتكاملات.'], screenshot: '/help/screenshot-settings.svg', caption: 'إعدادات النظام واللغة.' },
    { id: 'permissions', title: 'الصلاحيات', type: 'list', items: ['تحديث صلاحيات الأدمن والأدوار (طبيب/استقبال/مدير...).'], screenshot: '/help/screenshot-permissions.svg', caption: 'التحكم في الأذونات حسب الدور.' },
    { id: 'portal', title: 'بوابة المريض', type: 'list', items: ['اطلاع المريض على مواعيده وفواتيره وربما حجز المواعيد.'], screenshot: '/help/screenshot-portal.svg', caption: 'تجربة بوابة المريض.' },
    { id: 'notes', title: 'ملاحظات عملية', type: 'list', items: ['الحقول المطلوبة مميزة بنجمة. البريد الإلكتروني اختياري في أغلب النماذج (لا يشمل تسجيل الدخول).', 'استخدم البحث والتصفية للجداول الكبيرة.', 'عند ظهور رسالة خطأ، راجع الحقل المظلل أو المحتوى المفقود.'] }
  ];

  const filtered = query.trim()
    ? sections.filter(s =>
        s.title.includes(query) ||
        s.items.some(i => i.includes(query)) ||
        (s.keywords || []).some(k => k.includes(query))
      )
    : sections;

  // Scroll spy
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -70% 0px', threshold: [0, 0.25, 0.5] }
    );
    filtered.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [filtered]);

  React.useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className={cn('container mx-auto py-8 xl:max-w-6xl', 'rtl')} dir="rtl">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-60 lg:shrink-0 print:hidden">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h1 className="text-2xl font-bold">دليل المساعدة</h1>
          </div>
          <div className="flex gap-2 mb-4">
            <Button size="sm" variant="ghost" onClick={() => router.back()} aria-label="رجوع" className="flex-1">رجوع</Button>
            <Button asChild size="sm" variant="secondary" aria-label="العودة للتطبيق" className="flex-1">
              <Link href="/">التطبيق</Link>
            </Button>
          </div>
            <Button size="sm" onClick={handlePrint} variant="outline" className="w-full mb-4">طباعة / PDF</Button>
          <div className="relative mb-4">
            <input
              placeholder="بحث..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >✕</button>
            )}
          </div>
          <nav className="border rounded-lg p-4 bg-card max-h-[70vh] overflow-y-auto sticky top-4">
            <h2 className="font-semibold mb-3 text-sm">جدول المحتويات</h2>
            <ol className="space-y-1 text-sm">
              {filtered.map(s => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={cn('block rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground transition-colors',
                      activeId === s.id && 'bg-accent text-accent-foreground font-medium')}
                  >{s.title}</a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
        {/* Content */}
        <main className="flex-1 min-w-0">
          <p className="text-muted-foreground mb-8 leading-relaxed text-sm md:text-base">
            هذا الدليل يشرح كيفية استخدام النظام خطوة بخطوة من البداية للنهاية. استخدم البحث لتصفية الأقسام، ويمكن حفظ الصفحة كـ PDF.
          </p>
          <div className="space-y-12">
            {filtered.map(section => (
              <HelpSection key={section.id} data={section} />
            ))}
          </div>
        </main>
      </div>

      {showTop && (
        <Button onClick={scrollToTop} size="sm" className="fixed bottom-6 left-6 shadow-lg print:hidden" variant="secondary">
          ↑ أعلى
        </Button>
      )}
    </div>
  );
}

function HelpSection({ data }: { data: { id: string; title: string; type: 'list' | 'ordered'; items: string[]; screenshot?: string; caption?: string } }) {
  return (
    <section id={data.id} className="scroll-mt-24">
      <header className="mb-3 flex items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{data.title}</h2>
        <div className="h-px flex-1 bg-border" />
      </header>
      {data.type === 'ordered' ? (
        <ol className="list-decimal list-inside space-y-1 text-sm md:text-base mb-4">
          {data.items.map((i, idx) => <li key={idx}>{i}</li>)}
        </ol>
      ) : (
        <ul className="list-disc list-inside space-y-1 text-sm md:text-base mb-4">
          {data.items.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      )}
      {data.screenshot && (
        <figure className="rounded-lg border bg-card/60 backdrop-blur p-3 shadow-sm">
          <Image src={data.screenshot} alt={data.caption || data.title} width={1200} height={640} className="w-full h-auto rounded" />
          {data.caption && <figcaption className="text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed">{data.caption}</figcaption>}
        </figure>
      )}
    </section>
  );
}

// Print adjustments via inline global style (could move to CSS module if needed)
if (typeof window !== 'undefined') {
  const id = 'help-print-styles';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `@media print { body { background:white; } nav, aside, button, input, .print\:hidden { display:none !important; } section { page-break-inside:avoid; } figure { page-break-inside:avoid; } }`;
    document.head.appendChild(style);
  }
}
