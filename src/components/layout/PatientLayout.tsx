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

const patientNavItems = [
  {
    title: 'Home',
    href: '/patient-home',
    icon: Home,
    description: 'Your dental care dashboard'
  },
  {
    title: 'My Appointments',
    href: '/patient-appointments',
    icon: Calendar,
    description: 'View and manage your appointments'
  },
  {
    title: 'Messages',
    href: '/patient-messages',
    icon: MessageSquare,
    description: 'Communicate with your dental team'
  },
  {
    title: 'Medical Records',
    href: '/patient-records',
    icon: FileText,
    description: 'Access your dental records'
  },
  {
    title: 'Billing',
    href: '/patient-billing',
    icon: CreditCard,
    description: 'View invoices and payment history'
  },
  {
    title: 'Profile',
    href: '/patient-profile',
    icon: User,
    description: 'Manage your profile information'
  }
];

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isRTL, t } = useLanguage();

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
                    <div>{item.title}</div>
                    <div className={cn(
                      'text-xs',
                      isActive ? 'text-primary-foreground/80' : 'text-gray-400'
                    )}>
                      {item.description}
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
        {/* Top bar for mobile */}
        <div className="md:hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <div className="flex-1 px-4 flex justify-between items-center">
              <div className={cn('flex items-center', isRTL ? 'space-x-reverse space-x-2' : 'space-x-2')}>
                <Heart className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">{t('dashboard.clinic_name')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-400" />
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
