
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
import { useLanguage } from '@/contexts/LanguageContext';

interface ViewPrescriptionDialogProps {
  prescription: Prescription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPrescriptionDialog({ prescription, open, onOpenChange }: ViewPrescriptionDialogProps) {
  const { t } = useLanguage();
  if (!prescription) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('pharmacy.prescription_details')}: {prescription.id}</DialogTitle>
          <DialogDescription>
            {t('pharmacy.prescribed_by_on', { doctor: prescription.doctor, date: prescription.date })}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">{t('common.patient')}</h4>
              <p className="text-muted-foreground">{prescription.patient}</p>
            </div>
            <div>
              <h4 className="font-semibold">{t('common.doctor')}</h4>
              <p className="text-muted-foreground">{prescription.doctor}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">{t('pharmacy.medication')}</h4>
            <p className="text-muted-foreground">{prescription.medication} ({prescription.strength})</p>
          </div>
          <div>
            <h4 className="font-semibold">{t('pharmacy.instructions')}</h4>
            <p className="text-muted-foreground">{prescription.dosage}</p>
            <p className="text-xs text-muted-foreground">{prescription.duration}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">{t('pharmacy.refills')}</h4>
              <p className="text-muted-foreground">{prescription.refills}</p>
            </div>
            <div>
              <h4 className="font-semibold">{t('common.status')}</h4>
              <div>
                <Badge
                    variant={prescription.status === 'Active' ? 'default' : 'outline'}
                    className={cn(
                        prescription.status === 'Active' && 'bg-foreground text-background hover:bg-foreground/80',
                        prescription.status === 'Completed' && 'bg-green-100 text-green-800 border-transparent'
                    )}
                    >
                    {prescription.status === 'Active' ? <Clock className="mr-1 h-3 w-3" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {prescription.status === 'Active' ? t('common.active') : t('common.completed')}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
