
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
import { getCollection } from '../../services/firestore'
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
        getCollection<AppointmentLite>('appointments'),
        getCollection<InventoryItemLite>('inventory'),
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
      <Sidebar side={isRTL ? 'right' : 'left'}>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <DentalProLogo className="size-7 text-primary" />
            <h1 className="text-xl font-bold text-foreground">{t('dashboard.clinic_name')}</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex flex-col">
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-card px-4 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('header.search_placeholder')}
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px] h-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Context-sensitive Help */}
            <Button asChild variant="ghost" size="sm" aria-label={t('nav.help')}>
              <Link href={getHelpHref()} className="flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.help')}</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              aria-label="Language"
            >
              {language === 'en' ? 'AR' : 'EN'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                  {notificationCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
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
                <button className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground rounded-lg px-2 py-1 transition-colors">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarImage
                      src={user?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${getUserInitials()}`}
                      alt={getUserDisplayName()}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start md:flex">
                    <span className="text-sm font-semibold">{getUserDisplayName()}</span>
                    <span className="text-xs text-muted-foreground">{getRoleDisplayName()}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
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
