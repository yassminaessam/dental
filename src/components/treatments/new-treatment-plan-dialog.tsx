
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
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { getCollection } from '@/services/firestore';
import { Patient } from '@/app/patients/page';
import { StaffMember } from '@/app/staff/page';
import { ScrollArea } from '../ui/scroll-area';

const appointmentSchema = z.object({
    date: z.date(),
    time: z.string().min(1, "Time is required."),
    duration: z.string().min(1, "Duration is required."),
});

const planSchema = z.object({
  patient: z.string({ required_error: "Patient is required." }),
  doctor: z.string({ required_error: "Doctor is required." }),
  treatmentName: z.string().min(1, "Treatment name is required."),
  appointments: z.array(appointmentSchema).min(1, "At least one appointment is required."),
  notes: z.string().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

const availableTimeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
];

const appointmentDurations = ['30 minutes', '1 hour', '1.5 hours', '2 hours'];

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
      appointments: [],
    },
  });

  const { control } = form;
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
            Outline a new treatment plan and schedule all related appointments at once.
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
                                            control={form.control}
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
                                            control={form.control}
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
                    <FormMessage>{form.formState.errors.appointments?.message || form.formState.errors.appointments?.root?.message}</FormMessage>
                </FormItem>
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
