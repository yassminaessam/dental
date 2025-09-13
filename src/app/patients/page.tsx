
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
import { Search, User, MoreHorizontal, Pencil, Trash2, Loader2, UserPlus, UserMinus, UserCheck, Eye, History } from "lucide-react";
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
import { listDocuments, setDocument, updateDocument, deleteDocument } from '@/lib/data-client';
import { ViewPatientDialog } from '@/components/patients/view-patient-dialog';
import { ComprehensivePatientHistory } from '@/components/patients/comprehensive-patient-history';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResponsiveTableWrapper, MobileCard, MobileCardField } from '@/components/ui/responsive-table';
import { useLanguage } from '@/contexts/LanguageContext';

export type Patient = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  dob: Date;
  age: number;
  lastVisit: string;
  status: 'Active' | 'Inactive';
  address?: string;
  ecName?: string;
  ecPhone?: string;
  ecRelationship?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  medicalHistory?: { condition: string }[];
};


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
  const { t } = useLanguage();

  React.useEffect(() => {
    async function fetchPatients() {
      try {
  const data = await listDocuments<any>('patients');
  setPatients(data.map((p: any) => ({...p, dob: new Date(p.dob) })));
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
     { title: t('patients.total_patients'), value: totalPatients, icon: "User", description: t('patients.all_patients_description') },
     { title: t('patients.new_patients_30d'), value: newPatients, icon: "UserPlus", description: t('patients.recent_visits_description'), valueClassName: "text-green-600" },
     { title: t('patients.inactive_patients'), value: inactivePatients, icon: "UserMinus", description: t('patients.inactive_description'), valueClassName: "text-red-600" },
     { title: t('patients.average_age'), value: averageAge, icon: "UserCheck", description: t('patients.average_age_description') },
   ];
  }, [patients, t]);


  const handleSavePatient = async (newPatientData: Omit<Patient, 'id'>) => {
    try {
        const newPatient = { ...newPatientData, id: `PAT-${Date.now()}`};
        await setDocument('patients', newPatient.id, { ...newPatient, dob: newPatient.dob.toISOString() });
        setPatients(prev => [newPatient, ...prev]);
  toast({ title: t('patients.patient_added'), description: t('patients.patient_added_description') });
    } catch (error) {
  toast({ title: t('patients.error_adding'), variant: "destructive" });
    }
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
        await updateDocument('patients', updatedPatient.id, { ...updatedPatient, dob: updatedPatient.dob.toISOString() });
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
        await deleteDocument('patients', patientToDelete.id);
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
        <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto">
          {/* Elite Header Section */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Patient Management</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('patients.title')}
              </h1>
              <p className="text-muted-foreground font-medium">Elite Patient Registry</p>
            </div>
            <div className="flex items-center gap-3">
              <AddPatientDialog onSave={handleSavePatient} />
            </div>
          </div>

          {/* Elite Patient Stats */}
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
            {patientPageStats.map((stat, index) => {
              const Icon = iconMap[stat.icon as IconKey];
              const cardStyles = [
                'metric-card-blue',
                'metric-card-green', 
                'metric-card-orange',
                'metric-card-purple'
              ];
              const cardStyle = cardStyles[index % cardStyles.length];
              
              return (
                <Card 
                  key={stat.title}
                  className={cn(
                    "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group",
                    cardStyle
                  )}
                >
                  {/* Animated Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                        {stat.title}
                      </CardTitle>
                      <div className="text-2xl font-bold text-white drop-shadow-sm">
                        {stat.value}
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                      <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 relative z-10">
                    <p className="text-xs text-white/80 font-medium">
                      {stat.description}
                    </p>
                    {/* Elite Status Indicator */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                      <span className="text-xs text-white/70 font-medium">Active</span>
                    </div>
                  </CardContent>
                  
                  {/* Elite Corner Accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent" />
                </Card>
              );
            })}
          </div>

          {/* Elite Patient Directory */}
          <Card className="elite-card">
            <CardHeader className="flex flex-col gap-4 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <div className="w-4 h-4 rounded bg-primary"></div>
                </div>
                {t('patients.patient_directory')}
              </CardTitle>
              <div className="flex w-full flex-col items-center gap-3 md:w-auto md:flex-row">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('patients.search_patients')}
                    className="w-full rounded-xl bg-background/60 backdrop-blur-sm border-border/50 pl-10 h-11 text-sm font-medium placeholder:text-muted-foreground/70 focus:bg-background/80 focus:border-primary/50 transition-all duration-300 lg:w-[320px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[150px] h-9 sm:h-10">
                    <SelectValue placeholder={t('patients.select_status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all_status')}</SelectItem>
                    <SelectItem value="active">{t('common.active')}</SelectItem>
                    <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {t('common.loading')}
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                </div>
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
