
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Appointment } from '@/app/appointments/page';
import { Badge } from '../ui/badge';

interface ViewAppointmentDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewAppointmentDialog({ appointment, open, onOpenChange }: ViewAppointmentDialogProps) {
  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            ID: {appointment.id}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold">Patient</h4>
                <p className="text-muted-foreground">{appointment.patient}</p>
            </div>
             <div>
                <h4 className="font-semibold">Doctor</h4>
                <p className="text-muted-foreground">{appointment.doctor}</p>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold">Date & Time</h4>
                <p className="text-muted-foreground">{appointment.dateTime.toLocaleString()}</p>
            </div>
             <div>
                <h4 className="font-semibold">Duration</h4>
                <p className="text-muted-foreground">{appointment.duration}</p>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <h4 className="font-semibold">Type</h4>
                <p className="text-muted-foreground">{appointment.type}</p>
            </div>
            <div>
                <h4 className="font-semibold">Status</h4>
                <p><Badge variant={appointment.status === 'Cancelled' ? 'destructive' : 'default'}>{appointment.status}</Badge></p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
