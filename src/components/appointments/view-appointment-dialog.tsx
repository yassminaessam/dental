
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
      <DialogContent className="sm:max-w-2xl elite-dialog-content">
        <DialogHeader className="elite-dialog-header">
          <DialogTitle className="elite-dialog-title">{t('appointments.appointment_details')}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-3 px-3 py-1 rounded-lg bg-muted/50 backdrop-blur-sm w-fit">
              <span className="text-sm font-medium text-muted-foreground">{t('common.id')}:</span>
              <span className="font-mono text-sm font-bold">{appointment.id}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 text-sm">
          <div className="elite-dialog-section">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" />
              <h4 className="font-bold text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Appointment Information
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('common.patient')}</h5>
                <p className="font-medium text-foreground bg-background/50 p-3 rounded-lg border border-border/20">{appointment.patient}</p>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('appointments.doctor')}</h5>
                <p className="font-medium text-foreground bg-background/50 p-3 rounded-lg border border-border/20">{appointment.doctor}</p>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('appointments.appointment_dates')}</h5>
                <p className="font-medium text-foreground bg-background/50 p-3 rounded-lg border border-border/20">{appointment.dateTime.toLocaleString(language)}</p>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('appointments.duration')}</h5>
                <p className="font-medium text-foreground bg-background/50 p-3 rounded-lg border border-border/20">{appointment.duration}</p>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('appointments.type')}</h5>
                <p className="font-medium text-foreground bg-background/50 p-3 rounded-lg border border-border/20">{appointment.type}</p>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('appointments.status')}</h5>
                <div className="p-3 rounded-lg border border-border/20 bg-background/50">
                  <Badge 
                    variant={appointment.status === 'Cancelled' ? 'destructive' : 'default'}
                    className={`elite-status-badge ${
                      appointment.status === 'Cancelled' ? 'elite-status-inactive' :
                      appointment.status === 'Pending' ? 'elite-status-pending' :
                      'elite-status-active'
                    }`}
                  >
                    {t(`common.${appointment.status.toLowerCase()}`)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
