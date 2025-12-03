
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from '@/contexts/LanguageContext';
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
import { cn } from "@/lib/utils";
import { Search, Send, Eye, Phone, Mail, MoreHorizontal, Pencil, Trash2, Loader2, Sparkles, TrendingUp, Users, Activity, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import { AddSpecialistDialog } from "@/components/referrals/add-specialist-dialog";
import { NewReferralDialog } from "@/components/referrals/new-referral-dialog";
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ViewReferralDialog } from '@/components/referrals/view-referral-dialog';
import { EditSpecialistDialog } from '@/components/referrals/edit-specialist-dialog';
import { listDocuments, setDocument, deleteDocument, updateDocument } from '@/lib/data-client';
import type { Patient } from '@/app/patients/page';

export type Referral = {
  id: string;
  patient: string;
  specialist: string;
  specialty: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'scheduled' | 'completed' | 'pending' | 'cancelled';
  date: string;
  apptDate: string | null;
};

export type Specialist = {
  id: string;
  name: string;
  specialty: string;
  phone?: string;
  email?: string;
  clinicName?: string;
}

export default function ReferralsPage() {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = React.useState(true);
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [specialists, setSpecialists] = React.useState<Specialist[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>([]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [specialistSearchTerm, setSpecialistSearchTerm] = React.useState('');
  const [referralToView, setReferralToView] = React.useState<Referral | null>(null);
  const [specialistToEdit, setSpecialistToEdit] = React.useState<Specialist | null>(null);
  const [specialistToDelete, setSpecialistToDelete] = React.useState<Specialist | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchData() {
        setLoading(true);
        try {
      const [referralsData, specialistsData, patientsData] = await Promise.all([
        listDocuments<Referral>('referrals'),
        listDocuments<Specialist>('specialists'),
        listDocuments<Patient>('patients'),
      ]);
            setReferrals(referralsData);
            setSpecialists(specialistsData);
            setPatients(patientsData);
    } catch (e) {
      toast({ title: t('referrals.toast.error_fetching'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast, t]);

  const referralPageStats = React.useMemo(() => {
    const totalReferrals = referrals.length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;
    const specialistCount = specialists.length;
    
    return [
      { title: t('referrals.total_referrals'), value: totalReferrals, description: t('referrals.all_outgoing_referrals'), valueClassName: "text-blue-500" },
      { title: t('referrals.pending_referrals'), value: pendingReferrals, description: t('referrals.awaiting_specialist_action'), valueClassName: "text-orange-500" },
      { title: t('referrals.completed_referrals'), value: completedReferrals, description: t('referrals.finished_referral_cases'), valueClassName: "text-green-500" },
      { title: t('referrals.specialist_network'), value: specialistCount, description: t('referrals.total_specialists_in_network'), valueClassName: "" },
    ];
  }, [referrals, specialists, t]);

  const handleSaveReferral = async (data: Omit<Referral, 'id'|'specialty'|'date'|'apptDate'|'status'>) => {
    const specialistDetails = specialists.find(s => s.id === data.specialist);
    const patientName = patients.find(p => p.id === data.patient)?.name;

    const newReferral: Referral = {
      id: `REF-${Date.now()}`,
      patient: patientName || 'Unknown Patient',
      specialist: specialistDetails?.name || 'Unknown Specialist',
      specialty: specialistDetails?.specialty || 'Unknown',
      reason: data.reason,
      urgency: data.urgency,
      status: 'pending',
      date: new Date().toLocaleDateString(),
      apptDate: null,
    };
    try {
        await setDocument('referrals', newReferral.id, newReferral);
        setReferrals(prev => [newReferral, ...prev]);
        toast({
          title: t('referrals.toast.referral_sent'),
          description: t('referrals.toast.referral_sent_desc'),
        });
    } catch(e) {
  toast({ title: t('referrals.toast.error_sending_referral'), variant: 'destructive' });
    }
  };

  const handleSaveSpecialist = async (data: Omit<Specialist, 'id'>) => {
    const newSpecialist: Specialist = {
      id: `SPEC-${Date.now()}`,
      ...data,
    };
    try {
        await setDocument('specialists', newSpecialist.id, newSpecialist);
        setSpecialists(prev => [newSpecialist, ...prev]);
        toast({
          title: t('referrals.toast.specialist_added'),
          description: t('referrals.toast.specialist_added_desc'),
        });
    } catch(e) {
  toast({ title: t('referrals.toast.error_adding_specialist'), variant: 'destructive' });
    }
  };

  const handleUpdateSpecialist = async (updatedSpecialist: Specialist) => {
    try {
        await updateDocument('specialists', updatedSpecialist.id, updatedSpecialist);
        setSpecialists(prev => prev.map(s => s.id === updatedSpecialist.id ? updatedSpecialist : s));
        setSpecialistToEdit(null);
    toast({
      title: t('referrals.toast.specialist_updated'),
      description: t('referrals.toast.specialist_updated_desc')
    });
    } catch(e) {
  toast({ title: t('referrals.toast.error_updating_specialist'), variant: 'destructive' });
    }
  };

  const handleDeleteSpecialist = async () => {
    if (specialistToDelete) {
        try {
            await deleteDocument('specialists', specialistToDelete.id);
            setSpecialists(prev => prev.filter(s => s.id !== specialistToDelete.id));
      toast({
        title: t('referrals.toast.specialist_deleted'),
        description: t('referrals.toast.specialist_deleted_desc'),
        variant: "destructive",
      });
            setSpecialistToDelete(null);
        } catch(e) {
            toast({ title: t('referrals.toast.error_deleting_specialist'), variant: 'destructive' });
        }
    }
  };
  
  const handleFollowUp = (referral: Referral) => {
  toast({
    title: t('referrals.toast.followup_sent'),
    description: t('referrals.toast.followup_sent_desc')
  });
  };

  const filteredReferrals = React.useMemo(() => {
    return referrals
      .filter(referral =>
        referral.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referral.specialist.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(referral =>
        statusFilter === 'all' || referral.status.toLowerCase() === statusFilter
      );
  }, [referrals, searchTerm, statusFilter]);

  const filteredSpecialists = React.useMemo(() => {
    return specialists.filter(specialist => 
      specialist.name.toLowerCase().includes(specialistSearchTerm.toLowerCase()) ||
      specialist.specialty.toLowerCase().includes(specialistSearchTerm.toLowerCase())
    );
  }, [specialists, specialistSearchTerm]);


  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto relative" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-200/30 via-teal-200/20 to-cyan-200/10 dark:from-green-900/15 dark:via-teal-900/10 dark:to-cyan-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/30 via-blue-200/20 to-purple-200/10 dark:from-cyan-900/15 dark:via-blue-900/10 dark:to-purple-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Ultra Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-teal-500/5 to-cyan-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* Left side: Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-green-500 via-teal-500 to-cyan-500 text-white shadow-xl">
                    <Send className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-green-500 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">Specialist Network</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient">
                    {t('referrals.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Elite Referral & Specialist Management
                  </p>
                </div>
              </div>

              {/* Right side: Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <AddSpecialistDialog onSave={handleSaveSpecialist} />
                <NewReferralDialog onSave={handleSaveReferral} specialists={specialists} patients={patients} />
              </div>
            </div>
          </div>
        </div>

        {/* Ultra Enhanced Stats Cards */}
        <div className="grid gap-1.5 grid-cols-2 lg:grid-cols-4">
          {referralPageStats.map((stat, index) => {
            const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-orange', 'metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            const icons = [Activity, Clock, CheckCircle2, Users];
            const Icon = icons[index % icons.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-sm transition-all duration-500 hover:scale-105 cursor-pointer group min-h-0",
                  cardStyle
                )}
              >
                {/* Animated Background Layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <CardHeader className="pb-0.5 p-1.5 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide leading-tight mb-1">
                        {stat.title}
                      </CardTitle>
                      <div className="text-base font-bold text-white drop-shadow-md leading-tight group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                    </div>
                    <CardIcon variant={(['blue','green','orange','purple'] as const)[index % 4]} className="w-6 h-6 group-hover:rotate-12">
                      <Icon className="h-3.5 w-3.5" />
                    </CardIcon>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 p-1.5 relative z-10">
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 font-medium leading-tight">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ultra Enhanced Tabs */}
        <Tabs defaultValue="outgoing" className="w-full">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-cyan-500/5 rounded-2xl blur-xl"></div>
            <TabsList className="relative bg-background/80 backdrop-blur-xl border-2 border-muted/50 p-1.5 rounded-2xl grid w-full grid-cols-2 lg:grid-cols-4 shadow-lg">
              <TabsTrigger 
                value="outgoing" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <Send className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('referrals.tabs.outgoing')}
              </TabsTrigger>
              <TabsTrigger 
                value="incoming" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <Eye className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('referrals.tabs.incoming')}
              </TabsTrigger>
              <TabsTrigger 
                value="network" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <Users className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('referrals.tabs.network')}
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="rounded-xl px-3 sm:px-6 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <TrendingUp className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('referrals.tabs.analytics')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="outgoing" className="mt-0">
            <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
              <CardHeader className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between border-b-2 border-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10">
                    <Send className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-black bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 bg-clip-text text-transparent">
                    {t('referrals.outgoing_referrals')}
                  </CardTitle>
                </div>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
                    <Input
                      type="search"
            placeholder={t('referrals.search_referrals')}
                      className={cn("w-full rounded-lg bg-background lg:w-[336px]", isRTL ? 'pr-8 text-right' : 'pl-8')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('referrals.all_status')} />
                    </SelectTrigger>
                    <SelectContent>
            <SelectItem value="all">{t('referrals.all_status')}</SelectItem>
            <SelectItem value="scheduled">{t('referrals.scheduled')}</SelectItem>
            <SelectItem value="completed">{t('common.completed')}</SelectItem>
            <SelectItem value="pending">{t('common.pending')}</SelectItem>
            <SelectItem value="cancelled">{t('common.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="rounded-xl border-2 border-muted/50 overflow-hidden">
                  <Table
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className={cn(
                      isRTL
                        ? 'text-right [&_th]:text-right [&_td]:text-right'
                        : 'text-left [&_th]:text-left [&_td]:text-left'
                    )}
                  >
                    <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                      <TableRow className="hover:bg-transparent border-b-2 border-muted/50">
                        <TableHead className="font-bold text-foreground">{t('referrals.patient')}</TableHead>
                        <TableHead className="font-bold text-foreground">{t('referrals.specialist')}</TableHead>
                        <TableHead className="font-bold text-foreground">{t('referrals.reason')}</TableHead>
                        <TableHead className="font-bold text-foreground">{t('referrals.urgency')}</TableHead>
                        <TableHead className="font-bold text-foreground">{t('referrals.status')}</TableHead>
                        <TableHead className="font-bold text-foreground">{t('referrals.referral_date')}</TableHead>
                        <TableHead className={cn(isRTL ? 'text-left font-bold text-foreground' : 'text-right font-bold text-foreground')}>{t('referrals.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredReferrals.length > 0 ? (
                      filteredReferrals.map((referral) => (
                        <TableRow key={referral.id} className="group hover:bg-gradient-to-r hover:from-green-50/50 hover:to-teal-50/30 dark:hover:from-green-950/20 dark:hover:to-teal-950/10 transition-all duration-300">
                          <TableCell className="font-bold">{referral.patient}</TableCell>
                          <TableCell>
                            <div className="font-medium">{referral.specialist}</div>
                            <div className="text-xs text-muted-foreground">{referral.specialty}</div>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">{referral.reason}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={referral.urgency === 'urgent' || referral.urgency === 'emergency' ? 'destructive' : 'outline'} 
                              className={cn(
                                "capitalize font-bold",
                                referral.urgency === 'routine' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                              )}
                            >
                              {referral.urgency === 'routine' && (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  {t('referrals.urgency.routine')}
                                </>
                              )}
                              {referral.urgency === 'urgent' && (
                                <>
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {t('referrals.urgency.urgent')}
                                </>
                              )}
                              {referral.urgency === 'emergency' && (
                                <>
                                  <AlertCircle className="h-3 w-3 mr-1 animate-pulse" />
                                  {t('referrals.urgency.emergency')}
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                             <Badge
                                variant={
                                    referral.status === 'scheduled'
                                    ? 'default'
                                    : 'outline'
                                }
                                className={cn(
                                    "capitalize",
                                    referral.status === 'scheduled' && 'bg-foreground text-background hover:bg-foreground/80',
                                    referral.status === 'completed' && 'bg-green-100 text-green-800 border-transparent hover:bg-green-100/80',
                                )}
                                >
                {referral.status === 'scheduled' && t('referrals.scheduled')}
                {referral.status === 'completed' && t('common.completed')}
                {referral.status === 'pending' && t('common.pending')}
                {referral.status === 'cancelled' && t('common.cancelled')}
                                </Badge>
                          </TableCell>
                          <TableCell>
                            <div>{referral.date}</div>
                            {referral.apptDate && <div className="text-xs text-muted-foreground">{referral.apptDate}</div>}
                          </TableCell>
                          <TableCell className={cn(isRTL ? 'text-left' : 'text-right')}>
                            <div className={cn('flex items-center gap-2', isRTL ? 'justify-start' : 'justify-end')}>
                              <Button variant="outline" size="sm" onClick={() => setReferralToView(referral)}>
                                <Eye className={cn("h-3 w-3", isRTL ? 'ml-2' : 'mr-2')} />
                {t('referrals.actions.view')}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleFollowUp(referral)}>
                                <Send className={cn("h-3 w-3", isRTL ? 'ml-2' : 'mr-2')} />
                {t('referrals.actions.follow_up')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-48 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-teal-500/10">
                              <Send className="h-12 w-12 text-green-500" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold mb-1">{t('referrals.no_outgoing_referrals')}</h3>
                              <p className="text-xs text-muted-foreground">Create your first referral to get started</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="incoming" className="mt-0">
            <Card className="border-2 border-dashed border-muted shadow-xl">
              <CardContent className="flex h-48 items-center justify-center p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10">
                      <Eye className="h-12 w-12 text-teal-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1">{t('referrals.no_incoming_referrals')}</h3>
                    <p className="text-xs text-muted-foreground">No incoming referrals at this time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="network" className="mt-0">
             <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
                <CardHeader className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between border-b-2 border-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                      <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                      {t('referrals.specialist_network')}
                    </CardTitle>
                  </div>
                    <div className="relative w-full md:w-auto">
                        <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
                        <Input
                        type="search"
            placeholder={t('referrals.search_specialists')}
                        className={cn("w-full rounded-lg bg-background lg:w-[336px]", isRTL ? 'pr-8 text-right' : 'pl-8')}
                        value={specialistSearchTerm}
                        onChange={(e) => setSpecialistSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                    <div className="rounded-xl border-2 border-muted/50 overflow-hidden">
                      <Table
                        dir={isRTL ? 'rtl' : 'ltr'}
                        className={cn(
                          isRTL
                            ? 'text-right [&_th]:text-right [&_td]:text-right'
                            : 'text-left [&_th]:text-left [&_td]:text-left'
                        )}
                      >
                        <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                            <TableRow className="hover:bg-transparent border-b-2 border-muted/50">
                              <TableHead className="font-bold text-foreground">{t('referrals.specialist')}</TableHead>
                              <TableHead className="font-bold text-foreground">{t('referrals.specialty')}</TableHead>
                              <TableHead className="font-bold text-foreground">{t('referrals.contact_info')}</TableHead>
                              <TableHead className={cn(isRTL ? 'text-left font-bold text-foreground' : 'text-right font-bold text-foreground')}>{t('referrals.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                            ) : filteredSpecialists.length > 0 ? (
                                filteredSpecialists.map((specialist) => (
                                    <TableRow key={specialist.id} className="group hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/30 dark:hover:from-cyan-950/20 dark:hover:to-blue-950/10 transition-all duration-300">
                                        <TableCell>
                                            <div className="font-medium">{specialist.name}</div>
                                            {specialist.clinicName && <div className="text-xs text-muted-foreground">{specialist.clinicName}</div>}
                                        </TableCell>
                                        <TableCell>{specialist.specialty}</TableCell>
                                        <TableCell>
                                            {specialist.phone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{specialist.phone}</span>
                                                </div>
                                            )}
                                            {specialist.email && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{specialist.email}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className={cn(isRTL ? 'text-left' : 'text-right')}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                          <DropdownMenuItem onClick={() => setSpecialistToEdit(specialist)}>
                            <Pencil className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                            {t('referrals.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSpecialistToDelete(specialist)} className="text-destructive">
                            <Trash2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                            {t('referrals.delete')}
                          </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center">
                                      <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                                          <Users className="h-12 w-12 text-cyan-500" />
                                        </div>
                                        <div>
                                          <h3 className="text-sm font-bold mb-1">{t('referrals.no_specialists_found')}</h3>
                                          <p className="text-xs text-muted-foreground">Add specialists to your network</p>
                                        </div>
                                      </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="analytics" className="mt-0">
            <Card className="border-2 border-dashed border-muted shadow-xl">
              <CardContent className="flex h-48 items-center justify-center p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      <TrendingUp className="h-12 w-12 text-blue-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1">{t('referrals.analytics_placeholder')}</h3>
                    <p className="text-xs text-muted-foreground">Analytics & insights coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

        <ViewReferralDialog 
            referral={referralToView}
            open={!!referralToView}
            onOpenChange={(isOpen) => !isOpen && setReferralToView(null)}
        />
        
        {specialistToEdit && (
            <EditSpecialistDialog 
                specialist={specialistToEdit}
                onSave={handleUpdateSpecialist}
                open={!!specialistToEdit}
                onOpenChange={(isOpen) => !isOpen && setSpecialistToEdit(null)}
            />
        )}

        <AlertDialog open={!!specialistToDelete} onOpenChange={(isOpen) => !isOpen && setSpecialistToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('referrals.confirm_delete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('referrals.specialist_delete_warning')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSpecialist}>{t('referrals.delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

    </DashboardLayout>
  );
}
