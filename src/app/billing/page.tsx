
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Search, Plus, MoreHorizontal, FileText, DollarSign, Eye, Printer, Loader2, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { NewInvoiceDialog } from '@/components/billing/new-invoice-dialog';
import { RecordPaymentDialog } from '@/components/billing/record-payment-dialog';
import { ViewInvoiceDialog } from '@/components/billing/view-invoice-dialog';
import { InsuranceIntegrationDialog } from '@/components/billing/insurance-integration-dialog';
import { getCollection, setDocument, updateDocument, deleteDocument } from '@/services/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Patient } from '@/app/patients/page';

export type InvoiceLineItem = {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
};

export type Invoice = {
  id: string;
  patient: string;
  patientId: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  status: 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue';
  items: InvoiceLineItem[];
  treatmentId?: string; // Link to treatment plan
  appointmentId?: string; // Link to completed appointment
  insuranceClaimId?: string; // Link to insurance claim
  paymentPlan?: {
    type: 'full' | 'installments';
    installments?: number;
    frequency?: 'weekly' | 'monthly' | 'quarterly';
  };
  notes?: string;
};

export default function BillingPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [invoiceToPay, setInvoiceToPay] = React.useState<Invoice | null>(null);
  const [invoiceToView, setInvoiceToView] = React.useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = React.useState<Invoice | null>(null);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [treatments, setTreatments] = React.useState<any[]>([]);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [insuranceClaims, setInsuranceClaims] = React.useState<any[]>([]);
  const { toast } = useToast();
  
  React.useEffect(() => {
    async function fetchData() {
        try {
            const [invoiceData, patientData, treatmentData, appointmentData, claimData] = await Promise.all([
                getCollection<Invoice>('invoices'),
                getCollection<Patient>('patients'),
                getCollection<any>('treatments'),
                getCollection<any>('appointments'),
                getCollection<any>('insurance-claims'),
            ]);
            
            // Update overdue invoices
            const today = new Date();
            const updatedInvoices = invoiceData.map(invoice => {
              const dueDate = new Date(invoice.dueDate);
              if (dueDate < today && invoice.status === 'Unpaid' && invoice.amountPaid < invoice.totalAmount) {
                return { ...invoice, status: 'Overdue' as const };
              }
              return invoice;
            });
            
            setInvoices(updatedInvoices);
            setPatients(patientData);
            setTreatments(treatmentData);
            setAppointments(appointmentData.map(a => ({...a, dateTime: new Date(a.dateTime)})));
            setInsuranceClaims(claimData);
        } catch (error) {
            toast({ title: 'Error fetching data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast]);
  
  const billingPageStats = React.useMemo(() => {
    const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const totalPaid = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);
    const outstanding = totalBilled - totalPaid;
    const overdue = invoices
        .filter(inv => inv.status === 'Overdue')
        .reduce((acc, inv) => acc + (inv.totalAmount - inv.amountPaid), 0);
    
    // Enhanced stats with treatment and insurance integration
    const unbilledTreatments = treatments.filter(t => 
      t.status === 'Completed' && !invoices.some(inv => inv.treatmentId === t.id)
    ).length;
    
    const pendingInsurance = insuranceClaims.filter(claim => 
      claim.status === 'Processing' || claim.status === 'Approved'
    ).reduce((acc, claim) => {
      const amount = typeof claim.approvedAmount === 'string' 
        ? parseFloat(claim.approvedAmount.replace(/[^\d.]/g, '')) 
        : claim.approvedAmount || 0;
      return acc + amount;
    }, 0);
    
    return [
        { title: "Total Billed", value: `EGP ${totalBilled.toLocaleString()}`, description: "All invoices created", valueClassName: "" },
        { title: "Outstanding", value: `EGP ${outstanding.toLocaleString()}`, description: "Total amount unpaid", valueClassName: "text-orange-500" },
        { title: "Overdue", value: `EGP ${overdue.toLocaleString()}`, description: "Past due date", valueClassName: "text-red-600" },
        { title: "Paid (All Time)", value: `EGP ${totalPaid.toLocaleString()}`, description: "Total collected", valueClassName: "text-green-600" },
        { title: "Unbilled Treatments", value: unbilledTreatments, description: "Completed treatments not invoiced", valueClassName: "text-blue-600" },
        { title: "Pending Insurance", value: `EGP ${pendingInsurance.toLocaleString()}`, description: "Insurance claims pending", valueClassName: "text-purple-600" },
    ];
  }, [invoices, treatments, insuranceClaims]);


  const handleSaveInvoice = async (data: Omit<Invoice, 'id' | 'status' | 'amountPaid'>) => {
    try {
        const newInvoice: Invoice = {
          id: `INV-${Date.now()}`,
          ...data,
          status: 'Unpaid',
          amountPaid: 0,
        };
        await setDocument('invoices', newInvoice.id, newInvoice);
        setInvoices(prev => [newInvoice, ...prev]);
        toast({ title: "Invoice Created", description: `New invoice for ${newInvoice.patient} has been created.` });
    } catch(e) {
        toast({ title: "Error creating invoice", variant: 'destructive' });
    }
  };

  const handleCreateInvoiceFromTreatment = async (treatmentId: string) => {
    try {
      const treatment = treatments.find(t => t.id === treatmentId);
      if (!treatment) {
        toast({ title: "Treatment not found", variant: 'destructive' });
        return;
      }

      // Check if invoice already exists
      if (invoices.some(inv => inv.treatmentId === treatmentId)) {
        toast({ title: "Invoice already exists for this treatment", variant: 'destructive' });
        return;
      }

      const patient = patients.find(p => p.name === treatment.patient);
      if (!patient) {
        toast({ title: "Patient not found", variant: 'destructive' });
        return;
      }

      // Extract cost amount from treatment.cost string
      const costMatch = treatment.cost.match(/[\d,]+/);
      const amount = costMatch ? parseFloat(costMatch[0].replace(/,/g, '')) : 0;

      const newInvoice: Invoice = {
        id: `INV-${Date.now()}`,
        patient: treatment.patient,
        patientId: patient.id,
        issueDate: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 30 days from now
        totalAmount: amount,
        amountPaid: 0,
        status: 'Unpaid',
        treatmentId: treatmentId,
        items: [{
          id: '1',
          description: treatment.procedure,
          quantity: 1,
          unitPrice: amount
        }],
        notes: `Generated from treatment: ${treatment.procedure} on ${treatment.date}`
      };

      await setDocument('invoices', newInvoice.id, newInvoice);
      setInvoices(prev => [newInvoice, ...prev]);
      toast({ 
        title: "Invoice Created from Treatment", 
        description: `Invoice ${newInvoice.id} created for ${treatment.patient}'s ${treatment.procedure}` 
      });
    } catch (e) {
      toast({ title: "Error creating invoice from treatment", variant: 'destructive' });
    }
  };

  const handleBulkCreateInvoicesFromCompletedTreatments = async () => {
    try {
      const unbilledTreatments = treatments.filter(t => 
        t.status === 'Completed' && !invoices.some(inv => inv.treatmentId === t.id)
      );

      if (unbilledTreatments.length === 0) {
        toast({ title: "No unbilled treatments found", description: "All completed treatments have been invoiced." });
        return;
      }

      for (const treatment of unbilledTreatments) {
        await handleCreateInvoiceFromTreatment(treatment.id);
      }

      toast({ 
        title: "Bulk Invoice Creation Complete", 
        description: `Created ${unbilledTreatments.length} invoices from completed treatments.` 
      });
    } catch (e) {
      toast({ title: "Error creating bulk invoices", variant: 'destructive' });
    }
  };

  const handleApplyInsuranceCredit = async (claimId: string, approvedAmount: number) => {
    try {
      // Find related invoices for the claim
      const claim = insuranceClaims.find(c => c.id === claimId);
      if (!claim) return;

      // Find unpaid invoices for this patient
      const patientInvoices = invoices.filter(inv => 
        inv.patientId === claim.patientId && 
        inv.amountPaid < inv.totalAmount
      );

      if (patientInvoices.length === 0) {
        toast({
          title: "No Outstanding Invoices",
          description: `${claim.patient} has no outstanding balances to apply insurance credit to.`,
        });
        return;
      }

      // Apply credit to the oldest unpaid invoice
      const oldestInvoice = patientInvoices.sort((a, b) => 
        new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
      )[0];

      const remainingBalance = oldestInvoice.totalAmount - oldestInvoice.amountPaid;
      const creditToApply = Math.min(approvedAmount, remainingBalance);
      const newAmountPaid = oldestInvoice.amountPaid + creditToApply;
      const newStatus: Invoice['status'] = newAmountPaid >= oldestInvoice.totalAmount ? 'Paid' : 'Partially Paid';

      await updateDocument('invoices', oldestInvoice.id, {
        amountPaid: newAmountPaid,
        status: newStatus,
        insuranceClaimId: claimId
      });

      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === oldestInvoice.id 
            ? { ...invoice, amountPaid: newAmountPaid, status: newStatus, insuranceClaimId: claimId }
            : invoice
        )
      );

      toast({
        title: "Insurance Credit Applied",
        description: `EGP ${creditToApply.toFixed(2)} applied to invoice ${oldestInvoice.id}`,
      });
    } catch (error) {
      toast({
        title: "Error applying insurance credit",
        variant: "destructive",
      });
    }
  };

  const handleRecordPayment = async (invoiceId: string, paymentAmount: number) => {
    try {
      const invoiceToUpdate = invoices.find(inv => inv.id === invoiceId);
      if (!invoiceToUpdate) return;

      const newAmountPaid = invoiceToUpdate.amountPaid + paymentAmount;
      const newStatus: Invoice['status'] = newAmountPaid >= invoiceToUpdate.totalAmount ? 'Paid' : 'Partially Paid';
      const updatedData = { amountPaid: newAmountPaid, status: newStatus };

      await updateDocument('invoices', invoiceId, updatedData);
      
      setInvoices(prev => 
        prev.map(invoice => invoice.id === invoiceId ? { ...invoice, ...updatedData } : invoice)
      );
      setInvoiceToPay(null);
      toast({ title: "Payment Recorded", description: `Payment of EGP ${paymentAmount.toFixed(2)} recorded for invoice ${invoiceId}.` });
    } catch (e) {
        toast({ title: "Error recording payment", variant: 'destructive' });
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      await deleteDocument('invoices', invoiceToDelete.id);
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceToDelete.id));
      setInvoiceToDelete(null);
      toast({
        title: "Invoice Deleted",
        description: `Invoice ${invoiceToDelete.id} has been permanently deleted.`,
        variant: "destructive",
      });
    } catch (e) {
      toast({ title: "Error deleting invoice", variant: "destructive" });
    }
  };

  const handlePrintInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice && typeof window !== 'undefined') {
        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow) {
            const printableContent = document.querySelector(`#view-invoice-${invoice.id}`);
            
            const styles = Array.from(document.styleSheets)
                .map(s => s.href ? `<link rel="stylesheet" href="${s.href}">` : '')
                .join('');

            const tailwindStyles = `<style>${Array.from(document.querySelectorAll('style')).map(s => s.innerHTML).join('')}</style>`;
            
            printWindow.document.write('<html><head><title>Print Invoice</title>');
            printWindow.document.write(styles);
            printWindow.document.write(tailwindStyles);
            printWindow.document.write('</head><body class="bg-white">');
            if (printableContent) {
                printWindow.document.write(printableContent.innerHTML);
            } else {
                // Fallback for when the dialog isn't rendered
                const dialog = document.createElement('div');
                const viewDialog = React.createElement(ViewInvoiceDialog, { invoice, open: true, onOpenChange: () => {} });
                const ReactDOM = require('react-dom');
                ReactDOM.render(viewDialog, dialog);
                printWindow.document.write(dialog.innerHTML);
            }
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        }
    }
  };

  const filteredInvoices = React.useMemo(() => {
    return invoices
      .filter(invoice =>
        invoice.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [invoices, searchTerm]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Billing & Invoices</h1>
          <div className="flex gap-2">
            <InsuranceIntegrationDialog 
              claims={insuranceClaims} 
              onClaimProcessed={handleApplyInsuranceCredit}
            />
            <Button
              variant="outline"
              onClick={handleBulkCreateInvoicesFromCompletedTreatments}
              disabled={treatments.filter(t => 
                t.status === 'Completed' && !invoices.some(inv => inv.treatmentId === t.id)
              ).length === 0}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Bill All Completed Treatments
            </Button>
            <NewInvoiceDialog onSave={handleSaveInvoice} patients={patients} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {billingPageStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-xl font-bold", stat.valueClassName)}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Unbilled Treatments Section */}
        {treatments.filter(t => t.status === 'Completed' && !invoices.some(inv => inv.treatmentId === t.id)).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Unbilled Completed Treatments
                <Badge variant="secondary" className="ml-auto">
                  {treatments.filter(t => t.status === 'Completed' && !invoices.some(inv => inv.treatmentId === t.id)).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Procedure</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treatments
                    .filter(t => t.status === 'Completed' && !invoices.some(inv => inv.treatmentId === t.id))
                    .map((treatment) => (
                      <TableRow key={treatment.id}>
                        <TableCell className="font-medium">{treatment.patient}</TableCell>
                        <TableCell>{treatment.procedure}</TableCell>
                        <TableCell>{treatment.doctor}</TableCell>
                        <TableCell>{treatment.date}</TableCell>
                        <TableCell>{treatment.cost}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleCreateInvoiceFromTreatment(treatment.id)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Create Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <CardTitle>Patient Invoices</CardTitle>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by invoice or patient..."
                className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={9} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.patient}</TableCell>
                      <TableCell>{invoice.issueDate}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>EGP {invoice.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>EGP {invoice.amountPaid.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === 'Paid' ? 'default' :
                            invoice.status === 'Overdue' ? 'destructive' : 'secondary'
                          }
                          className={cn(
                            invoice.status === 'Paid' && 'bg-green-100 text-green-800',
                            invoice.status === 'Partially Paid' && 'bg-yellow-100 text-yellow-800'
                          )}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.treatmentId ? (
                          <Badge variant="outline" className="text-xs">
                            Treatment
                          </Badge>
                        ) : invoice.appointmentId ? (
                          <Badge variant="outline" className="text-xs">
                            Appointment
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Manual
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setInvoiceToPay(invoice)}>
                              <DollarSign className="mr-2 h-4 w-4" /> Record Payment
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setInvoiceToView(invoice)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrintInvoice(invoice.id)}>
                              <Printer className="mr-2 h-4 w-4" /> Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setInvoiceToDelete(invoice)} 
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {invoiceToPay && (
        <RecordPaymentDialog
          invoice={invoiceToPay}
          open={!!invoiceToPay}
          onOpenChange={(isOpen) => !isOpen && setInvoiceToPay(null)}
          onSave={handleRecordPayment}
        />
      )}
      
      <div className="sr-only">
        {invoices.map(invoice => (
            <div key={`print-${invoice.id}`} id={`view-invoice-${invoice.id}`}>
                <ViewInvoiceDialog invoice={invoice} open={false} onOpenChange={() => {}} />
            </div>
        ))}
      </div>


      <ViewInvoiceDialog
        invoice={invoiceToView}
        open={!!invoiceToView}
        onOpenChange={(isOpen) => !isOpen && setInvoiceToView(null)}
      />

      <AlertDialog open={!!invoiceToDelete} onOpenChange={(isOpen) => !isOpen && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice and all payment records associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvoice}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}
