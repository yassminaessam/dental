
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

interface ViewReferralDialogProps {
  referral: Referral | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewReferralDialog({ referral, open, onOpenChange }: ViewReferralDialogProps) {
  if (!referral) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Referral Details (ID: {referral.id})</DialogTitle>
          <DialogDescription>
            To: {referral.specialist} ({referral.specialty}) | For: {referral.patient}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex gap-2">
                <Badge variant={referral.urgency === 'urgent' ? 'destructive' : 'outline'} className="capitalize">
                    {referral.urgency}
                </Badge>
                 <Badge variant="secondary" className="capitalize">
                    {referral.status}
                </Badge>
            </div>
             <div>
                <h4 className="font-semibold text-sm">Reason for Referral</h4>
                <p className="p-4 bg-secondary/50 rounded-md border text-sm mt-2">
                    {referral.reason}
                </p>
            </div>
            <div>
                <h4 className="font-semibold text-sm">Dates</h4>
                <p className="text-sm text-muted-foreground mt-1">
                    Referred on: {referral.date}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    Appointment Date: {referral.apptDate || 'Not scheduled yet'}
                </p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
