"use client";

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Medication, Prescription } from '@/app/pharmacy/page';

const dispenseSchema = z.object({
  quantity: z.coerce.number().min(1, 'inventory.validation.transfer_quantity_min'),
  unitPrice: z.coerce.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export type DispenseFormData = z.infer<typeof dispenseSchema>;

interface DispenseMedicationDialogProps {
  prescription: Prescription | null;
  medication: Medication | null;
  open: boolean;
  isSubmitting: boolean;
  onConfirm: (data: DispenseFormData) => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}

const parseCurrencyValue = (value?: string): number => {
  if (!value) return 0;
  const numeric = parseFloat(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

export function DispenseMedicationDialog({
  prescription,
  medication,
  open,
  isSubmitting,
  onConfirm,
  onOpenChange,
}: DispenseMedicationDialogProps) {
  const { t } = useLanguage();
  const availableStock = medication?.stock ?? 0;

  const form = useForm<DispenseFormData>({
    resolver: zodResolver(dispenseSchema),
    defaultValues: {
      quantity: availableStock > 0 ? 1 : 0,
      unitPrice: parseCurrencyValue(medication?.unitPrice),
      notes: '',
    },
  });

  React.useEffect(() => {
    if (open && medication) {
      form.reset({
        quantity: medication.stock > 0 ? 1 : 0,
        unitPrice: parseCurrencyValue(medication.unitPrice),
        notes: '',
      });
    }
  }, [form, medication, open]);

  const handleSubmit = async (values: DispenseFormData) => {
    await onConfirm(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('pharmacy.dispense_dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('pharmacy.dispense_dialog.description')}
          </DialogDescription>
        </DialogHeader>
        {prescription && medication && (
          <div className="space-y-2 rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
            <div className="font-semibold">{medication.fullName || medication.name}</div>
            <div className="text-muted-foreground">
              {t('common.patient')}: {prescription.patient}
            </div>
            <div className="text-muted-foreground">
              {t('common.doctor')}: {prescription.doctor}
            </div>
            <div className="text-muted-foreground">
              {t('pharmacy.dispense_dialog.available', { count: availableStock })}
            </div>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pharmacy.dispense_dialog.quantity')}</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={availableStock} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pharmacy.dispense_dialog.unit_price')}</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('pharmacy.dispense_dialog.notes')}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || availableStock <= 0}>
                {isSubmitting ? t('common.loading') : t('pharmacy.actions.dispense')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
