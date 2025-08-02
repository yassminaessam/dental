
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Treatment } from '@/app/treatments/page';
import { getCollection } from '@/services/firestore';
import { Patient } from '@/app/patients/page';
import { StaffMember } from '@/app/staff/page';

const planSchema = z.object({
  patient: z.string({ required_error: "Patient is required." }),
  doctor: z.string({ required_error: "Doctor is required." }),
  procedure: z.string().min(1, "Procedure name is required."),
  cost: z.string().min(1, "Cost is required."),
  status: z.enum(['In Progress', 'Completed', 'Pending']),
  notes: z.string().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface EditTreatmentDialogProps {
  treatment: Treatment;
  onSave: (data: Treatment) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTreatmentDialog({ treatment, onSave, open, onOpenChange }: EditTreatmentDialogProps) {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<StaffMember[]>([]);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      notes: '',
    },
  });
  
  React.useEffect(() => {
    async function fetchData() {
        const patientData = await getCollection<Patient>('patients');
        setPatients(patientData);
        const staffData = await getCollection<StaffMember>('staff');
        setDoctors(staffData.filter(s => s.role === 'Dentist'));
    }
    if (open) {
        fetchData();
    }
  }, [open]);

  React.useEffect(() => {
    if (treatment && patients.length > 0 && doctors.length > 0) {
        form.reset({
            patient: patients.find(p => p.name === treatment.patient)?.id,
            doctor: doctors.find(d => d.name === treatment.doctor)?.id,
            procedure: treatment.procedure,
            cost: treatment.cost.replace(/[^0-9.-]+/g,""),
            status: treatment.status,
            notes: treatment.notes,
        });
    }
  }, [treatment, form, patients, doctors]);

  const onSubmit = (data: PlanFormData) => {
    const patientName = patients.find(p => p.id === data.patient)?.name;
    const doctorName = doctors.find(d => d.id === data.doctor)?.name;
    
    const updatedTreatment: Treatment = {
        ...treatment,
        patient: patientName || treatment.patient,
        doctor: doctorName || treatment.doctor,
        procedure: data.procedure,
        cost: `EGP ${data.cost}`,
        status: data.status,
        notes: data.notes || '',
    };
    onSave(updatedTreatment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Treatment Plan</DialogTitle>
          <DialogDescription>
            Update the details for this treatment plan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="procedure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procedure *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Full Mouth Restoration" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cost *</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="EGP 0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the treatment plan, goals, and steps."
                      className="resize-none"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
