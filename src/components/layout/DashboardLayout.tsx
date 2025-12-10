
'use client'

import * as React from 'react'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from '../ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Bell, ChevronDown, Package, Clock, User, Settings, LogOut, HelpCircle, MessageSquare, Calendar } from 'lucide-react'
import { DentalProLogo } from '../icons'
import { SidebarNav } from '../dashboard/sidebar-nav'
import Link from 'next/link'
// Switched from deprecated firestore compatibility layer to unified database service
// Using client REST data layer instead of server/database helper for collections
import { listDocuments } from '@/lib/data-client'
import { Button } from '../ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useToast } from '../../hooks/use-toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { usePathname } from 'next/navigation'
import { useNotifications } from '../../hooks/use-notifications'
import Image from 'next/image'
import { getClientFtpProxyUrl } from '@/lib/ftp-proxy-url'

type AppointmentLite = { id: string; status: string; patient: string; type: string }
type InventoryItemLite = { id: string; status: string; name: string; stock: number }
type PatientMessageLite = { id: string; patientName: string; patientEmail: string; subject: string; from: string; createdAt: string }
type ChatMessageLite = { id: string; message: string; senderName: string; createdAt: string; conversation: { id: string; patientName: string; patientEmail: string } }

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = useAuth() as any
  const { user, signOut } = auth
  const router = useRouter()
  const { toast } = useToast()
  const { t, language, setLanguage, isRTL } = useLanguage()
  const pathname = usePathname()

  // Use database-backed notification hook
  const {
    notifications,
    unreadNotifications,
    unreadCount,
    markAsRead,
    refetch: refetchNotifications,
  } = useNotifications(user?.id)

  // Clinic settings for logo and name - Initialize as null to prevent hydration mismatch
  const [clinicLogo, setClinicLogo] = React.useState<string | null>(null)
  const [clinicName, setClinicName] = React.useState<string>('')
  const [isHydrated, setIsHydrated] = React.useState(false)
  const [currentDateTime, setCurrentDateTime] = React.useState<Date | null>(null)
  
  // Update date/time every second
  React.useEffect(() => {
    setCurrentDateTime(new Date())
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  // Load from localStorage after hydration
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setClinicLogo(localStorage.getItem('clinicLogo') || null)
      setClinicName(localStorage.getItem('clinicName') || '')
      setIsHydrated(true)
    }
  }, [])

  // Set browser title and favicon immediately from cache
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedName = localStorage.getItem('clinicName')
      const cachedFavicon = localStorage.getItem('clinicFavicon')
      
      if (cachedName) {
        document.title = cachedName
      }
      
      if (cachedFavicon) {
        // Safe update from cache - no removal, just update href
        updateFaviconSafe(cachedFavicon)
      }
    }
  }, [])

  const updateFaviconSafe = (url: string) => {
    if (typeof window === 'undefined') return
    
    try {
      const fullUrl = `${getClientFtpProxyUrl(url)}?v=${Date.now()}`
      
      // Update all favicon link types for cross-browser compatibility (including Safari)
      const faviconSelectors = [
        "link[rel='icon']",
        "link[rel='shortcut icon']",
        "link[rel='apple-touch-icon']",
        "link[rel='mask-icon']"
      ]
      
      faviconSelectors.forEach((selector) => {
        let link = document.querySelector(selector) as HTMLLinkElement
        
        if (!link) {
          link = document.createElement('link')
          if (selector.includes('shortcut')) {
            link.rel = 'shortcut icon'
          } else if (selector.includes('apple-touch')) {
            link.rel = 'apple-touch-icon'
          } else if (selector.includes('mask-icon')) {
            link.rel = 'mask-icon'
            link.setAttribute('color', '#2563eb')
          } else {
            link.rel = 'icon'
            link.type = 'image/svg+xml'
          }
          document.head.appendChild(link)
        }
        
        link.href = fullUrl
      })
    } catch (error) {
      console.warn('Failed to update favicon:', error)
    }
  }

  // Fetch clinic settings for logo and name
  React.useEffect(() => {
    async function fetchClinicSettings() {
      try {
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            const name = data.settings.clinicName || t('dashboard.clinic_name')
            const logo = data.settings.logoUrl
            const favicon = data.settings.faviconUrl
            
            // Update state
            setClinicLogo(logo)
            setClinicName(name)
            
            // Cache in localStorage for instant load next time
            if (logo) {
              localStorage.setItem('clinicLogo', logo)
            } else {
              localStorage.removeItem('clinicLogo')
            }
            if (name) {
              localStorage.setItem('clinicName', name)
              document.title = name
            }
            if (favicon) {
              localStorage.setItem('clinicFavicon', favicon)
              updateFaviconSafe(favicon)
            } else {
              localStorage.removeItem('clinicFavicon')
            }
          }
        }
      } catch (error) {
        console.warn('Failed to fetch clinic settings:', error)
      }
    }
    
    fetchClinicSettings()
  }, [t])

  // Refresh notifications every 30 seconds
  React.useEffect(() => {
    if (!user?.id) return
    
    const interval = setInterval(() => {
      refetchNotifications()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [user?.id, refetchNotifications])

  // Handler to mark notification as read when clicked
  const handleNotificationClick = async (notificationId: string, link?: string | null) => {
    await markAsRead(notificationId)
    if (link) {
      router.push(link)
    }
  }

  // Group notifications by type for display
  const groupedNotifications = React.useMemo(() => {
    const groups = {
      appointments: unreadNotifications.filter(n => n.type.includes('APPOINTMENT')),
      inventory: unreadNotifications.filter(n => n.type.includes('INVENTORY')),
      messages: unreadNotifications.filter(n => n.type === 'MESSAGE_RECEIVED'),
      chats: unreadNotifications.filter(n => n.type === 'CHAT_MESSAGE'),
      other: unreadNotifications.filter(n => 
        !n.type.includes('APPOINTMENT') && 
        !n.type.includes('INVENTORY') && 
        n.type !== 'MESSAGE_RECEIVED' && 
        n.type !== 'CHAT_MESSAGE'
      ),
    }
    return groups
  }, [unreadNotifications])

  const getUserInitials = () => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }

  const getUserDisplayName = () => {
    if (!user) return 'User'
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
  }

  const getRoleDisplayName = () => {
    if (!user) return ''
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      doctor: 'Doctor',
      receptionist: 'Receptionist',
      patient: 'Patient',
    }
    return roleMap[user.role] || user.role
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: t('message.logout_success'),
        description: t('message.logout_success_desc'),
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: t('message.logout_failed'),
        description: t('message.logout_failed_desc'),
        variant: 'destructive',
      })
    }
  }

  // Map current page to help section anchor
  const helpAnchorMap: Record<string, string> = {
    '/': '#quickstart',
    '/patients': '#patients',
    '/appointments': '#appointments',
    '/treatments': '#treatments',
    '/billing': '#billing',
    '/insurance': '#insurance',
    '/inventory': '#inventory',
    '/pharmacy': '#pharmacy',
    '/suppliers': '#suppliers',
    '/communications': '#communications',
    '/staff': '#staff',
    '/medical-records': '#patients', // closest relevant section
    '/dental-chart': '#treatments', // related to treatments & teeth
    '/analytics': '#analytics',
    '/reports': '#analytics',
    '/settings': '#settings',
    '/admin/users': '#permissions',
    '/patient-portal': '#portal',
    '/patient-home-admin': '#portal',
  }

  const getHelpHref = () => {
    // Find first matching base path in the map
    const entry = Object.keys(helpAnchorMap).find((key) =>
      key === '/' ? pathname === '/' : pathname.startsWith(key)
    )
    const anchor = entry ? helpAnchorMap[entry] : '#quickstart'
    return `/help${anchor}`
  }

  return (
    <SidebarProvider>
      <Sidebar side={isRTL ? 'right' : 'left'} className="elite-sidebar">
        <SidebarHeader className="border-b border-sidebar-border/50 bg-sidebar-background/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3">
            {isHydrated && clinicLogo ? (
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
              <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">{isHydrated && clinicName ? clinicName : t('dashboard.clinic_name')}</h1>
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
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="overflow-x-hidden">
        <header className="elite-header flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 sm:gap-4 border-b border-border/50 px-4 sm:px-8 py-3">
          <div className="flex w-full items-center gap-2 order-1">
            <SidebarTrigger className="md:hidden shrink-0" />
            <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
              <Button
                asChild
                variant="ghost"
                size="sm"
                aria-label={t('nav.help')}
                className="rounded-xl hover:bg-accent/10 transition-all duration-300 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
              >
                <Link href={getHelpHref()} className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">{t('nav.help')}</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                aria-label="Language"
                className="rounded-xl bg-background/60 backdrop-blur-sm border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold min-w-[2.5rem] h-9 sm:h-10 text-xs sm:text-sm"
              >
                {language === 'en' ? 'AR' : 'EN'}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-xl hover:bg-accent/10 transition-all duration-300">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-xs text-white font-bold shadow-lg animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 sm:w-80 max-h-[500px] overflow-y-auto">
                  <DropdownMenuLabel>{t('header.notifications')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                {groupedNotifications.appointments.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className="flex items-start gap-2 p-3 cursor-pointer"
                  >
                    <Clock className="mt-1 h-4 w-4 flex-shrink-0 text-orange-500" />
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
                {groupedNotifications.messages.map((notification) => (
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
                {groupedNotifications.inventory.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className="flex items-start gap-2 p-3 cursor-pointer"
                  >
                    <Package className="mt-1 h-4 w-4 flex-shrink-0 text-red-500" />
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
                {groupedNotifications.other.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                    className="flex items-start gap-2 p-3 cursor-pointer"
                  >
                    <Bell className="mt-1 h-4 w-4 flex-shrink-0" />
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
                  {groupedNotifications.other.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id, notification.link)}
                      className="flex items-start gap-2 p-3 cursor-pointer"
                    >
                      <Bell className="mt-1 h-4 w-4 flex-shrink-0" />
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
                  <button className="flex items-center gap-2 sm:gap-3 hover:bg-accent/10 rounded-xl px-3 py-2 transition-all duration-300 group">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary/40">
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
                      <span className="text-xs text-muted-foreground font-medium">{getRoleDisplayName()}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{getRoleDisplayName()}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t('header.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/user-settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {t('user_settings.title')}
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {t('nav.settings')}
                      </Link>
                    </DropdownMenuItem>
                  )}
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
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
