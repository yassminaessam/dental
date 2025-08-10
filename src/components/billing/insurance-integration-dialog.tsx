'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, DollarSign, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { updateDocument } from '@/services/firestore';
import { useLanguage } from '@/contexts/LanguageContext';

interface InsuranceClaim {
  id: string;
  patient: string;
  patientId: string;
  insurance: string;
  procedure: string;
  procedureCode: string;
  amount: string;
  approvedAmount: string | null;
  status: 'Processing' | 'Approved' | 'Denied';
  statusReason?: string;
  submitDate: string;
}

interface InsuranceIntegrationDialogProps {
  claims: InsuranceClaim[];
  onClaimProcessed: (claimId: string, approvedAmount: number) => void;
}

export function InsuranceIntegrationDialog({ claims, onClaimProcessed }: InsuranceIntegrationDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { t, language, isRTL } = useLanguage();

  const processableClaims = claims.filter(claim => 
    claim.status === 'Approved' && claim.approvedAmount && !claim.statusReason
  );

  const handleApplyInsuranceCredit = async (claim: InsuranceClaim) => {
    try {
      if (!claim.approvedAmount) return;
      
      const approvedAmount = typeof claim.approvedAmount === 'string' 
        ? parseFloat(claim.approvedAmount.replace(/[^\d.]/g, '')) 
        : claim.approvedAmount;

      // Mark claim as processed
      await updateDocument('insurance-claims', claim.id, {
        statusReason: t('insurance.applied_to_account')
      });

      onClaimProcessed(claim.id, approvedAmount);
      
      toast({
        title: t('insurance.credit_applied'),
        description: t('insurance.credit_applied_desc', { amount: new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP' }).format(approvedAmount), patient: claim.patient }),
      });
    } catch (error) {
      toast({
        title: t('insurance.error_applying_credit'),
        variant: "destructive",
      });
    }
  };

  const totalPendingInsurance = processableClaims.reduce((acc, claim) => {
    const amount = typeof claim.approvedAmount === 'string' 
      ? parseFloat(claim.approvedAmount.replace(/[^\d.]/g, '')) 
      : claim.approvedAmount || 0;
    return acc + amount;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Shield className={isRTL ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
          {t('insurance.integration')}
          {processableClaims.length > 0 && (
            <Badge className="ml-2" variant="secondary">
              {processableClaims.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t('insurance.claims_integration')}</DialogTitle>
          <DialogDescription>
            {t('insurance.claims_integration_desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Insurance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('insurance.total_claims')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{claims.length}</div>
                <p className="text-xs text-muted-foreground">{t('insurance.all_insurance_claims')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {t('insurance.ready_to_apply')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{processableClaims.length}</div>
                <p className="text-xs text-muted-foreground">{t('insurance.approved_claims')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t('insurance.pending_credit')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP' }).format(totalPendingInsurance)}
                </div>
                <p className="text-xs text-muted-foreground">{t('insurance.available_to_apply')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Claims Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('insurance.patient')}</TableHead>
                  <TableHead>{t('insurance.insurance')}</TableHead>
                  <TableHead>{t('insurance.procedure')}</TableHead>
                  <TableHead>{t('insurance.claim_amount')}</TableHead>
                  <TableHead>{t('insurance.approved_amount')}</TableHead>
                  <TableHead>{t('insurance.status')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.length > 0 ? (
                  claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.patient}</TableCell>
                      <TableCell>{claim.insurance}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{claim.procedure}</span>
                          <span className="text-xs text-muted-foreground">{claim.procedureCode}</span>
                        </div>
                      </TableCell>
                      <TableCell>{claim.amount}</TableCell>
                      <TableCell>
                        {claim.approvedAmount ? (
                          <span className="text-green-600 font-medium">{claim.approvedAmount}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            claim.status === 'Approved' ? 'default' :
                            claim.status === 'Denied' ? 'destructive' : 'secondary'
                          }
                          className={cn(
                            claim.status === 'Approved' && 'bg-green-100 text-green-800',
                            claim.status === 'Processing' && 'bg-yellow-100 text-yellow-800'
                          )}
                        >
                          {claim.status === 'Approved' ? t('insurance.status.approved') : claim.status === 'Denied' ? t('insurance.status.denied') : t('insurance.status.processing')}
                        </Badge>
                        {claim.statusReason && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {claim.statusReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {claim.status === 'Approved' && claim.approvedAmount && !claim.statusReason ? (
                          <Button
                            size="sm"
                            onClick={() => handleApplyInsuranceCredit(claim)}
                          >
                            {t('insurance.apply_credit')}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {claim.status === 'Processing' ? t('insurance.action.pending') : 
                             claim.status === 'Denied' ? t('insurance.action.denied') :
                             claim.statusReason ? t('insurance.action.applied') : t('common.na')}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      {t('insurance.no_claims_found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
