
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Claim } from '@/app/insurance/page';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface ViewClaimDialogProps {
  claim: Claim | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewClaimDialog({ claim, open, onOpenChange }: ViewClaimDialogProps) {
  if (!claim) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Claim Details: {claim.id}</DialogTitle>
          <DialogDescription>
            Submitted on {claim.submitDate}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold">Patient</h4>
                <p className="text-muted-foreground">{claim.patient}</p>
                <p className="text-xs text-muted-foreground">{claim.patientId}</p>
            </div>
             <div>
                <h4 className="font-semibold">Insurance Provider</h4>
                <p className="text-muted-foreground">{claim.insurance}</p>
            </div>
          </div>
           <div>
                <h4 className="font-semibold">Procedure</h4>
                <p className="text-muted-foreground">{claim.procedure}</p>
                <p className="text-xs text-muted-foreground">Code: {claim.procedureCode}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <h4 className="font-semibold">Submitted Amount</h4>
                    <p className="text-muted-foreground">{claim.amount}</p>
                </div>
                {claim.approvedAmount && (
                    <div>
                        <h4 className="font-semibold text-green-600">Approved Amount</h4>
                        <p className="text-muted-foreground">{claim.approvedAmount}</p>
                    </div>
                )}
            </div>
            <div>
                 <h4 className="font-semibold">Status</h4>
                <div className="flex items-center gap-2 mt-1">
                    <Badge
                        variant={
                        claim.status === "Approved" ? "default" : 
                        claim.status === "Denied" ? "destructive" : "outline"
                        }
                        className={cn(
                        "capitalize",
                        claim.status === 'Approved' && 'bg-foreground text-background hover:bg-foreground/80',
                        claim.status === 'Denied' && 'bg-red-600 text-white border-transparent hover:bg-red-600/80',
                        )}
                    >
                        {claim.status === 'Approved' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {claim.status === 'Processing' && <Clock className="mr-1 h-3 w-3" />}
                        {claim.status === 'Denied' && <XCircle className="mr-1 h-3 w-3" />}
                        {claim.status}
                    </Badge>
                     {claim.statusReason && (
                        <p className="text-xs text-red-600">{claim.statusReason}</p>
                    )}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
