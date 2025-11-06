
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
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '@/components/ui/input';
import type { Appointment, Patient, StaffMember } from '@/lib/types';
import { listCollection } from '@/services/datastore';
import { useLanguage } from '@/contexts/LanguageContext';


const appointmentSchema = z.object({
  patient: z.string({ required_error: "appointments.validation.patient_required" }),
  doctor: z.string({ required_error: "appointments.validation.doctor_required" }),
  date: z.date({ required_error: "validation.date_required" }),
  time: z.string({ required_error: "appointments.validation.time_required" }),
  type: z.string(),
  duration: z.string(),
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

// Time selection now uses input[type="time"] to allow any time.

const appointmentDurations = ['30 minutes', '1 hour', '1.5 hours', '2 hours'];

interface EditAppointmentDialogProps {
  appointment: Appointment;
  onSave: (data: Appointment) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAppointmentDialog({ appointment, onSave, open, onOpenChange }: EditAppointmentDialogProps) {
  const { t, language } = useLanguage();
  const [dateOpen, setDateOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<StaffMember[]>([]);
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  React.useEffect(() => {
    async function fetchData() {
      try {
        const patientData = await listCollection<Record<string, unknown>>('patients');
        setPatients(
          patientData.map((patient) => ({
            ...patient,
            dob: patient.dob ? new Date(patient.dob as string) : new Date(),
          })) as Patient[]
        );
        const staffData = await listCollection<StaffMember>('staff');
        // Include both 'doctor' and 'dentist' roles (case-insensitive)
        setDoctors(
          staffData.filter((s) => {
            const r = (s.role || '').toLowerCase();
            return r === 'dentist' || r === 'doctor';
          })
        );
      } catch (error) {
        console.error('Error loading appointment data', error);
      }
    }
    if (open) {
      fetchData();
    }
  }, [open]);

  React.useEffect(() => {
    if (appointment && patients.length > 0 && doctors.length > 0) {
        const patientId = patients.find(p => p.name === appointment.patient)?.id;
        const doctorId = doctors.find(d => d.name === appointment.doctor)?.id;
        
        form.reset({
            patient: patientId,
            doctor: doctorId,
            date: appointment.dateTime,
            time: format(appointment.dateTime, 'HH:mm'),
            type: appointment.type,
            duration: appointment.duration,
            notes: appointment.notes || '',
        });
    }
  }, [appointment, form, patients, doctors]);


  const onSubmit = (data: AppointmentFormData) => {
    const [hours, minutes] = data.time.split(':');
    const dateTime = new Date(data.date);
    dateTime.setHours(parseInt(hours, 10));
    dateTime.setMinutes(parseInt(minutes, 10));

    const patientName = patients.find(p => p.id === data.patient)?.name;
    const doctorName = doctors.find(d => d.id === data.doctor)?.name;

    const updatedAppointment: Appointment = {
      ...appointment,
      patient: patientName || appointment.patient,
      patientId: data.patient,
      doctor: doctorName || appointment.doctor,
      doctorId: data.doctor,
      dateTime,
      type: data.type,
      duration: data.duration,
      notes: data.notes ?? appointment.notes,
    };
    onSave(updatedAppointment);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
    <DialogHeader>
      <DialogTitle>{t('appointments.edit_appointment')}</DialogTitle>
      <DialogDescription>
    {t('appointments.update_appointment_details')}
      </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6 py-4">
            <FormField
              control={form.control}
              name="patient"
              render={({ field }) => (
                <FormItem>
      <FormLabel>{t('appointments.patient_name')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
      <FormLabel>{t('appointments.doctor')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
      <FormLabel>{t('appointments.date')} *</FormLabel>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
          {field.value ? field.value.toLocaleDateString(language) : <span>{t('patients.dob_placeholder')}</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setDateOpen(false)
                        }}
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
      <FormLabel>{t('appointments.time')} *</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      step={300}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
      <FormLabel>{t('appointments.treatment_type')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
      <FormLabel>{t('appointments.duration')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="col-span-2">
      <FormLabel>{t('appointments.notes')}</FormLabel>
                  <FormControl>
                    <Textarea
          placeholder={t('appointments.notes_placeholder')}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="col-span-2">
      <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
      <Button type="submit">{t('common.save_changes')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
