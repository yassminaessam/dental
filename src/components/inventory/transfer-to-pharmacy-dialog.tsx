"use client";

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const transferSchema = z.object({
  quantity: z.coerce.number().min(1, 'inventory.validation.transfer_quantity_min'),
  unitPrice: z.coerce.number().min(0, 'inventory.validation.unit_cost_non_negative').optional(),
  notes: z.string().max(500).optional(),
});

export type TransferFormData = z.infer<typeof transferSchema>;

interface TransferToPharmacyDialogProps {
  itemName?: string;
  availableQuantity: number;
  defaultUnitPrice?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: TransferFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function TransferToPharmacyDialog({
  itemName,
  availableQuantity,
  defaultUnitPrice = 0,
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: TransferToPharmacyDialogProps) {
  const { t, isRTL } = useLanguage();

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      quantity: availableQuantity > 0 ? Math.min(availableQuantity, 10) : 0,
      unitPrice: defaultUnitPrice || undefined,
      notes: '',
    },
  });

  React.useEffect(() => {
    form.reset({
      quantity: availableQuantity > 0 ? Math.min(availableQuantity, 10) : 0,
      unitPrice: defaultUnitPrice || undefined,
      notes: '',
    });
  }, [availableQuantity, defaultUnitPrice, form]);

  const handleSubmit = async (data: TransferFormData) => {
    if (!availableQuantity || availableQuantity <= 0) {
      return;
    }
    if (data.quantity > availableQuantity) {
      form.setError('quantity', {
        type: 'manual',
        message: t('inventory.validation.transfer_quantity_max', { max: availableQuantity }),
      });
      return;
    }

    await onConfirm(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader className={cn(isRTL && 'text-right')}>
          <DialogTitle>{t('inventory.transfer_dialog_title')}</DialogTitle>
          <DialogDescription>
            {t('inventory.transfer_description', { name: itemName ?? '' })}
          </DialogDescription>
        </DialogHeader>
        <div className={cn('text-sm text-muted-foreground', isRTL && 'text-right')}>
          {t('inventory.available_quantity', { count: availableQuantity })}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inventory.transfer_quantity_label')}</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={availableQuantity} {...field} />
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
                  <FormLabel>{t('inventory.transfer_unit_price_label')}</FormLabel>
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
                  <FormLabel>{t('inventory.transfer_notes_label')}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting || availableQuantity <= 0}>
                {isSubmitting ? t('common.loading') : t('inventory.transfer_submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
