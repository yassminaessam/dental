
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

interface ViewRecordDialogProps {
  record: MedicalRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewRecordDialog({ record, open, onOpenChange }: ViewRecordDialogProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Record Details: {record.id}</DialogTitle>
          <DialogDescription>
            For {record.patient} on {record.date}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">Patient</h4>
              <p className="text-muted-foreground">{record.patient}</p>
            </div>
            <div>
              <h4 className="font-semibold">Provider</h4>
              <p className="text-muted-foreground">{record.provider}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <h4 className="font-semibold">Record Type</h4>
              <p className="text-muted-foreground">{record.type}</p>
            </div>
            <div>
              <h4 className="font-semibold">Status</h4>
              <div>
                <Badge variant={record.status === 'Draft' ? 'secondary' : 'outline'}>{record.status}</Badge>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Chief Complaint</h4>
            <p className="text-muted-foreground">{record.complaint || 'N/A'}</p>
          </div>
           <div>
            <h4 className="font-semibold">Notes</h4>
            <p className="text-muted-foreground p-4 bg-secondary/50 rounded-md border mt-1">
                Subjective: Patient reports sharp pain in upper right quadrant, worse with cold stimuli.
                <br />
                Objective: Visual inspection reveals a fracture on tooth #14.
                <br />
                Assessment: Cracked tooth syndrome.
                <br />
                Plan: Recommended crown placement. Patient agrees to proceed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
