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
  ClipboardPen,
  BarChart,
  FileSpreadsheet,
  Settings,
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
        <SidebarMenuButton>
          <FolderArchive />
          Medical Records
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Landmark />
          Financial
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Package />
          Inventory
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Pill />
          Pharmacy
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Truck />
          Suppliers
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <MessageSquare />
          Communications
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Globe />
          Patient Portal
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Send />
          Referrals
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <FileText />
          Insurance
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <ClipboardPen />
          Prescriptions
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <BarChart />
          Analytics
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <FileSpreadsheet />
          Reports
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Settings />
          Settings
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
