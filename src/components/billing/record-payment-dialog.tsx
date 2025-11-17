
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Invoice } from '@/app/billing/page';
import { useLanguage } from '@/contexts/LanguageContext';

const paymentMethods = ['billing.payment_method_cash', 'billing.payment_method_vodafone', 'billing.payment_method_fawry', 'billing.payment_method_instapay', 'billing.payment_method_bank'];

const paymentSchema = z.object({
  amount: z.coerce.number().positive('billing.validation.amount_positive'),
  paymentMethod: z.string({ required_error: 'billing.validation.payment_method_required' }),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface RecordPaymentDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (invoiceId: string, amount: number) => void;
}

export function RecordPaymentDialog({ invoice, open, onOpenChange, onSave }: RecordPaymentDialogProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const amountDue = invoice.totalAmount - invoice.amountPaid;
  const { t, language } = useLanguage();

  React.useEffect(() => {
    form.reset({
      amount: amountDue,
      paymentMethod: 'Cash',
      notes: ''
    });
  }, [invoice, amountDue, form]);


  const onSubmit = (data: PaymentFormData) => {
    if (data.amount > amountDue) {
        form.setError("amount", {
            type: "manual",
            message: t('billing.payment_exceeds_due', { amount: new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(amountDue) })
        });
        return;
    }
    onSave(invoice.id, data.amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('billing.record_payment_for_invoice')} {invoice.id}</DialogTitle>
          <DialogDescription>
            {t('common.patient')}: {invoice.patient} | {t('billing.amount_due')}: {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(amountDue)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billing.payment_amount')} *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder={t('billing.amount_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billing.payment_method')} *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder={t('billing.select_payment_method')} /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map(method => <SelectItem key={method} value={method}>{t(method)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billing.payment_notes')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('billing.payment_notes_placeholder')} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('billing.record_payment')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
