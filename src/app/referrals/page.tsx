
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
            toast({ title: 'Error fetching data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast]);

  const referralPageStats = React.useMemo(() => {
    const totalReferrals = referrals.length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;
    const specialistCount = specialists.length;
    
    return [
      { title: "Total Referrals", value: totalReferrals, description: "All outgoing referrals", valueClassName: "text-blue-500" },
      { title: "Pending Referrals", value: pendingReferrals, description: "Awaiting specialist action", valueClassName: "text-orange-500" },
      { title: "Completed Referrals", value: completedReferrals, description: "Finished referral cases", valueClassName: "text-green-500" },
      { title: "Specialist Network", value: specialistCount, description: "Total specialists in network", valueClassName: "" },
    ];
  }, [referrals, specialists]);

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
          title: "Referral Sent",
          description: `Referral for ${newReferral.patient} to ${newReferral.specialist} has been sent.`,
        });
    } catch(e) {
        toast({ title: 'Error sending referral', variant: 'destructive' });
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
          title: "Specialist Added",
          description: `${newSpecialist.name} has been added to your network.`,
        });
    } catch(e) {
        toast({ title: 'Error adding specialist', variant: 'destructive' });
    }
  };

  const handleUpdateSpecialist = async (updatedSpecialist: Specialist) => {
    try {
        await updateDocument('specialists', updatedSpecialist.id, updatedSpecialist);
        setSpecialists(prev => prev.map(s => s.id === updatedSpecialist.id ? updatedSpecialist : s));
        setSpecialistToEdit(null);
        toast({
            title: "Specialist Updated",
            description: `${updatedSpecialist.name}'s details have been updated.`
        });
    } catch(e) {
        toast({ title: 'Error updating specialist', variant: 'destructive' });
    }
  };

  const handleDeleteSpecialist = async () => {
    if (specialistToDelete) {
        try {
            await deleteDocument('specialists', specialistToDelete.id);
            setSpecialists(prev => prev.filter(s => s.id !== specialistToDelete.id));
            toast({
                title: "Specialist Deleted",
                description: `${specialistToDelete.name} has been removed from your network.`,
                variant: "destructive",
            });
            setSpecialistToDelete(null);
        } catch(e) {
            toast({ title: 'Error deleting specialist', variant: 'destructive' });
        }
    }
  };
  
  const handleFollowUp = (referral: Referral) => {
    toast({
        title: "Follow-up Sent",
        description: `A follow-up message has been sent regarding the referral for ${referral.patient}.`
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
          <h1 className="text-3xl font-bold">Referral Management</h1>
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
            <TabsTrigger value="outgoing">Outgoing Referrals</TabsTrigger>
            <TabsTrigger value="incoming">Incoming Referrals</TabsTrigger>
            <TabsTrigger value="network">Specialist Network</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="outgoing" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Outgoing Referrals</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search referrals..."
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Specialist</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Referral Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                              {referral.urgency}
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
                                {referral.status}
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
                                View
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleFollowUp(referral)}>
                                <Send className="mr-2 h-3 w-3" />
                                Follow Up
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No outgoing referrals found.
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
                <p>No incoming referrals found.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="network" className="mt-4">
             <Card>
                <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                    <CardTitle>Specialist Network</CardTitle>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search specialists..."
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
                                <TableHead>Specialist</TableHead>
                                <TableHead>Specialty</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
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
                                                    <DropdownMenuItem onClick={() => setSpecialistToEdit(specialist)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setSpecialistToDelete(specialist)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No specialists found.
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
                <p>Referral analytics will be available here.</p>
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
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete "{specialistToDelete?.name}" from your specialist network.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSpecialist}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}
