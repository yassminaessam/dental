
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
import { billingPageStats } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Search, Plus, MoreHorizontal, FileText, DollarSign, Eye, Printer, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { NewInvoiceDialog } from '@/components/billing/new-invoice-dialog';
import { RecordPaymentDialog } from '@/components/billing/record-payment-dialog';
import { ViewInvoiceDialog } from '@/components/billing/view-invoice-dialog';
import { getCollection, setDocument, updateDocument } from '@/services/firestore';
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
};

export default function BillingPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [invoiceToPay, setInvoiceToPay] = React.useState<Invoice | null>(null);
  const [invoiceToView, setInvoiceToView] = React.useState<Invoice | null>(null);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const { toast } = useToast();
  
  React.useEffect(() => {
    async function fetchData() {
        try {
            const [invoiceData, patientData] = await Promise.all([
                getCollection<Invoice>('invoices'),
                getCollection<Patient>('patients'),
            ]);
            setInvoices(invoiceData);
            setPatients(patientData);
        } catch (error) {
            toast({ title: 'Error fetching data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast]);


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

  const handleRecordPayment = async (invoiceId: string, paymentAmount: number) => {
    try {
      const invoiceToUpdate = invoices.find(inv => inv.id === invoiceId);
      if (!invoiceToUpdate) return;

      const newAmountPaid = invoiceToUpdate.amountPaid + paymentAmount;
      const newStatus = newAmountPaid >= invoiceToUpdate.totalAmount ? 'Paid' : 'Partially Paid';
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
          <NewInvoiceDialog onSave={handleSaveInvoice} patients={patients} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {billingPageStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", stat.valueClassName)}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
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

    </DashboardLayout>
  );
}
