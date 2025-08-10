
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useLanguage } from '@/contexts/LanguageContext';

const medicationSchema = z.object({
  name: z.string().min(1, 'pharmacy.validation.medication_name_required'),
  category: z.string().optional(),
  form: z.string().optional(),
  strength: z.string().optional(),
  stock: z.coerce.number().min(0, 'pharmacy.validation.stock_non_negative'),
  unitPrice: z.coerce.number().min(0, 'pharmacy.validation.price_non_negative'),
  expiryDate: z.date().optional(),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

interface AddMedicationDialogProps {
  onSave: (data: MedicationFormData) => void;
}

export function AddMedicationDialog({ onSave }: AddMedicationDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
  });

  const onSubmit = (data: MedicationFormData) => {
    onSave(data);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('pharmacy.add_medication')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('pharmacy.add_new_medication')}</DialogTitle>
          <DialogDescription>
            {t('pharmacy.add_new_medication_desc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.medication_name')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('pharmacy.placeholder.medication_name')} {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.name?.message && t(String(form.formState.errors.name.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.category')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('pharmacy.placeholder.category')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="form"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.form')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('pharmacy.placeholder.form')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="strength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.strength')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('pharmacy.placeholder.strength')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.stock_level')} *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.stock?.message && t(String(form.formState.errors.stock.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.unit_price')} *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder={t('pharmacy.placeholder.unit_price')} {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.unitPrice?.message && t(String(form.formState.errors.unitPrice.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('pharmacy.expiry_date')}</FormLabel>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('pharmacy.save_medication')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
