
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import type { Patient } from '@/app/patients/page';
import { useLanguage } from '@/contexts/LanguageContext';

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'validation.description_required'),
  quantity: z.coerce.number().min(1, 'billing.validation.qty_min'),
  unitPrice: z.coerce.number().min(0, 'billing.validation.price_positive'),
});

const invoiceSchema = z.object({
  patient: z.string({ required_error: 'validation.patient_required' }),
  issueDate: z.date({ required_error: 'billing.validation.issue_date_required' }),
  dueDate: z.date({ required_error: 'billing.validation.due_date_required' }),
  items: z.array(lineItemSchema).min(1, 'billing.validation.at_least_one_item'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface NewInvoiceDialogProps {
  onSave: (data: any) => void;
  patients: Patient[];
}

export function NewInvoiceDialog({ onSave, patients }: NewInvoiceDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { t, language, isRTL } = useLanguage();
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      items: [{ id: '1', description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (data: InvoiceFormData) => {
    const patientDetails = patients.find(p => p.id === data.patient);
    const totalAmount = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    onSave({
  patient: patientDetails?.name || t('patients.patient'),
  patientId: patientDetails?.id || t('common.na'),
  issueDate: data.issueDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'),
  dueDate: data.dueDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'),
        totalAmount,
        items: data.items,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 sm:h-10">
          <Plus className={cn("h-3 w-3 sm:h-4 sm:w-4", isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2')} />
          <span className="hidden sm:inline">{t('billing.new_invoice')}</span>
          <span className="sm:hidden">{t('billing.invoice')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full flex flex-col">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="text-lg sm:text-xl">{t('billing.create_new_invoice')}</DialogTitle>
          <DialogDescription className="text-sm">
            {t('billing.invoice_description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4 sm:space-y-6 overflow-y-auto px-1">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
              <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">{t('billing.patient')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder={t('patients.select_patient')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">{t('billing.issue_date')} *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 sm:h-10 justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                            {field.value ? field.value.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : <span>{t('appointments.pick_date')}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">{t('billing.due_date')} *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 sm:h-10 justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                            {field.value ? field.value.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : <span>{t('appointments.pick_date')}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <FormLabel className="text-sm font-medium">{t('billing.line_items')} *</FormLabel>
              <div className="space-y-3 sm:space-y-4 rounded-lg border p-3 sm:p-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-12">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-6">
                          <FormLabel className="sr-only sm:not-sr-only text-xs">{t('common.description')}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t('billing.service_description_placeholder')}
                              className="h-9 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="sr-only sm:not-sr-only text-xs">{t('billing.quantity')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('billing.quantity_placeholder')}
                              className="h-9 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-3">
                          <FormLabel className="sr-only sm:not-sr-only text-xs">{t('billing.unit_price')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t('billing.unit_price_placeholder')}
                              className="h-9 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="sm:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-9"
                  onClick={() => append({ 
                    id: `${fields.length + 1}`, 
                    description: '', 
                    quantity: 1, 
                    unitPrice: 0 
                  })}
                >
                  <Plus className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} /> {t('billing.add_item')}
                </Button>
                <FormMessage>{form.formState.errors.items?.message}</FormMessage>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-4 sm:pt-6">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full sm:w-auto order-2 sm:order-1"
                onClick={() => setOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {t('billing.create_invoice')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
