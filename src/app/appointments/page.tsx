
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
import { 
  Plus, 
  Calendar, 
  List, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Loader2, 
  CheckCircle,
  CalendarCheck,
  CalendarClock,
  Clock,
  Sparkles,
  Filter,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import { ScheduleAppointmentDialog } from "@/components/dashboard/schedule-appointment-dialog";
import { useToast } from '@/hooks/use-toast';
import { ViewAppointmentDialog } from '@/components/appointments/view-appointment-dialog';
import { EditAppointmentDialog } from '@/components/appointments/edit-appointment-dialog';
import AppointmentCalendarView from '@/components/appointments/appointment-calendar-view';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppointmentsClient } from '@/services/appointments.client';
import type { AppointmentCreateInput } from '@/services/appointments.types';
import type { Appointment } from '@/lib/types';

export type { Appointment } from '@/lib/types';

const sortAppointments = (entries: Appointment[]): Appointment[] =>
  entries.slice().sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

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

  const fetchAppointments = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await AppointmentsClient.list();
      setAppointments(sortAppointments(data));
    } catch (error) {
      const description = error instanceof Error ? error.message : undefined;
      toast({ title: t('appointments.toast.error_fetching'), variant: 'destructive', description });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  React.useEffect(() => {
    void fetchAppointments();
  }, [fetchAppointments]);

  const appointmentPageStats = React.useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'Pending').length;
    const confirmed = appointments.filter(a => a.status === 'Confirmed').length;
    const todays = appointments.filter(a => new Date(a.dateTime).toDateString() === new Date().toDateString()).length;

    return [
      { title: t('reports.total_appointments'), value: total, description: t('appointments.stats.all_scheduled'), cardStyle: 'metric-card-blue' },
      { title: t('appointments.stats.pending'), value: pending, description: t('appointments.stats.awaiting_confirmation'), cardStyle: 'metric-card-orange' },
      { title: t('appointments.stats.confirmed'), value: confirmed, description: t('appointments.stats.ready_for_visit'), cardStyle: 'metric-card-green' },
      { title: t('dashboard.todays_appointments'), value: todays, description: t('appointments.stats.scheduled_for_today'), cardStyle: 'metric-card-purple' },
    ];
  }, [appointments, t]);

  const handleSaveAppointment = async (data: AppointmentCreateInput) => {
    try {
      const created = await AppointmentsClient.create(data);
      setAppointments((prev) => sortAppointments([created, ...prev.filter((appointment) => appointment.id !== created.id)]));
      toast({ title: t('appointments.toast.scheduled'), description: t('appointments.toast.scheduled_desc') });
    } catch (error) {
      toast({ title: t('appointments.toast.error_scheduling'), variant: "destructive", description: error instanceof Error ? error.message : undefined });
      throw (error instanceof Error ? error : new Error('Failed to schedule appointment'));
    }
  };

  const handleUpdateAppointment = async (updatedAppointment: Appointment) => {
    try {
      const saved = await AppointmentsClient.update(updatedAppointment);
      setAppointments((prev) => sortAppointments(prev.map((appointment) => (appointment.id === saved.id ? saved : appointment))));
      setAppointmentToEdit(null);
      toast({ title: t('appointments.toast.updated'), description: t('appointments.toast.updated_desc') });
    } catch (error) {
      toast({ title: t('appointments.toast.error_updating'), variant: "destructive", description: error instanceof Error ? error.message : undefined });
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    // Take a snapshot for rollback in case the API fails
    const prevSnapshot = appointments;
    // Optimistic UI update so the table reflects changes immediately
    setAppointments((prev) =>
      sortAppointments(
        prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus, updatedAt: new Date() } : a))
      )
    );

    try {
      const updated = await AppointmentsClient.updateStatus(appointmentId, newStatus);
      if (updated) {
        setAppointments((prev) => sortAppointments(prev.map((a) => (a.id === appointmentId ? updated : a))));
      }
      toast({ title: t('appointments.toast.status_updated'), description: t('appointments.toast.status_updated_desc') });
    } catch (error) {
      // Roll back on failure
      setAppointments(prevSnapshot);
      toast({ title: t('appointments.toast.error_status'), variant: "destructive", description: error instanceof Error ? error.message : undefined });
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
        <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Decorative Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-200/25 via-teal-200/15 to-cyan-200/10 dark:from-green-900/12 dark:via-teal-900/8 dark:to-cyan-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-200/25 via-pink-200/15 to-rose-200/10 dark:from-purple-900/12 dark:via-pink-900/8 dark:to-rose-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
          </div>

          {/* Enhanced Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-teal-500/5 to-cyan-500/5 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-xl">
                      <CalendarDays className="h-8 w-8" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 dark:from-green-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                      {t('appointments.title')}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      إدارة وتنظيم مواعيد العيادة
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <ScheduleAppointmentDialog onSave={handleSaveAppointment} />
                </div>
              </div>
            </div>
          </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {appointmentPageStats.map((stat, idx) => {
            const variants = ['blue','orange','green','purple'] as const;
            const variant = variants[idx % variants.length];
            return (
              <Card
                key={stat.title}
                className={cn(
                  'relative overflow-hidden border-0 shadow-xl transition-all duration-500 group',
                  stat.cardStyle
                )}
                role="button"
                tabIndex={0}
                aria-label={stat.title}
                onClick={() => {
                  if (idx === 0) { setActiveView('list'); setStatusFilter('all'); }
                  else if (idx === 1) { setActiveView('list'); setStatusFilter('pending'); }
                  else if (idx === 2) { setActiveView('list'); setStatusFilter('confirmed'); }
                  else if (idx === 3) { setActiveView('calendar'); }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (e.currentTarget as HTMLDivElement).click(); }
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <CardIcon variant={variant} aria-hidden="true">
                    {idx === 0 && <CalendarDays className="h-5 w-5" />}
                    {idx === 1 && <Clock className="h-5 w-5" />}
                    {idx === 2 && <CheckCircle2 className="h-5 w-5" />}
                    {idx === 3 && <CalendarCheck className="h-5 w-5" />}
                  </CardIcon>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
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
