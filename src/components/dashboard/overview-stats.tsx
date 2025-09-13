
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
// Migrated from server getCollection to client listDocuments
import { listDocuments } from '@/lib/data-client';
import type { Patient } from '@/app/patients/page';
import type { Appointment } from '@/app/appointments/page';
import type { StaffMember } from '@/app/staff/page';
import type { Invoice } from '@/app/billing/page';
import type { Treatment } from '@/app/treatments/page';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
    const [stats, setStats] = React.useState([
    { title: t('dashboard.total_patients'), value: "0", description: t('dashboard.all_patients_system'), icon: "Users", cardStyle: "metric-card-blue" },
    { title: t('dashboard.todays_appointments'), value: "0", description: t('dashboard.scheduled_today'), icon: "CalendarCheck", cardStyle: "metric-card-green" },
    { title: t('dashboard.total_revenue'), value: "EGP 0", description: t('dashboard.all_time_revenue'), icon: "DollarSign", cardStyle: "metric-card-orange" },
    { title: t('dashboard.active_staff'), value: "0", description: t('dashboard.currently_on_duty'), icon: "UserCheck", cardStyle: "metric-card-purple" },
    { title: t('dashboard.pending_appointments'), value: "0", description: t('dashboard.awaiting_confirmation'), icon: "Clock", cardStyle: "metric-card-orange" },
    { title: t('dashboard.completed_treatments'), value: "0", description: t('dashboard.finished_treatment_plans'), icon: "CheckCircle", cardStyle: "metric-card-green" },
    ]);

    React.useEffect(() => {
        async function fetchStats() {
            try {
        const [patients, appointments, staff, invoices, treatments] = await Promise.all([
          listDocuments<Patient>('patients'),
          listDocuments<Appointment>('appointments'),
          listDocuments<StaffMember>('staff'),
          listDocuments<Invoice>('invoices'),
          listDocuments<Treatment>('treatments'),
        ]);

                const totalPatients = patients.length;
                const todaysAppointments = appointments.filter(a => new Date(a.dateTime).toDateString() === new Date().toDateString()).length;
                const totalRevenue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
                const activeStaff = staff.filter(s => s.status === 'Active').length;
                const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
                const completedTreatments = treatments.filter(t => t.status === 'Completed').length;
                
                setStats([
          { title: t('dashboard.total_patients'), value: `${totalPatients}`, description: t('dashboard.all_patients_system'), icon: "Users", cardStyle: "metric-card-blue" },
          { title: t('dashboard.todays_appointments'), value: `${todaysAppointments}`, description: t('dashboard.scheduled_today'), icon: "CalendarCheck", cardStyle: "metric-card-green" },
          { title: t('dashboard.total_revenue'), value: `EGP ${totalRevenue.toLocaleString()}`, description: t('dashboard.all_time_revenue'), icon: "DollarSign", cardStyle: "metric-card-orange" },
          { title: t('dashboard.active_staff'), value: `${activeStaff}`, description: t('dashboard.currently_on_duty'), icon: "UserCheck", cardStyle: "metric-card-purple" },
          { title: t('dashboard.pending_appointments'), value: `${pendingAppointments}`, description: t('dashboard.awaiting_confirmation'), icon: "Clock", cardStyle: "metric-card-orange" },
          { title: t('dashboard.completed_treatments'), value: `${completedTreatments}`, description: t('dashboard.finished_treatment_plans'), icon: "CheckCircle", cardStyle: "metric-card-green" },
        ]);            } catch (error) {
                console.error("Failed to fetch overview stats:", error);
            }
        }
    fetchStats();
  }, [t]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon as IconKey];
        return (
          <Card 
            key={stat.title} 
            className={cn(
              "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group",
              stat.cardStyle
            )}
          >
            {/* Animated Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <div className="text-3xl font-bold text-white drop-shadow-sm">
                  {stat.value}
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                <Icon className="h-6 w-6 text-white drop-shadow-sm" />
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 relative z-10">
              <p className="text-xs text-white/80 font-medium">
                {stat.description}
              </p>
              {/* Elite Metric Indicator */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                <span className="text-xs text-white/70 font-medium">Active</span>
              </div>
            </CardContent>
            
            {/* Elite Corner Accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent" />
          </Card>
        );
      })}
    </div>
  );
}
