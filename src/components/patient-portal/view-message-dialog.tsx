
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PatientMessage } from '@/app/patient-portal/page';
import { Badge } from '../ui/badge';

interface ViewMessageDialogProps {
  message: PatientMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewMessageDialog({ message, open, onOpenChange }: ViewMessageDialogProps) {
  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{message.subject}</DialogTitle>
          <DialogDescription>
            From: {message.patient} | Dated: {message.date}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex gap-2">
                <Badge variant="outline" className="capitalize">{message.category}</Badge>
                <Badge variant={message.priority === 'high' ? 'destructive' : 'secondary'} className="capitalize">
                    {message.priority} Priority
                </Badge>
            </div>
            <div className="p-4 bg-secondary/50 rounded-md border text-sm">
                {message.fullMessage}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
