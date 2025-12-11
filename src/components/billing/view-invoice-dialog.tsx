
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Invoice } from '@/app/billing/page';
import type { Patient } from '@/app/patients/page';
import { Printer, CreditCard, FileText, Phone, Hash, Building2 } from 'lucide-react';
import { DentalProLogo } from '../icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { getClientFtpProxyUrl } from '@/lib/ftp-proxy-url';
import { cn } from '@/lib/utils';

interface ViewInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients?: Patient[];
}

export function ViewInvoiceDialog({ invoice, open, onOpenChange, patients = [] }: ViewInvoiceDialogProps) {
  const { t, language, isRTL } = useLanguage();
  const [clinicLogo, setClinicLogo] = React.useState<string | null>(null);
  const [clinicName, setClinicName] = React.useState<string>('');
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Load clinic settings from localStorage and API
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setClinicLogo(localStorage.getItem('clinicLogo') || null);
      setClinicName(localStorage.getItem('clinicName') || '');
      setIsHydrated(true);
    }
  }, []);

  // Fetch latest clinic settings when dialog opens
  React.useEffect(() => {
    if (!open) return;
    
    async function fetchClinicSettings() {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            const logo = data.settings.logoUrl;
            const name = data.settings.clinicName;
            
            if (logo) {
              setClinicLogo(logo);
              localStorage.setItem('clinicLogo', logo);
            }
            if (name) {
              setClinicName(name);
              localStorage.setItem('clinicName', name);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch clinic settings:', error);
      }
    }
    
    fetchClinicSettings();
  }, [open]);
  
  if (!invoice) return null;

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    const content = document.getElementById(`printable-invoice-${invoice.id}`);
    if (content) {
      const printWindow = window.open('', '', 'height=842,width=595');
      const logoUrl = clinicLogo ? getClientFtpProxyUrl(clinicLogo) : '';
      
      printWindow?.document.write(`<!DOCTYPE html>
<html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="utf-8" />
  <title>${t('billing.print_invoice')} - ${invoice.id}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      font-size: 11px; 
      line-height: 1.4; 
      color: #1a1a1a;
      background: white;
    }
    .invoice-container { max-width: 100%; padding: 0; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e5e5e5; }
    .logo-section { display: flex; align-items: center; gap: 12px; }
    .logo { width: 50px; height: 50px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e5e5; }
    .clinic-name { font-size: 18px; font-weight: 700; color: #1a1a1a; }
    .invoice-label { font-size: 10px; color: #666; margin-top: 2px; }
    .invoice-meta { text-align: ${isRTL ? 'left' : 'right'}; }
    .invoice-number { font-size: 14px; font-weight: 700; font-family: monospace; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
    .status-paid { background: #dcfce7; color: #166534; }
    .status-unpaid { background: #f3f4f6; color: #374151; }
    .status-partial { background: #fef3c7; color: #92400e; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
    .info-box { padding: 12px; border: 1px solid #e5e5e5; border-radius: 8px; background: #fafafa; }
    .info-box-title { font-size: 9px; font-weight: 600; text-transform: uppercase; color: #666; margin-bottom: 6px; letter-spacing: 0.5px; }
    .info-box-content { font-size: 11px; }
    .info-box-content strong { font-size: 13px; display: block; margin-bottom: 3px; }
    .info-row { display: flex; justify-content: space-between; margin-top: 4px; }
    
    .payment-method { margin-bottom: 15px; padding: 10px 12px; border: 1px solid #0891b2; border-radius: 8px; background: #ecfeff; }
    .payment-method-title { font-size: 9px; font-weight: 600; text-transform: uppercase; color: #0e7490; margin-bottom: 4px; }
    .payment-method-value { font-size: 13px; font-weight: 600; color: #164e63; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { background: #f3f4f6; padding: 8px 10px; font-size: 9px; font-weight: 600; text-transform: uppercase; text-align: ${isRTL ? 'right' : 'left'}; border-bottom: 2px solid #e5e5e5; }
    th:nth-child(2) { text-align: center; }
    th:nth-child(3), th:nth-child(4) { text-align: ${isRTL ? 'left' : 'right'}; }
    td { padding: 8px 10px; font-size: 11px; border-bottom: 1px solid #e5e5e5; }
    td:nth-child(2) { text-align: center; }
    td:nth-child(3), td:nth-child(4) { text-align: ${isRTL ? 'left' : 'right'}; }
    tr:nth-child(even) { background: #fafafa; }
    
    .summary { margin-${isRTL ? 'right' : 'left'}: auto; width: 200px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 11px; }
    .summary-row.total { border-top: 2px solid #1a1a1a; margin-top: 6px; padding-top: 10px; font-size: 14px; font-weight: 700; }
    .amount-due { color: #dc2626; }
    .amount-paid-color { color: #16a34a; }
    
    .audit-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; font-size: 9px; color: #666; }
    .audit-item span { display: block; }
    .audit-label { font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
    
    .notes { margin-top: 15px; padding: 10px; border: 1px solid #e5e5e5; border-radius: 6px; background: #fafafa; }
    .notes-title { font-size: 9px; font-weight: 600; text-transform: uppercase; color: #666; margin-bottom: 4px; }
    .notes-content { font-size: 10px; white-space: pre-wrap; }
    
    .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e5e5; text-align: center; }
    .footer p { font-size: 10px; color: #666; }
    .footer .clinic { font-size: 9px; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="logo-section">
        ${logoUrl ? `<img src="${logoUrl}" alt="${displayClinicName}" class="logo" />` : ''}
        <div>
          <div class="clinic-name">${displayClinicName}</div>
          <div class="invoice-label">${t('billing.invoice')}</div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-number">#${invoice.id}</div>
        <div class="status-badge status-${invoice.status.toLowerCase().replace(' ', '-')}">${
          invoice.status === 'Paid' ? t('billing.paid') : 
          invoice.status === 'Overdue' ? t('billing.overdue') : 
          invoice.status === 'Partially Paid' ? t('billing.partial') : t('billing.unpaid')
        }</div>
      </div>
    </div>
    
    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-title">${t('billing.bill_to')}</div>
        <div class="info-box-content">
          <strong>${invoice.patient}</strong>
          ${invoice.patientId ? `<div>${t('patients.patient_id')}: ${invoice.patientId}</div>` : ''}
          ${resolvedPhone ? `<div>${t('common.phone')}: <span dir="ltr">${resolvedPhone}</span></div>` : ''}
        </div>
      </div>
      <div class="info-box">
        <div class="info-box-title">${t('billing.dates')}</div>
        <div class="info-box-content">
          <div class="info-row"><span>${t('billing.issue_date')}:</span><span>${invoice.issueDate || t('common.na')}</span></div>
          <div class="info-row"><span>${t('billing.due_date')}:</span><span>${invoice.dueDate || t('common.na')}</span></div>
        </div>
      </div>
    </div>
    
    ${invoice.paymentMethod ? `
    <div class="payment-method">
      <div class="payment-method-title">${t('billing.payment_method')}</div>
      <div class="payment-method-value">${invoice.paymentMethod}</div>
    </div>
    ` : ''}
    
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
        ${invoice.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${currency.format(item.unitPrice)}</td>
            <td>${currency.format(item.quantity * item.unitPrice)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="summary">
      <div class="summary-row"><span>${t('billing.subtotal')}:</span><span>${currency.format(invoice.totalAmount)}</span></div>
      <div class="summary-row"><span>${t('billing.amount_paid')}:</span><span class="amount-paid-color">- ${currency.format(invoice.amountPaid)}</span></div>
      <div class="summary-row total"><span>${t('billing.amount_due')}:</span><span class="${amountDue > 0 ? 'amount-due' : 'amount-paid-color'}">${currency.format(amountDue)}</span></div>
    </div>
    
    <div class="audit-info">
      <div class="audit-item"><span class="audit-label">${t('common.created_by')}:</span><span>${invoice.createdBy || t('common.na')}</span><span>${invoice.createdAt || ''}</span></div>
      <div class="audit-item"><span class="audit-label">${t('common.last_modified_by')}:</span><span>${invoice.lastModifiedBy || t('common.na')}</span><span>${invoice.lastModifiedAt || ''}</span></div>
    </div>
    
    ${invoice.notes ? `
    <div class="notes">
      <div class="notes-title">${t('common.notes')}</div>
      <div class="notes-content">${invoice.notes}</div>
    </div>
    ` : ''}
    
    <div class="footer">
      <p>${t('billing.thank_you_message')}</p>
      <p class="clinic">${displayClinicName}</p>
    </div>
  </div>
</body>
</html>`);
      printWindow?.document.close();
      printWindow?.focus();
      setTimeout(() => {
        printWindow?.print();
        printWindow?.close();
      }, 300);
    }
  };

  const amountDue = invoice.totalAmount - invoice.amountPaid;
  const patient = patients.find(p => p.id === invoice.patientId)
    || patients.find(p => `${p.name} ${p.lastName ?? ''}`.trim() === invoice.patient)
    || null;
  const resolvedPhone = patient?.phone ?? invoice.patientPhoneSnapshot ?? null;
  const currency = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP' });

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="success" className="text-xs">{t('billing.paid')}</Badge>;
      case 'Overdue':
        return <Badge variant="destructive" className="text-xs">{t('billing.overdue')}</Badge>;
      case 'Partially Paid':
        return <Badge variant="warning" className="text-xs">{t('billing.partial')}</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{t('billing.unpaid')}</Badge>;
    }
  };

  const displayClinicName = clinicName || t('dashboard.clinic_name');

  const InvoiceContent = () => (
    <div
      id={`printable-invoice-${invoice.id}`}
      className="px-4 py-4 text-sm"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header with Logo and Invoice Info */}
      <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b-2 border-border">
        {/* Logo and Clinic Name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden">
            {isHydrated && clinicLogo ? (
              <Image
                src={getClientFtpProxyUrl(clinicLogo)}
                alt={displayClinicName}
                width={48}
                height={48}
                className="object-contain w-full h-full"
                unoptimized
              />
            ) : (
              <DentalProLogo className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">{displayClinicName}</h2>
            <p className="text-xs text-muted-foreground">{t('billing.invoice')}</p>
          </div>
        </div>
        
        {/* Invoice Number and Status */}
        <div className={cn("flex flex-col gap-1", isRTL ? "items-start" : "items-end")}>
          <span className="font-mono text-sm font-bold">#{invoice.id}</span>
          {getStatusBadge(invoice.status)}
        </div>
      </div>

      {/* Info Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Bill To */}
        <div className="p-3 rounded-lg border border-border bg-muted/30">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t('billing.bill_to')}</h4>
          <p className="font-semibold text-sm">{invoice.patient}</p>
          {invoice.patientId && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Hash className="h-3 w-3" />{invoice.patientId}
            </p>
          )}
          {resolvedPhone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Phone className="h-3 w-3" /><span dir="ltr">{resolvedPhone}</span>
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="p-3 rounded-lg border border-border bg-muted/30">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">{t('billing.dates')}</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('billing.issue_date')}:</span>
              <span className="font-medium">{invoice.issueDate || t('common.na')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('billing.due_date')}:</span>
              <span className="font-medium">{invoice.dueDate || t('common.na')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method - Always show if exists */}
      {invoice.paymentMethod && (
        <div className="mb-4 p-3 rounded-lg border border-cyan-500/50 bg-cyan-50/50 dark:bg-cyan-950/20">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-cyan-600" />
            <span className="text-[10px] font-semibold text-cyan-700 dark:text-cyan-300 uppercase">{t('billing.payment_method')}:</span>
            <span className="font-semibold text-cyan-800 dark:text-cyan-200">{invoice.paymentMethod}</span>
          </div>
        </div>
      )}

      {/* Items Table - Compact */}
      <div className="mb-4 rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-[10px] font-semibold py-2">{t('billing.service_product')}</TableHead>
              <TableHead className="text-[10px] font-semibold text-center py-2">{t('billing.quantity')}</TableHead>
              <TableHead className={cn("text-[10px] font-semibold py-2", isRTL ? "text-left" : "text-right")}>{t('billing.unit_price')}</TableHead>
              <TableHead className={cn("text-[10px] font-semibold py-2", isRTL ? "text-left" : "text-right")}>{t('common.total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item, index) => (
              <TableRow key={item.id} className={index % 2 === 0 ? '' : 'bg-muted/20'}>
                <TableCell className="py-2 text-xs">{item.description}</TableCell>
                <TableCell className="py-2 text-xs text-center">{item.quantity}</TableCell>
                <TableCell className={cn("py-2 text-xs", isRTL ? "text-left" : "text-right")}>{currency.format(item.unitPrice)}</TableCell>
                <TableCell className={cn("py-2 text-xs font-medium", isRTL ? "text-left" : "text-right")}>{currency.format(item.quantity * item.unitPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Section - Compact */}
      <div className="flex justify-end mb-4">
        <div className="w-48 space-y-1 p-3 rounded-lg border border-border bg-muted/30">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{t('billing.subtotal')}:</span>
            <span className="font-medium">{currency.format(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{t('billing.amount_paid')}:</span>
            <span className="font-medium text-green-600">- {currency.format(invoice.amountPaid)}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs">{t('billing.amount_due')}:</span>
            <span className={cn("font-bold text-sm", amountDue > 0 ? "text-red-600" : "text-green-600")}>
              {currency.format(amountDue)}
            </span>
          </div>
        </div>
      </div>

      {/* Audit Info - Compact grid */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-[10px] text-muted-foreground">
        <div>
          <span className="font-semibold uppercase">{t('common.created_by')}:</span> {invoice.createdBy || t('common.na')}
          {invoice.createdAt && <span className="block">{invoice.createdAt}</span>}
        </div>
        <div>
          <span className="font-semibold uppercase">{t('common.last_modified_by')}:</span> {invoice.lastModifiedBy || t('common.na')}
          {invoice.lastModifiedAt && <span className="block">{invoice.lastModifiedAt}</span>}
        </div>
      </div>

      {/* Notes - Compact */}
      {invoice.notes && (
        <div className="mb-4 p-2 rounded-lg border border-border bg-muted/20">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">{t('common.notes')}</h4>
          <p className="text-xs whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-border text-center">
        <p className="text-[10px] text-muted-foreground">{t('billing.thank_you_message')}</p>
        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mt-1">
          <Building2 className="h-3 w-3" />{displayClinicName}
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto px-0">
        <InvoiceContent />
        <DialogFooter className="px-4 pb-3">
          <Button variant="outline" onClick={handlePrint} size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            {t('billing.print_invoice')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
