
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
import { cn } from "@/lib/utils";
import { Search, Pencil, Loader2, MoreHorizontal, Trash2, Eye } from "lucide-react";
import { NewTreatmentPlanDialog } from "@/components/treatments/new-treatment-plan-dialog";
import { useToast } from '@/hooks/use-toast';
import { ViewTreatmentDialog } from "@/components/treatments/view-treatment-dialog";
import { EditTreatmentDialog } from "@/components/treatments/edit-treatment-dialog";
import { getCollection, setDocument, updateDocument, deleteDocument, listenToCollection } from '@/services/firestore';
import type { Appointment } from '../appointments/page';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ViewAppointmentDialog } from '@/components/appointments/view-appointment-dialog';
import { useLanguage } from '@/contexts/LanguageContext';

export type TreatmentAppointment = {
    date: string;
    time: string;
    duration: string;
    status: Appointment['status'];
    appointmentId?: string;
};

export type Treatment = {
  id: string;
  date: string; 
  patient: string;
  procedure: string;
  doctor: string;
  cost: string;
  status: 'In Progress' | 'Completed' | 'Pending';
  notes: string;
  appointments: TreatmentAppointment[]; 
};

export default function TreatmentsPage() {
  const [treatments, setTreatments] = React.useState<Treatment[]>([]);
  const [allAppointments, setAllAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const { toast } = useToast();
  const [treatmentToView, setTreatmentToView] = React.useState<Treatment | null>(null);
  const [treatmentToEdit, setTreatmentToEdit] = React.useState<Treatment | null>(null);
  const [treatmentToDelete, setTreatmentToDelete] = React.useState<Treatment | null>(null);
  const [appointmentToView, setAppointmentToView] = React.useState<Appointment | null>(null);
  const { t, isRTL } = useLanguage();


  React.useEffect(() => {
  const unsubscribeTreatments = listenToCollection<any>('treatments', (data) => {
        setTreatments(data);
        if (loading) setLoading(false);
    }, (error) => {
    toast({ title: t('treatments.toast.error_fetching'), variant: "destructive", description: error.message });
        setLoading(false);
    });

  const unsubscribeAppointments = listenToCollection<any>('appointments', (data) => {
        setAllAppointments(data.map((a: any) => ({...a, dateTime: new Date(a.dateTime)})));
    }, (error) => {
    toast({ title: t('appointments.toast.error_fetching'), variant: "destructive", description: error.message });
    });

    return () => {
        unsubscribeTreatments();
        unsubscribeAppointments();
    };
  }, [toast, loading, t]);
  
  const treatmentPageStats = React.useMemo(() => {
    const total = treatments.length;
    const completed = treatments.filter(t => t.status === 'Completed').length;
    const inProgress = treatments.filter(t => t.status === 'In Progress').length;
    const pending = treatments.filter(t => t.status === 'Pending').length;

    return [
      { title: t('treatments.total_treatments'), value: total, description: t('treatments.all_recorded_treatments') },
      { title: t('treatments.completed_treatments'), value: completed, description: t('treatments.finished_treatment_plans') },
      { title: t('treatments.in_progress'), value: inProgress, description: t('treatments.ongoing_treatments') },
      { title: t('treatments.pending_treatments'), value: pending, description: t('treatments.awaiting_start') },
    ];
  }, [treatments, t]);

  const treatmentsWithAppointmentDetails = React.useMemo(() => {
    return treatments.map(treatment => {
      const appointmentsWithStatus = (treatment.appointments || []).map(appt => {
        const matchingAppt = allAppointments.find(ra => ra.id === appt.appointmentId);
        return {
          ...appt,
          status: matchingAppt?.status || appt.status || 'Unknown',
        };
      });
      // Determine overall treatment status
      const hasCompleted = appointmentsWithStatus.every(a => a.status === 'Completed');
      const hasInProgress = appointmentsWithStatus.some(a => a.status === 'Confirmed' || a.status === 'Pending');
      
      let overallStatus: Treatment['status'] = 'Pending';
      if(hasCompleted && appointmentsWithStatus.length > 0) {
        overallStatus = 'Completed';
      } else if (hasInProgress) {
        overallStatus = 'In Progress';
      }

      return { ...treatment, appointments: appointmentsWithStatus, status: overallStatus };
    });
  }, [treatments, allAppointments]);

  const handleSavePlan = async (data: any) => {
    try {
      const treatmentId = `TRT-${Date.now()}`;
      const batch = writeBatch(db);
      
      const appointmentRefs: TreatmentAppointment[] = [];

      for (const appt of (data.appointments || [])) {
        const [hours, minutes] = appt.time.split(':');
        const apptDateTime = new Date(appt.date);
        apptDateTime.setHours(parseInt(hours, 10));
        apptDateTime.setMinutes(parseInt(minutes, 10));

        const appointmentId = `APT-${Date.now()}-${Math.random()}`;
        const newAppointment: Appointment = {
          id: appointmentId,
          dateTime: apptDateTime,
          patient: data.patient,
          doctor: data.doctor,
          type: data.treatmentName,
          duration: appt.duration,
          status: 'Confirmed',
          treatmentId: treatmentId,
        };
        const appointmentRef = doc(db, 'appointments', appointmentId);
        batch.set(appointmentRef, { ...newAppointment, dateTime: newAppointment.dateTime.toISOString() });
        appointmentRefs.push({
            date: appt.date.toISOString(),
            time: appt.time,
            duration: appt.duration,
            appointmentId: appointmentId,
            status: 'Confirmed',
        });
      }

      const newTreatment: Treatment = {
        id: treatmentId,
        date: new Date().toLocaleDateString(),
        patient: data.patient,
        procedure: data.treatmentName,
        doctor: data.doctor,
        cost: 'EGP ' + Math.floor(500 + Math.random() * 2000),
        status: 'Pending',
        notes: data.notes,
        appointments: appointmentRefs,
      };

      const treatmentRef = doc(db, 'treatments', treatmentId);
      batch.set(treatmentRef, { ...newTreatment, appointments: newTreatment.appointments.map(a => ({...a, date: new Date(a.date).toISOString()})) });
      
      await batch.commit();

      toast({
        title: t('treatments.toast.plan_created'),
        description: t('treatments.toast.plan_created_desc'),
      });

      if ((data.appointments || []).length > 0) {
        toast({
          title: t('treatments.toast.appointments_scheduled'),
          description: t('treatments.toast.appointments_scheduled_desc', { count: (data.appointments || []).length, treatment: data.treatmentName }),
        });
      }

    } catch (e) {
  toast({ title: t('treatments.toast.error_creating_plan'), variant: "destructive" });
    }
  };
  
  const handleUpdateTreatment = async (updatedTreatment: Treatment) => {
    try {
        const batch = writeBatch(db);
        const treatmentRef = doc(db, 'treatments', updatedTreatment.id);
        
        const existingAppointmentsQuery = query(collection(db, "appointments"), where("treatmentId", "==", updatedTreatment.id));
        const existingAppointmentsSnapshot = await getDocs(existingAppointmentsQuery);
        const existingAppointmentIds = new Set(existingAppointmentsSnapshot.docs.map(d => d.id));

        const updatedAppointmentIds = new Set((updatedTreatment.appointments || []).map(a => a.appointmentId).filter(Boolean));

        // Delete appointments that are no longer in the plan
        existingAppointmentsSnapshot.forEach(appointmentDoc => {
            if (!updatedAppointmentIds.has(appointmentDoc.id)) {
                batch.delete(appointmentDoc.ref);
            }
        });

        // Update existing or create new appointments
        for (const appt of (updatedTreatment.appointments || [])) {
            const [hours, minutes] = appt.time.split(':');
            const apptDateTime = new Date(appt.date);
            apptDateTime.setHours(parseInt(hours, 10));
            apptDateTime.setMinutes(parseInt(minutes, 10));

            const appointmentData: Omit<Appointment, 'id'> = {
                dateTime: apptDateTime,
                patient: updatedTreatment.patient,
                doctor: updatedTreatment.doctor,
                type: updatedTreatment.procedure,
                duration: appt.duration,
                status: appt.status || 'Confirmed',
                treatmentId: updatedTreatment.id,
            };

            if (appt.appointmentId && existingAppointmentIds.has(appt.appointmentId)) {
                 const appointmentRef = doc(db, 'appointments', appt.appointmentId);
                 batch.update(appointmentRef, {...appointmentData, dateTime: appointmentData.dateTime.toISOString() });
            } else {
                const appointmentId = `APT-${Date.now()}-${Math.random()}`;
                const appointmentRef = doc(db, 'appointments', appointmentId);
                batch.set(appointmentRef, {...appointmentData, id: appointmentId, dateTime: appointmentData.dateTime.toISOString() });
                // Update the treatment's appointment with the new ID
                const treatmentAppt = (updatedTreatment.appointments || []).find(a => a.date === appt.date && a.time === appt.time);
                if (treatmentAppt) {
                    treatmentAppt.appointmentId = appointmentId;
                }
            }
        }
        
        const treatmentDocData = { ...updatedTreatment, appointments: (updatedTreatment.appointments || []).map(a => ({...a, date: new Date(a.date).toISOString()})) };
        batch.update(treatmentRef, treatmentDocData);

        await batch.commit();
        setTreatmentToEdit(null);
        toast({
            title: t('treatments.toast.plan_updated'),
            description: t('treatments.toast.plan_updated_desc'),
        });
    } catch(e) {
      toast({ title: t('treatments.toast.error_updating'), variant: "destructive" });
    }
  };
  
  const handleDeleteTreatment = async () => {
    if (!treatmentToDelete) return;
    try {
        const q = query(collection(db, "appointments"), where("treatmentId", "==", treatmentToDelete.id));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

  await deleteDocument('treatments', treatmentToDelete.id);

        setTreatmentToDelete(null);

    toast({
      title: t('treatments.toast.plan_deleted'),
      description: t('treatments.toast.plan_deleted_desc'),
      variant: "destructive",
    });

    } catch (e) {
    toast({ title: t('treatments.toast.error_deleting'), variant: "destructive" });
    }
  };

  const filteredTreatments = React.useMemo(() => {
    return treatmentsWithAppointmentDetails
      .filter(treatment =>
        treatment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.procedure.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(treatment =>
        statusFilter === 'all' || treatment.status.toLowerCase().replace(' ', '_') === statusFilter
      );
  }, [treatmentsWithAppointmentDetails, searchTerm, statusFilter]);

  const handleViewAppointment = (appointmentId?: string) => {
    if (!appointmentId) return;
    const appointment = allAppointments.find(a => a.id === appointmentId);
  if (appointment) {
        setAppointmentToView(appointment);
    } else {
    toast({ title: t('treatments.toast.appointment_not_found'), variant: 'destructive'});
    }
  };


  return (
    <DashboardLayout>
  <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Elite Header Section */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
                <div className="w-5 h-5 rounded bg-primary"></div>
              </div>
              <span className="text-sm font-medium text-muted-foreground">Treatment Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('treatments.title')}
            </h1>
            <p className="text-muted-foreground font-medium">Elite Treatment Planning</p>
          </div>
          <div className="flex items-center gap-3">
            <NewTreatmentPlanDialog onSave={handleSavePlan} />
          </div>
        </div>

        {/* Elite Treatment Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {treatmentPageStats.map((stat, index) => {
            const cardStyles = [
              'metric-card-blue',
              'metric-card-green', 
              'metric-card-orange',
              'metric-card-purple'
            ];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group",
                  cardStyle
                )}
              >
                {/* Animated Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className="text-2xl font-bold text-white drop-shadow-sm">
                      {stat.value}
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                    <div className="w-6 h-6 rounded bg-white/80"></div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 relative z-10">
                  <p className="text-xs text-white/80 font-medium">
                    {stat.description}
                  </p>
                  {/* Elite Status Indicator */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                    <span className="text-xs text-white/70 font-medium">Active</span>
                  </div>
                </CardContent>
                
                {/* Elite Corner Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent" />
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Card className="elite-card">
        <CardHeader className="flex flex-col gap-4 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <div className="w-4 h-4 rounded bg-primary"></div>
          </div>
          {t('treatments.treatment_records')}
        </CardTitle>
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
                      <TableHead className={cn(isRTL ? 'text-right' : 'text-left')}>{t('treatments.procedure')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-right' : 'text-left')}>{t('common.doctor')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-right' : 'text-left')}>{t('common.cost')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-right' : 'text-left')}>{t('treatments.appointments')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredTreatments.length > 0 ? (
                      filteredTreatments.map((treatment) => (
                        <TableRow key={treatment.id}>
                          <TableCell className={cn(isRTL ? 'text-right' : 'text-left')}>{treatment.patient}</TableCell>
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
                        <TableCell colSpan={6} className="h-24 text-center">
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

       <ViewAppointmentDialog
        appointment={appointmentToView}
        open={!!appointmentToView}
        onOpenChange={(isOpen) => !isOpen && setAppointmentToView(null)}
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
