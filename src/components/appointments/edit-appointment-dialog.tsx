
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Appointment } from '@/app/appointments/page';
import { getCollection } from '@/services/firestore';
import { Patient } from '@/app/patients/page';
import { StaffMember } from '@/app/staff/page';


const appointmentSchema = z.object({
  patient: z.string({ required_error: "Patient is required." }),
  doctor: z.string({ required_error: "Doctor is required." }),
  date: z.date({ required_error: "Date is required." }),
  time: z.string({ required_error: "Time is required." }),
  type: z.string(),
  duration: z.string(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const appointmentTypesData = [
  { name: "Check-up" },
  { name: "Cleaning" },
  { name: "Filling" },
  { name: "Crown" },
  { name: "Root Canal" },
];

const availableTimeSlots = [
  "09:00",
  "10:30",
  "11:00",
  "14:00",
  "15:30",
  "16:00",
];

const appointmentDurations = ['30 minutes', '1 hour', '1.5 hours', '2 hours'];

interface EditAppointmentDialogProps {
  appointment: Appointment;
  onSave: (data: Appointment) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAppointmentDialog({ appointment, onSave, open, onOpenChange }: EditAppointmentDialogProps) {
  const [dateOpen, setDateOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [doctors, setDoctors] = React.useState<StaffMember[]>([]);
  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
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
    if (appointment && patients.length > 0 && doctors.length > 0) {
        const patientId = patients.find(p => p.name === appointment.patient)?.id;
        const doctorId = doctors.find(d => d.name === appointment.doctor)?.id;
        
        form.reset({
            patient: patientId,
            doctor: doctorId,
            date: appointment.dateTime,
            time: format(appointment.dateTime, 'HH:mm'),
            type: appointment.type,
            duration: appointment.duration,
            notes: '',
        });
    }
  }, [appointment, form, patients, doctors]);


  const onSubmit = (data: AppointmentFormData) => {
    const [hours, minutes] = data.time.split(':');
    const dateTime = new Date(data.date);
    dateTime.setHours(parseInt(hours, 10));
    dateTime.setMinutes(parseInt(minutes, 10));

    const patientName = patients.find(p => p.id === data.patient)?.name;
    const doctorName = doctors.find(d => d.id === data.doctor)?.name;

    const updatedAppointment: Appointment = {
      ...appointment,
      patient: patientName || appointment.patient,
      doctor: doctorName || appointment.doctor,
      dateTime,
      type: data.type,
      duration: data.duration,
    };
    onSave(updatedAppointment);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>
            Update the details for the appointment.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6 py-4">
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
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date *</FormLabel>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>mm/dd/yyyy</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setDateOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointmentTypesData.map((type) => (
                        <SelectItem key={type.name} value={type.name}>
                          {type.name}
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
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointmentDurations.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration}
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
              name="notes"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or special instructions"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="col-span-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
