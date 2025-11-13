
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import type { AppointmentStatus, Patient, StaffMember, Treatment } from '@/lib/types';
import { listCollection } from '@/lib/collections-client';

import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { PatientCombobox } from '@/components/ui/patient-combobox';
import { DoctorCombobox } from '@/components/ui/doctor-combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';

const DEFAULT_TIME = '09:00';
const DEFAULT_DURATION = '1 hour';
const DEFAULT_STATUS: AppointmentStatus = 'Confirmed';

const availableTimeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const appointmentDurations = ['30 minutes', '1 hour', '1.5 hours', '2 hours'];

type PatientRecord = Omit<Patient, 'dob'> & { dob: string };

type TreatmentFormAppointment = {
  date: Date;
  time: string;
  duration: string;
  appointmentId?: string;
  status?: AppointmentStatus;
};

type PlanFormData = {
  patient: string;
  doctor: string;
  procedure: string;
  cost: string;
  notes?: string;
  appointments: TreatmentFormAppointment[];
};

const appointmentSchema = (t: (key: string) => string) =>
  z.object({
    date: z.date(),
    time: z.string().min(1, t('appointments.validation.time_required')),
    duration: z.string().min(1, t('appointments.validation.duration_required')),
    appointmentId: z.string().optional(),
    status: z.custom<AppointmentStatus>().optional()
  });

const planSchema = (t: (key: string) => string) =>
  z.object({
    patient: z.string({ required_error: t('validation.patient_required') }),
    doctor: z.string({ required_error: t('appointments.validation.doctor_required') }),
    procedure: z.string().min(1, t('treatments.validation.procedure_required')),
    cost: z.string().min(1, t('treatments.validation.cost_required')),
    notes: z.string().optional(),
    appointments: z.array(appointmentSchema(t)).min(1, t('treatments.validation.at_least_one_appointment'))
  });

