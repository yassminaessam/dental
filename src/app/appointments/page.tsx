
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import { Plus, Calendar, List, Search, MoreHorizontal, Pencil, Loader2, CheckCircle } from "lucide-react";
import { ScheduleAppointmentDialog } from "@/components/dashboard/schedule-appointment-dialog";
import { useToast } from '@/hooks/use-toast';
import { ViewAppointmentDialog } from '@/components/appointments/view-appointment-dialog';
import { EditAppointmentDialog } from '@/components/appointments/edit-appointment-dialog';
import AppointmentCalendarView from '@/components/appointments/appointment-calendar-view';
import { setDocument, updateDocument, listenToCollection } from '@/services/firestore';
import { Badge } from '@/components/ui/badge';

export type Appointment = {
  id: string;
  dateTime: Date;
  patient: string;
  patientEmail?: string; // Add patient email for easier filtering
  patientPhone?: string; // Add patient phone
  doctor: string;
  type: string;
  duration: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  treatmentId?: string; // Optional field to link to a treatment plan
  notes?: string; // Additional notes
  bookedBy?: 'patient' | 'staff'; // Track who booked the appointment
  createdAt?: Date; // When the appointment was created
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
    const unsubscribe = listenToCollection<any>('appointments', (data) => {
      const sortedData = data
        .map(a => ({...a, dateTime: new Date(a.dateTime) }))
        .sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime());
      setAppointments(sortedData);
      if (loading) setLoading(false);
    }, (error) => {
      toast({ title: 'Error fetching appointments', variant: 'destructive', description: error.message });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast, loading]);

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
      toast({ title: "Appointment Scheduled", description: `An appointment for ${newAppointment.patient} has been scheduled.` });
    } catch (error) {
        toast({ title: "Error scheduling appointment", variant: "destructive" });
    }
  };

  const handleUpdateAppointment = async (updatedAppointment: Appointment) => {
    try {
      await updateDocument('appointments', updatedAppointment.id, { ...updatedAppointment, dateTime: updatedAppointment.dateTime.toISOString() });
      setAppointmentToEdit(null);
      toast({ title: "Appointment Updated", description: `Appointment for ${updatedAppointment.patient} has been updated.` });
    } catch (error) {
        toast({ title: "Error updating appointment", variant: "destructive" });
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await updateDocument('appointments', appointmentId, { status: newStatus });
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
    <ProtectedRoute requiredRoles={["receptionist", "admin", "doctor"]}>
      <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Appointments</h1>
          <ScheduleAppointmentDialog onSave={handleSaveAppointment} />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {appointmentPageStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={cn("text-lg sm:text-2xl font-bold", stat.valueClassName)}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Button 
              variant={activeView === 'calendar' ? 'default' : 'outline'} 
              onClick={() => setActiveView('calendar')}
              className="flex-1 sm:flex-initial h-9 sm:h-10"
            >
              <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-sm">Calendar</span>
            </Button>
            <Button 
              variant={activeView === 'list' ? 'default' : 'outline'} 
              onClick={() => setActiveView('list')}
              className="flex-1 sm:flex-initial h-9 sm:h-10"
            >
              <List className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-sm">List</span>
            </Button>
          </div>
        </div>

        {activeView === 'list' ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="text-lg sm:text-xl">Appointment Schedule</CardTitle>
                  <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                    <div className="relative w-full md:w-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search appointments..."
                        className="w-full rounded-lg bg-background pl-8 h-9 sm:h-10 lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[150px] h-9 sm:h-10">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  <div className="block sm:hidden">
                    {/* Mobile Card View */}
                    <div className="space-y-4 p-4">
                      {loading ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : filteredAppointments.length > 0 ? (
                        filteredAppointments.map(appt => (
                          <Card key={appt.id} className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-medium text-sm">{appt.patient}</div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
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
                                  <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Completed')}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Complete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Cancelled')} className="text-destructive">
                                    Cancel
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium">Date:</span> {appt.dateTime.toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Time:</span> {appt.dateTime.toLocaleTimeString()}
                              </div>
                              <div>
                                <span className="font-medium">Doctor:</span> {appt.doctor}
                              </div>
                              <div>
                                <span className="font-medium">Type:</span> {appt.type}
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span> {appt.duration}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>
                                <Badge variant={
                                  appt.status === 'Cancelled' ? 'destructive' :
                                  appt.status === 'Completed' ? 'default' :
                                  'secondary'
                                } className={cn(
                                  "ml-1 text-xs",
                                  appt.status === 'Completed' && 'bg-green-100 text-green-800'
                                )}>
                                  {appt.status}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-2 text-sm font-semibold">No appointments found</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Try adjusting your search or filters.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="hidden sm:block">
                    {/* Desktop Table View */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Date & Time</TableHead>
                          <TableHead className="whitespace-nowrap">Patient</TableHead>
                          <TableHead className="whitespace-nowrap">Doctor</TableHead>
                          <TableHead className="whitespace-nowrap">Type</TableHead>
                          <TableHead className="whitespace-nowrap">Duration</TableHead>
                          <TableHead className="whitespace-nowrap">Status</TableHead>
                          <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                        ) : filteredAppointments.length > 0 ? (
                          filteredAppointments.map(appt => (
                            <TableRow key={appt.id}>
                              <TableCell className="whitespace-nowrap">{appt.dateTime.toLocaleString()}</TableCell>
                              <TableCell className="whitespace-nowrap">{appt.patient}</TableCell>
                              <TableCell className="whitespace-nowrap">{appt.doctor}</TableCell>
                              <TableCell className="whitespace-nowrap">{appt.type}</TableCell>
                              <TableCell className="whitespace-nowrap">{appt.duration}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                <Badge variant={
                                  appt.status === 'Cancelled' ? 'destructive' :
                                  appt.status === 'Completed' ? 'default' :
                                  'secondary'
                                } className={cn(
                                  appt.status === 'Completed' && 'bg-green-100 text-green-800'
                                )}>
                                  {appt.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
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
                                    <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Completed')}>
                                      <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
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
                              <div className="flex flex-col items-center justify-center">
                                <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
                                <h3 className="text-sm font-semibold">No appointments found</h3>
                                <p className="text-sm text-muted-foreground">
                                  Try adjusting your search or filters.
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
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
    </ProtectedRoute>
  );
}
