
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
import { useLanguage } from '@/contexts/LanguageContext';

interface ViewAppointmentDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewAppointmentDialog({ appointment, open, onOpenChange }: ViewAppointmentDialogProps) {
  if (!appointment) return null;
  const { t, language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('appointments.appointment_details')}</DialogTitle>
          <DialogDescription>
            {t('common.na')}: {appointment.id}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold">{t('common.patient')}</h4>
                <p className="text-muted-foreground">{appointment.patient}</p>
            </div>
             <div>
                <h4 className="font-semibold">{t('appointments.doctor')}</h4>
                <p className="text-muted-foreground">{appointment.doctor}</p>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold">{t('appointments.appointment_dates')}</h4>
                <p className="text-muted-foreground">{appointment.dateTime.toLocaleString(language)}</p>
            </div>
             <div>
                <h4 className="font-semibold">{t('appointments.duration')}</h4>
                <p className="text-muted-foreground">{appointment.duration}</p>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <h4 className="font-semibold">{t('appointments.type')}</h4>
                <p className="text-muted-foreground">{appointment.type}</p>
            </div>
            <div>
                <h4 className="font-semibold">{t('appointments.status')}</h4>
                <div><Badge variant={appointment.status === 'Cancelled' ? 'destructive' : 'default'}>{t(`common.${appointment.status.toLowerCase()}`)}</Badge></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
