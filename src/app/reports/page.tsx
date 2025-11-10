
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
import { Download, DollarSign, Users, Calendar, TrendingUp, Loader2, Sparkles, FileText, BarChart3, PieChart, Activity } from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
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
  <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/30 via-teal-200/20 to-cyan-200/10 dark:from-emerald-900/15 dark:via-teal-900/10 dark:to-cyan-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/30 via-blue-200/20 to-indigo-200/10 dark:from-cyan-900/15 dark:via-blue-900/10 dark:to-indigo-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Ultra Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* Left side: Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-xl">
                    <FileText className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">Analytics & Reports</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-600 dark:from-cyan-400 dark:via-blue-400 dark:to-sky-400 bg-clip-text text-transparent animate-gradient">
                    {t('reports.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Elite Business Intelligence & Insights
                  </p>
                </div>
              </div>

              {/* Right side: Filters & Actions */}
              <div className="flex flex-wrap gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted/50 font-bold hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                    <SelectValue placeholder={t('reports.last_30_days')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">{t('reports.last_30_days')}</SelectItem>
                    <SelectItem value="60">{t('reports.last_60_days')}</SelectItem>
                    <SelectItem value="90">{t('reports.last_90_days')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-[100px] h-11 rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted/50 font-bold hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
                    <SelectValue placeholder={t('reports.csv')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">{t('reports.csv')}</SelectItem>
                    <SelectItem value="pdf">{t('reports.pdf')}</SelectItem>
                    <SelectItem value="png">{t('reports.png')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleExport}
                  className="h-11 px-6 rounded-xl font-bold border-2 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('reports.export_report')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Ultra Enhanced Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {reportsPageStats.map((stat, index) => {
                const Icon = iconMap[stat.icon as IconKey];
                const cardStyles = ['metric-card-blue','metric-card-green','metric-card-orange','metric-card-purple'];
                const cardStyle = cardStyles[index % cardStyles.length];
                const variants = ['blue','green','pink','neutral'];
                const variant = variants[index % variants.length] as 'blue'|'green'|'pink'|'neutral';
                return (
                  <Card
                    key={stat.title}
                    className={cn(
                      'relative overflow-hidden border-0 shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer group',
                      cardStyle
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                            {stat.title}
                          </CardTitle>
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-md mb-2 group-hover:scale-110 transition-transform duration-300">
                            {stat.value}
                          </div>
                        </div>
                        <CardIcon variant={variant} className="group-hover:rotate-12">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </CardIcon>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 relative z-10">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-3">
                        {stat.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-pulse" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Live Data</span>
                        <div className="ml-auto">
                          <div className="text-xs text-white/60 font-bold">↗</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
            })}
        </div>
        
        {/* Ultra Enhanced Chart Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                      <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg font-black bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                      {t('reports.revenue_trend')}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pl-2">
                    <RevenueTrendChart data={revenueTrendData} />
                </CardContent>
            </Card>
            
            <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                      <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <CardTitle className="text-lg font-black bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                      {t('reports.patient_growth')}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pl-2">
                    <PatientGrowthChart data={patientGrowthData} />
                </CardContent>
            </Card>
            
            <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                      <PieChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <CardTitle className="text-lg font-black bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                      {t('reports.treatments_by_type')}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pl-2">
                    <TreatmentsByTypeChart data={treatmentsByTypeData} />
                </CardContent>
            </Card>
            
            <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                      {t('reports.appointment_distribution')}
                    </CardTitle>
                  </div>
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
