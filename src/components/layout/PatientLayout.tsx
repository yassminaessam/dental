'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  FileText, 
  MessageSquare, 
  CreditCard, 
  User, 
  Home,
  LogOut,
  Settings,
  Bell,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Navigation items will be translated in the component
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
  const pathname = usePathname();
  const router = useRouter();
  const { isRTL, t, language, setLanguage } = useLanguage();
  const [staffReplies, setStaffReplies] = React.useState<any[]>([]);
  const [notificationCount, setNotificationCount] = React.useState(0);

  React.useEffect(() => {
    async function fetchNotifications() {
      if (!user?.email) return;
      
      try {
        const response = await fetch(`/api/patient-messages?patientEmail=${user.email}`);
        if (response.ok) {
          const data = await response.json();
          // Filter for staff replies
          const replies = (data.messages || []).filter((m: any) => 
            m.from === 'فريق الدعم' || m.from === 'Staff'
          );
          setStaffReplies(replies.slice(0, 5));
          setNotificationCount(replies.length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
    
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.email]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 flex', isRTL && 'flex-row-reverse')}>
      {/* Sidebar */}
      <div className={cn('hidden md:flex md:w-64 md:flex-col', isRTL && 'md:order-last')}> 
        <div className="flex flex-col flex-grow bg-white shadow-sm">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <Heart className={cn('h-8 w-8 text-primary', isRTL ? 'ml-2' : 'mr-2')} />
            <span className="text-xl font-bold text-gray-900">{t('dashboard.clinic_name')}</span>
          </div>

          {/* User Info */}
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-cyan-50">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Badge variant="outline" className="mt-2 text-xs">
              Patient Portal
            </Badge>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {patientNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
        <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
          'flex-shrink-0 h-5 w-5',
          isRTL ? 'ml-3' : 'mr-3',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  <div className="flex-1">
                    <div>{t(item.titleKey)}</div>
                    <div className={cn(
                      'text-xs',
                      isActive ? 'text-primary-foreground/80' : 'text-gray-400'
                    )}>
                      {t(item.descriptionKey)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="flex-shrink-0 p-4 border-t">
            <div className="space-y-2">
              <Link href="/patient-settings">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Settings className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                  {t('nav.settings')}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                {t('nav.sign_out')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
          {/* Mobile sidebar would go here - simplified for now */}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar for all screens */}
        <header className="flex h-16 sm:h-18 items-center gap-4 sm:gap-6 border-b border-border/50 px-6 sm:px-8 bg-white shadow-sm">
          {/* Mobile menu button - hidden on desktop */}
          <div className="md:hidden">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 flex items-center">
            <span className="text-lg font-bold text-gray-900">{t('dashboard.clinic_name')}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-accent/10 transition-all duration-300">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-xs text-white font-bold shadow-lg animate-pulse">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>{t('header.notifications')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {staffReplies.length > 0 ? (
                  <>
                    {staffReplies.map((reply) => (
                      <DropdownMenuItem key={reply.id} asChild>
                        <Link href="/patient-messages" className="flex items-start gap-2 p-3">
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/patient-messages" className="text-center text-xs text-primary font-semibold w-full justify-center">
                        {t('patient_pages.messages.view_all')}
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem disabled className="p-3">
                    {t('header.no_notifications')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Toggle */}
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

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl hover:bg-accent/10 transition-all duration-300">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Profile Dropdown */}
            <div className="flex items-center gap-3 hover:bg-accent/10 rounded-xl px-3 py-2 transition-all duration-300 group">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <User className="h-5 w-5" />
              </div>
              <div className="hidden flex-col items-start md:flex">
                <span className="text-sm font-semibold text-foreground">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{t('roles.patient')}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
