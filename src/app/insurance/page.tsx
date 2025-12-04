
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatEGP } from '@/lib/currency';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CardIcon } from "@/components/ui/card-icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Download, Search, CheckCircle2, Clock, XCircle, Eye, MoreHorizontal, Loader2, UserPlus, Pencil, Trash2, Sparkles, Shield, TrendingUp, FileText, AlertCircle, DollarSign } from "lucide-react";
import { NewClaimDialog } from "@/components/insurance/new-claim-dialog";
import { useToast } from '@/hooks/use-toast';
import { ViewClaimDialog } from '@/components/insurance/view-claim-dialog';
// Use client-safe data client to ensure array shape and avoid server-only imports
import { listDocuments, setDocument, updateDocument, deleteDocument } from '@/lib/data-client';
import { AddProviderDialog } from '@/components/insurance/add-provider-dialog';
import { EditProviderDialog } from '@/components/insurance/edit-provider-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { ApproveClaimDialog } from '@/components/insurance/approve-claim-dialog';

// Pricing structure for insurance provider
export type ProcedurePricing = {
  procedureCode: string;
  procedureName: string;
  coveragePercentage: number; // 0-100
  maxCoverage?: number; // Maximum amount covered in EGP
  patientCopay?: number; // Fixed copay amount
};

export type Claim = {
  id: string;
  patient: string;
  patientId: string;
  patientPhone?: string | null;
  insurance: string;
  insuranceId?: string;
  procedure: string;
  procedureCode: string;
  amount: string;
  approvedAmount: string | null;
  paidAmount?: string | null;
  status: 'Approved' | 'Processing' | 'Denied' | 'Paid';
  statusReason?: string;
  submitDate: string;
  approvedDate?: string;
  paidDate?: string;
};

type NewClaimInput = {
  patientId: string;
  patientName: string;
  patientPhone?: string;
  insuranceId: string;
  insuranceName: string;
  procedure: string;
  procedureCode?: string;
  amount: string;
  submitDate: Date;
};

export type InsuranceProvider = {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    // Coverage and pricing
    defaultCoveragePercentage?: number; // Default coverage rate (0-100)
    maxAnnualCoverage?: number; // Annual maximum coverage in EGP
    procedurePricing?: ProcedurePricing[]; // Procedure-specific pricing
    contractStartDate?: string;
    contractEndDate?: string;
    notes?: string;
}

const normalizePhoneNumber = (value?: string | null) =>
  value ? value.replace(/\D/g, '') : '';

const extractPhoneFromText = (value?: string | null) => {
  if (!value) return '';
  const match = value.match(/(\+?\d[\d\s-]{5,})/);
  return match ? match[1].replace(/\s+/g, ' ').trim() : '';
};

