'use client';

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '../ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Bell, Search, ChevronDown, User, Settings, LogOut, Calendar, FileText, MessageSquare, CreditCard, Home, Activity, Clock, FlaskConical } from 'lucide-react';
import { DentalProLogo } from '../icons';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';
import Image from 'next/image';
import { getClientFtpProxyUrl } from '@/lib/ftp-proxy-url';

// Patient navigation items
const patientNavItems = [
  {
    titleKey: 'nav.dashboard',
    href: '/patient-home',
    icon: Home,
    descriptionKey: 'patient_pages.home.dashboard_desc'
  },
  {
    titleKey: 'patient_pages.appointments.title',
    href: '/patient-appointments',
    icon: Calendar,
    descriptionKey: 'patient_pages.appointments.subtitle'
  },
  {
    titleKey: 'patient_pages.dental_chart.title',
    href: '/patient-dental-chart',
    icon: Activity,
    descriptionKey: 'patient_pages.dental_chart.subtitle'
  },
  {
    titleKey: 'patient_pages.messages.title',
    href: '/patient-messages',
    icon: MessageSquare,
    descriptionKey: 'patient_pages.messages.subtitle'
  },
  {
    titleKey: 'patient_pages.records.title',
    href: '/patient-records',
    icon: FileText,
    descriptionKey: 'patient_pages.records.subtitle'
  },
  {
    titleKey: 'patient_pages.lab.title',
    href: '/patient-lab',
    icon: FlaskConical,
    descriptionKey: 'patient_pages.lab.subtitle'
  },
  {
    titleKey: 'patient_pages.billing.title',
    href: '/patient-billing',
    icon: CreditCard,
    descriptionKey: 'patient_pages.billing.subtitle'
  },
  {
    titleKey: 'patient_pages.profile.title',
    href: '/patient-profile',
    icon: User,
    descriptionKey: 'patient_pages.profile.subtitle'
  }
];

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { t, language, setLanguage, isRTL, direction } = useLanguage();
  const [currentDateTime, setCurrentDateTime] = React.useState<Date | null>(null);
  const [patientProfilePhoto, setPatientProfilePhoto] = React.useState<string | null>(null);

  // Use database-backed notification hook for patient
  const {
    unreadNotifications,
    unreadCount,
    markAsRead,
    refetch: refetchNotifications,
  } = useNotifications(user?.id);

  // Group notifications by type for display
  const groupedNotifications = React.useMemo(() => {
    return {
      chats: unreadNotifications.filter(n => n.type === 'CHAT_MESSAGE'),
      appointments: unreadNotifications.filter(n => n.type.includes('APPOINTMENT')),
      billing: unreadNotifications.filter(n => n.type.includes('BILLING')),
      lab: unreadNotifications.filter(n => n.type.includes('LAB')),
      other: unreadNotifications.filter(n => 
        n.type !== 'CHAT_MESSAGE' && 
        !n.type.includes('APPOINTMENT') && 
        !n.type.includes('BILLING') && 
        !n.type.includes('LAB')
      ),
    };
  }, [unreadNotifications]);
  
  // Update date/time every second
  React.useEffect(() => {
    setCurrentDateTime(new Date());
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Initialize from localStorage for instant load
  const [clinicLogo, setClinicLogo] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clinicLogo') || null;
    }
    return null;
  });
  const [clinicName, setClinicName] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('clinicName') || '';
    }
    return '';
  });

  // Set browser title and favicon immediately from cache
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedName = localStorage.getItem('clinicName');
      const cachedFavicon = localStorage.getItem('clinicFavicon');
      
      if (cachedName) {
        document.title = `${cachedName} - ${t('roles.patient')} Portal`;
      }
      
      if (cachedFavicon) {
        // Safe update from cache - no removal, just update href
        updateFaviconSafe(cachedFavicon);
      }
    }
  }, [t]);

  const updateFaviconSafe = (url: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const fullUrl = `${getClientFtpProxyUrl(url)}?v=${Date.now()}`;
      
      // Update all favicon link types for cross-browser compatibility (including Safari)
      const faviconSelectors = [
        "link[rel='icon']",
        "link[rel='shortcut icon']",
        "link[rel='apple-touch-icon']",
        "link[rel='mask-icon']"
      ];
      
      faviconSelectors.forEach((selector) => {
        let link = document.querySelector(selector) as HTMLLinkElement;
        
        if (!link) {
          link = document.createElement('link');
          if (selector.includes('shortcut')) {
            link.rel = 'shortcut icon';
          } else if (selector.includes('apple-touch')) {
            link.rel = 'apple-touch-icon';
          } else if (selector.includes('mask-icon')) {
            link.rel = 'mask-icon';
            link.setAttribute('color', '#2563eb');
          } else {
            link.rel = 'icon';
            link.type = 'image/svg+xml';
          }
          document.head.appendChild(link);
        }
        
        link.href = fullUrl;
      });
    } catch (error) {
      console.warn('Failed to update favicon:', error);
    }
  };

  // Fetch clinic settings for logo and name
  React.useEffect(() => {
    async function fetchClinicSettings() {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            const name = data.settings.clinicName || t('dashboard.clinic_name');
            const logo = data.settings.logoUrl;
            const favicon = data.settings.faviconUrl;
            
            // Update state
            setClinicLogo(logo);
            setClinicName(name);
            
            // Cache in localStorage for instant load next time
            if (logo) {
              localStorage.setItem('clinicLogo', logo);
            } else {
              localStorage.removeItem('clinicLogo');
            }
            if (name) {
              localStorage.setItem('clinicName', name);
              document.title = `${name} - ${t('roles.patient')} Portal`;
            }
            if (favicon) {
              localStorage.setItem('clinicFavicon', favicon);
              updateFaviconSafe(favicon);
            } else {
              localStorage.removeItem('clinicFavicon');
            }
          }
        }
      } catch (error) {
        console.warn('Failed to fetch clinic settings:', error);
      }
    }
    
    fetchClinicSettings();
  }, [t]);

  // Fetch patient profile photo
  React.useEffect(() => {
    async function fetchPatientProfile() {
      if (!user?.email) return;
      
      try {
        const response = await fetch(`/api/patient/profile?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.patient?.profilePhotoUrl) {
            setPatientProfilePhoto(data.patient.profilePhotoUrl);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch patient profile:', error);
      }
    }
    
    fetchPatientProfile();
  }, [user?.email]);

  // Refresh notifications every 30 seconds
  React.useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      refetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user?.id, refetchNotifications]);

  // Handler to mark notification as read when clicked
  const handleNotificationClick = async (notificationId: string, link?: string | null) => {
    await markAsRead(notificationId);
    if (link) {
      router.push(link);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'P';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'P';
  };

  const getUserDisplayName = () => {
    if (!user) return 'Patient';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: t('message.logout_success'),
        description: t('message.logout_success_desc'),
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: t('message.logout_failed'),
        description: t('message.logout_failed_desc'),
        variant: 'destructive',
      });
    }
  };

  // Static color styles for navigation items (same as admin)
  const colorStyles = [
    { iconBg: 'bg-cyan-500/10', iconText: 'text-cyan-400', ring: 'ring-cyan-400/30' },
    { iconBg: 'bg-sky-500/10', iconText: 'text-sky-400', ring: 'ring-sky-400/30' },
    { iconBg: 'bg-teal-500/10', iconText: 'text-teal-400', ring: 'ring-teal-400/30' },
    { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', ring: 'ring-emerald-400/30' },
    { iconBg: 'bg-green-500/10', iconText: 'text-green-400', ring: 'ring-green-400/30' },
    { iconBg: 'bg-pink-500/10', iconText: 'text-pink-400', ring: 'ring-pink-400/30' },
  ];

  return (
    <SidebarProvider>
      <Sidebar side={isRTL ? 'right' : 'left'} className="elite-sidebar">
        <SidebarHeader className="border-b border-sidebar-border/50 bg-sidebar-background/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            {clinicLogo ? (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sidebar-primary/10 backdrop-blur-sm flex items-center justify-center">
                <Image
                  src={getClientFtpProxyUrl(clinicLogo)}
                  alt="Clinic Logo"
                  width={48}
                  height={48}
                  className="object-contain p-1"
                />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-sidebar-primary/20 backdrop-blur-sm">
                <DentalProLogo className="size-8 text-sidebar-primary" />
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">{clinicName || t('dashboard.clinic_name')}</h1>
              <p className="text-xs text-sidebar-foreground/70 font-medium">{t('roles.patient')} Portal</p>
            </div>
          </div>
          {/* Live Date & Time Display */}
          {currentDateTime && (
            <div className="mt-4 p-3 rounded-xl bg-sidebar-accent/30 backdrop-blur-sm border border-sidebar-border/30">
              <div className="flex items-center gap-2 text-sidebar-foreground/90">
                <Calendar className="h-4 w-4 text-sidebar-primary" />
                <span className="text-sm font-medium">
                  {currentDateTime.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sidebar-foreground/90 mt-1.5">
                <Clock className="h-4 w-4 text-sidebar-primary" />
                <span className="text-lg font-bold tracking-wide" dir="ltr">
                  {currentDateTime.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
            </div>
          )}
        </SidebarHeader>
        
        <SidebarContent className="flex flex-col px-3 py-4">
          {/* Navigation Menu */}
          <div className="flex flex-col h-full">
            <SidebarMenu className="flex-grow space-y-2">
              {patientNavItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                const colors = colorStyles[index % colorStyles.length];
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="group relative w-full p-0 bg-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none"
                    >
                      <Link
                        href={item.href}
                        className={`flex ${direction === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row'} items-stretch gap-4 w-full rounded-2xl px-4 py-4 min-h-24 border border-sidebar-border/20 bg-sidebar-accent/10 hover:bg-sidebar-accent/20 transition-all duration-300 relative overflow-hidden`}
                      >
                        {/* Active bar */}
                        <span
                          className={`absolute ${direction === 'rtl' ? 'right-0' : 'left-0'} top-0 h-full w-1.5 rounded-${direction === 'rtl' ? 'l' : 'r'}-full transition-all duration-300 ${isActive ? 'bg-sidebar-primary opacity-100' : 'bg-sidebar-primary/0 opacity-0 group-hover:opacity-60'}`}
                        />
                        {/* Icon */}
                        <div className={`relative flex-shrink-0 self-center flex items-center justify-center w-14 h-14 rounded-xl ${colors.iconBg} ${colors.ring} ring-1 backdrop-blur-sm transition-all duration-300 group-hover:scale-105`}> 
                          <IconComponent className={`h-7 w-7 ${colors.iconText}`} />
                        </div>
                        {/* Text Block */}
                        <div className={`flex flex-col flex-1 justify-center ${direction === 'rtl' ? 'pr-1' : 'pl-1'} py-1`}> 
                          <span className={`font-semibold text-sm tracking-wide mb-1 ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground'} group-hover:text-sidebar-accent-foreground transition-colors`}> 
                            {t(item.titleKey)}
                          </span>
                          {item.descriptionKey && (
                            <span className="text-xs font-medium text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground/90 whitespace-normal break-words leading-snug">
                              {t(item.descriptionKey)}
                            </span>
                          )}
                        </div>
                        {/* Active pulse dot */}
                        {isActive && (
                          <div className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-2 w-2.5 h-2.5 rounded-full bg-sidebar-primary shadow-[0_0_0_3px_rgba(var(--sidebar-primary-rgb),0.25)] animate-pulse`} />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            
            {/* Elite User Section - Bottom of Sidebar */}
            <div className="mt-auto border-t border-sidebar-border/50 pt-6 space-y-4">
              {/* User Profile Card */}
              <div className="px-4 py-3 mx-2 rounded-xl bg-sidebar-accent/30 backdrop-blur-sm border border-sidebar-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-accent-foreground flex items-center justify-center">
                    <span className="text-sm font-bold text-sidebar-background">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sidebar-foreground text-sm truncate">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-xs text-sidebar-foreground/70 capitalize font-medium">
                      {t('roles.patient')} • Online
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
              </div>
              
              {/* Settings Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/patient-settings">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start mx-2 px-4 py-3 rounded-xl bg-sidebar-accent/20 hover:bg-sidebar-accent/30 transition-all duration-300 group" 
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary/10 group-hover:bg-sidebar-primary/20 transition-all duration-300">
                        <Settings className="h-4 w-4 text-sidebar-primary" />
                      </div>
                      <span className="font-medium text-sidebar-foreground">{t('nav.settings')}</span>
                    </Button>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Elite Sign Out Button */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start mx-2 px-4 py-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive transition-all duration-300 group" 
                    onClick={handleLogout}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-all duration-300">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{t('nav.sign_out')}</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Bottom spacing */}
              <div className="pb-6" />
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      
      <SidebarInset className="overflow-x-hidden">
        <header className="elite-header flex h-16 sm:h-18 items-center gap-4 sm:gap-6 border-b border-border/50 px-6 sm:px-8">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('header.search_placeholder')}
                className="w-full rounded-xl bg-background/60 backdrop-blur-sm border-border/50 pl-10 h-11 text-sm font-medium placeholder:text-muted-foreground/70 focus:bg-background/80 focus:border-primary/50 transition-all duration-300"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              aria-label="Language"
              className="rounded-xl bg-background/60 backdrop-blur-sm border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold min-w-[3rem]"
            >
              {language === 'en' ? 'AR' : 'EN'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl hover:bg-accent/10 transition-all duration-300">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-xs text-white font-bold shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 sm:w-80 max-h-[500px] overflow-y-auto">
                <DropdownMenuLabel>{t('header.notifications')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Chat Message Notifications */}
                {groupedNotifications.chats.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className="flex items-start gap-2 p-3 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 cursor-pointer"
                  >
                    <MessageSquare className="mt-1 h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-purple-700 dark:text-purple-300">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
                {/* Appointment Notifications */}
                {groupedNotifications.appointments.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className="flex items-start gap-2 p-3 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/40 cursor-pointer"
                  >
                    <Calendar className="mt-1 h-4 w-4 flex-shrink-0 text-orange-500" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-orange-700 dark:text-orange-300">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
                {/* Billing Notifications */}
                {groupedNotifications.billing.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className="flex items-start gap-2 p-3 bg-green-50/50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40 cursor-pointer"
                  >
                    <CreditCard className="mt-1 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-green-700 dark:text-green-300">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
                {/* Lab Notifications */}
                {groupedNotifications.lab.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className="flex items-start gap-2 p-3 bg-teal-50/50 dark:bg-teal-950/20 hover:bg-teal-100 dark:hover:bg-teal-950/40 cursor-pointer"
                  >
                    <FlaskConical className="mt-1 h-4 w-4 flex-shrink-0 text-teal-600 dark:text-teal-400" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-teal-700 dark:text-teal-300">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
                {/* Other Notifications */}
                {groupedNotifications.other.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className="flex items-start gap-2 p-3 cursor-pointer"
                  >
                    <Bell className="mt-1 h-4 w-4 flex-shrink-0 text-blue-500" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
                {unreadCount === 0 && (
                  <DropdownMenuItem disabled className="p-3">
                    {t('header.no_notifications')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 hover:bg-accent/10 rounded-xl px-3 py-2 transition-all duration-300 group">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary/40">
                    <AvatarImage
                      src={patientProfilePhoto ? getClientFtpProxyUrl(patientProfilePhoto) : (user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${getUserInitials()}`)}
                      alt={getUserDisplayName()}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start md:flex">
                    <span className="text-sm font-semibold text-foreground">{getUserDisplayName()}</span>
                    <span className="text-xs text-muted-foreground font-medium">{t('roles.patient')}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block transition-transform duration-300 group-hover:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{t('roles.patient')}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/patient-profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('header.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/patient-settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {t('nav.settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  {t('header.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
