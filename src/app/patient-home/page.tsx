'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  Star, 
  Gift, 
  Percent, 
  Heart,
  Smile,
  Sparkles,
  CheckCircle,
  Users,
  Award,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  FileText,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { listDocuments } from '@/lib/data-client';
import PatientAppointmentBooking from '@/components/appointments/patient-appointment-booking';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEGP } from '@/lib/currency';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  validUntil: string;
  code: string;
  featured: boolean;
  active: boolean;
  image?: string;
}

type LocalizedString = string | { en: string; ar: string };

interface PatientPortalContent {
  id: string;
  welcomeMessage: string;
  clinicInfo: {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
  };
  healthTips: Array<{
    id: string;
    title: LocalizedString;
    content: LocalizedString;
    icon: 'Smile' | 'Heart' | 'CheckCircle' | string;
  }>;
  updatedAt: string;
  updatedBy: string;
}

const promotions = [
  {
    id: 1,
    title: "New Patient Special",
    description: "Get 20% off your first comprehensive exam and cleaning",
    discount: "20% OFF",
    validUntil: "2025-09-30",
    image: "/api/placeholder/400/200",
    featured: true,
    code: "NEWPATIENT20"
  },
  {
    id: 2,
    title: "Family Dental Plan",
    description: "Book appointments for your entire family and save 15% on all treatments",
    discount: "15% OFF",
    validUntil: "2025-12-31",
    image: "/api/placeholder/400/200",
    featured: false,
    code: "FAMILY15"
  },
  {
    id: 3,
    title: "Teeth Whitening Special",
    description: "Professional teeth whitening treatment at a special price",
    discount: "$100 OFF",
    validUntil: "2025-08-31",
    image: "/api/placeholder/400/200",
    featured: true,
    code: "WHITEN100"
  },
  {
    id: 4,
    title: "Orthodontic Consultation",
    description: "Free consultation for braces or Invisalign treatment",
    discount: "FREE",
    validUntil: "2025-10-15",
    image: "/api/placeholder/400/200",
    featured: false,
    code: "ORTHODOC"
  }
];

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    comment: "Amazing service! The staff is so friendly and professional. My teeth look fantastic!",
    treatment: "Teeth Whitening"
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 5,
    comment: "Best dental experience I've ever had. No pain and great results.",
    treatment: "Root Canal"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    rating: 5,
    comment: "Dr. Smith is incredible! My smile transformation exceeded all expectations.",
    treatment: "Dental Implants"
  }
];

const services = [
  {
    icon: Smile,
    title: "General Dentistry",
    description: "Comprehensive dental care for the whole family",
    features: ["Regular Checkups", "Cleanings", "Fillings", "Extractions"]
  },
  {
    icon: Sparkles,
    title: "Cosmetic Dentistry",
    description: "Transform your smile with our cosmetic treatments",
    features: ["Teeth Whitening", "Veneers", "Bonding", "Smile Makeover"]
  },
  {
    icon: Award,
    title: "Orthodontics",
    description: "Straighten your teeth with modern orthodontic solutions",
    features: ["Traditional Braces", "Invisalign", "Retainers", "Clear Aligners"]
  }
];

