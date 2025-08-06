
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
import { Search, User, MoreHorizontal, Pencil, Trash2, Loader2, UserPlus, UserMinus, UserCheck, Eye } from "lucide-react";
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
import { getCollection, setDocument, updateDocument, deleteDocument } from '@/services/firestore';
import { ViewPatientDialog } from '@/components/patients/view-patient-dialog';
import { ComprehensivePatientHistory } from '@/components/patients/comprehensive-patient-history';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResponsiveTableWrapper, MobileCard, MobileCardField } from '@/components/ui/responsive-table';

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
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [showHistory, setShowHistory] = React.useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    async function fetchPatients() {
      try {
        const data = await getCollection<any>('patients');
        setPatients(data.map(p => ({...p, dob: new Date(p.dob) })));
      } catch (error) {
        toast({ title: 'Error fetching patients', description: 'Could not load patient data from the database.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, [toast]);
  
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
       { title: "Total Patients", value: totalPatients, icon: "User", description: "All patients in the system" },
       { title: "New Patients (30d)", value: newPatients, icon: "UserPlus", description: "Patients with recent visits", valueClassName: "text-green-600" },
       { title: "Inactive Patients", value: inactivePatients, icon: "UserMinus", description: "Patients marked as inactive", valueClassName: "text-red-600" },
       { title: "Average Age", value: averageAge, icon: "UserCheck", description: "Average patient age" },
    ];
  }, [patients]);


  const handleSavePatient = async (newPatientData: Omit<Patient, 'id'>) => {
    try {
        const newPatient = { ...newPatientData, id: `PAT-${Date.now()}`};
        await setDocument('patients', newPatient.id, { ...newPatient, dob: newPatient.dob.toISOString() });
        setPatients(prev => [newPatient, ...prev]);
        toast({ title: "Patient Added", description: `${newPatient.name} has been successfully added.` });
    } catch (error) {
        toast({ title: "Error adding patient", variant: "destructive" });
    }
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
        await updateDocument('patients', updatedPatient.id, { ...updatedPatient, dob: updatedPatient.dob.toISOString() });
        setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        setPatientToEdit(null);
        toast({ title: "Patient Updated", description: `${updatedPatient.name}'s record has been updated.` });
    } catch (error) {
        toast({ title: "Error updating patient", variant: "destructive" });
    }
  };

  const handleDeletePatient = async () => {
    if (patientToDelete) {
      try {
        await deleteDocument('patients', patientToDelete.id);
        setPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
        toast({ title: "Patient Deleted", description: `${patientToDelete.name}'s record has been deleted.`, variant: "destructive" });
        setPatientToDelete(null);
      } catch (error) {
        toast({ title: "Error deleting patient", variant: "destructive" });
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
      <main className="flex w-full flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Patients</h1>
          <AddPatientDialog onSave={handleSavePatient} />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {patientPageStats.map((stat) => {
            const Icon = iconMap[stat.icon as IconKey];
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={cn("text-lg sm:text-2xl font-bold", stat.valueClassName)}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg sm:text-xl">Patient Directory</CardTitle>
            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="w-full rounded-lg bg-background pl-8 h-9 sm:h-10 lg:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px] h-9 sm:h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : isMobile ? (
              // Mobile Card View
              <div className="space-y-4 p-4">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <MobileCard key={patient.id}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{`${patient.name} ${patient.lastName}`}</div>
                          <div className="text-xs text-muted-foreground">Age: {patient.age}</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPatientToView(patient)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPatientToEdit(patient)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setPatientToDelete(patient)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-2">
                        <MobileCardField label="Email" value={patient.email} />
                        <MobileCardField label="Phone" value={patient.phone} />
                        <MobileCardField label="Status" value={patient.status} />
                        <MobileCardField label="Last Visit" value={patient.lastVisit} />
                      </div>
                    </MobileCard>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <User className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">No patients found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try adjusting your search or filters.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Desktop Table View
              <ResponsiveTableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Patient</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Phone</TableHead>
                      <TableHead className="whitespace-nowrap">Date of Birth</TableHead>
                      <TableHead className="whitespace-nowrap">Address</TableHead>
                      <TableHead className="whitespace-nowrap">Emergency Contact</TableHead>
                      <TableHead className="whitespace-nowrap">Insurance Provider</TableHead>
                      <TableHead className="whitespace-nowrap">Policy Number</TableHead>
                      <TableHead className="whitespace-nowrap">Medical History</TableHead>
                      <TableHead className="whitespace-nowrap">Last Visit</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-medium">{`${patient.name} ${patient.lastName}`}</div>
                                <div className="text-xs text-muted-foreground">Age: {patient.age}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{patient.email}</TableCell>
                          <TableCell className="whitespace-nowrap">{patient.phone}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {format(patient.dob, 'PPP')}
                          </TableCell>
                          <TableCell className="whitespace-nowrap max-w-xs truncate">{patient.address || 'N/A'}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div>{patient.ecName || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{patient.ecPhone} ({patient.ecRelationship})</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{patient.insuranceProvider || 'N/A'}</TableCell>
                          <TableCell className="whitespace-nowrap">{patient.policyNumber || 'N/A'}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {patient.medicalHistory && patient.medicalHistory.length > 0
                              ? patient.medicalHistory.map(h => h.condition).join(', ')
                              : 'N/A'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{patient.lastVisit}</TableCell>
                          <TableCell className="whitespace-nowrap">{patient.status}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setPatientToView(patient)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPatientToEdit(patient)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setPatientToDelete(patient)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
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
                            <h3 className="text-sm font-semibold">No patients found</h3>
                            <p className="text-sm text-muted-foreground">
                              Try adjusting your search or filters.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ResponsiveTableWrapper>
            )}
          </CardContent>
        </Card>
      </main>

      <ViewPatientDialog
        patient={patientToView}
        open={!!patientToView}
        onOpenChange={(isOpen) => !isOpen && setPatientToView(null)}
      />

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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient's record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