export default function InsurancePage() {
  const { t, isRTL, language } = useLanguage();
  const [claims, setClaims] = React.useState<Claim[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [claimToView, setClaimToView] = React.useState<Claim | null>(null);
  
  const [providers, setProviders] = React.useState<InsuranceProvider[]>([]);
  const [providerToEdit, setProviderToEdit] = React.useState<InsuranceProvider | null>(null);
  const [providerToDelete, setProviderToDelete] = React.useState<InsuranceProvider | null>(null);
  const [providerSearchTerm, setProviderSearchTerm] = React.useState('');
  const [claimToApprove, setClaimToApprove] = React.useState<Claim | null>(null);
  const [patientDirectory, setPatientDirectory] = React.useState<Record<string, { phone?: string }>>({});

  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [claimsData, providersData, patientsResponse] = await Promise.all([
          listDocuments<Claim>('insurance-claims'),
          listDocuments<InsuranceProvider>('insurance-providers'),
          fetch('/api/patients')
        ]);
        setClaims(claimsData);
        setProviders(providersData);

        if (patientsResponse.ok) {
          const { patients: patientData } = await patientsResponse.json();
          const directory = (patientData ?? []).reduce((acc: Record<string, { phone?: string }>, patient: any) => {
            acc[patient.id] = { phone: patient.phone };
            return acc;
          }, {});
          setPatientDirectory(directory);
        } else {
          throw new Error('Failed to fetch patients');
        }
      } catch (error) {
        console.error('[InsurancePage] fetchData error', error);
        toast({ title: t('insurance.toast.error_fetching'), variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, t]);

  const [cardFilter, setCardFilter] = React.useState<'all' | 'Approved' | 'Processing' | 'Denied' | 'Paid'>('all');

  const insurancePageStats = React.useMemo(() => {
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => c.status === 'Approved').length;
    const approvedAmount = claims
      .filter(c => c.status === 'Approved' && c.approvedAmount)
      .reduce((acc, c) => acc + parseFloat(c.approvedAmount!.replace(/[^0-9.-]+/g, '')), 0);
    const pendingClaims = claims.filter(c => c.status === 'Processing').length;
    const deniedClaims = claims.filter(c => c.status === 'Denied').length;
    const paidClaims = claims.filter(c => c.status === 'Paid').length;
    const paidAmount = claims
      .filter(c => c.status === 'Paid' && (c.paidAmount || c.approvedAmount))
      .reduce((acc, c) => {
        const amt = c.paidAmount || c.approvedAmount;
        return acc + parseFloat(amt!.replace(/[^0-9.-]+/g, ''));
      }, 0);

    return [
      { title: t('insurance.total_claims'), value: totalClaims, description: t('insurance.all_insurance_claims'), filterValue: 'all' as const, valueColor: 'text-blue-900 dark:text-blue-100' },
      { title: t('insurance.approved_amount'), value: `${approvedClaims}`, secondaryValue: formatEGP(approvedAmount, true, language), description: t('insurance.approved_claims'), filterValue: 'Approved' as const, valueColor: 'text-emerald-900 dark:text-emerald-100' },
      { title: t('insurance.status.paid'), value: `${paidClaims}`, secondaryValue: formatEGP(paidAmount, true, language), description: t('insurance.paid_claims'), filterValue: 'Paid' as const, valueColor: 'text-green-900 dark:text-green-100' },
      { title: t('common.pending'), value: pendingClaims, description: t('insurance.pending_credit'), filterValue: 'Processing' as const, valueColor: 'text-amber-900 dark:text-amber-100' },
      { title: t('insurance.status.denied'), value: deniedClaims, description: t('insurance.action.denied'), filterValue: 'Denied' as const, valueColor: 'text-rose-900 dark:text-rose-100' },
    ];
  }, [claims, t, language]);

  const handleSaveClaim = async (data: NewClaimInput) => {
    try {
      const newClaim: Claim = {
        id: `CLM-${Date.now()}`,
        patient: data.patientName,
        patientId: data.patientId,
        patientPhone: data.patientPhone ?? null,
        insurance: data.insuranceName,
        procedure: data.procedure,
        procedureCode: data.procedureCode ?? '',
        amount: `EGP ${parseFloat(data.amount).toFixed(2)}`,
        approvedAmount: null,
        status: 'Processing',
        submitDate: new Date(data.submitDate).toLocaleDateString(),
      };
      await setDocument('insurance-claims', newClaim.id, newClaim);
      setClaims(prev => [newClaim, ...prev]);
  toast({ title: t('insurance.toast.claim_submitted'), description: t('insurance.toast.claim_submitted_desc') });
    } catch(e) {
  toast({ title: t('insurance.toast.error_submitting_claim'), variant: 'destructive' });
    }
  };
  
   const handleSaveProvider = async (data: Omit<InsuranceProvider, 'id'>) => {
    try {
        const newProvider = { ...data, id: `PROV-${Date.now()}` };
        await setDocument('insurance-providers', newProvider.id, newProvider);
        setProviders(prev => [newProvider, ...prev]);
  toast({ title: t('insurance.toast.provider_added'), description: t('insurance.toast.provider_added_desc')});
    } catch(e) {
  toast({ title: t('insurance.toast.error_adding_provider'), variant: 'destructive'});
    }
  };

  const handleUpdateProvider = async (updatedProvider: InsuranceProvider) => {
    try {
        await updateDocument('insurance-providers', updatedProvider.id, updatedProvider);
        setProviders(prev => prev.map(p => p.id === updatedProvider.id ? updatedProvider : p));
        setProviderToEdit(null);
  toast({ title: t('insurance.toast.provider_updated'), description: t('insurance.toast.provider_updated_desc')});
    } catch(e) {
  toast({ title: t('insurance.toast.error_updating_provider'), variant: 'destructive'});
    }
  };

  const handleDeleteProvider = async () => {
    if (providerToDelete) {
        try {
            await deleteDocument('insurance-providers', providerToDelete.id);
            setProviders(prev => prev.filter(p => p.id !== providerToDelete.id));
            setProviderToDelete(null);
            toast({ title: t('insurance.toast.provider_deleted'), description: t('insurance.toast.provider_deleted_desc'), variant: 'destructive'});
        } catch(e) {
            toast({ title: t('insurance.toast.error_deleting_provider'), variant: 'destructive'});
        }
    }
  };

  const handleExport = () => {
    // Generate CSV export of all claims
    const headers = ['Claim ID', 'Patient', 'Insurance', 'Procedure', 'Code', 'Amount', 'Approved', 'Paid', 'Status', 'Submit Date', 'Approved Date', 'Paid Date'];
    const csvContent = [
      headers.join(','),
      ...claims.map(claim => [
        claim.id,
        `"${claim.patient}"`,
        `"${claim.insurance}"`,
        `"${claim.procedure}"`,
        claim.procedureCode,
        claim.amount?.replace(/[^\d.]/g, '') || '0',
        claim.approvedAmount?.replace(/[^\d.]/g, '') || '',
        claim.paidAmount?.replace(/[^\d.]/g, '') || '',
        claim.status,
        claim.submitDate,
        claim.approvedDate || '',
        claim.paidDate || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `insurance_claims_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: t('insurance.toast.export_complete'), description: t('insurance.toast.export_complete_desc') });
  };
  
  const handleDownloadClaim = (claim: Claim) => {
    // Generate individual claim PDF-like document
    const claimHtml = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8" />
  <title>Insurance Claim - ${claim.id}</title>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 20px; }
    .header h1 { margin: 0; color: #1f2937; font-size: 24px; }
    .header p { margin: 5px 0 0; color: #6b7280; }
    .section { margin-bottom: 24px; }
    .section h3 { color: #374151; font-size: 14px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; }
    .label { color: #6b7280; }
    .value { color: #1f2937; font-weight: 500; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
    .status-approved { background: #dcfce7; color: #166534; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-processing { background: #fef3c7; color: #92400e; }
    .status-denied { background: #fee2e2; color: #991b1b; }
    .amounts { background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${t('insurance.claim_details')}</h1>
    <p>${t('insurance.claim_id')}: ${claim.id}</p>
  </div>
  
  <div class="section">
    <h3>${t('insurance.patient')}</h3>
    <div class="row"><span class="label">${t('common.name')}</span><span class="value">${claim.patient}</span></div>
    <div class="row"><span class="label">${t('common.phone')}</span><span class="value">${claim.patientPhone || getClaimPhone(claim) || t('common.na')}</span></div>
  </div>
  
  <div class="section">
    <h3>${t('insurance.insurance')}</h3>
    <div class="row"><span class="label">${t('insurance.provider_name')}</span><span class="value">${claim.insurance}</span></div>
  </div>
  
  <div class="section">
    <h3>${t('common.procedure')}</h3>
    <div class="row"><span class="label">${t('insurance.procedure')}</span><span class="value">${claim.procedure}</span></div>
    <div class="row"><span class="label">${t('insurance.procedure_code')}</span><span class="value">${claim.procedureCode || t('common.na')}</span></div>
  </div>
  
  <div class="section">
    <h3>${t('insurance.status')}</h3>
    <div class="row">
      <span class="label">${t('insurance.status')}</span>
      <span class="status status-${claim.status.toLowerCase()}">${claim.status}</span>
    </div>
    <div class="row"><span class="label">${t('insurance.submit_date')}</span><span class="value">${claim.submitDate}</span></div>
    ${claim.approvedDate ? `<div class="row"><span class="label">${t('insurance.approved_date')}</span><span class="value">${claim.approvedDate}</span></div>` : ''}
    ${claim.paidDate ? `<div class="row"><span class="label">${t('insurance.paid_date')}</span><span class="value">${claim.paidDate}</span></div>` : ''}
  </div>
  
  <div class="amounts">
    <div class="row"><span class="label">${t('insurance.claim_amount')}</span><span class="value">${claim.amount}</span></div>
    ${claim.approvedAmount ? `<div class="row"><span class="label">${t('insurance.approved_amount')}</span><span class="value">${claim.approvedAmount}</span></div>` : ''}
    ${claim.paidAmount ? `<div class="row"><span class="label">${t('insurance.paid_amount')}</span><span class="value">${claim.paidAmount}</span></div>` : ''}
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(claimHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
    
    toast({ title: t('insurance.toast.downloading_claim'), description: t('insurance.toast.downloading_claim_desc') });
  };

  const handleMarkAsPaid = async (claim: Claim) => {
    try {
      const paidAmount = claim.approvedAmount || claim.amount;
      const paidDate = new Date().toLocaleDateString();
      
      await updateDocument('insurance-claims', claim.id, { 
        status: 'Paid',
        paidAmount,
        paidDate
      });
      
      setClaims(prev => 
        prev.map(c => 
          c.id === claim.id ? { ...c, status: 'Paid' as const, paidAmount, paidDate } : c
        )
      );
      
      toast({ 
        title: t('insurance.toast.claim_paid'), 
        description: t('insurance.toast.claim_paid_desc', { amount: paidAmount })
      });
    } catch(e) {
      toast({ title: t('insurance.toast.error_marking_paid'), variant: 'destructive' });
    }
  };

  const getClaimPhone = React.useCallback(
    (claim: Claim) => {
      if (claim.patientPhone) return claim.patientPhone;
      if (claim.patientId && patientDirectory[claim.patientId]?.phone) {
        return patientDirectory[claim.patientId]?.phone ?? '';
      }
      return extractPhoneFromText(claim.patient);
    },
    [patientDirectory]
  );

  const handleStatusChange = async (claimId: string, newStatus: Claim['status']) => {
    try {
      await updateDocument('insurance-claims', claimId, { status: newStatus });
      setClaims(prev => 
        prev.map(claim => 
          claim.id === claimId ? { ...claim, status: newStatus } : claim
        )
      );
  toast({ title: t('insurance.toast.status_updated'), description: t('insurance.toast.status_updated_desc') });
    } catch(e) {
  toast({ title: t('insurance.toast.error_updating_status'), variant: 'destructive' });
    }
  };

  const handleApproveWithAmount = async (claimId: string, approvedAmount: number) => {
    try {
      const formattedAmount = `EGP ${approvedAmount.toFixed(2)}`;
      await updateDocument('insurance-claims', claimId, { 
        status: 'Approved',
        approvedAmount: formattedAmount
      });
      setClaims(prev => 
        prev.map(claim => 
          claim.id === claimId ? { ...claim, status: 'Approved', approvedAmount: formattedAmount } : claim
        )
      );
      toast({ 
        title: t('insurance.toast.claim_approved'), 
        description: t('insurance.toast.claim_approved_desc', { amount: formattedAmount })
      });
    } catch(e) {
      toast({ title: t('insurance.toast.error_approving'), variant: 'destructive' });
      throw e;
    }
  };

  const filteredClaims = React.useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase().trim();
    const numericSearchTerm = searchTerm.replace(/\D/g, '');
    const hasTextSearch = lowercasedTerm.length > 0;
    const hasNumericSearch = numericSearchTerm.length > 0;

    return claims
      .filter((claim) => {
        if (!hasTextSearch && !hasNumericSearch) return true;

        const matchesPatient = claim.patient.toLowerCase().includes(lowercasedTerm);
        const matchesClaimId = claim.id.toLowerCase().includes(lowercasedTerm);
        const matchesProcedure = claim.procedure.toLowerCase().includes(lowercasedTerm);
        const matchesProcedureCode = (claim.procedureCode || '').toLowerCase().includes(lowercasedTerm);
        const matchesInsurance = claim.insurance.toLowerCase().includes(lowercasedTerm);
        const matchesAmount = (claim.amount || '').toLowerCase().includes(lowercasedTerm);
        const matchesStatus = claim.status.toLowerCase().includes(lowercasedTerm);

        const phoneValue = getClaimPhone(claim);
        const normalizedPhone = normalizePhoneNumber(phoneValue);
        const matchesPhone = hasNumericSearch
          ? normalizedPhone.includes(numericSearchTerm)
          : phoneValue.toLowerCase().includes(lowercasedTerm);

        return (
          matchesPatient ||
          matchesClaimId ||
          matchesProcedure ||
          matchesProcedureCode ||
          matchesInsurance ||
          matchesAmount ||
          matchesStatus ||
          matchesPhone
        );
      })
      .filter((claim) =>
        statusFilter === 'all' || claim.status.toLowerCase() === statusFilter
      )
      .filter((claim) =>
        cardFilter === 'all' || claim.status === cardFilter
      );
  }, [claims, getClaimPhone, searchTerm, statusFilter, cardFilter]);

  const filteredProviders = React.useMemo(() => {
    return providers.filter(provider => provider.name.toLowerCase().includes(providerSearchTerm.toLowerCase()));
  }, [providers, providerSearchTerm]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto relative" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-200/30 via-purple-200/20 to-pink-200/10 dark:from-indigo-900/15 dark:via-purple-900/10 dark:to-pink-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-200/30 via-violet-200/20 to-blue-200/10 dark:from-pink-900/15 dark:via-violet-900/10 dark:to-blue-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Ultra Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* Left side: Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl">
                    <Shield className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">Claims Management</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 dark:from-indigo-400 dark:via-blue-400 dark:to-sky-400 bg-clip-text text-transparent animate-gradient">
                    {t('insurance.insurance_claims')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Elite Insurance & Claims Operations
                  </p>
                </div>
              </div>

              {/* Right side: Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleExport} className="gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
                  <Download className="h-4 w-4" />
                  <span>{t('insurance.exportClaims')}</span>
                </Button>
                <NewClaimDialog onSave={handleSaveClaim} />
              </div>
            </div>
          </div>
        </div>

        {/* Ultra Enhanced Stats Cards - Clickable Filters */}
        <div className="grid gap-1.5 grid-cols-2 lg:grid-cols-5">
          {insurancePageStats.map((stat, index) => {
            const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-teal', 'metric-card-orange', 'metric-card-red'];
            const cardStyle = cardStyles[index % cardStyles.length];
            const icons = [FileText, DollarSign, CheckCircle2, Clock, AlertCircle];
            const Icon = icons[index % icons.length];
            const isActive = cardFilter === stat.filterValue;
            
            return (
              <Card 
                key={stat.title}
                onClick={() => setCardFilter(stat.filterValue)}
                className={cn(
                  "relative overflow-hidden border-0 shadow-sm transition-all duration-500 hover:scale-105 cursor-pointer group min-h-0",
                  cardStyle,
                  isActive && "ring-4 ring-white/50 scale-105"
                )}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-1 right-1 z-20">
                    <CheckCircle2 className="h-3 w-3 text-white drop-shadow-lg" />
                  </div>
                )}
                
                {/* Animated Background Layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="pb-0.5 p-1.5 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide leading-tight mb-1">
                        {stat.title}
                      </CardTitle>
                      <div className={cn(
                        "text-lg font-bold drop-shadow-md leading-tight group-hover:scale-110 transition-transform duration-300",
                        stat.valueColor
                      )}>
                        {stat.value}
                      </div>
                      {stat.secondaryValue && (
                        <div className="text-xs font-medium text-white/80 leading-tight">
                          {stat.secondaryValue}
                        </div>
                      )}
                    </div>
                    <CardIcon 
                      variant={(['blue', 'green', 'teal', 'orange', 'red'] as const)[index % 5]}
                      className="w-10 h-10 group-hover:rotate-12"
                      aria-hidden="true"
                    >
                      <Icon className="h-5 w-5" />
                    </CardIcon>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 p-1.5 relative z-10">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ultra Enhanced Tabs */}
        <Tabs defaultValue="claims-management" className="w-full">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-pink-500/5 rounded-2xl blur-xl"></div>
            <TabsList className="relative bg-background/80 backdrop-blur-xl border-2 border-muted/50 p-1.5 rounded-2xl grid w-full grid-cols-3 shadow-lg">
              <TabsTrigger 
                value="claims-management" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <FileText className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('insurance.claims_management')}
              </TabsTrigger>
              <TabsTrigger 
                value="insurance-providers" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <Shield className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('insurance.insurance_providers')}
              </TabsTrigger>
              <TabsTrigger 
                value="claims-reports" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <TrendingUp className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('insurance.claims_reports')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="claims-management" className="mt-0">
            <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
              <CardHeader className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between border-b-2 border-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                    <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {t('insurance.insurance_claims')}
                  </CardTitle>
                  {/* Card Filter Indicator */}
                  {cardFilter !== 'all' && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "ml-2 cursor-pointer hover:opacity-80 transition-opacity",
                        cardFilter === 'Approved' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                        cardFilter === 'Processing' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                        cardFilter === 'Denied' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      )}
                      onClick={() => setCardFilter('all')}
                    >
                      {cardFilter === 'Approved' && t('insurance.status.approved')}
                      {cardFilter === 'Processing' && t('insurance.status.processing')}
                      {cardFilter === 'Denied' && t('insurance.status.denied')}
                      <XCircle className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
          <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
                    <Input
                      type="search"
            placeholder={t('insurance.search_claims')}
            className={cn("w-full rounded-lg bg-background lg:w[336px]", isRTL ? 'pr-8 text-right' : 'pl-8')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('insurance.all_status')} />
                    </SelectTrigger>
                    <SelectContent>
            <SelectItem value="all">{t('insurance.all_status')}</SelectItem>
            <SelectItem value="approved">{t('insurance.status.approved')}</SelectItem>
            <SelectItem value="processing">{t('insurance.status.processing')}</SelectItem>
            <SelectItem value="denied">{t('insurance.status.denied')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className={cn(
                    isRTL
                      ? 'text-right [&_th]:text-right [&_td]:text-right'
                      : 'text-left [&_th]:text-left [&_td]:text-left'
                  )}
                >
                  <TableHeader>
                    <TableRow>
            <TableHead>{t('insurance.claim_id')}</TableHead>
            <TableHead>{t('insurance.patient')}</TableHead>
            <TableHead className="text-left" dir="ltr">{t('common.phone')}</TableHead>
            <TableHead>{t('insurance.insurance')}</TableHead>
            <TableHead>{t('insurance.procedure')}</TableHead>
            <TableHead>{t('insurance.amount')}</TableHead>
            <TableHead>{t('insurance.status')}</TableHead>
            <TableHead>{t('insurance.submit_date')}</TableHead>
            <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={9} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredClaims.length > 0 ? (
                      filteredClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">
                            {claim.id}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{claim.patient}</div>
                            <div className="text-xs text-muted-foreground">{claim.patientId}</div>
                          </TableCell>
                          <TableCell className="text-left" dir="ltr">
                            {getClaimPhone(claim) || t('common.na')}
                          </TableCell>
                          <TableCell>{claim.insurance}</TableCell>
                          <TableCell>
                            <div className="font-medium">{claim.procedure}</div>
                             <div className="text-xs text-muted-foreground">{claim.procedureCode}</div>
                          </TableCell>
                          <TableCell>
                            <div>{claim.amount}</div>
                            {claim.approvedAmount && (
                                <div className="text-xs text-green-600">Approved: {claim.approvedAmount}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                claim.status === "Approved" ? "default" : 
                                claim.status === "Denied" ? "destructive" : "outline"
                              }
                              className={cn(
                                "capitalize",
                                claim.status === 'Approved' && 'bg-foreground text-background hover:bg-foreground/80',
                                claim.status === 'Paid' && 'bg-green-600 text-white border-transparent hover:bg-green-600/80',
                                claim.status === 'Denied' && 'bg-red-600 text-white border-transparent hover:bg-red-600/80',
                              )}
                            >
                               {claim.status === 'Approved' && <CheckCircle2 className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                               {claim.status === 'Paid' && <DollarSign className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                               {claim.status === 'Processing' && <Clock className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                               {claim.status === 'Denied' && <XCircle className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                               {claim.status === 'Approved' ? t('insurance.status.approved') : claim.status === 'Processing' ? t('insurance.status.processing') : claim.status === 'Paid' ? t('insurance.status.paid') : t('insurance.status.denied')}
                            </Badge>
                            {claim.statusReason && (
                                <div className="text-xs text-red-600 mt-1">{claim.statusReason}</div>
                            )}
                          </TableCell>
                          <TableCell>{claim.submitDate}</TableCell>
                          <TableCell className={cn(isRTL ? 'text-left' : 'text-right')}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">{t('table.actions')}</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem onClick={() => setClaimToView(claim)}>
                                  <Eye className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} /> {t('insurance.view_details')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadClaim(claim)}>
                                  <Download className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} /> {t('insurance.download')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setClaimToApprove(claim)} className="text-green-600">
                                  <CheckCircle2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('insurance.mark_as_approved')}
                                </DropdownMenuItem>
                                {claim.status === 'Approved' && (
                                  <DropdownMenuItem onClick={() => handleMarkAsPaid(claim)} className="text-emerald-600">
                                    <DollarSign className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                    {t('insurance.mark_as_paid')}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => handleStatusChange(claim.id, 'Processing')}>
                                  {t('insurance.mark_as_processing')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(claim.id, 'Denied')} className="text-destructive">
                                  {t('insurance.mark_as_denied')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
        <TableCell colSpan={9} className="h-24 text-center">
          {t('insurance.no_claims_found')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="insurance-providers" className="mt-0">
             <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
                <CardHeader className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                      <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                      {t('insurance.insurance_providers')}
                    </CardTitle>
                  </div>
                    <div className='flex items-center gap-2'>
                        <div className="relative w-full md:w-auto">
            <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
                            <Input
                            type="search"
            placeholder={t('insurance.search_providers')}
            className={cn("w-full rounded-lg bg-background lg:w-[336px]", isRTL ? 'pr-8 text-right' : 'pl-8')}
                            value={providerSearchTerm}
                            onChange={(e) => setProviderSearchTerm(e.target.value)}
                            />
                        </div>
                        <AddProviderDialog onSave={handleSaveProvider} />
                    </div>
                </CardHeader>
                <CardContent>
                <Table
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className={cn(
                    isRTL
                      ? 'text-right [&_th]:text-right [&_td]:text-right'
                      : 'text-left [&_th]:text-left [&_td]:text-left'
                  )}
                >
                  <TableHeader>
                    <TableRow>
          <TableHead>{t('insurance.provider_name')}</TableHead>
          <TableHead>{t('insurance.phone')}</TableHead>
          <TableHead>{t('insurance.email')}</TableHead>
          <TableHead>{t('insurance.address')}</TableHead>
          <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredProviders.length > 0 ? (
                      filteredProviders.map((provider) => (
                        <TableRow key={provider.id}>
                          <TableCell className="font-medium">{provider.name}</TableCell>
                          <TableCell dir="ltr">{provider.phone || t('common.na')}</TableCell>
                          <TableCell>{provider.email || t('common.na')}</TableCell>
                          <TableCell>{provider.address || t('common.na')}</TableCell>
                          <TableCell className={cn(isRTL ? 'text-left' : 'text-right')}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem onClick={() => setProviderToEdit(provider)}>
                                  <Pencil className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('table.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setProviderToDelete(provider)} className="text-destructive">
                                  <Trash2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('table.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          {t('table.no_records_found')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="claims-reports" className="mt-0 space-y-6">
            {/* Report Summary Cards */}
            <div className="grid gap-2 grid-cols-1 md:grid-cols-3">
              {/* Total Revenue from Insurance */}
              <Card className="relative overflow-hidden border-2 border-muted/50 shadow-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader className="pb-1 p-2">
                  <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    {t('insurance.reports.total_insurance_revenue')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-base font-bold text-green-600">
                    {formatEGP(
                      claims
                        .filter(c => c.status === 'Paid')
                        .reduce((acc, c) => {
                          const amt = c.paidAmount || c.approvedAmount;
                          return acc + (amt ? parseFloat(amt.replace(/[^0-9.-]+/g, '')) : 0);
                        }, 0),
                      true,
                      language
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t('insurance.reports.from_paid_claims')}</p>
                </CardContent>
              </Card>

              {/* Pending Amount */}
              <Card className="relative overflow-hidden border-2 border-muted/50 shadow-md bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                <CardHeader className="pb-1 p-2">
                  <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3 text-amber-600" />
                    {t('insurance.reports.pending_amount')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="text-base font-bold text-amber-600">
                    {formatEGP(
                      claims
                        .filter(c => c.status === 'Processing' || c.status === 'Approved')
                        .reduce((acc, c) => {
                          const amt = c.approvedAmount || c.amount;
                          return acc + (amt ? parseFloat(amt.replace(/[^0-9.-]+/g, '')) : 0);
                        }, 0),
                      true,
                      language
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{t('insurance.reports.awaiting_payment')}</p>
                </CardContent>
              </Card>

              {/* Denied Amount */}
              <Card className="relative overflow-hidden border-2 border-muted/50 shadow-md bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
                <CardHeader className="pb-1 p-2">
                  <CardTitle className="text-[10px] font-medium text-muted-foreground flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    {t('insurance.reports.denied_amount')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-lg sm:text-xl font-bold text-red-600">
                    {formatEGP(
                      claims
                        .filter(c => c.status === 'Denied')
                        .reduce((acc, c) => acc + parseFloat(c.amount?.replace(/[^0-9.-]+/g, '') || '0'), 0),
                      true,
                      language
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{t('insurance.reports.total_denied')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Claims by Insurance Provider */}
            <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
              <CardHeader className="border-b-2 border-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/10 to-red-500/10">
                    <TrendingUp className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-black bg-gradient-to-r from-pink-600 to-red-600 dark:from-pink-400 dark:to-red-400 bg-clip-text text-transparent">
                    {t('insurance.reports.by_provider')}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('insurance.provider_name')}</TableHead>
                      <TableHead className="text-center">{t('insurance.total_claims')}</TableHead>
                      <TableHead className="text-center">{t('insurance.status.paid')}</TableHead>
                      <TableHead className="text-center">{t('insurance.status.approved')}</TableHead>
                      <TableHead className="text-center">{t('insurance.status.processing')}</TableHead>
                      <TableHead className="text-center">{t('insurance.status.denied')}</TableHead>
                      <TableHead className="text-right">{t('insurance.reports.total_amount')}</TableHead>
                      <TableHead className="text-right">{t('insurance.reports.paid_amount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((provider) => {
                      const providerClaims = claims.filter(c => c.insurance === provider.name);
                      const totalAmount = providerClaims.reduce((acc, c) => acc + parseFloat(c.amount?.replace(/[^0-9.-]+/g, '') || '0'), 0);
                      const paidAmount = providerClaims
                        .filter(c => c.status === 'Paid')
                        .reduce((acc, c) => {
                          const amt = c.paidAmount || c.approvedAmount;
                          return acc + (amt ? parseFloat(amt.replace(/[^0-9.-]+/g, '')) : 0);
                        }, 0);
                      
                      return (
                        <TableRow key={provider.id}>
                          <TableCell className="font-medium">{provider.name}</TableCell>
                          <TableCell className="text-center">{providerClaims.length}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              {providerClaims.filter(c => c.status === 'Paid').length}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                              {providerClaims.filter(c => c.status === 'Approved').length}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              {providerClaims.filter(c => c.status === 'Processing').length}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              {providerClaims.filter(c => c.status === 'Denied').length}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatEGP(totalAmount, true, language)}</TableCell>
                          <TableCell className="text-right font-bold text-green-600">{formatEGP(paidAmount, true, language)}</TableCell>
                        </TableRow>
                      );
                    })}
                    {providers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          {t('insurance.reports.no_providers')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Recent Claims Activity */}
            <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
              <CardHeader className="border-b-2 border-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                      <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {t('insurance.reports.recent_activity')}
                    </CardTitle>
                  </div>
                  <Button variant="outline" onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    {t('insurance.reports.export_all')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('insurance.claim_id')}</TableHead>
                      <TableHead>{t('insurance.patient')}</TableHead>
                      <TableHead>{t('insurance.insurance')}</TableHead>
                      <TableHead>{t('insurance.procedure')}</TableHead>
                      <TableHead>{t('insurance.amount')}</TableHead>
                      <TableHead>{t('insurance.status')}</TableHead>
                      <TableHead>{t('insurance.submit_date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.slice(0, 10).map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium">{claim.id}</TableCell>
                        <TableCell>{claim.patient}</TableCell>
                        <TableCell>{claim.insurance}</TableCell>
                        <TableCell>{claim.procedure}</TableCell>
                        <TableCell>{claim.amount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              claim.status === "Paid" ? "default" :
                              claim.status === "Approved" ? "default" :
                              claim.status === "Denied" ? "destructive" : "outline"
                            }
                            className={cn(
                              claim.status === 'Paid' && 'bg-green-600 text-white',
                              claim.status === 'Approved' && 'bg-emerald-600 text-white',
                              claim.status === 'Denied' && 'bg-red-600 text-white',
                            )}
                          >
                            {claim.status === 'Paid' ? t('insurance.status.paid') :
                             claim.status === 'Approved' ? t('insurance.status.approved') :
                             claim.status === 'Processing' ? t('insurance.status.processing') :
                             t('insurance.status.denied')}
                          </Badge>
                        </TableCell>
                        <TableCell>{claim.submitDate}</TableCell>
                      </TableRow>
                    ))}
                    {claims.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          {t('insurance.no_claims_found')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ViewClaimDialog
        claim={claimToView}
        open={!!claimToView}
        onOpenChange={(isOpen) => !isOpen && setClaimToView(null)}
      />

      {providerToEdit && (
        <EditProviderDialog
          provider={providerToEdit}
          open={!!providerToEdit}
          onOpenChange={(isOpen) => !isOpen && setProviderToEdit(null)}
          onSave={handleUpdateProvider}
        />
      )}

       <AlertDialog open={!!providerToDelete} onOpenChange={(isOpen) => !isOpen && setProviderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.delete_confirmation_message')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProvider}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {claimToApprove && (
        <ApproveClaimDialog
          open={!!claimToApprove}
          onOpenChange={(isOpen) => !isOpen && setClaimToApprove(null)}
          claimId={claimToApprove.id}
          patientName={claimToApprove.patient}
          procedure={claimToApprove.procedure}
          claimAmount={claimToApprove.amount}
          onApprove={handleApproveWithAmount}
        />
      )}

    </DashboardLayout>
  );
}
