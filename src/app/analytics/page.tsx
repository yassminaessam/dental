
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Download, DollarSign, Users, TrendingUp, Activity, Sparkles, BarChart3, PieChart, LineChart } from "lucide-react";
import RevenueTrendsChart from "@/components/dashboard/revenue-trends-chart";
import AppointmentAnalyticsChart from "@/components/analytics/appointment-analytics-chart";
import { useToast } from '@/hooks/use-toast';
import PatientDemographicsChart from '@/components/analytics/patient-demographics-chart';
import TreatmentVolumeChart from '@/components/analytics/treatment-volume-chart';
import StaffPerformanceChart from '@/components/analytics/staff-performance-chart';
import PatientSatisfactionChart from '@/components/analytics/patient-satisfaction-chart';
// Switched to client REST data layer (listDocuments) instead of server getCollection
import { listDocuments } from '@/lib/data-client';
import type { Invoice } from '../billing/page';
import type { Patient } from '../patients/page';
import type { Appointment } from '../appointments/page';
import type { Treatment } from '../treatments/page';
import { format, isToday } from 'date-fns';
import { Transaction } from '../financial/page';
import { useLanguage } from '@/contexts/LanguageContext';

const iconMap = {
    DollarSign,
    Users,
    TrendingUp,
    Activity
}

type IconKey = keyof typeof iconMap;


