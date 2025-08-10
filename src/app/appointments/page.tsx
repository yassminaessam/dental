
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
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t, isRTL } = useLanguage();

  React.useEffect(() => {
    const unsubscribe = listenToCollection<any>('appointments', (data) => {
      const sortedData = data
        .map(a => ({...a, dateTime: new Date(a.dateTime) }))
        .sort((a,b) => b.dateTime.getTime() - a.dateTime.getTime());
      setAppointments(sortedData);
      if (loading) setLoading(false);
    }, (error) => {
      toast({ title: t('appointments.toast.error_fetching'), variant: 'destructive', description: error.message });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast, loading, t]);

  const appointmentPageStats = React.useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'Pending').length;
    const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
    const todays = appointments.filter(a => new Date(a.dateTime).toDateString() === new Date().toDateString()).length;

    return [
      { title: t('reports.total_appointments'), value: total, description: t('appointments.stats.all_scheduled') },
      { title: t('appointments.stats.pending'), value: pending, description: t('appointments.stats.awaiting_confirmation'), valueClassName: "text-orange-500" },
      { title: t('appointments.stats.confirmed'), value: confirmed, description: t('appointments.stats.ready_for_visit'), valueClassName: "text-green-600" },
      { title: t('dashboard.todays_appointments'), value: todays, description: t('appointments.stats.scheduled_for_today') },
    ];
  }, [appointments, t]);

  const handleSaveAppointment = async (data: Omit<Appointment, 'id' | 'status'>) => {
    try {
      const newAppointment: Appointment = {
        id: `APT-${Date.now()}`,
        ...data,
        status: 'Confirmed',
      };
      await setDocument('appointments', newAppointment.id, { ...newAppointment, dateTime: newAppointment.dateTime.toISOString() });
      toast({ title: t('appointments.toast.scheduled'), description: t('appointments.toast.scheduled_desc') });
    } catch (error) {
        toast({ title: t('appointments.toast.error_scheduling'), variant: "destructive" });
    }
  };

  const handleUpdateAppointment = async (updatedAppointment: Appointment) => {
    try {
      await updateDocument('appointments', updatedAppointment.id, { ...updatedAppointment, dateTime: updatedAppointment.dateTime.toISOString() });
      setAppointmentToEdit(null);
      toast({ title: t('appointments.toast.updated'), description: t('appointments.toast.updated_desc') });
    } catch (error) {
        toast({ title: t('appointments.toast.error_updating'), variant: "destructive" });
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await updateDocument('appointments', appointmentId, { status: newStatus });
      toast({ title: t('appointments.toast.status_updated'), description: t('appointments.toast.status_updated_desc') });
    } catch (error) {
        toast({ title: t('appointments.toast.error_status'), variant: "destructive" });
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
  <main className="flex w-full flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-screen-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">{t('appointments.title')}</h1>
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
              <span className="text-sm">{t('appointments.view.calendar')}</span>
            </Button>
            <Button 
              variant={activeView === 'list' ? 'default' : 'outline'} 
              onClick={() => setActiveView('list')}
              className="flex-1 sm:flex-initial h-9 sm:h-10"
            >
              <List className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-sm">{t('appointments.view.list')}</span>
            </Button>
          </div>
        </div>

        {activeView === 'list' ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
      <CardTitle className="text-lg sm:text-xl">{t('appointments.title')}</CardTitle>
                  <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                    <div className="relative w-full md:w-auto">
                      <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
                      <Input
                        type="search"
        placeholder={t('appointments.search_placeholder')}
                        className={cn("w-full rounded-lg bg-background h-9 sm:h-10 lg:w-[300px]", isRTL ? 'pr-8 text-right' : 'pl-8')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-[150px] h-9 sm:h-10">
        <SelectValue placeholder={t('common.all_status')} />
                      </SelectTrigger>
                      <SelectContent>
        <SelectItem value="all">{t('appointments.filter.all_status')}</SelectItem>
        <SelectItem value="confirmed">{t('appointments.filter.confirmed')}</SelectItem>
        <SelectItem value="pending">{t('appointments.filter.pending')}</SelectItem>
        <SelectItem value="completed">{t('appointments.filter.completed')}</SelectItem>
        <SelectItem value="cancelled">{t('appointments.filter.cancelled')}</SelectItem>
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
                                    {t('appointments.menu.view_details')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setAppointmentToEdit(appt)}>
                                    <Pencil className="mr-2 h-4 w-4" /> {t('appointments.menu.edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Confirmed')}>
                                    {t('appointments.menu.mark_confirmed')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Completed')}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> {t('appointments.menu.complete')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Cancelled')} className="text-destructive">
                                    {t('appointments.menu.cancel')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium">{t('appointments.date')}:</span> {appt.dateTime.toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">{t('appointments.time')}:</span> {appt.dateTime.toLocaleTimeString()}
                              </div>
                              <div>
                                <span className="font-medium">{t('appointments.doctor')}:</span> {appt.doctor}
                              </div>
                              <div>
                                <span className="font-medium">{t('appointments.type')}:</span> {appt.type}
                              </div>
                              <div>
                                <span className="font-medium">{t('appointments.duration')}:</span> {appt.duration}
                              </div>
                              <div>
                                <span className="font-medium">{t('appointments.status')}:</span>
                                <Badge variant={
                                  appt.status === 'Cancelled' ? 'destructive' :
                                  appt.status === 'Completed' ? 'default' :
                                  'secondary'
                                } className={cn(
                                  "ml-1 text-xs",
                                  appt.status === 'Completed' && 'bg-green-100 text-green-800'
                                )}>
                                  {t(
                                    appt.status === 'Cancelled'
                                      ? 'appointments.filter.cancelled'
                                      : appt.status === 'Completed'
                                      ? 'appointments.filter.completed'
                                      : appt.status === 'Confirmed'
                                      ? 'appointments.filter.confirmed'
                                      : 'appointments.filter.pending'
                                  )}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-2 text-sm font-semibold">{t('appointments.no_appointments_found')}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{t('appointments.try_adjusting_filters')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="hidden sm:block">
                    {/* Desktop Table View */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>{t('appointments.date')} &amp; {t('appointments.time')}</TableHead>
                          <TableHead className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>{t('common.patient')}</TableHead>
                          <TableHead className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>{t('appointments.doctor')}</TableHead>
                          <TableHead className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>{t('appointments.type')}</TableHead>
                          <TableHead className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>{t('appointments.duration')}</TableHead>
                          <TableHead className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>{t('appointments.status')}</TableHead>
                          <TableHead className={cn("whitespace-nowrap", isRTL ? 'text-left' : 'text-right')}>{t('table.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                        ) : filteredAppointments.length > 0 ? (
                          filteredAppointments.map(appt => (
                            <TableRow key={appt.id}>
                              <TableCell className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>{appt.dateTime.toLocaleString()}</TableCell>
                              <TableCell className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>{appt.patient}</TableCell>
                              <TableCell className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>{appt.doctor}</TableCell>
                              <TableCell className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>{appt.type}</TableCell>
                              <TableCell className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>{appt.duration}</TableCell>
                              <TableCell className={cn("whitespace-nowrap", isRTL ? 'text-right' : 'text-left')}>
                                <Badge variant={
                                  appt.status === 'Cancelled' ? 'destructive' :
                                  appt.status === 'Completed' ? 'default' :
                                  'secondary'
                                } className={cn(
                                  appt.status === 'Completed' && 'bg-green-100 text-green-800'
                                )}>
                                  {t(
                                    appt.status === 'Cancelled'
                                      ? 'appointments.filter.cancelled'
                                      : appt.status === 'Completed'
                                      ? 'appointments.filter.completed'
                                      : appt.status === 'Confirmed'
                                      ? 'appointments.filter.confirmed'
                                      : 'appointments.filter.pending'
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className={cn("whitespace-nowrap", isRTL ? 'text-left' : 'text-right')}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">{t('table.actions')}</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setAppointmentToView(appt)}>
                                      {t('appointments.menu.view_details')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setAppointmentToEdit(appt)}>
                                      <Pencil className="mr-2 h-4 w-4" /> {t('appointments.menu.edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Confirmed')}>
                                      {t('appointments.menu.mark_confirmed')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Pending')}>
                                      {t('appointments.menu.mark_pending')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Completed')}>
                                      <CheckCircle className="mr-2 h-4 w-4" /> {t('appointments.menu.mark_completed')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(appt.id, 'Cancelled')} className="text-destructive">
                                      {t('appointments.menu.mark_cancelled')}
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
                                <h3 className="text-sm font-semibold">{t('appointments.no_appointments_found')}</h3>
                                <p className="text-sm text-muted-foreground">{t('appointments.try_adjusting_filters')}</p>
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
