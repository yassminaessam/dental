
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
import { Calendar as CalendarIcon, Plus, AlertCircle, CheckCircle, X } from 'lucide-react';
import { format, startOfToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '@/components/ui/input';
import { PatientCombobox } from '@/components/ui/patient-combobox';
import { DoctorCombobox } from '@/components/ui/doctor-combobox';
import type { Patient, StaffMember, Appointment } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import type { AppointmentCreateInput } from '@/services/appointments.types';
import { AppointmentsClient } from '@/services/appointments.client';



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

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00', '22:30'
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
  const [existingAppointments, setExistingAppointments] = React.useState<Appointment[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  React.useEffect(() => {
    async function fetchData() {
      try {
        // Fetch patients from Neon database
        const patientsResponse = await fetch('/api/patients');
        if (!patientsResponse.ok) throw new Error('Failed to fetch patients');
        const { patients: patientData } = await patientsResponse.json();
        
        setPatients(
          patientData.map((patient: any) => ({
            ...patient,
            dob: patient.dob ? new Date(patient.dob) : new Date(),
          })) as Patient[]
        );
        
        // Fetch doctors from Neon database
        const doctorsResponse = await fetch('/api/doctors');
        if (!doctorsResponse.ok) throw new Error('Failed to fetch doctors');
        const { doctors: doctorData } = await doctorsResponse.json();
        setDoctors(doctorData as StaffMember[]);

        // Fetch existing appointments for blocking
        const appointments = await AppointmentsClient.list();
        setExistingAppointments(appointments || []);
      } catch (error) {
        console.error('Error loading scheduling data', error);
      }
    }
    if (open) {
      fetchData();
    }
  }, [open]);

  const parseDuration = (duration: string): number => {
    const durationMatch = duration.match(/(\d+(?:\.\d+)?)\s*(hour|minute)/i);
    let durationMinutes = 60;
    
    if (durationMatch) {
      const value = parseFloat(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      durationMinutes = unit.startsWith('hour') ? value * 60 : value;
    }
    
    return durationMinutes;
  };

  const isTimeSlotAvailable = (date: Date | undefined, time: string, selectedDuration: string): boolean => {
    if (!date) return false;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const requestedDateTime = new Date(`${dateStr}T${time}`);
    
    const isPast = requestedDateTime < new Date();
    if (isPast) return false;

    const requestedDurationMinutes = parseDuration(selectedDuration);
    const requestedEndTime = new Date(requestedDateTime.getTime() + requestedDurationMinutes * 60000);

    const hasOverlap = existingAppointments.some(apt => {
      if (apt.status === 'Cancelled') return false;
      
      const aptStartTime = new Date(apt.dateTime);
      const aptDurationMinutes = parseDuration(apt.duration);
      const aptEndTime = new Date(aptStartTime.getTime() + aptDurationMinutes * 60000);
      
      return (
        (requestedDateTime >= aptStartTime && requestedDateTime < aptEndTime) ||
        (requestedEndTime > aptStartTime && requestedEndTime <= aptEndTime) ||
        (requestedDateTime <= aptStartTime && requestedEndTime >= aptEndTime)
      );
    });

    return !hasOverlap;
  };

  const getTimeSlotStatus = (date: Date | undefined, time: string, selectedDuration: string): { available: boolean; reason?: string } => {
    if (!date) return { available: false, reason: 'Select date first' };
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const requestedDateTime = new Date(`${dateStr}T${time}`);
    
    const isPast = requestedDateTime < new Date();
    if (isPast) return { available: false, reason: 'Past time' };

    const requestedDurationMinutes = parseDuration(selectedDuration);
    const requestedEndTime = new Date(requestedDateTime.getTime() + requestedDurationMinutes * 60000);

    const overlappingAppointment = existingAppointments.find(apt => {
      if (apt.status === 'Cancelled') return false;
      
      const aptStartTime = new Date(apt.dateTime);
      const aptDurationMinutes = parseDuration(apt.duration);
      const aptEndTime = new Date(aptStartTime.getTime() + aptDurationMinutes * 60000);
      
      return (
        (requestedDateTime >= aptStartTime && requestedDateTime < aptEndTime) ||
        (requestedEndTime > aptStartTime && requestedEndTime <= aptEndTime) ||
        (requestedDateTime <= aptStartTime && requestedEndTime >= aptEndTime)
      );
    });

    if (overlappingAppointment) {
      return { available: false, reason: 'Already booked' };
    }

    return { available: true };
  };

  const onSubmit = async (data: AppointmentFormData) => {
    // Final validation: check if time slot is still available
    if (!isTimeSlotAvailable(data.date, data.time, data.duration)) {
      form.setError('time', { 
        type: 'manual', 
        message: 'Selected time slot is no longer available. Please choose another time.' 
      });
      return;
    }

    const [hours, minutes] = data.time.split(':');
    const dateTime = new Date(data.date);
    dateTime.setHours(parseInt(hours, 10));
    dateTime.setMinutes(parseInt(minutes, 10));

    const selectedPatient = patients.find(p => p.id === data.patient);
    const patientName = selectedPatient?.name;
    const patientEmail = selectedPatient?.email;
    const patientPhone = selectedPatient?.phone;
    const doctorName = doctors.find(d => d.id === data.doctor)?.name;

    setSubmitting(true);
    try {
      await onSave({
        dateTime,
        patient: patientName || data.patient,
        patientId: data.patient,
        patientEmail: patientEmail,
        patientPhone: patientPhone,
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
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">{t('appointments.patient_name')} *</FormLabel>
                    <FormControl>
                      <PatientCombobox
                        patients={patients}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('appointments.select_patient')}
                        searchPlaceholder={t('appointments.search_patient_placeholder') || "Search by name or phone..."}
                        emptyMessage={t('appointments.no_patient_found') || "No patient found."}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctor"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">{t('appointments.doctor')} *</FormLabel>
                    <FormControl>
                      <DoctorCombobox
                        doctors={doctors}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('appointments.select_practitioner')}
                        searchPlaceholder={t('appointments.search_doctor_placeholder') || "Search by name or phone..."}
                        emptyMessage={t('appointments.no_doctor_found') || "No doctor found."}
                      />
                    </FormControl>
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
                          disabled={(date) => date < startOfToday()}
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
                render={({ field }) => {
                  const selectedDate = form.watch('date');
                  const selectedDuration = form.watch('duration') || '1 hour';
                  
                  return (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-sm font-medium">{t('appointments.time')} *</FormLabel>
                      {selectedDate && (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg bg-gray-50">
                          {timeSlots.map((time) => {
                            const slotStatus = getTimeSlotStatus(selectedDate, time, selectedDuration);
                            const isSelected = field.value === time;
                            
                            return (
                              <button
                                key={time}
                                type="button"
                                disabled={!slotStatus.available}
                                onClick={() => {
                                  if (slotStatus.available) {
                                    field.onChange(time);
                                  }
                                }}
                                className={cn(
                                  "px-2 py-2 rounded-md text-xs font-medium transition-all",
                                  isSelected 
                                    ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-1" 
                                    : slotStatus.available
                                      ? "bg-white hover:bg-blue-50 text-gray-700 border border-gray-300 hover:border-blue-400"
                                      : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                )}
                                title={slotStatus.available ? 'Available' : slotStatus.reason}
                              >
                                <div className="flex flex-col items-center justify-center gap-0.5">
                                  <div className="flex items-center gap-1">
                                    {slotStatus.available ? (
                                      <CheckCircle className="h-2.5 w-2.5 text-green-500" />
                                    ) : (
                                      <X className="h-2.5 w-2.5 text-red-500" />
                                    )}
                                    <span>{time}</span>
                                  </div>
                                  {!slotStatus.available && (
                                    <span className="text-[10px] opacity-75">
                                      {slotStatus.reason === 'Already booked' && 'Booked'}
                                      {slotStatus.reason === 'Past time' && 'Past'}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {!selectedDate && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {t('appointments.pick_a_date')}
                        </p>
                      )}
                      {selectedDate && field.value && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-700 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Selected time: <strong>{field.value}</strong>
                          </p>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
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