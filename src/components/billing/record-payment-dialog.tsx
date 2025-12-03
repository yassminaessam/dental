
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
import { Wallet, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const paymentMethods = ['billing.payment_method_cash', 'billing.payment_method_vodafone', 'billing.payment_method_fawry', 'billing.payment_method_instapay', 'billing.payment_method_bank', 'wallet.pay_from_wallet'];

const paymentSchema = z.object({
  amount: z.coerce.number().positive('billing.validation.amount_positive'),
  paymentMethod: z.string({ required_error: 'billing.validation.payment_method_required' }),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface WalletData {
  id: string;
  balance: number;
  isActive: boolean;
}

interface RecordPaymentDialogProps {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (invoiceId: string, amount: number, paymentMethod?: string) => void;
}

export function RecordPaymentDialog({ invoice, open, onOpenChange, onSave }: RecordPaymentDialogProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const [walletData, setWalletData] = React.useState<WalletData | null>(null);
  const [loadingWallet, setLoadingWallet] = React.useState(false);
  const [isWalletPayment, setIsWalletPayment] = React.useState(false);
  const [walletPaymentProcessing, setWalletPaymentProcessing] = React.useState(false);

  const amountDue = invoice.totalAmount - invoice.amountPaid;
  const { t, language } = useLanguage();

  // Fetch wallet data when dialog opens
  React.useEffect(() => {
    const fetchWallet = async () => {
      if (!open || !invoice.patientId) return;
      
      setLoadingWallet(true);
      try {
        const response = await fetch(`/api/wallet?action=get-by-patient&patientId=${invoice.patientId}`);
        if (response.ok) {
          const data = await response.json();
          setWalletData(data.wallet);
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWallet();
  }, [open, invoice.patientId]);

  React.useEffect(() => {
    form.reset({
      amount: amountDue,
      paymentMethod: 'Cash',
      notes: ''
    });
    setIsWalletPayment(false);
  }, [invoice, amountDue, form]);

  // Watch payment method changes
  const watchedPaymentMethod = form.watch('paymentMethod');
  React.useEffect(() => {
    setIsWalletPayment(watchedPaymentMethod === 'wallet.pay_from_wallet');
  }, [watchedPaymentMethod]);

  const handleWalletPayment = async (amount: number) => {
    if (!walletData || !invoice.patientId) return;

    setWalletPaymentProcessing(true);
    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pay-invoice',
          patientId: invoice.patientId,
          invoiceId: invoice.id,
          amount: amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process wallet payment');
      }

      // Call onSave with wallet payment method
      onSave(invoice.id, amount, 'Wallet');
    } catch (error) {
      console.error('Wallet payment failed:', error);
      form.setError('paymentMethod', {
        type: 'manual',
        message: error instanceof Error ? error.message : t('wallet.toast.error_loading'),
      });
    } finally {
      setWalletPaymentProcessing(false);
    }
  };

  const onSubmit = (data: PaymentFormData) => {
    if (data.amount > amountDue) {
        form.setError("amount", {
            type: "manual",
            message: t('billing.payment_exceeds_due', { amount: new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(amountDue) })
        });
        return;
    }

    // Handle wallet payment separately
    if (data.paymentMethod === 'wallet.pay_from_wallet') {
      if (!walletData || walletData.balance < data.amount) {
        form.setError('paymentMethod', {
          type: 'manual',
          message: t('wallet.toast.insufficient_balance'),
        });
        return;
      }
      handleWalletPayment(data.amount);
      return;
    }

    onSave(invoice.id, data.amount);
  };

  const canPayFromWallet = walletData && walletData.isActive && walletData.balance >= amountDue;
  const insufficientWalletBalance = walletData && walletData.isActive && walletData.balance < amountDue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('billing.record_payment_for_invoice')} {invoice.id}</DialogTitle>
          <DialogDescription>
            {t('common.patient')}: {invoice.patient} | {t('billing.amount_due')}: {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(amountDue)}
          </DialogDescription>
        </DialogHeader>

        {/* Wallet Balance Info */}
        {walletData && walletData.isActive && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Wallet className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('wallet.available_balance')}</p>
              <p className="text-lg font-bold text-primary">
                {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(walletData.balance)}
              </p>
            </div>
            {canPayFromWallet && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {t('common.available')}
              </span>
            )}
          </div>
        )}

        {/* Insufficient Balance Warning */}
        {isWalletPayment && insufficientWalletBalance && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('wallet.toast.insufficient_balance_desc')}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('billing.payment_amount')} *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder={t('billing.amount_placeholder')} {...field} readOnly className="bg-muted cursor-not-allowed" />
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
                      {paymentMethods.map(method => (
                        <SelectItem 
                          key={method} 
                          value={method}
                          disabled={method === 'wallet.pay_from_wallet' && (!walletData || !walletData.isActive)}
                        >
                          {method === 'wallet.pay_from_wallet' ? (
                            <span className="flex items-center gap-2">
                              <Wallet className="h-4 w-4" />
                              {t(method)}
                              {walletData && walletData.isActive && (
                                <span className="text-xs text-muted-foreground">
                                  ({new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(walletData.balance)})
                                </span>
                              )}
                            </span>
                          ) : (
                            t(method)
                          )}
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
              <Button 
                type="submit" 
                disabled={walletPaymentProcessing || (isWalletPayment && !!insufficientWalletBalance)}
              >
                {walletPaymentProcessing ? t('common.processing') : t('billing.record_payment')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
