
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { getCollection } from '@/services/firestore';
import type { InsuranceProvider } from '@/app/insurance/page';
import { useLanguage } from '@/contexts/LanguageContext';

// Schema will be constructed inside the component to use translations
// Define the form data type explicitly since the schema is created inside the component
type ClaimFormData = {
  patient: string;
  insurance: string;
  procedure: string;
  procedureCode?: string;
  amount: string;
  submitDate: Date;
};

interface NewClaimDialogProps {
  onSave: (data: {
    patient: string; // patient name
    insurance: string; // provider name
    procedure: string;
    procedureCode?: string;
    amount: string; // numeric string
    submitDate: Date;
  }) => void;
}

export function NewClaimDialog({ onSave }: NewClaimDialogProps) {
  const { t, isRTL } = useLanguage();
  const claimSchema = React.useMemo(() => z.object({
    patient: z.string({ required_error: t('validation.patient_required') }),
    insurance: z.string({ required_error: t('validation.provider_required') }),
    procedure: z.string().min(1, t('validation.procedure_required')),
    procedureCode: z.string().optional(),
    amount: z.string().min(1, t('validation.amount_required')),
    submitDate: z.date({ required_error: t('validation.date_required') }),
  }), [t]);
  const [open, setOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  // Only need id and name to populate the select
  const [patients, setPatients] = React.useState<Array<{ id: string; name: string }>>([]);
  const [providers, setProviders] = React.useState<InsuranceProvider[]>([]);

  const form = useForm<ClaimFormData>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      patient: '',
      insurance: '',
      procedure: '',
      procedureCode: '',
      amount: '',
      submitDate: new Date(),
    }
  });

  React.useEffect(() => {
  async function fetchData() {
        if (open) {
            const [patientData, providerData] = await Promise.all([
        getCollection<{ id: string; name: string }>('patients'),
                getCollection<InsuranceProvider>('insurance-providers')
            ]);
      setPatients(patientData.map((p) => ({ id: p.id, name: p.name })));
            setProviders(providerData);
        }
    }
    fetchData();
  }, [open]);

  const onSubmit = (data: ClaimFormData) => {
    const patientName = patients.find(p => p.id === data.patient)?.name;
    const providerName = providers.find(p => p.id === data.insurance)?.name;
    onSave({ ...data, patient: patientName ?? '', insurance: providerName ?? '' });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
          {t('insurance.new_claim')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('insurance.submit_new_claim')}</DialogTitle>
          <DialogDescription>
            {t('insurance.submit_new_claim_desc')}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('patients.select_patient')} />
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
                name="insurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('patients.insurance_provider')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('insurance.select_provider')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
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
                name="procedure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.procedure')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('insurance.placeholder.procedure_example')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="procedureCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('insurance.procedure_code')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('insurance.placeholder.procedure_code_example')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('financial.amount')} *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder={t('insurance.placeholder.amount_egp')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="submitDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('insurance.submit_date')} *</FormLabel>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            <CalendarIcon className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                            {field.value ? format(field.value, "PPP") : <span>{t('appointments.pick_date')}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('insurance.submit_claim')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
