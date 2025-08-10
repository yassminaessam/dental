
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
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Invoice } from '@/app/billing/page';
import type { Patient } from '@/app/patients/page';
import { Printer } from 'lucide-react';
import { DentalProLogo } from '../icons';
import { useLanguage } from '@/contexts/LanguageContext';

interface ViewInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients?: Patient[];
}

export function ViewInvoiceDialog({ invoice, open, onOpenChange, patients = [] }: ViewInvoiceDialogProps) {
  
  if (!invoice) return null;
  const { t, language, isRTL } = useLanguage();

  const handlePrint = () => {
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
  }

  const amountDue = invoice.totalAmount - invoice.amountPaid;
  const patient = patients.find(p => p.name === invoice.patient);
  const currency = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP' });

  const InvoiceContent = () => (
     <div id={`printable-invoice-${invoice.id}`}>
        <DialogHeader>
    <DialogTitle className="text-2xl flex items-center justify-between">
      <span>{t('billing.invoice')} {invoice.id}</span>
      <div className="flex items-center gap-2 text-base text-muted-foreground">
      <DentalProLogo className="h-6 w-6" /> {t('dashboard.clinic_name')}
      </div>
        </DialogTitle>
        <DialogDescription>
      {t('billing.invoice_summary')}
        </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-6">
        <div>
      <h4 className="font-semibold text-muted-foreground">{t('billing.bill_to')}</h4>
            <p>{invoice.patient}</p>
      <p>{t('patients.patient_id')}: {invoice.patientId}</p>
      {patient?.phone && <p>{t('common.phone')}: {patient.phone}</p>}
        </div>
    <div className="text-right">
      <h4 className="font-semibold text-muted-foreground">{t('billing.issue_date')}</h4>
            <p>{invoice.issueDate}</p>
      <h4 className="font-semibold text-muted-foreground mt-2">{t('billing.due_date')}</h4>
            <p>{invoice.dueDate}</p>
        </div>
        </div>
        
        {/* User and Timestamp Information */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4 border-t border-border">
        <div>
      <h4 className="font-semibold text-muted-foreground">{t('common.created_by')}</h4>
      <p>{invoice.createdBy || t('common.na')}</p>
      <h4 className="font-semibold text-muted-foreground mt-2">{t('common.created_at')}</h4>
      <p>{invoice.createdAt || t('common.na')}</p>
        </div>
    <div className="text-right">
      <h4 className="font-semibold text-muted-foreground">{t('common.last_modified_by')}</h4>
      <p>{invoice.lastModifiedBy || t('common.na')}</p>
      <h4 className="font-semibold text-muted-foreground mt-2">{t('common.last_modified_at')}</h4>
      <p>{invoice.lastModifiedAt || t('common.na')}</p>
        </div>
        </div>
        <Table>
        <TableHeader>
            <TableRow>
      <TableHead>{t('billing.service_product')}</TableHead>
      <TableHead className="text-center">{t('billing.quantity')}</TableHead>
      <TableHead className="text-right">{t('billing.unit_price')}</TableHead>
      <TableHead className="text-right">{t('common.total')}</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {invoice.items.map(item => (
            <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
        <TableCell className="text-center">{item.quantity}</TableCell>
        <TableCell className="text-right">{currency.format(item.unitPrice)}</TableCell>
        <TableCell className="text-right">{currency.format(item.quantity * item.unitPrice)}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
        <Separator className="my-4" />
        <div className="grid grid-cols-2">
        <div></div>
        <div className="space-y-2 text-right">
            <div className="flex justify-between">
      <span className="text-muted-foreground">{t('billing.subtotal')}:</span>
      <span>{currency.format(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
      <span className="text-muted-foreground">{t('billing.amount_paid')}:</span>
      <span>- {currency.format(invoice.amountPaid)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
      <span>{t('billing.amount_due')}:</span>
      <span>{currency.format(amountDue)}</span>
            </div>
        </div>
        </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <InvoiceContent />
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className={isRTL ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
            {t('billing.print_invoice')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
