
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
import { cn } from "@/lib/utils";
import { Search, Pencil, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { NewTreatmentPlanDialog } from "@/components/treatments/new-treatment-plan-dialog";
import { useToast } from '@/hooks/use-toast';
import { ViewTreatmentDialog } from '@/components/treatments/view-treatment-dialog';
import { EditTreatmentDialog } from '@/components/treatments/edit-treatment-dialog';
import { getCollection, setDocument, updateDocument, deleteDocument } from '@/services/firestore';
import type { Appointment } from '../appointments/page';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type TreatmentAppointment = {
    date: string;
    time: string;
    duration: string;
};

export type Treatment = {
  id: string;
  date: string; 
  patient: string;
  procedure: string;
  doctor: string;
  cost: string;
  status: 'In Progress' | 'Completed' | 'Pending';
  notes: string;
  appointments: TreatmentAppointment[]; 
};

export default function TreatmentsPage() {
  const [treatments, setTreatments] = React.useState<Treatment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const { toast } = useToast();
  const [treatmentToView, setTreatmentToView] = React.useState<Treatment | null>(null);
  const [treatmentToEdit, setTreatmentToEdit] = React.useState<Treatment | null>(null);
  const [treatmentToDelete, setTreatmentToDelete] = React.useState<Treatment | null>(null);

  React.useEffect(() => {
    async function fetchTreatments() {
      try {
        const data = await getCollection<Treatment>('treatments');
        setTreatments(data);
      } catch (e) {
        toast({ title: "Error fetching treatments", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchTreatments();
  }, [toast]);
  
  const treatmentPageStats = React.useMemo(() => {
    const total = treatments.length;
    const completed = treatments.filter(t => t.status === 'Completed').length;
    const inProgress = treatments.filter(t => t.status === 'In Progress').length;
    const pending = treatments.filter(t => t.status === 'Pending').length;

    return [
      { title: "Total Treatments", value: total, description: "All recorded treatments" },
      { title: "Completed Treatments", value: completed, description: "Finished treatment plans" },
      { title: "In Progress", value: inProgress, description: "Ongoing treatments" },
      { title: "Pending Treatments", value: pending, description: "Awaiting start" },
    ];
  }, [treatments]);

  const handleSavePlan = async (data: any) => {
    try {
      const treatmentId = `TRT-${Date.now()}`;
      const newTreatment: Omit<Treatment, 'id'> = {
        date: new Date().toLocaleDateString(),
        patient: data.patient,
        procedure: data.treatmentName,
        doctor: data.doctor,
        cost: 'EGP ' + Math.floor(500 + Math.random() * 2000),
        status: 'Pending',
        notes: data.notes,
        appointments: data.appointments.map((a: any) => ({
            date: a.date.toISOString(),
            time: a.time,
            duration: a.duration,
        })),
      };

      await setDocument('treatments', treatmentId, { ...newTreatment, id: treatmentId });
      setTreatments(prev => [{ ...newTreatment, id: treatmentId }, ...prev]);
      toast({
        title: "Treatment Plan Created",
        description: `A new plan for ${newTreatment.patient} has been created.`,
      });

      // Automatically create appointments
      const batch = writeBatch(db);
      for (const appt of data.appointments) {
        const [hours, minutes] = appt.time.split(':');
        const apptDateTime = new Date(appt.date);
        apptDateTime.setHours(parseInt(hours, 10));
        apptDateTime.setMinutes(parseInt(minutes, 10));

        const newAppointment: Omit<Appointment, 'id'> = {
          dateTime: apptDateTime,
          patient: data.patient,
          doctor: data.doctor,
          type: data.treatmentName,
          duration: appt.duration,
          status: 'Confirmed',
          treatmentId: treatmentId,
        };
        const appointmentId = `APT-${Date.now()}-${Math.random()}`;
        const appointmentRef = doc(db, 'appointments', appointmentId);
        batch.set(appointmentRef, { ...newAppointment, dateTime: newAppointment.dateTime.toISOString(), id: appointmentId });
      }
      await batch.commit();


      if (data.appointments.length > 0) {
        toast({
          title: "Appointments Scheduled",
          description: `${data.appointments.length} appointments for "${data.treatmentName}" have been added to the calendar.`,
        });
      }

    } catch (e) {
      toast({ title: "Error creating plan", variant: "destructive" });
    }
  };
  
  const handleUpdateTreatment = async (updatedTreatment: Treatment) => {
    try {
        const batch = writeBatch(db);

        // 1. Update the treatment plan document
        const treatmentRef = doc(db, 'treatments', updatedTreatment.id);
        batch.update(treatmentRef, updatedTreatment);

        // 2. Find and update associated appointments
        const appointmentsQuery = query(collection(db, "appointments"), where("treatmentId", "==", updatedTreatment.id));
        const appointmentsSnapshot = await getDocs(appointmentsQuery);

        let newAppointmentStatus: Appointment['status'] | null = null;
        if (updatedTreatment.status === 'Completed') newAppointmentStatus = 'Completed';
        else if (updatedTreatment.status === 'Pending') newAppointmentStatus = 'Pending';
        else if (updatedTreatment.status === 'In Progress') newAppointmentStatus = 'Confirmed';

        if (newAppointmentStatus) {
            appointmentsSnapshot.forEach((appointmentDoc) => {
                const appointmentRef = doc(db, 'appointments', appointmentDoc.id);
                batch.update(appointmentRef, { status: newAppointmentStatus });
            });
        }
        
        await batch.commit();

        setTreatments(prev => prev.map(t => t.id === updatedTreatment.id ? updatedTreatment : t));
        setTreatmentToEdit(null);
        toast({
            title: "Treatment Updated",
            description: `Treatment for ${updatedTreatment.patient} and its appointments have been updated.`,
        });
    } catch(e) {
      toast({ title: "Error updating treatment", variant: "destructive" });
    }
  };
  
  const handleDeleteTreatment = async () => {
    if (!treatmentToDelete) return;
    try {
        // Find and delete associated appointments
        const q = query(collection(db, "appointments"), where("treatmentId", "==", treatmentToDelete.id));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Delete the treatment plan itself
        await deleteDocument('treatments', treatmentToDelete.id);

        setTreatments(prev => prev.filter(t => t.id !== treatmentToDelete.id));
        toast({
            title: "Treatment Plan Deleted",
            description: `Plan for ${treatmentToDelete.patient} and associated appointments have been deleted.`,
            variant: "destructive",
        });
        setTreatmentToDelete(null);

    } catch (e) {
        toast({ title: "Error deleting treatment plan", variant: "destructive" });
    }
  };

  const filteredTreatments = React.useMemo(() => {
    return treatments
      .filter(treatment =>
        treatment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.procedure.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(treatment =>
        statusFilter === 'all' || treatment.status.toLowerCase().replace(' ', '_') === statusFilter
      );
  }, [treatments, searchTerm, statusFilter]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Treatments</h1>
          <NewTreatmentPlanDialog onSave={handleSavePlan} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {treatmentPageStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Treatment Records</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search treatments..."
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
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Procedure</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Appointments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredTreatments.length > 0 ? (
                      filteredTreatments.map((treatment) => (
                        <TableRow key={treatment.id}>
                          <TableCell>{treatment.patient}</TableCell>
                          <TableCell>{treatment.procedure}</TableCell>
                          <TableCell>{treatment.doctor}</TableCell>
                          <TableCell>{treatment.cost}</TableCell>
                          <TableCell>
                            <Badge variant={
                                treatment.status === 'Completed' ? 'default' : 
                                treatment.status === 'In Progress' ? 'secondary' : 'outline'
                            } className={cn(
                                treatment.status === 'Completed' && 'bg-green-100 text-green-800'
                            )}>
                                {treatment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                                {treatment.appointments && treatment.appointments.slice(0, 2).map((appt, index) => (
                                    <span key={index} className="text-xs text-muted-foreground">
                                        {format(new Date(appt.date), 'PPP')} @ {appt.time}
                                    </span>
                                ))}
                                {treatment.appointments && treatment.appointments.length > 2 && (
                                    <span className="text-xs text-muted-foreground">...and {treatment.appointments.length - 2} more</span>
                                )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setTreatmentToView(treatment)}>
                                        <MoreHorizontal className="mr-2 h-4 w-4" /> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTreatmentToEdit(treatment)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTreatmentToDelete(treatment)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <ViewTreatmentDialog
        treatment={treatmentToView}
        open={!!treatmentToView}
        onOpenChange={(isOpen) => !isOpen && setTreatmentToView(null)}
      />

      {treatmentToEdit && (
        <EditTreatmentDialog
            treatment={treatmentToEdit}
            onSave={handleUpdateTreatment}
            open={!!treatmentToEdit}
            onOpenChange={(isOpen) => !isOpen && setTreatmentToEdit(null)}
        />
      )}

      <AlertDialog open={!!treatmentToDelete} onOpenChange={(isOpen) => !isOpen && setTreatmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the treatment plan and all of its associated appointments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTreatment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
