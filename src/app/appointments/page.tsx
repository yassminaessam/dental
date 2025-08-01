
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
import { cn } from "@/lib/utils";
import { Plus, Calendar, List, Search, MoreHorizontal, Pencil, Loader2 } from "lucide-react";
import { ScheduleAppointmentDialog } from "@/components/dashboard/schedule-appointment-dialog";
import { useToast } from '@/hooks/use-toast';
import { ViewAppointmentDialog } from '@/components/appointments/view-appointment-dialog';
import { EditAppointmentDialog } from '@/components/appointments/edit-appointment-dialog';
import AppointmentCalendarView from '@/components/appointments/appointment-calendar-view';
import { getCollection, setDocument, updateDocument } from '@/services/firestore';

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
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [activeView, setActiveView] = React.useState('list');
  const [appointmentToView, setAppointmentToView] = React.useState<Appointment | null>(null);
  const [appointmentToEdit, setAppointmentToEdit] = React.useState<Appointment | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchAppointments() {
      try {
        const data = await getCollection<any>('appointments');
        setAppointments(data.map(a => ({...a, dateTime: new Date(a.dateTime) })).sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime()));
      } catch (error) {
        toast({ title: 'Error fetching appointments', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, [toast]);

  const appointmentPageStats = React.useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'Pending').length;
    const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
    const todays = appointments.filter(a => new Date(a.dateTime).toDateString() === new Date().toDateString()).length;

    return [
      { title: "Total Appointments", value: total, description: "All scheduled appointments" },
      { title: "Pending Appointments", value: pending, description: "Awaiting confirmation", valueClassName: "text-orange-500" },
      { title: "Confirmed Appointments", value: confirmed, description: "Ready for visit", valueClassName: "text-green-600" },
      { title: "Today's Appointments", value: todays, description: "Scheduled for today" },
    ];
  }, [appointments]);

  const handleSaveAppointment = async (data: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const newAppointment: Appointment = {
        id: `APT-${Date.now()}`,
        ...data,
        status: 'Confirmed',
      };
      await setDocument('appointments', newAppointment.id, { ...newAppointment, dateTime: newAppointment.dateTime.toISOString() });
      setAppointments(prev => [newAppointment, ...prev].sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()));
      toast({ title: "Appointment Scheduled", description: `An appointment for ${newAppointment.patient} has been scheduled.` });
    } catch (error) {
        toast({ title: "Error scheduling appointment", variant: "destructive" });
    }
  };

  const handleUpdateAppointment = async (updatedAppointment: Appointment) => {
    try {
      await updateDocument('appointments', updatedAppointment.id, { ...updatedAppointment, dateTime: updatedAppointment.dateTime.toISOString() });
      setAppointments(prev => prev.map(appt => appt.id === updatedAppointment.id ? updatedAppointment : appt));
      setAppointmentToEdit(null);
      toast({ title: "Appointment Updated", description: `Appointment for ${updatedAppointment.patient} has been updated.` });
    } catch (error) {
        toast({ title: "Error updating appointment", variant: "destructive" });
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await updateDocument('appointments', appointmentId, { status: newStatus });
      setAppointments(prev =>
        prev.map(appt =>
          appt.id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      );
      toast({ title: "Status Updated", description: `Appointment ${appointmentId} has been marked as ${newStatus}.` });
    } catch (error) {
        toast({ title: "Error updating status", variant: "destructive" });
    }
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

        {activeView === 'list' ? (
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
                      {loading ? (
                        <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                      ) : filteredAppointments.length > 0 ? (
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
                                  <DropdownMenuItem onClick={() => setAppointmentToView(appt)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setAppointmentToEdit(appt)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
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
        ) : (
          <AppointmentCalendarView appointments={appointments} onAppointmentClick={(appt) => setAppointmentToView(appt)} />
        )}
      </main>

      <ViewAppointmentDialog
        appointment={appointmentToView}
        open={!!appointmentToView}
        onOpenChange={(isOpen) => !isOpen && setAppointmentToView(null)}
      />

      {appointmentToEdit && (
        <EditAppointmentDialog
          appointment={appointmentToEdit}
          onSave={handleUpdateAppointment}
          open={!!appointmentToEdit}
          onOpenChange={(isOpen) => !isOpen && setAppointmentToEdit(null)}
        />
      )}

    </DashboardLayout>
  );
}
