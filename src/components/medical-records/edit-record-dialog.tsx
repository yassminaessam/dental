
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
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { MedicalRecord } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

const recordSchema = z.object({
  patient: z.string({ required_error: "Patient is required." }),
  provider: z.string({ required_error: "Provider is required." }),
  type: z.string({ required_error: "Record type is required." }),
  date: z.date({ required_error: "Date is required." }),
  complaint: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['Final', 'Draft']),
});

type RecordFormData = z.infer<typeof recordSchema>;

const medicalRecordTypes = ['SOAP', 'Clinical Note', 'Treatment Plan', 'Consultation'];

// System providers that are not actual staff members
const SYSTEM_PROVIDER_ID = '__system__dental';
const SYSTEM_PROVIDER = { id: SYSTEM_PROVIDER_ID, name: 'Dental System', role: 'System' };

interface EditRecordDialogProps {
  record: MedicalRecord | null;
  onSave: (data: MedicalRecord) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRecordDialog({ record, onSave, open, onOpenChange }: EditRecordDialogProps) {
  const { t, isRTL } = useLanguage();
  const [dateOpen, setDateOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Array<{ id: string; name: string; lastName?: string; phone?: string }>>([]);
  const [doctors, setDoctors] = React.useState<Array<{ id: string; name: string; role: string }>>([]);
  const [loading, setLoading] = React.useState(false);
  const [dataFetched, setDataFetched] = React.useState(false);

  const form = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
        patient: '',
        provider: '',
        type: '',
        date: new Date(),
        complaint: '',
        notes: '',
        status: 'Final',
    }
  });

  // Fetch patients and staff from Neon database
  React.useEffect(() => {
    async function fetchData() {
        setLoading(true);
        setDataFetched(false);
        try {
          const [patientsRes, staffRes] = await Promise.all([
            fetch('/api/patients?activeOnly=true'),
            fetch('/api/staff?activeOnly=true')
          ]);
          
          let fetchedPatients: Array<{ id: string; name: string; lastName?: string; phone?: string }> = [];
          let fetchedDoctors: Array<{ id: string; name: string; role: string }> = [];
          
          if (patientsRes.ok) {
            const data = await patientsRes.json();
            fetchedPatients = data.patients || [];
            setPatients(fetchedPatients);
          }
          
          if (staffRes.ok) {
            const data = await staffRes.json();
            // Filter to only include doctors/dentists
            const staffList = data.staff || [];
            fetchedDoctors = staffList.filter((s: { role: string }) => 
              s.role === 'Dentist' || s.role === 'Doctor' || s.role === 'dentist' || s.role === 'doctor'
            );
            // Add system provider to the list
            fetchedDoctors = [SYSTEM_PROVIDER, ...fetchedDoctors];
            setDoctors(fetchedDoctors);
          }
          
          // Populate form immediately after fetching data
          if (record) {
            populateForm(record, fetchedPatients, fetchedDoctors);
          }
          
          setDataFetched(true);
        } catch (error) {
          console.error('Error fetching data for edit dialog:', error);
        } finally {
          setLoading(false);
        }
    }
    if (open) {
        fetchData();
    }
  }, [open]);

  // Helper function to populate form with record data
  const populateForm = React.useCallback((
    recordData: MedicalRecord,
    patientList: Array<{ id: string; name: string; lastName?: string; phone?: string }>,
    doctorList: Array<{ id: string; name: string; role: string }>
  ) => {
    // Find patient by ID first, then by name (case-insensitive), then by partial match
    const patientById = patientList.find(p => p.id === recordData.patientId);
    const patientByExactName = patientList.find(p => p.name === recordData.patient);
    const patientByNameCaseInsensitive = patientList.find(p => 
      p.name?.toLowerCase() === recordData.patient?.toLowerCase()
    );
    const patientByPartialMatch = patientList.find(p => 
      p.name?.toLowerCase().includes(recordData.patient?.toLowerCase() || '') ||
      (recordData.patient?.toLowerCase() || '').includes(p.name?.toLowerCase() || '')
    );
    const matchedPatient = patientById || patientByExactName || patientByNameCaseInsensitive || patientByPartialMatch;
    
    // Check if provider is a system provider (like "Dental System")
    const isSystemProvider = recordData.provider === 'Dental System' || 
                             recordData.provider?.toLowerCase().includes('system') ||
                             !recordData.providerId;
    
    // Find provider by ID first, then by name (case-insensitive), then by partial match
    let matchedProvider: { id: string; name: string; role: string } | undefined;
    
    if (isSystemProvider && recordData.provider === 'Dental System') {
      // Use the system provider
      matchedProvider = doctorList.find(d => d.id === SYSTEM_PROVIDER_ID);
    } else {
      const providerById = doctorList.find(d => d.id === recordData.providerId);
      const providerByExactName = doctorList.find(d => d.name === recordData.provider);
      const providerByNameCaseInsensitive = doctorList.find(d => 
        d.name?.toLowerCase() === recordData.provider?.toLowerCase()
      );
      const providerByPartialMatch = doctorList.find(d => 
        d.name?.toLowerCase().includes(recordData.provider?.toLowerCase() || '') ||
        (recordData.provider?.toLowerCase() || '').includes(d.name?.toLowerCase() || '')
      );
      matchedProvider = providerById || providerByExactName || providerByNameCaseInsensitive || providerByPartialMatch;
    }
    
    console.log('Edit Record - Matching data:', {
      record: { patient: recordData.patient, patientId: recordData.patientId, provider: recordData.provider, providerId: recordData.providerId },
      matchedPatient: matchedPatient ? { id: matchedPatient.id, name: matchedPatient.name } : null,
      matchedProvider: matchedProvider ? { id: matchedProvider.id, name: matchedProvider.name } : null,
      isSystemProvider,
      patientsCount: patientList.length,
      doctorsCount: doctorList.length
    });
    
    // Parse the date carefully
    let parsedDate = new Date();
    try {
      if (recordData.date) {
        parsedDate = new Date(recordData.date);
        if (isNaN(parsedDate.getTime())) {
          parsedDate = new Date();
        }
      }
    } catch {
      console.error('Error parsing date:', recordData.date);
    }
    
    form.reset({
      patient: matchedPatient?.id || '',
      provider: matchedProvider?.id || '',
      type: recordData.type || '',
      date: parsedDate,
      complaint: recordData.complaint || '',
      status: recordData.status || 'Final',
      notes: recordData.notes || '',
    });
  }, [form]);

  // Also populate form when record changes and data is already fetched
  React.useEffect(() => {
    if (record && dataFetched && !loading) {
      populateForm(record, patients, doctors);
    }
  }, [record, dataFetched, loading, patients, doctors, populateForm]);

  const onSubmit = (data: RecordFormData) => {
    if (!record) return;

    const selectedPatient = patients.find(p => p.id === data.patient);
    const selectedProvider = doctors.find(d => d.id === data.provider);
    
    // Handle system provider specially
    const isSystemProvider = data.provider === SYSTEM_PROVIDER_ID;
    const providerName = isSystemProvider ? 'Dental System' : (selectedProvider?.name || record.provider);
    const providerId = isSystemProvider ? null : (data.provider || record.providerId);

    const updatedRecord: MedicalRecord = {
      ...record,
      patient: selectedPatient?.name || record.patient,
      patientId: data.patient || record.patientId,
      provider: providerName,
      providerId: providerId || undefined,
      type: data.type,
      date: new Date(data.date).toLocaleDateString(),
      complaint: data.complaint || '',
      notes: data.notes || '',
      status: data.status,
    };
    onSave(updatedRecord);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('medical_records.edit_record')}</DialogTitle>
          <DialogDescription>{t('medical_records.update_record')}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.patient')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('medical_records.select_patient')} />
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
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('medical_records.provider')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('medical_records.select_provider')} />
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('medical_records.record_type')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('medical_records.select_type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {medicalRecordTypes.map((type) => (
                          <SelectItem key={type} value={type}>
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
                          if(date) field.onChange(date)
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
                    <Textarea 
                      placeholder={t('medical_records.notes_placeholder')} 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.status')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('medical_records.select_status')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Final">{t('medical_records.status_final')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.save_changes')}</Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
