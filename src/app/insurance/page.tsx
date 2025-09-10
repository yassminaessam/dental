
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
import { Download, Search, CheckCircle2, Clock, XCircle, Eye, MoreHorizontal, Loader2, UserPlus, Pencil, Trash2 } from "lucide-react";
import { NewClaimDialog } from "@/components/insurance/new-claim-dialog";
import { useToast } from '@/hooks/use-toast';
import { ViewClaimDialog } from '@/components/insurance/view-claim-dialog';
import { getCollection, setDocument, updateDocument, deleteDocument } from '@/services/firestore';
import { AddProviderDialog } from '@/components/insurance/add-provider-dialog';
import { EditProviderDialog } from '@/components/insurance/edit-provider-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';

export type Claim = {
  id: string;
  patient: string;
  patientId: string;
  insurance: string;
  procedure: string;
  procedureCode: string;
  amount: string;
  approvedAmount: string | null;
  status: 'Approved' | 'Processing' | 'Denied';
  statusReason?: string;
  submitDate: string;
};

export type InsuranceProvider = {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}

export default function InsurancePage() {
  const { t, isRTL } = useLanguage();
  const [claims, setClaims] = React.useState<Claim[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [claimToView, setClaimToView] = React.useState<Claim | null>(null);
  
  const [providers, setProviders] = React.useState<InsuranceProvider[]>([]);
  const [providerToEdit, setProviderToEdit] = React.useState<InsuranceProvider | null>(null);
  const [providerToDelete, setProviderToDelete] = React.useState<InsuranceProvider | null>(null);
  const [providerSearchTerm, setProviderSearchTerm] = React.useState('');

  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [claimsData, providersData] = await Promise.all([
          getCollection<Claim>('insurance-claims'),
          getCollection<InsuranceProvider>('insurance-providers'),
        ]);
        setClaims(claimsData);
        setProviders(providersData);
      } catch (error) {
        toast({ title: t('insurance.toast.error_fetching'), variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, t]);

  const insurancePageStats = React.useMemo(() => {
    const totalClaims = claims.length;
    const approvedAmount = claims
      .filter(c => c.status === 'Approved' && c.approvedAmount)
      .reduce((acc, c) => acc + parseFloat(c.approvedAmount!.replace(/[^0-9.-]+/g, '')), 0);
    const pendingClaims = claims.filter(c => c.status === 'Processing').length;
    const deniedClaims = claims.filter(c => c.status === 'Denied').length;

    return [
      { title: t('insurance.total_claims'), value: totalClaims, description: t('insurance.all_insurance_claims'), valueClassName: "" },
      { title: t('insurance.approved_amount'), value: `EGP ${approvedAmount.toLocaleString()}`, description: t('insurance.approved_claims'), valueClassName: "text-green-600" },
      { title: t('common.pending'), value: pendingClaims, description: t('insurance.pending_credit'), valueClassName: "text-orange-500" },
      { title: t('insurance.status.denied'), value: deniedClaims, description: t('insurance.action.denied'), valueClassName: "text-red-600" },
    ];
  }, [claims, t]);

  const handleSaveClaim = async (data: any) => {
    try {
      const newClaim: Claim = {
        id: `CLM-${Date.now()}`,
        patient: data.patient,
        patientId: 'DC' + Math.floor(100000000 + Math.random() * 900000000),
        insurance: data.insurance,
        procedure: data.procedure,
        procedureCode: data.procedureCode,
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
  toast({ title: t('insurance.toast.exporting_claims'), description: t('insurance.toast.exporting_claims_desc') });
  };
  
  const handleDownloadClaim = (claimId: string) => {
  toast({ title: t('insurance.toast.downloading_claim'), description: t('insurance.toast.downloading_claim_desc') });
  }

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

  const filteredClaims = React.useMemo(() => {
    return claims
      .filter(claim =>
        claim.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.procedure.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(claim =>
        statusFilter === 'all' || claim.status.toLowerCase() === statusFilter
      );
  }, [claims, searchTerm, statusFilter]);

  const filteredProviders = React.useMemo(() => {
    return providers.filter(provider => provider.name.toLowerCase().includes(providerSearchTerm.toLowerCase()));
  }, [providers, providerSearchTerm]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto">
        {/* Elite Insurance Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Claims Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('insurance.insurance_claims')}
            </h1>
            <p className="text-muted-foreground font-medium">
              Elite Insurance Operations
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button variant="outline" onClick={handleExport} className="elite-button-outline">
              <Download className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
              {t('insurance.exportClaims')}
            </Button>
            <NewClaimDialog onSave={handleSaveClaim} />
          </div>
        </div>

        {/* Elite Insurance Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {insurancePageStats.map((stat, index) => {
            const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-orange', 'metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group",
                  cardStyle
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className={cn("text-2xl font-bold text-white drop-shadow-sm")}>
                      {stat.value}
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                    <CheckCircle2 className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 relative z-10">
                  <p className="text-xs text-white/80 font-medium">
                    {stat.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                    <span className="text-xs text-white/70 font-medium">Active</span>
                  </div>
                </CardContent>
                
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent" />
              </Card>
            );
          })}
        </div>

    {/* Elite Insurance Tabs */}
    <Tabs defaultValue="claims-management">
          <TabsList className="bg-background/60 backdrop-blur-sm border border-border/50 p-1 rounded-xl">
            <TabsTrigger 
              value="claims-management" 
              className="rounded-lg px-6 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('insurance.claims_management')}
            </TabsTrigger>
            <TabsTrigger 
              value="insurance-providers" 
              className="rounded-lg px-6 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('insurance.insurance_providers')}
            </TabsTrigger>
            <TabsTrigger 
              value="claims-reports" 
              className="rounded-lg px-6 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('insurance.claims_reports')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="claims-management" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <CardTitle>{t('insurance.insurance_claims')}</CardTitle>
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
            <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
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
                                claim.status === 'Denied' && 'bg-red-600 text-white border-transparent hover:bg-red-600/80',
                              )}
                            >
                               {claim.status === 'Approved' && <CheckCircle2 className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                               {claim.status === 'Processing' && <Clock className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                               {claim.status === 'Denied' && <XCircle className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                               {claim.status === 'Approved' ? t('insurance.status.approved') : claim.status === 'Processing' ? t('insurance.status.processing') : t('insurance.status.denied')}
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
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setClaimToView(claim)}>
                                  <Eye className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} /> {t('insurance.view_details')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadClaim(claim.id)}>
                                  <Download className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} /> {t('insurance.download')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusChange(claim.id, 'Approved')}>
                                  {t('insurance.mark_as_approved')}
                                </DropdownMenuItem>
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
        <TableCell colSpan={8} className="h-24 text-center">
          {t('insurance.no_claims_found')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="insurance-providers" className="mt-4">
             <Card>
                <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <CardTitle>{t('insurance.insurance_providers')}</CardTitle>
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
                <Table>
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
                          <TableCell>{provider.phone || t('common.na')}</TableCell>
                          <TableCell>{provider.email || t('common.na')}</TableCell>
                          <TableCell>{provider.address || t('common.na')}</TableCell>
                          <TableCell className={cn(isRTL ? 'text-left' : 'text-right')}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
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
          <TabsContent value="claims-reports">
            <Card>
              <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                {t('insurance.claims_reports')}
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

    </DashboardLayout>
  );
}
