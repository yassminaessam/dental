
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Patient } from '@/app/patients/page';
import { ScrollArea } from '../ui/scroll-area';

const patientSchema = z.object({
  name: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  dob: z.date({ required_error: 'Date of birth is required' }),
  address: z.string().optional(),
  ecName: z.string().optional(),
  ecPhone: z.string().optional(),
  ecRelationship: z.string().optional(),
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().optional(),
  medicalHistory: z.array(z.object({ condition: z.string().min(1, 'Condition cannot be empty') })).optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface AddPatientDialogProps {
  onSave: (patient: Omit<Patient, 'id'>) => void;
}

const emergencyContactRelationships = [
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Other',
];

export function AddPatientDialog({ onSave }: AddPatientDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [dobOpen, setDobOpen] = React.useState(false);
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      dob: undefined,
      address: '',
      ecName: '',
      ecPhone: '',
      ecRelationship: '',
      insuranceProvider: '',
      policyNumber: '',
      medicalHistory: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicalHistory",
  });

  const onSubmit = (data: PatientFormData) => {
    const newPatient: Omit<Patient, 'id'> = {
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      age: new Date().getFullYear() - new Date(data.dob).getFullYear(),
      lastVisit: new Date().toLocaleDateString(),
      status: 'Active',
      address: data.address,
      ecName: data.ecName,
      ecPhone: data.ecPhone,
      ecRelationship: data.ecRelationship,
      insuranceProvider: data.insuranceProvider,
      policyNumber: data.policyNumber,
      medicalHistory: data.medicalHistory,
    };
    
    onSave(newPatient);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">New Patient</span>
          <span className="sm:hidden">Add Patient</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add New Patient</DialogTitle>
          <DialogDescription className="text-sm">
            Enter patient details to create a new record
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-2 sm:pr-6 -mr-2 sm:-mr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="add-patient-form" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ahmed" {...field} className="h-10" />
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
                        <FormLabel className="text-sm font-medium">Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ali" {...field} className="h-10" />
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
                        <FormLabel className="text-sm font-medium">Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ahmed.ali@example.com" {...field} className="h-10" />
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
                        <FormLabel className="text-sm font-medium">Phone *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="01xxxxxxxxx" {...field} className="h-10" />
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
                        <FormLabel className="text-sm font-medium">Date of Birth *</FormLabel>
                        <Popover open={dobOpen} onOpenChange={setDobOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal h-10",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>mm/dd/yyyy</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
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
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-sm font-medium">Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="123 Nile St, Zamalek, Cairo" {...field} className="min-h-[80px]" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">Emergency Contact</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="ecName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Fatima Ali" {...field} className="h-10" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ecPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="01xxxxxxxxx" {...field} className="h-10" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ecRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Relationship</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {emergencyContactRelationships.map((rel) => (
                                <SelectItem key={rel} value={rel.toLowerCase()}>
                                  {rel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">Insurance Information</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="insuranceProvider"
                        render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-sm font-medium">Insurance Provider</FormLabel>
                              <FormControl>
                                <Input placeholder="Misr Insurance" {...field} className="h-10" />
                              </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="policyNumber"
                        render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-sm font-medium">Policy Number</FormLabel>
                              <FormControl>
                                <Input placeholder="MISR123456789" {...field} className="h-10" />
                              </FormControl>
                          </FormItem>
                        )}
                      />
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-base sm:text-lg font-medium">Medical History</h3>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                         <FormField
                            control={form.control}
                            name={`medicalHistory.${index}.condition`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormControl>
                                    <Input placeholder="e.g., Diabetes, Hypertension" {...field} className="h-10" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="h-10 w-10 sm:h-9 sm:w-9">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ condition: '' })}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add medical condition
                    </Button>
                  </div>
                </div>
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="border-t pt-3 sm:pt-4 gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 sm:flex-none">Cancel</Button>
          <Button type="submit" form="add-patient-form" className="flex-1 sm:flex-none">Save Patient</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
