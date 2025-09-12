
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
import { getCollection } from '@/services/database';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

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
  toast({ title: t('billing.toast.error_fetching'), variant: 'destructive' });
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
          <DialogTitle>{t('treatments.title')}: {treatment.id}</DialogTitle>
          <DialogDescription>
            {t('common.date')}: {new Date(treatment.date).toLocaleDateString(locale)} • {t('common.patient')}: {treatment.patient}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-6 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold">{t('common.patient')}</h4>
                <p className="text-muted-foreground">{treatment.patient}</p>
            </div>
             <div>
                <h4 className="font-semibold">{t('common.doctor')}</h4>
                <p className="text-muted-foreground">{treatment.doctor}</p>
            </div>
          </div>
           <div>
                <h4 className="font-semibold">{t('treatments.procedure')}</h4>
                <p className="text-muted-foreground">{treatment.procedure}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <h4 className="font-semibold">{t('common.cost')}</h4>
                    <p className="text-muted-foreground">{treatment.cost}</p>
                </div>
                 <div>
                    <h4 className="font-semibold">{t('common.status')}</h4>
                    <div>
                        <Badge variant={
                            treatment.status === 'Completed' ? 'default' :
                            'secondary'
                            } className={cn(
                                'capitalize',
                                treatment.status === 'Completed' && 'bg-green-100 text-green-800'
                            )}>
                            {t(`treatments.${treatment.status.toLowerCase().replace(' ', '_')}_status`) || treatment.status}
                        </Badge>
                    </div>
                </div>
            </div>

             {/* Billing Information Section */}
             <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t('billing.title')}
                </h4>
                
                {loading ? (
                  <p className="text-muted-foreground">{t('common.loading')}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Invoice Information */}
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {t('billing.status')}
                      </h5>
                      {relatedInvoice ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">{t('billing.invoiceId')}:</span>
                            <span className="text-sm font-medium">{relatedInvoice.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">{t('common.total')}:</span>
                            <span className="text-sm">EGP {relatedInvoice.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">{t('billing.amount_paid')}:</span>
                            <span className="text-sm">EGP {relatedInvoice.amountPaid.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{t('common.status')}:</span>
                            <Badge variant={
                              relatedInvoice.status === 'Paid' ? 'default' :
                              relatedInvoice.status === 'Overdue' ? 'destructive' : 'secondary'
                            } className={cn(
                              'text-xs',
                              relatedInvoice.status === 'Paid' && 'bg-green-100 text-green-800'
                            )}>
                              {t(`billing.${relatedInvoice.status.toLowerCase()}`) || relatedInvoice.status}
                            </Badge>
                          </div>
                        </div>
                      ) : canCreateInvoice ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-2">{t('billing.toast.no_outstanding')}</p>
                          <Button size="sm" variant="outline">
                            <FileText className="mr-2 h-3 w-3" />
                            {t('billing.create_invoice')}
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{t('billing.toast.invoice_from_treatment')}</p>
                      )}
                    </div>

                    {/* Insurance Information */}
                    <div className="border rounded-lg p-3">
                      <h5 className="font-medium mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {t('insurance.insurance_claims')}
                      </h5>
                      {relatedClaim ? (
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">{t('insurance.claim_amount')}:</span>
                            <span className="text-sm">{relatedClaim.amount}</span>
                          </div>
                          {relatedClaim.approvedAmount && (
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">{t('insurance.approved_amount')}:</span>
                              <span className="text-sm text-green-600 font-medium">
                                {relatedClaim.approvedAmount}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{t('common.status')}:</span>
                            <Badge variant={
                              relatedClaim.status === 'Approved' ? 'default' :
                              relatedClaim.status === 'Denied' ? 'destructive' : 'secondary'
                            } className={cn(
                              'text-xs',
                              relatedClaim.status === 'Approved' && 'bg-green-100 text-green-800'
                            )}>
                              {t(`insurance.status.${relatedClaim.status.toLowerCase()}`) || relatedClaim.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">{t('insurance.submit_date')}:</span>
                            <span className="text-sm">{new Date(relatedClaim.submitDate).toLocaleDateString(locale)}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{t('insurance.no_claims_found')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

             <div>
                <h4 className="font-semibold">{t('common.notes')}</h4>
                <p className="text-muted-foreground p-2 border rounded-md bg-secondary/50 min-h-[60px]">{treatment.notes || t('common.na')}</p>
            </div>
             <div>
                <h4 className="font-semibold">{t('appointments.title')}</h4>
                <ul className="list-disc pl-5 mt-1 text-muted-foreground space-y-2">
                    {treatment.appointments.map((appt, index) => (
                         <li key={index}>
                            <div className="flex items-center gap-2">
                                <span>{new Date(appt.date).toLocaleDateString(locale, { dateStyle: 'medium' })} @ {appt.time} ({appt.duration})</span>
                                <Badge variant={
                                  appt.status === 'Cancelled' ? 'destructive' :
                                  appt.status === 'Completed' ? 'default' :
                                  'secondary'
                                } className={cn(
                                    "h-5 text-xs capitalize",
                                    appt.status === 'Completed' && 'bg-green-100 text-green-800'
                                )}>
                                    {t(`appointments.filter.${appt.status?.toLowerCase()}`) || appt.status}
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
