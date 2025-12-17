
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Download, DollarSign, Users, TrendingUp, Activity, Sparkles, BarChart3, PieChart, LineChart, Star, ThumbsUp, Clock, Calendar } from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import RevenueTrendsChart from "@/components/dashboard/revenue-trends-chart";
import AppointmentAnalyticsChart from "@/components/analytics/appointment-analytics-chart";
import { useToast } from '@/hooks/use-toast';
import PatientDemographicsChart from '@/components/analytics/patient-demographics-chart';
import TreatmentVolumeChart from '@/components/analytics/treatment-volume-chart';
import StaffPerformanceChart from '@/components/analytics/staff-performance-chart';
import PatientSatisfactionChart from '@/components/analytics/patient-satisfaction-chart';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// Switched to client REST data layer (listDocuments) instead of server getCollection
import { listDocuments } from '@/lib/data-client';
import type { Invoice } from '../billing/page';
import type { Patient } from '../patients/page';
import type { Appointment } from '../appointments/page';
import type { Treatment } from '../treatments/page';
import type { StaffMember } from '@/lib/types';
import { format, isToday, subDays, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO, differenceInYears } from 'date-fns';
import { Transaction } from '../financial/page';
import { useLanguage } from '@/contexts/LanguageContext';

const iconMap = {
    DollarSign,
    Users,
    TrendingUp,
    Activity
}

type IconKey = keyof typeof iconMap;

const parseNumericValue = (input: string | number | null | undefined): number => {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : 0;
  }
  if (typeof input === 'string') {
    const cleaned = input.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};


