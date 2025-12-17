
'use client';

import React from 'react';
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { cn } from "../../lib/utils";
import { Download, DollarSign, Users, Calendar, TrendingUp, Loader2, Sparkles, FileText, BarChart3, PieChart, Activity, CreditCard, Stethoscope, Clock, CheckCircle, XCircle, AlertCircle, UserPlus, Percent, Receipt, Wallet, Building2, Star } from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RevenueTrendChart from "../../components/reports/revenue-trend-chart";
import PatientGrowthChart from "../../components/reports/patient-growth-chart";
import TreatmentsByTypeChart from "../../components/reports/treatments-by-type-chart";
import AppointmentDistributionChart from "../../components/reports/appointment-distribution-chart";
import { useToast } from '../../hooks/use-toast';
import type { Invoice } from '../billing/page';
import type { Patient } from '../patients/page';
import type { Appointment } from '../appointments/page';
import { format, startOfMonth, endOfMonth, isValid, subMonths, eachMonthOfInterval, differenceInDays, isWithinInterval } from 'date-fns';
import { Treatment } from '../treatments/page';
import { Transaction } from '../financial/page';
import { useLanguage } from '@/contexts/LanguageContext';
import type { StaffMember } from '@/lib/types';

const iconMap = {
    DollarSign,
    Users,
    Calendar,
    TrendingUp
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

export default function ReportsPage() {
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [dateRange, setDateRange] = React.useState('30');
  const [exportFormat, setExportFormat] = React.useState('csv');
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const currencyFmt = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });
  const numberFmt = new Intl.NumberFormat(locale);
  const percentFmt = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });

  // Core stats
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [newPatients, setNewPatients] = React.useState(0);
  const [totalAppointments, setTotalAppointments] = React.useState(0);
  const [showRate, setShowRate] = React.useState(0);

  // Extended stats
  const [totalPatients, setTotalPatients] = React.useState(0);
  const [totalStaff, setTotalStaff] = React.useState(0);
  const [totalTreatments, setTotalTreatments] = React.useState(0);
  const [totalInvoices, setTotalInvoices] = React.useState(0);
  const [outstandingAmount, setOutstandingAmount] = React.useState(0);
  const [paidAmount, setPaidAmount] = React.useState(0);
  const [avgTreatmentValue, setAvgTreatmentValue] = React.useState(0);
  const [completedAppointments, setCompletedAppointments] = React.useState(0);
  const [cancelledAppointments, setCancelledAppointments] = React.useState(0);
  const [pendingAppointments, setPendingAppointments] = React.useState(0);
  const [activePatients, setActivePatients] = React.useState(0);
  const [inactivePatients, setInactivePatients] = React.useState(0);
  const [doctorCount, setDoctorCount] = React.useState(0);
  const [receptionistCount, setReceptionistCount] = React.useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = React.useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = React.useState(0);
  const [collectionRate, setCollectionRate] = React.useState(0);
  const [avgAppointmentsPerDay, setAvgAppointmentsPerDay] = React.useState(0);

  // Chart data
  const [revenueTrendData, setRevenueTrendData] = React.useState<any[]>([]);
  const [patientGrowthData, setPatientGrowthData] = React.useState<any[]>([]);
  const [treatmentsByTypeData, setTreatmentsByTypeData] = React.useState<any[]>([]);
  const [appointmentDistributionData, setAppointmentDistributionData] = React.useState<any[]>([]);
  const [appointmentStatusData, setAppointmentStatusData] = React.useState<any[]>([]);
  const [invoiceStatusData, setInvoiceStatusData] = React.useState<any[]>([]);
  const [staffByRoleData, setStaffByRoleData] = React.useState<any[]>([]);
  const [topTreatments, setTopTreatments] = React.useState<any[]>([]);
  const [topDoctors, setTopDoctors] = React.useState<any[]>([]);


  React.useEffect(() => {
    async function fetchData() {
        setLoading(true);
        try {
        // Fetch from dedicated API endpoints that use Prisma models
        const [invoicesRes, patientsRes, appointmentsRes, treatmentsRes, transactionsRes, staffRes] = await Promise.all([
          fetch('/api/invoices').then(r => r.json()),
          fetch('/api/patients').then(r => r.json()),
          fetch('/api/appointments').then(r => r.json()),
          fetch('/api/treatments').then(r => r.json()),
          fetch('/api/transactions').then(r => r.json()),
          fetch('/api/staff').then(r => r.json()),
        ]);
        
        // Extract data from response wrappers
        const invoices: Invoice[] = invoicesRes.invoices || invoicesRes.items || invoicesRes || [];
        const rawPatients: any[] = patientsRes.patients || patientsRes.items || patientsRes || [];
        const appointments: any[] = appointmentsRes.appointments || appointmentsRes.items || appointmentsRes || [];
        const treatments: Treatment[] = treatmentsRes.treatments || treatmentsRes.items || treatmentsRes || [];
        const rawTransactions: any[] = transactionsRes.transactions || transactionsRes.items || transactionsRes || [];
        const staff: StaffMember[] = staffRes.staff || staffRes.items || staffRes || [];

        const transactions: Transaction[] = rawTransactions.map((t: any) => ({ ...t, date: new Date(t.date) }));
        const patients: Patient[] = rawPatients.map((p: any) => ({
            ...p,
            dob: new Date(p.dob),
            lastVisit: p.lastVisit ? new Date(p.lastVisit) : new Date(0),
        }));

        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);

        // --- Core Stats ---
        const totalRev = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
        setTotalRevenue(totalRev);

        const newPatientsCount = patients.filter(p => {
            const createdAt = (p as any).createdAt ? new Date((p as any).createdAt) : null;
            return createdAt && isValid(createdAt) && createdAt > thirtyDaysAgo;
        }).length;
        setNewPatients(newPatientsCount);

        setTotalAppointments(appointments.length);
        
        const confirmedOrCompleted = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Completed').length;
        if (appointments.length > 0) {
            setShowRate((confirmedOrCompleted / appointments.length) * 100);
        }

        // --- Extended Stats ---
        setTotalPatients(patients.length);
        setTotalStaff(staff.length);
        setTotalTreatments(treatments.length);
        setTotalInvoices(invoices.length);

        // Invoice stats
        const outstanding = invoices.reduce((acc, inv) => acc + ((inv.totalAmount || 0) - (inv.amountPaid || 0)), 0);
        const paid = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
        setOutstandingAmount(outstanding);
        setPaidAmount(paid);
        if (totalRev > 0) {
            setCollectionRate((paid / totalRev) * 100);
        }

        // Treatment stats
        const completedTreatments = treatments.filter(t => t.status === 'Completed');
        if (completedTreatments.length > 0) {
            const totalTreatmentRev = completedTreatments.reduce((acc, t) => acc + parseNumericValue((t as any).cost), 0);
            setAvgTreatmentValue(totalTreatmentRev / completedTreatments.length);
        }

        // Appointment stats
        const completed = appointments.filter(a => a.status === 'Completed').length;
        const cancelled = appointments.filter(a => a.status === 'Cancelled').length;
        const pending = appointments.filter(a => a.status === 'Pending').length;
        setCompletedAppointments(completed);
        setCancelledAppointments(cancelled);
        setPendingAppointments(pending);

        // Calculate avg appointments per day (last 30 days)
        const last30DaysAppts = appointments.filter(a => {
            const apptDate = new Date(a.dateTime);
            return isValid(apptDate) && apptDate >= thirtyDaysAgo;
        });
        setAvgAppointmentsPerDay(last30DaysAppts.length / 30);

        // Patient stats
        const active = patients.filter(p => p.status === 'Active').length;
        const inactive = patients.filter(p => p.status !== 'Active').length;
        setActivePatients(active);
        setInactivePatients(inactive);

        // Staff stats
        const doctors = staff.filter(s => s.role?.toLowerCase() === 'doctor' || s.role?.toLowerCase() === 'dentist').length;
        const receptionists = staff.filter(s => s.role?.toLowerCase() === 'receptionist').length;
        setDoctorCount(doctors);
        setReceptionistCount(receptionists);

        // Monthly financials
        const monthlyTx = transactions.filter(t => 
            isValid(t.date) && isWithinInterval(t.date, { start: currentMonthStart, end: currentMonthEnd })
        );
        const monthRev = monthlyTx.filter(t => t.type === 'Revenue').reduce((acc, t) => acc + parseNumericValue(t.amount as any), 0);
        const monthExp = monthlyTx.filter(t => t.type === 'Expense').reduce((acc, t) => acc + parseNumericValue(t.amount as any), 0);
        setMonthlyRevenue(monthRev);
        setMonthlyExpenses(monthExp);

        // --- Chart Data Processing ---

        // Revenue Trend (last 6 months)
        const last6Months = eachMonthOfInterval({
            start: subMonths(now, 5),
            end: now
        });
        const monthlyFinancials = last6Months.map(monthDate => {
            const monthStart = startOfMonth(monthDate);
            const monthEnd = endOfMonth(monthDate);
            const monthTx = transactions.filter(t => 
                isValid(t.date) && isWithinInterval(t.date, { start: monthStart, end: monthEnd })
            );
            const revenue = monthTx.filter(t => t.type === 'Revenue').reduce((acc, t) => acc + parseNumericValue(t.amount as any), 0);
            const expenses = monthTx.filter(t => t.type === 'Expense').reduce((acc, t) => acc + parseNumericValue(t.amount as any), 0);
            return { month: format(monthDate, 'MMM'), revenue, expenses };
        });
        setRevenueTrendData(monthlyFinancials);

        // Patient Growth (last 6 months)
        let cumulativePatients = 0;
        const patientGrowth = last6Months.map(monthDate => {
            const monthEnd = endOfMonth(monthDate);
            const patientsUpToMonth = patients.filter(p => {
                const createdAt = (p as any).createdAt ? new Date((p as any).createdAt) : p.dob;
                return isValid(createdAt) && createdAt <= monthEnd;
            }).length;
            const newInMonth = patientsUpToMonth - cumulativePatients;
            cumulativePatients = patientsUpToMonth;
            return { month: format(monthDate, 'MMM'), total: patientsUpToMonth, new: Math.max(0, newInMonth) };
        });
        setPatientGrowthData(patientGrowth);

        // Treatments by Type
        const treatmentCounts: Record<string, { count: number; revenue: number }> = {};
        treatments.forEach(t => {
            const proc = t.procedure || 'Other';
            if (!treatmentCounts[proc]) treatmentCounts[proc] = { count: 0, revenue: 0 };
            treatmentCounts[proc].count++;
            treatmentCounts[proc].revenue += parseNumericValue((t as any).cost);
        });
        const sortedTreatments = Object.entries(treatmentCounts)
            .map(([type, data]) => ({ type, ...data }))
            .sort((a, b) => b.count - a.count);
        setTreatmentsByTypeData(sortedTreatments.map(t => ({ type: t.type, count: t.count })));
        setTopTreatments(sortedTreatments.slice(0, 5));

        // Appointment Distribution by type
        const appointmentTypeCounts: Record<string, number> = {};
        appointments.forEach(a => {
            const type = a.type || 'General';
            appointmentTypeCounts[type] = (appointmentTypeCounts[type] || 0) + 1;
        });
        const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--muted))"];
        setAppointmentDistributionData(Object.entries(appointmentTypeCounts).map(([type, count], i) => ({type, count, color: colors[i % colors.length]})));

        // Appointment Status breakdown
        setAppointmentStatusData([
            { status: 'Completed', count: completed, color: 'hsl(142, 76%, 36%)' },
            { status: 'Confirmed', count: appointments.filter(a => a.status === 'Confirmed').length, color: 'hsl(217, 91%, 60%)' },
            { status: 'Pending', count: pending, color: 'hsl(45, 93%, 47%)' },
            { status: 'Cancelled', count: cancelled, color: 'hsl(0, 84%, 60%)' },
        ]);

        // Invoice Status breakdown
        const paidInvoices = invoices.filter(i => i.status === 'Paid').length;
        const partialInvoices = invoices.filter(i => i.status === 'Partially Paid').length;
        const unpaidInvoices = invoices.filter(i => i.status === 'Unpaid').length;
        const overdueInvoices = invoices.filter(i => i.status === 'Overdue').length;
        setInvoiceStatusData([
            { status: 'Paid', count: paidInvoices, color: 'hsl(142, 76%, 36%)' },
            { status: 'Partial', count: partialInvoices, color: 'hsl(217, 91%, 60%)' },
            { status: 'Unpaid', count: unpaidInvoices, color: 'hsl(45, 93%, 47%)' },
            { status: 'Overdue', count: overdueInvoices, color: 'hsl(0, 84%, 60%)' },
        ]);

        // Staff by Role
        const roleCounts: Record<string, number> = {};
        staff.forEach(s => {
            const role = s.role || 'Other';
            roleCounts[role] = (roleCounts[role] || 0) + 1;
        });
        setStaffByRoleData(Object.entries(roleCounts).map(([role, count]) => ({ role, count })));

        // Top Doctors by appointments
        const doctorAppts: Record<string, { name: string; appointments: number; completed: number }> = {};
        appointments.forEach(a => {
            const doctor = a.doctor || 'Unassigned';
            if (!doctorAppts[doctor]) doctorAppts[doctor] = { name: doctor, appointments: 0, completed: 0 };
            doctorAppts[doctor].appointments++;
            if (a.status === 'Completed') doctorAppts[doctor].completed++;
        });
        setTopDoctors(Object.values(doctorAppts).sort((a, b) => b.appointments - a.appointments).slice(0, 5));

        } catch (error) {
            console.error('Error fetching reports data:', error);
            toast({
                title: t('common.error'),
                description: 'Failed to load reports data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [t, toast]);

  const reportsPageStats = [
    {
      title: t('reports.total_revenue'),
      value: currencyFmt.format(totalRevenue),
      description: t('reports.all_time_revenue'),
      icon: "DollarSign",
      tab: "financial",
    },
    {
      title: t('reports.new_patients'),
      value: `${numberFmt.format(newPatients)}`,
      description: t('reports.last_30_days'),
      icon: "Users",
      tab: "patients",
    },
    {
      title: t('reports.total_appointments'),
      value: `${numberFmt.format(totalAppointments)}`,
      description: t('reports.all_time'),
      icon: "Calendar",
      tab: "appointments",
    },
    {
      title: t('reports.appointment_show_rate'),
      value: percentFmt.format(showRate / 100),
      description: t('reports.confirmed_appointments'),
      icon: "TrendingUp",
      tab: "overview",
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
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {reportsPageStats.map((stat, index) => {
                const Icon = iconMap[stat.icon as IconKey];
                const cardStyles = ['metric-card-blue','metric-card-green','metric-card-orange','metric-card-purple'];
                const cardStyle = cardStyles[index % cardStyles.length];
                const variants = ['blue','green','pink','neutral'];
                const variant = variants[index % variants.length] as 'blue'|'green'|'pink'|'neutral';
                const isActive = activeTab === stat.tab;
                return (
                  <Card
                    key={stat.title}
                    onClick={() => setActiveTab(stat.tab)}
                    className={cn(
                      'relative overflow-hidden border-0 shadow-sm transition-all duration-500 hover:scale-105 cursor-pointer group min-h-0',
                      cardStyle,
                      isActive && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
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
                        <CardIcon variant={variant} className="w-10 h-10 group-hover:rotate-12">
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

        {/* Comprehensive Reports Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-2xl blur-xl"></div>
            <TabsList className="relative bg-background/80 backdrop-blur-xl border-2 border-muted/50 p-1.5 rounded-2xl grid w-full grid-cols-2 lg:grid-cols-5 shadow-lg">
              <TabsTrigger 
                value="overview" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <BarChart3 className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('reports.overview')}
              </TabsTrigger>
              <TabsTrigger 
                value="financial" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <DollarSign className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('reports.financial')}
              </TabsTrigger>
              <TabsTrigger 
                value="patients" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <Users className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('patients.title')}
              </TabsTrigger>
              <TabsTrigger 
                value="appointments" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <Calendar className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('appointments.title')}
              </TabsTrigger>
              <TabsTrigger 
                value="staff" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <Building2 className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('nav.staff')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
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
              
              <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
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
              
              <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
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
              
              <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
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
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="mt-0 space-y-6">
            {/* Financial Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{currencyFmt.format(totalRevenue)}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{t('reports.total_revenue')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{currencyFmt.format(paidAmount)}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{t('reports.collected')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{currencyFmt.format(outstandingAmount)}</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">{t('reports.outstanding')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Percent className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{percentFmt.format(collectionRate / 100)}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">{t('reports.collection_rate')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                      <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('reports.revenue_vs_expenses')}</CardTitle>
                  </div>
                  <CardDescription>{t('reports.last_6_months')}</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <RevenueTrendChart data={revenueTrendData} />
                </CardContent>
              </Card>

              <Card className="border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                      <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('reports.invoice_status')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-4">
                    {invoiceStatusData.map((item) => (
                      <div key={item.status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="font-medium">{item.status}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.count} ({totalInvoices > 0 ? percentFmt.format(item.count / totalInvoices) : '0%'})</span>
                        </div>
                        <Progress value={totalInvoices > 0 ? (item.count / totalInvoices) * 100 : 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                      <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('reports.top_treatments_revenue')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
                    {topTreatments.map((treatment, index) => (
                      <div key={treatment.type} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="w-6 h-6 flex items-center justify-center rounded-full text-xs">
                            {index + 1}
                          </Badge>
                          <span className="font-medium text-sm truncate">{treatment.type}</span>
                        </div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{currencyFmt.format(treatment.revenue)}</p>
                        <p className="text-xs text-muted-foreground">{treatment.count} {t('reports.procedures')}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="mt-0 space-y-6">
            {/* Patient Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(totalPatients)}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{t('reports.total_patients')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(activePatients)}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{t('reports.active_patients')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <UserPlus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(newPatients)}</p>
                      <p className="text-xs text-teal-600 dark:text-teal-400">{t('reports.new_this_month')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(inactivePatients)}</p>
                      <p className="text-xs text-orange-600 dark:text-orange-400">{t('reports.inactive_patients')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                      <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('reports.patient_growth')}</CardTitle>
                  </div>
                  <CardDescription>{t('reports.last_6_months')}</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <PatientGrowthChart data={patientGrowthData} />
                </CardContent>
              </Card>

              <Card className="border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                      <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('reports.patient_status')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="font-medium">{t('reports.active')}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{activePatients} ({totalPatients > 0 ? percentFmt.format(activePatients / totalPatients) : '0%'})</span>
                      </div>
                      <Progress value={totalPatients > 0 ? (activePatients / totalPatients) * 100 : 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span className="font-medium">{t('reports.inactive')}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{inactivePatients} ({totalPatients > 0 ? percentFmt.format(inactivePatients / totalPatients) : '0%'})</span>
                      </div>
                      <Progress value={totalPatients > 0 ? (inactivePatients / totalPatients) * 100 : 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-0 space-y-6">
            {/* Appointment Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(totalAppointments)}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{t('reports.total')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(completedAppointments)}</p>
                      <p className="text-xs text-green-600 dark:text-green-400">{t('reports.completed')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(pendingAppointments)}</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">{t('reports.pending')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(cancelledAppointments)}</p>
                      <p className="text-xs text-red-600 dark:text-red-400">{t('reports.cancelled')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{avgAppointmentsPerDay.toFixed(1)}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">{t('reports.avg_per_day')}</p>
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
                      <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('reports.appointment_by_type')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pl-2">
                  <AppointmentDistributionChart data={appointmentDistributionData} />
                </CardContent>
              </Card>

              <Card className="border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('reports.appointment_status')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-4">
                    {appointmentStatusData.map((item) => (
                      <div key={item.status} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="font-medium">{item.status}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.count} ({totalAppointments > 0 ? percentFmt.format(item.count / totalAppointments) : '0%'})</span>
                        </div>
                        <Progress value={totalAppointments > 0 ? (item.count / totalAppointments) * 100 : 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
                      <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('reports.top_doctors')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
                    {topDoctors.map((doctor, index) => (
                      <div key={doctor.name} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs",
                            index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-amber-600" : "bg-blue-500"
                          )}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm truncate">{doctor.name}</span>
                        </div>
                        <p className="text-lg font-bold">{doctor.appointments}</p>
                        <p className="text-xs text-muted-foreground">{doctor.completed} {t('reports.completed')}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="mt-0 space-y-6">
            {/* Staff Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(totalStaff)}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">{t('reports.total_staff')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(doctorCount)}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{t('reports.doctors')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/50 dark:to-teal-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{numberFmt.format(receptionistCount)}</p>
                      <p className="text-xs text-teal-600 dark:text-teal-400">{t('reports.receptionists')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{currencyFmt.format(avgTreatmentValue)}</p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">{t('reports.avg_treatment')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                      <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('reports.staff_by_role')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-4">
                    {staffByRoleData.map((item) => (
                      <div key={item.role} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium capitalize">{item.role}</span>
                          <span className="text-sm text-muted-foreground">{item.count} ({totalStaff > 0 ? percentFmt.format(item.count / totalStaff) : '0%'})</span>
                        </div>
                        <Progress value={totalStaff > 0 ? (item.count / totalStaff) * 100 : 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-muted/50 shadow-xl">
                <CardHeader className="border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                      <PieChart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <CardTitle className="text-lg font-black">{t('reports.treatments_performed')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pl-2">
                  <TreatmentsByTypeChart data={treatmentsByTypeData} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

      </main>
    </DashboardLayout>
  );
}
