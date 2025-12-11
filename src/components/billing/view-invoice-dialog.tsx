
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
import { Printer, Calendar, CreditCard, User, Clock, FileText, Phone, Hash, Building2 } from 'lucide-react';
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
      const printWindow = window.open('', '', 'height=800,width=800');
      printWindow?.document.write(`<html><head><title>${t('billing.print_invoice')}</title>`);

      // copy styles from parent window
      const styles = Array.from(document.styleSheets)
        .map((style) => style.href ? `<link rel="stylesheet" href="${style.href}">` : `<style>${Array.from(style.cssRules).map(rule => rule.cssText).join('')}</style>`)
        .join('\n');
      
      printWindow?.document.write(styles);
      printWindow?.document.write('</head><body class="bg-white">');
      printWindow?.document.write(content.innerHTML);
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.focus();
      setTimeout(() => {
        printWindow?.print();
        printWindow?.close();
      }, 250);
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
        return <Badge variant="success" className="text-sm">{t('billing.paid')}</Badge>;
      case 'Overdue':
        return <Badge variant="destructive" className="text-sm">{t('billing.overdue')}</Badge>;
      case 'Partially Paid':
        return <Badge variant="warning" className="text-sm">{t('billing.partial')}</Badge>;
      default:
        return <Badge variant="secondary" className="text-sm">{t('billing.unpaid')}</Badge>;
    }
  };

  const displayClinicName = clinicName || t('dashboard.clinic_name');

  const InvoiceContent = () => (
    <div
      id={`printable-invoice-${invoice.id}`}
      className="px-4 sm:px-8 py-6 print:px-6"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header with Logo and Invoice Info */}
      <div className="relative mb-8">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl -z-10"></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/20">
          {/* Logo and Clinic Name */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl blur-sm"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-background border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-lg">
                {isHydrated && clinicLogo ? (
                  <Image
                    src={getClientFtpProxyUrl(clinicLogo)}
                    alt={displayClinicName}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full p-1"
                    unoptimized
                  />
                ) : (
                  <DentalProLogo className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {displayClinicName}
              </h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <FileText className="h-3.5 w-3.5" />
                {t('billing.invoice')}
              </p>
            </div>
          </div>
          
          {/* Invoice Number and Status */}
          <div className={cn("flex flex-col gap-2", isRTL ? "sm:items-start" : "sm:items-end")}>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-lg font-bold text-foreground">{invoice.id}</span>
            </div>
            {getStatusBadge(invoice.status)}
          </div>
        </div>
      </div>

      {/* Dates and Bill To Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Bill To */}
        <div className="p-4 rounded-xl border border-border/50 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-blue-500/10">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-300">{t('billing.bill_to')}</h4>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground text-lg">{invoice.patient}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Hash className="h-3.5 w-3.5" />
              {t('patients.patient_id')}: <span className="font-mono">{invoice.patientId || t('common.na')}</span>
            </p>
            {resolvedPhone && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                {t('common.phone')}: <span dir="ltr" className="font-mono tracking-tight">{resolvedPhone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="p-4 rounded-xl border border-border/50 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">{t('billing.dates')}</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('billing.issue_date')}:</span>
              <span className="font-medium">{invoice.issueDate || t('common.na')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('billing.due_date')}:</span>
              <span className="font-medium">{invoice.dueDate || t('common.na')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Trail Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {/* Created Info */}
        <div className="p-4 rounded-xl border border-border/50 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20 dark:to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-purple-700 dark:text-purple-300">{t('common.created_by')}</h4>
          </div>
          <div className="space-y-2">
            <p className="font-medium">{invoice.createdBy || t('common.na')}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              {invoice.createdAt || t('common.na')}
            </p>
          </div>
        </div>

        {/* Modified Info */}
        <div className="p-4 rounded-xl border border-border/50 bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20 dark:to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="font-semibold text-orange-700 dark:text-orange-300">{t('common.last_modified_by')}</h4>
          </div>
          <div className="space-y-2">
            <p className="font-medium">{invoice.lastModifiedBy || t('common.na')}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              {invoice.lastModifiedAt || t('common.na')}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      {invoice.paymentMethod && (
        <div className="mb-8 p-4 rounded-xl border border-border/50 bg-gradient-to-br from-cyan-50/50 to-transparent dark:from-cyan-950/20 dark:to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10">
              <CreditCard className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h4 className="font-semibold text-cyan-700 dark:text-cyan-300">{t('billing.payment_method')}</h4>
          </div>
          <p className="font-medium text-lg">{invoice.paymentMethod}</p>
        </div>
      )}

      {/* Items Table */}
      <div className="mb-8 rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b border-border/50">
          <h4 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('billing.invoice_items')}
          </h4>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="font-semibold">{t('billing.service_product')}</TableHead>
              <TableHead className="text-center font-semibold">{t('billing.quantity')}</TableHead>
              <TableHead className={cn("font-semibold", isRTL ? "text-left" : "text-right")}>{t('billing.unit_price')}</TableHead>
              <TableHead className={cn("font-semibold", isRTL ? "text-left" : "text-right")}>{t('common.total')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item, index) => (
              <TableRow key={item.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                <TableCell className="font-medium">{item.description}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className={isRTL ? "text-left" : "text-right"}>{currency.format(item.unitPrice)}</TableCell>
                <TableCell className={cn("font-medium", isRTL ? "text-left" : "text-right")}>{currency.format(item.quantity * item.unitPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Section */}
      <div className="flex justify-end">
        <div className="w-full sm:w-80 space-y-3 p-4 rounded-xl border border-border/50 bg-gradient-to-br from-muted/30 to-muted/10">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{t('billing.subtotal')}:</span>
            <span className="font-medium">{currency.format(invoice.totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{t('billing.amount_paid')}:</span>
            <span className="font-medium text-green-600 dark:text-green-400">- {currency.format(invoice.amountPaid)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">{t('billing.amount_due')}:</span>
            <span className={cn(
              "font-bold text-xl",
              amountDue > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
            )}>
              {currency.format(amountDue)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-8 p-4 rounded-xl border border-border/50 bg-muted/20">
          <h4 className="font-semibold text-muted-foreground mb-2">{t('common.notes')}:</h4>
          <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">
          {t('billing.thank_you_message')}
        </p>
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3" />
          <span>{displayClinicName}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto px-0">
        <InvoiceContent />
        <DialogFooter className="px-6 pb-4">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            {t('billing.print_invoice')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
