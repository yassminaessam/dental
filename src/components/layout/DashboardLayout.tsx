
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
import { Bell, Search, ChevronDown, Package, Clock, User, Settings, LogOut } from "lucide-react";
import { DentalProLogo } from "@/components/icons";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import Link from "next/link";
import { getCollection } from '@/services/firestore';
import { Appointment } from '@/app/appointments/page';
import { InventoryItem } from '@/app/inventory/page';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
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

    // Helper function to get user initials
    const getUserInitials = () => {
        if (!user) return 'U';
        return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    };

    // Helper function to get user display name
    const getUserDisplayName = () => {
        if (!user) return 'User';
        return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    };

    // Helper function to get role display name
    const getRoleDisplayName = () => {
        if (!user) return '';
        const roleMap = {
            'admin': 'Administrator',
            'doctor': 'Doctor',
            'receptionist': 'Receptionist',
            'patient': 'Patient'
        };
        return roleMap[user.role] || user.role;
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut();
            toast({
                title: "Logged out successfully",
                description: "You have been signed out of your account.",
            });
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast({
                title: "Logout failed",
                description: "There was an error signing out. Please try again.",
                variant: "destructive",
            });
        }
    };


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
        <header className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-card px-4 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search... (⌘K)"
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px] h-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
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
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {pendingAppointments.length > 0 && (
                        <>
                            {pendingAppointments.map(appt => (
                                <DropdownMenuItem key={appt.id} asChild>
                                    <Link href="/appointments" className="flex items-start gap-2 p-3">
                                        <Clock className="mt-1 h-4 w-4 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-sm">Pending Appointment</p>
                                            <p className="text-xs text-muted-foreground truncate">{appt.patient} - {appt.type}</p>
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
                                    <Link href="/inventory" className="flex items-start gap-2 p-3">
                                        <Package className="mt-1 h-4 w-4 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-sm">Low Stock Alert</p>
                                            <p className="text-xs text-muted-foreground truncate">{item.name} - Stock: {item.stock}</p>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </>
                    )}
                    {notificationCount === 0 && (
                        <DropdownMenuItem disabled className="p-3">No new notifications</DropdownMenuItem>
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
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getRoleDisplayName()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/staff" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
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
