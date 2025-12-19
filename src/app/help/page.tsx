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
  CheckCircle2,
  Download
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CardIcon } from '@/components/ui/card-icon';
import { LiveChatWidget } from '@/components/chat/LiveChatWidget';

export default function HelpPage() {
  const router = useRouter();
  const { isRTL, t } = useLanguage();
  const [activeId, setActiveId] = React.useState<string>('quickstart');
  const [query, setQuery] = React.useState('');
  const [showTop, setShowTop] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);

  const handlePrint = () => typeof window !== 'undefined' && window.print();

  const handleDownloadPDF = () => {
    const pdfUrl = 'https://dental.adsolutions-eg.com/assets/pdf/Cairo Dental Clinic.pdf';
    // Create a direct download link - works in all browsers without popup blockers
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Cairo Dental Clinic User Guide.pdf';
    link.target = '_self'; // Stay in same tab to avoid popup blockers
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  type SectionData = {
    id: string;
    title: string;
    type: 'list' | 'ordered';
    items: string[];
    screenshot?: string;
    caption?: string;
    keywords?: string[];
  };

  const getSectionData = React.useCallback((sectionId: string): SectionData => {
    const sectionMap: Record<string, Omit<SectionData, 'title' | 'items' | 'caption'>> = {
      'quickstart': { id: 'quickstart', type: 'ordered' as const, screenshot: '/help/screenshot-login.svg', keywords: ['login', 'language', 'admin', 'تسجيل', 'لغة', 'أدمن'] },
      'patients': { id: 'patients', type: 'list' as const, screenshot: '/help/screenshot-patients.svg' },
      'appointments': { id: 'appointments', type: 'list' as const, screenshot: '/help/screenshot-appointments.svg' },
      'treatments': { id: 'treatments', type: 'list' as const, screenshot: '/help/screenshot-treatments.svg' },
      'billing': { id: 'billing', type: 'list' as const, screenshot: '/help/screenshot-billing.svg' },
      'dental_chart': { id: 'dental_chart', type: 'list' as const, screenshot: '/help/screenshot-dental-chart.png' },
      'insurance': { id: 'insurance', type: 'list' as const, screenshot: '/help/screenshot-insurance.svg' },
      'inventory': { id: 'inventory', type: 'list' as const, screenshot: '/help/screenshot-inventory.svg' },
      'pharmacy': { id: 'pharmacy', type: 'list' as const, screenshot: '/help/screenshot-pharmacy.svg' },
      'referrals': { id: 'referrals', type: 'list' as const, screenshot: '/help/screenshot-referrals.svg' },
      'communications': { id: 'communications', type: 'list' as const, screenshot: '/help/screenshot-communications.svg' },
      'staff': { id: 'staff', type: 'list' as const, screenshot: '/help/screenshot-staff.svg' },
      'suppliers': { id: 'suppliers', type: 'list' as const, screenshot: '/help/screenshot-suppliers.svg' },
      'analytics': { id: 'analytics', type: 'list' as const, screenshot: '/help/screenshot-analytics.svg' },
      'settings': { id: 'settings', type: 'list' as const, screenshot: '/help/screenshot-settings.svg' },
      'permissions': { id: 'permissions', type: 'list' as const, screenshot: '/help/screenshot-permissions.svg' },
      'portal': { id: 'portal', type: 'list' as const, screenshot: '/help/screenshot-portal.svg' },
      'notes': { id: 'notes', type: 'list' as const }
    };

    const getItems = (section: string): string[] => {
      const itemCounts: Record<string, number> = {
        quickstart: 3, patients: 2, appointments: 2, treatments: 2, billing: 2,
        dental_chart: 4, insurance: 2, inventory: 2, pharmacy: 2, referrals: 2,
        communications: 2, staff: 2, suppliers: 1, analytics: 2, settings: 1,
        permissions: 1, portal: 1, notes: 3
      };
      const count = itemCounts[section] || 1;
      return Array.from({ length: count }, (_, i) => t(`help.section.${section}.item${i + 1}`));
    };

    const base = sectionMap[sectionId] || { id: sectionId, type: 'list' as const };
    return {
      ...base,
      title: t(`help.section.${sectionId}`),
      items: getItems(sectionId),
      caption: t(`help.section.${sectionId}.caption`)
    };
  }, [t]);

  const sections: SectionData[] = React.useMemo(() => [
    'quickstart', 'patients', 'appointments', 'treatments', 'billing', 'dental_chart',
    'insurance', 'inventory', 'pharmacy', 'referrals', 'communications', 'staff',
    'suppliers', 'analytics', 'settings', 'permissions', 'portal', 'notes'
  ].map(getSectionData), [getSectionData]);

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
        title: t('page.help.sections'), 
        value: sections.length, 
        description: t('page.help.sections_desc'),
        icon: 'BookOpen'
      },
      { 
        title: t('page.help.instant_support'), 
        value: '24/7', 
        description: t('page.help.instant_support_desc'),
        icon: 'HeadphonesIcon'
      },
      { 
        title: t('page.help.response_time'), 
        value: t('page.help.response_time_value'), 
        description: t('page.help.response_time_desc'),
        icon: 'Clock'
      },
      { 
        title: t('page.help.resolution_rate'), 
        value: t('page.help.resolution_rate_value'), 
        description: t('page.help.resolution_rate_desc'),
        icon: 'CheckCircle2'
      },
    ];
  }, [sections.length, t]);

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
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400 bg-clip-text text-transparent animate-gradient">
                    {t('page.help.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('page.help.subtitle')}
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
                  <span>{t('page.help.print')}</span>
                </Button>
                <Button 
                  onClick={() => router.push('/')}
                  variant="default"
                  className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <LifeBuoy className="h-4 w-4" />
                  <span>{t('page.help.app')}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Like Pharmacy Page */}
        <div className="grid gap-1.5 grid-cols-2 lg:grid-cols-4">
          {helpStats.map((stat, index) => {
            const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-orange', 'metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-sm transition-all duration-500 hover:scale-105 min-h-0",
                  cardStyle
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-0.5 p-1.5 space-y-0">
                  <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide leading-tight">
                    {stat.title}
                  </CardTitle>
                  <CardIcon 
                    variant={(['blue', 'green', 'orange', 'purple'] as const)[index % 4]}
                    className="w-10 h-10"
                    aria-hidden="true"
                  >
                    {index === 0 && <BookOpen className="h-5 w-5" />}
                    {index === 1 && <HelpCircle className="h-5 w-5" />}
                    {index === 2 && <Users className="h-5 w-5" />}
                    {index === 3 && <HeadphonesIcon className="h-5 w-5" />}
                  </CardIcon>
                </CardHeader>
                
                <CardContent className="pt-0 p-1.5">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
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
                  placeholder={t('page.help.search_placeholder')}
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
                <span className="text-xs font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">{t('page.help.free')}</span>
              </div>
              <CardTitle className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">{t('page.help.quickstart')}</CardTitle>
              <CardDescription className="text-sm md:text-base font-medium">{t('page.help.quickstart_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <a href="#quickstart" className="inline-flex items-center gap-2 text-sm md:text-base text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold group-hover:gap-3 transition-all duration-300">
                <span>{t('page.help.quickstart_cta')}</span>
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
                <span className="text-xs font-bold text-purple-500 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">{t('page.help.sections_count')}</span>
              </div>
              <CardTitle className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{t('page.help.guides')}</CardTitle>
              <CardDescription className="text-sm md:text-base font-medium">{t('page.help.guides_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <a href="#patients" className="inline-flex items-center gap-2 text-sm md:text-base text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold group-hover:gap-3 transition-all duration-300">
                <span>{t('page.help.guides_cta')}</span>
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
                <span className="text-xs font-bold text-green-500 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full animate-pulse">{t('page.help.available')}</span>
              </div>
              <CardTitle className="text-xl md:text-2xl font-black bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 bg-clip-text text-transparent">{t('page.help.support')}</CardTitle>
              <CardDescription className="text-sm md:text-base font-medium">{t('page.help.support_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3">
              <a href="mailto:support@cairodental.com" className="flex items-center gap-3 text-sm md:text-base text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold transition-all duration-300 hover:gap-4 group/link">
                <Mail className="h-5 w-5 group-hover/link:scale-110 transition-transform" />
                <span>{t('page.help.support_email')}</span>
              </a>
              <a href="tel:+20123456789" className="flex items-center gap-3 text-sm md:text-base text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-bold transition-all duration-300 hover:gap-4 group/link">
                <Phone className="h-5 w-5 group-hover/link:scale-110 transition-transform" />
                <span>{t('page.help.support_call')}</span>
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
                  {t('page.help.faq_title')}
                </CardTitle>
                <CardDescription className="text-sm">{t('page.help.faq_desc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full space-y-3">
              <AccordionItem value="faq-1" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  {t('page.help.faq_q1')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {t('page.help.faq_a1')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  {t('page.help.faq_q2')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {t('page.help.faq_a2')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  {t('page.help.faq_q3')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {t('page.help.faq_a3')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  {t('page.help.faq_q4')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {t('page.help.faq_a4')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  {t('page.help.faq_q5')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {t('page.help.faq_a5')}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-6" className="border-2 border-muted rounded-xl px-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <AccordionTrigger className="hover:no-underline py-4 font-bold">
                  {t('page.help.faq_q6')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {t('page.help.faq_a6')}
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
                <h2 className="font-bold text-lg">{t('page.help.toc')}</h2>
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
              {t('page.help.not_found')}
            </CardTitle>
            <CardDescription className="text-base md:text-lg font-medium">
              {t('page.help.not_found_desc')}
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
                      <h3 className="font-bold text-lg mb-2">{t('page.help.email_support')}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{t('page.help.email_desc')}</p>
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
                      <h3 className="font-bold text-lg mb-2">{t('page.help.phone_support')}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{t('page.help.phone_desc')}</p>
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
                      <h3 className="font-bold text-lg mb-2">{t('page.help.live_chat')}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{t('page.help.live_chat_desc')}</p>
                      <Button 
                        variant="outline"
                        onClick={() => setChatOpen(true)}
                        className="gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 group-hover:scale-105"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{t('page.help.live_chat_cta')}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Additional Help Resources */}
            <div className="mt-8 pt-8 border-t-2 border-muted">
              <div className="text-center space-y-4">
                <h4 className="font-bold text-xl">{t('page.help.additional_resources')}</h4>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    variant="outline" 
                    className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="h-4 w-4" />
                    <span>{t('page.help.user_guide_pdf')}</span>
                  </Button>
                  <Button variant="outline" className="gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/30">
                    <BookOpen className="h-4 w-4" />
                    <span>{t('page.help.video_tutorials')}</span>
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

        {/* Live Chat Widget */}
        <LiveChatWidget 
          open={chatOpen} 
          onClose={() => setChatOpen(false)}
          userName="ضيف"
        />
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
