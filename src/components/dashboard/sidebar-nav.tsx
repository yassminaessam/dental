
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthService } from "@/lib/auth";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutGrid,
  Users,
  Calendar,
  Stethoscope,
  LineChart,
  UsersRound,
  FolderArchive,
  Landmark,
  Package,
  Pill,
  Truck,
  MessageSquare,
  Globe,
  Send,
  FileText,
  BarChart,
  FileSpreadsheet,
  Settings,
  Receipt,
  Shield,
  LogOut,
  User,
  MessageCircle,
  Layout,
  FlaskConical,
  Clock,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { HelpCircle } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t, direction } = useLanguage();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('message.signed_out'),
        description: t('message.signed_out_desc'),
      });
    } catch (error: any) {
      toast({
        title: t('message.sign_out_error'),
        description: t('message.sign_out_error_desc'),
        variant: "destructive",
      });
    }
  };

  // Define navigation items with permission requirements
  const navigationItems = [
    {
      href: "/help",
      icon: HelpCircle,
      label: t('nav.help'),
      subLabel: t('nav.help_desc'),
      permission: null,
    },
    {
      href: "/",
      icon: LayoutGrid,
  label: t('nav.dashboard'),
      subLabel: t('nav.dashboard_desc'),
      permission: null, // Everyone can access dashboard
    },
    {
      href: "/patients",
      icon: Users,
  label: t('nav.patients'),
      subLabel: t('nav.patients_desc'),
      permission: "view_patients",
    },
    {
      href: "/appointments",
      icon: Calendar,
  label: t('nav.appointments'),
      subLabel: t('nav.appointments_desc'),
      permission: "view_appointments",
    },
    {
      href: "/treatments",
      icon: Stethoscope,
  label: t('nav.treatments'),
      subLabel: t('nav.treatments_desc'),
      permission: "view_treatments",
    },
    {
      href: "/billing",
      icon: Receipt,
  label: t('nav.billing'),
      subLabel: t('nav.billing_desc'),
      permission: "view_billing",
    },
    {
      href: "/wallets",
      icon: Wallet,
      label: t('nav.wallets'),
      subLabel: t('nav.wallets_desc'),
      permission: "view_billing",
    },
    {
      href: "/dental-chart",
      icon: LineChart,
  label: t('nav.dental_chart'),
      subLabel: t('nav.dental_chart_desc'),
      permission: "view_dental_chart",
    },
    {
      href: "/staff",
      icon: UsersRound,
  label: t('nav.staff'),
      subLabel: t('nav.staff_desc'),
      permission: "view_staff",
    },
    {
      href: "/attendance",
      icon: Clock,
      label: t('nav.attendance'),
      subLabel: t('nav.attendance_desc'),
      permission: "view_staff",
    },
    {
      href: "/medical-records",
      icon: FolderArchive,
  label: t('nav.medical_records'),
      subLabel: t('nav.medical_records_desc'),
      permission: "view_medical_records",
    },
    {
      href: "/financial",
      icon: Landmark,
  label: t('nav.financial'),
      subLabel: t('nav.financial_desc'),
      permission: "view_financial",
    },
    {
      href: "/inventory",
      icon: Package,
  label: t('nav.inventory'),
      subLabel: t('nav.inventory_desc'),
      permission: "view_inventory",
    },
    {
      href: "/pharmacy",
      icon: Pill,
  label: t('nav.pharmacy'),
      subLabel: t('nav.pharmacy_desc'),
      permission: "view_pharmacy",
    },
    {
      href: "/suppliers",
      icon: Truck,
  label: t('nav.suppliers'),
      subLabel: t('nav.suppliers_desc'),
      permission: "view_suppliers",
    },
    {
      href: "/lab-management",
      icon: FlaskConical,
      label: t('nav.lab_management'),
      subLabel: t('nav.lab_management_desc'),
      permission: "view_inventory",
    },
    {
      href: "/communications",
      icon: MessageSquare,
  label: t('nav.communications'),
      subLabel: t('nav.communications_desc'),
      permission: "view_communications",
    },
    {
      href: "/admin/chats",
      icon: MessageCircle,
      label: t('nav.chats'),
      subLabel: t('nav.chats_desc'),
      permission: "view_chats",
    },
    {
      href: "/patient-portal?tab=content-admin",
      icon: Globe,
  label: t('patient_portal.management_title'),
      subLabel: t('nav.patient_portal_admin_desc'),
      permission: "edit_patient_portal",
    },
    {
      href: "/referrals",
      icon: Send,
  label: t('nav.referrals'),
      subLabel: t('nav.referrals_desc'),
      permission: "view_patients",
    },
    {
      href: "/insurance",
      icon: FileText,
  label: t('nav.insurance'),
      subLabel: t('nav.insurance_desc'),
      permission: "view_insurance",
    },
    {
      href: "/analytics",
      icon: BarChart,
  label: t('nav.analytics'),
      subLabel: t('nav.analytics_desc'),
      permission: "view_analytics",
    },
    {
      href: "/reports",
      icon: FileSpreadsheet,
  label: t('nav.reports'),
      subLabel: t('nav.reports_desc'),
      permission: "view_reports",
    },
    {
      href: "/admin/users",
      icon: Shield,
  label: t('nav.user_management'),
      subLabel: t('nav.user_management_desc'),
      permission: null,
      roleRequired: "admin",
    },
    {
      href: "/settings",
      icon: Settings,
  label: t('nav.settings'),
      subLabel: t('nav.settings_desc'),
      permission: "view_settings",
    },
    {
      href: "/website-edit",
      icon: Layout,
      label: t('nav.website_edit'),
      subLabel: t('nav.website_edit_desc'),
      permission: "view_settings",
    },
  ];

  // Filter navigation items based on user permissions
  // Admin override: show all navigation items regardless of permission flags.
  const visibleItems = navigationItems.filter((item) => {
    if (!user) return false;
    if (user.role === 'admin') {
      // Admin sees everything; still respect roleRequired if explicitly not admin (none currently).
      if (item.roleRequired && item.roleRequired !== 'admin') return false;
      return true;
    }

    // Check role-specific access for non-admin roles
    if (item.roleRequired && user.role !== item.roleRequired) {
      return false;
    }

    // Check permission-based access for non-admin roles
    if (item.permission && !AuthService.hasPermission(user, item.permission)) {
      return false;
    }

    return true;
  });

  if (!user) return null;

  // Static color styles for light mode (kept literal so Tailwind doesn't purge)
  const colorStyles = [
    { iconBg: 'bg-cyan-100', iconText: 'text-cyan-600', ring: 'ring-cyan-200' },
    { iconBg: 'bg-sky-100', iconText: 'text-sky-600', ring: 'ring-sky-200' },
    { iconBg: 'bg-teal-100', iconText: 'text-teal-600', ring: 'ring-teal-200' },
    { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', ring: 'ring-emerald-200' },
    { iconBg: 'bg-green-100', iconText: 'text-green-600', ring: 'ring-green-200' },
    { iconBg: 'bg-lime-100', iconText: 'text-lime-600', ring: 'ring-lime-200' },
    { iconBg: 'bg-amber-100', iconText: 'text-amber-600', ring: 'ring-amber-200' },
    { iconBg: 'bg-orange-100', iconText: 'text-orange-600', ring: 'ring-orange-200' },
    { iconBg: 'bg-rose-100', iconText: 'text-rose-600', ring: 'ring-rose-200' },
    { iconBg: 'bg-pink-100', iconText: 'text-pink-600', ring: 'ring-pink-200' },
    { iconBg: 'bg-fuchsia-100', iconText: 'text-fuchsia-600', ring: 'ring-fuchsia-200' },
    { iconBg: 'bg-violet-100', iconText: 'text-violet-600', ring: 'ring-violet-200' },
    { iconBg: 'bg-purple-100', iconText: 'text-purple-600', ring: 'ring-purple-200' },
    { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', ring: 'ring-indigo-200' },
    { iconBg: 'bg-blue-100', iconText: 'text-blue-600', ring: 'ring-blue-200' },
  ];

  return (
    <div className="flex flex-col h-full">
      <SidebarMenu className="flex-grow space-y-2">
        {visibleItems.map((item, index) => {
          const IconComponent = item.icon;
          const hrefPath = typeof item.href === 'string' ? item.href.split('?')[0] : (item.href as any)?.pathname ?? '';
          const isActive = pathname === hrefPath || (hrefPath !== "/" && pathname.startsWith(hrefPath));
          const isPatientPortalExternal = hrefPath === '/patient-portal';
          const colors = colorStyles[index % colorStyles.length];
          
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                className={`group relative w-full p-0 bg-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none`}
              >
                <Link
                  href={item.href as any}
                  className={`flex ${direction === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row'} items-stretch gap-4 w-full rounded-xl px-4 py-3 min-h-20 border bg-white/60 dark:bg-sidebar-accent/20 hover:bg-white dark:hover:bg-sidebar-accent/40 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden ${isActive ? 'border-primary/30 bg-primary/5 dark:bg-sidebar-primary/10' : 'border-sidebar-border/30'}`}
                >
                  {/* Active bar */}
                  <span
                    className={`absolute ${direction === 'rtl' ? 'right-0' : 'left-0'} top-0 h-full w-1 rounded-${direction === 'rtl' ? 'l' : 'r'}-full transition-all duration-300 ${isActive ? 'bg-primary opacity-100' : 'bg-primary/0 opacity-0 group-hover:bg-primary/40 group-hover:opacity-60'}`}
                  />
                  {/* Icon */}
                  <div className={`relative flex-shrink-0 self-center flex items-center justify-center w-12 h-12 rounded-xl ${colors.iconBg} ${colors.ring} ring-1 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md`}> 
                    <IconComponent className={`h-6 w-6 ${colors.iconText}`} />
                    {user?.role === 'patient' && isPatientPortalExternal && (
                      <div
                        title={t('nav.patient_portal')}
                        className={`absolute -bottom-1 ${direction === 'rtl' ? '-left-1' : '-right-1'} w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center ring-2 ring-white`}
                      >
                        <User className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  {/* Text Block */}
                  <div className={`flex flex-col flex-1 justify-center ${direction === 'rtl' ? 'pr-1' : 'pl-1'} py-1`}> 
                    <span className={`font-semibold text-sm tracking-wide mb-0.5 ${isActive ? 'text-primary dark:text-sidebar-primary' : 'text-slate-700 dark:text-sidebar-foreground'} group-hover:text-primary dark:group-hover:text-sidebar-primary transition-colors`}> 
                      {item.label}
                    </span>
                    {item.subLabel && (
                      <span className="text-xs font-medium text-slate-500 dark:text-sidebar-foreground/70 group-hover:text-slate-600 dark:group-hover:text-sidebar-accent-foreground/90 whitespace-normal break-words leading-snug">
                        {item.subLabel}
                      </span>
                    )}
                  </div>
                  {/* Active pulse dot */}
                  {isActive && (
                    <div className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-2 w-2 h-2 rounded-full bg-primary shadow-[0_0_0_3px_rgba(var(--primary-rgb),0.2)] animate-pulse`} />
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
      
      {/* Elite User Section */}
      <div className="mt-auto border-t border-sidebar-border/40 pt-5 space-y-3">
        {/* User Profile Card */}
        <div className="px-3 py-3 mx-2 rounded-xl bg-white/60 dark:bg-sidebar-accent/30 shadow-sm border border-sidebar-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-700 dark:text-sidebar-foreground text-sm truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-slate-500 dark:text-sidebar-foreground/70 capitalize font-medium">
                {user.role} • Online
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-sm" />
          </div>
        </div>
        
        {/* Elite Sign Out Button */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start mx-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-destructive/10 hover:bg-red-100 dark:hover:bg-destructive/20 text-red-600 dark:text-destructive hover:text-red-700 dark:hover:text-destructive transition-all duration-300 group border border-red-200/50 dark:border-transparent" 
              onClick={handleSignOut}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-destructive/10 group-hover:bg-red-200 dark:group-hover:bg-destructive/20 transition-all duration-300">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-medium">{t('nav.sign_out')}</span>
            </Button>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        {/* Bottom spacing */}
        <div className="pb-4" />
      </div>
    </div>
  );
}
