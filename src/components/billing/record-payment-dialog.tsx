
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
import { Wallet, AlertCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { listDocuments, updateDocument } from '@/lib/data-client';

const paymentMethods = ['billing.payment_method_cash', 'billing.payment_method_vodafone', 'billing.payment_method_fawry', 'billing.payment_method_instapay', 'billing.payment_method_bank', 'wallet.pay_from_wallet', 'insurance.pay_from_insurance'];

const paymentSchema = z.object({
  amount: z.coerce.number().positive('billing.validation.amount_positive'),
  paymentMethod: z.string({ required_error: 'billing.validation.payment_method_required' }),
  selectedClaimId: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface WalletData {
  id: string;
  balance: number;
  isActive: boolean;
}

interface InsuranceClaim {
  id: string;
  patient: string;
  patientId: string;
  insurance: string;
  procedure: string;
  amount: string;
  approvedAmount: string | null;
  paidAmount?: string | null;
  status: 'Approved' | 'Processing' | 'Denied' | 'Paid';
}

interface PatientInsuranceData {
  insuranceProvider?: string;
  policyNumber?: string;
  approvedClaims: InsuranceClaim[];
  totalApprovedBalance: number;
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
  const [insuranceData, setInsuranceData] = React.useState<PatientInsuranceData | null>(null);
  const [loadingWallet, setLoadingWallet] = React.useState(false);
  const [loadingInsurance, setLoadingInsurance] = React.useState(false);
  const [isWalletPayment, setIsWalletPayment] = React.useState(false);
  const [isInsurancePayment, setIsInsurancePayment] = React.useState(false);
  const [walletPaymentProcessing, setWalletPaymentProcessing] = React.useState(false);
  const [insurancePaymentProcessing, setInsurancePaymentProcessing] = React.useState(false);

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

  // Fetch insurance data when dialog opens
  React.useEffect(() => {
    const fetchInsurance = async () => {
      if (!open || !invoice.patientId) return;
      
      setLoadingInsurance(true);
      try {
        // Fetch patient data to get insurance provider
        const patientResponse = await fetch(`/api/patients/${invoice.patientId}`);
        let patientInsurance: { insuranceProvider?: string; policyNumber?: string } = {};
        
        if (patientResponse.ok) {
          const { patient } = await patientResponse.json();
          patientInsurance = {
            insuranceProvider: patient?.insuranceProvider,
            policyNumber: patient?.policyNumber,
          };
        }

        // Fetch approved insurance claims for this patient
        const allClaims = await listDocuments<InsuranceClaim>('insurance-claims');
        const approvedClaims = allClaims.filter(
          claim => claim.patientId === invoice.patientId && claim.status === 'Approved' && claim.approvedAmount
        );
        
        const totalApprovedBalance = approvedClaims.reduce((acc, claim) => {
          const amount = claim.approvedAmount ? parseFloat(claim.approvedAmount.replace(/[^0-9.-]+/g, '')) : 0;
          return acc + amount;
        }, 0);

        setInsuranceData({
          ...patientInsurance,
          approvedClaims,
          totalApprovedBalance,
        });
      } catch (error) {
        console.error('Failed to fetch insurance:', error);
      } finally {
        setLoadingInsurance(false);
      }
    };

    fetchInsurance();
  }, [open, invoice.patientId]);

  React.useEffect(() => {
    form.reset({
      amount: amountDue,
      paymentMethod: 'Cash',
      selectedClaimId: '',
      notes: ''
    });
    setIsWalletPayment(false);
    setIsInsurancePayment(false);
  }, [invoice, amountDue, form]);

  // Watch payment method changes
  const watchedPaymentMethod = form.watch('paymentMethod');
  React.useEffect(() => {
    setIsWalletPayment(watchedPaymentMethod === 'wallet.pay_from_wallet');
    setIsInsurancePayment(watchedPaymentMethod === 'insurance.pay_from_insurance');
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

  const handleInsurancePayment = async (amount: number, selectedClaimId?: string) => {
    if (!insuranceData || !invoice.patientId) return;

    setInsurancePaymentProcessing(true);
    try {
      // If a specific claim is selected, use its amount
      let claimToUse: InsuranceClaim | undefined;
      let paymentAmount = amount;

      if (selectedClaimId) {
        claimToUse = insuranceData.approvedClaims.find(c => c.id === selectedClaimId);
        if (claimToUse && claimToUse.approvedAmount) {
          const claimBalance = parseFloat(claimToUse.approvedAmount.replace(/[^0-9.-]+/g, ''));
          paymentAmount = Math.min(claimBalance, amountDue);
        }
      } else {
        // Use the first available approved claim
        claimToUse = insuranceData.approvedClaims[0];
        if (claimToUse && claimToUse.approvedAmount) {
          const claimBalance = parseFloat(claimToUse.approvedAmount.replace(/[^0-9.-]+/g, ''));
          paymentAmount = Math.min(claimBalance, amountDue);
        }
      }

      if (!claimToUse) {
        throw new Error(t('insurance.no_approved_claims'));
      }

      // Calculate the current claim balance and the remaining balance after payment
      const currentClaimBalance = claimToUse.approvedAmount 
        ? parseFloat(claimToUse.approvedAmount.replace(/[^0-9.-]+/g, '')) 
        : 0;
      const remainingBalance = currentClaimBalance - paymentAmount;
      
      // Get current total paid from this claim (if any)
      const currentPaidAmount = claimToUse.paidAmount 
        ? parseFloat(claimToUse.paidAmount.replace(/[^0-9.-]+/g, '')) 
        : 0;
      const newTotalPaid = currentPaidAmount + paymentAmount;

      // Update the claim: deduct from approved amount
      // If remaining balance is 0 or less, mark as Paid
      // Otherwise, keep as Approved with reduced balance
      if (remainingBalance <= 0) {
        // Fully used - mark as Paid
        await updateDocument('insurance-claims', claimToUse.id, {
          status: 'Paid',
          approvedAmount: 'EGP 0.00',
          paidAmount: `EGP ${newTotalPaid.toFixed(2)}`,
          paidDate: new Date().toLocaleDateString(),
        });
      } else {
        // Partially used - keep as Approved with reduced balance
        await updateDocument('insurance-claims', claimToUse.id, {
          approvedAmount: `EGP ${remainingBalance.toFixed(2)}`,
          paidAmount: `EGP ${newTotalPaid.toFixed(2)}`,
        });
      }

      // Call onSave with insurance payment method
      onSave(invoice.id, paymentAmount, 'Insurance');
      onOpenChange(false);
    } catch (error) {
      console.error('Insurance payment failed:', error);
      form.setError('paymentMethod', {
        type: 'manual',
        message: error instanceof Error ? error.message : t('insurance.no_approved_claims'),
      });
    } finally {
      setInsurancePaymentProcessing(false);
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

    // Handle insurance payment separately
    if (data.paymentMethod === 'insurance.pay_from_insurance') {
      if (!insuranceData || insuranceData.approvedClaims.length === 0) {
        form.setError('paymentMethod', {
          type: 'manual',
          message: t('insurance.no_approved_claims'),
        });
        return;
      }
      handleInsurancePayment(data.amount, data.selectedClaimId);
      return;
    }

    // Get the readable payment method name from the translation key
    const paymentMethodName = t(data.paymentMethod).replace('billing.payment_method_', '');
    onSave(invoice.id, data.amount, paymentMethodName);
  };

  const canPayFromWallet = walletData && walletData.isActive && walletData.balance >= amountDue;
  const insufficientWalletBalance = walletData && walletData.isActive && walletData.balance < amountDue;
  const canPayFromInsurance = insuranceData && insuranceData.approvedClaims.length > 0 && insuranceData.totalApprovedBalance > 0;
  const hasInsuranceProvider = insuranceData && insuranceData.insuranceProvider && insuranceData.insuranceProvider !== 'none';

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

        {/* Insurance Balance Info - Show when patient has insurance OR has approved claims */}
        {(hasInsuranceProvider || canPayFromInsurance) && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Shield className="h-5 w-5 text-cyan-600" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('insurance.insurance_balance')}</p>
              {insuranceData?.insuranceProvider && (
                <p className="text-xs text-muted-foreground">{insuranceData.insuranceProvider}</p>
              )}
              <p className="text-lg font-bold text-cyan-600">
                {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(insuranceData?.totalApprovedBalance || 0)}
              </p>
            </div>
            {canPayFromInsurance ? (
              <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">
                {insuranceData?.approvedClaims.length} {t('insurance.status.approved')}
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {t('common.no_balance')}
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

        {/* No Insurance Claims Warning */}
        {isInsurancePayment && !canPayFromInsurance && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('insurance.no_approved_claims')}
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
                          disabled={
                            (method === 'wallet.pay_from_wallet' && (!walletData || !walletData.isActive)) ||
                            (method === 'insurance.pay_from_insurance' && !canPayFromInsurance)
                          }
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
                          ) : method === 'insurance.pay_from_insurance' ? (
                            <span className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              {t(method)}
                              {canPayFromInsurance && (
                                <span className="text-xs text-muted-foreground">
                                  ({new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(insuranceData?.totalApprovedBalance || 0)})
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
            
            {/* Insurance Claim Selection */}
            {isInsurancePayment && canPayFromInsurance && insuranceData && insuranceData.approvedClaims.length > 1 && (
              <FormField
                control={form.control}
                name="selectedClaimId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('insurance.select_claim_to_apply')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder={t('insurance.select_claim_to_apply')} /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {insuranceData.approvedClaims.map(claim => (
                          <SelectItem key={claim.id} value={claim.id}>
                            {claim.procedure} - {claim.approvedAmount}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                disabled={
                  walletPaymentProcessing || 
                  insurancePaymentProcessing ||
                  (isWalletPayment && !!insufficientWalletBalance) ||
                  (isInsurancePayment && !canPayFromInsurance)
                }
              >
                {(walletPaymentProcessing || insurancePaymentProcessing) ? t('common.processing') : t('billing.record_payment')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
