'use client';

import * as React from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Loader2, Plus, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

interface AddBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
  insuranceProvider: string;
  policyNumber?: string;
  onAddBalance: (data: {
    patientId: string;
    patientName: string;
    insuranceProvider: string;
    amount: number;
    notes: string;
  }) => Promise<void>;
}

export function AddBalanceDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  insuranceProvider,
  policyNumber,
  onAddBalance,
}: AddBalanceDialogProps) {
  const { t, isRTL } = useLanguage();
  const [amount, setAmount] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setAmount('');
      setNotes('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t('insurance.error_invalid_amount') || 'Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddBalance({
        patientId,
        patientName,
        insuranceProvider,
        amount: amountNum,
        notes: notes || `Insurance balance added for ${patientName}`,
      });
      onOpenChange(false);
    } catch (err) {
      setError(t('insurance.error_adding_balance') || 'Failed to add balance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            {t('insurance.add_balance')}
          </DialogTitle>
          <DialogDescription>
            {t('insurance.add_balance_desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Patient & Insurance Info */}
            <div className="grid gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.patient')}</p>
                  <p className="font-medium">{patientName}</p>
                </div>
                <Badge variant="outline" className="bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300">
                  <Shield className="h-3 w-3 mr-1" />
                  {insuranceProvider}
                </Badge>
              </div>
              {policyNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('patients.policy_number')}</p>
                  <p className="font-medium">{policyNumber}</p>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="balanceAmount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('insurance.balance_amount')} *
              </Label>
              <div className="relative">
                <span className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium",
                  isRTL ? 'right-3' : 'left-3'
                )}>
                  EGP
                </span>
                <Input
                  id="balanceAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  className={cn(
                    "text-lg font-medium",
                    isRTL ? 'pr-14 pl-4' : 'pl-14 pr-4'
                  )}
                  placeholder="0.00"
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="balanceNotes">
                {t('common.notes')} ({t('common.optional')})
              </Label>
              <Textarea
                id="balanceNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('insurance.balance_notes_placeholder')}
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            {/* Preview */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t('insurance.will_add_balance')}: <span className="font-bold">EGP {parseFloat(amount).toFixed(2)}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('insurance.balance_auto_approved')}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !amount}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <Plus className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('insurance.add_balance')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
