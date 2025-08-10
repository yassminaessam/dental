
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Treatment } from '../../app/treatments/page';
import { getCollection } from '../../services/firestore';
import { Patient } from '../../app/patients/page';
import { StaffMember } from '../../app/staff/page';
import { ScrollArea } from '../ui/scroll-area';
import { Calendar } from '../ui/calendar';
import { Trash2 } from 'lucide-react';
import { Appointment } from '../../app/appointments/page';
import { useLanguage } from '@/contexts/LanguageContext';

const buildAppointmentSchema = (t: (k: string) => string) =>
  z.object({
    date: z.date(),
    time: z.string().min(1, t('appointments.validation.time_required')),
    duration: z.string().min(1, t('appointments.validation.duration_required')),
    appointmentId: z.string().optional(),
    status: z.custom<Appointment['status']>().optional(),
  });

const buildPlanSchema = (t: (k: string) => string) =>
  z.object({
    patient: z.string({ required_error: t('validation.patient_required') }),
    doctor: z.string({ required_error: t('appointments.validation.doctor_required') }),
    procedure: z.string().min(1, t('treatments.validation.procedure_required')),
    cost: z.string().min(1, t('treatments.validation.cost_required')),
    notes: z.string().optional(),
    appointments: z.array(buildAppointmentSchema(t)).min(1, t('treatments.validation.at_least_one_appointment')),
  });

type PlanFormData = {
  patient: string;
  doctor: string;
  procedure: string;
  cost: string;
  notes?: string;
  appointments: Array<{
    date: Date;
    time: string;
    duration: string;
    appointmentId?: string;
    status?: Appointment['status'];
  }>;
};

const availableTimeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
];
const appointmentDurations = ['30 minutes', '1 hour', '1.5 hours', '2 hours'];

