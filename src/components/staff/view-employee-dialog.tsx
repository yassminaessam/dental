
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

interface ViewEmployeeDialogProps {
  staffMember: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewEmployeeDialog({ staffMember, open, onOpenChange }: ViewEmployeeDialogProps) {
  if (!staffMember) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{staffMember.name}</DialogTitle>
          <DialogDescription>
            {staffMember.role} | ID: {staffMember.id}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Email</h4>
              <p className="text-muted-foreground">{staffMember.email}</p>
            </div>
            <div>
              <h4 className="font-semibold">Phone</h4>
              <p className="text-muted-foreground">{staffMember.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Schedule</h4>
              <p className="text-muted-foreground">{staffMember.schedule}</p>
            </div>
            <div>
              <h4 className="font-semibold">Salary</h4>
              <p className="text-muted-foreground">{staffMember.salary}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Hire Date</h4>
              <p className="text-muted-foreground">{staffMember.hireDate}</p>
            </div>
            <div>
              <h4 className="font-semibold">Status</h4>
              <div>
                <Badge variant={staffMember.status === 'Active' ? 'default' : 'secondary'}>
                  {staffMember.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
