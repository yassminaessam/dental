'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, DollarSign, FileText, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export default function PatientBillingPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const handlePayment = (invoiceId: string, amount: number) => {
    toast({
      title: 'Payment Processing',
      description: `Processing payment of $${amount.toFixed(2)} for ${invoiceId}. Payment gateway integration coming soon.`,
    });
  };

  const handleDownload = (invoiceId: string) => {
    toast({
      title: 'Downloading',
      description: `Downloading ${invoiceId}...`,
    });
    // Simulate download
    setTimeout(() => {
      alert(`Downloaded: ${invoiceId}`);
    }, 1000);
  };
  const invoices = [
    {
      id: 'INV-2025-001',
      description: 'Root Canal Treatment',
      date: '2025-01-10',
      amount: 800,
      status: 'Pending',
      dueDate: '2025-01-25'
    },
    {
      id: 'INV-2024-087',
      description: 'Regular Checkup & Cleaning',
      date: '2024-12-20',
      amount: 150,
      status: 'Paid',
      paidDate: '2024-12-22'
    },
    {
      id: 'INV-2024-065',
      description: 'Dental X-Rays',
      date: '2024-11-15',
      amount: 120,
      status: 'Paid',
      paidDate: '2024-11-16'
    }
  ];

  const payments = [
    {
      id: 1,
      date: '2024-12-22',
      amount: 150,
      method: 'Credit Card',
      invoice: 'INV-2024-087'
    },
    {
      id: 2,
      date: '2024-11-16',
      amount: 120,
      method: 'Cash',
      invoice: 'INV-2024-065'
    }
  ];

  const totalPending = invoices
    .filter(inv => inv.status === 'Pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <PatientOnly>
      <PatientLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('patient_pages.billing.title')}</h1>
            <p className="text-gray-600">{t('patient_pages.billing.subtitle')}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t('patient_pages.billing.outstanding_balance')}</CardDescription>
                <CardTitle className="text-3xl text-red-600">
                  ${totalPending.toFixed(2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handlePayment('ALL', totalPending)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t('patient_pages.billing.pay_now')}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t('patient_pages.billing.total_paid')}</CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  $270.00
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">2 {t('patient_pages.billing.payments_made')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>{t('patient_pages.billing.insurance_coverage')}</CardDescription>
                <CardTitle className="text-3xl">{t('patient_pages.billing.active')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{t('patient_pages.billing.policy')}: #12345678</p>
              </CardContent>
            </Card>
          </div>

          {/* Invoices */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('patient_pages.billing.invoices')}</h2>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          {invoice.id}
                        </CardTitle>
                        <CardDescription>{invoice.description}</CardDescription>
                      </div>
                      <Badge variant={invoice.status === 'Paid' ? 'default' : 'destructive'}>
                        {invoice.status === 'Paid' ? t('patient_pages.billing.paid') : t('patient_pages.billing.pending')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {t('patient_pages.billing.invoice_date')}: {new Date(invoice.date).toLocaleDateString()}
                        </div>
                        {invoice.status === 'Pending' && invoice.dueDate && (
                          <div className="flex items-center text-sm text-red-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {t('patient_pages.billing.due')}: {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        {invoice.status === 'Paid' && invoice.paidDate && (
                          <div className="flex items-center text-sm text-green-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {t('patient_pages.billing.paid')}: {new Date(invoice.paidDate).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex items-center text-lg font-bold">
                          <DollarSign className="h-5 w-5 mr-1" />
                          {invoice.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(invoice.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t('patient_pages.records.download')}
                        </Button>
                        {invoice.status === 'Pending' && (
                          <Button 
                            size="sm"
                            onClick={() => handlePayment(invoice.id, invoice.amount)}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {t('patient_pages.billing.pay')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Payment History */}
          <section>
            <h2 className="text-xl font-semibold mb-4">{t('patient_pages.billing.payment_history')}</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{payment.invoice}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.date).toLocaleDateString()} • {payment.method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${payment.amount.toFixed(2)}</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownload(`${payment.invoice}-receipt`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t('patient_pages.billing.receipt')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </PatientLayout>
    </PatientOnly>
  );
}