interface EditTreatmentDialogProps {
  treatment: Treatment;
  onSave: (data: Treatment) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTreatmentDialog({ treatment, onSave, open, onOpenChange }: EditTreatmentDialogProps) {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<StaffMember[]>([]);
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  const form = useForm<PlanFormData>({
    resolver: zodResolver(buildPlanSchema(t)),
    defaultValues: {
        patient: '',
        doctor: '',
        procedure: '',
        cost: '',
        notes: '',
        appointments: [],
    }
  });

  const { control, reset, formState: { errors } } = form;
  const { fields, append, remove, replace } = useFieldArray<PlanFormData, 'appointments', 'id'>({
    control,
    name: "appointments"
  });

  const selectedDates: Date[] = React.useMemo(() => fields.map(f => f.date as Date), [fields]);
  
  React.useEffect(() => {
    async function fetchData() {
        const patientData = await getCollection<Patient>('patients');
        setPatients(patientData);
        const staffData = await getCollection<StaffMember>('staff');
        setDoctors(staffData.filter(s => s.role === 'Dentist'));
    }
    if (open) {
        fetchData();
    }
  }, [open]);

  React.useEffect(() => {
    if (treatment && patients.length > 0 && doctors.length > 0) {
        reset({
            patient: patients.find(p => p.name === treatment.patient)?.id,
            doctor: doctors.find(d => d.name === treatment.doctor)?.id,
            procedure: treatment.procedure,
            cost: treatment.cost.replace(/[^0-9.-]+/g,""),
            notes: treatment.notes,
            appointments: treatment.appointments.map(a => ({
                date: new Date(a.date),
                time: a.time,
                duration: a.duration,
                appointmentId: a.appointmentId,
                status: a.status,
            }))
        });
    }
  }, [treatment, reset, patients, doctors]);

  const handleDateSelect = (days: Date[] | undefined) => {
    const sortedDays = (days || []).sort((a,b) => a.getTime() - b.getTime());
    const newAppointments = sortedDays.map(day => {
        const existing = fields.find(f => (f.date as Date).getTime() === day.getTime());
        return existing
          ? { date: existing.date as Date, time: existing.time as string, duration: existing.duration as string, appointmentId: existing.appointmentId as string | undefined, status: existing.status as Appointment['status'] | undefined }
          : { date: day, time: '09:00', duration: '1 hour', status: 'Confirmed' as Appointment['status'] };
    });
    replace(newAppointments);
  };

  const onSubmit = (data: PlanFormData) => {
    const patientName = patients.find(p => p.id === data.patient)?.name;
    const doctorName = doctors.find(d => d.id === data.doctor)?.name;
    
    const updatedTreatment: Treatment = {
        ...treatment,
        patient: patientName || treatment.patient,
        doctor: doctorName || treatment.doctor,
        procedure: data.procedure,
        cost: `EGP ${data.cost}`,
        notes: data.notes || '',
  appointments: data.appointments.map((a: PlanFormData['appointments'][number]) => ({
            date: a.date.toISOString(),
            time: a.time,
            duration: a.duration,
            appointmentId: a.appointmentId,
            status: a.status || 'Confirmed'
        })),
    };
    onSave(updatedTreatment);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
      <DialogTitle>{t('treatments.edit_dialog.title')}</DialogTitle>
      <DialogDescription>
      {t('treatments.edit_dialog.description')}
      </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-3 gap-6 py-4">
            <div className="col-span-1 space-y-6">
                 <FormField
                    control={control}
                    name="patient"
                    render={({ field }) => (
                    <FormItem>
            <FormLabel>{t('treatments.patient')} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
              <SelectTrigger><SelectValue placeholder={t('treatments.select_patient')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{patients.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="doctor"
                    render={({ field }) => (
                    <FormItem>
            <FormLabel>{t('treatments.doctor')} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
              <SelectTrigger><SelectValue placeholder={t('treatments.select_doctor')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{doctors.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="procedure"
                    render={({ field }) => (
                    <FormItem>
            <FormLabel>{t('treatments.treatment_name')} *</FormLabel>
            <FormControl><Input placeholder={t('treatments.treatment_name_placeholder')} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={control}
                    name="cost"
                    render={({ field }) => (
                        <FormItem>
            <FormLabel>{t('treatments.cost')} *</FormLabel>
            <FormControl><Input type="text" placeholder="EGP 0.00" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="notes"
                    render={({ field }) => (
                    <FormItem>
            <FormLabel>{t('treatments.notes')}</FormLabel>
                        <FormControl>
                        <Textarea
              placeholder={t('treatments.notes_placeholder')}
                            className="resize-none h-24"
                            {...field}
                            value={field.value ?? ''}
                        />
                        </FormControl>
                    </FormItem>
                    )}
                />
            </div>
             <div className="col-span-2">
                <FormItem>
          <FormLabel>{t('appointments.appointment_dates')} *</FormLabel>
                    <div className="flex gap-4">
                        <Calendar
                            mode="multiple"
                            selected={selectedDates}
                            onSelect={handleDateSelect}
                            className="rounded-md border"
                            />
                        <div className="flex-1">
              <h4 className="mb-2 text-sm font-medium">{t('treatments.selected_appointments')}</h4>
                             <ScrollArea className="h-72 rounded-md border p-2">
                               {fields.length > 0 ? (
                                fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center mb-2">
                     <p className="col-span-4 text-sm font-medium">{(field.date as Date).toLocaleDateString(locale, { dateStyle: 'medium' })}</p>
                                       <FormField
                                            control={control}
                                            name={`appointments.${index}.time`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-3">
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>{availableTimeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                       <FormField
                                            control={control}
                                            name={`appointments.${index}.duration`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-4">
                                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>{appointmentDurations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <Button variant="ghost" size="icon" className="col-span-1" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))
                               ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t('treatments.select_dates_from_calendar')}</p>
                               )}
                             </ScrollArea>
                        </div>
                    </div>
                    <FormMessage>{errors.appointments?.message || errors.appointments?.root?.message}</FormMessage>
                </FormItem>
            </div>
            <DialogFooter className="col-span-3">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
        <Button type="submit">{t('common.save_changes')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
