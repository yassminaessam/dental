
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
import { Download, DollarSign, Users, TrendingUp, Activity } from "lucide-react";
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
      <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto">
        {/* Elite Header Section */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Business Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('nav.analytics')}
            </h1>
            <p className="text-muted-foreground font-medium">Elite Analytics Dashboard</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl bg-background/60 backdrop-blur-sm border-border/50 font-medium">
                <SelectValue placeholder={t('analytics.last_30_days')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">{t('analytics.last_30_days')}</SelectItem>
                <SelectItem value="60">{t('analytics.last_60_days')}</SelectItem>
                <SelectItem value="90">{t('analytics.last_90_days')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} className="h-11 px-6 rounded-xl font-semibold bg-background/60 backdrop-blur-sm border-border/50 hover:bg-accent hover:text-accent-foreground hover:border-accent/50 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent/20 mr-3">
                <Download className="h-3 w-3" />
              </div>
              {t('analytics.export_report')}
            </Button>
          </div>
        </div>

        {/* Elite Analytics Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {analyticsPageStats.map((stat, index) => {
            const Icon = iconMap[stat.icon as IconKey];
            const cardStyles = [
              'metric-card-blue',
              'metric-card-green', 
              'metric-card-orange',
              'metric-card-purple'
            ];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group",
                  cardStyle
                )}
              >
                {/* Animated Background Effect */}
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
                  {/* Elite Status Indicator */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                    <span className="text-xs text-white/70 font-medium">Live Data</span>
                  </div>
                </CardContent>
                
                {/* Elite Corner Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent" />
              </Card>
            );
          })}
        </div>

        {/* Elite Analytics Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-background/60 backdrop-blur-sm border border-border/50 rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('analytics.overview')}</TabsTrigger>
            <TabsTrigger value="patients" className="rounded-lg font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('patients.title')}</TabsTrigger>
            <TabsTrigger value="treatments" className="rounded-lg font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('treatments.title')}</TabsTrigger>
            <TabsTrigger value="staff" className="rounded-lg font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('nav.staff')}</TabsTrigger>
            <TabsTrigger value="satisfaction">{t('analytics.satisfaction')}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>{t('analytics.revenue_trend')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RevenueTrendsChart data={revenueTrendData} />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>{t('analytics.appointment_analytics')}</CardTitle>
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
