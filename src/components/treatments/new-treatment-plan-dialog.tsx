
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
// Migrated from server getCollection to client listDocuments
import { listDocuments } from '@/lib/data-client';
import { Patient } from '@/app/patients/page';
import { StaffMember } from '@/app/staff/page';
import { ScrollArea } from '../ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

// Schema builders to localize validation messages
const buildAppointmentSchema = (t: (k: string) => string) =>
  z.object({
    date: z.date(),
    time: z.string().min(1, t('appointments.validation.time_required')),
    duration: z.string().min(1, t('appointments.validation.duration_required')),
  });

const buildPlanSchema = (t: (k: string) => string) =>
  z.object({
    patient: z.string({ required_error: t('validation.patient_required') }),
    doctor: z.string({ required_error: t('appointments.validation.doctor_required') }),
    treatmentName: z.string().min(1, t('treatments.validation.treatment_name_required')),
    appointments: z.array(buildAppointmentSchema(t)).min(1, t('treatments.validation.at_least_one_appointment')),
    notes: z.string().optional(),
  });

type PlanFormData = {
  patient: string;
  doctor: string;
  treatmentName: string;
  notes?: string;
  appointments: Array<{ date: Date; time: string; duration: string }>;
};

const availableTimeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
];

const appointmentDurations = ['30 minutes', '1 hour', '1.5 hours', '2 hours'];

interface NewTreatmentPlanDialogProps {
  onSave: (data: any) => void;
}

export function NewTreatmentPlanDialog({ onSave }: NewTreatmentPlanDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<StaffMember[]>([]);
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  const form = useForm<PlanFormData>({
    resolver: zodResolver(buildPlanSchema(t)),
    defaultValues: {
      treatmentName: '',
      notes: '',
      appointments: [],
    },
  });

  const { control } = form;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "appointments"
  });

  const selectedDates = React.useMemo(() => fields.map(f => f.date), [fields]);

  React.useEffect(() => {
    async function fetchData() {
  const patientData = await listDocuments<Patient>('patients');
        setPatients(patientData);
  const staffData = await listDocuments<StaffMember>('staff');
        setDoctors(staffData.filter(s => s.role === 'Dentist'));
    }
    if (open) {
        fetchData();
    }
  }, [open]);

  const handleDateSelect = (days: Date[] | undefined) => {
    const sortedDays = (days || []).sort((a,b) => a.getTime() - b.getTime());
    const newAppointments = sortedDays.map(day => {
        const existing = fields.find(f => f.date.getTime() === day.getTime());
        return existing || { date: day, time: '09:00', duration: '1 hour' };
    });
    replace(newAppointments);
  };

  const onSubmit = (data: PlanFormData) => {
    const patientName = patients.find(p => p.id === data.patient)?.name;
    const doctorName = doctors.find(d => d.id === data.doctor)?.name;
    onSave({...data, patient: patientName, doctor: doctorName});
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('treatments.new_treatment_plan')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('treatments.create_new_treatment_plan')}</DialogTitle>
          <DialogDescription>
            {t('treatments.outline_treatment_plan_description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-3 gap-6 py-4">
            <div className="col-span-1 space-y-6">
              <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('treatments.patient')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('treatments.select_patient')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('treatments.doctor')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('treatments.select_doctor')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="treatmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('treatments.treatment_name')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('treatments.treatment_name_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('treatments.notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('treatments.notes_placeholder')}
                        className="resize-none h-24"
                        {...field}
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
                                       <p className="col-span-4 text-sm font-medium">{field.date.toLocaleDateString(locale, { dateStyle: 'medium' })}</p>
                                       <FormField
                                            control={form.control}
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
                                            control={form.control}
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
                    <FormMessage>{form.formState.errors.appointments?.message || form.formState.errors.appointments?.root?.message}</FormMessage>
                </FormItem>
            </div>
            
            <DialogFooter className="col-span-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('treatments.save_plan_and_schedule')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
