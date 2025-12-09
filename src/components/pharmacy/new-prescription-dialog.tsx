
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
import { Input } from '@/components/ui/input';
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
import { Calendar as CalendarIcon, ClipboardPen } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { PatientCombobox } from '@/components/ui/patient-combobox';
import { DoctorCombobox } from '@/components/ui/doctor-combobox';
import { Patient } from '@/app/patients/page';
import { StaffMember } from '@/app/staff/page';
import type { Medication } from '@/app/pharmacy/page';
import { useLanguage } from '@/contexts/LanguageContext';

const prescriptionSchema = z.object({
  patient: z.string({ required_error: 'validation.patient_required' }),
  doctor: z.string({ required_error: 'validation.provider_required' }),
  medication: z.string({ required_error: 'pharmacy.validation.medication_required' }),
  dosage: z.string().optional(),
  refills: z.coerce.number().default(0),
  instructions: z.string().optional(),
  date: z.date({ required_error: 'validation.date_required' }),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;

export type NewPrescriptionPayload = {
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medicationId?: string;
  medicationName: string;
  strength?: string;
  dosage?: string;
  instructions?: string;
  refills: number;
  date: Date;
};
interface NewPrescriptionDialogProps {
  onSave: (data: NewPrescriptionPayload) => void | Promise<void>;
  medications: Medication[];
}

export function NewPrescriptionDialog({ onSave, medications }: NewPrescriptionDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<StaffMember[]>([]);

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patient: '',
      doctor: '',
      medication: '',
      dosage: '',
      instructions: '',
      refills: 0,
      date: new Date(),
    }
  });

  React.useEffect(() => {
    async function fetchData() {
      try {
        // Fetch patients from Neon database
        const patientsResponse = await fetch('/api/patients?activeOnly=true');
        if (!patientsResponse.ok) throw new Error('Failed to fetch patients');
        const { patients: patientData } = await patientsResponse.json();
        
        setPatients(
          patientData.map((p: any) => ({
            ...p,
            dob: p.dob ? new Date(p.dob) : new Date(),
          })) as Patient[]
        );
        
        // Fetch doctors from Neon database
        const doctorsResponse = await fetch('/api/doctors');
        if (!doctorsResponse.ok) throw new Error('Failed to fetch doctors');
        const { doctors: doctorData } = await doctorsResponse.json();
        setDoctors(doctorData as StaffMember[]);
      } catch (error) {
        console.error('Error loading data', error);
      }
    }
    if (open) {
        fetchData();
    }
  }, [open]);

  const onSubmit = async (data: PrescriptionFormData) => {
    const patientRecord = patients.find(p => p.id === data.patient);
    const doctorRecord = doctors.find(d => d.id === data.doctor);
    const medicationDetails = medications.find(m => m.id === data.medication);

    if (!data.patient || !patientRecord) {
      return;
    }
    if (!data.doctor || !doctorRecord) {
      return;
    }

    await onSave({
      patientId: data.patient,
      patientName: patientRecord.name,
      doctorId: data.doctor,
      doctorName: doctorRecord.name,
      medicationId: data.medication,
      medicationName: medicationDetails?.name ?? '',
      strength: medicationDetails?.strength ?? '',
      dosage: data.dosage,
      instructions: data.instructions,
      refills: data.refills,
      date: data.date,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ClipboardPen className="mr-2 h-4 w-4" />
          {t('pharmacy.new_prescription')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('pharmacy.create_new_prescription')}</DialogTitle>
          <DialogDescription>
            {t('pharmacy.create_new_prescription_desc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.patient')} *</FormLabel>
                    <FormControl>
                      <PatientCombobox
                        patients={patients}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('patients.select_patient')}
                        searchPlaceholder={t('pharmacy.search_patient') || "Search by name or phone..."}
                        emptyMessage={t('pharmacy.no_patient_found') || "No patient found."}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.patient?.message && t(String(form.formState.errors.patient.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctor"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('common.doctor')} *</FormLabel>
                    <FormControl>
                      <DoctorCombobox
                        doctors={doctors}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('staff.select_doctor')}
                        searchPlaceholder={t('pharmacy.search_doctor') || "Search by name or phone..."}
                        emptyMessage={t('pharmacy.no_doctor_found') || "No doctor found."}
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.doctor?.message && t(String(form.formState.errors.doctor.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="medication"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pharmacy.medication')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('pharmacy.select_medication')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {medications.map((med) => (
                        <SelectItem key={med.id} value={med.id}>
                          {med.name} ({med.strength})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage>
                    {form.formState.errors.medication?.message && t(String(form.formState.errors.medication.message))}
                  </FormMessage>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.dosage')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('pharmacy.placeholder.dosage')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="refills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.refills')}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pharmacy.instructions')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('pharmacy.placeholder.instructions')} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('common.date')} *</FormLabel>
                  <Popover open={dateOpen} onOpenChange={setDateOpen} modal={true}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          <span>{format(field.value, "PPP")}</span>
                        ) : (
                          <span>{t('appointments.pick_date')}</span>
                        )}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                      <Calendar mode="single" selected={field.value} onSelect={(date) => {
                        field.onChange(date)
                        setDateOpen(false)
                      }} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage>
                    {form.formState.errors.date?.message && t(String(form.formState.errors.date.message))}
                  </FormMessage>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('pharmacy.create_prescription')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
