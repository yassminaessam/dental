
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
import { Search, Send, Eye, Phone, Mail, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { AddSpecialistDialog } from "@/components/referrals/add-specialist-dialog";
import { NewReferralDialog } from "@/components/referrals/new-referral-dialog";
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ViewReferralDialog } from '@/components/referrals/view-referral-dialog';
import { EditSpecialistDialog } from '@/components/referrals/edit-specialist-dialog';
import { getCollection, setDocument, deleteDocument, updateDocument } from '@/services/firestore';
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
  const { t } = useLanguage();
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
                getCollection<Referral>('referrals'),
                getCollection<Specialist>('specialists'),
                getCollection<Patient>('patients'),
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
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">{t('referrals.title')}</h1>
          <div className="flex items-center gap-2">
            <AddSpecialistDialog onSave={handleSaveSpecialist} />
            <NewReferralDialog onSave={handleSaveReferral} specialists={specialists} patients={patients} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {referralPageStats.map((stat) => (
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

    <Tabs defaultValue="outgoing">
          <TabsList>
      <TabsTrigger value="outgoing">{t('referrals.tabs.outgoing')}</TabsTrigger>
      <TabsTrigger value="incoming">{t('referrals.tabs.incoming')}</TabsTrigger>
      <TabsTrigger value="network">{t('referrals.tabs.network')}</TabsTrigger>
      <TabsTrigger value="analytics">{t('referrals.tabs.analytics')}</TabsTrigger>
          </TabsList>
          <TabsContent value="outgoing" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <CardTitle>{t('referrals.outgoing_referrals')}</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
            placeholder={t('referrals.search_referrals')}
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
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
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
            <TableHead>{t('referrals.patient')}</TableHead>
            <TableHead>{t('referrals.specialist')}</TableHead>
            <TableHead>{t('referrals.reason')}</TableHead>
            <TableHead>{t('referrals.urgency')}</TableHead>
            <TableHead>{t('referrals.status')}</TableHead>
            <TableHead>{t('referrals.referral_date')}</TableHead>
            <TableHead className="text-right">{t('referrals.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredReferrals.length > 0 ? (
                      filteredReferrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell className="font-medium">{referral.patient}</TableCell>
                          <TableCell>
                            <div className="font-medium">{referral.specialist}</div>
                            <div className="text-xs text-muted-foreground">{referral.specialty}</div>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">{referral.reason}</TableCell>
                          <TableCell>
                            <Badge variant={referral.urgency === 'urgent' ? 'destructive' : 'outline'} className="capitalize">
                {referral.urgency === 'routine' && t('referrals.urgency.routine')}
                {referral.urgency === 'urgent' && t('referrals.urgency.urgent')}
                {referral.urgency === 'emergency' && t('referrals.urgency.emergency')}
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
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setReferralToView(referral)}>
                                <Eye className="mr-2 h-3 w-3" />
                {t('referrals.actions.view')}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleFollowUp(referral)}>
                                <Send className="mr-2 h-3 w-3" />
                {t('referrals.actions.follow_up')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
              {t('referrals.no_outgoing_referrals')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="incoming" className="mt-4">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
        <p>{t('referrals.no_incoming_referrals')}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="network" className="mt-4">
             <Card>
                <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <CardTitle>{t('referrals.specialist_network')}</CardTitle>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
            placeholder={t('referrals.search_specialists')}
                        className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                        value={specialistSearchTerm}
                        onChange={(e) => setSpecialistSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                <TableHead>{t('referrals.specialist')}</TableHead>
                <TableHead>{t('referrals.specialty')}</TableHead>
                <TableHead>{t('referrals.contact_info')}</TableHead>
                <TableHead className="text-right">{t('referrals.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                            ) : filteredSpecialists.length > 0 ? (
                                filteredSpecialists.map((specialist) => (
                                    <TableRow key={specialist.id}>
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
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSpecialistToEdit(specialist)}><Pencil className="mr-2 h-4 w-4" />{t('referrals.edit')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSpecialistToDelete(specialist)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t('referrals.delete')}</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                    {t('referrals.no_specialists_found')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="analytics" className="mt-4">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-center text-muted-foreground">
        <p>{t('referrals.analytics_placeholder')}</p>
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
