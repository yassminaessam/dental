
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Patient } from '@/app/patients/page';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface ViewPatientDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPatientDialog({ patient, open, onOpenChange }: ViewPatientDialogProps) {
  const { t } = useLanguage();
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{`${patient.name} ${patient.lastName}`}</DialogTitle>
    <DialogDescription asChild>
      <div>
        {t('patients.patient_id')}: {patient.id} | {t('common.status')}: <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'}>{t(patient.status === 'Active' ? 'common.active' : 'common.inactive')}</Badge>
      </div>
    </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-6 text-sm">
          
          <div>
      <h4 className="font-semibold text-base mb-2">{t('patients.personal_information')}</h4>
            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.email')}</h5>
                    <p>{patient.email}</p>
                </div>
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.phone')}</h5>
                    <p>{patient.phone}</p>
                </div>
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.date_of_birth')}</h5>
        <p>{format(patient.dob, 'PPP')} ({t('patients.years_old', { age: patient.age })})</p>
                </div>
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.address')}</h5>
        <p>{patient.address || t('common.na')}</p>
                </div>
            </div>
          </div>

          <div>
      <h4 className="font-semibold text-base mb-2">{t('patients.emergency_contact')}</h4>
             <div className="grid grid-cols-3 gap-4 border p-4 rounded-lg">
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.ec_name')}</h5>
        <p>{patient.ecName || t('common.na')}</p>
                </div>
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.ec_phone')}</h5>
        <p>{patient.ecPhone || t('common.na')}</p>
                </div>
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.relationship')}</h5>
        <p className="capitalize">{patient.ecRelationship ? t(`patients.relationship.${patient.ecRelationship}`) : t('common.na')}</p>
                </div>
            </div>
          </div>
          
           <div>
      <h4 className="font-semibold text-base mb-2">{t('patients.insurance_information')}</h4>
             <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.insurance_provider')}</h5>
        <p>{patient.insuranceProvider || t('common.na')}</p>
                </div>
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.policy_number')}</h5>
        <p>{patient.policyNumber || t('common.na')}</p>
                </div>
            </div>
          </div>

          <div>
      <h4 className="font-semibold text-base mb-2">{t('patients.medical_history')}</h4>
             <div className="border p-4 rounded-lg">
                {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                    <ul className="list-disc list-inside">
                        {patient.medicalHistory.map((item, index) => (
                            <li key={index}>{item.condition}</li>
                        ))}
                    </ul>
                ) : (
        <p className="text-muted-foreground">{t('patients.no_conditions_reported')}</p>
                )}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
