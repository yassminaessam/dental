
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import type { Treatment, TreatmentAppointment } from '@/app/treatments/page';
import { getCollection } from '@/services/firestore';
import { Patient } from '@/app/patients/page';
import { StaffMember } from '@/app/staff/page';
import { ScrollArea } from '../ui/scroll-area';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { Appointment } from '@/app/appointments/page';

const appointmentSchema = z.object({
    date: z.date(),
    time: z.string().min(1, "Time is required."),
    duration: z.string().min(1, "Duration is required."),
    appointmentId: z.string().optional(),
    status: z.custom<Appointment['status']>().optional(),
});

const planSchema = z.object({
  patient: z.string({ required_error: "Patient is required." }),
  doctor: z.string({ required_error: "Doctor is required." }),
  procedure: z.string().min(1, "Procedure name is required."),
  cost: z.string().min(1, "Cost is required."),
  notes: z.string().optional(),
  appointments: z.array(appointmentSchema).min(1, "At least one appointment is required."),
});

type PlanFormData = z.infer<typeof planSchema>;

const availableTimeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
];
const appointmentDurations = ['30 minutes', '1 hour', '1.5 hours', '2 hours'];

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
  });

  const { control, reset, formState: { errors } } = form;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "appointments"
  });

  const selectedDates = React.useMemo(() => fields.map(f => f.date), [fields]);
  
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
        reset({
            patient: patients.find(p => p.name === treatment.patient)?.id,
            doctor: doctors.find(d => d.name === treatment.doctor)?.id,
            procedure: treatment.procedure,
            cost: treatment.cost.replace(/[^0-9.-]+/g,""),
            notes: treatment.notes,
            appointments: treatment.appointments.map(a => ({
                date: new Date(a.date),
                time: a.time,
                duration: a.duration,
                appointmentId: a.appointmentId,
                status: a.status,
            }))
        });
    }
  }, [treatment, reset, patients, doctors]);

  const handleDateSelect = (days: Date[] | undefined) => {
    const sortedDays = (days || []).sort((a,b) => a.getTime() - b.getTime());
    const newAppointments = sortedDays.map(day => {
        const existing = fields.find(f => f.date.getTime() === day.getTime());
        return existing || { date: day, time: '09:00', duration: '1 hour' };
    });
    replace(newAppointments);
  };

  const onSubmit = (data: PlanFormData) => {
    const patientName = patients.find(p => p.id === data.patient)?.name;
    const doctorName = doctors.find(d => d.id === data.doctor)?.name;
    
    const updatedTreatment: Treatment = {
        ...treatment,
        patient: patientName || treatment.patient,
        doctor: doctorName || treatment.doctor,
        procedure: data.procedure,
        cost: `EGP ${data.cost}`,
        notes: data.notes || '',
        appointments: data.appointments.map(a => ({
            date: a.date.toISOString(),
            time: a.time,
            duration: a.duration,
            appointmentId: a.appointmentId,
            status: a.status
        })),
    };
    onSave(updatedTreatment);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Treatment Plan</DialogTitle>
          <DialogDescription>
            Update the details for this treatment plan.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-3 gap-6 py-4">
            <div className="col-span-1 space-y-6">
                 <FormField
                    control={control}
                    name="patient"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Patient *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{patients.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="doctor"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Doctor *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>{doctors.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="procedure"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Treatment Name *</FormLabel>
                        <FormControl><Input placeholder="e.g., Full Mouth Restoration" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={control}
                    name="cost"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Cost *</FormLabel>
                        <FormControl><Input type="text" placeholder="EGP 0.00" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="notes"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                        <Textarea
                            placeholder="Describe the treatment plan, goals, and steps."
                            className="resize-none h-24"
                            {...field}
                            value={field.value ?? ''}
                        />
                        </FormControl>
                    </FormItem>
                    )}
                />
            </div>
             <div className="col-span-2">
                <FormItem>
                    <FormLabel>Appointment Dates *</FormLabel>
                    <div className="flex gap-4">
                        <Calendar
                            mode="multiple"
                            selected={selectedDates}
                            onSelect={handleDateSelect}
                            className="rounded-md border"
                            />
                        <div className="flex-1">
                            <h4 className="mb-2 text-sm font-medium">Selected Appointments</h4>
                             <ScrollArea className="h-72 rounded-md border p-2">
                               {fields.length > 0 ? (
                                fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center mb-2">
                                       <p className="col-span-4 text-sm font-medium">{format(field.date, 'PPP')}</p>
                                       <FormField
                                            control={control}
                                            name={`appointments.${index}.time`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-3">
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>{availableTimeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                       <FormField
                                            control={control}
                                            name={`appointments.${index}.duration`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-4">
                                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                        <SelectContent>{appointmentDurations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <Button variant="ghost" size="icon" className="col-span-1" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))
                               ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Select dates from the calendar.</p>
                               )}
                             </ScrollArea>
                        </div>
                    </div>
                    <FormMessage>{errors.appointments?.message || errors.appointments?.root?.message}</FormMessage>
                </FormItem>
            </div>
            <DialogFooter className="col-span-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
