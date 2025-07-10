
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import { patientPageStats, initialPatientsData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Search, User, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: Date;
  age: number;
  lastVisit: string;
  status: 'Active' | 'Inactive';
};


export default function PatientsPage() {
  const [patients, setPatients] = React.useState<Patient[]>(initialPatientsData);
  const [patientToEdit, setPatientToEdit] = React.useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = React.useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const { toast } = useToast();

  const handleSavePatient = (data: any) => {
    const newPatient: Patient = {
      id: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${data.name}`,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      age: new Date().getFullYear() - new Date(data.dob).getFullYear(),
      lastVisit: new Date().toLocaleDateString(),
      status: 'Active',
    };
    setPatients(prev => [newPatient, ...prev]);
    toast({
      title: "Patient Added",
      description: `${newPatient.name} has been successfully added.`,
    });
  };
  
  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setPatientToEdit(null);
    toast({
      title: "Patient Updated",
      description: `${updatedPatient.name}'s record has been updated.`,
    });
  };

  const handleDeletePatient = () => {
    if (patientToDelete) {
      setPatients(prev => prev.filter(p => p.id !== patientToDelete.id));
      toast({
        title: "Patient Deleted",
        description: `${patientToDelete.name}'s record has been deleted.`,
        variant: "destructive"
      });
      setPatientToDelete(null);
    }
  };

  const filteredPatients = React.useMemo(() => {
    return patients
      .filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(patient => 
        statusFilter === 'all' || patient.status.toLowerCase() === statusFilter
      );
  }, [patients, searchTerm, statusFilter]);


  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Patients</h1>
          <AddPatientDialog onSave={handleSavePatient} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {patientPageStats.map((stat) => (
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

        <Card>
          <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <CardTitle>Patient Directory</CardTitle>
            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="font-medium">{patient.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{patient.email}</div>
                        <div className="text-xs text-muted-foreground">{patient.phone}</div>
                      </TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>{patient.status}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setPatientToEdit(patient)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPatientToDelete(patient)} className="text-destructive">
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
                    <TableCell colSpan={6} className="h-24 text-center">
                      No patients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

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
  );
}
