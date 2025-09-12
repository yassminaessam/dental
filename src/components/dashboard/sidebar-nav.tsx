
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { HelpCircle } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

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
      href: "/patient-home-admin",
      icon: Globe,
  label: t('nav.patient_portal'),
      subLabel: t('nav.patient_portal_admin_desc'),
      permission: "view_patient_portal",
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

  return (
    <div className="flex flex-col h-full">
      <SidebarMenu className="flex-grow space-y-2">
        {visibleItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                asChild 
                isActive={isActive}
                className={`elite-nav-item ${isActive ? 'active' : ''} group relative rounded-xl px-4 py-3 transition-all duration-300 hover:bg-sidebar-accent/80`}
              >
                <Link href={item.href} className="flex items-center gap-3 text-left">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary/10 to-sidebar-primary/20 group-hover:from-sidebar-primary/20 group-hover:to-sidebar-primary/30 transition-all duration-300">
                    <IconComponent className="h-5 w-5 text-sidebar-foreground group-hover:text-sidebar-primary transition-colors duration-300" />
                  </div>
                  <div className="flex flex-col -space-y-0.5">
                    <span className="font-semibold text-sm text-sidebar-foreground group-hover:text-sidebar-accent-foreground tracking-wide">
                      {item.label}
                    </span>
                    {item.subLabel && (
                      <span className="text-[10px] font-medium text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground/70 leading-tight">
                        {item.subLabel}
                      </span>
                    )}
                  </div>
                  {/* Elite Active Indicator */}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-sidebar-primary animate-pulse" />
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
