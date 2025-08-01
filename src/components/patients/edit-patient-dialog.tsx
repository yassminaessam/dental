

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Patient } from '@/app/patients/page';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';

const patientSchema = z.object({
  name: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  dob: z.date({ required_error: 'Date of birth is required' }),
  status: z.enum(['Active', 'Inactive']),
  address: z.string().optional(),
  ecName: z.string().optional(),
  ecPhone: z.string().optional(),
  ecRelationship: z.string().optional(),
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().optional(),
  medicalHistory: z.array(z.object({ condition: z.string().min(1, 'Condition cannot be empty') })).optional(),
});


type PatientFormData = z.infer<typeof patientSchema>;

interface EditPatientDialogProps {
  patient: Patient;
  onSave: (data: Patient) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emergencyContactRelationships = [
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Other',
];


export function EditPatientDialog({ patient, onSave, open, onOpenChange }: EditPatientDialogProps) {
  const [dobOpen, setDobOpen] = React.useState(false);
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

   const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicalHistory",
  });

  React.useEffect(() => {
    if (patient) {
      form.reset({
        name: patient.name,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        dob: new Date(patient.dob),
        status: patient.status,
        address: patient.address,
        ecName: patient.ecName,
        ecPhone: patient.ecPhone,
        ecRelationship: patient.ecRelationship,
        insuranceProvider: patient.insuranceProvider,
        policyNumber: patient.policyNumber,
        medicalHistory: patient.medicalHistory || [],
      });
    }
  }, [patient, form]);

  const onSubmit = (data: PatientFormData) => {
    const updatedPatient: Patient = {
      ...patient,
      ...data,
      age: new Date().getFullYear() - new Date(data.dob).getFullYear(),
    };
    onSave(updatedPatient);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Patient Details</DialogTitle>
          <DialogDescription>
            Update the details for {patient.name}.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="edit-patient-form" className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                        <Input placeholder="Ahmed" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                        <Input placeholder="Ali" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="ahmed.ali@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                        <Input type="tel" placeholder="01xxxxxxxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth *</FormLabel>
                        <Popover open={dobOpen} onOpenChange={setDobOpen}>
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
                                if (date) field.onChange(date);
                                setDobOpen(false);
                            }}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1930}
                            toYear={new Date().getFullYear()}
                            />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                        <Textarea placeholder="123 Nile St, Zamalek, Cairo" {...field} />
                        </FormControl>
                    </FormItem>
                    )}
                />
                </div>

                <div>
                    <h3 className="mb-4 text-lg font-medium">Emergency Contact</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormField control={form.control} name="ecName" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Fatima Ali" {...field} /></FormControl></FormItem>
                        )}/>
                        <FormField control={form.control} name="ecPhone" render={({ field }) => (
                            <FormItem><FormLabel>Phone</FormLabel><FormControl><Input type="tel" placeholder="01xxxxxxxxx" {...field} /></FormControl></FormItem>
                        )}/>
                        <FormField control={form.control} name="ecRelationship" render={({ field }) => (
                            <FormItem><FormLabel>Relationship</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger></FormControl>
                                <SelectContent>{emergencyContactRelationships.map((rel) => (<SelectItem key={rel} value={rel.toLowerCase()}>{rel}</SelectItem>))}</SelectContent>
                            </Select>
                            </FormItem>
                        )}/>
                    </div>
                </div>
                <div>
                  <h3 className="mb-4 text-lg font-medium">Insurance Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField control={form.control} name="insuranceProvider" render={({ field }) => (
                          <FormItem><FormLabel>Insurance Provider</FormLabel><FormControl><Input placeholder="Misr Insurance" {...field} /></FormControl></FormItem>
                      )}/>
                      <FormField control={form.control} name="policyNumber" render={({ field }) => (
                          <FormItem><FormLabel>Policy Number</FormLabel><FormControl><Input placeholder="MISR123456789" {...field} /></FormControl></FormItem>
                      )}/>
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-lg font-medium">Medical History</h3>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                         <FormField control={form.control} name={`medicalHistory.${index}.condition`} render={({ field }) => (
                              <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., Diabetes, Hypertension" {...field} /></FormControl><FormMessage /></FormItem>
                         )}/>
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => append({ condition: '' })}><Plus className="mr-2 h-4 w-4" />Add medical condition</Button>
                  </div>
                </div>
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="edit-patient-form">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
