
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
import { PatientCombobox } from '@/components/ui/patient-combobox';
import { DoctorCombobox } from '@/components/ui/doctor-combobox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { ScrollArea } from '../ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface PatientRecord {
  id: string;
  name: string;
}

interface StaffRecord {
  id: string;
  name: string;
  role: string;
}

async function fetchCollection<T>(collection: string): Promise<T[]> {
  const response = await fetch(`/api/collections/${collection}`);
  if (!response.ok) throw new Error(`Failed to fetch ${collection}`);
  const json = await response.json();
  const items = json.items ?? json.data ?? [];
  return items as T[];
}

export interface NewTreatmentPlanData {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  procedure: string;
  cost: string;
  notes?: string;
  appointments: Array<{ date: Date; time: string; duration: string }>;
}

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
    cost: z.string().min(1, t('treatments.validation.cost_required')),
    appointments: z.array(buildAppointmentSchema(t)).min(1, t('treatments.validation.at_least_one_appointment')),
    notes: z.string().optional(),
  });

type PlanFormData = {
  patient: string;
  doctor: string;
  treatmentName: string;
  cost: string;
  notes?: string;
  appointments: Array<{ date: Date; time: string; duration: string }>;
};

const availableTimeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
];

const appointmentDurations = ['30 minutes', '1 hour', '1.5 hours', '2 hours'];

interface NewTreatmentPlanDialogProps {
  onSave: (data: NewTreatmentPlanData) => Promise<void> | void;
}

export function NewTreatmentPlanDialog({ onSave }: NewTreatmentPlanDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<PatientRecord[]>([]);
  const [doctors, setDoctors] = React.useState<StaffRecord[]>([]);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  const form = useForm<PlanFormData>({
    resolver: zodResolver(buildPlanSchema(t)),
    defaultValues: {
      treatmentName: '',
      cost: '',
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
      // Fetch patients from Neon database
      const patientsResponse = await fetch('/api/patients?activeOnly=true');
      if (!patientsResponse.ok) throw new Error('Failed to fetch patients');
      const { patients: patientData } = await patientsResponse.json();
      
      setPatients(
        patientData.map((p: any) => ({
          id: p.id,
          name: p.name,
          phone: p.phone || '',
        })) as PatientRecord[]
      );
      
      // Fetch doctors from Neon database
      const doctorsResponse = await fetch('/api/doctors');
      if (!doctorsResponse.ok) throw new Error('Failed to fetch doctors');
      const { doctors: doctorData } = await doctorsResponse.json();
      setDoctors(doctorData.map((d: any) => ({ 
        id: d.id, 
        name: d.name, 
        phone: d.phone || '',
        specialization: d.specialization || '',
        role: d.role 
      })));
      // Auto-select current authenticated doctor if applicable and not already chosen
      if (user?.role === 'doctor' && form.getValues('doctor') === undefined) {
        const match = doctorData.find((d: any) => d.id === user.id || d.name.toLowerCase().includes(user.firstName.toLowerCase()));
        if (match) {
          form.setValue('doctor', match.id);
        }
      }
    }
    if (open) {
      fetchData().catch(() => {
        /** handled via parent toast */
      });
    }
  }, [open, user, form]);

  const handleDateSelect = (days: Date[] | undefined) => {
    const sortedDays = (days || []).sort((a,b) => a.getTime() - b.getTime());
    
    // Create a map of existing appointments by date string for reliable comparison
    const existingMap = new Map<string, { time: string; duration: string }>();
    fields.forEach(f => {
      const dateKey = f.date.toDateString(); // Use toDateString for date-only comparison
      existingMap.set(dateKey, { time: f.time, duration: f.duration });
    });
    
    const newAppointments = sortedDays.map(day => {
      const dateKey = day.toDateString();
      const existing = existingMap.get(dateKey);
      return {
        date: day,
        time: existing?.time || '09:00',
        duration: existing?.duration || '1 hour'
      };
    });
    
    replace(newAppointments);
  };

  const onSubmit = async (data: PlanFormData) => {
    const patient = patients.find(p => p.id === data.patient);
    const doctor = doctors.find(d => d.id === data.doctor);

    await onSave({
      patientId: data.patient,
      patientName: patient?.name ?? '',
      doctorId: data.doctor,
      doctorName: doctor?.name ?? '',
      procedure: data.treatmentName,
      cost: data.cost,
      notes: data.notes,
      appointments: data.appointments,
    });

    form.reset();
    setOpen(false);
  };

  // Get today's date at midnight for comparison (disable past dates)
  const today = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('treatments.new_treatment_plan')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('treatments.create_new_treatment_plan')}</DialogTitle>
          <DialogDescription>
            {t('treatments.outline_treatment_plan_description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-7 gap-4 py-4">
            {/* Left section - Patient, Doctor, Treatment details (compact) */}
            <div className="col-span-1 lg:col-span-2 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="patient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('treatments.patient')} *</FormLabel>
                      <FormControl>
                        <PatientCombobox
                          patients={patients as any}
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
                  control={form.control}
                  name="doctor"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('treatments.doctor')} *</FormLabel>
                      <FormControl>
                        <DoctorCombobox
                          doctors={doctors as any}
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
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
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
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('treatments.notes')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('treatments.notes_placeholder')}
                        className="resize-none h-16"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Right section - Calendar and Selected Appointments (larger) */}
            <div className="col-span-1 lg:col-span-5">
                <FormItem>
                    <FormLabel>{t('appointments.appointment_dates')} *</FormLabel>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex justify-center">
                          <Calendar
                              mode="multiple"
                              selected={selectedDates}
                              onSelect={handleDateSelect}
                              className="rounded-md border"
                              disabled={(date) => date < today}
                              />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="mb-2 text-sm font-medium">{t('treatments.selected_appointments')}</h4>
                             <ScrollArea className="h-auto max-h-[350px] rounded-md border p-2">
                               {fields.length > 0 ? (
                                fields.map((field, index) => (
                                    <div key={field.id} className="flex flex-wrap md:grid md:grid-cols-12 gap-2 items-center mb-3 md:mb-2 pb-2 md:pb-0 border-b md:border-b-0">
                                       <p className="w-full md:w-auto md:col-span-4 text-sm font-medium">{field.date.toLocaleDateString(locale, { dateStyle: 'medium' })}</p>
                                       <FormField
                                            control={form.control}
                                            name={`appointments.${index}.time`}
                                            render={({ field: timeField }) => (
                                                <FormItem className="flex-1 md:flex-none md:col-span-3">
                                                    <Select onValueChange={timeField.onChange} value={timeField.value}>
                                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>{availableTimeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                       <FormField
                                            control={form.control}
                                            name={`appointments.${index}.duration`}
                                            render={({ field: durationField }) => (
                                                <FormItem className="flex-1 md:flex-none md:col-span-4">
                                                     <Select onValueChange={durationField.onChange} value={durationField.value}>
                                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>{appointmentDurations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="ghost" size="icon" className="md:col-span-1" onClick={() => remove(index)}>
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
            
            <DialogFooter className="col-span-1 lg:col-span-7 flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">{t('common.cancel')}</Button>
              <Button type="submit" className="w-full sm:w-auto">{t('treatments.save_plan_and_schedule')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
