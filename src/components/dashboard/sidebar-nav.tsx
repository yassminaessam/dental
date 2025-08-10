
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
      <SidebarMenu className="flex-grow">
        {visibleItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}>
                <Link href={item.href}>
                  <IconComponent />
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
      
      {/* User info and sign out */}
      <div className="mt-auto border-t pt-4 space-y-2">
        <div className="px-2 py-1 text-sm text-muted-foreground">
          <div className="font-medium">{user.firstName} {user.lastName}</div>
          <div className="text-xs capitalize">{user.role}</div>
        </div>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('nav.sign_out')}
            </Button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </div>
    </div>
  );
}
