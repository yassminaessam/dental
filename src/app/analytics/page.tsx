
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
import { getCollection } from '@/services/firestore';
import type { Invoice } from '../billing/page';
import type { Patient } from '../patients/page';
import type { Appointment } from '../appointments/page';

const iconMap = {
    DollarSign,
    Users,
    TrendingUp,
    Activity
}

type IconKey = keyof typeof iconMap;


export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState('30');
  const { toast } = useToast();
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [patientCount, setPatientCount] = React.useState(0);
  const [showRate, setShowRate] = React.useState(0);


  React.useEffect(() => {
    async function fetchData() {
        const invoices = await getCollection<Invoice>('invoices');
        const total = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
        setTotalRevenue(total);

        const patients = await getCollection<Patient>('patients');
        setPatientCount(patients.length);

        const appointments = await getCollection<Appointment>('appointments');
        const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
        const totalAppointments = appointments.length;
        if(totalAppointments > 0) {
            setShowRate((confirmed / totalAppointments) * 100);
        }
    }
    fetchData();
  }, [])

  const analyticsPageStats = [
    {
        title: "Total Revenue",
        value: `EGP ${totalRevenue.toLocaleString()}`,
        change: "+12.5% from last period",
        icon: "DollarSign",
        changeType: "positive"
    },
    {
        title: "Patient Acquisition",
        value: `${patientCount}`,
        change: "+8.3% from last period",
        icon: "Users",
        changeType: "positive"
    },
    {
        title: "Appointment Show Rate",
        value: `${showRate.toFixed(1)}%`,
        change: "+2.1% from last period",
        icon: "TrendingUp",
        changeType: "positive"
    },
    {
        title: "Average Treatment Value",
        value: "EGP 6,250",
        change: "-1.2% from last period",
        icon: "Activity",
        changeType: "negative"
    }
  ];

  const handleExport = () => {
    toast({
        title: "Exporting Report",
        description: "Your analytics report is being generated and will be downloaded shortly.",
    });
  };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
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
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {analyticsPageStats.map((stat) => {
                const Icon = iconMap[stat.icon as IconKey];
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                            <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className={cn(
                                "text-xs text-muted-foreground",
                                stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                            )}>{stat.change}</p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="treatments">Treatments</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RevenueTrendsChart />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Appointment Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AppointmentAnalyticsChart />
                    </CardContent>
                </Card>
            </div>
          </TabsContent>
          <TabsContent value="patients">
             <Card>
                <CardHeader>
                    <CardTitle>Patient Demographics</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <PatientDemographicsChart />
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="treatments">
             <Card>
                <CardHeader>
                    <CardTitle>Treatment Volume</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <TreatmentVolumeChart />
                </CardContent>
             </Card>
          </TabsContent>
           <TabsContent value="staff">
             <Card>
                <CardHeader>
                    <CardTitle>Staff Performance</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <StaffPerformanceChart />
                </CardContent>
             </Card>
          </TabsContent>
           <TabsContent value="satisfaction">
             <Card>
                <CardHeader>
                    <CardTitle>Patient Satisfaction</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <PatientSatisfactionChart />
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
