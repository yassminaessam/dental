
'use client';

import React from 'react';
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { cn } from "../../lib/utils";
import { Download, DollarSign, Users, Calendar, TrendingUp, Loader2 } from "lucide-react";
import RevenueTrendChart from "../../components/reports/revenue-trend-chart";
import PatientGrowthChart from "../../components/reports/patient-growth-chart";
import TreatmentsByTypeChart from "../../components/reports/treatments-by-type-chart";
import AppointmentDistributionChart from "../../components/reports/appointment-distribution-chart";
import { useToast } from '../../hooks/use-toast';
// Migrated from server getCollection to client data layer listDocuments
import { listDocuments } from '../../lib/data-client';
import type { Invoice } from '../billing/page';
import type { Patient } from '../patients/page';
import type { Appointment } from '../appointments/page';
import { format, startOfMonth, isValid } from 'date-fns';
import { Treatment } from '../treatments/page';
import { Transaction } from '../financial/page';
import { useLanguage } from '@/contexts/LanguageContext';

const iconMap = {
    DollarSign,
    Users,
    Calendar,
    TrendingUp
}

type IconKey = keyof typeof iconMap;

export default function ReportsPage() {
  const [loading, setLoading] = React.useState(true);
  const [dateRange, setDateRange] = React.useState('30');
  const [exportFormat, setExportFormat] = React.useState('csv');
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const currencyFmt = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });

  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [newPatients, setNewPatients] = React.useState(0);
  const [totalAppointments, setTotalAppointments] = React.useState(0);
  const [showRate, setShowRate] = React.useState(0);

  const [revenueTrendData, setRevenueTrendData] = React.useState<any[]>([]);
  const [patientGrowthData, setPatientGrowthData] = React.useState<any[]>([]);
  const [treatmentsByTypeData, setTreatmentsByTypeData] = React.useState<any[]>([]);
  const [appointmentDistributionData, setAppointmentDistributionData] = React.useState<any[]>([]);


  React.useEffect(() => {
    async function fetchData() {
        setLoading(true);
    const [invoices, rawPatients, appointments, treatments, rawTransactions] = await Promise.all([
      listDocuments<Invoice>('invoices'),
      listDocuments<any>('patients'),
      listDocuments<any>('appointments'),
      listDocuments<Treatment>('treatments'),
      listDocuments<any>('transactions'),
    ]);

        const transactions: Transaction[] = rawTransactions.map((t: any) => ({ ...t, date: new Date(t.date) }));
        const patients: Patient[] = rawPatients.map((p: any) => ({
            ...p,
            dob: new Date(p.dob),
            lastVisit: p.lastVisit ? new Date(p.lastVisit) : new Date(0), // handle case where lastVisit might be null
        }));

        
        // --- Top Stat Cards ---
        setTotalRevenue(invoices.reduce((acc, inv) => acc + inv.totalAmount, 0));

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        setNewPatients(
          patients.filter(p => {
            const last = new Date((p as any).lastVisit);
            return isValid(last) && last > thirtyDaysAgo;
          }).length
        );

        setTotalAppointments(appointments.length);
        
        const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed').length;
        if (appointments.length > 0) {
            setShowRate((confirmedAppointments / appointments.length) * 100);
        }

        // --- Chart Data Processing ---

        // Revenue Trend
        const monthlyFinancials: Record<string, { revenue: number, expenses: number }> = {};
        transactions.forEach(t => {
            if (isValid(t.date)) {
                const month = format(t.date, 'MMM');
                if(!monthlyFinancials[month]) monthlyFinancials[month] = { revenue: 0, expenses: 0 };
                const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g,""));
                if(t.type === 'Revenue') monthlyFinancials[month].revenue += amount;
                else monthlyFinancials[month].expenses += amount;
            }
        });
        setRevenueTrendData(Object.entries(monthlyFinancials).map(([month, data]) => ({month, ...data})));

        // Patient Growth
        const monthlyGrowth: Record<string, { total: number, new: number }> = {};
        let cumulativePatients = 0;
        patients.sort((a,b) => a.dob.getTime() - b.dob.getTime()).forEach(p => {
             if (isValid(p.dob)) {
                const month = format(startOfMonth(p.dob), 'MMM');
                if(!monthlyGrowth[month]) {
                    monthlyGrowth[month] = { total: 0, new: 0 };
                }
                monthlyGrowth[month].new++;
             }
        });

        const sortedMonths = Object.keys(monthlyGrowth).sort((a, b) => new Date(`01 ${a} 2000`).getTime() - new Date(`01 ${b} 2000`).getTime());
        sortedMonths.forEach(month => {
            cumulativePatients += monthlyGrowth[month].new;
            monthlyGrowth[month].total = cumulativePatients;
        })
        setPatientGrowthData(Object.entries(monthlyGrowth).map(([month, data]) => ({month, ...data})));


        // Treatments by Type
        const treatmentCounts: Record<string, number> = {};
        treatments.forEach(t => {
            treatmentCounts[t.procedure] = (treatmentCounts[t.procedure] || 0) + 1;
        });
        setTreatmentsByTypeData(Object.entries(treatmentCounts).map(([type, count]) => ({type, count})));


        // Appointment Distribution
        const appointmentTypeCounts: Record<string, number> = {};
        appointments.forEach(a => {
            appointmentTypeCounts[a.type] = (appointmentTypeCounts[a.type] || 0) + 1;
        });
        const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--muted))"];
        setAppointmentDistributionData(Object.entries(appointmentTypeCounts).map(([type, count], i) => ({type, count, color: colors[i % colors.length]})));


        setLoading(false);
    }
    fetchData();
  }, []);

  const reportsPageStats = [
    {
      title: t('reports.total_revenue'),
      value: currencyFmt.format(totalRevenue),
      description: t('reports.all_time_revenue'),
      icon: "DollarSign",
    },
    {
      title: t('reports.new_patients'),
      value: `${newPatients}`,
      description: t('reports.last_30_days'),
      icon: "Users",
    },
    {
      title: t('reports.total_appointments'),
      value: `${totalAppointments}`,
      description: t('reports.all_time'),
      icon: "Calendar",
    },
    {
      title: t('reports.appointment_show_rate'),
      value: `${showRate.toFixed(1)}%`,
      description: t('reports.confirmed_appointments'),
      icon: "TrendingUp",
    },
  ];

  const handleExport = () => {
    toast({
        title: t('reports.toast.generating_report'),
        description: t('reports.toast.generating_report_desc'),
    });
  };

  if (loading) {
    return (
  <DashboardLayout>
        <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin" />
    <p className="text-muted-foreground">{t('reports.generating_reports')}</p>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
  <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto">
        {/* Elite Reports Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Analytics & Reports</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('reports.title')}
            </h1>
            <p className="text-muted-foreground font-medium">
              Elite Business Intelligence
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t('reports.last_30_days')} />
              </SelectTrigger>
              <SelectContent>
        <SelectItem value="30">{t('reports.last_30_days')}</SelectItem>
        <SelectItem value="60">{t('reports.last_60_days')}</SelectItem>
        <SelectItem value="90">{t('reports.last_90_days')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[100px]">
        <SelectValue placeholder={t('reports.csv')} />
              </SelectTrigger>
              <SelectContent>
        <SelectItem value="csv">{t('reports.csv')}</SelectItem>
        <SelectItem value="pdf">{t('reports.pdf')}</SelectItem>
        <SelectItem value="png">{t('reports.png')}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
      {t('reports.export_report')}
            </Button>
          </div>
        </div>

        {/* Elite Reports Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reportsPageStats.map((stat, index) => {
                const Icon = iconMap[stat.icon as IconKey];
                const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-orange', 'metric-card-purple'];
                const cardStyle = cardStyles[index % cardStyles.length];
                
                return (
                    <Card 
                      key={stat.title}
                      className={cn(
                        "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group",
                        cardStyle
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                        <div className="flex flex-col gap-1">
                          <CardTitle className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                            {stat.title}
                          </CardTitle>
                          <div className="text-2xl font-bold text-white drop-shadow-sm">
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
                        <div className="flex items-center gap-2 mt-3">
                          <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                          <span className="text-xs text-white/70 font-medium">Live</span>
                        </div>
                      </CardContent>
                      
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent" />
                    </Card>
                );
            })}
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
                <CardHeader>
        <CardTitle>{t('reports.revenue_trend')}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <RevenueTrendChart data={revenueTrendData} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
        <CardTitle>{t('reports.patient_growth')}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <PatientGrowthChart data={patientGrowthData} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
        <CardTitle>{t('reports.treatments_by_type')}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <TreatmentsByTypeChart data={treatmentsByTypeData} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
        <CardTitle>{t('reports.appointment_distribution')}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <AppointmentDistributionChart data={appointmentDistributionData} />
                </CardContent>
            </Card>
        </div>

      </main>
    </DashboardLayout>
  );
}