export default function PatientHomePage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [portalContent, setPortalContent] = React.useState<PatientPortalContent | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [dashboardStats, setDashboardStats] = React.useState<any>(null);
  const [recentMessages, setRecentMessages] = React.useState<any[]>([]);
  const [healthTips, setHealthTips] = React.useState<any>(null);
  const [selectedTip, setSelectedTip] = React.useState<any>(null);
  const [showTipDialog, setShowTipDialog] = React.useState(false);

  React.useEffect(() => {
    if (user?.email) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats from Neon database
      if (user?.email) {
        const statsResponse = await fetch(
          `/api/patient/dashboard?email=${encodeURIComponent(user.email)}`
        );
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setDashboardStats(statsData.stats);
          setRecentMessages(statsData.recentMessages || []);
          setHealthTips(statsData.healthTips || defaultContent.healthTips);
        }
      }

      // Fetch promotions from Neon database
      try {
        const promotionsData = await listDocuments<Promotion>('patient-promotions');
        // Filter for active promotions only
        const activePromotions = promotionsData.filter(p => p.active);
        
        if (activePromotions.length > 0) {
          setPromotions(activePromotions);
        } else {
          // Use default promotions if no active promotions in database
          setPromotions(defaultPromotions);
        }
      } catch (promotionError) {
        console.error('Error fetching promotions:', promotionError);
        // Fall back to default promotions if fetch fails
        setPromotions(defaultPromotions);
      }

      setPortalContent(defaultContent);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Still show default content on error
      setPromotions(defaultPromotions);
      setPortalContent(defaultContent);
      setHealthTips(defaultContent.healthTips);
    } finally {
      setLoading(false);
    }
  };

  // Fallback data if admin hasn't set up content yet
  const defaultPromotions: Promotion[] = [
    {
      id: "default-1",
      title: "New Patient Special",
      description: "Get 20% off your first comprehensive exam and cleaning",
      discount: "20% OFF",
      validUntil: "2025-12-31",
      featured: true,
      active: true,
      code: "NEWPATIENT20"
    },
    {
      id: "default-2",
      title: "Family Dental Plan",
      description: "Book appointments for your entire family and save 15% on all treatments",
      discount: "15% OFF",
      validUntil: "2025-12-31",
      featured: false,
      active: true,
      code: "FAMILY15"
    }
  ];

  const defaultContent: PatientPortalContent = {
    id: 'default',
    welcomeMessage: 'Welcome to your dental care portal',
    clinicInfo: {
      name: 'CairoDental',
      description: 'Your trusted dental care provider',
      phone: '+1 (555) 123-4567',
      email: 'info@cairodental.com',
      address: '123 Dental Street, Cairo, Egypt'
    },
    healthTips: [
      {
        id: '1',
        title: {
          en: 'Daily Oral Care',
          ar: 'العناية اليومية بالفم'
        },
        content: {
          en: 'Brush twice daily with fluoride toothpaste and floss daily to maintain optimal oral health. Use a soft-bristled toothbrush and replace it every 3 months. Brushing removes plaque and prevents cavities, while flossing removes food particles between teeth where your toothbrush cannot reach.\n\nProper brushing technique: Hold your toothbrush at a 45-degree angle to your gums. Gently move the brush back and forth in short strokes. Brush the outer surfaces, inner surfaces, and chewing surfaces of all teeth. Don\'t forget to brush your tongue to remove bacteria and freshen breath.',
          ar: 'اغسل أسنانك مرتين يومياً بمعجون أسنان يحتوي على الفلورايد واستخدم خيط الأسنان يومياً للحفاظ على صحة الفم المثلى. استخدم فرشاة أسنان ذات شعيرات ناعمة واستبدلها كل 3 أشهر. التنظيف بالفرشاة يزيل البلاك ويمنع التسوس، بينما يزيل خيط الأسنان جزيئات الطعام بين الأسنان حيث لا تستطيع الفرشاة الوصول.\n\nتقنية التنظيف الصحيحة: أمسك فرشاة أسنانك بزاوية 45 درجة على اللثة. حرك الفرشاة بلطف ذهاباً وإياباً بحركات قصيرة. نظف الأسطح الخارجية والداخلية وأسطح المضغ لجميع الأسنان. لا تنسَ تنظيف لسانك لإزالة البكتيريا وإنعاش النفس.'
        },
        icon: 'Smile'
      },
      {
        id: '2',
        title: {
          en: 'Nutrition for Teeth',
          ar: 'التغذية للأسنان'
        },
        content: {
          en: 'Limit sugary snacks and drinks. Choose water over sodas and energy drinks. Your diet plays a crucial role in maintaining healthy teeth and gums.\n\nFoods to eat: Dairy products (milk, cheese, yogurt) are rich in calcium and strengthen teeth. Crunchy fruits and vegetables (apples, carrots, celery) help clean teeth naturally. Leafy greens are packed with vitamins and minerals. Nuts provide protein and minerals.\n\nFoods to avoid: Sugary candies and sweets feed harmful bacteria. Acidic foods and drinks can erode tooth enamel. Sticky foods cling to teeth and are hard to clean. Remember to rinse with water after consuming sugary or acidic foods.',
          ar: 'قلل من الوجبات الخفيفة والمشروبات السكرية. اختر الماء بدلاً من المشروبات الغازية ومشروبات الطاقة. يلعب نظامك الغذائي دوراً حاسماً في الحفاظ على صحة الأسنان واللثة.\n\nالأطعمة المفيدة: منتجات الألبان (الحليب والجبن والزبادي) غنية بالكالسيوم وتقوي الأسنان. الفواكه والخضروات المقرمشة (التفاح والجزر والكرفس) تساعد على تنظيف الأسنان بشكل طبيعي. الخضروات الورقية مليئة بالفيتامينات والمعادن. المكسرات توفر البروتين والمعادن.\n\nالأطعمة التي يجب تجنبها: الحلويات والسكريات تغذي البكتيريا الضارة. الأطعمة والمشروبات الحمضية يمكن أن تآكل مينا الأسنان. الأطعمة اللزجة تلتصق بالأسنان ويصعب تنظيفها. تذكر الشطف بالماء بعد تناول الأطعمة السكرية أو الحمضية.'
        },
        icon: 'Heart'
      },
      {
        id: '3',
        title: {
          en: 'Regular Checkups',
          ar: 'الفحوصات المنتظمة'
        },
        content: {
          en: 'Visit your dentist every 6 months for cleanings and preventive care. Regular dental visits are essential for maintaining good oral health and catching problems early.\n\nWhat happens during a checkup: Professional cleaning removes tartar and plaque buildup. Examination of teeth, gums, and mouth for any issues. X-rays may be taken to detect problems not visible to the eye. Early detection of cavities, gum disease, and oral cancer.\n\nBenefits of regular visits: Prevents small problems from becoming major issues. Saves money in the long run by avoiding costly procedures. Maintains your beautiful smile. Professional advice tailored to your specific needs. Don\'t wait for pain – schedule your regular checkup today!',
          ar: 'قم بزيارة طبيب الأسنان كل 6 أشهر للتنظيف والرعاية الوقائية. الزيارات المنتظمة لطبيب الأسنان ضرورية للحفاظ على صحة الفم الجيدة واكتشاف المشاكل مبكراً.\n\nما يحدث خلال الفحص: التنظيف الاحترافي يزيل الجير وتراكم البلاك. فحص الأسنان واللثة والفم للكشف عن أي مشاكل. قد يتم أخذ أشعة سينية لاكتشاف المشاكل غير المرئية للعين. الكشف المبكر عن التسوس وأمراض اللثة وسرطان الفم.\n\nفوائد الزيارات المنتظمة: تمنع المشاكل الصغيرة من أن تصبح قضايا كبيرة. توفر المال على المدى الطويل عن طريق تجنب الإجراءات المكلفة. تحافظ على ابتسامتك الجميلة. نصائح مهنية مصممة خصيصاً لاحتياجاتك. لا تنتظر الألم - حدد موعد فحصك المنتظم اليوم!'
        },
        icon: 'CheckCircle'
      }
    ],
    updatedAt: new Date().toISOString(),
    updatedBy: 'System'
  };

  const displayPromotions = promotions.length > 0 ? promotions : defaultPromotions;
  const displayContent = portalContent || defaultContent;

  if (loading) {
    return (
      <PatientOnly>
        <PatientLayout>
          <div className="p-6 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-pulse text-lg">{t('patient_pages.home.loading')}</div>
            </div>
          </div>
        </PatientLayout>
      </PatientOnly>
    );
  }

  return (
    <PatientOnly>
      <PatientLayout>
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('patient_pages.home.welcome_back').replace('{{firstName}}', user?.firstName || t('patient_pages.home.patient'))} 👋
            </h1>
            <p className="text-gray-600">
              {t('patient_pages.home.dashboard_desc')}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <PatientAppointmentBooking />
            <Button 
              size="lg" 
              variant="outline" 
              className="h-16 text-left justify-start"
              onClick={() => window.location.href = '/patient-messages'}
            >
              <MessageSquare className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">{t('patient_pages.home.send_message')}</div>
                <div className="text-sm text-gray-600">{t('patient_pages.home.contact_team')}</div>
              </div>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-16 text-left justify-start"
              onClick={() => window.location.href = '/patient-records'}
            >
              <FileText className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">{t('patient_pages.home.view_records')}</div>
                <div className="text-sm text-gray-600">{t('patient_pages.home.access_history')}</div>
              </div>
            </Button>
          </div>

          {/* Current Promotions */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                <Gift className="inline h-6 w-6 mr-2 text-primary" />
                {t('patient_pages.home.special_offers')}
              </h2>
              <Button variant="outline" size="sm">
                {t('patient_pages.home.view_all_offers')}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayPromotions.slice(0, 2).map((promo) => (
                <Card key={promo.id} className={`${promo.featured ? 'ring-2 ring-primary shadow-lg' : ''} hover:shadow-xl transition-shadow`}>
                  {promo.featured && (
                    <div className="bg-primary text-white text-sm font-medium px-4 py-1 text-center">
                      {t('patient_pages.home.featured_offer')}
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg mb-2">{promo.title}</CardTitle>
                        <CardDescription>{promo.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-base px-3 py-1 bg-green-100 text-green-800">
                        {promo.discount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t('patient_pages.home.valid_until')}:</span>
                        <span className="font-medium">{new Date(promo.validUntil).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{t('patient_pages.home.promo_code')}:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{promo.code}</code>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => window.location.href = '/patient-appointments'}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {t('patient_pages.home.book_save')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Upcoming Appointments & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {t('patient_pages.home.upcoming_appointments')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardStats?.nextAppointment ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">{dashboardStats.nextAppointment.treatmentType}</p>
                        <p className="text-sm text-gray-600">{dashboardStats.nextAppointment.doctor}</p>
                        <p className="text-sm text-blue-600">
                          {new Date(dashboardStats.nextAppointment.date).toLocaleDateString()} - {dashboardStats.nextAppointment.time}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => window.location.href = '/patient-appointments'}>
                        {t('patient_pages.home.view_details')}
                      </Button>
                    </div>
                    {dashboardStats.upcomingAppointments > 1 && (
                      <p className="text-sm text-center text-gray-600">
                        +{dashboardStats.upcomingAppointments - 1} {t('patient_pages.home.more_appointments')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t('patient_pages.home.no_upcoming_appointments')}</p>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => window.location.href = '/patient-appointments'}
                >
                  {t('patient_pages.home.view_all_appointments')}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  {t('patient_pages.home.dental_health')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('patient_pages.home.last_visit')}</span>
                    <span className="font-medium">
                      {dashboardStats?.lastVisit 
                        ? new Date(dashboardStats.lastVisit).toLocaleDateString()
                        : t('patient_pages.home.no_visits')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('patient_pages.home.upcoming_appointments')}</span>
                    <span className="font-medium text-blue-600">
                      {dashboardStats?.upcomingAppointments || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('patient_pages.home.outstanding_balance')}</span>
                    <span className={`font-medium ${dashboardStats?.pendingAmount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      {formatEGP(dashboardStats?.pendingAmount || 0, true, language)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{t('patient_pages.home.unread_messages')}</span>
                    <Badge variant={dashboardStats?.unreadMessages > 0 ? 'default' : 'secondary'}>
                      {dashboardStats?.unreadMessages || 0}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => window.location.href = '/patient-billing'}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t('patient_pages.home.view_billing')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Messages */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                {t('patient_pages.home.recent_messages')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentMessages.length > 0 ? (
                <div className="space-y-4">
                  {recentMessages.slice(0, 3).map((msg, index) => (
                    <div 
                      key={msg.id} 
                      className={`flex items-start space-x-3 p-3 rounded-lg ${
                        !msg.isRead ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        !msg.isRead ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <MessageSquare className={`h-4 w-4 ${
                          !msg.isRead ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{msg.senderName}</p>
                          {!msg.isRead && (
                            <span className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{msg.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(msg.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent messages</p>
                </div>
              )}
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/patient-messages'}
              >
                {t('patient_pages.home.view_all_messages')}
              </Button>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <Sparkles className="inline h-6 w-6 mr-2 text-primary" />
              {t('patient_pages.home.health_tips')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(healthTips || defaultContent.healthTips).map((tip: any, index: number) => {
                const icons = [Smile, Award, CheckCircle];
                const Icon = icons[index % icons.length];
                const colors = ['text-blue-600', 'text-green-600', 'text-purple-600'];
                const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50'];
                
                // Get language-specific content
                const tipTitle = typeof tip.title === 'string' ? tip.title : (tip.title[language] || tip.title.en);
                const tipContent = typeof tip.content === 'string' ? tip.content : (tip.content[language] || tip.content.en);
                
                return (
                  <Card key={tip.id} className="hover:shadow-lg transition-shadow hover:-translate-y-1 duration-300">
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-lg ${bgColors[index % bgColors.length]} flex items-center justify-center mb-3`}>
                        <Icon className={`h-7 w-7 ${colors[index % colors.length]}`} />
                      </div>
                      <CardTitle className="text-lg">{tipTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {tipContent}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="group"
                        onClick={() => {
                          setSelectedTip(tip);
                          setShowTipDialog(true);
                        }}
                      >
                        {t('patient_pages.home.read_more')}
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>

        {/* Health Tip Detail Dialog */}
        <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                {selectedTip && (() => {
                  const tips = healthTips || defaultContent.healthTips;
                  const index = tips.findIndex((t: any) => t.id === selectedTip.id);
                  const icons = [Smile, Award, CheckCircle];
                  const Icon = icons[index % icons.length];
                  const colors = ['text-blue-600', 'text-green-600', 'text-purple-600'];
                  const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50'];
                  
                  // Get language-specific title
                  const tipTitle = typeof selectedTip.title === 'string' ? selectedTip.title : (selectedTip.title[language] || selectedTip.title.en);
                  
                  return (
                    <>
                      <div className={`h-12 w-12 rounded-lg ${bgColors[index % bgColors.length]} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${colors[index % colors.length]}`} />
                      </div>
                      <span>{tipTitle}</span>
                    </>
                  );
                })()}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t('patient_pages.home.health_tips')}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedTip && (typeof selectedTip.content === 'string' ? selectedTip.content : (selectedTip.content[language] || selectedTip.content.en))}
                </p>
              </div>
              
              {/* Additional detailed information */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      {t('patient_pages.home.tip_reminder')}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {t('patient_pages.home.tip_reminder_desc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to action */}
              <div className="mt-6 flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={() => window.location.href = '/patient-appointments'}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('patient_pages.home.book_appointment')}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowTipDialog(false)}
                >
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </PatientLayout>
    </PatientOnly>
  );
}
