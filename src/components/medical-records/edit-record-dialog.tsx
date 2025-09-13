
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
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { MedicalRecord } from '@/app/medical-records/page';
import { Patient } from '@/app/patients/page';
import { StaffMember } from '@/app/staff/page';
import { listDocuments } from '@/lib/data-client';
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

interface EditRecordDialogProps {
  record: MedicalRecord | null;
  onSave: (data: MedicalRecord) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRecordDialog({ record, onSave, open, onOpenChange }: EditRecordDialogProps) {
  const { t, isRTL } = useLanguage();
  const [dateOpen, setDateOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<StaffMember[]>([]);

  const form = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
        patient: '',
        provider: '',
        type: '',
        date: new Date(),
        complaint: '',
        notes: '',
        status: 'Draft',
    }
  });

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

  React.useEffect(() => {
    if (record && patients.length > 0 && doctors.length > 0) {
      form.reset({
        patient: patients.find(p => p.name === record.patient)?.id || '',
        provider: doctors.find(d => d.name === record.provider)?.id || '',
        type: record.type,
        date: new Date(record.date),
        complaint: record.complaint,
        status: record.status,
        notes: record.notes || '',
      });
    }
  }, [record, form, patients, doctors]);

  const onSubmit = (data: RecordFormData) => {
    if (!record) return;

    const patientName = patients.find(p => p.id === data.patient)?.name;
    const providerName = doctors.find(d => d.id === data.provider)?.name;

    const updatedRecord: MedicalRecord = {
      ...record,
      patient: patientName || record.patient,
      provider: providerName || record.provider,
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
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>{t('medical_records.pick_a_date')}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
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
                        <SelectItem value="Draft">{t('medical_records.status_draft')}</SelectItem>
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
      </DialogContent>
    </Dialog>
  );
}
