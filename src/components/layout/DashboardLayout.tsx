
'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, ChevronDown, Package, Clock } from "lucide-react";
import { DentalProLogo } from "@/components/icons";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import Link from "next/link";
import { getCollection } from '@/services/firestore';
import { Appointment } from '@/app/appointments/page';
import { InventoryItem } from '@/app/inventory/page';
import { Button } from '../ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const [pendingAppointments, setPendingAppointments] = React.useState<Appointment[]>([]);
    const [lowStockItems, setLowStockItems] = React.useState<InventoryItem[]>([]);

    React.useEffect(() => {
        async function fetchNotifications() {
            const [appointments, inventory] = await Promise.all([
                getCollection<Appointment>('appointments'),
                getCollection<InventoryItem>('inventory')
            ]);
            setPendingAppointments(appointments.filter(a => a.status === 'Pending'));
            setLowStockItems(inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock'));
        }
        fetchNotifications();
    }, []);

    const notificationCount = pendingAppointments.length + lowStockItems.length;


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <DentalProLogo className="size-7 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Cairo Dental</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex flex-col">
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients, appointments... (⌘K)"
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-6 w-6" />
                        {notificationCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                {notificationCount}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {pendingAppointments.length > 0 && (
                        <>
                            {pendingAppointments.map(appt => (
                                <DropdownMenuItem key={appt.id} asChild>
                                    <Link href="/appointments" className="flex items-start gap-2">
                                        <Clock className="mt-1 h-4 w-4" />
                                        <div>
                                            <p className="font-semibold">Pending Appointment</p>
                                            <p className="text-xs text-muted-foreground">{appt.patient} - {appt.type}</p>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </>
                    )}
                    {lowStockItems.length > 0 && (
                         <>
                            {lowStockItems.map(item => (
                                <DropdownMenuItem key={item.id} asChild>
                                    <Link href="/inventory" className="flex items-start gap-2">
                                        <Package className="mt-1 h-4 w-4" />
                                        <div>
                                            <p className="font-semibold">Low Stock Alert</p>
                                            <p className="text-xs text-muted-foreground">{item.name} - Stock: {item.stock}</p>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </>
                    )}
                    {notificationCount === 0 && (
                        <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src="https://placehold.co/40x40"
                      data-ai-hint="person"
                    />
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start md:flex">
                    <span className="text-sm font-semibold">Super Admin</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/staff">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
