
'use client';

import React from 'react';
// Migrated from direct server getCollection to client data layer listDocuments
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
import { Search, Plus, MoreHorizontal, FileText, DollarSign, Eye, Printer, Loader2, Trash2, Sparkles, AlertCircle, XCircle, CheckCircle } from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { NewInvoiceDialog } from '@/components/billing/new-invoice-dialog';
import { RecordPaymentDialog } from '@/components/billing/record-payment-dialog';
import { ViewInvoiceDialog } from '@/components/billing/view-invoice-dialog';
import { InsuranceIntegrationDialog } from '@/components/billing/insurance-integration-dialog';
import { listDocuments } from '@/lib/data-client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Patient } from '@/app/patients/page';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEGP } from '@/lib/currency';

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
  patientNameSnapshot?: string;
  patientPhoneSnapshot?: string;
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
      // Fetch invoices from Neon database
      const invoiceResponse = await fetch('/api/invoices');
      const invoiceData = invoiceResponse.ok ? (await invoiceResponse.json()).invoices || [] : [];

      // Fetch patients from Neon database
      const patientsResponse = await fetch('/api/patients');
      const patientData = patientsResponse.ok ? (await patientsResponse.json()).patients || [] : [];

      // For now, keep legacy data for treatments, appointments, and claims
      const [treatmentData, appointmentData, claimData] = await Promise.all([
        listDocuments<any>('treatments'),
        listDocuments<any>('appointments'),
        listDocuments<any>('insurance-claims'),
      ]);
            
      // Map patient data to ensure proper date format
      const mappedPatients = patientData.map((p: any) => ({
        ...p,
        dob: p.dob ? new Date(p.dob) : new Date()
      }));

            // Update overdue invoices and map patient names
            const today = new Date();
            const updatedInvoices = invoiceData.map((invoice: any) => {
              const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;
              let status = invoice.status;
              const totalAmount = Number(invoice.amount) || 0;
              const rawAmountPaid = Number(
                invoice.amountPaid ?? (invoice.status === 'Paid' ? invoice.amount : 0)
              );
              const normalizedAmountPaid = Number.isFinite(rawAmountPaid)
                ? Math.min(Math.max(rawAmountPaid, 0), totalAmount)
                : 0;

              if (dueDate && dueDate < today && invoice.status === 'Unpaid' && normalizedAmountPaid < totalAmount) {
                status = 'Overdue' as const;
              }

              const patientMatchById = invoice.patientId
                ? mappedPatients.find((p: any) => p.id === invoice.patientId)
                : undefined;

              const normalizedSnapshotName = invoice.patientNameSnapshot?.trim().toLowerCase();
              const patientMatchBySnapshot = !patientMatchById && normalizedSnapshotName
                ? mappedPatients.find((p: any) => {
                    const fullName = `${p.name ?? ''} ${p.lastName ?? ''}`.trim().toLowerCase();
                    return fullName === normalizedSnapshotName || p.name?.trim().toLowerCase() === normalizedSnapshotName;
                  })
                : undefined;

              const patient = patientMatchById ?? patientMatchBySnapshot;
              const patientFullName = patient
                ? `${patient.name ?? ''} ${patient.lastName ?? ''}`.trim() || patient.name
                : invoice.patientNameSnapshot || t('patients.patient');
              const effectivePatientId = patient?.id ?? (patientMatchById ? invoice.patientId : patientMatchBySnapshot?.id) ?? invoice.patientId ?? '';
              const phoneSnapshot = patient?.phone ?? invoice.patientPhoneSnapshot ?? undefined;

              return {
                ...invoice,
                patientId: effectivePatientId,
                patientNameSnapshot: invoice.patientNameSnapshot ?? patientFullName,
                patientPhoneSnapshot: phoneSnapshot,
                status,
                patient: patientFullName,
                issueDate: invoice.date ? new Date(invoice.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '',
                dueDate: dueDate ? dueDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '',
                totalAmount,
                amountPaid: normalizedAmountPaid,
                items: invoice.items || [],
                createdAt: invoice.createdAt ? new Date(invoice.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US') : '',
              };
            });

      setInvoices(updatedInvoices);
      setPatients(mappedPatients);
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
    
  return [
    { title: t('billing.stats.total_billed'), value: formatEGP(totalBilled, true, language), description: t('billing.stats.desc.total_billed'), valueClassName: "" },
    { title: t('billing.stats.outstanding'), value: formatEGP(outstanding, true, language), description: t('billing.stats.desc.outstanding'), valueClassName: "text-orange-500" },
    { title: t('billing.stats.overdue'), value: formatEGP(overdue, true, language), description: t('billing.stats.desc.overdue'), valueClassName: "text-red-600" },
    { title: t('billing.stats.paid_all_time'), value: formatEGP(totalPaid, true, language), description: t('billing.stats.desc.paid_all_time'), valueClassName: "text-green-600" },
    { title: t('billing.stats.unbilled_treatments'), value: unbilledTreatments, description: t('billing.stats.desc.unbilled_treatments'), valueClassName: "text-blue-600" },
    { title: t('billing.stats.pending_insurance'), value: formatEGP(pendingInsurance, true, language), description: t('billing.stats.desc.pending_insurance'), valueClassName: "text-purple-600" },
  ];
  }, [invoices, treatments, insuranceClaims, language, t]);


  const handleSaveInvoice = async (data: Omit<Invoice, 'id' | 'status' | 'amountPaid'>) => {
    try {
        // Create invoice via Neon API
        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: `INV-${Date.now()}`,
            patientId: data.patientId,
            patientNameSnapshot: data.patientNameSnapshot ?? data.patient,
            patientPhoneSnapshot: data.patientPhoneSnapshot,
            treatmentId: data.treatmentId,
            date: new Date(data.issueDate),
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            status: 'Draft',
            notes: data.notes,
            items: data.items.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create invoice');
        }

        const { invoice } = await response.json();
        const totalAmount = Number(invoice.amount) || 0;
        const amountPaid = Number(invoice.amountPaid ?? 0);
        
        // Map API response to UI format
        const newInvoice: Invoice = {
          id: invoice.id,
          patient: invoice.patientNameSnapshot || data.patient,
          patientId: invoice.patientId || data.patientId,
          patientNameSnapshot: invoice.patientNameSnapshot || data.patientNameSnapshot || data.patient,
          patientPhoneSnapshot: invoice.patientPhoneSnapshot || data.patientPhoneSnapshot,
          issueDate: new Date(invoice.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'),
          dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '',
          totalAmount,
          amountPaid,
          status: (invoice.status as Invoice['status']) ?? 'Unpaid',
          items: invoice.items.map((item: any) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          treatmentId: invoice.treatmentId,
          appointmentId: data.appointmentId,
          insuranceClaimId: data.insuranceClaimId,
          paymentPlan: data.paymentPlan,
          notes: invoice.notes,
          createdBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
          createdAt: new Date(invoice.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US'),
        };

        setInvoices(prev => [newInvoice, ...prev]);
        toast({ title: t('billing.toast.invoice_created'), description: t('billing.toast.invoice_created_for_patient_desc', { patient: newInvoice.patient }) });
    } catch(e) {
        console.error('Error creating invoice:', e);
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

      // Create invoice via Neon API
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: `INV-${Date.now()}`,
          patientId: patient.id,
          patientNameSnapshot: `${patient.name} ${patient.lastName ?? ''}`.trim(),
          patientPhoneSnapshot: patient.phone,
          treatmentId: treatmentId,
          date: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'Draft',
          notes: `Generated from treatment: ${treatment.procedure} on ${treatment.date}`,
          items: [{
            description: treatment.procedure,
            quantity: 1,
            unitPrice: amount,
          }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const { invoice } = await response.json();
      const totalAmount = Number(invoice.amount) || 0;
      const amountPaid = Number(invoice.amountPaid ?? 0);

      const newInvoice: Invoice = {
        id: invoice.id,
        patient: invoice.patientNameSnapshot || `${patient.name} ${patient.lastName ?? ''}`.trim() || treatment.patient,
        patientId: patient.id,
        patientNameSnapshot: invoice.patientNameSnapshot || `${patient.name} ${patient.lastName ?? ''}`.trim(),
        patientPhoneSnapshot: invoice.patientPhoneSnapshot || patient.phone,
        issueDate: new Date(invoice.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : '',
        totalAmount,
        amountPaid,
        status: (invoice.status as Invoice['status']) ?? 'Unpaid',
        treatmentId: treatmentId,
        items: invoice.items.map((item: any) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        notes: invoice.notes,
        createdBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        createdAt: new Date(invoice.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US'),
      };

      setInvoices(prev => [newInvoice, ...prev]);
      toast({ 
        title: t('billing.toast.invoice_from_treatment'), 
        description: t('billing.toast.invoice_from_treatment_desc_detailed', { id: newInvoice.id, patient: treatment.patient, procedure: treatment.procedure }) 
      });
    } catch (e) {
      toast({ title: t('billing.toast.error_creating_from_treatment'), variant: 'destructive' });
    }
  };

  const resolvePatientRecord = React.useCallback((invoice: Invoice) => {
    if (invoice.patientId) {
      const byId = patients.find((patient) => patient.id === invoice.patientId);
      if (byId) return byId;
    }

    const normalizedDisplayName = (invoice.patientNameSnapshot ?? invoice.patient)?.trim().toLowerCase();
    if (!normalizedDisplayName) return undefined;

    return patients.find((patient) => {
      const firstNameMatch = patient.name?.trim().toLowerCase() === normalizedDisplayName;
      const fullName = `${patient.name ?? ''} ${patient.lastName ?? ''}`.trim().toLowerCase();
      return firstNameMatch || fullName === normalizedDisplayName;
    });
  }, [patients]);

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

      // Update via Neon API
      const response = await fetch(`/api/invoices/${oldestInvoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          amountPaid: newAmountPaid,
          notes: `Insurance credit applied: ${claimId}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice');
      }

      setInvoices(prev => 
        prev.map(invoice => 
          invoice.id === oldestInvoice.id 
            ? { ...invoice, amountPaid: newAmountPaid, status: newStatus, insuranceClaimId: claimId }
            : invoice
        )
      );

      toast({
        title: t('billing.toast.insurance_applied'),
        description: `${formatEGP(creditToApply, true, language)} ${t('billing.amount_paid')} - ${oldestInvoice.id}`,
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
      
      // Update via Neon API
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          amountPaid: newAmountPaid,
          notes: invoiceToUpdate.notes 
            ? `${invoiceToUpdate.notes}\nPayment recorded: ${paymentAmount} EGP on ${new Date().toLocaleDateString()}`
            : `Payment recorded: ${paymentAmount} EGP on ${new Date().toLocaleDateString()}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record payment');
      }
      
      const updatedData = { 
        amountPaid: newAmountPaid, 
        status: newStatus,
        lastModifiedBy: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        lastModifiedAt: new Date().toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US'),
      };
      
      setInvoices(prev => 
        prev.map(invoice => invoice.id === invoiceId ? { ...invoice, ...updatedData } : invoice)
      );
      setInvoiceToPay(null);
      toast({ title: t('billing.toast.payment_recorded'), description: `${formatEGP(paymentAmount, true, language)} - ${invoiceId}` });
    } catch (e) {
        console.error('Error recording payment:', e);
        toast({ title: t('billing.toast.error_recording_payment'), variant: 'destructive' });
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      // Delete via Neon API
      const response = await fetch(`/api/invoices/${invoiceToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceToDelete.id));
      setInvoiceToDelete(null);
      toast({
        title: t('billing.toast.invoice_deleted'),
        description: t('billing.toast.invoice_deleted_desc'),
        variant: "destructive",
      });
    } catch (e) {
      console.error('Error deleting invoice:', e);
      toast({ title: t('billing.toast.error_deleting'), variant: "destructive" });
    }
  };

  const buildInvoicePrintHtml = React.useCallback((invoice: Invoice) => {
    const patientRecord = resolvePatientRecord(invoice);
    const currencyFormatter = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' });
    const amountDue = invoice.totalAmount - invoice.amountPaid;
    const direction = isRTL ? 'rtl' : 'ltr';
    const itemsRows = invoice.items.map((item) => `
      <tr>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>${currencyFormatter.format(item.unitPrice)}</td>
        <td>${currencyFormatter.format(item.quantity * item.unitPrice)}</td>
      </tr>
    `).join('');

    const resolvedPhone = patientRecord?.phone ?? invoice.patientPhoneSnapshot ?? '';
    const phoneMarkup = resolvedPhone
      ? `<span dir="ltr" style="font-family: 'IBM Plex Mono', 'Cairo', monospace; letter-spacing: 0.02em;">${resolvedPhone}</span>`
      : '';

    return `<!DOCTYPE html>
<html lang="${language}" dir="${direction}">
<head>
  <meta charset="utf-8" />
  <title>${t('billing.print_invoice')} - ${invoice.id}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Inter', 'Cairo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 56px; background: #f8fafc; color: #0f172a; }
    .invoice-shell { background: #ffffff; border-radius: 20px; padding: 32px 40px; box-shadow: 0 20px 60px rgba(15,23,42,0.12); }
    .invoice-header { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    .invoice-header h1 { font-size: 24px; margin: 0; }
    .clinic-name { font-size: 14px; color: #64748b; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 32px; }
    .meta-card { padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; }
    .meta-card h4 { margin: 0 0 8px; font-size: 14px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-top: 32px; font-size: 14px; }
    thead { background: #f1f5f9; }
    th, td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: ${isRTL ? 'right' : 'left'}; }
    th:last-child, td:last-child { text-align: ${isRTL ? 'left' : 'right'}; }
    th:nth-child(3), td:nth-child(3) { text-align: ${isRTL ? 'left' : 'right'}; }
    th:nth-child(2), td:nth-child(2) { text-align: center; }
    .summary { margin-top: 32px; margin-${isRTL ? 'right' : 'left'}: auto; width: 320px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px; }
    .summary-row.total { font-weight: 700; font-size: 18px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="invoice-shell">
    <div class="invoice-header">
      <div>
        <h1>${t('billing.invoice')} ${invoice.id}</h1>
        <p class="clinic-name">${t('dashboard.clinic_name')}</p>
      </div>
      <div style="text-align:${isRTL ? 'left' : 'right'};">
        <p><strong>${t('billing.issue_date')}:</strong> ${invoice.issueDate || t('common.na')}</p>
        <p><strong>${t('billing.due_date')}:</strong> ${invoice.dueDate || t('common.na')}</p>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-card">
        <h4>${t('billing.bill_to')}</h4>
        <p>${invoice.patient}</p>
        <p>${t('patients.patient_id')}: ${invoice.patientId || t('common.na')}</p>
        ${resolvedPhone ? `<p>${t('common.phone')}: ${phoneMarkup}</p>` : ''}
      </div>
      <div class="meta-card">
        <h4>${t('common.created_by')}</h4>
        <p>${invoice.createdBy || t('common.na')}</p>
        <p><strong>${t('common.created_at')}:</strong> ${invoice.createdAt || t('common.na')}</p>
        <p><strong>${t('common.last_modified_by')}:</strong> ${invoice.lastModifiedBy || t('common.na')}</p>
        <p><strong>${t('common.last_modified_at')}:</strong> ${invoice.lastModifiedAt || t('common.na')}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>${t('billing.service_product')}</th>
          <th>${t('billing.quantity')}</th>
          <th>${t('billing.unit_price')}</th>
          <th>${t('common.total')}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="summary">
      <div class="summary-row">
        <span>${t('billing.subtotal')}</span>
        <span>${currencyFormatter.format(invoice.totalAmount)}</span>
      </div>
      <div class="summary-row">
        <span>${t('billing.amount_paid')}</span>
        <span>${currencyFormatter.format(invoice.amountPaid)}</span>
      </div>
      <div class="summary-row total">
        <span>${t('billing.amount_due')}</span>
        <span>${currencyFormatter.format(amountDue)}</span>
      </div>
    </div>
  </div>
</body>
</html>`;
  }, [resolvePatientRecord, language, isRTL, t]);

  const handlePrintInvoice = React.useCallback((invoiceId: string) => {
    if (typeof window === 'undefined') return;
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) return;
    const html = buildInvoicePrintHtml(invoice);
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }, [buildInvoicePrintHtml, invoices]);

  const filteredInvoices = React.useMemo(() => {
    if (!searchTerm) return invoices;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const normalizedPhoneSearch = lowerSearchTerm.replace(/[^\d]/g, '');
    return invoices.filter(invoice => {
      const patientName = invoice.patient?.toLowerCase() || '';
      const invoiceId = invoice.id?.toLowerCase() || '';
      const patientRecord = resolvePatientRecord(invoice);
      const patientPhoneRaw = patientRecord?.phone ?? invoice.patientPhoneSnapshot ?? '';
      const phoneDigits = patientPhoneRaw.replace(/[^\d]/g, '');
      const withoutCountry = phoneDigits.replace(/^20/, '');
      const localVariant = withoutCountry.startsWith('0') ? withoutCountry : withoutCountry ? `0${withoutCountry}` : '';
      const variants = [phoneDigits, withoutCountry, localVariant].filter(Boolean) as string[];

      const normalizedSearchWithoutCountry = normalizedPhoneSearch.replace(/^20/, '');
      const normalizedSearchWithoutLeadingZero = normalizedPhoneSearch.replace(/^0+/, '');

      const phoneMatches = normalizedPhoneSearch.length > 0 && variants.some((value) => {
        const normalizedValue = value;
        return (
          normalizedValue.includes(normalizedPhoneSearch) ||
          normalizedValue.includes(normalizedSearchWithoutCountry) ||
          normalizedValue.includes(normalizedSearchWithoutLeadingZero)
        );
      });

      return patientName.includes(lowerSearchTerm)
        || invoiceId.includes(lowerSearchTerm)
        || phoneMatches;
    });
  }, [invoices, resolvePatientRecord, searchTerm]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/30 via-teal-200/20 to-cyan-200/10 dark:from-emerald-900/15 dark:via-teal-900/10 dark:to-cyan-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-amber-200/30 via-orange-200/20 to-red-200/10 dark:from-amber-900/15 dark:via-orange-900/10 dark:to-red-900/5 rounded-full blur-3xl animate-pulse [animation-delay:1.5s]"></div>
        </div>

        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl">
                    <DollarSign className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400 bg-clip-text text-transparent animate-gradient">
                    {t('billing.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('page.billing.subtitle')}
                  </p>
                </div>
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
                  <FileText className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  <span className="hidden sm:inline">{t('billing.bill_all_completed_treatments')}</span>
                  <span className="sm:hidden">Bill All</span>
                </Button>
                <NewInvoiceDialog onSave={handleSaveInvoice} patients={patients} />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Billing Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {billingPageStats.map((stat, index) => {
            const cardStyles = [
              'metric-card-blue',
              'metric-card-orange',
              'metric-card-red',
              'metric-card-green',
              'metric-card-purple',
              'metric-card-blue'
            ];
            const cardStyle = cardStyles[index % cardStyles.length];
            const variants = ['blue','orange','red','green','purple','neutral'] as const;
            const variant = variants[index % variants.length];
            return (
              <Card
                key={stat.title}
                className={cn(
                  'relative overflow-hidden border-0 shadow-xl transition-all duration-500 group',
                  cardStyle
                )}
                role="button"
                tabIndex={0}
                aria-label={stat.title}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <CardIcon variant={variant} aria-hidden="true">
                    {index === 0 && <DollarSign className="h-5 w-5" />}
                    {index === 1 && <AlertCircle className="h-5 w-5" />}
                    {index === 2 && <XCircle className="h-5 w-5" />}
                    {index === 3 && <CheckCircle className="h-5 w-5" />}
                    {index === 4 && <FileText className="h-5 w-5" />}
                    {index === 5 && <Loader2 className="h-5 w-5 animate-spin-slow" />}
                  </CardIcon>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Unbilled Treatments Section */}
        {treatments.filter(t => t.status === 'Completed' && !invoices.some(inv => inv.treatmentId === t.id)).length > 0 && (
          <Card className="group relative border-2 border-muted hover:border-amber-200 dark:hover:border-amber-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-amber-50/10 dark:to-amber-950/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 group-hover:from-amber-500/20 group-hover:to-orange-500/20 transition-colors">
                    <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                    {t('billing.unbilled_completed_treatments')}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-bold px-3 py-1">
                  {treatments.filter(t => t.status === 'Completed' && !invoices.some(inv => inv.treatmentId === t.id)).length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
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

        <Card className="group relative border-2 border-muted hover:border-emerald-200 dark:hover:border-emerald-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-emerald-50/10 dark:to-emerald-950/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <CardHeader className="relative z-10 flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-colors">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                {t('billing.patient_invoices')}
              </CardTitle>
            </div>
            
            <div className="relative w-full md:w-auto group/search">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-lg opacity-0 group-hover/search:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <Search className={cn("absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover/search:text-emerald-500 transition-colors duration-300", isRTL ? 'right-3' : 'left-3')} />
                <Input
                  type="search"
                  placeholder={t('billing.search_by_invoice_or_patient')}
                  className={cn("w-full rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted hover:border-emerald-300 dark:hover:border-emerald-700 focus:border-emerald-500 dark:focus:border-emerald-600 py-5 h-auto lg:w-[336px] shadow-sm hover:shadow-md transition-all duration-300", isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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
                    const patient = resolvePatientRecord(invoice);
                    const resolvedPhone = patient?.phone ?? invoice.patientPhoneSnapshot;
                    const phoneCell = resolvedPhone ? (
                      <span dir="ltr" className="font-mono tracking-tight text-sm">
                        {resolvedPhone}
                      </span>
                    ) : (
                      t('common.na')
                    );
                    return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.patient}</TableCell>
                      <TableCell>{phoneCell}</TableCell>
                      <TableCell>{invoice.issueDate}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>{formatEGP(invoice.totalAmount, true, language)}</TableCell>
                      <TableCell>{formatEGP(invoice.amountPaid, true, language)}</TableCell>
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
