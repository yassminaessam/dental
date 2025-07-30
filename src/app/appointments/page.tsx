
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appointmentPageStats, initialAppointmentsData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Plus, Calendar, List, Search, MoreHorizontal } from "lucide-react";
import { ScheduleAppointmentDialog } from "@/components/dashboard/schedule-appointment-dialog";
import { useToast } from '@/hooks/use-toast';

export type Appointment = {
  id: string;
  dateTime: Date;
  patient: string;
  doctor: string;
  type: string;
  duration: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = React.useState<Appointment[]>(initialAppointmentsData);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [activeView, setActiveView] = React.useState('list');
  const { toast } = useToast();

  const handleSaveAppointment = (data: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment: Appointment = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      ...data,
      status: 'Confirmed',
    };
    const updatedAppointments = [newAppointment, ...appointments].sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime());
    setAppointments(updatedAppointments);
    // Also update the shared array
    initialAppointmentsData.splice(0, initialAppointmentsData.length, ...updatedAppointments);
    toast({
        title: "Appointment Scheduled",
        description: `An appointment for ${newAppointment.patient} has been scheduled.`,
    });
  };
  
  const handleViewAppointment = (appointment: Appointment) => {
    toast({
        title: "Viewing Appointment",
        description: `Details for appointment ${appointment.id} with ${appointment.patient}.`,
    });
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(prev =>
      prev.map(appt =>
        appt.id === appointmentId ? { ...appt, status: newStatus } : appt
      )
    );
    toast({
      title: "Status Updated",
      description: `Appointment ${appointmentId} has been marked as ${newStatus}.`,
    });
  };

  const filteredAppointments = React.useMemo(() => {
    return appointments
      .filter(appointment =>
        appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(appointment =>
        statusFilter === 'all' || appointment.status.toLowerCase() === statusFilter
      );
  }, [appointments, searchTerm, statusFilter]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <ScheduleAppointmentDialog onSave={handleSaveAppointment} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {appointmentPageStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", stat.valueClassName)}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant={activeView === 'calendar' ? 'default' : 'outline'} onClick={() => setActiveView('calendar')}>
              <Calendar className="mr-2 h-4 w-4" />
              Calendar View
            </Button>
            <Button variant={activeView === 'list' ? 'default' : 'outline'} onClick={() => setActiveView('list')}>
              <List className="mr-2 h-4 w-4" />
              List View
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Appointment Schedule</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search appointments..."
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map(appt => (
                        <TableRow key={appt.id}>
                          <TableCell>{appt.dateTime.toLocaleString()}</TableCell>
                          <TableCell>{appt.patient}</TableCell>
                          <TableCell>{appt.doctor}</TableCell>
                          <TableCell>{appt.type}</TableCell>
                          <TableCell>{appt.duration}</TableCell>
                          <TableCell>{appt.status}</TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewAppointment(appt)}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Confirmed')}>
                                  Mark as Confirmed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Pending')}>
                                  Mark as Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Cancelled')} className="text-destructive">
                                  Mark as Cancelled
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                       <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No appointments found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
