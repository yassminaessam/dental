"use client";

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NewTreatmentPlanDialog } from '@/components/treatments/new-treatment-plan-dialog';
import { ViewTreatmentDialog } from '@/components/treatments/view-treatment-dialog';
import { EditTreatmentDialog } from '@/components/treatments/edit-treatment-dialog';
import type { Appointment, Treatment, TreatmentAppointment } from '@/lib/types';
import type { NewTreatmentPlanData } from '@/components/treatments/new-treatment-plan-dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { listCollection } from '@/lib/collections-client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Eye, 
  Loader2, 
  MoreHorizontal, 
  Pencil, 
  Search, 
  Trash2,
  Stethoscope,
  Activity,
  Sparkles,
  Filter,
  Heart,
  Zap,
  CheckCircle,
  Clock,
  Play,
  AlertCircle
} from 'lucide-react';
import { CardIcon } from '@/components/ui/card-icon';

export type { TreatmentAppointment } from '@/lib/types';

export type { Treatment } from '@/lib/types';

type SerializedTreatment = Omit<Treatment, 'appointments'> & {
  appointments: Array<{
    appointmentId?: string;
    date: string;
    time: string;
    duration: string;
    status: Appointment['status'];
  }>;
};

type AppointmentRecord = Omit<Appointment, 'dateTime' | 'createdAt' | 'updatedAt' | 'confirmedAt' | 'rejectedAt'> & {
  dateTime: string;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string;
  rejectedAt?: string;
};

const deserializeTreatment = (record: SerializedTreatment): Treatment => ({
  ...record,
  appointments: (record.appointments ?? []).map((appointment) => ({
    ...appointment,
    date: new Date(appointment.date),
  })),
});

const deserializeAppointment = (record: AppointmentRecord): Appointment => ({
  ...record,
  dateTime: new Date(record.dateTime),
  createdAt: record.createdAt ? new Date(record.createdAt) : undefined,
  updatedAt: record.updatedAt ? new Date(record.updatedAt) : undefined,
  confirmedAt: record.confirmedAt ? new Date(record.confirmedAt) : undefined,
  rejectedAt: record.rejectedAt ? new Date(record.rejectedAt) : undefined,
});

const normalizePhoneNumber = (value?: string | null) =>
  value ? value.replace(/\D/g, '') : '';

const extractPhoneFromText = (value?: string | null) => {
  if (!value) return '';
  const match = value.match(/(\+?\d[\d\s-]{5,})/);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
};

