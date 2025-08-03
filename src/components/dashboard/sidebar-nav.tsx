
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

export function SidebarNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  // Define navigation items with permission requirements
  const navigationItems = [
    {
      href: "/",
      icon: LayoutGrid,
      label: "Dashboard",
      permission: null, // Everyone can access dashboard
    },
    {
      href: "/patients",
      icon: Users,
      label: "Patients",
      permission: "view_patients",
    },
    {
      href: "/appointments",
      icon: Calendar,
      label: "Appointments",
      permission: "view_appointments",
    },
    {
      href: "/treatments",
      icon: Stethoscope,
      label: "Treatments",
      permission: "view_treatments",
    },
    {
      href: "/billing",
      icon: Receipt,
      label: "Billing",
      permission: "view_billing",
    },
    {
      href: "/dental-chart",
      icon: LineChart,
      label: "Dental Chart",
      permission: "view_dental_chart",
    },
    {
      href: "/staff",
      icon: UsersRound,
      label: "Staff",
      permission: "view_staff",
    },
    {
      href: "/medical-records",
      icon: FolderArchive,
      label: "Medical Records",
      permission: "view_medical_records",
    },
    {
      href: "/financial",
      icon: Landmark,
      label: "Financial",
      permission: "view_billing",
    },
    {
      href: "/inventory",
      icon: Package,
      label: "Inventory",
      permission: "view_inventory",
    },
    {
      href: "/pharmacy",
      icon: Pill,
      label: "Pharmacy",
      permission: "view_inventory",
    },
    {
      href: "/suppliers",
      icon: Truck,
      label: "Suppliers",
      permission: "view_inventory",
    },
    {
      href: "/communications",
      icon: MessageSquare,
      label: "Communications",
      permission: "view_communications",
    },
    {
      href: "/patient-home-admin",
      icon: Globe,
      label: "Patient Portal",
      permission: "view_patient_portal",
    },
    {
      href: "/patient-portal",
      icon: Globe,
      label: "Patient Portal",
      permission: user?.role === 'patient' ? "view_own_data" : "view_patients",
    },
    {
      href: "/referrals",
      icon: Send,
      label: "Referrals",
      permission: "view_patients",
    },
    {
      href: "/insurance",
      icon: FileText,
      label: "Insurance",
      permission: "view_insurance",
    },
    {
      href: "/analytics",
      icon: BarChart,
      label: "Analytics",
      permission: "view_analytics",
    },
    {
      href: "/reports",
      icon: FileSpreadsheet,
      label: "Reports",
      permission: "view_reports",
    },
    {
      href: "/admin/users",
      icon: Shield,
      label: "User Management",
      permission: null,
      roleRequired: "admin",
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
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
              Sign Out
            </Button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </div>
    </div>
  );
}
