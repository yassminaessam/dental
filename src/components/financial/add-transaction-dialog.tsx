
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { getCollection } from '@/services/firestore';
import { Patient } from '@/app/patients/page';
import { useLanguage } from '@/contexts/LanguageContext';

const transactionSchema = (() => {
  // Note: We can't use hooks here; we build a schema factory and call inside component if needed.
  return z.object({
    date: z.date({ required_error: 'Date is required' }),
    amount: z.string().min(1, 'Amount is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.string({ required_error: 'Category is required' }),
    paymentMethod: z.string({ required_error: 'Payment method is required' }),
    type: z.enum(['Revenue', 'Expense'], { required_error: 'Type is required' }),
    patient: z.string().optional(),
  });
})();

type TransactionFormData = z.infer<typeof transactionSchema>;

const transactionCategories = ['Patient Payment', 'Insurance Payment', 'Supplies', 'Salary', 'Rent', 'Utilities', 'Marketing', 'Other'];
const paymentMethods = ['Credit Card', 'Cash', 'Vodafone Cash', 'Fawry', 'Bank Transfer'];

interface AddTransactionDialogProps {
  onSave: (data: any) => void;
}

export function AddTransactionDialog({ onSave }: AddTransactionDialogProps) {
  const { t, isRTL } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);

  const schema = React.useMemo(() => z.object({
    date: z.date({ required_error: t('validation.date_required') }),
    amount: z.string().min(1, t('validation.amount_required')),
    description: z.string().min(1, t('validation.description_required')),
    category: z.string({ required_error: t('validation.category_required') }),
    paymentMethod: z.string({ required_error: t('billing.validation.payment_method_required') }),
    type: z.enum(['Revenue', 'Expense'], { required_error: t('validation.type_required') }),
    patient: z.string().optional(),
  }), [t]);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date(),
      type: 'Revenue',
      amount: '',
      description: '',
      category: '',
      paymentMethod: '',
      patient: '',
    },
  });
  
  React.useEffect(() => {
    async function fetchPatients() {
        if(open) {
            const patientData = await getCollection<any>('patients');
            setPatients(patientData.map((p: any) => ({...p, dob: new Date(p.dob)})));
        }
    }
    fetchPatients();
  }, [open]);

  const onSubmit = (data: TransactionFormData) => {
    const patientName = patients.find(p => p.id === data.patient)?.name;
    onSave({...data, patient: patientName });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
          {t('financial.add_transaction')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('financial.add_new_transaction')}</DialogTitle>
          <DialogDescription>
            {t('financial.add_transaction_desc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
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
                            className={cn("w-full justify-start font-normal", !field.value && "text-muted-foreground", isRTL ? 'flex-row-reverse text-right' : 'text-left')}
                          >
                            <CalendarIcon className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                            {field.value ? format(field.value, "PPP") : <span>{t('appointments.pick_date')}</span>}
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
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('financial.amount')} *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="EGP 0.00" {...field} className={cn(isRTL && 'text-right')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.description')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('common.description')} {...field} className={cn(isRTL && 'text-right')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.patient')} ({t('common.if_applicable')})</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('financial.category')} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('inventory.category_placeholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {transactionCategories.map((cat) => {
                          const label = ({
                            'Patient Payment': t('financial.category.patient_payment'),
                            'Insurance Payment': t('financial.category.insurance_payment'),
                            'Supplies': t('financial.category.supplies'),
                            'Salary': t('financial.category.salary'),
                            'Rent': t('financial.category.rent'),
                            'Utilities': t('financial.category.utilities'),
                            'Marketing': t('financial.category.marketing'),
                            'Other': t('financial.category.other'),
                          } as Record<string, string>)[cat] || cat;
                          return (
                            <SelectItem key={cat} value={cat}>
                              {label}
                            </SelectItem>
                          );
                        })}
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
                    name="paymentMethod"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('financial.payment_method')} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder={t('billing.select_payment_method')} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {paymentMethods.map((method) => {
                              const label = ({
                                'Credit Card': t('billing.payment_method_credit_card'),
                                'Cash': t('billing.payment_method_cash'),
                                'Vodafone Cash': t('billing.payment_method_vodafone'),
                                'Fawry': t('billing.payment_method_fawry'),
                                'Bank Transfer': t('billing.payment_method_bank'),
                              } as Record<string, string>)[method] || method;
                              return (
                                <SelectItem key={method} value={method}>
                                  {label}
                                </SelectItem>
                              );
                            })}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('financial.type')} *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4 items-center pt-2"
                            >
                            <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                <RadioGroupItem value="Revenue" id="r-revenue" />
                                </FormControl>
                                <FormLabel htmlFor="r-revenue">{t('financial.revenue')}</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                <RadioGroupItem value="Expense" id="r-expense" />
                                </FormControl>
                                <FormLabel htmlFor="r-expense">{t('financial.expense')}</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('financial.save_transaction')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
