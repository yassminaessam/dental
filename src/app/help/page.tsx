'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardShell from "@/components/layout/DashboardLayout";
import { 
  Search, 
  BookOpen, 
  ArrowLeft, 
  Printer, 
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Zap,
  Users,
  Calendar,
  DollarSign,
  Package,
  Settings,
  Shield,
  BarChart,
  ArrowUp,
  Sparkles,
  HeadphonesIcon,
  LifeBuoy,
  Clock,
  CheckCircle2
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HelpPage() {
  const router = useRouter();
  const { isRTL } = useLanguage();
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
    
    // Use requestAnimationFrame to ensure DOM is ready
    const observeElements = () => {
      filtered.forEach(s => {
        const el = document.getElementById(s.id);
        if (el && el instanceof Element) {
          observer.observe(el);
        }
      });
    };
    
    // Small delay to ensure elements are rendered
    const timeoutId = setTimeout(observeElements, 100);
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [filtered]);

  React.useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Stats for help center
  const helpStats = React.useMemo(() => {
    return [
      { 
        title: 'الأقسام الشاملة', 
        value: sections.length, 
        description: 'أدلة تفصيلية لكل ميزة',
        icon: 'BookOpen'
      },
      { 
        title: 'دعم فوري', 
        value: '24/7', 
        description: 'متاح طوال الأسبوع',
        icon: 'HeadphonesIcon'
      },
      { 
        title: 'وقت الاستجابة', 
        value: '< 1h', 
        description: 'رد سريع على استفساراتك',
        icon: 'Clock'
      },
      { 
        title: 'معدل الحل', 
        value: '98%', 
        description: 'حل المشكلات من أول مرة',
        icon: 'CheckCircle2'
      },
    ];
  }, [sections.length]);

  return (
    <DashboardShell>
      <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto relative" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-cyan-200/10 dark:from-blue-900/15 dark:via-purple-900/10 dark:to-cyan-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/30 via-teal-200/20 to-blue-200/10 dark:from-cyan-900/15 dark:via-teal-900/10 dark:to-blue-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Header Section - Similar to Pharmacy Page */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* Left side: Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-xl">
                    <LifeBuoy className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    المساعدة والتواصل
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    مركز الدعم الفني والأدلة الشاملة
                  </p>
                </div>
              </div>

              {/* Right side: Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handlePrint}
                  variant="outline"
                  className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 print:hidden"
                >
                  <Printer className="h-4 w-4" />
                  <span>طباعة</span>
                </Button>
                <Button 
                  onClick={() => router.push('/')}
                  variant="default"
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <LifeBuoy className="h-4 w-4" />
                  <span>التطبيق</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Like Pharmacy Page */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {helpStats.map((stat, index) => {
            const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-orange', 'metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl transition-all duration-500 hover:scale-105",
                  cardStyle
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <CardIcon 
                    variant={(['blue', 'green', 'orange', 'purple'] as const)[index % 4]}
                    aria-hidden="true"
                  >
                    {index === 0 && <BookOpen className="h-5 w-5" />}
                    {index === 1 && <HelpCircle className="h-5 w-5" />}
                    {index === 2 && <Users className="h-5 w-5" />}
                    {index === 3 && <HeadphonesIcon className="h-5 w-5" />}
                  </CardIcon>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search Bar Section */}
        <Card className="border-2 border-muted shadow-lg">
          <CardContent className="p-6">
            {/* Ultra Enhanced Search Bar */}
            <div className="max-w-3xl mx-auto relative group/search">
              {/* Multiple glow layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-pink-500/40 rounded-2xl blur-2xl opacity-0 group-hover/search:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 rounded-2xl blur-xl opacity-0 group-hover/search:opacity-100 transition-opacity duration-700 delay-100"></div>
              
              <div className="relative flex items-center bg-background/80 backdrop-blur-sm border-2 border-muted hover:border-blue-300 dark:hover:border-blue-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                <Search className="absolute right-4 h-5 w-5 text-muted-foreground group-hover/search:text-blue-500 transition-colors duration-300" />
                <input
                  placeholder="ابحث في الأدلة والأسئلة..."
                  className="w-full rounded-xl bg-transparent px-12 py-4 text-sm md:text-base focus:outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute left-4 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="text-lg">✕</span>
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ultra Enhanced Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {/* Card 1: Quick Start */}
          <Card className="group relative border-2 border-muted hover:border-blue-300 dark:hover:border-blue-800 shadow-xl hover:shadow-3xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-blue-50/30 to-purple-50/20 dark:via-blue-950/20 dark:to-purple-950/10 hover:scale-[1.08] hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/15 rounded-full blur-2xl group-hover:scale-[2] transition-transform duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/10 to-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <CardHeader className="relative z-10 pb-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <Zap className="h-7 w-7" />
                </div>
                <span className="text-xs font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">مجاني</span>
              </div>
              <CardTitle className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">البدء السريع</CardTitle>
              <CardDescription className="text-sm md:text-base font-medium">تعلم الأساسيات في 5 دقائق فقط</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <a href="#quickstart" className="inline-flex items-center gap-2 text-sm md:text-base text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold group-hover:gap-3 transition-all duration-300">
                <span>ابدأ الآن</span>
                <span className="text-xl">→</span>
              </a>
            </CardContent>
          </Card>

          {/* Card 2: Detailed Guides */}
          <Card className="group relative border-2 border-muted hover:border-purple-300 dark:hover:border-purple-800 shadow-xl hover:shadow-3xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-purple-50/30 to-pink-50/20 dark:via-purple-950/20 dark:to-pink-950/10 hover:scale-[1.08] hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/15 rounded-full blur-2xl group-hover:scale-[2] transition-transform duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tl from-fuchsia-500/10 to-purple-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <CardHeader className="relative z-10 pb-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <FileText className="h-7 w-7" />
                </div>
                <span className="text-xs font-bold text-purple-500 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">16 قسم</span>
              </div>
              <CardTitle className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">الأدلة التفصيلية</CardTitle>
              <CardDescription className="text-sm md:text-base font-medium">شروحات مصورة لكل ميزة</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <a href="#patients" className="inline-flex items-center gap-2 text-sm md:text-base text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold group-hover:gap-3 transition-all duration-300">
                <span>استكشف الأدلة</span>
                <span className="text-xl">→</span>
              </a>
            </CardContent>
          </Card>

          {/* Card 3: Technical Support */}
          <Card className="group relative border-2 border-muted hover:border-green-300 dark:hover:border-green-800 shadow-xl hover:shadow-3xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-green-50/30 to-teal-50/20 dark:via-green-950/20 dark:to-teal-950/10 hover:scale-[1.08] hover:-translate-y-2">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/20 to-teal-500/15 rounded-full blur-2xl group-hover:scale-[2] transition-transform duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/10 to-green-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <CardHeader className="relative z-10 pb-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-green-500 via-green-600 to-teal-600 text-white shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <span className="text-xs font-bold text-green-500 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full animate-pulse">متاح</span>
              </div>
              <CardTitle className="text-xl md:text-2xl font-black bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 bg-clip-text text-transparent">الدعم الفني</CardTitle>
              <CardDescription className="text-sm md:text-base font-medium">فريق الدعم جاهز لمساعدتك</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3">
              <a href="mailto:support@cairodental.com" className="flex items-center gap-3 text-sm md:text-base text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold transition-all duration-300 hover:gap-4 group/link">
                <Mail className="h-5 w-5 group-hover/link:scale-110 transition-transform" />
                <span>البريد الإلكتروني</span>
              </a>
              <a href="tel:+20123456789" className="flex items-center gap-3 text-sm md:text-base text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold transition-all duration-300 hover:gap-4 group/link">
                <Phone className="h-5 w-5 group-hover/link:scale-110 transition-transform" />
                <span>اتصل بنا مباشرة</span>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="border-2 border-muted shadow-xl bg-gradient-to-br from-background via-amber-50/20 to-orange-50/10 dark:via-amber-950/10 dark:to-orange-950/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                  الأسئلة الشائعة
                </CardTitle>
                <CardDescription className="text-sm">إجابات سريعة لأكثر الأسئلة تكرارًا</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full space-y-3">
              <AccordionItem value="faq-1" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  كيف أبدأ استخدام النظام؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  ابدأ بتسجيل الدخول كأدمن، ثم أضف الموظفين والموردين الأساسيين. بعدها يمكنك البدء بإضافة المرضى وحجز المواعيد.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  هل البريد الإلكتروني مطلوب لإضافة مريض؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  لا، البريد الإلكتروني اختياري في معظم النماذج. يمكنك إضافة مريض فقط بالاسم ورقم الهاتف وتاريخ الميلاد.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  كيف أدير المخزون والمشتريات؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  من صفحة المخزون يمكنك إضافة الأصناف وتحديد الحد الأدنى. سيرسل النظام تنبيهات تلقائية عند نفاد الكمية. يمكنك إنشاء طلبات شراء وربطها بالموردين.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  هل يمكن تغيير اللغة؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  نعم، يمكنك التبديل بين العربية والإنجليزية من شريط التطبيق العلوي أو من صفحة الإعدادات.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  كيف أتواصل مع الدعم الفني؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  يمكنك التواصل عبر البريد الإلكتروني: support@cairodental.com أو الاتصال المباشر على +20123456789. فريق الدعم متاح 24/7.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-6" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  هل يمكن للمريض الوصول لحسابه؟
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  نعم، من خلال بوابة المريض يمكنه عرض مواعيده، فواتيره، وربما حجز مواعيد جديدة حسب الإعدادات.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 lg:shrink-0 print:hidden">
            <nav className="sticky top-4 border-2 border-muted rounded-2xl p-6 bg-gradient-to-br from-background/95 via-background/98 to-background/95 backdrop-blur-xl shadow-xl max-h-[calc(100vh-6rem)] overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                  <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="font-bold text-lg">جدول المحتويات</h2>
              </div>
              <ol className="space-y-2 text-sm">
                {filtered.map(s => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={cn(
                        'group block rounded-xl px-4 py-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30 hover:shadow-md hover:scale-105',
                        activeId === s.id && 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg scale-105'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn(
                          "inline-block w-1.5 h-1.5 rounded-full transition-all duration-300",
                          activeId === s.id ? "bg-white" : "bg-blue-500 group-hover:bg-purple-500"
                        )}></span>
                        {s.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="space-y-8">
              {filtered.map(section => (
                <HelpSection key={section.id} data={section} />
              ))}
            </div>
          </main>
        </div>

        {/* Contact Section - Below content */}
        <Card className="border-2 border-muted shadow-2xl bg-gradient-to-br from-green-50/50 via-teal-50/30 to-cyan-50/20 dark:from-green-950/20 dark:via-teal-950/10 dark:to-cyan-950/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-teal-500/5 to-cyan-500/5 backdrop-blur-3xl"></div>
          <CardHeader className="relative z-10 text-center pb-4">
            <div className="mx-auto mb-6 w-fit">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-green-500 via-teal-500 to-cyan-500 text-white shadow-2xl">
                  <MessageCircle className="h-10 w-10" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 dark:from-green-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              لم تجد ما تبحث عنه؟
            </CardTitle>
            <CardDescription className="text-base md:text-lg font-medium">
              فريق الدعم الفني جاهز لمساعدتك على مدار الساعة
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Email Support */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative border-2 border-muted hover:border-blue-300 dark:hover:border-blue-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="mx-auto w-fit p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-colors">
                      <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">البريد الإلكتروني</h3>
                      <p className="text-sm text-muted-foreground mb-4">نرد خلال ساعة واحدة</p>
                      <a 
                        href="mailto:support@cairodental.com" 
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold text-sm transition-all duration-300 hover:gap-3"
                      >
                        <span>support@cairodental.com</span>
                        <span className="text-xl">→</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Phone Support */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative border-2 border-muted hover:border-green-300 dark:hover:border-green-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="mx-auto w-fit p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-teal-500/10 group-hover:from-green-500/20 group-hover:to-teal-500/20 transition-colors">
                      <Phone className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">اتصل بنا</h3>
                      <p className="text-sm text-muted-foreground mb-4">دعم فوري 24/7</p>
                      <a 
                        href="tel:+20123456789" 
                        className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold text-sm transition-all duration-300 hover:gap-3"
                      >
                        <span>+20 123 456 789</span>
                        <span className="text-xl">→</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Chat Support */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <Card className="relative border-2 border-muted hover:border-purple-300 dark:hover:border-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="mx-auto w-fit p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors">
                      <HeadphonesIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">المحادثة المباشرة</h3>
                      <p className="text-sm text-muted-foreground mb-4">تحدث مع خبير الآن</p>
                      <Button 
                        variant="outline"
                        className="gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 group-hover:scale-105"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>ابدأ المحادثة</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Additional Help Resources */}
            <div className="mt-8 pt-8 border-t-2 border-muted">
              <div className="text-center space-y-4">
                <h4 className="font-bold text-xl">موارد إضافية</h4>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="outline" className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                    <FileText className="h-4 w-4" />
                    <span>دليل المستخدم PDF</span>
                  </Button>
                  <Button variant="outline" className="gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/30">
                    <BookOpen className="h-4 w-4" />
                    <span>فيديوهات تعليمية</span>
                  </Button>
                  <Button variant="outline" className="gap-2 hover:bg-green-50 dark:hover:bg-green-950/30">
                    <Users className="h-4 w-4" />
                    <span>مجتمع المستخدمين</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scroll to Top Button */}
        {showTop && (
          <Button 
            onClick={scrollToTop} 
            size="lg"
            className="fixed bottom-8 left-8 shadow-2xl print:hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 group z-50"
          >
            <ArrowUp className="h-5 w-5 group-hover:-translate-y-1 transition-transform duration-300" />
          </Button>
        )}
      </main>
    </DashboardShell>
  );
}

function HelpSection({ data }: { data: { id: string; title: string; type: 'list' | 'ordered'; items: string[]; screenshot?: string; caption?: string } }) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  return (
    <section id={data.id} className="scroll-mt-24 group">
      <Card className="relative border-2 border-muted hover:border-blue-200 dark:hover:border-blue-900 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-blue-50/10 dark:to-blue-950/5">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
        
        <CardHeader className="relative z-10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between gap-4 text-right hover:opacity-80 transition-opacity group/header"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover/header:from-blue-500/20 group-hover/header:to-purple-500/20 transition-colors">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {data.title}
              </h2>
            </div>
            <ChevronDown className={cn(
              "h-5 w-5 text-muted-foreground transition-transform duration-300 shrink-0",
              isExpanded && "rotate-180"
            )} />
          </button>
        </CardHeader>

        {isExpanded && (
          <CardContent className="relative z-10 space-y-6 animate-in slide-in-from-top-2 duration-300">
            {data.type === 'ordered' ? (
              <ol className="space-y-3 text-sm md:text-base">
                {data.items.map((i, idx) => (
                  <li key={idx} className="flex gap-4 items-start group/item">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold shrink-0 group-hover/item:scale-110 transition-transform duration-300">
                      {idx + 1}
                    </span>
                    <span className="flex-1 pt-0.5">{i}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="space-y-3 text-sm md:text-base">
                {data.items.map((i, idx) => (
                  <li key={idx} className="flex gap-4 items-start group/item">
                    <span className="flex items-center justify-center w-2 h-2 mt-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0 group-hover/item:scale-150 transition-transform duration-300"></span>
                    <span className="flex-1">{i}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {data.screenshot && (
              <figure className="rounded-2xl border-2 border-muted bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm p-4 shadow-lg hover:shadow-2xl transition-all duration-500">
                <div className="rounded-xl overflow-hidden bg-background/50">
                  <Image 
                    src={data.screenshot} 
                    alt={data.caption || data.title} 
                    width={1200} 
                    height={640} 
                    className="w-full h-auto"
                  />
                </div>
                {data.caption && (
                  <figcaption className="text-sm text-muted-foreground mt-4 leading-relaxed flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
                    <span>{data.caption}</span>
                  </figcaption>
                )}
              </figure>
            )}
          </CardContent>
        )}
      </Card>
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
