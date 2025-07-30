
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Treatment } from '@/app/treatments/page';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface ViewTreatmentDialogProps {
  treatment: Treatment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewTreatmentDialog({ treatment, open, onOpenChange }: ViewTreatmentDialogProps) {
  if (!treatment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Treatment Details: {treatment.id}</DialogTitle>
          <DialogDescription>
            On {treatment.date} for {treatment.patient}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold">Patient</h4>
                <p className="text-muted-foreground">{treatment.patient}</p>
            </div>
             <div>
                <h4 className="font-semibold">Doctor</h4>
                <p className="text-muted-foreground">{treatment.doctor}</p>
            </div>
          </div>
           <div>
                <h4 className="font-semibold">Procedure</h4>
                <p className="text-muted-foreground">{treatment.procedure}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <h4 className="font-semibold">Tooth</h4>
                    <p className="text-muted-foreground">{treatment.tooth || 'N/A'}</p>
                </div>
                 <div>
                    <h4 className="font-semibold">Cost</h4>
                    <p className="text-muted-foreground">{treatment.cost}</p>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold">Status</h4>
                    <div><Badge variant="outline">{treatment.status}</Badge></div>
                </div>
                 <div>
                    <h4 className="font-semibold">Follow-up Date</h4>
                    <p className="text-muted-foreground">{treatment.followUp || 'N/A'}</p>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
