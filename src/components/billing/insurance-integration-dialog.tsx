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
import { Input } from '@/components/ui/input';
import { Shield, FileText, DollarSign, CheckCircle, Search, Eye, CreditCard, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { updateDocument } from '@/lib/data-client';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEGP } from '@/lib/currency';

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
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedClaim, setSelectedClaim] = React.useState<InsuranceClaim | null>(null);
  const { toast } = useToast();
  const { t, language, isRTL } = useLanguage();

  const processableClaims = claims.filter(claim => 
    claim.status === 'Approved' && claim.approvedAmount && !claim.statusReason
  );

  // Smart search - filters by patient name, insurance company, procedure, status, or claim ID
  const filteredClaims = React.useMemo(() => {
    if (!searchTerm.trim()) return claims;
    
    const lowerSearch = searchTerm.toLowerCase().trim();
    
    return claims.filter(claim => {
      const patientName = claim.patient?.toLowerCase() || '';
      const insurance = claim.insurance?.toLowerCase() || '';
      const procedure = claim.procedure?.toLowerCase() || '';
      const procedureCode = claim.procedureCode?.toLowerCase() || '';
      const status = claim.status?.toLowerCase() || '';
      const claimId = claim.id?.toLowerCase() || '';
      const amount = claim.amount?.toLowerCase() || '';
      const approvedAmount = claim.approvedAmount?.toLowerCase() || '';
      
      return (
        patientName.includes(lowerSearch) ||
        insurance.includes(lowerSearch) ||
        procedure.includes(lowerSearch) ||
        procedureCode.includes(lowerSearch) ||
        status.includes(lowerSearch) ||
        claimId.includes(lowerSearch) ||
        amount.includes(lowerSearch) ||
        approvedAmount.includes(lowerSearch)
      );
    });
  }, [claims, searchTerm]);

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
        description: t('insurance.credit_applied_desc', { amount: new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' }).format(approvedAmount), patient: claim.patient }),
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
        <Button variant="outline" className="flex-1 sm:flex-none h-11 px-3 sm:px-4 lg:px-6 rounded-xl font-semibold bg-background/60 backdrop-blur-sm border-border/50 hover:bg-accent hover:text-accent-foreground hover:border-accent/50 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg text-xs sm:text-sm whitespace-nowrap">
          <Shield className={cn("h-4 w-4 shrink-0", isRTL ? 'ml-2' : 'mr-2')} />
          <span className="hidden sm:inline">{t('insurance.integration')}</span>
          <span className="sm:hidden">{t('insurance.integration_short') || 'Insurance'}</span>
          {processableClaims.length > 0 && (
            <Badge className={cn("shrink-0", isRTL ? 'mr-2' : 'ml-2')} variant="secondary">
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

          {/* Search Input */}
          <div className="relative">
            <Search className={cn("absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
            <Input
              type="search"
              placeholder={t('insurance.search_placeholder') || "Search by patient, insurance, procedure, status..."}
              className={cn("rounded-lg", isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Claims Table */}
          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
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
                {filteredClaims.length > 0 ? (
                  filteredClaims.map((claim) => {
                    const approvedAmountNum = claim.approvedAmount 
                      ? (typeof claim.approvedAmount === 'string' 
                          ? parseFloat(claim.approvedAmount.replace(/[^\d.]/g, '')) 
                          : claim.approvedAmount)
                      : 0;
                    
                    return (
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
                          <div className="flex flex-col">
                            <span className="text-green-600 font-bold">{formatEGP(approvedAmountNum, true, language)}</span>
                            {claim.status === 'Approved' && !claim.statusReason && (
                              <span className="text-xs text-green-500">{t('insurance.ready_to_apply')}</span>
                            )}
                          </div>
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
                        <div className="flex items-center justify-end gap-1">
                          {/* View Details Button */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setSelectedClaim(claim)}
                            title={t('insurance.action.view_details')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Apply Credit Button - Only for approved claims */}
                          {claim.status === 'Approved' && claim.approvedAmount && !claim.statusReason && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApplyInsuranceCredit(claim)}
                              title={t('insurance.apply_credit')}
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Follow-up Button - Only for processing claims */}
                          {claim.status === 'Processing' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              onClick={() => {
                                toast({
                                  title: t('insurance.action.follow_up_sent'),
                                  description: t('insurance.action.follow_up_desc', { insurance: claim.insurance }),
                                });
                              }}
                              title={t('insurance.action.send_follow_up')}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Appeal Button - Only for denied claims */}
                          {claim.status === 'Denied' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                toast({
                                  title: t('insurance.action.appeal_initiated'),
                                  description: t('insurance.action.appeal_desc', { id: claim.id }),
                                });
                              }}
                              title={t('insurance.action.file_appeal')}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Already Applied indicator */}
                          {claim.statusReason && (
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      {searchTerm ? t('insurance.no_matching_claims') : t('insurance.no_claims_found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Claim Details Dialog */}
        {selectedClaim && (
          <Dialog open={!!selectedClaim} onOpenChange={(isOpen) => !isOpen && setSelectedClaim(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t('insurance.claim_details')}</DialogTitle>
                <DialogDescription>{t('insurance.claim_id')}: {selectedClaim.id}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('insurance.patient')}</p>
                    <p className="font-medium">{selectedClaim.patient}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('insurance.insurance')}</p>
                    <p className="font-medium">{selectedClaim.insurance}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('insurance.procedure')}</p>
                    <p className="font-medium">{selectedClaim.procedure}</p>
                    <p className="text-xs text-muted-foreground">{selectedClaim.procedureCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('insurance.submit_date')}</p>
                    <p className="font-medium">{selectedClaim.submitDate}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('insurance.claim_amount')}</p>
                    <p className="font-medium">{selectedClaim.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('insurance.approved_amount')}</p>
                    <p className="font-bold text-green-600">
                      {selectedClaim.approvedAmount 
                        ? formatEGP(
                            typeof selectedClaim.approvedAmount === 'string' 
                              ? parseFloat(selectedClaim.approvedAmount.replace(/[^\d.]/g, '')) 
                              : selectedClaim.approvedAmount, 
                            true, 
                            language
                          )
                        : '-'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('insurance.status')}</p>
                  <Badge
                    variant={
                      selectedClaim.status === 'Approved' ? 'default' :
                      selectedClaim.status === 'Denied' ? 'destructive' : 'secondary'
                    }
                    className={cn(
                      selectedClaim.status === 'Approved' && 'bg-green-100 text-green-800',
                      selectedClaim.status === 'Processing' && 'bg-yellow-100 text-yellow-800'
                    )}
                  >
                    {selectedClaim.status === 'Approved' ? t('insurance.status.approved') : selectedClaim.status === 'Denied' ? t('insurance.status.denied') : t('insurance.status.processing')}
                  </Badge>
                  {selectedClaim.statusReason && (
                    <p className="text-sm text-muted-foreground mt-2">{selectedClaim.statusReason}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                {selectedClaim.status === 'Approved' && selectedClaim.approvedAmount && !selectedClaim.statusReason && (
                  <Button onClick={() => {
                    handleApplyInsuranceCredit(selectedClaim);
                    setSelectedClaim(null);
                  }}>
                    <CreditCard className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                    {t('insurance.apply_credit')}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedClaim(null)}>
                  {t('common.close')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
