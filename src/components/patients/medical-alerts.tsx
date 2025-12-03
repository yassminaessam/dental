'use client';

import * as React from 'react';
import { AlertTriangle, AlertCircle, Pill, Droplets, Heart, Shield, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MedicalAlertsProps {
  allergies?: string[];
  medicalHistory?: Array<{ condition: string; notes?: string }>;
  bloodType?: string;
  compact?: boolean;
  className?: string;
}

export function MedicalAlerts({ 
  allergies = [], 
  medicalHistory = [], 
  bloodType,
  compact = false,
  className 
}: MedicalAlertsProps) {
  const { t } = useLanguage();
  
  const hasAllergies = allergies && allergies.length > 0;
  const hasConditions = medicalHistory && medicalHistory.length > 0;
  const hasAlerts = hasAllergies || hasConditions;

  if (!hasAlerts && !bloodType) {
    return null;
  }

  // Compact mode for table rows
  if (compact) {
    return (
      <TooltipProvider>
        <div className={cn("flex items-center gap-1", className)}>
          {hasAllergies && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="destructive" 
                  className="px-1.5 py-0.5 text-xs font-medium animate-pulse cursor-help"
                >
                  <AlertTriangle className="h-3 w-3 mr-0.5" />
                  {allergies.length}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {t('patients.allergies')}
                  </p>
                  <ul className="list-disc list-inside text-sm">
                    {allergies.map((allergy, i) => (
                      <li key={i}>{allergy}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
          
          {hasConditions && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="secondary" 
                  className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 cursor-help"
                >
                  <Heart className="h-3 w-3 mr-0.5" />
                  {medicalHistory.length}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {t('patients.medical_conditions')}
                  </p>
                  <ul className="list-disc list-inside text-sm">
                    {medicalHistory.map((item, i) => (
                      <li key={i}>{item.condition}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
          
          {bloodType && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="px-1.5 py-0.5 text-xs font-bold bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 cursor-help"
                >
                  <Droplets className="h-3 w-3 mr-0.5" />
                  {bloodType}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-sm">
                  {t('patients.blood_type')}: <strong>{bloodType}</strong>
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  }

  // Full display mode for patient details
  return (
    <div className={cn("space-y-4", className)}>
      {/* Allergies Alert Banner */}
      {hasAllergies && (
        <div className="rounded-lg border-2 border-red-300 dark:border-red-800 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-200 dark:bg-red-900/50">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t('patients.allergy_alert')}
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {allergies.map((allergy, index) => (
                  <Badge 
                    key={index} 
                    variant="destructive" 
                    className="px-3 py-1 text-sm font-semibold bg-red-600 hover:bg-red-700"
                  >
                    <Pill className="h-3 w-3 mr-1" />
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blood Type */}
      {bloodType && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border border-red-200 dark:border-red-800">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50">
            <Droplets className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('patients.blood_type')}</p>
            <p className="text-xl font-bold text-red-700 dark:text-red-400">{bloodType}</p>
          </div>
        </div>
      )}

      {/* Medical Conditions */}
      {hasConditions && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-200 dark:bg-amber-900/50">
              <Heart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {t('patients.medical_conditions')}
              </h4>
              <ul className="mt-2 space-y-2">
                {medicalHistory.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">{item.condition}</span>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-0.5">{item.notes}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline alert badge for appointment booking and other contexts
export function MedicalAlertBadge({ 
  allergies = [], 
  medicalHistory = [] 
}: { 
  allergies?: string[]; 
  medicalHistory?: Array<{ condition: string }> 
}) {
  const { t } = useLanguage();
  const hasAlerts = (allergies && allergies.length > 0) || (medicalHistory && medicalHistory.length > 0);
  
  if (!hasAlerts) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="destructive" 
            className="ml-2 animate-pulse cursor-help"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t('patients.medical_alert')}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm">
          <div className="space-y-2">
            {allergies && allergies.length > 0 && (
              <div>
                <p className="font-semibold text-red-500">{t('patients.allergies')}:</p>
                <p className="text-sm">{allergies.join(', ')}</p>
              </div>
            )}
            {medicalHistory && medicalHistory.length > 0 && (
              <div>
                <p className="font-semibold text-amber-500">{t('patients.medical_conditions')}:</p>
                <p className="text-sm">{medicalHistory.map(m => m.condition).join(', ')}</p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