export default function AnalyticsPage() {
    const { t, language, isRTL } = useLanguage();
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    const currencyFmt = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });
    const numberFmt = new Intl.NumberFormat(locale);
    const percentFmt = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
  const [dateRange, setDateRange] = React.useState('30');
  const [activeTab, setActiveTab] = React.useState('overview');
  const { toast } = useToast();
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [patientCount, setPatientCount] = React.useState(0);
  const [showRate, setShowRate] = React.useState(0);
  const [avgTreatmentValue, setAvgTreatmentValue] = React.useState(0);
  const [appointmentAnalyticsData, setAppointmentAnalyticsData] = React.useState<any[]>([]);
  const [patientDemographicsData, setPatientDemographicsData] = React.useState<any[]>([]);
  const [treatmentVolumeData, setTreatmentVolumeData] = React.useState<any[]>([]);
  const [revenueTrendData, setRevenueTrendData] = React.useState<{ month: string; revenue: number; expenses: number; }[]>([]);
  const [staffPerformanceData, setStaffPerformanceData] = React.useState<{ name: string; appointments: number; }[]>([]);
  const [patientSatisfactionData, setPatientSatisfactionData] = React.useState<{ month: string; score: number; }[]>([]);
  const [newPatientsThisMonth, setNewPatientsThisMonth] = React.useState(0);
  const [patientRetentionRate, setPatientRetentionRate] = React.useState(0);
  const [genderDistribution, setGenderDistribution] = React.useState<{ gender: string; count: number }[]>([]);
  const [treatmentsByType, setTreatmentsByType] = React.useState<{ type: string; count: number; revenue: number }[]>([]);
  const [staffMembers, setStaffMembers] = React.useState<StaffMember[]>([]);
  const [topPerformers, setTopPerformers] = React.useState<{ name: string; role: string; appointments: number; revenue: number }[]>([]);
  const [avgSatisfactionScore, setAvgSatisfactionScore] = React.useState(0);
  const [loading, setLoading] = React.useState(true);


    React.useEffect(() => {
    async function fetchData() {
        setLoading(true);
        try {
        const [invoices, patients, appointments, treatments, transactions, staff] = await Promise.all([
          listDocuments<Invoice>('invoices'),
          listDocuments<Patient>('patients'),
          listDocuments<any>('appointments'),
          listDocuments<Treatment>('treatments'),
          listDocuments<Transaction>('transactions'),
          listDocuments<StaffMember>('staff'),
        ]);
        
        setStaffMembers(staff);
        
  const total = invoices.reduce((acc: number, inv: Invoice) => acc + inv.totalAmount, 0);
        setTotalRevenue(total);

        setPatientCount(patients.length);

  const parsedAppointments = appointments.map((a: any) => ({...a, dateTime: new Date(a.dateTime) }));

  const confirmed = parsedAppointments.filter((a: any) => a.status === 'Confirmed' || a.status === 'Completed').length;
        const totalAppointments = parsedAppointments.length;
        if(totalAppointments > 0) {
            setShowRate((confirmed / totalAppointments) * 100);
        }

  const completedTreatments = treatments.filter((t: Treatment) => t.status === 'Completed').length;
        if (completedTreatments > 0) {
            const totalTreatmentRevenue = treatments
                .filter((t: Treatment) => t.status === 'Completed')
                .reduce((acc: number, t: Treatment) => acc + parseNumericValue((t as any).cost), 0);
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

        // Process data for patient demographics chart - Age distribution
        const ageGroups: { [key: string]: number } = {
            '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '66+': 0
        };

        // Gender distribution
        const genderCounts: { [key: string]: number } = { Male: 0, Female: 0, Other: 0 };

        // New patients this month
        const currentMonth = startOfMonth(new Date());
        let newThisMonth = 0;
        let returningPatients = 0;

  patients.forEach((patient: any) => {
            // Age calculation
            const age = patient.age || (patient.dob ? differenceInYears(new Date(), new Date(patient.dob)) : 30);
            if (age <= 18) ageGroups['0-18']++;
            else if (age <= 35) ageGroups['19-35']++;
            else if (age <= 50) ageGroups['36-50']++;
            else if (age <= 65) ageGroups['51-65']++;
            else ageGroups['66+']++;

            // Gender
            const gender = patient.gender || 'Other';
            if (genderCounts[gender] !== undefined) {
                genderCounts[gender]++;
            } else {
                genderCounts['Other']++;
            }

            // New patients this month
            const createdAt = patient.createdAt ? new Date(patient.createdAt) : null;
            if (createdAt && createdAt >= currentMonth) {
                newThisMonth++;
            }

            // Check if returning (has multiple appointments)
            const patientAppts = parsedAppointments.filter((a: any) => 
                a.patientId === patient.id || a.patient === patient.name
            );
            if (patientAppts.length > 1) {
                returningPatients++;
            }
        });

        setPatientDemographicsData(
            Object.entries(ageGroups).map(([ageGroup, count]) => ({ ageGroup, count }))
        );

        setGenderDistribution(
            Object.entries(genderCounts).map(([gender, count]) => ({ gender, count }))
        );

        setNewPatientsThisMonth(newThisMonth);
        setPatientRetentionRate(patients.length > 0 ? (returningPatients / patients.length) * 100 : 0);

        // Process data for treatment volume chart
        const monthlyTreatments: Record<string, number> = {};
        const treatmentTypes: Record<string, { count: number; revenue: number }> = {};

  treatments.forEach((treatment: Treatment) => {
            const month = format(new Date(treatment.date), 'MMM');
            if (!monthlyTreatments[month]) {
                monthlyTreatments[month] = 0;
            }
            monthlyTreatments[month]++;

            // Treatment types
            const type = treatment.procedure || 'Other';
            if (!treatmentTypes[type]) {
                treatmentTypes[type] = { count: 0, revenue: 0 };
            }
            treatmentTypes[type].count++;
            treatmentTypes[type].revenue += parseNumericValue((treatment as any).cost);
        });
        
        setTreatmentVolumeData(
            Object.entries(monthlyTreatments).map(([month, count]) => ({ month, count }))
        );

        setTreatmentsByType(
            Object.entries(treatmentTypes)
                .map(([type, data]) => ({ type, ...data }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10) // Top 10
        );

        // Process revenue data for chart
        const monthlyRevenue: Record<string, { revenue: number, expenses: number }> = {};
  transactions.forEach((t: Transaction) => {
            const month = new Date(t.date).toLocaleString(locale, { month: 'short' });
            if (!monthlyRevenue[month]) {
                monthlyRevenue[month] = { revenue: 0, expenses: 0 };
            }
            const amount = parseNumericValue(t.amount as string | number);
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

        // Staff performance data
        const staffAppointments: Record<string, { name: string; role: string; appointments: number; revenue: number }> = {};
        
        staff.forEach((s: StaffMember) => {
            staffAppointments[s.name] = { 
                name: s.name, 
                role: s.role,
                appointments: 0, 
                revenue: 0 
            };
        });

        parsedAppointments.forEach((appt: any) => {
            const doctorName = appt.doctor;
            if (staffAppointments[doctorName]) {
                staffAppointments[doctorName].appointments++;
            } else if (doctorName) {
                staffAppointments[doctorName] = { 
                    name: doctorName, 
                    role: 'Doctor',
                    appointments: 1, 
                    revenue: 0 
                };
            }
        });

        // Add revenue from treatments
        treatments.forEach((t: Treatment) => {
            const doctorName = t.doctor;
            if (staffAppointments[doctorName]) {
                staffAppointments[doctorName].revenue += parseNumericValue((t as any).cost);
            }
        });

        const performanceData = Object.values(staffAppointments)
            .filter(s => s.appointments > 0)
            .sort((a, b) => b.appointments - a.appointments);

        setStaffPerformanceData(performanceData.map(s => ({ name: s.name, appointments: s.appointments })));
        setTopPerformers(performanceData.slice(0, 5));

        // Patient satisfaction data (simulated based on completed appointments ratio)
        const last6Months = eachMonthOfInterval({
            start: subMonths(new Date(), 5),
            end: new Date()
        });

        const satisfactionData = last6Months.map(monthDate => {
            const monthName = format(monthDate, 'MMM');
            const monthStart = startOfMonth(monthDate);
            const monthEnd = endOfMonth(monthDate);
            
            const monthAppointments = parsedAppointments.filter((a: any) => 
                a.dateTime >= monthStart && a.dateTime <= monthEnd
            );
            
            const completed = monthAppointments.filter((a: any) => 
                a.status === 'Completed' || a.status === 'Confirmed'
            ).length;
            
            const totalMonth = monthAppointments.length;
            // Calculate satisfaction score (4.0-5.0 range based on completion rate)
            const baseScore = 4.0;
            const completionBonus = totalMonth > 0 ? (completed / totalMonth) * 1.0 : 0.5;
            const score = Math.min(5.0, baseScore + completionBonus);
            
            return { month: monthName, score: parseFloat(score.toFixed(2)) };
        });

        setPatientSatisfactionData(satisfactionData);
        
        // Calculate average satisfaction
        const avgSat = satisfactionData.reduce((acc, d) => acc + d.score, 0) / satisfactionData.length;
        setAvgSatisfactionScore(avgSat);

        } catch (error) {
            console.error('Error fetching analytics data:', error);
            toast({
                title: t('common.error'),
                description: 'Failed to load analytics data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [language, t, toast, locale])

    const analyticsPageStats = [
    {
                title: t('analytics.total_revenue'),
                value: currencyFmt.format(totalRevenue),
                description: t('analytics.all_time_revenue'),
        icon: "DollarSign",
        tab: "overview"
    },
    {
                title: t('analytics.patient_acquisition'),
                value: `${numberFmt.format(patientCount)}`,
                description: t('analytics.total_patients_system'),
        icon: "Users",
        tab: "patients"
    },
    {
                title: t('analytics.appointment_show_rate'),
                value: `${percentFmt.format(showRate / 100)}`,
                description: t('analytics.confirmed_total_appointments'),
        icon: "TrendingUp",
        tab: "treatments"
    },
    {
                title: t('analytics.average_treatment_value'),
                value: `${currencyFmt.format(avgTreatmentValue)}`,
                description: t('analytics.based_completed_treatments'),
        icon: "Activity",
        tab: "staff"
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
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {analyticsPageStats.map((stat, index) => {
            const Icon = iconMap[stat.icon as IconKey];
            const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-orange', 'metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            const isActive = activeTab === stat.tab;
            
            return (
              <Card 
                key={stat.title}
                onClick={() => setActiveTab(stat.tab)}
                className={cn(
                  "relative overflow-hidden border-0 shadow-sm transition-all duration-500 hover:scale-105 cursor-pointer group min-h-0",
                  cardStyle,
                  isActive && "ring-2 ring-primary ring-offset-2"
                )}
              >
                {/* Animated Background Layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="pb-0.5 p-1.5 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide leading-tight mb-1">
                        {stat.title}
                      </CardTitle>
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100 drop-shadow-md leading-tight group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                    </div>
                    <CardIcon variant={(['blue','green','orange','purple'] as const)[index % 4]} className="w-10 h-10 group-hover:rotate-12">
                      <Icon className="h-5 w-5" />
                    </CardIcon>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 p-1.5 relative z-10">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ultra Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

          {/* Overview Tab */}
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

          {/* Patients Tab */}
          <TabsContent value="patients" className="mt-0 space-y-6">
            {/* Patient Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(patientCount)}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{t('analytics.total_patients')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(newPatientsThisMonth)}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{t('analytics.new_this_month')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <ThumbsUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{percentFmt.format(patientRetentionRate / 100)}</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">{t('analytics.retention_rate')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{percentFmt.format(showRate / 100)}</p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">{t('analytics.show_rate')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                      <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('analytics.patient_demographics')}</CardTitle>
                  </div>
                  <CardDescription>{t('analytics.age_distribution')}</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <PatientDemographicsChart data={patientDemographicsData} />
                </CardContent>
              </Card>

              <Card className="border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10">
                      <Users className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('analytics.gender_distribution')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-4">
                    {genderDistribution.map((item) => (
                      <div key={item.gender} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.gender}</span>
                          <span className="text-sm text-muted-foreground">{item.count} ({patientCount > 0 ? percentFmt.format(item.count / patientCount) : '0%'})</span>
                        </div>
                        <Progress value={patientCount > 0 ? (item.count / patientCount) * 100 : 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Treatments Tab */}
          <TabsContent value="treatments" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3 border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
                      <LineChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('analytics.treatment_volume')}</CardTitle>
                  </div>
                  <CardDescription>{t('analytics.monthly_treatments')}</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <TreatmentVolumeChart data={treatmentVolumeData} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10">
                      <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('analytics.top_treatments')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 pt-4 max-h-[350px] overflow-y-auto">
                    {treatmentsByType.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">{t('analytics.empty.treatments')}</p>
                    ) : (
                      treatmentsByType.map((treatment, index) => (
                        <div key={treatment.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-6 h-6 flex items-center justify-center rounded-full text-xs">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium text-sm">{treatment.type}</p>
                              <p className="text-xs text-muted-foreground">{treatment.count} {t('analytics.procedures')}</p>
                            </div>
                          </div>
                          <span className="font-bold text-green-600 dark:text-green-400 text-sm">
                            {currencyFmt.format(treatment.revenue)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <Card className="lg:col-span-3 border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                      <Activity className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('analytics.staff_performance')}</CardTitle>
                  </div>
                  <CardDescription>{t('analytics.appointments_by_staff')}</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <StaffPerformanceChart data={staffPerformanceData} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                      <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('analytics.top_performers')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 pt-4">
                    {topPerformers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">{t('analytics.empty.staff_performance')}</p>
                    ) : (
                      topPerformers.map((performer, index) => (
                        <div key={performer.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                              index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-blue-500"
                            )}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{performer.name}</p>
                              <p className="text-xs text-muted-foreground">{performer.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{performer.appointments} {t('appointments.title')}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">{currencyFmt.format(performer.revenue)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Satisfaction Tab */}
          <TabsContent value="satisfaction" className="mt-0 space-y-6">
            {/* Satisfaction Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <Star className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{avgSatisfactionScore.toFixed(2)}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{t('analytics.avg_satisfaction')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <ThumbsUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{percentFmt.format(showRate / 100)}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{t('analytics.completion_rate')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{percentFmt.format(patientRetentionRate / 100)}</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">{t('analytics.returning_patients')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-muted/50 shadow-xl">
              <CardHeader className="border-b-2 border-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                    <TrendingUp className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <CardTitle className="text-lg font-black">{t('analytics.patient_satisfaction')}</CardTitle>
                </div>
                <CardDescription>{t('analytics.satisfaction_over_time')}</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                  <PatientSatisfactionChart data={patientSatisfactionData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
