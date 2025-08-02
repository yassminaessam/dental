
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
import { ViewTreatmentDialog } from "@/components/treatments/view-treatment-dialog";
import { EditTreatmentDialog } from "@/components/treatments/edit-treatment-dialog";
import { getCollection, setDocument, updateDocument, deleteDocument, listenToCollection } from '@/services/firestore';
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
    status?: Appointment['status'];
    appointmentId?: string;
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
  const [allAppointments, setAllAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const { toast } = useToast();
  const [treatmentToView, setTreatmentToView] = React.useState<Treatment | null>(null);
  const [treatmentToEdit, setTreatmentToEdit] = React.useState<Treatment | null>(null);
  const [treatmentToDelete, setTreatmentToDelete] = React.useState<Treatment | null>(null);

  React.useEffect(() => {
    const unsubscribeTreatments = listenToCollection<Treatment>('treatments', (data) => {
        setTreatments(data);
        if (loading) setLoading(false);
    }, (error) => {
        toast({ title: "Error fetching treatments", variant: "destructive", description: error.message });
        setLoading(false);
    });

    const unsubscribeAppointments = listenToCollection<any>('appointments', (data) => {
        setAllAppointments(data.map((a: any) => ({...a, dateTime: new Date(a.dateTime)})));
    }, (error) => {
        toast({ title: "Error fetching appointments", variant: "destructive", description: error.message });
    });

    return () => {
        unsubscribeTreatments();
        unsubscribeAppointments();
    };
  }, [toast, loading]);
  
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

  const treatmentsWithAppointmentDetails = React.useMemo(() => {
    return treatments.map(treatment => {
      const appointmentsWithStatus = treatment.appointments.map(appt => {
        const matchingAppt = allAppointments.find(ra => ra.id === appt.appointmentId);
        return {
          ...appt,
          status: matchingAppt?.status || 'Pending',
        };
      });
      return { ...treatment, appointments: appointmentsWithStatus };
    });
  }, [treatments, allAppointments]);

  const handleSavePlan = async (data: any) => {
    try {
      const treatmentId = `TRT-${Date.now()}`;
      const batch = writeBatch(db);
      
      const appointmentRefs: TreatmentAppointment[] = [];

      for (const appt of data.appointments) {
        const [hours, minutes] = appt.time.split(':');
        const apptDateTime = new Date(appt.date);
        apptDateTime.setHours(parseInt(hours, 10));
        apptDateTime.setMinutes(parseInt(minutes, 10));

        const appointmentId = `APT-${Date.now()}-${Math.random()}`;
        const newAppointment: Appointment = {
          id: appointmentId,
          dateTime: apptDateTime,
          patient: data.patient,
          doctor: data.doctor,
          type: data.treatmentName,
          duration: appt.duration,
          status: 'Confirmed',
          treatmentId: treatmentId,
        };
        const appointmentRef = doc(db, 'appointments', appointmentId);
        batch.set(appointmentRef, { ...newAppointment, dateTime: newAppointment.dateTime.toISOString() });
        appointmentRefs.push({
            date: appt.date.toISOString(),
            time: appt.time,
            duration: appt.duration,
            appointmentId: appointmentId,
        });
      }

      const newTreatment: Treatment = {
        id: treatmentId,
        date: new Date().toLocaleDateString(),
        patient: data.patient,
        procedure: data.treatmentName,
        doctor: data.doctor,
        cost: 'EGP ' + Math.floor(500 + Math.random() * 2000),
        status: 'Pending',
        notes: data.notes,
        appointments: appointmentRefs,
      };

      const treatmentRef = doc(db, 'treatments', treatmentId);
      batch.set(treatmentRef, newTreatment);
      
      await batch.commit();

      toast({
        title: "Treatment Plan Created",
        description: `A new plan for ${newTreatment.patient} has been created.`,
      });

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
        const treatmentRef = doc(db, 'treatments', updatedTreatment.id);
        
        const existingAppointmentsQuery = query(collection(db, "appointments"), where("treatmentId", "==", updatedTreatment.id));
        const existingAppointmentsSnapshot = await getDocs(existingAppointmentsQuery);
        const existingAppointmentIds = new Set(existingAppointmentsSnapshot.docs.map(d => d.id));

        const updatedAppointmentIds = new Set(updatedTreatment.appointments.map(a => a.appointmentId).filter(Boolean));

        // Delete appointments that are no longer in the plan
        existingAppointmentsSnapshot.forEach(appointmentDoc => {
            if (!updatedAppointmentIds.has(appointmentDoc.id)) {
                batch.delete(appointmentDoc.ref);
            }
        });

        // Update existing or create new appointments
        for (const appt of updatedTreatment.appointments) {
            const [hours, minutes] = appt.time.split(':');
            const apptDateTime = new Date(appt.date);
            apptDateTime.setHours(parseInt(hours, 10));
            apptDateTime.setMinutes(parseInt(minutes, 10));

            const appointmentData = {
                dateTime: apptDateTime.toISOString(),
                patient: updatedTreatment.patient,
                doctor: updatedTreatment.doctor,
                type: updatedTreatment.procedure,
                duration: appt.duration,
                status: appt.status || 'Confirmed',
                treatmentId: updatedTreatment.id,
            };

            if (appt.appointmentId && existingAppointmentIds.has(appt.appointmentId)) {
                 const appointmentRef = doc(db, 'appointments', appt.appointmentId);
                 batch.update(appointmentRef, appointmentData);
            } else {
                const appointmentId = `APT-${Date.now()}-${Math.random()}`;
                const appointmentRef = doc(db, 'appointments', appointmentId);
                batch.set(appointmentRef, {...appointmentData, id: appointmentId });
                // Update the treatment's appointment with the new ID
                const treatmentAppt = updatedTreatment.appointments.find(a => a.date === appt.date && a.time === appt.time);
                if (treatmentAppt) {
                    treatmentAppt.appointmentId = appointmentId;
                }
            }
        }
        
        const treatmentDocData = {
            ...updatedTreatment,
            appointments: updatedTreatment.appointments.map(({ status, ...rest}) => rest)
        };
        delete (treatmentDocData as any).status; // Remove status from the update object
        
        batch.update(treatmentRef, treatmentDocData);

        await batch.commit();
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
        const q = query(collection(db, "appointments"), where("treatmentId", "==", treatmentToDelete.id));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        await deleteDocument('treatments', treatmentToDelete.id);

        setTreatmentToDelete(null);

        toast({
            title: "Treatment Plan Deleted",
            description: `Plan for ${treatmentToDelete.patient} and associated appointments have been deleted.`,
            variant: "destructive",
        });

    } catch (e) {
        toast({ title: "Error deleting treatment plan", variant: "destructive" });
    }
  };

  const filteredTreatments = React.useMemo(() => {
    return treatmentsWithAppointmentDetails
      .filter(treatment =>
        treatment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.procedure.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(treatment =>
        statusFilter === 'all' || treatment.status.toLowerCase().replace(' ', '_') === statusFilter
      );
  }, [treatmentsWithAppointmentDetails, searchTerm, statusFilter]);

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
                      <TableHead>Appointments</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredTreatments.length > 0 ? (
                      filteredTreatments.map((treatment) => (
                        <TableRow key={treatment.id}>
                          <TableCell>{treatment.patient}</TableCell>
                          <TableCell>{treatment.procedure}</TableCell>
                          <TableCell>{treatment.doctor}</TableCell>
                          <TableCell>{treatment.cost}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                                {treatment.appointments.map((appt, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {format(new Date(appt.date), 'PPP')} @ {appt.time}
                                        </span>
                                        <Badge variant={
                                          appt.status === 'Cancelled' ? 'destructive' :
                                          appt.status === 'Completed' ? 'default' :
                                          'secondary'
                                        } className={cn(
                                            "h-5 text-xs capitalize",
                                            appt.status === 'Completed' && 'bg-green-100 text-green-800'
                                        )}>
                                            {appt.status}
                                        </Badge>
                                    </div>
                                ))}
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
                        <TableCell colSpan={6} className="h-24 text-center">
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
