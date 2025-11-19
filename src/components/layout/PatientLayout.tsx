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
import { Bell, Search, ChevronDown, User, Settings, LogOut, Calendar, FileText, MessageSquare, CreditCard, Home, Activity } from 'lucide-react';
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
  const [staffReplies, setStaffReplies] = React.useState<any[]>([]);
  const [chatReplies, setChatReplies] = React.useState<any[]>([]);
  const [readNotificationIds, setReadNotificationIds] = React.useState<Set<string>>(new Set());
  const [clinicLogo, setClinicLogo] = React.useState<string | null>(null);
  const [clinicName, setClinicName] = React.useState<string>('');

  // Mark notification as read (simple local state for patient)
  const markAsRead = React.useCallback((id: string) => {
    setReadNotificationIds(prev => new Set([...prev, id]));
  }, []);

  const filterUnread = React.useCallback((items: any[]) => {
    return items.filter(item => !readNotificationIds.has(item.id));
  }, [readNotificationIds]);

  // Fetch clinic settings for logo and favicon
  React.useEffect(() => {
    async function fetchClinicSettings() {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setClinicLogo(data.settings.logoUrl);
            setClinicName(data.settings.clinicName || t('dashboard.clinic_name'));
            
            // Update favicon if set
            if (data.settings.faviconUrl) {
              const links = document.querySelectorAll("link[rel*='icon']");
              links.forEach(link => link.remove());
              
              const newLink = document.createElement('link');
              newLink.rel = 'icon';
              newLink.type = 'image/x-icon';
              newLink.href = getClientFtpProxyUrl(data.settings.faviconUrl);
              document.head.appendChild(newLink);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to fetch clinic settings:', error);
      }
    }
    
    fetchClinicSettings();
  }, [t]);

  React.useEffect(() => {
    async function fetchNotifications() {
      if (!user?.email) return;
      
      try {
        const [messagesResponse, chatResponse] = await Promise.all([
          fetch(`/api/patient-messages?patientEmail=${user.email}`),
          fetch(`/api/chat/unread?userType=patient&patientEmail=${encodeURIComponent(user.email)}&limit=5`)
        ]);
        
        let replies: any[] = [];
        let chatMessages: any[] = [];
        
        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          replies = (data.messages || []).filter((m: any) => 
            m.from === 'فريق الدعم' || m.from === 'Staff'
          );
        }
        
        if (chatResponse.ok) {
          const data = await chatResponse.json();
          chatMessages = data.unreadMessages || [];
        }
        
        setStaffReplies(replies.slice(0, 5));
        setChatReplies(chatMessages);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // Filter out read notifications and calculate count
  const unreadStaffReplies = React.useMemo(
    () => filterUnread(staffReplies.map(r => ({ ...r, type: 'message' as const }))),
    [staffReplies, filterUnread]
  );
  const unreadChatReplies = React.useMemo(
    () => filterUnread(chatReplies.map(c => ({ ...c, type: 'chat' as const }))),
    [chatReplies, filterUnread]
  );

  const notificationCount = unreadStaffReplies.length + unreadChatReplies.length;

  // Handler to mark notification as read when clicked
  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
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
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-xs text-white font-bold shadow-lg animate-pulse">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 sm:w-80">
                <DropdownMenuLabel>{t('header.notifications')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {unreadChatReplies.length > 0 && (
                  <>
                    {unreadChatReplies.map((msg: any) => (
                      <DropdownMenuItem key={msg.id} asChild>
                        <Link 
                          href="/patient-messages" 
                          className="flex items-start gap-2 p-3 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40"
                          onClick={() => handleNotificationClick(msg.id)}
                        >
                          <MessageSquare className="mt-1 h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-purple-700 dark:text-purple-300">💬 رد من الفريق</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {msg.conversation?.staffName || 'فريق الدعم'}: {msg.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                {unreadStaffReplies.length > 0 && (
                  <>
                    {unreadStaffReplies.map((reply: any) => (
                      <DropdownMenuItem key={reply.id} asChild>
                        <Link 
                          href="/patient-messages" 
                          className="flex items-start gap-2 p-3"
                          onClick={() => handleNotificationClick(reply.id)}
                        >
                          <MessageSquare className="mt-1 h-4 w-4 flex-shrink-0 text-blue-500" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm">{t('patient_pages.messages.new_reply')}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {reply.subject}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(reply.date || reply.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                {notificationCount === 0 && (
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
                      src={user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${getUserInitials()}`}
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