export default function AnalyticsPage() {
    const { t, language } = useLanguage();
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    const currencyFmt = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });
    const numberFmt = new Intl.NumberFormat(locale);
    const percentFmt = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
  const [dateRange, setDateRange] = React.useState('30');
  const { toast } = useToast();
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [patientCount, setPatientCount] = React.useState(0);
  const [showRate, setShowRate] = React.useState(0);
  const [avgTreatmentValue, setAvgTreatmentValue] = React.useState(0);
  const [appointmentAnalyticsData, setAppointmentAnalyticsData] = React.useState<any[]>([]);
  const [patientDemographicsData, setPatientDemographicsData] = React.useState<any[]>([]);
  const [treatmentVolumeData, setTreatmentVolumeData] = React.useState<any[]>([]);
  const [revenueTrendData, setRevenueTrendData] = React.useState<{ month: string; revenue: number; expenses: number; }[]>([]);


    React.useEffect(() => {
    async function fetchData() {
        const [invoices, patients, appointments, treatments, transactions] = await Promise.all([
          listDocuments<Invoice>('invoices'),
          listDocuments<Patient>('patients'),
          listDocuments<any>('appointments'),
          listDocuments<Treatment>('treatments'),
          listDocuments<Transaction>('transactions'),
        ]);
        
  const total = invoices.reduce((acc: number, inv: Invoice) => acc + inv.totalAmount, 0);
        setTotalRevenue(total);

        setPatientCount(patients.length);

  const parsedAppointments = appointments.map((a: any) => ({...a, dateTime: new Date(a.dateTime) }));

  const confirmed = parsedAppointments.filter((a: any) => a.status === 'Confirmed').length;
        const totalAppointments = parsedAppointments.length;
        if(totalAppointments > 0) {
            setShowRate((confirmed / totalAppointments) * 100);
        }

  const completedTreatments = treatments.filter((t: Treatment) => t.status === 'Completed').length;
        if (completedTreatments > 0) {
            const totalTreatmentRevenue = treatments
                .filter((t: Treatment) => t.status === 'Completed')
                .reduce((acc: number, t: Treatment) => acc + parseFloat((t as any).cost.replace(/[^0-9.-]+/g, '')), 0);
            setAvgTreatmentValue(totalTreatmentRevenue / completedTreatments);
        }

        // Process data for appointment analytics chart
        const today = new Date();
        const hourlyStats: Record<string, { appointments: number, noShows: number, cancellations: number }> = {};

    parsedAppointments
      .filter((a: any) => isToday(a.dateTime))
      .forEach((appt: any) => {
                const hour = format(appt.dateTime, 'ha').toLowerCase(); // e.g., "8am", "1pm"
                if (!hourlyStats[hour]) {
                    hourlyStats[hour] = { appointments: 0, noShows: 0, cancellations: 0 };
                }
                hourlyStats[hour].appointments++;
                if (appt.status === 'Cancelled') {
                    hourlyStats[hour].cancellations++;
                }
                if (appt.status === 'Pending' && appt.dateTime < today) { // Assuming past pending are no-shows
                    hourlyStats[hour].noShows++;
                }
            });

        const analyticsData = Object.entries(hourlyStats).map(([time, data]) => ({
            time,
            ...data
        })).sort((a,b) => { // Sort by time of day
            const aHour = parseInt(a.time.replace(/(am|pm)/, ''));
            const bHour = parseInt(b.time.replace(/(am|pm)/, ''));
            const aIsAm = a.time.includes('am');
            const bIsAm = b.time.includes('am');
            if (aIsAm && !bIsAm) return -1;
            if (!aIsAm && bIsAm) return 1;
            return aHour - bHour;
        });

        setAppointmentAnalyticsData(analyticsData);

        // Process data for patient demographics chart
        const ageGroups: { [key: string]: number } = {
            '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '66+': 0
        };

  patients.forEach((patient: any) => {
            const age = patient.age;
            if (age <= 18) ageGroups['0-18']++;
            else if (age <= 35) ageGroups['19-35']++;
            else if (age <= 50) ageGroups['36-50']++;
            else if (age <= 65) ageGroups['51-65']++;
            else ageGroups['66+']++;
        });

        setPatientDemographicsData(
            Object.entries(ageGroups).map(([ageGroup, count]) => ({ ageGroup, count }))
        );

        // Process data for treatment volume chart
        const monthlyTreatments: Record<string, number> = {};
  treatments.forEach((treatment: Treatment) => {
            const month = format(new Date(treatment.date), 'MMM');
            if (!monthlyTreatments[month]) {
                monthlyTreatments[month] = 0;
            }
            monthlyTreatments[month]++;
        });
        
        setTreatmentVolumeData(
            Object.entries(monthlyTreatments).map(([month, count]) => ({ month, count }))
        );

        // Process revenue data for chart
        const monthlyRevenue: Record<string, { revenue: number, expenses: number }> = {};
  transactions.forEach((t: Transaction) => {
            const month = new Date(t.date).toLocaleString(locale, { month: 'short' });
            if (!monthlyRevenue[month]) {
                monthlyRevenue[month] = { revenue: 0, expenses: 0 };
            }
            const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g, ''));
            if (t.type === 'Revenue') {
                monthlyRevenue[month].revenue += amount;
            } else {
                monthlyRevenue[month].expenses += amount;
            }
        });
        const chartData = Object.keys(monthlyRevenue).map(month => ({
            month,
            revenue: monthlyRevenue[month].revenue,
            expenses: monthlyRevenue[month].expenses
        }));
        setRevenueTrendData(chartData);

    }
    fetchData();
  }, [language])

    const analyticsPageStats = [
    {
                title: t('analytics.total_revenue'),
                value: currencyFmt.format(totalRevenue),
                description: t('analytics.all_time_revenue'),
        icon: "DollarSign"
    },
    {
                title: t('analytics.patient_acquisition'),
                value: `${numberFmt.format(patientCount)}`,
                description: t('analytics.total_patients_system'),
        icon: "Users"
    },
    {
                title: t('analytics.appointment_show_rate'),
                value: `${percentFmt.format(showRate / 100)}`,
                description: t('analytics.confirmed_total_appointments'),
        icon: "TrendingUp"
    },
    {
                title: t('analytics.average_treatment_value'),
                value: `${currencyFmt.format(avgTreatmentValue)}`,
                description: t('analytics.based_completed_treatments'),
        icon: "Activity"
    }
  ];

  const handleExport = () => {
    toast({
                title: t('analytics.toast.exporting_report'),
                description: t('analytics.toast.exporting_report_desc'),
    });
  };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-200/30 via-blue-200/20 to-indigo-200/10 dark:from-cyan-900/15 dark:via-blue-900/10 dark:to-indigo-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-200/30 via-violet-200/20 to-purple-200/10 dark:from-indigo-900/15 dark:via-violet-900/10 dark:to-purple-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Ultra Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* Left side: Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-indigo-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-xl">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1 rounded-full">Business Intelligence</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient">
                    {t('nav.analytics')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Elite Analytics & Data Intelligence
                  </p>
                </div>
              </div>

              {/* Right side: Filters & Actions */}
              <div className="flex flex-wrap gap-3">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted/50 font-bold hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors">
                    <SelectValue placeholder={t('analytics.last_30_days')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">{t('analytics.last_30_days')}</SelectItem>
                    <SelectItem value="60">{t('analytics.last_60_days')}</SelectItem>
                    <SelectItem value="90">{t('analytics.last_90_days')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={handleExport} 
                  className="h-11 px-6 rounded-xl font-bold border-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('analytics.export_report')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Ultra Enhanced Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {analyticsPageStats.map((stat, index) => {
            const Icon = iconMap[stat.icon as IconKey];
            const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-orange', 'metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer group",
                  cardStyle
                )}
              >
                {/* Animated Background Layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xs sm:text-sm font-semibold text-white/90 uppercase tracking-wide mb-3">
                        {stat.title}
                      </CardTitle>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-md mb-2 group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-sm" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 relative z-10">
                  <p className="text-xs text-white/80 font-medium mb-3">
                    {stat.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                    <span className="text-xs text-white/70 font-medium">Live Data</span>
                    <div className="ml-auto">
                      <div className="text-xs text-white/60 font-bold">↗</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ultra Enhanced Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-indigo-500/5 rounded-2xl blur-xl"></div>
            <TabsList className="relative bg-background/80 backdrop-blur-xl border-2 border-muted/50 p-1.5 rounded-2xl grid w-full grid-cols-2 lg:grid-cols-5 shadow-lg">
              <TabsTrigger 
                value="overview" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <BarChart3 className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('analytics.overview')}
              </TabsTrigger>
              <TabsTrigger 
                value="patients" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <PieChart className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('patients.title')}
              </TabsTrigger>
              <TabsTrigger 
                value="treatments" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <LineChart className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('treatments.title')}
              </TabsTrigger>
              <TabsTrigger 
                value="staff" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <Activity className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('nav.staff')}
              </TabsTrigger>
              <TabsTrigger 
                value="satisfaction" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <TrendingUp className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('analytics.satisfaction')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3 border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
                    <CardHeader className="border-b-2 border-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                          <LineChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <CardTitle className="text-lg font-black bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                          {t('analytics.revenue_trend')}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RevenueTrendsChart data={revenueTrendData} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2 border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
                    <CardHeader className="border-b-2 border-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
                          <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <CardTitle className="text-lg font-black bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
                          {t('analytics.appointment_analytics')}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                        <AppointmentAnalyticsChart data={appointmentAnalyticsData} />
                    </CardContent>
                </Card>
            </div>
          </TabsContent>
          <TabsContent value="patients">
             <Card>
                <CardHeader>
                    <CardTitle>{t('analytics.patient_demographics')}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <PatientDemographicsChart data={patientDemographicsData} />
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="treatments">
             <Card>
                <CardHeader>
                    <CardTitle>{t('analytics.treatment_volume')}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <TreatmentVolumeChart data={treatmentVolumeData} />
                </CardContent>
             </Card>
          </TabsContent>
           <TabsContent value="staff">
             <Card>
                <CardHeader>
                    <CardTitle>{t('analytics.staff_performance')}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <StaffPerformanceChart data={[]} />
                </CardContent>
             </Card>
          </TabsContent>
           <TabsContent value="satisfaction">
             <Card>
                <CardHeader>
                    <CardTitle>{t('analytics.patient_satisfaction')}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <PatientSatisfactionChart data={[]} />
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
