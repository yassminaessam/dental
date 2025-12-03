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
import { CheckCircle2, DollarSign, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEGP } from '@/lib/currency';

interface ApproveClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimId: string;
  patientName: string;
  procedure: string;
  claimAmount: string;
  onApprove: (claimId: string, approvedAmount: number) => Promise<void>;
}

export function ApproveClaimDialog({
  open,
  onOpenChange,
  claimId,
  patientName,
  procedure,
  claimAmount,
  onApprove,
}: ApproveClaimDialogProps) {
  const { t, language, isRTL } = useLanguage();
  const [approvedAmount, setApprovedAmount] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  // Parse the original claim amount for validation
  const originalAmount = React.useMemo(() => {
    const numericValue = claimAmount.replace(/[^\d.]/g, '');
    return parseFloat(numericValue) || 0;
  }, [claimAmount]);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      // Pre-fill with the claim amount as suggestion
      setApprovedAmount(originalAmount.toString());
      setError('');
    }
  }, [open, originalAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(approvedAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError(t('insurance.error_invalid_amount') || 'Please enter a valid amount');
      return;
    }

    if (amount > originalAmount) {
      setError(t('insurance.error_exceeds_claim') || 'Approved amount cannot exceed claim amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await onApprove(claimId, amount);
      onOpenChange(false);
    } catch (err) {
      setError(t('insurance.error_approving') || 'Failed to approve claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t('insurance.approve_claim')}
          </DialogTitle>
          <DialogDescription>
            {t('insurance.approve_claim_desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Claim Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('insurance.patient')}</p>
                <p className="font-medium">{patientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('insurance.procedure')}</p>
                <p className="font-medium">{procedure}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">{t('insurance.claim_amount')}</p>
                <p className="font-bold text-lg">{claimAmount}</p>
              </div>
            </div>

            {/* Approved Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="approvedAmount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('insurance.approved_amount')}
              </Label>
              <div className="relative">
                <span className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium",
                  isRTL ? 'right-3' : 'left-3'
                )}>
                  EGP
                </span>
                <Input
                  id="approvedAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={originalAmount}
                  value={approvedAmount}
                  onChange={(e) => {
                    setApprovedAmount(e.target.value);
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
              <p className="text-xs text-muted-foreground">
                {t('insurance.max_amount')}: {formatEGP(originalAmount, true, language)}
              </p>
            </div>

            {/* Amount Preview */}
            {approvedAmount && parseFloat(approvedAmount) > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t('insurance.will_approve')}: <span className="font-bold">{formatEGP(parseFloat(approvedAmount), true, language)}</span>
                </p>
                {parseFloat(approvedAmount) < originalAmount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('insurance.partial_approval')}: {formatEGP(originalAmount - parseFloat(approvedAmount), true, language)} {t('insurance.not_covered')}
                  </p>
                )}
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
              disabled={isSubmitting || !approvedAmount}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <CheckCircle2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('insurance.approve')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