const toDate = (value: unknown): Date => (value instanceof Date ? value : new Date(value as string));

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
    resolver: zodResolver(planSchema(t)),
    defaultValues: {
      patient: '',
      doctor: '',
      procedure: '',
      cost: '',
      notes: '',
      appointments: []
    }
  });

  const {
    control,
    formState: { errors },
    reset
  } = form;

  const { fields, remove, replace } = useFieldArray({ control, name: 'appointments' });

  const selectedDates = React.useMemo(() => fields.map((field) => toDate(field.date)), [fields]);

  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      try {
        // Fetch patients from Neon database
        const patientsResponse = await fetch('/api/patients');
        if (!patientsResponse.ok) throw new Error('Failed to fetch patients');
        const { patients: patientData } = await patientsResponse.json();
        
        // Fetch doctors from Neon database
        const doctorsResponse = await fetch('/api/doctors');
        if (!doctorsResponse.ok) throw new Error('Failed to fetch doctors');
        const { doctors: doctorData } = await doctorsResponse.json();

        if (cancelled) return;

        setPatients(
          patientData.map((p: any) => ({
            ...p,
            dob: p.dob ? new Date(p.dob) : new Date(),
          })) as Patient[]
        );

        setDoctors(doctorData as StaffMember[]);
      } catch (error) {
        console.error('[EditTreatmentDialog] Failed to load reference data', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open || !treatment) return;

    reset({
      patient: treatment.patientId ?? '',
      doctor: treatment.doctorId ?? '',
      procedure: treatment.procedure,
      cost: treatment.cost.replace(/[^0-9.]/g, ''),
      notes: treatment.notes ?? '',
      appointments: treatment.appointments.map((appointment) => ({
        date: toDate(appointment.date),
        time: appointment.time,
        duration: appointment.duration,
        appointmentId: appointment.appointmentId,
        status: appointment.status
      }))
    });
  }, [open, treatment, reset]);

  const handleDateSelect = React.useCallback(
    (days: Date[] | undefined) => {
      const normalized = [...(days ?? [])]
        .filter(Boolean)
        .map((date) => new Date(date.getTime()))
        .sort((a, b) => a.getTime() - b.getTime())
        .filter((date, idx, arr) => idx === 0 || date.getTime() !== arr[idx - 1].getTime());

      const nextAppointments = normalized.map((date) => {
        const existing = fields.find((field) => toDate(field.date).getTime() === date.getTime());

        return {
          date,
          time: existing?.time ?? DEFAULT_TIME,
          duration: existing?.duration ?? DEFAULT_DURATION,
          appointmentId: existing?.appointmentId,
          status: (existing?.status as AppointmentStatus | undefined) ?? DEFAULT_STATUS
        } satisfies TreatmentFormAppointment;
      });

      replace(nextAppointments);
    },
    [fields, replace]
  );

  const onSubmit = (data: PlanFormData) => {
    const patientMatch = patients.find((patient) => patient.id === data.patient);
    const doctorMatch = doctors.find((doctor) => doctor.id === data.doctor);

    const updatedTreatment: Treatment = {
      ...treatment,
      patient: patientMatch?.name ?? treatment.patient,
      patientId: data.patient || treatment.patientId,
      doctor: doctorMatch?.name ?? treatment.doctor,
      doctorId: data.doctor || treatment.doctorId,
      procedure: data.procedure,
      cost: `EGP ${data.cost}`,
      notes: data.notes ?? '',
      appointments: data.appointments.map((appointment) => ({
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        appointmentId: appointment.appointmentId,
        status: appointment.status ?? DEFAULT_STATUS
      }))
    };

    onSave(updatedTreatment);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('treatments.edit_dialog.title')}</DialogTitle>
          <DialogDescription>{t('treatments.edit_dialog.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-3 gap-6 py-4">
            <div className="col-span-1 space-y-6">
              <FormField
                control={control}
                name="patient"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('common.patient')} *</FormLabel>
                    <FormControl>
                      <PatientCombobox
                        patients={patients}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('treatments.select_patient')}
                        searchPlaceholder={t('treatments.search_patient') || "Search by name or phone..."}
                        emptyMessage={t('treatments.no_patient_found') || "No patient found."}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="doctor"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('treatments.doctor')} *</FormLabel>
                    <FormControl>
                      <DoctorCombobox
                        doctors={doctors}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('treatments.select_doctor')}
                        searchPlaceholder={t('treatments.search_doctor') || "Search by name or phone..."}
                        emptyMessage={t('treatments.no_doctor_found') || "No doctor found."}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder={t('treatments.treatment_name_placeholder')} {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input type="text" placeholder="EGP 0.00" {...field} />
                    </FormControl>
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
                        className="h-24 resize-none"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
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
                        fields.map((field, index) => {
                          const fieldDate = toDate(field.date);

                          return (
                            <div key={field.id} className="mb-2 grid grid-cols-12 items-center gap-2">
                              <p className="col-span-4 text-sm font-medium">
                                {fieldDate.toLocaleDateString(locale, { dateStyle: 'medium' })}
                              </p>
                              <FormField
                                control={control}
                                name={`appointments.${index}.time`}
                                render={({ field: timeField }) => (
                                  <FormItem className="col-span-3">
                                    <Select onValueChange={timeField.onChange} value={timeField.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {availableTimeSlots.map((slot) => (
                                          <SelectItem key={slot} value={slot}>
                                            {slot}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={control}
                                name={`appointments.${index}.duration`}
                                render={({ field: durationField }) => (
                                  <FormItem className="col-span-4">
                                    <Select onValueChange={durationField.onChange} value={durationField.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
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
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="col-span-1"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          );
                        })
                      ) : (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          {t('treatments.select_dates_from_calendar')}
                        </p>
                      )}
                    </ScrollArea>
                  </div>
                </div>
                <FormMessage>{errors.appointments?.message || errors.appointments?.root?.message}</FormMessage>
              </FormItem>
            </div>
            <DialogFooter className="col-span-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('common.save_changes')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
