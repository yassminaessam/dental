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
import { useAuth } from '@/contexts/AuthContext';
import { formatEGP } from '@/lib/currency';

export default function PatientBillingPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [invoices, setInvoices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [patientId, setPatientId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user?.email) {
      fetchPatientProfile();
    }
  }, [user]);

  const fetchPatientProfile = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/patient/profile?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        console.error('Patient profile not found');
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      setPatientId(data.patient.id);
      fetchInvoices(data.patient.id);
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      setLoading(false);
    }
  };

  const fetchInvoices = async (patId: string) => {
    try {
      const response = await fetch(`/api/patient/invoices?patientId=${patId}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePayment = (invoiceId: string, amount: number) => {
    toast({
      title: 'Payment Processing',
      description: `Processing payment of ${formatEGP(amount)} for ${invoiceId}. Payment gateway integration coming soon.`,
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

  // No mock data - only use real data from database
  const displayInvoices = invoices;
  
  const totalPending = displayInvoices
    .filter(inv => inv.status === 'Pending')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  const totalPaid = displayInvoices
    .filter(inv => inv.status === 'Paid')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  if (loading) {
    return (
      <PatientOnly>
        <PatientLayout>
          <div className="p-6 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-pulse text-lg">{t('common.loading')}</div>
            </div>
          </div>
        </PatientLayout>
      </PatientOnly>
    );
  }

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
                  {formatEGP(totalPending)}
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
                  {formatEGP(totalPaid)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {displayInvoices.filter(inv => inv.status === 'Paid').length} {t('patient_pages.billing.payments_made')}
                </p>
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
              {displayInvoices.map((invoice) => (
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
                          {Number(invoice.amount).toFixed(2)}
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

          {/* Payment History - Show Paid Invoices */}
          {displayInvoices.filter(inv => inv.status === 'Paid').length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('patient_pages.billing.payment_history')}</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {displayInvoices
                      .filter(inv => inv.status === 'Paid')
                      .map((invoice) => (
                        <div key={invoice.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{invoice.number || invoice.id}</p>
                            <p className="text-sm text-gray-600">
                              {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : new Date(invoice.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatEGP(Number(invoice.total || invoice.amount))}</p>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownload(`${invoice.id}-receipt`)}
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
          )}
        </div>
      </PatientLayout>
    </PatientOnly>
  );
}
