
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
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { PatientCombobox } from '@/components/ui/patient-combobox';
import { DoctorCombobox } from '@/components/ui/doctor-combobox';
import type { Patient, StaffMember } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

const recordSchema = z.object({
  patient: z.string({ required_error: "Patient is required." }),
  provider: z.string({ required_error: "Provider is required." }),
  type: z.string({ required_error: "Record type is required." }),
  date: z.date({ required_error: "Date is required." }),
  complaint: z.string().optional(),
  notes: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

const medicalRecordTypes = ['SOAP', 'Clinical Note', 'Treatment Plan', 'Consultation'];

interface NewRecordDialogProps {
  onSave: (data: any) => void;
}

export function NewRecordDialog({ onSave }: NewRecordDialogProps) {
  const { t, isRTL } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<StaffMember[]>([]);

  const form = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      date: new Date(),
      patient: '',
      provider: '',
      type: '',
      complaint: '',
      notes: '',
    },
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
      } catch (error) {
        console.error('Error loading data', error);
      }
    }
    if (open) {
        fetchData();
    }
  }, [open]);

  const onSubmit = (data: RecordFormData) => {
    const patientData = patients.find(p => p.id === data.patient);
    const providerData = doctors.find(d => d.id === data.provider);
    
    onSave({ 
      ...data, 
      patient: data.patient, // Keep patientId
      patientName: patientData?.name || '',
      provider: data.provider, // Keep providerId
      providerName: providerData?.name || '',
      providerId: data.provider,
      date: data.date.toISOString(),
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
      {t('medical_records.new_record')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
      <DialogTitle>{t('medical_records.create_new_record')}</DialogTitle>
      <DialogDescription>
    {t('medical_records.fill_in_info')}
      </DialogDescription>
        </DialogHeader>
        <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('common.patient')} *</FormLabel>
                    <FormControl>
                      <PatientCombobox
                        patients={patients}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('medical_records.select_patient')}
                        searchPlaceholder={t('medical_records.search_patient') || "Search by name or phone..."}
                        emptyMessage={t('medical_records.no_patient_found') || "No patient found."}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('medical_records.provider')} *</FormLabel>
                    <FormControl>
                      <DoctorCombobox
                        doctors={doctors}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={t('medical_records.select_provider')}
                        searchPlaceholder={t('medical_records.search_provider') || "Search by name or phone..."}
                        emptyMessage={t('medical_records.no_provider_found') || "No provider found."}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
        <FormLabel>{t('medical_records.record_type')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
          <SelectValue placeholder={t('medical_records.select_type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {medicalRecordTypes.map((type) => (
                          <SelectItem key={type.toLowerCase()} value={type}>
                            {type}
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
                            <span>{t('medical_records.pick_a_date')}</span>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="complaint"
              render={({ field }) => (
                <FormItem>
      <FormLabel>{t('medical_records.chief_complaint')}</FormLabel>
                  <FormControl>
        <Input placeholder={t('medical_records.complaint_placeholder')} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
      <FormLabel>{t('medical_records.notes')}</FormLabel>
                  <FormControl>
        <Textarea placeholder={t('medical_records.notes_placeholder')} className="min-h-[120px]" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('medical_records.save_record')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
