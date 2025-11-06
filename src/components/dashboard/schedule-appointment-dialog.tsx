
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Patient, StaffMember } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import type { AppointmentCreateInput } from '@/services/appointments.types';
async function fetchCollection<T>(collection: string): Promise<T[]> {
  const response = await fetch(`/api/collections/${collection}`);
  if (!response.ok) throw new Error(`Failed to fetch ${collection}`);
  const payload = await response.json();
  return (payload.items ?? payload.data ?? []) as T[];
}



const appointmentSchema = z.object({
  patient: z.string({ required_error: "" }),
  doctor: z.string({ required_error: "" }),
  date: z.date({ required_error: "" }),
  time: z.string({ required_error: "" }),
  type: z.string().default('Check-up'),
  duration: z.string().default('1 hour'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const appointmentTypesData = [
  { name: "Check-up" },
  { name: "Cleaning" },
  { name: "Filling" },
  { name: "Crown" },
  { name: "Root Canal" },
];

const availableTimeSlots = [
  "09:00",
  "10:30",
  "11:00",
  "14:00",
  "15:30",
  "16:00",
];

const appointmentDurations = ['30 minutes', '1 hour', '1.5 hours', '2 hours'];

interface ScheduleAppointmentDialogProps {
  onSave: (data: AppointmentCreateInput) => Promise<void>;
}

export function ScheduleAppointmentDialog({ onSave }: ScheduleAppointmentDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<StaffMember[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  React.useEffect(() => {
    async function fetchData() {
      try {
        const patientData = await fetchCollection<Record<string, unknown>>('patients');
        setPatients(
          patientData.map((patient) => ({
            ...patient,
            dob: patient.dob ? new Date(patient.dob as string) : new Date(),
          })) as Patient[]
        );
        const staffData = await fetchCollection<StaffMember>('staff');
        // Include both 'doctor' and 'dentist' roles (case-insensitive)
        setDoctors(
          staffData.filter((s) => {
            const r = (s.role || '').toLowerCase();
            return r === 'dentist' || r === 'doctor';
          })
        );
      } catch (error) {
        console.error('Error loading scheduling data', error);
      }
    }
    if (open) {
      fetchData();
    }
  }, [open]);

  const onSubmit = async (data: AppointmentFormData) => {
    const [hours, minutes] = data.time.split(':');
    const dateTime = new Date(data.date);
    dateTime.setHours(parseInt(hours, 10));
    dateTime.setMinutes(parseInt(minutes, 10));

    const patientName = patients.find(p => p.id === data.patient)?.name;
    const doctorName = doctors.find(d => d.id === data.doctor)?.name;

    setSubmitting(true);
    try {
      await onSave({
        dateTime,
        patient: patientName || data.patient,
        patientId: data.patient,
        doctor: doctorName || data.doctor,
        doctorId: data.doctor,
        type: data.type,
        duration: data.duration,
        notes: data.notes,
        bookedBy: 'staff',
      });
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error scheduling appointment', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 sm:h-10">
          <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">{t('appointments.new_appointment')}</span>
          <span className="sm:hidden">{t('appointments.appointment')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[95vh] w-[95vw] sm:w-full flex flex-col">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="text-lg sm:text-xl">{t('appointments.schedule_appointment')}</DialogTitle>
          <DialogDescription className="text-sm">
            {t('appointments.schedule_description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4 sm:space-y-6 overflow-y-auto px-1">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
        <FormLabel className="text-sm font-medium">{t('appointments.patient_name')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10">
          <SelectValue placeholder={t('appointments.select_patient')} />
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
        <FormLabel className="text-sm font-medium">{t('appointments.doctor')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10">
          <SelectValue placeholder={t('appointments.select_practitioner')} />
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
            </div>
            
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">{t('appointments.date')} *</FormLabel>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 sm:h-10 justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>{t('appointments.pick_a_date')}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date)
                            setDateOpen(false)
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
        <FormLabel className="text-sm font-medium">{t('appointments.time')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10">
          <SelectValue placeholder={t('appointments.select_time')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTimeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
        <FormLabel className="text-sm font-medium">{t('appointments.treatment_type')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10">
          <SelectValue placeholder={t('appointments.select_type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointmentTypesData.map((type) => (
                          <SelectItem key={type.name} value={type.name}>
                            {type.name}
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
        <FormLabel className="text-sm font-medium">{t('appointments.duration')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10">
          <SelectValue placeholder={t('appointments.select_duration')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {appointmentDurations.map((duration) => (
                          <SelectItem key={duration} value={duration}>
                            {duration}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t('appointments.notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('appointments.notes_placeholder')}
                      className="resize-none h-20 sm:h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-4 sm:pt-6">
              <Button 
                variant="outline" 
                type="button" 
                className="w-full sm:w-auto order-2 sm:order-1"
                onClick={() => setOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-auto order-1 sm:order-2"
                disabled={submitting}
              >
                {t('appointments.schedule_appointment')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}