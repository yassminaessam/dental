
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
      permission: null,
    },
    {
      href: "/",
      icon: LayoutGrid,
  label: t('nav.dashboard'),
      permission: null, // Everyone can access dashboard
    },
    {
      href: "/patients",
      icon: Users,
  label: t('nav.patients'),
      permission: "view_patients",
    },
    {
      href: "/appointments",
      icon: Calendar,
  label: t('nav.appointments'),
      permission: "view_appointments",
    },
    {
      href: "/treatments",
      icon: Stethoscope,
  label: t('nav.treatments'),
      permission: "view_treatments",
    },
    {
      href: "/billing",
      icon: Receipt,
  label: t('nav.billing'),
      permission: "view_billing",
    },
    {
      href: "/dental-chart",
      icon: LineChart,
  label: t('nav.dental_chart'),
      permission: "view_dental_chart",
    },
    {
      href: "/staff",
      icon: UsersRound,
  label: t('nav.staff'),
      permission: "view_staff",
    },
    {
      href: "/medical-records",
      icon: FolderArchive,
  label: t('nav.medical_records'),
      permission: "view_medical_records",
    },
    {
      href: "/financial",
      icon: Landmark,
  label: t('nav.financial'),
      permission: "view_billing",
    },
    {
      href: "/inventory",
      icon: Package,
  label: t('nav.inventory'),
      permission: "view_inventory",
    },
    {
      href: "/pharmacy",
      icon: Pill,
  label: t('nav.pharmacy'),
      permission: "view_inventory",
    },
    {
      href: "/suppliers",
      icon: Truck,
  label: t('nav.suppliers'),
      permission: "view_inventory",
    },
    {
      href: "/communications",
      icon: MessageSquare,
  label: t('nav.communications'),
      permission: "view_communications",
    },
    {
      href: "/patient-home-admin",
      icon: Globe,
  label: t('nav.patient_portal'),
      permission: "view_patient_portal",
    },
    {
      href: "/patient-portal",
      icon: Globe,
  label: t('nav.patient_portal'),
      permission: user?.role === 'patient' ? "view_own_data" : "view_patients",
    },
    {
      href: "/referrals",
      icon: Send,
  label: t('nav.referrals'),
      permission: "view_patients",
    },
    {
      href: "/insurance",
      icon: FileText,
  label: t('nav.insurance'),
      permission: "view_insurance",
    },
    {
      href: "/analytics",
      icon: BarChart,
  label: t('nav.analytics'),
      permission: "view_analytics",
    },
    {
      href: "/reports",
      icon: FileSpreadsheet,
  label: t('nav.reports'),
      permission: "view_reports",
    },
    {
      href: "/admin/users",
      icon: Shield,
  label: t('nav.user_management'),
      permission: null,
      roleRequired: "admin",
    },
    {
      href: "/settings",
      icon: Settings,
  label: t('nav.settings'),
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
                <Link href={item.href} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary/10 group-hover:bg-sidebar-primary/20 transition-all duration-300">
                    <IconComponent className="h-4 w-4 text-sidebar-foreground group-hover:text-sidebar-primary transition-colors duration-300" />
                  </div>
                  <span className="font-medium text-sidebar-foreground group-hover:text-sidebar-accent-foreground transition-colors duration-300">
                    {item.label}
                  </span>
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
