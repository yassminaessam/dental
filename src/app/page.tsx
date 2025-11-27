
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
import PendingAppointmentsManager from "@/components/dashboard/pending-appointments-manager";
import { StaffOnly } from "@/components/auth/ProtectedRoute";
import { useToast } from '@/hooks/use-toast';
import type { AppointmentCreateInput } from '@/services/appointments.types';
import type { Patient } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

type SimplifiedTransaction = {
  date: Date;
  type: 'Revenue' | 'Expense';
  amountValue: number;
  sourceType?: string;
};

type UnknownRecord = Record<string, any>;

const sanitizeAmountValue = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const parseDateValue = (value: unknown): Date => {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
};

export default function DashboardPage() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
  const { t, language } = useLanguage();
    const [revenueData, setRevenueData] = React.useState<{ month: string; revenue: number; expenses: number; }[]>([]);
    const [appointmentTypes, setAppointmentTypes] = React.useState<{ name: string; value: number; color: string }[]>([]);
    const [statsRefreshKey, setStatsRefreshKey] = React.useState(0);

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
              const [transactionsResponse, purchaseOrdersResponse, appointmentsResponse] = await Promise.all([
                fetch('/api/collections/transactions'),
                fetch('/api/collections/purchase-orders'),
                fetch('/api/appointments'),
              ]);

              if (!transactionsResponse.ok) {
                throw new Error('Failed to load transactions');
              }
              if (!purchaseOrdersResponse.ok) {
                throw new Error('Failed to load purchase orders');
              }
              if (!appointmentsResponse.ok) {
                throw new Error('Failed to load appointments');
              }

              const transactionsJson = await transactionsResponse.json();
              const purchaseOrdersJson = await purchaseOrdersResponse.json();
              const appointmentsJson = await appointmentsResponse.json();

              const transactions = (transactionsJson.items ?? []) as UnknownRecord[];
              const purchaseOrders = (purchaseOrdersJson.items ?? []) as UnknownRecord[];
              // ✅ Appointments already come from Neon database via /api/appointments
              const appointments = (appointmentsJson.appointments ?? []) as UnknownRecord[];

            const manualTransactions = transactions
              .map<SimplifiedTransaction>((raw) => {
                const amountValue = sanitizeAmountValue(raw.amountValue ?? raw.amount);
                const type: 'Revenue' | 'Expense' = raw.type === 'Expense' ? 'Expense' : 'Revenue';
                const sourceType = typeof raw.sourceType === 'string' ? raw.sourceType : undefined;
                return {
                  date: parseDateValue(raw.date),
                  type,
                  amountValue,
                  sourceType,
                };
              })
              .filter((entry) => entry.amountValue > 0 && entry.sourceType !== 'purchase-order');

            const purchaseOrderTransactions = purchaseOrders
              .map<SimplifiedTransaction>((po) => {
                const totalAmount = sanitizeAmountValue(po.total ?? po.amount ?? 0);
                const status = typeof po.status === 'string' ? po.status.toLowerCase() : '';
                const isDelivered = status === 'delivered' || status === 'received' || status === 'completed';
                const effectiveDate = parseDateValue(po.deliveryDate ?? po.orderDate ?? new Date());
                return {
                  date: effectiveDate,
                  type: 'Expense',
                  amountValue: isDelivered ? totalAmount : 0,
                };
              })
              .filter((entry) => entry.amountValue > 0);

            const combinedTransactions = [...manualTransactions, ...purchaseOrderTransactions]
              .sort((a, b) => a.date.getTime() - b.date.getTime());

            const monthFormatterLocale = language === 'ar' ? 'ar-EG' : 'en-US';
            const monthlyFinancials = new Map<string, { label: string; revenue: number; expenses: number }>();

            combinedTransactions.forEach(({ date, type, amountValue }) => {
              if (!Number.isFinite(amountValue) || amountValue <= 0) {
                return;
              }
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              if (!monthlyFinancials.has(key)) {
                monthlyFinancials.set(key, {
                  label: date.toLocaleString(monthFormatterLocale, { month: 'short' }),
                  revenue: 0,
                  expenses: 0,
                });
              }
              const entry = monthlyFinancials.get(key)!;
              if (type === 'Revenue') {
                entry.revenue += amountValue;
              } else {
                entry.expenses += amountValue;
              }
            });

            const chartData = Array.from(monthlyFinancials.entries())
              .sort(([a], [b]) => (a > b ? 1 : -1))
              .map(([, value]) => ({
                month: value.label,
                revenue: Number(value.revenue.toFixed(2)),
                expenses: Number(value.expenses.toFixed(2)),
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
    }, [language]);

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
        
        // Refresh the stats to show updated patient count
        setStatsRefreshKey(prev => prev + 1);
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
        
        // Refresh the stats to show updated appointment counts
        setStatsRefreshKey(prev => prev + 1);
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
            <div className="relative elite-card rounded-3xl p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-300 backdrop-blur-sm shadow-md">
                      <Activity className="h-7 w-7" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400 bg-clip-text text-transparent animate-gradient">
                      {t('dashboard.title')}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
            <OverviewStats refreshKey={statsRefreshKey} />
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="group lg:col-span-3 relative elite-card hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300 backdrop-blur-sm">
                    <TrendingUp className="h-5 w-5" />
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

            <Card className="group lg:col-span-2 relative elite-card hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 backdrop-blur-sm">
                    <Calendar className="h-5 w-5" />
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
            // Refresh stats when appointments are confirmed/rejected
            setStatsRefreshKey(prev => prev + 1);
          }} />
          <SupplyChainIntegration />
        </main>
      </DashboardLayout>
    </StaffOnly>
  );
}
