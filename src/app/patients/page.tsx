
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import { cn } from "@/lib/utils";
import { 
  Search, 
  User, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Loader2, 
  UserPlus, 
  UserMinus, 
  UserCheck, 
  Eye, 
  History,
  Users as UsersIcon,
  Sparkles,
  Filter,
  SortAsc,
  Calendar,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import { AddPatientDialog } from "@/components/dashboard/add-patient-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditPatientDialog } from '@/components/patients/edit-patient-dialog';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listCollection, patchDocument, removeDocument, generateDocumentId, setDocument } from '@/lib/collections-client';
import { ViewPatientDialog } from '@/components/patients/view-patient-dialog';
import { ComprehensivePatientHistory } from '@/components/patients/comprehensive-patient-history';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMaxWidth } from '@/hooks/use-breakpoint';
import { MobileCard, MobileCardField } from '@/components/ui/responsive-table';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Patient } from '@/lib/types';

export type { Patient } from '@/lib/types';


const iconMap = {
    User,
    UserPlus,
    UserMinus,
    UserCheck
}

type IconKey = keyof typeof iconMap;

export default function PatientsPage() {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [patientToView, setPatientToView] = React.useState<Patient | null>(null);
  const [patientToEdit, setPatientToEdit] = React.useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = React.useState<Patient | null>(null);
  const [patientForHistory, setPatientForHistory] = React.useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [showHistory, setShowHistory] = React.useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const isCompact = useMaxWidth(1024); // treat tablets/smaller laptops as compact for this page
  const { t, isRTL } = useLanguage();

  React.useEffect(() => {
    async function fetchPatients() {
      try {
        const data = await listCollection<any>('patients');
        setPatients(data.map(p => ({...p, dob: new Date(p.dob) })));
      } catch (error) {
    toast({ title: t('patients.error_fetching'), description: t('patients.error_fetching_description'), variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, [toast, t]);
  
  const patientPageStats = React.useMemo(() => {
    const totalPatients = patients.length;
    const newPatients = patients.filter(p => {
        const lastVisitDate = new Date(p.lastVisit);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastVisitDate > thirtyDaysAgo;
    }).length;
    const inactivePatients = patients.filter(p => p.status === 'Inactive').length;
    const averageAge = totalPatients > 0 ? Math.round(patients.reduce((acc, p) => acc + p.age, 0) / totalPatients) : 0;

   return [
     { title: t('patients.total_patients'), value: totalPatients, icon: "User", description: t('patients.all_patients_description'), cardStyle: 'metric-card-blue' },
     { title: t('patients.new_patients_30d'), value: newPatients, icon: "UserPlus", description: t('patients.recent_visits_description'), cardStyle: 'metric-card-green' },
     { title: t('patients.inactive_patients'), value: inactivePatients, icon: "UserMinus", description: t('patients.inactive_description'), cardStyle: 'metric-card-orange' },
     { title: t('patients.average_age'), value: averageAge, icon: "UserCheck", description: t('patients.average_age_description'), cardStyle: 'metric-card-purple' },
   ];
  }, [patients, t]);


  const handleSavePatient = async (newPatientData: Omit<Patient, 'id'>) => {
    try {
        const newPatient = { ...newPatientData, id: generateDocumentId('PAT') };
        // Use PUT upsert to create or replace the document with a client-generated ID
        await setDocument('patients', newPatient.id, { ...newPatient, dob: newPatient.dob.toISOString() });
        setPatients(prev => [newPatient, ...prev]);
  toast({ title: t('patients.patient_added'), description: t('patients.patient_added_description') });
    } catch (error) {
  toast({ title: t('patients.error_adding'), variant: "destructive" });
    }
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
        await patchDocument('patients', updatedPatient.id, { ...updatedPatient, dob: updatedPatient.dob.toISOString() });
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        setPatientToEdit(null);
  toast({ title: t('patients.patient_updated'), description: t('patients.patient_updated_description') });
    } catch (error) {
  toast({ title: t('patients.error_updating'), variant: "destructive" });
    }
  };

  const handleDeletePatient = async () => {
    if (patientToDelete) {
      try {
        await removeDocument('patients', patientToDelete.id);
        setPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
  toast({ title: t('patients.patient_deleted'), description: t('patients.patient_deleted_description'), variant: "destructive" });
        setPatientToDelete(null);
      } catch (error) {
  toast({ title: t('patients.error_deleting'), variant: "destructive" });
      }
    }
  };

  const filteredPatients = React.useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    return patients
      .filter(patient => {
        return (
          patient.name.toLowerCase().includes(lowercasedTerm) ||
          patient.email.toLowerCase().includes(lowercasedTerm) ||
          patient.phone.includes(lowercasedTerm)
        );
      })
      .filter(patient => 
        statusFilter === 'all' || patient.status.toLowerCase() === statusFilter
      );
  }, [patients, searchTerm, statusFilter]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto overflow-x-hidden relative">
          {/* Decorative Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/25 via-purple-200/15 to-pink-200/10 dark:from-blue-900/12 dark:via-purple-900/8 dark:to-pink-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 -left-40 w-96 h-96 bg-gradient-to-tr from-green-200/25 via-cyan-200/15 to-blue-200/10 dark:from-green-900/12 dark:via-cyan-900/8 dark:to-blue-900/5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          </div>

          {/* Enhanced Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-xl">
                      <UsersIcon className="h-8 w-8" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 dark:from-blue-400 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient">
                      {t('patients.title')}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      إدارة شاملة لسجلات المرضى
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <AddPatientDialog onSave={handleSavePatient} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {patientPageStats.map((stat, idx) => {
              const Icon = iconMap[stat.icon as IconKey];
              const variants = ['blue','green','orange','purple'] as const;
              const variant = variants[idx % variants.length];
              return (
                <Card
                  key={stat.title}
                  className={cn(
                    'relative overflow-hidden border-0 shadow-xl transition-all duration-500 group',
                    stat.cardStyle
                  )}
                  role="button"
                  tabIndex={0}
                  aria-label={stat.title}
                  onClick={() => {
                    if (idx === 2) setStatusFilter('inactive');
                    else setStatusFilter('all');
                    setSearchTerm('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      (e.currentTarget as HTMLDivElement).click();
                    }
                  }}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                    <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <CardIcon variant={variant} aria-hidden="true">
                      <Icon className="h-5 w-5" />
                    </CardIcon>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="group relative border-2 border-muted hover:border-blue-200 dark:hover:border-blue-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-blue-50/10 dark:to-blue-950/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <CardHeader className="relative z-10 flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors">
                  <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {t('patients.patient_directory')}
                </CardTitle>
              </div>
              
              <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
                {/* Enhanced Search Bar */}
                <div className="relative w-full md:w-auto group/search">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover/search:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover/search:text-blue-500 transition-colors duration-300" />
                    <Input
                      type="search"
                      placeholder={t('patients.search_patients')}
                      className="w-full rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted hover:border-blue-300 dark:hover:border-blue-700 focus:border-blue-500 dark:focus:border-blue-600 pl-10 pr-4 py-5 h-auto lg:w-[320px] shadow-sm hover:shadow-md transition-all duration-300"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Enhanced Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[160px] h-auto py-3 rounded-xl border-2 border-muted hover:border-purple-300 dark:hover:border-purple-700 focus:border-purple-500 dark:focus:border-purple-600 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <SelectValue placeholder={t('patients.select_status')} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all_status')}</SelectItem>
                    <SelectItem value="active">{t('common.active')}</SelectItem>
                    <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className={cn("p-0", (isCompact || isMobile) && "sm:p-6")}>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {t('common.loading')}
                </div>
              ) : (isCompact || isMobile) ? (
                filteredPatients.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {filteredPatients.map((patient) => (
                      <MobileCard key={patient.id}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </span>
                            <div className="space-y-1">
                              <p className="text-base font-semibold">{`${patient.name} ${patient.lastName}`}</p>
                              <p className="text-xs text-muted-foreground">{t('patients.age')}: {patient.age}</p>
                            </div>
                          </div>
                          <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'}>
                            {patient.status === 'Active' ? t('common.active') : t('common.inactive')}
                          </Badge>
                        </div>

                        <div className="grid gap-2 pt-3 text-sm">
                          <MobileCardField label={t('patients.email')} value={patient.email} />
                          <MobileCardField label={t('common.phone')} value={patient.phone || t('common.na')} />
                          <MobileCardField label={t('patients.date_of_birth')} value={format(patient.dob, 'PPP')} />
                          <MobileCardField label={t('patients.address')} value={patient.address || t('common.na')} className={isRTL ? 'items-start text-right' : 'items-start text-left'} />
                          <MobileCardField
                            label={t('patients.emergency_contact')}
                            value={
                              <span className={cn('flex flex-col', isRTL ? 'text-right' : 'text-left')}>
                                <span>{patient.ecName || t('common.na')}</span>
                                <span className="text-xs text-muted-foreground">
                                  {patient.ecPhone || t('common.na')}{' '}
                                  {patient.ecRelationship ? `(${patient.ecRelationship})` : ''}
                                </span>
                              </span>
                            }
                            className={isRTL ? 'items-start text-right' : 'items-start text-left'}
                          />
                          <MobileCardField label={t('patients.insurance_provider')} value={patient.insuranceProvider || t('common.na')} />
                          <MobileCardField label={t('patients.policy_number')} value={patient.policyNumber || t('common.na')} />
                          <MobileCardField
                            label={t('patients.medical_history')}
                            value={
                              patient.medicalHistory && patient.medicalHistory.length > 0
                                ? patient.medicalHistory.map((h) => h.condition).join(', ')
                                : t('common.na')
                            }
                            className={isRTL ? 'items-start text-right' : 'items-start text-left'}
                          />
                          <MobileCardField label={t('patients.last_visit')} value={patient.lastVisit || t('common.na')} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-4">
                          <Button size="sm" variant="secondary" onClick={() => setPatientToView(patient)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('table.view_details')}
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setPatientForHistory(patient)}>
                            <History className="mr-2 h-4 w-4" />
                            {t('patients.complete_history')}
                          </Button>
                          <Button size="sm" onClick={() => setPatientToEdit(patient)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('table.edit')}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setPatientToDelete(patient)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('table.delete')}
                          </Button>
                        </div>
                      </MobileCard>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
                    <User className="h-12 w-12" />
                    <h3 className="text-sm font-semibold text-foreground">{t('patients.no_patients_found')}</h3>
                    <p className="text-sm">{t('patients.adjust_search_filters')}</p>
                  </div>
                )
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">{t('common.patient')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('patients.email')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('common.phone')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('patients.date_of_birth')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('patients.address')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('patients.emergency_contact')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('patients.insurance_provider')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('patients.policy_number')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('patients.medical_history')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('patients.last_visit')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('common.status')}</TableHead>
                        <TableHead className="text-right whitespace-nowrap">{t('table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{`${patient.name} ${patient.lastName}`}</div>
                                  <div className="text-xs text-muted-foreground">{t('patients.age')}: {patient.age}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{patient.email}</TableCell>
                            <TableCell className="whitespace-nowrap">{patient.phone || t('common.na')}</TableCell>
                            <TableCell className="whitespace-nowrap">{format(patient.dob, 'PPP')}</TableCell>
                            <TableCell className="whitespace-nowrap max-w-xs truncate">{patient.address || t('common.na')}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div>{patient.ecName || t('common.na')}</div>
                              <div className="text-xs text-muted-foreground">{patient.ecPhone || t('common.na')} {patient.ecRelationship ? `(${patient.ecRelationship})` : ''}</div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{patient.insuranceProvider || t('common.na')}</TableCell>
                            <TableCell className="whitespace-nowrap">{patient.policyNumber || t('common.na')}</TableCell>
                            <TableCell className="whitespace-nowrap max-w-xs truncate">
                              {patient.medicalHistory && patient.medicalHistory.length > 0
                                ? patient.medicalHistory.map((h) => h.condition).join(', ')
                                : t('common.na')}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{patient.lastVisit}</TableCell>
                            <TableCell className="whitespace-nowrap">{patient.status === 'Active' ? t('common.active') : t('common.inactive')}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">{t('table.actions')}</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setPatientToView(patient)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t('table.view_details')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setPatientForHistory(patient)}>
                                    <History className="mr-2 h-4 w-4" />
                                    {t('patients.complete_history')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setPatientToEdit(patient)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t('table.edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setPatientToDelete(patient)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t('table.delete')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={12} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <User className="h-12 w-12 text-muted-foreground mb-2" />
                              <h3 className="text-sm font-semibold">{t('patients.no_patients_found')}</h3>
                              <p className="text-sm text-muted-foreground">{t('patients.adjust_search_filters')}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
              )}
          </CardContent>
          </Card>
        </main>

        <ViewPatientDialog
          patient={patientToView}
          open={!!patientToView}
          onOpenChange={(isOpen) => !isOpen && setPatientToView(null)}
        />

        {patientForHistory && (
          <ComprehensivePatientHistory
            patient={patientForHistory}
            open={!!patientForHistory}
            onOpenChange={(isOpen) => !isOpen && setPatientForHistory(null)}
          />
        )}

        {patientToEdit && (
          <EditPatientDialog
            patient={patientToEdit}
            onSave={handleUpdatePatient}
            open={!!patientToEdit}
            onOpenChange={(isOpen) => !isOpen && setPatientToEdit(null)}
          />
        )}

        <AlertDialog open={!!patientToDelete} onOpenChange={(isOpen) => !isOpen && setPatientToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('patients.delete_confirmation')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePatient}>{t('common.delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
