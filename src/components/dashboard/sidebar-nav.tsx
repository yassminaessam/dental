
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="flex-grow">
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname === "/"}>
          <Link href="/">
            <LayoutGrid />
            Dashboard
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/patients")}>
          <Link href="/patients">
            <Users />
            Patients
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/appointments")}>
          <Link href="/appointments">
            <Calendar />
            Appointments
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/treatments")}>
          <Link href="/treatments">
            <Stethoscope />
            Treatments
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/billing")}>
          <Link href="/billing">
            <Receipt />
            Billing
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/dental-chart")}>
          <Link href="/dental-chart">
            <LineChart />
            Dental Chart
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/staff")}>
          <Link href="/staff">
            <UsersRound />
            Staff
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/medical-records")}>
          <Link href="/medical-records">
            <FolderArchive />
            Medical Records
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/financial")}>
          <Link href="/financial">
            <Landmark />
            Financial
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/inventory")}>
          <Link href="/inventory">
            <Package />
            Inventory
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/pharmacy")}>
          <Link href="/pharmacy">
            <Pill />
            Pharmacy
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/suppliers")}>
          <Link href="/suppliers">
            <Truck />
            Suppliers
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/purchase-orders")}>
          <Link href="/purchase-orders">
            <Truck />
            Purchase Orders
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/communications")}>
          <Link href="/communications">
            <MessageSquare />
            Communications
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/patient-portal")}>
          <Link href="/patient-portal">
            <Globe />
            Patient Portal
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/referrals")}>
          <Link href="/referrals">
            <Send />
            Referrals
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/insurance")}>
          <Link href="/insurance">
            <FileText />
            Insurance
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith("/analytics")}>
          <Link href="/analytics">
            <BarChart />
            Analytics
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/reports')}>
          <Link href="/reports">
            <FileSpreadsheet />
            Reports
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/settings')}>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
