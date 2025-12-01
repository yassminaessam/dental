
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Supplier } from '@/app/suppliers/page';
import { useLanguage } from '@/contexts/LanguageContext';

const supplierSchema = z.object({
  name: z.string().min(1, 'suppliers.validation.name_required'),
  phone: z.string().optional(),
  // Email is optional: allow empty string or a valid email
  email: z.union([z.string().email('suppliers.validation.invalid_email'), z.literal('')]).optional(),
  address: z.string().optional(),
  category: z.string().optional(),
  paymentTerms: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(['Active', 'Inactive']),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

const supplierPaymentTerms = ['Net 15', 'Net 30', 'Net 60', 'Due on receipt'];

// Star Rating Component
function StarRating({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          title={`${star} star${star > 1 ? 's' : ''}`}
          className="p-0.5 hover:scale-110 transition-transform focus:outline-none"
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
          onClick={() => onChange(star === value ? 0 : star)}
        >
          <Star
            className={cn(
              "h-6 w-6 transition-colors",
              (hoverValue !== null ? star <= hoverValue : star <= value)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-gray-300 dark:text-gray-600"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">
        {value > 0 ? `${value}/5` : ''}
      </span>
    </div>
  );
}

interface EditSupplierDialogProps {
  supplier: Supplier;
  onSave: (data: Supplier) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSupplierDialog({ supplier, onSave, open, onOpenChange }: EditSupplierDialogProps) {
  const { t } = useLanguage();
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
  });
  
  React.useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name,
        phone: supplier.phone ?? undefined,
        email: supplier.email ?? undefined,
        address: supplier.address ?? undefined,
        category: supplier.category ?? undefined,
        paymentTerms: supplier.paymentTerms ?? undefined,
        rating: supplier.rating ?? 0,
        status: supplier.status,
      });
    }
  }, [supplier, form]);

  const onSubmit = (data: SupplierFormData) => {
    const updatedSupplier: Supplier = {
      ...supplier,
      ...data,
    };
    onSave(updatedSupplier);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('suppliers.edit_supplier')}</DialogTitle>
          <DialogDescription>
            {t('suppliers.edit_supplier_description')}
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
                      <Input type="tel" placeholder={t('suppliers.phone_placeholder') || '+1-555-0123'} {...field} />
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('suppliers.rating') || 'Rating'}</FormLabel>
                    <FormControl>
                      <StarRating
                        value={field.value ?? 0}
                        onChange={field.onChange}
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
                    <FormLabel>{t('common.status')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('common.select_status')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">{t('common.active')}</SelectItem>
                        <SelectItem value="Inactive">{t('common.inactive')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
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
