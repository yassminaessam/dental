
'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CalendarCheck,
  DollarSign,
  UserCheck,
  Clock,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCollection } from '@/services/firestore';
import type { Patient } from '@/app/patients/page';
import type { Appointment } from '@/app/appointments/page';
import type { StaffMember } from '@/app/staff/page';
import type { Invoice } from '@/app/billing/page';
import type { Treatment } from '@/app/treatments/page';

const iconMap = {
  Users,
  CalendarCheck,
  DollarSign,
  UserCheck,
  Clock,
  CheckCircle,
};

type IconKey = keyof typeof iconMap;

export default function OverviewStats() {
    const [stats, setStats] = React.useState([
        { title: "Total Patients", value: "0", change: "+0%", icon: "Users", changeType: "neutral", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
        { title: "Today's Appointments", value: "0", change: "+0%", icon: "CalendarCheck", changeType: "neutral", iconBg: "bg-green-100", iconColor: "text-green-600" },
        { title: "Total Revenue", value: "EGP 0", change: "+0%", icon: "DollarSign", changeType: "neutral", iconBg: "bg-yellow-100", iconColor: "text-yellow-500" },
        { title: "Active Staff", value: "0", change: "0%", icon: "UserCheck", changeType: "neutral", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
        { title: "Pending Appointments", value: "0", change: "0%", icon: "Clock", changeType: "neutral", iconBg: "bg-orange-100", iconColor: "text-orange-500" },
        { title: "Completed Treatments", value: "0", change: "+0%", icon: "CheckCircle", changeType: "neutral", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
    ]);

    React.useEffect(() => {
        async function fetchStats() {
            try {
                const [patients, appointments, staff, invoices, treatments] = await Promise.all([
                    getCollection<Patient>('patients'),
                    getCollection<Appointment>('appointments'),
                    getCollection<StaffMember>('staff'),
                    getCollection<Invoice>('invoices'),
                    getCollection<Treatment>('treatments'),
                ]);

                const totalPatients = patients.length;
                const todaysAppointments = appointments.filter(a => new Date(a.dateTime).toDateString() === new Date().toDateString()).length;
                const totalRevenue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
                const activeStaff = staff.filter(s => s.status === 'Active').length;
                const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
                const completedTreatments = treatments.filter(t => t.status === 'Completed').length;
                
                setStats([
                    { title: "Total Patients", value: `${totalPatients}`, change: "+12%", icon: "Users", changeType: "positive", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
                    { title: "Today's Appointments", value: `${todaysAppointments}`, change: "+5%", icon: "CalendarCheck", changeType: "positive", iconBg: "bg-green-100", iconColor: "text-green-600" },
                    { title: "Total Revenue", value: `EGP ${totalRevenue.toLocaleString()}`, change: "+8%", icon: "DollarSign", changeType: "positive", iconBg: "bg-yellow-100", iconColor: "text-yellow-500" },
                    { title: "Active Staff", value: `${activeStaff}`, change: "100%", icon: "UserCheck", changeType: "neutral", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
                    { title: "Pending Appointments", value: `${pendingAppointments}`, change: "-2%", icon: "Clock", changeType: "negative", iconBg: "bg-orange-100", iconColor: "text-orange-500" },
                    { title: "Completed Treatments", value: `${completedTreatments}`, change: "+15%", icon: "CheckCircle", changeType: "positive", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
                ]);

            } catch (error) {
                console.error("Failed to fetch overview stats:", error);
            }
        }
        fetchStats();
    }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon as IconKey];
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  stat.iconBg,
                  stat.iconColor
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    {
                      "bg-green-100 text-green-800":
                        stat.changeType === "positive",
                      "bg-red-100 text-red-800": stat.changeType === "negative",
                      "bg-gray-100 text-gray-800": stat.changeType === "neutral",
                    }
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
