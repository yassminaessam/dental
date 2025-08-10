
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { StaffMember } from '@/app/staff/page';
import { Badge } from '../ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface ViewEmployeeDialogProps {
  staffMember: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewEmployeeDialog({ staffMember, open, onOpenChange }: ViewEmployeeDialogProps) {
  const { t } = useLanguage();
  if (!staffMember) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{staffMember.name}</DialogTitle>
          <DialogDescription>
            {staffMember.role} | {t('staff.id')}: {staffMember.id}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">{t('staff.email')}</h4>
              <p className="text-muted-foreground">{staffMember.email}</p>
            </div>
            <div>
              <h4 className="font-semibold">{t('staff.phone')}</h4>
              <p className="text-muted-foreground">{staffMember.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">{t('staff.schedule')}</h4>
              <p className="text-muted-foreground">{staffMember.schedule}</p>
            </div>
            <div>
              <h4 className="font-semibold">{t('staff.salary')}</h4>
              <p className="text-muted-foreground">{staffMember.salary}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">{t('staff.hire_date')}</h4>
              <p className="text-muted-foreground">{staffMember.hireDate}</p>
            </div>
            <div>
              <h4 className="font-semibold">{t('staff.status')}</h4>
              <div>
                <Badge variant={staffMember.status === 'Active' ? 'default' : 'secondary'}>
                  {t(`staff.status_${staffMember.status.toLowerCase()}`)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
