
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Referral } from '@/app/referrals/page';
import { Badge } from '../ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface ViewReferralDialogProps {
  referral: Referral | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewReferralDialog({ referral, open, onOpenChange }: ViewReferralDialogProps) {
  if (!referral) return null;
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('referrals.details.title')} (ID: {referral.id})</DialogTitle>
          <DialogDescription>
            {t('referrals.details.to_for', { specialist: referral.specialist, specialty: referral.specialty, patient: referral.patient })}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex gap-2">
                <Badge variant={referral.urgency === 'urgent' ? 'destructive' : 'outline'} className="capitalize">
                    {referral.urgency === 'routine' && t('referrals.urgency.routine')}
                    {referral.urgency === 'urgent' && t('referrals.urgency.urgent')}
                    {referral.urgency === 'emergency' && t('referrals.urgency.emergency')}
                </Badge>
                 <Badge variant="secondary" className="capitalize">
                    {referral.status === 'scheduled' && t('referrals.scheduled')}
                    {referral.status === 'completed' && t('common.completed')}
                    {referral.status === 'pending' && t('common.pending')}
                    {referral.status === 'cancelled' && t('common.cancelled')}
                </Badge>
            </div>
             <div>
                <h4 className="font-semibold text-sm">{t('referrals.details.reason')}</h4>
                <p className="p-4 bg-secondary/50 rounded-md border text-sm mt-2">
                    {referral.reason}
                </p>
            </div>
            <div>
                <h4 className="font-semibold text-sm">{t('referrals.details.dates')}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('referrals.details.referred_on', { date: referral.date })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    {referral.apptDate ? t('referrals.details.appointment_date', { date: referral.apptDate }) : t('referrals.details.not_scheduled')}
                </p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
