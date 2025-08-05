
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

interface ViewInvoiceDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients?: Patient[];
}

export function ViewInvoiceDialog({ invoice, open, onOpenChange, patients = [] }: ViewInvoiceDialogProps) {
  
  if (!invoice) return null;

  const handlePrint = () => {
    const content = document.getElementById(`printable-invoice-${invoice.id}`);
    if (content) {
      const printWindow = window.open('', '', 'height=800,width=800');
      printWindow?.document.write('<html><head><title>Print Invoice</title>');

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

  const InvoiceContent = () => (
     <div id={`printable-invoice-${invoice.id}`}>
        <DialogHeader>
        <DialogTitle className="text-2xl flex items-center justify-between">
            <span>Invoice {invoice.id}</span>
            <div className="flex items-center gap-2 text-base text-muted-foreground">
            <DentalProLogo className="h-6 w-6" /> Cairo Dental Clinic
            </div>
        </DialogTitle>
        <DialogDescription>
            A summary of the patient's bill.
        </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-6">
        <div>
            <h4 className="font-semibold text-muted-foreground">Bill To</h4>
            <p>{invoice.patient}</p>
            <p>Patient ID: {invoice.patientId}</p>
            {patient?.phone && <p>Phone: {patient.phone}</p>}
        </div>
        <div className="text-right">
            <h4 className="font-semibold text-muted-foreground">Issue Date</h4>
            <p>{invoice.issueDate}</p>
            <h4 className="font-semibold text-muted-foreground mt-2">Due Date</h4>
            <p>{invoice.dueDate}</p>
        </div>
        </div>
        
        {/* User and Timestamp Information */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4 border-t border-border">
        <div>
            <h4 className="font-semibold text-muted-foreground">Created By</h4>
            <p>{invoice.createdBy || 'N/A'}</p>
            <h4 className="font-semibold text-muted-foreground mt-2">Created At</h4>
            <p>{invoice.createdAt || 'N/A'}</p>
        </div>
        <div className="text-right">
            <h4 className="font-semibold text-muted-foreground">Last Modified By</h4>
            <p>{invoice.lastModifiedBy || 'N/A'}</p>
            <h4 className="font-semibold text-muted-foreground mt-2">Last Modified At</h4>
            <p>{invoice.lastModifiedAt || 'N/A'}</p>
        </div>
        </div>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Service/Product</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {invoice.items.map(item => (
            <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">EGP {item.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">EGP {(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
        <Separator className="my-4" />
        <div className="grid grid-cols-2">
        <div></div>
        <div className="space-y-2 text-right">
            <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>EGP {invoice.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
            <span className="text-muted-foreground">Amount Paid:</span>
            <span>- EGP {invoice.amountPaid.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
            <span>Amount Due:</span>
            <span>EGP {amountDue.toFixed(2)}</span>
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
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
