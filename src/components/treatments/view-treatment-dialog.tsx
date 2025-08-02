
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
import { format } from 'date-fns';

interface ViewTreatmentDialogProps {
  treatment: Treatment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewTreatmentDialog({ treatment, open, onOpenChange }: ViewTreatmentDialogProps) {
  if (!treatment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Treatment Details: {treatment.id}</DialogTitle>
          <DialogDescription>
            On {new Date(treatment.date).toLocaleDateString()} for {treatment.patient}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-6 text-sm">
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
                    <h4 className="font-semibold">Cost</h4>
                    <p className="text-muted-foreground">{treatment.cost}</p>
                </div>
            </div>
             <div>
                <h4 className="font-semibold">Notes</h4>
                <p className="text-muted-foreground p-2 border rounded-md bg-secondary/50 min-h-[60px]">{treatment.notes || 'No notes for this plan.'}</p>
            </div>
             <div>
                <h4 className="font-semibold">Scheduled Appointments</h4>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground space-y-2">
                    {treatment.appointments.map((appt, index) => (
                         <li key={index}>
                            <div className="flex items-center gap-2">
                                <span>{format(new Date(appt.date), 'PPP')} at {appt.time} ({appt.duration})</span>
                                <Badge variant={
                                  appt.status === 'Cancelled' ? 'destructive' :
                                  appt.status === 'Completed' ? 'default' :
                                  'secondary'
                                } className={cn(
                                    "h-5 text-xs capitalize",
                                    appt.status === 'Completed' && 'bg-green-100 text-green-800'
                                )}>
                                    {appt.status}
                                </Badge>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
