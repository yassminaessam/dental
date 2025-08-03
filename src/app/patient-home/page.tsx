'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { getCollection } from '@/services/firestore';
import PatientAppointmentBooking from '@/components/appointments/patient-appointment-booking';

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
    title: string;
    content: string;
    icon: string;
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
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [portalContent, setPortalContent] = React.useState<PatientPortalContent | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    try {
      // Fetch promotions
      const promotionsData = await getCollection<Promotion>('patient-promotions');
      const activePromotions = promotionsData?.filter(p => p.active) || [];
      setPromotions(activePromotions);

      // Fetch portal content
      const contentData = await getCollection<PatientPortalContent>('patient-portal-content');
      if (contentData && contentData.length > 0) {
        setPortalContent(contentData[0]);
      }
    } catch (error) {
      console.error('Error fetching portal data:', error);
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
        title: 'Daily Oral Care',
        content: 'Brush twice daily with fluoride toothpaste and floss daily to maintain optimal oral health.',
        icon: 'Smile'
      },
      {
        id: '2',
        title: 'Nutrition for Teeth',
        content: 'Limit sugary snacks and drinks. Choose water over sodas and energy drinks.',
        icon: 'Heart'
      },
      {
        id: '3',
        title: 'Regular Checkups',
        content: 'Visit your dentist every 6 months for cleanings and preventive care.',
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
              <div className="animate-pulse text-lg">Loading your portal...</div>
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
              {displayContent.welcomeMessage.replace('{{firstName}}', user?.firstName || 'Patient')} 👋
            </h1>
            <p className="text-gray-600">
              {displayContent.clinicInfo.description || 'Your dental health dashboard - stay up to date with your care.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <PatientAppointmentBooking />
            <Button size="lg" variant="outline" className="h-16 text-left justify-start">
              <MessageSquare className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">Send Message</div>
                <div className="text-sm text-gray-600">Contact your dental team</div>
              </div>
            </Button>
            <Button size="lg" variant="outline" className="h-16 text-left justify-start">
              <FileText className="h-6 w-6 mr-3" />
              <div>
                <div className="font-semibold">View Records</div>
                <div className="text-sm text-gray-600">Access your dental history</div>
              </div>
            </Button>
          </div>

          {/* Current Promotions */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                <Gift className="inline h-6 w-6 mr-2 text-primary" />
                Special Offers for You
              </h2>
              <Button variant="outline" size="sm">
                View All Offers
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayPromotions.slice(0, 2).map((promo) => (
                <Card key={promo.id} className={`${promo.featured ? 'ring-2 ring-primary shadow-lg' : ''} hover:shadow-xl transition-shadow`}>
                  {promo.featured && (
                    <div className="bg-primary text-white text-sm font-medium px-4 py-1 text-center">
                      FEATURED OFFER
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
                        <span className="text-gray-600">Valid until:</span>
                        <span className="font-medium">{new Date(promo.validUntil).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Promo Code:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{promo.code}</code>
                      </div>
                      <Button className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Now & Save
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
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Regular Checkup</p>
                      <p className="text-sm text-gray-600">Dr. Smith</p>
                      <p className="text-sm text-blue-600">Tomorrow, 2:00 PM</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Reschedule
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Cleaning</p>
                      <p className="text-sm text-gray-600">Dr. Johnson</p>
                      <p className="text-sm text-gray-600">Next Week, Mon 10:00 AM</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Appointments
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Your Dental Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Visit</span>
                    <span className="font-medium">2 weeks ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Next Cleaning Due</span>
                    <span className="font-medium text-blue-600">Next Week</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Outstanding Balance</span>
                    <span className="font-medium text-green-600">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Insurance Status</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Billing Details
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Messages */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Appointment Reminder</p>
                    <p className="text-sm text-gray-600">Don't forget your appointment tomorrow at 2:00 PM with Dr. Smith.</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Treatment Plan Available</p>
                    <p className="text-sm text-gray-600">Your customized treatment plan is ready for review.</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Messages
              </Button>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <Sparkles className="inline h-6 w-6 mr-2 text-primary" />
              Dental Health Tips
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Smile className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Daily Oral Care</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Learn the best practices for maintaining excellent oral hygiene at home.
                  </p>
                  <Button variant="outline" size="sm">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Award className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Nutrition for Teeth</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Discover foods that promote strong teeth and healthy gums.
                  </p>
                  <Button variant="outline" size="sm">
                    Learn More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CheckCircle className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Preventive Care</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Understanding the importance of regular dental checkups and cleanings.
                  </p>
                  <Button variant="outline" size="sm">
                    Find Out More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </PatientLayout>
    </PatientOnly>
  );
}