export default function TreatmentsPage() {
  const [treatments, setTreatments] = React.useState<Treatment[]>([]);
  const [allAppointments, setAllAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [patientDirectory, setPatientDirectory] = React.useState<Record<string, { phone?: string }>>({});
  const { toast } = useToast();
  const [treatmentToView, setTreatmentToView] = React.useState<Treatment | null>(null);
  const [treatmentToEdit, setTreatmentToEdit] = React.useState<Treatment | null>(null);
  const [treatmentToDelete, setTreatmentToDelete] = React.useState<Treatment | null>(null);
  const { t, isRTL } = useLanguage();

  const refreshData = React.useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/treatments');
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to fetch treatments.';
        throw new Error(message);
      }
      const records = Array.isArray(payload?.treatments) ? payload.treatments : [];
      setTreatments(records.map(deserializeTreatment));
    } catch (error) {
      console.error('[TreatmentsPage] refreshData treatments error', error);
      setTreatments([]);
      toast({
        title: t('common.error'),
        description: t('treatments.toast.error_fetching'),
        variant: 'destructive',
      });
    }

    try {
      const appointmentRecords = await listCollection<AppointmentRecord>('appointments');
      setAllAppointments(appointmentRecords.map(deserializeAppointment));
    } catch (error) {
      console.error('[TreatmentsPage] refreshData appointments error', error);
      setAllAppointments([]);
      toast({
        title: t('common.error'),
        description: t('treatments.toast.error_fetching_appointments'),
        variant: 'destructive',
      });
    }

    try {
      const patientsResponse = await fetch('/api/patients');
      if (!patientsResponse.ok) throw new Error('Failed to fetch patients');
      const { patients: patientData } = await patientsResponse.json();
      const directory: Record<string, { phone?: string }> = {};
      (patientData ?? []).forEach((patient: any) => {
        directory[patient.id] = { phone: patient.phone };
      });
      setPatientDirectory(directory);
    } catch (error) {
      console.error('[TreatmentsPage] refreshData patients error', error);
      setPatientDirectory({});
      toast({
        title: t('common.error'),
        description: t('patients.error_fetching_description'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  React.useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const getTreatmentPhone = React.useCallback(
    (treatment: Treatment) => {
      if (treatment.patientId && patientDirectory[treatment.patientId]?.phone) {
        return patientDirectory[treatment.patientId]?.phone ?? '';
      }
      return extractPhoneFromText(treatment.patient);
    },
    [patientDirectory]
  );

  const treatmentsWithAppointmentDetails = React.useMemo(() => {
    const appointmentMap = new Map(allAppointments.map((appointment) => [appointment.id, appointment]));
    return treatments.map((treatment) => ({
      ...treatment,
      appointments: (treatment.appointments ?? []).map((appointment) => {
        const linked = appointment.appointmentId ? appointmentMap.get(appointment.appointmentId) : undefined;
        return {
          ...appointment,
          date: appointment.date instanceof Date ? appointment.date : new Date(appointment.date),
          status: linked?.status ?? appointment.status,
        };
      }),
    }));
  }, [treatments, allAppointments]);

  const treatmentPageStats = React.useMemo(() => {
    const total = treatments.length;
    const completed = treatments.filter((treatment) => treatment.status === 'Completed').length;
    const inProgress = treatments.filter((treatment) => treatment.status === 'In Progress').length;
    const pending = treatments.filter((treatment) => treatment.status === 'Pending').length;

    return [
      {
        title: t('treatments.total_treatments'),
        value: total.toString(),
        description: t('treatments.all_status'),
        cardStyle: 'metric-card-blue',
      },
      {
        title: t('treatments.completed_treatments'),
        value: completed.toString(),
        description: t('treatments.completed_status'),
        cardStyle: 'metric-card-green',
      },
      {
        title: t('treatments.in_progress_status'),
        value: inProgress.toString(),
        description: t('treatments.in_progress'),
        cardStyle: 'metric-card-purple',
      },
      {
        title: t('treatments.pending_treatments'),
        value: pending.toString(),
        description: t('treatments.pending_status'),
        cardStyle: 'metric-card-orange',
      },
    ];
  }, [treatments, t]);

  const handleSavePlan = React.useCallback(
    async (data: NewTreatmentPlanData) => {
      try {
        const response = await fetch('/api/treatments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: data.patientId,
            patientName: data.patientName,
            doctorId: data.doctorId,
            doctorName: data.doctorName,
            procedure: data.procedure,
            cost: data.cost ? `EGP ${data.cost.replace(/[^0-9.]/g, '')}` : 'EGP 0',
            notes: data.notes,
            appointments: data.appointments.map((appointment) => ({
              date: appointment.date.toISOString(),
              time: appointment.time,
              duration: appointment.duration,
              status: 'Confirmed' as Appointment['status'],
            })),
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const message = typeof payload?.error === 'string' ? payload.error : 'Failed to create treatment.';
          throw new Error(message);
        }

        await refreshData();

        toast({
          title: t('treatments.toast.plan_created'),
          description: t('treatments.toast.plan_created_desc'),
        });

        if (data.appointments.length > 0) {
          toast({
            title: t('treatments.toast.appointments_scheduled'),
            description: t('treatments.toast.appointments_scheduled_desc', {
              count: data.appointments.length,
              treatment: data.procedure,
            }),
          });
        }
      } catch (error) {
        console.error('[TreatmentsPage] handleSavePlan error', error);
        toast({ title: t('treatments.toast.error_creating_plan'), variant: 'destructive' });
      }
    },
    [refreshData, t, toast],
  );

  const handleUpdateTreatment = React.useCallback(
    async (updatedTreatment: Treatment) => {
      try {
        if (!updatedTreatment.patientId || !updatedTreatment.doctorId) {
          throw new Error('Missing patient or doctor identifier.');
        }

        const response = await fetch(`/api/treatments/${updatedTreatment.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: updatedTreatment.id,
            patientId: updatedTreatment.patientId,
            patientName: updatedTreatment.patient,
            doctorId: updatedTreatment.doctorId,
            doctorName: updatedTreatment.doctor,
            procedure: updatedTreatment.procedure,
            cost: updatedTreatment.cost,
            notes: updatedTreatment.notes,
            appointments: (updatedTreatment.appointments ?? []).map((appointment) => ({
              appointmentId: appointment.appointmentId,
              date: (appointment.date instanceof Date ? appointment.date : new Date(appointment.date)).toISOString(),
              time: appointment.time,
              duration: appointment.duration,
              status: appointment.status ?? 'Confirmed',
            })),
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const message = typeof payload?.error === 'string' ? payload.error : 'Failed to update treatment.';
          throw new Error(message);
        }

        await refreshData();
        setTreatmentToEdit(null);

        toast({
          title: t('treatments.toast.plan_updated'),
          description: t('treatments.toast.plan_updated_desc'),
        });
      } catch (error) {
        console.error('[TreatmentsPage] handleUpdateTreatment error', error);
        toast({ title: t('treatments.toast.error_updating'), variant: 'destructive' });
      }
    },
    [refreshData, t, toast],
  );

  const handleDeleteTreatment = React.useCallback(async () => {
    if (!treatmentToDelete) return;

    try {
      const response = await fetch(`/api/treatments/${treatmentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to delete treatment.';
        throw new Error(message);
      }

      await refreshData();

      toast({
        title: t('treatments.toast.plan_deleted'),
        description: t('treatments.toast.plan_deleted_desc'),
        variant: 'destructive',
      });

      setTreatmentToDelete(null);
    } catch (error) {
      console.error('[TreatmentsPage] handleDeleteTreatment error', error);
      toast({ title: t('treatments.toast.error_deleting'), variant: 'destructive' });
    }
  }, [refreshData, treatmentToDelete, t, toast]);

  const filteredTreatments = React.useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase().trim();
    const numericSearchTerm = searchTerm.replace(/\D/g, '');
    const hasTextSearch = lowercasedTerm.length > 0;
    const hasNumericSearch = numericSearchTerm.length > 0;

    return treatmentsWithAppointmentDetails
      .filter((treatment) => {
        if (!hasTextSearch && !hasNumericSearch) {
          return true;
        }

        const matchesPatient = treatment.patient.toLowerCase().includes(lowercasedTerm);
        const matchesProcedure = treatment.procedure.toLowerCase().includes(lowercasedTerm);
        const matchesDoctor = treatment.doctor.toLowerCase().includes(lowercasedTerm);
        const matchesStatus = treatment.status.toLowerCase().includes(lowercasedTerm);
        const matchesCost = (treatment.cost || '').toString().toLowerCase().includes(lowercasedTerm);

        const phoneValue = getTreatmentPhone(treatment);
        const normalizedPhone = normalizePhoneNumber(phoneValue);
        const matchesPhone = hasNumericSearch
          ? normalizedPhone.includes(numericSearchTerm)
          : phoneValue.toLowerCase().includes(lowercasedTerm);

        const matchesAppointment = (treatment.appointments ?? []).some((appt) => {
          const dateString = format(new Date(appt.date), 'PPP').toLowerCase();
          const timeString = (appt.time || '').toLowerCase();
          const statusString = (appt.status || '').toLowerCase();
          return (
            dateString.includes(lowercasedTerm) ||
            timeString.includes(lowercasedTerm) ||
            statusString.includes(lowercasedTerm)
          );
        });

        return (
          matchesPatient ||
          matchesProcedure ||
          matchesDoctor ||
          matchesStatus ||
          matchesCost ||
          matchesPhone ||
          matchesAppointment
        );
      })
      .filter((treatment) => statusFilter === 'all' || treatment.status.toLowerCase().replace(' ', '_') === statusFilter);
  }, [treatmentsWithAppointmentDetails, searchTerm, statusFilter, getTreatmentPhone]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-200/25 via-purple-200/15 to-pink-200/10 dark:from-indigo-900/12 dark:via-purple-900/8 dark:to-pink-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/25 via-blue-200/15 to-indigo-200/10 dark:from-cyan-900/12 dark:via-blue-900/8 dark:to-indigo-900/5 rounded-full blur-3xl animate-pulse animation-delay-1200"></div>
        </div>

        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-xl">
                    <Activity className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    {t('treatments.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('page.treatments.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <NewTreatmentPlanDialog onSave={handleSavePlan} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {treatmentPageStats.map((stat, idx) => (
            <Card
              key={stat.title}
              className={cn(
                "relative overflow-hidden border-0 shadow-xl transition-all duration-500",
                stat.cardStyle
              )}
              role="button"
              tabIndex={0}
              aria-label={stat.title}
              onClick={() => {
                // 0: total, 1: completed, 2: in-progress, 3: pending
                if (idx === 0) setStatusFilter('all');
                else if (idx === 1) setStatusFilter('completed');
                else if (idx === 2) setStatusFilter('in_progress');
                else if (idx === 3) setStatusFilter('pending');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  (e.currentTarget as HTMLDivElement).click();
                }
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <CardIcon variant={(['blue','green','orange','purple'] as const)[idx % 4]} aria-hidden="true">
                  {idx === 0 && <Stethoscope className="h-5 w-5" />}
                  {idx === 1 && <CheckCircle className="h-5 w-5" />}
                  {idx === 2 && <Activity className="h-5 w-5" />}
                  {idx === 3 && <Clock className="h-5 w-5" />}
                </CardIcon>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Card>
        <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <CardTitle>{t('treatments.treatment_records')}</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
                    <Input
                      type="search"
                      placeholder={t('treatments.search_placeholder')}
                      className={cn("w-full rounded-lg bg-background lg:w-[336px]", isRTL ? 'pr-8 text-right' : 'pl-8')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('treatments.all_status')} />
                    </SelectTrigger>
                    <SelectContent>
            <SelectItem value="all">{t('treatments.all_status')}</SelectItem>
            <SelectItem value="in_progress">{t('treatments.in_progress_status')}</SelectItem>
            <SelectItem value="completed">{t('treatments.completed_status')}</SelectItem>
            <SelectItem value="pending">{t('treatments.pending_status')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn(isRTL ? 'text-right' : 'text-left')}>{t('common.patient')}</TableHead>
                      <TableHead className="text-left" dir="ltr">{t('common.phone')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-right' : 'text-left')}>{t('treatments.procedure')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-right' : 'text-left')}>{t('common.doctor')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-right' : 'text-left')}>{t('common.cost')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-right' : 'text-left')}>{t('treatments.appointments')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredTreatments.length > 0 ? (
                      filteredTreatments.map((treatment) => (
                        <TableRow key={treatment.id}>
                          <TableCell className={cn(isRTL ? 'text-right' : 'text-left')}>{treatment.patient}</TableCell>
                          <TableCell className="text-left" dir="ltr">
                            {getTreatmentPhone(treatment) || t('common.na')}
                          </TableCell>
                          <TableCell className={cn(isRTL ? 'text-right' : 'text-left')}>{treatment.procedure}</TableCell>
                          <TableCell className={cn(isRTL ? 'text-right' : 'text-left')}>{treatment.doctor}</TableCell>
                          <TableCell className={cn(isRTL ? 'text-right' : 'text-left')}>{treatment.cost}</TableCell>
                          <TableCell className={cn(isRTL ? 'text-right' : 'text-left')}>
                            <div className="flex flex-col gap-2">
                                {(treatment.appointments || []).map((appt, index) => {
                                    const statusLabel =
                                      appt.status === 'Cancelled' ? t('appointments.filter.cancelled') :
                                      appt.status === 'Completed' ? t('appointments.filter.completed') :
                                      appt.status === 'Confirmed' ? t('appointments.filter.confirmed') :
                                      appt.status === 'Pending' ? t('appointments.filter.pending') :
                                      appt.status;
                                    return (
                                      <div key={index} className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                                              {format(new Date(appt.date), 'PPP')} @ {appt.time}
                                          </span>
                                          <Badge
                                            variant={
                                              appt.status === 'Cancelled' ? 'destructive' :
                                              appt.status === 'Completed' ? 'default' :
                                              'secondary'
                                            }
                                            className={cn(
                                              'capitalize h-5 text-xs',
                                              appt.status === 'Completed' && 'bg-green-100 text-green-800'
                                            )}
                                          >
                                            {statusLabel}
                                          </Badge>
                                      </div>
                                    );
                                })}
                                {(!treatment.appointments || treatment.appointments.length === 0) && (
                  <span className="text-xs text-muted-foreground">{t('treatments.no_appointments')}</span>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className={cn(isRTL ? 'text-left' : 'text-right')}>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTreatmentToView(treatment)}>
                    <Eye className="mr-2 h-4 w-4" /> {t('table.view_details')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTreatmentToEdit(treatment)}>
                    <Pencil className="mr-2 h-4 w-4" /> {t('table.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTreatmentToDelete(treatment)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> {t('table.delete')}
                  </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
              {t('table.no_records_found')}
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

      <ViewTreatmentDialog
        treatment={treatmentToView}
        open={!!treatmentToView}
        onOpenChange={(isOpen) => !isOpen && setTreatmentToView(null)}
      />
      {treatmentToEdit && (
        <EditTreatmentDialog
            treatment={treatmentToEdit}
            onSave={handleUpdateTreatment}
            open={!!treatmentToEdit}
            onOpenChange={(isOpen) => !isOpen && setTreatmentToEdit(null)}
        />
      )}

      <AlertDialog open={!!treatmentToDelete} onOpenChange={(isOpen) => !isOpen && setTreatmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('treatments.delete_confirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTreatment}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
