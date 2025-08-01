
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
import { cn } from "@/lib/utils";
import { Download, DollarSign, Users, Calendar, TrendingUp, Loader2 } from "lucide-react";
import RevenueTrendChart from "@/components/reports/revenue-trend-chart";
import PatientGrowthChart from "@/components/reports/patient-growth-chart";
import TreatmentsByTypeChart from "@/components/reports/treatments-by-type-chart";
import AppointmentDistributionChart from "@/components/reports/appointment-distribution-chart";
import { useToast } from '@/hooks/use-toast';
import { getCollection } from '@/services/firestore';
import type { Invoice } from '../billing/page';
import type { Patient } from '../patients/page';
import type { Appointment } from '../appointments/page';
import { format, startOfMonth } from 'date-fns';
import { Treatment } from '../treatments/page';
import { Transaction } from '../financial/page';

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
        const [invoices, patients, appointments, treatments, transactions] = await Promise.all([
            getCollection<Invoice>('invoices'),
            getCollection<Patient>('patients'),
            getCollection<any>('appointments'),
            getCollection<Treatment>('treatments'),
            getCollection<Transaction>('transactions'),
        ]);
        
        // --- Top Stat Cards ---
        setTotalRevenue(invoices.reduce((acc, inv) => acc + inv.totalAmount, 0));

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        setNewPatients(patients.filter(p => new Date(p.lastVisit) > thirtyDaysAgo).length);

        setTotalAppointments(appointments.length);
        
        const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed').length;
        if (appointments.length > 0) {
            setShowRate((confirmedAppointments / appointments.length) * 100);
        }

        // --- Chart Data Processing ---

        // Revenue Trend
        const monthlyFinancials: Record<string, { revenue: number, expenses: number }> = {};
        transactions.forEach(t => {
            const month = format(new Date(t.date), 'MMM');
            if(!monthlyFinancials[month]) monthlyFinancials[month] = { revenue: 0, expenses: 0 };
            const amount = parseFloat(t.amount.replace(/[^0-9.-]+/g,""));
            if(t.type === 'Revenue') monthlyFinancials[month].revenue += amount;
            else monthlyFinancials[month].expenses += amount;
        });
        setRevenueTrendData(Object.entries(monthlyFinancials).map(([month, data]) => ({month, ...data})));

        // Patient Growth
        const monthlyGrowth: Record<string, { total: number, new: number }> = {};
        let cumulativePatients = 0;
        patients.sort((a,b) => new Date(a.dob).getTime() - new Date(b.dob).getTime()).forEach(p => {
             const month = format(startOfMonth(new Date(p.dob)), 'MMM');
             if(!monthlyGrowth[month]) {
                 monthlyGrowth[month] = { total: 0, new: 0 };
             }
             monthlyGrowth[month].new++;
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
      title: "Total Revenue",
      value: `EGP ${totalRevenue.toLocaleString()}`,
      description: "All time revenue",
      icon: "DollarSign",
    },
    {
      title: "New Patients",
      value: `${newPatients}`,
      description: "In the last 30 days",
      icon: "Users",
    },
    {
      title: "Total Appointments",
      value: `${totalAppointments}`,
      description: "All time",
      icon: "Calendar",
    },
    {
      title: "Appointment Show Rate",
      value: `${showRate.toFixed(1)}%`,
      description: "Confirmed appointments",
      icon: "TrendingUp",
    },
  ];

  const handleExport = () => {
    toast({
        title: "Exporting Report",
        description: `Your report for the last ${dateRange} days is being generated as a ${exportFormat.toUpperCase()} file.`,
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="text-muted-foreground">Generating reports...</p>
        </main>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Last 30 days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="60">Last 60 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="CSV" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reportsPageStats.map((stat) => {
                const Icon = iconMap[stat.icon as IconKey];
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <RevenueTrendChart data={revenueTrendData} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Patient Growth</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <PatientGrowthChart data={patientGrowthData} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Treatments by Type</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <TreatmentsByTypeChart data={treatmentsByTypeData} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Appointment Distribution</CardTitle>
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
