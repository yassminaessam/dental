
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Treatment } from '@/app/treatments/page';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { FileText, DollarSign, Shield } from 'lucide-react';
import { getCollection } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';

interface ViewTreatmentDialogProps {
  treatment: Treatment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Invoice = {
  id: string;
  patient: string;
  treatmentId?: string;
  totalAmount: number;
  amountPaid: number;
  status: string;
  issueDate: string;
};

type InsuranceClaim = {
  id: string;
  patient: string;
  procedure: string;
  amount: string;
  approvedAmount: string | null;
  status: string;
  submitDate: string;
};

export function ViewTreatmentDialog({ treatment, open, onOpenChange }: ViewTreatmentDialogProps) {
  const [relatedInvoice, setRelatedInvoice] = React.useState<Invoice | null>(null);
  const [relatedClaim, setRelatedClaim] = React.useState<InsuranceClaim | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (treatment && open) {
      setLoading(true);
      Promise.all([
        getCollection<Invoice>('invoices'),
        getCollection<InsuranceClaim>('insurance-claims')
      ]).then(([invoices, claims]) => {
        const invoice = invoices.find(inv => inv.treatmentId === treatment.id);
        const claim = claims.find(c => 
          c.patient === treatment.patient && 
          c.procedure === treatment.procedure
        );
        setRelatedInvoice(invoice || null);
        setRelatedClaim(claim || null);
      }).catch(() => {
        toast({ title: 'Error loading billing information', variant: 'destructive' });
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [treatment, open, toast]);

  if (!treatment) return null;

  const canCreateInvoice = treatment.status === 'Completed' && !relatedInvoice;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Treatment Details: {treatment.id}</DialogTitle>
          <DialogDescription>
            On {new Date(treatment.date).toLocaleDateString()} for {treatment.patient}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-6 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold">Patient</h4>
                <p className="text-muted-foreground">{treatment.patient}</p>
            </div>
             <div>
                <h4 className="font-semibold">Doctor</h4>
                <p className="text-muted-foreground">{treatment.doctor}</p>
            </div>
          </div>
           <div>
                <h4 className="font-semibold">Procedure</h4>
                <p className="text-muted-foreground">{treatment.procedure}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <h4 className="font-semibold">Cost</h4>
                    <p className="text-muted-foreground">{treatment.cost}</p>
                </div>
                 <div>
                    <h4 className="font-semibold">Overall Status</h4>
                    <div>
                        <Badge variant={
                            treatment.status === 'Completed' ? 'default' :
                            'secondary'
                            } className={cn(
                                'capitalize',
                                treatment.status === 'Completed' && 'bg-green-100 text-green-800'
                            )}>
                            {treatment.status}
                        </Badge>
                    </div>
                </div>
            </div>

             {/* Billing Information Section */}
             <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Billing Information
                </h4>
                
                {loading ? (
                  <p className="text-muted-foreground">Loading billing information...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Invoice Information */}
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Invoice Status
                      </h5>
                      {relatedInvoice ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Invoice ID:</span>
                            <span className="text-sm font-medium">{relatedInvoice.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total:</span>
                            <span className="text-sm">EGP {relatedInvoice.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Paid:</span>
                            <span className="text-sm">EGP {relatedInvoice.amountPaid.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Badge variant={
                              relatedInvoice.status === 'Paid' ? 'default' :
                              relatedInvoice.status === 'Overdue' ? 'destructive' : 'secondary'
                            } className={cn(
                              'text-xs',
                              relatedInvoice.status === 'Paid' && 'bg-green-100 text-green-800'
                            )}>
                              {relatedInvoice.status}
                            </Badge>
                          </div>
                        </div>
                      ) : canCreateInvoice ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            No invoice created yet
                          </p>
                          <Button size="sm" variant="outline">
                            <FileText className="mr-2 h-3 w-3" />
                            Create Invoice
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Invoice will be available when treatment is completed
                        </p>
                      )}
                    </div>

                    {/* Insurance Information */}
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Insurance Claim
                      </h5>
                      {relatedClaim ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Claim Amount:</span>
                            <span className="text-sm">{relatedClaim.amount}</span>
                          </div>
                          {relatedClaim.approvedAmount && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Approved:</span>
                              <span className="text-sm text-green-600 font-medium">
                                {relatedClaim.approvedAmount}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Badge variant={
                              relatedClaim.status === 'Approved' ? 'default' :
                              relatedClaim.status === 'Denied' ? 'destructive' : 'secondary'
                            } className={cn(
                              'text-xs',
                              relatedClaim.status === 'Approved' && 'bg-green-100 text-green-800'
                            )}>
                              {relatedClaim.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Submit Date:</span>
                            <span className="text-sm">{relatedClaim.submitDate}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No insurance claim found for this treatment
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

             <div>
                <h4 className="font-semibold">Notes</h4>
                <p className="text-muted-foreground p-2 border rounded-md bg-secondary/50 min-h-[60px]">{treatment.notes || 'No notes for this plan.'}</p>
            </div>
             <div>
                <h4 className="font-semibold">Scheduled Appointments</h4>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground space-y-2">
                    {treatment.appointments.map((appt, index) => (
                         <li key={index}>
                            <div className="flex items-center gap-2">
                                <span>{format(new Date(appt.date), 'PPP')} at {appt.time} ({appt.duration})</span>
                                <Badge variant={
                                  appt.status === 'Cancelled' ? 'destructive' :
                                  appt.status === 'Completed' ? 'default' :
                                  'secondary'
                                } className={cn(
                                    "h-5 text-xs capitalize",
                                    appt.status === 'Completed' && 'bg-green-100 text-green-800'
                                )}>
                                    {appt.status}
                                </Badge>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
