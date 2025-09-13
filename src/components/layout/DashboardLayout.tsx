
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
import { Input } from '../ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Bell, Search, ChevronDown, Package, Clock, User, Settings, LogOut, HelpCircle } from 'lucide-react'
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

type AppointmentLite = { id: string; status: string; patient: string; type: string }
type InventoryItemLite = { id: string; status: string; name: string; stock: number }

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

  const [pendingAppointments, setPendingAppointments] = React.useState<AppointmentLite[]>([])
  const [lowStockItems, setLowStockItems] = React.useState<InventoryItemLite[]>([])

  React.useEffect(() => {
    async function fetchNotifications() {
      const [appointments, inventory] = await Promise.all([
        listDocuments<AppointmentLite>('appointments'),
        listDocuments<InventoryItemLite>('inventory'),
      ])
      setPendingAppointments(appointments.filter((a) => a.status === 'Pending'))
      setLowStockItems(
        inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock')
      )
    }
    fetchNotifications()
  }, [])

  const notificationCount = pendingAppointments.length + lowStockItems.length

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
            <div className="p-2 rounded-xl bg-sidebar-primary/20 backdrop-blur-sm">
              <DentalProLogo className="size-8 text-sidebar-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">{t('dashboard.clinic_name')}</h1>
              <p className="text-xs text-sidebar-foreground/70 font-medium">Elite Operations Dashboard</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex flex-col px-3 py-4">
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
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
            {/* Context-sensitive Help */}
            <Button asChild variant="ghost" size="sm" aria-label={t('nav.help')} className="rounded-xl hover:bg-accent/10 transition-all duration-300">
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
              className="rounded-xl bg-background/60 backdrop-blur-sm border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold min-w-[3rem]"
            >
              {language === 'en' ? 'AR' : 'EN'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl hover:bg-accent/10 transition-all duration-300">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-xs text-white font-bold shadow-lg animate-pulse">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 sm:w-80">
                <DropdownMenuLabel>{t('header.notifications')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {pendingAppointments.length > 0 && (
                  <>
                    {pendingAppointments.map((appt) => (
                      <DropdownMenuItem key={appt.id} asChild>
                        <Link href="/appointments" className="flex items-start gap-2 p-3">
                          <Clock className="mt-1 h-4 w-4 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm">{t('notification.pending_appointment')}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {appt.patient} - {appt.type}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                {lowStockItems.length > 0 && (
                  <>
                    {lowStockItems.map((item) => (
                      <DropdownMenuItem key={item.id} asChild>
                        <Link href="/inventory" className="flex items-start gap-2 p-3">
                          <Package className="mt-1 h-4 w-4 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm">{t('notification.low_stock_alert')}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.name} - {t('inventory.stock')}: {item.stock}
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
                  <Link href="/staff" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('header.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
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
  )
}
