
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
  DialogTrigger,
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
import { Calendar } from '@/components/ui/calendar';
import { Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { getCollection } from '@/services/firestore';
import { Patient } from '@/app/patients/page';
import { StaffMember } from '@/app/staff/page';
import { Badge } from '../ui/badge';

const planSchema = z.object({
  patient: z.string({ required_error: "Patient is required." }),
  doctor: z.string({ required_error: "Doctor is required." }),
  treatmentName: z.string().min(1, "Treatment name is required."),
  appointmentDates: z.array(z.date()).min(1, "At least one appointment date is required."),
  notes: z.string().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface NewTreatmentPlanDialogProps {
  onSave: (data: any) => void;
}

export function NewTreatmentPlanDialog({ onSave }: NewTreatmentPlanDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<StaffMember[]>([]);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      treatmentName: '',
      notes: '',
      appointmentDates: [],
    },
  });

  const { watch, setValue } = form;
  const appointmentDates = watch('appointmentDates');

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

  const handleDateSelect = (day: Date | undefined) => {
    if (!day) return;
    const existingDates = appointmentDates.map(d => d.getTime());
    if (!existingDates.includes(day.getTime())) {
      const newDates = [...appointmentDates, day].sort((a, b) => a.getTime() - b.getTime());
      setValue('appointmentDates', newDates, { shouldValidate: true });
    }
  };

  const removeDate = (dateToRemove: Date) => {
    const newDates = appointmentDates.filter(d => d.getTime() !== dateToRemove.getTime());
    setValue('appointmentDates', newDates, { shouldValidate: true });
  };

  const onSubmit = (data: PlanFormData) => {
    const patientName = patients.find(p => p.id === data.patient)?.name;
    const doctorName = doctors.find(d => d.id === data.doctor)?.name;
    onSave({...data, patient: patientName, doctor: doctorName});
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Treatment Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Treatment Plan</DialogTitle>
          <DialogDescription>
            Outline a new treatment plan for a patient and schedule all related appointments at once.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-3 gap-6 py-4">
            <div className="col-span-1 space-y-6">
              <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormField
                control={form.control}
                name="treatmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Full Mouth Restoration" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the treatment plan, goals, and steps."
                        className="resize-none h-24"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="appointmentDates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Dates *</FormLabel>
                      <FormControl>
                        <Calendar
                          mode="multiple"
                          selected={field.value}
                          onSelect={(days) => setValue('appointmentDates', days || [], { shouldValidate: true })}
                          className="rounded-md border"
                        />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <DialogFooter className="col-span-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Save Plan and Schedule</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
