
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OverviewStats from "@/components/dashboard/overview-stats";
import RevenueTrendsChart from "@/components/dashboard/revenue-trends-chart";
import AppointmentTypesChart from "@/components/dashboard/appointment-types-chart";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ScheduleAppointmentDialog } from "@/components/dashboard/schedule-appointment-dialog";
import { AddPatientDialog } from "@/components/dashboard/add-patient-dialog";
import KpiSuggestions from "@/components/dashboard/kpi-suggestions";
import { useToast } from '@/hooks/use-toast';
import { setDocument } from '@/services/firestore';
import type { Patient } from '@/app/patients/page';
import type { Appointment } from '@/app/appointments/page';

export default function DashboardPage() {
    const { toast } = useToast();

    const handleSavePatient = async (newPatientData: Omit<Patient, 'id'>) => {
        try {
            const newPatient = { ...newPatientData, id: `PAT-${Date.now()}`};
            await setDocument('patients', newPatient.id, { ...newPatient, dob: newPatient.dob.toISOString() });
            toast({ title: "Patient Added", description: `${newPatient.name} has been successfully added.` });
        } catch (error) {
            toast({ title: "Error adding patient", variant: "destructive" });
        }
    };
    
    const handleSaveAppointment = async (data: Omit<Appointment, 'id' | 'status' | 'dateTime'> & { dateTime: Date }) => {
        try {
            const newAppointment: Appointment = {
                id: `APT-${Date.now()}`,
                ...data,
                dateTime: data.dateTime,
                status: 'Confirmed',
            };
            await setDocument('appointments', newAppointment.id, { ...newAppointment, dateTime: newAppointment.dateTime.toISOString() });
            toast({ title: "Appointment Scheduled", description: `Appointment for ${newAppointment.patient} has been scheduled.` });
        } catch (error) {
            toast({ title: "Error scheduling appointment", variant: "destructive" });
        }
    };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <ScheduleAppointmentDialog onSave={handleSaveAppointment} />
            <AddPatientDialog onSave={handleSavePatient} />
          </div>
        </div>
        <OverviewStats />
        <div className="grid gap-6 md:grid-cols-5">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <RevenueTrendsChart />
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Appointments by Type</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <AppointmentTypesChart />
            </CardContent>
          </Card>
        </div>
        <KpiSuggestions />
      </main>
    </DashboardLayout>
  );
}
