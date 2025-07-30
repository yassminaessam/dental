
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Prescription } from '@/app/pharmacy/page';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock } from 'lucide-react';

interface ViewPrescriptionDialogProps {
  prescription: Prescription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPrescriptionDialog({ prescription, open, onOpenChange }: ViewPrescriptionDialogProps) {
  if (!prescription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Prescription Details: {prescription.id}</DialogTitle>
          <DialogDescription>
            Prescribed by {prescription.doctor} on {prescription.date}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Patient</h4>
              <p className="text-muted-foreground">{prescription.patient}</p>
            </div>
            <div>
              <h4 className="font-semibold">Doctor</h4>
              <p className="text-muted-foreground">{prescription.doctor}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Medication</h4>
            <p className="text-muted-foreground">{prescription.medication} ({prescription.strength})</p>
          </div>
          <div>
            <h4 className="font-semibold">Instructions</h4>
            <p className="text-muted-foreground">{prescription.dosage}</p>
            <p className="text-xs text-muted-foreground">{prescription.duration}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Refills</h4>
              <p className="text-muted-foreground">{prescription.refills}</p>
            </div>
            <div>
              <h4 className="font-semibold">Status</h4>
              <div>
                <Badge
                    variant={prescription.status === 'Active' ? 'default' : 'outline'}
                    className={cn(
                        prescription.status === 'Active' && 'bg-foreground text-background hover:bg-foreground/80',
                        prescription.status === 'Completed' && 'bg-green-100 text-green-800 border-transparent'
                    )}
                    >
                    {prescription.status === 'Active' ? <Clock className="mr-1 h-3 w-3" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {prescription.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
