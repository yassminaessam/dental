
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
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { PatientWallet } from './patient-wallet';
import { MedicalAlerts } from './medical-alerts';
import { PatientFamily } from './patient-family';
import { PatientProfilePhoto } from './patient-profile-photo';

interface ViewPatientDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPatientDialog({ patient, open, onOpenChange }: ViewPatientDialogProps) {
  const { t, isRTL } = useLanguage();
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'sm:max-w-3xl max-h-[90vh] overflow-y-auto elite-dialog-content text-right' : 'sm:max-w-3xl max-h-[90vh] overflow-y-auto elite-dialog-content'}>
        <DialogHeader className={isRTL ? 'elite-dialog-header text-right items-end' : 'elite-dialog-header'}>
          <div className={isRTL ? 'flex flex-row-reverse items-center gap-4' : 'flex items-center gap-4'}>
            <PatientProfilePhoto
              patientId={patient.id}
              patientName={`${patient.name} ${patient.lastName}`}
              currentPhotoUrl={patient.profilePhotoUrl}
              size="lg"
              editable={false}
            />
            <div className="flex-1">
              <DialogTitle className={isRTL ? 'elite-dialog-title flex flex-row-reverse items-center gap-2 justify-end text-right' : 'elite-dialog-title'}>{`${patient.name} ${patient.lastName}`}</DialogTitle>
              <DialogDescription asChild>
                <div className={isRTL ? 'flex flex-row-reverse items-center gap-4 mt-3 justify-end' : 'flex items-center gap-4 mt-3'}>
                  <div className={isRTL ? 'flex flex-row-reverse items-center gap-2 px-3 py-1 rounded-lg bg-muted/50 backdrop-blur-sm' : 'flex items-center gap-2 px-3 py-1 rounded-lg bg-muted/50 backdrop-blur-sm'}>
                    <span className="text-sm font-medium text-muted-foreground">{t('patients.patient_id')}:</span>
                    <span className="font-mono text-sm font-bold">{patient.id}</span>
                  </div>
                  <div className={isRTL ? 'flex flex-row-reverse items-center gap-2' : 'flex items-center gap-2'}>
                    <span className="text-sm font-medium text-muted-foreground">{t('common.status')}:</span>
                    <Badge 
                      variant={patient.status === 'Active' ? 'default' : 'secondary'}
                      className={`elite-status-badge ${patient.status === 'Active' ? 'elite-status-active' : 'elite-status-inactive'}`}
                    >
                      {t(patient.status === 'Active' ? 'common.active' : 'common.inactive')}
                    </Badge>
                  </div>
                </div>
              </DialogDescription>
            </div>
          </div>
          
          {/* Medical Alerts Banner */}
          {((patient.allergies && patient.allergies.length > 0) || (patient.medicalHistory && patient.medicalHistory.length > 0)) && (
            <div className="mt-4">
              <MedicalAlerts
                allergies={patient.allergies || []}
                bloodType={patient.bloodType}
                medicalHistory={patient.medicalHistory || []}
              />
            </div>
          )}
        </DialogHeader>
        <div className={isRTL ? 'grid gap-6 text-sm text-right' : 'grid gap-6 text-sm'}>
          
          <div className="elite-dialog-section">
            <div className={isRTL ? 'flex flex-row-reverse items-center gap-2 mb-4 justify-end text-right' : 'flex items-center gap-2 mb-4'}>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" />
              <h4 className="font-bold text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('patients.personal_information')}
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('patients.email')}</h5>
                <p className="font-medium text-foreground bg-background/50 p-3 rounded-lg border border-border/20">{patient.email}</p>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('patients.phone')}</h5>
                <p className="font-medium text-foreground bg-background/50 p-3 rounded-lg border border-border/20">
                  <span dir="ltr" className={cn(isRTL ? 'inline-block text-left' : undefined)}>
                    {patient.phone || t('common.na')}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('patients.date_of_birth')}</h5>
                <p className="font-medium text-foreground bg-background/50 p-3 rounded-lg border border-border/20">
                  {format(patient.dob, 'PPP')} ({t('patients.years_old', { age: patient.age })})
                </p>
              </div>
              <div className="space-y-2">
                <h5 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{t('patients.address')}</h5>
                <p className="font-medium text-foreground bg-background/50 p-3 rounded-lg border border-border/20">
                  {patient.address || t('common.na')}
                </p>
              </div>
            </div>
          </div>

            <div className={isRTL ? 'text-right' : undefined}>
          <h4 className={isRTL ? 'font-semibold text-base mb-2 flex flex-row-reverse items-center justify-end' : 'font-semibold text-base mb-2'}>{t('patients.emergency_contact')}</h4>
             <div className="grid grid-cols-3 gap-4 border p-4 rounded-lg">
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.ec_name')}</h5>
        <p>{patient.ecName || t('common.na')}</p>
                </div>
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.ec_phone')}</h5>
        <p>
          <span dir="ltr" className={cn(isRTL ? 'inline-block text-left' : undefined)}>
            {patient.ecPhone || t('common.na')}
          </span>
        </p>
                </div>
                <div>
        <h5 className="font-medium text-muted-foreground">{t('patients.relationship')}</h5>
        <p className="capitalize">{patient.ecRelationship ? t(`patients.relationship.${patient.ecRelationship}`) : t('common.na')}</p>
                </div>
            </div>
          </div>
          
           <div className={isRTL ? 'text-right' : undefined}>
         <h4 className={isRTL ? 'font-semibold text-base mb-2 flex flex-row-reverse items-center justify-end' : 'font-semibold text-base mb-2'}>{t('patients.insurance_information')}</h4>
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

            <div className={isRTL ? 'text-right' : undefined}>
          <h4 className={isRTL ? 'font-semibold text-base mb-2 flex flex-row-reverse items-center justify-end' : 'font-semibold text-base mb-2'}>{t('patients.medical_history')}</h4>
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

          {/* Patient Wallet Section */}
          <div className={isRTL ? 'text-right' : undefined}>
            <PatientWallet
              patientId={patient.id}
              patientName={patient.name}
              patientPhone={patient.phone || undefined}
              patientEmail={patient.email || undefined}
              compact={true}
            />
          </div>

          {/* Patient Family Section */}
          <div className={isRTL ? 'text-right' : undefined}>
            <PatientFamily
              patientId={patient.id}
              patientName={`${patient.name} ${patient.lastName}`}
              familyMembers={patient.familyMembers || []}
              compact={true}
            />
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
