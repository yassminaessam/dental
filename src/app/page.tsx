
'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
import type { AppointmentCreateInput } from '@/services/appointments';
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
            const typeCounts = appointments.reduce((acc, entry) => {
                const type = typeof entry.type === 'string' ? entry.type : 'Other';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
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
            confirmedAt: data.confirmedAt?.toISOString(),
            rejectedAt: data.rejectedAt?.toISOString(),
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
        <main className="flex w-full flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6 max-w-screen-2xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl sm:text-2xl font-bold">{t('dashboard.title')}</h1>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              <ScheduleAppointmentDialog onSave={handleSaveAppointment} />
              <AddPatientDialog onSave={handleSavePatient} />
            </div>
          </div>
          <OverviewStats />
          <div className="grid gap-4 md:gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
              <CardHeader>
        <CardTitle className="text-lg sm:text-xl">{t('analytics.revenue_trend')}</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <RevenueTrendsChart data={revenueData} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
        <CardTitle className="text-lg sm:text-xl">{t('dashboard.appointments_by_type')}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-4">
                <AppointmentTypesChart data={appointmentTypes} />
              </CardContent>
            </Card>
          </div>
          <PendingAppointmentsManager onAppointmentConfirmed={() => {
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
