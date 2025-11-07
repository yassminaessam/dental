
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  Activity,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OverviewStats from "@/components/dashboard/overview-stats";
import RevenueTrendsChart from "@/components/dashboard/revenue-trends-chart";
import AppointmentTypesChart from "@/components/dashboard/appointment-types-chart";
import { SupplyChainIntegration } from "@/components/dashboard/supply-chain-integration";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ScheduleAppointmentDialog } from "@/components/dashboard/schedule-appointment-dialog";
import { AddPatientDialog } from "@/components/dashboard/add-patient-dialog";
import KpiSuggestions from "@/components/dashboard/kpi-suggestions";
import PendingAppointmentsManager from "@/components/dashboard/pending-appointments-manager";
import { StaffOnly } from "@/components/auth/ProtectedRoute";
import { useToast } from '@/hooks/use-toast';
import type { AppointmentCreateInput } from '@/services/appointments.types';
import type { Patient } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
  const { t } = useLanguage();
    const [revenueData, setRevenueData] = React.useState<{ month: string; revenue: number; expenses: number; }[]>([]);
    const [appointmentTypes, setAppointmentTypes] = React.useState<{ name: string; value: number; color: string }[]>([]);

    // Redirect patients to their specific homepage
    React.useEffect(() => {
        if (!isLoading && isAuthenticated && user) {
            if (user.role === 'patient') {
                router.push('/patient-home');
                return;
            }
        }
    }, [user, isLoading, isAuthenticated, router]);

    React.useEffect(() => {
        async function fetchData() {
            try {
              const [transactionsResponse, appointmentsResponse] = await Promise.all([
                fetch('/api/collections/transactions'),
                fetch('/api/appointments'),
              ]);

              if (!transactionsResponse.ok) {
                throw new Error('Failed to load transactions');
              }
              if (!appointmentsResponse.ok) {
                throw new Error('Failed to load appointments');
              }

              const transactionsJson = await transactionsResponse.json();
              const appointmentsJson = await appointmentsResponse.json();

              const transactions = (transactionsJson.items ?? []) as Array<Record<string, unknown>>;
              const appointments = (appointmentsJson.appointments ?? []) as Array<Record<string, unknown>>;

            // Process revenue data for chart
            const monthlyFinancials: Record<string, { revenue: number, expenses: number }> = {};
            transactions.forEach((raw) => {
              const date = raw.date ? new Date(raw.date as string) : new Date();
              const amountField = typeof raw.amount === 'string' ? raw.amount : String(raw.amount ?? '0');
              const typeField = raw.type === 'Expense' ? 'Expense' : 'Revenue';
              const month = date.toLocaleString('default', { month: 'short' });
                if (!monthlyFinancials[month]) {
                    monthlyFinancials[month] = { revenue: 0, expenses: 0 };
                }
              const amount = parseFloat(amountField.replace(/[^0-9.-]+/g,""));
              if (typeField === 'Revenue') {
                    monthlyFinancials[month].revenue += amount;
                } else {
                    monthlyFinancials[month].expenses += amount;
                }
            });
            const chartData = Object.keys(monthlyFinancials).map(month => ({
                month,
                revenue: monthlyFinancials[month].revenue,
                expenses: monthlyFinancials[month].expenses
            }));
            setRevenueData(chartData);

            // Process appointment types
            const typeCounts = appointments.reduce<Record<string, number>>((acc, entry) => {
                const type = typeof entry.type === 'string' ? entry.type : 'Other';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {});
            
            const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
            const appointmentTypeData = Object.entries(typeCounts).map(([name, value], index) => ({
                name,
                value,
                color: colors[index % colors.length]
            }));
            setAppointmentTypes(appointmentTypeData);
            } catch (error) {
              console.error('Failed to load dashboard data', error);
            }
        }
        fetchData();
    }, []);

    const handleSavePatient = async (newPatientData: Omit<Patient, 'id'>) => {
        try {
        const response = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newPatientData,
            dob: newPatientData.dob.toISOString(),
          }),
        });
        if (!response.ok) {
          const details = await response.json().catch(() => ({}));
          throw new Error(details.error ?? 'Failed to add patient');
        }
            toast({ title: t('dashboard.toast.patient_added'), description: t('dashboard.toast.patient_added_desc', { name: newPatientData.name }) });
        } catch (error) {
            toast({ title: t('dashboard.toast.error_adding_patient'), variant: "destructive" });
        }
    };
    
    const handleSaveAppointment = async (data: AppointmentCreateInput) => {
        try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            bookedBy: data.bookedBy ?? 'staff',
            dateTime: data.dateTime.toISOString(),
            createdAt: data.createdAt?.toISOString(),
            updatedAt: data.updatedAt?.toISOString(),
          }),
        });

        if (!response.ok) {
          const details = await response.json().catch(() => ({}));
          throw new Error(details.error ?? 'Failed to schedule appointment');
        }

        const result = await response.json();
        const appointment = result.appointment as { patient?: string } | undefined;
        toast({ title: t('dashboard.toast.appointment_scheduled'), description: t('dashboard.toast.appointment_scheduled_desc', { patient: appointment?.patient ?? data.patient }) });
        } catch (error) {
            toast({ title: t('dashboard.toast.error_scheduling'), variant: "destructive" });
        throw (error instanceof Error ? error : new Error('Failed to schedule appointment'));
        }
    };

    // Show loading during redirect for patients
    if (!isLoading && isAuthenticated && user?.role === 'patient') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('dashboard.redirecting_patient')}</p>
                </div>
            </div>
        );
    }

  return (
    <StaffOnly>
      <DashboardLayout>
        <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-pink-200/10 dark:from-blue-900/15 dark:via-purple-900/10 dark:to-pink-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-tr from-green-200/30 via-cyan-200/20 to-blue-200/10 dark:from-green-900/15 dark:via-cyan-900/10 dark:to-blue-900/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          </div>

          {/* Welcome Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-xl">
                      <Activity className="h-8 w-8" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">
                      {t('dashboard.title')}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <ScheduleAppointmentDialog onSave={handleSaveAppointment} />
                  <AddPatientDialog onSave={handleSavePatient} />
                </div>
              </div>
            </div>
          </div>
          {/* Enhanced Overview Stats */}
          <div className="relative z-10">
            <OverviewStats />
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="group lg:col-span-3 relative border-2 border-muted hover:border-blue-200 dark:hover:border-blue-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-blue-50/10 dark:to-blue-950/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {t('analytics.revenue_trend')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pl-2 relative z-10">
                <RevenueTrendsChart data={revenueData} />
              </CardContent>
            </Card>

            <Card className="group lg:col-span-2 relative border-2 border-muted hover:border-purple-200 dark:hover:border-purple-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-purple-50/10 dark:to-purple-950/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    {t('dashboard.appointments_by_type')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center p-4 relative z-10">
                <AppointmentTypesChart data={appointmentTypes} />
              </CardContent>
            </Card>
          </div>
          <PendingAppointmentsManager onAppointmentUpdate={() => {
            // Optionally refresh dashboard data when appointments are confirmed
            window.location.reload();
          }} />
          <SupplyChainIntegration />
          <KpiSuggestions />
        </main>
      </DashboardLayout>
    </StaffOnly>
  );
}
