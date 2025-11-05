
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
      permission: "view_billing",
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
      permission: "view_inventory",
    },
    {
      href: "/suppliers",
      icon: Truck,
  label: t('nav.suppliers'),
      subLabel: t('nav.suppliers_desc'),
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
      href: "/patient-portal?tab=content-admin",
      icon: Globe,
  label: t('patient_portal.management_title'),
      subLabel: t('nav.patient_portal_admin_desc'),
      permission: "edit_patient_portal",
    },
    {
      href: "/patient-portal",
      icon: Globe,
  label: t('nav.patient_portal'),
      subLabel: t('nav.patient_portal_desc'),
      permission: user?.role === 'patient' ? "view_own_data" : "view_patients",
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
  ];

  // Filter navigation items based on user permissions
  const visibleItems = navigationItems.filter((item) => {
    // Check role-specific access
    if (item.roleRequired && user?.role !== item.roleRequired) {
      return false;
    }

    // Check permission-based access
    if (item.permission && !AuthService.hasPermission(user, item.permission)) {
      return false;
    }

    return true;
  });

  if (!user) return null;

  // Static color styles (kept literal so Tailwind doesn't purge)
  const colorStyles = [
    { iconBg: 'bg-cyan-500/10', iconText: 'text-cyan-400', ring: 'ring-cyan-400/30' },
    { iconBg: 'bg-sky-500/10', iconText: 'text-sky-400', ring: 'ring-sky-400/30' },
    { iconBg: 'bg-teal-500/10', iconText: 'text-teal-400', ring: 'ring-teal-400/30' },
    { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', ring: 'ring-emerald-400/30' },
    { iconBg: 'bg-green-500/10', iconText: 'text-green-400', ring: 'ring-green-400/30' },
    { iconBg: 'bg-lime-500/10', iconText: 'text-lime-400', ring: 'ring-lime-400/30' },
    { iconBg: 'bg-amber-500/10', iconText: 'text-amber-400', ring: 'ring-amber-400/30' },
    { iconBg: 'bg-orange-500/10', iconText: 'text-orange-400', ring: 'ring-orange-400/30' },
    { iconBg: 'bg-rose-500/10', iconText: 'text-rose-400', ring: 'ring-rose-400/30' },
    { iconBg: 'bg-pink-500/10', iconText: 'text-pink-400', ring: 'ring-pink-400/30' },
    { iconBg: 'bg-fuchsia-500/10', iconText: 'text-fuchsia-400', ring: 'ring-fuchsia-400/30' },
    { iconBg: 'bg-violet-500/10', iconText: 'text-violet-400', ring: 'ring-violet-400/30' },
    { iconBg: 'bg-purple-500/10', iconText: 'text-purple-400', ring: 'ring-purple-400/30' },
    { iconBg: 'bg-indigo-500/10', iconText: 'text-indigo-400', ring: 'ring-indigo-400/30' },
    { iconBg: 'bg-blue-500/10', iconText: 'text-blue-400', ring: 'ring-blue-400/30' },
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
                  className={`flex ${direction === 'rtl' ? 'flex-row-reverse text-right' : 'flex-row'} items-stretch gap-4 w-full rounded-2xl px-4 py-4 min-h-24 border border-sidebar-border/20 bg-sidebar-accent/10 hover:bg-sidebar-accent/20 transition-all duration-300 relative overflow-hidden`}
                >
                  {/* Active bar */}
                  <span
                    className={`absolute ${direction === 'rtl' ? 'right-0' : 'left-0'} top-0 h-full w-1.5 rounded-${direction === 'rtl' ? 'l' : 'r'}-full transition-all duration-300 ${isActive ? 'bg-sidebar-primary opacity-100' : 'bg-sidebar-primary/0 opacity-0 group-hover:opacity-60'}`}
                  />
                  {/* Icon */}
                  <div className={`relative flex-shrink-0 self-center flex items-center justify-center w-14 h-14 rounded-xl ${colors.iconBg} ${colors.ring} ring-1 backdrop-blur-sm transition-all duration-300 group-hover:scale-105`}> 
                    <IconComponent className={`h-7 w-7 ${colors.iconText}`} />
                    {user?.role === 'patient' && isPatientPortalExternal && (
                      <div
                        title={t('nav.patient_portal')}
                        className={`absolute -bottom-1 ${direction === 'rtl' ? '-left-1' : '-right-1'} w-4 h-4 rounded-full bg-sidebar-primary text-sidebar-background flex items-center justify-center ring-2 ring-sidebar-background`}
                      >
                        <User className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  {/* Text Block */}
                  <div className={`flex flex-col flex-1 justify-center ${direction === 'rtl' ? 'pr-1' : 'pl-1'} py-1`}> 
                    <span className={`font-semibold text-sm tracking-wide mb-1 ${isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground'} group-hover:text-sidebar-accent-foreground transition-colors`}> 
                      {item.label}
                    </span>
                    {item.subLabel && (
                      <span className="text-xs font-medium text-sidebar-foreground/70 group-hover:text-sidebar-accent-foreground/90 whitespace-normal break-words leading-snug">
                        {item.subLabel}
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
      
      {/* Elite User Section */}
      <div className="mt-auto border-t border-sidebar-border/50 pt-6 space-y-4">
        {/* User Profile Card */}
        <div className="px-4 py-3 mx-2 rounded-xl bg-sidebar-accent/30 backdrop-blur-sm border border-sidebar-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-accent-foreground flex items-center justify-center">
              <span className="text-sm font-bold text-sidebar-background">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sidebar-foreground text-sm truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-sidebar-foreground/70 capitalize font-medium">
                {user.role} • Online
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
        
        {/* Elite Sign Out Button */}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start mx-2 px-4 py-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive transition-all duration-300 group" 
              onClick={handleSignOut}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-all duration-300">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-medium">{t('nav.sign_out')}</span>
            </Button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </div>
    </div>
  );
}
