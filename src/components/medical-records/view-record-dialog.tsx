
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { MedicalRecord } from '@/app/medical-records/page';
import { Badge } from '../ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface ViewRecordDialogProps {
  record: MedicalRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewRecordDialog({ record, open, onOpenChange }: ViewRecordDialogProps) {
  if (!record) return null;
  const { t, isRTL } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('medical_records.record_details_id', { id: record.id })}</DialogTitle>
          <DialogDescription>
            {t('medical_records.for_patient_on_date', { patient: record.patient, date: record.date })}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">{t('common.patient')}</h4>
              <p className="text-muted-foreground">{record.patient}</p>
            </div>
            <div>
              <h4 className="font-semibold">{t('medical_records.provider')}</h4>
              <p className="text-muted-foreground">{record.provider}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <h4 className="font-semibold">{t('medical_records.record_type')}</h4>
              <p className="text-muted-foreground">{record.type}</p>
            </div>
            <div>
              <h4 className="font-semibold">{t('common.status')}</h4>
              <div>
                <Badge variant={record.status === 'Draft' ? 'secondary' : 'outline'}>{record.status === 'Draft' ? t('medical_records.status_draft') : t('medical_records.status_final')}</Badge>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">{t('medical_records.chief_complaint')}</h4>
            <p className="text-muted-foreground">{record.complaint || t('common.na')}</p>
          </div>
           <div>
            <h4 className="font-semibold">{t('medical_records.notes')}</h4>
            <p className="text-muted-foreground p-4 bg-secondary/50 rounded-md border mt-1">
                {record.notes || ''}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
