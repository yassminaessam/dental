
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { NewInvoiceDialog } from '@/components/billing/new-invoice-dialog';
import { RecordPaymentDialog } from '@/components/billing/record-payment-dialog';
import { ViewInvoiceDialog } from '@/components/billing/view-invoice-dialog';
import { InsuranceIntegrationDialog } from '@/components/billing/insurance-integration-dialog';
import { getCollection, setDocument, updateDocument, deleteDocument } from '@/services/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Patient } from '@/app/patients/page';
import { useLanguage } from '@/contexts/LanguageContext';

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
  createdBy?: string; // User who created the invoice
  createdAt?: string; // Timestamp when invoice was created
  lastModifiedBy?: string; // User who last modified the invoice
  lastModifiedAt?: string; // Timestamp when invoice was last modified
};

export default function BillingPage() {
  const { user } = useAuth();
  const { t, language, isRTL } = useLanguage();
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
      toast({ title: t('billing.toast.error_fetching'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast, t]);
  
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
    
  const currency = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP' });
  return [
    { title: t('billing.stats.total_billed'), value: currency.format(totalBilled), description: t('billing.stats.desc.total_billed'), valueClassName: "" },
    { title: t('billing.stats.outstanding'), value: currency.format(outstanding), description: t('billing.stats.desc.outstanding'), valueClassName: "text-orange-500" },
    { title: t('billing.stats.overdue'), value: currency.format(overdue), description: t('billing.stats.desc.overdue'), valueClassName: "text-red-600" },
    { title: t('billing.stats.paid_all_time'), value: currency.format(totalPaid), description: t('billing.stats.desc.paid_all_time'), valueClassName: "text-green-600" },
    { title: t('billing.stats.unbilled_treatments'), value: unbilledTreatments, description: t('billing.stats.desc.unbilled_treatments'), valueClassName: "text-blue-600" },
    { title: t('billing.stats.pending_insurance'), value: currency.format(pendingInsurance), description: t('billing.stats.desc.pending_insurance'), valueClassName: "text-purple-600" },
  ];
  }, [invoices, treatments, insuranceClaims, language, t]);


  const handleSaveInvoice = async (data: Omit<Invoice, 'id' | 'status' | 'amountPaid'>) => {
    try {
        const currentTime = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        
        const newInvoice: Invoice = {
          id: `INV-${Date.now()}`,
          ...data,
          status: 'Unpaid',
          amountPaid: 0,
          createdBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
          createdAt: currentTime,
          lastModifiedBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
          lastModifiedAt: currentTime,
        };
        await setDocument('invoices', newInvoice.id, newInvoice);
        setInvoices(prev => [newInvoice, ...prev]);
  toast({ title: t('billing.toast.invoice_created'), description: t('billing.toast.invoice_created_for_patient_desc', { patient: newInvoice.patient }) });
    } catch(e) {
  toast({ title: t('billing.toast.error_creating'), variant: 'destructive' });
    }
  };

  const handleCreateInvoiceFromTreatment = async (treatmentId: string) => {
    try {
      const treatment = treatments.find(t => t.id === treatmentId);
      if (!treatment) {
        toast({ title: t('billing.toast.treatment_not_found'), variant: 'destructive' });
        return;
      }

      // Check if invoice already exists
      if (invoices.some(inv => inv.treatmentId === treatmentId)) {
        toast({ title: t('billing.toast.invoice_exists'), variant: 'destructive' });
        return;
      }

      const patient = patients.find(p => p.name === treatment.patient);
      if (!patient) {
        toast({ title: t('billing.toast.patient_not_found'), variant: 'destructive' });
        return;
      }

      // Extract cost amount from treatment.cost string
      const costMatch = treatment.cost.match(/[\d,]+/);
      const amount = costMatch ? parseFloat(costMatch[0].replace(/,/g, '')) : 0;

  const currentTime = new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const newInvoice: Invoice = {
        id: `INV-${Date.now()}`,
        patient: treatment.patient,
        patientId: patient.id,
  issueDate: new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'), // 30 days from now
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
        notes: `Generated from treatment: ${treatment.procedure} on ${treatment.date}`,
        createdBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        createdAt: currentTime,
        lastModifiedBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        lastModifiedAt: currentTime,
      };

      await setDocument('invoices', newInvoice.id, newInvoice);
      setInvoices(prev => [newInvoice, ...prev]);
      toast({ 
        title: t('billing.toast.invoice_from_treatment'), 
        description: t('billing.toast.invoice_from_treatment_desc_detailed', { id: newInvoice.id, patient: treatment.patient, procedure: treatment.procedure }) 
      });
    } catch (e) {
      toast({ title: t('billing.toast.error_creating_from_treatment'), variant: 'destructive' });
    }
  };

  const handleBulkCreateInvoicesFromCompletedTreatments = async () => {
    try {
      const unbilledTreatments = treatments.filter(t => 
        t.status === 'Completed' && !invoices.some(inv => inv.treatmentId === t.id)
      );

      if (unbilledTreatments.length === 0) {
        toast({ title: t('billing.toast.no_unbilled_treatments'), description: t('billing.toast.no_unbilled_treatments_desc') });
        return;
      }

      for (const treatment of unbilledTreatments) {
        await handleCreateInvoiceFromTreatment(treatment.id);
      }

      toast({ 
        title: t('billing.toast.bulk_creation_complete'), 
        description: t('billing.toast.bulk_creation_desc') 
      });
    } catch (e) {
      toast({ title: t('billing.toast.error_bulk_creation'), variant: 'destructive' });
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
          title: t('billing.toast.no_outstanding'),
          description: t('billing.toast.no_outstanding_desc'),
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

      const currency = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP' });
      toast({
        title: t('billing.toast.insurance_applied'),
        description: `${currency.format(creditToApply)} ${t('billing.amount_paid')} - ${oldestInvoice.id}`,
      });
    } catch (error) {
      toast({
        title: t('billing.toast.error_insurance'),
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
      
  const currentTime = new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const updatedData = { 
        amountPaid: newAmountPaid, 
        status: newStatus,
        lastModifiedBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        lastModifiedAt: currentTime,
      };

      await updateDocument('invoices', invoiceId, updatedData);
      
      setInvoices(prev => 
        prev.map(invoice => invoice.id === invoiceId ? { ...invoice, ...updatedData } : invoice)
      );
      setInvoiceToPay(null);
      const currency = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP' });
      toast({ title: t('billing.toast.payment_recorded'), description: `${currency.format(paymentAmount)} - ${invoiceId}` });
    } catch (e) {
        toast({ title: t('billing.toast.error_recording_payment'), variant: 'destructive' });
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      await deleteDocument('invoices', invoiceToDelete.id);
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceToDelete.id));
      setInvoiceToDelete(null);
      toast({
        title: t('billing.toast.invoice_deleted'),
        description: t('billing.toast.invoice_deleted_desc'),
        variant: "destructive",
      });
    } catch (e) {
      toast({ title: t('billing.toast.error_deleting'), variant: "destructive" });
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
      <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto">
        {/* Elite Header Section */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Financial Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('billing.title')}
            </h1>
            <p className="text-muted-foreground font-medium">Elite Billing System</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
              className="h-11 px-6 rounded-xl font-semibold bg-background/60 backdrop-blur-sm border-border/50 hover:bg-accent hover:text-accent-foreground hover:border-accent/50 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-accent/20 mr-3">
                <DollarSign className="h-3 w-3" />
              </div>
              <span className="hidden sm:inline">{t('billing.bill_all_completed_treatments')}</span>
              <span className="sm:hidden">Bill All</span>
            </Button>
            <NewInvoiceDialog onSave={handleSaveInvoice} patients={patients} />
          </div>
        </div>

        {/* Elite Billing Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {billingPageStats.map((stat, index) => {
            const cardStyles = [
              'metric-card-blue',
              'metric-card-green', 
              'metric-card-orange',
              'metric-card-purple',
              'metric-card-blue',
              'metric-card-green'
            ];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer group",
                  cardStyle
                )}
              >
                {/* Animated Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className="text-lg font-bold text-white drop-shadow-sm">
                      {stat.value}
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                    <DollarSign className="h-4 w-4 text-white drop-shadow-sm" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 relative z-10">
                  <p className="text-xs text-white/80 font-medium">
                    {stat.description}
                  </p>
                  {/* Elite Status Indicator */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                    <span className="text-xs text-white/70 font-medium">Active</span>
                  </div>
                </CardContent>
                
                {/* Elite Corner Accent */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/20 to-transparent" />
              </Card>
            );
          })}
        </div>

        {/* Unbilled Treatments Section */}
        {treatments.filter(t => t.status === 'Completed' && !invoices.some(inv => inv.treatmentId === t.id)).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
        {t('billing.unbilled_completed_treatments')}
                <Badge variant="secondary" className="ml-auto">
                  {treatments.filter(t => t.status === 'Completed' && !invoices.some(inv => inv.treatmentId === t.id)).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
          <TableHead>{t('common.patient')}</TableHead>
          <TableHead>{t('common.procedure')}</TableHead>
          <TableHead>{t('common.doctor')}</TableHead>
          <TableHead>{t('common.date')}</TableHead>
          <TableHead>{t('common.cost')}</TableHead>
          <TableHead className="text-right">{t('common.actions')}</TableHead>
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
                            <FileText className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                            {t('billing.create_invoice')}
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
            <CardTitle>{t('billing.patient_invoices')}</CardTitle>
            <div className="relative w-full md:w-auto">
              <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
              <Input
                type="search"
                placeholder={t('billing.search_by_invoice_or_patient')}
                className={cn("w-full rounded-lg bg-background lg:w-[336px]", isRTL ? 'pr-8' : 'pl-8')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('billing.invoiceId')}</TableHead>
                  <TableHead>{t('common.patient')}</TableHead>
                  <TableHead>{t('common.phone')}</TableHead>
                  <TableHead>{t('billing.issue_date')}</TableHead>
                  <TableHead>{t('billing.due_date')}</TableHead>
                  <TableHead>{t('billing.total_amount')}</TableHead>
                  <TableHead>{t('billing.amount_paid')}</TableHead>
                  <TableHead>{t('billing.status')}</TableHead>
                  <TableHead>{t('billing.source')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={10} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => {
                    const patient = patients.find(p => p.name === invoice.patient);
                    const currency = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP' });
                    return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.patient}</TableCell>
                      <TableCell>{patient?.phone || t('common.na')}</TableCell>
                      <TableCell>{invoice.issueDate}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>{currency.format(invoice.totalAmount)}</TableCell>
                      <TableCell>{currency.format(invoice.amountPaid)}</TableCell>
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
                          {invoice.status === 'Paid' ? t('billing.paid') : invoice.status === 'Overdue' ? t('billing.overdue') : invoice.status === 'Partially Paid' ? t('billing.partial') : t('billing.unpaid')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.treatmentId ? (
                          <Badge variant="outline" className="text-xs">
                            {t('billing.source.treatment')}
                          </Badge>
                        ) : invoice.appointmentId ? (
                          <Badge variant="outline" className="text-xs">
                            {t('billing.source.appointment')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {t('billing.source.manual')}
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
                              <DollarSign className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} /> {t('billing.record_payment')}
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setInvoiceToView(invoice)}>
                              <Eye className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} /> {t('table.view_details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrintInvoice(invoice.id)}>
                              <Printer className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} /> {t('billing.print_invoice')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setInvoiceToDelete(invoice)} 
                              className="text-destructive"
                            >
                              <Trash2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} /> {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      {t('billing.no_invoices_found')}
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
                <ViewInvoiceDialog invoice={invoice} open={false} onOpenChange={() => {}} patients={patients} />
            </div>
        ))}
      </div>


      <ViewInvoiceDialog
        invoice={invoiceToView}
        open={!!invoiceToView}
        onOpenChange={(isOpen) => !isOpen && setInvoiceToView(null)}
        patients={patients}
      />

      <AlertDialog open={!!invoiceToDelete} onOpenChange={(isOpen) => !isOpen && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('billing.delete_invoice_confirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteInvoice}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}
