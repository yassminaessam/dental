
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

interface ViewPatientDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPatientDialog({ patient, open, onOpenChange }: ViewPatientDialogProps) {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{`${patient.name} ${patient.lastName}`}</DialogTitle>
          <DialogDescription>
            Patient ID: {patient.id} | Status: <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'}>{patient.status}</Badge>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-6 text-sm">
          
          <div>
            <h4 className="font-semibold text-base mb-2">Personal Information</h4>
            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <div>
                    <h5 className="font-medium text-muted-foreground">Email</h5>
                    <p>{patient.email}</p>
                </div>
                <div>
                    <h5 className="font-medium text-muted-foreground">Phone</h5>
                    <p>{patient.phone}</p>
                </div>
                <div>
                    <h5 className="font-medium text-muted-foreground">Date of Birth</h5>
                    <p>{format(patient.dob, 'PPP')} ({patient.age} years old)</p>
                </div>
                <div>
                    <h5 className="font-medium text-muted-foreground">Address</h5>
                    <p>{patient.address || 'N/A'}</p>
                </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-base mb-2">Emergency Contact</h4>
             <div className="grid grid-cols-3 gap-4 border p-4 rounded-lg">
                <div>
                    <h5 className="font-medium text-muted-foreground">Name</h5>
                    <p>{patient.ecName || 'N/A'}</p>
                </div>
                <div>
                    <h5 className="font-medium text-muted-foreground">Phone</h5>
                    <p>{patient.ecPhone || 'N/A'}</p>
                </div>
                <div>
                    <h5 className="font-medium text-muted-foreground">Relationship</h5>
                    <p className="capitalize">{patient.ecRelationship || 'N/A'}</p>
                </div>
            </div>
          </div>
          
           <div>
            <h4 className="font-semibold text-base mb-2">Insurance</h4>
             <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <div>
                    <h5 className="font-medium text-muted-foreground">Provider</h5>
                    <p>{patient.insuranceProvider || 'N/A'}</p>
                </div>
                <div>
                    <h5 className="font-medium text-muted-foreground">Policy Number</h5>
                    <p>{patient.policyNumber || 'N/A'}</p>
                </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-base mb-2">Medical History</h4>
             <div className="border p-4 rounded-lg">
                {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                    <ul className="list-disc list-inside">
                        {patient.medicalHistory.map((item, index) => (
                            <li key={index}>{item.condition}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">No conditions reported.</p>
                )}
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
