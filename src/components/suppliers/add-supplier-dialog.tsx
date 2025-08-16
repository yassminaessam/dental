

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
import { Plus } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useLanguage } from '@/contexts/LanguageContext';

const supplierSchema = z.object({
  name: z.string().min(1, 'suppliers.validation.name_required'),
  phone: z.string().optional(),
  // Email is optional: allow empty string or a valid email
  email: z.union([z.string().email('suppliers.validation.invalid_email'), z.literal('')]).optional(),
  address: z.string().optional(),
  category: z.string().optional(),
  paymentTerms: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

const supplierPaymentTerms = ['Net 15', 'Net 30', 'Net 60', 'Due on receipt'];

interface AddSupplierDialogProps {
  onSave: (data: any) => void;
}

export function AddSupplierDialog({ onSave }: AddSupplierDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { t } = useLanguage();
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      category: '',
      paymentTerms: '',
    },
  });

  const onSubmit = (data: SupplierFormData) => {
    onSave(data);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t('suppliers.add_supplier')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('suppliers.add_new_supplier')}</DialogTitle>
          <DialogDescription>
            {t('suppliers.add_supplier_description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('suppliers.supplier_name')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('suppliers.placeholder.supplier_name')} {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.name?.message && t(String(form.formState.errors.name.message))}
                  </FormMessage>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('suppliers.phone') || t('common.phone')}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t('suppliers.phone_placeholder') || '01xxxxxxxxx'} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('suppliers.email') || 'Email'}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('suppliers.placeholder.email')} {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.email?.message && t(String(form.formState.errors.email.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('suppliers.address') || 'Address'}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('suppliers.placeholder.address')} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('suppliers.category')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('suppliers.placeholder.category')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('suppliers.payment_terms')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('suppliers.select_payment_terms')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {supplierPaymentTerms.map((term) => (
                          <SelectItem key={term} value={term}>
                            {term}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('suppliers.save_supplier')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
