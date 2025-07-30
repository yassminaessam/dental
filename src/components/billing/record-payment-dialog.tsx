
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

const paymentMethods = ['Cash', 'Vodafone Cash', 'Fawry', 'InstaPay', 'Bank Transfer'];

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  paymentMethod: z.string({ required_error: 'Payment method is required.' }),
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
            message: `Payment cannot exceed amount due (EGP ${amountDue.toFixed(2)}).`
        });
        return;
    }
    onSave(invoice.id, data.amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment for Invoice {invoice.id}</DialogTitle>
          <DialogDescription>
            Patient: {invoice.patient} | Amount Due: EGP {amountDue.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
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
                  <FormLabel>Payment Method *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods.map(method => <SelectItem key={method} value={method}>{method}</SelectItem>)}
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
                  <FormLabel>Payment Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Reference ID, etc." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Record Payment</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
