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
        statusReason: 'Applied to patient account'
      });

      onClaimProcessed(claim.id, approvedAmount);
      
      toast({
        title: "Insurance Credit Applied",
        description: `EGP ${approvedAmount.toFixed(2)} credit applied to ${claim.patient}'s account.`,
      });
    } catch (error) {
      toast({
        title: "Error applying insurance credit",
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
          <Shield className="mr-2 h-4 w-4" />
          Insurance Integration
          {processableClaims.length > 0 && (
            <Badge className="ml-2" variant="secondary">
              {processableClaims.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Insurance Claims Integration</DialogTitle>
          <DialogDescription>
            Review and apply insurance claim approvals to patient billing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Insurance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Total Claims
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{claims.length}</div>
                <p className="text-xs text-muted-foreground">All insurance claims</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Ready to Apply
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{processableClaims.length}</div>
                <p className="text-xs text-muted-foreground">Approved claims</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pending Credit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  EGP {totalPendingInsurance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Available to apply</p>
              </CardContent>
            </Card>
          </div>

          {/* Claims Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Insurance</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Claim Amount</TableHead>
                  <TableHead>Approved Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                          {claim.status}
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
                            Apply Credit
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {claim.status === 'Processing' ? 'Pending' : 
                             claim.status === 'Denied' ? 'Denied' :
                             claim.statusReason ? 'Applied' : 'N/A'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No insurance claims found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
