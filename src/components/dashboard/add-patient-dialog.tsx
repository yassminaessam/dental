
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
// Removed ScrollArea in favor of native overflow container for guaranteed visible scrollbar
import { useLanguage } from '@/contexts/LanguageContext';

const patientSchema = z.object({
  name: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  // Email is optional: allow empty string or a valid email
  email: z.union([z.string().email({ message: 'Invalid email address' }), z.literal('')]),
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
  const { t } = useLanguage();
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
          <span className="hidden sm:inline">{t('patients.new_patient')}</span>
          <span className="sm:hidden">{t('patients.add_patient')}</span>
        </Button>
      </DialogTrigger>
  <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full flex flex-col min-h-0">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{t('patients.add_patient')}</DialogTitle>
          <DialogDescription className="text-sm">
            {t('patients.enter_patient_details')}
          </DialogDescription>
        </DialogHeader>
  <div className="scrollbar-visible flex-1 min-h-0 overflow-y-auto pr-2 sm:pr-6 max-h-[65vh] sm:max-h-[70vh]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="add-patient-form" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t('patients.first_name')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('patients.first_name_placeholder')} {...field} className="h-10" />
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
                        <FormLabel className="text-sm font-medium">{t('patients.last_name')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('patients.last_name_placeholder')} {...field} className="h-10" />
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
                        <FormLabel className="text-sm font-medium">{t('patients.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('patients.email_placeholder')} {...field} className="h-10" />
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
                        <FormLabel className="text-sm font-medium">{t('patients.phone')} *</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder={t('patients.phone_placeholder')} {...field} className="h-10" />
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
                        <FormLabel className="text-sm font-medium">{t('patients.date_of_birth')} *</FormLabel>
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
                                {field.value ? format(field.value, "PPP") : <span>{t('patients.dob_placeholder')}</span>}
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
                        <FormLabel className="text-sm font-medium">{t('patients.address')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('patients.address_placeholder')} {...field} className="min-h-[80px]" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">{t('patients.emergency_contact')}</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="ecName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{t('patients.name')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('patients.emergency_name_placeholder')} {...field} className="h-10" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ecPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{t('patients.phone')}</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder={t('patients.phone_placeholder')} {...field} className="h-10" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ecRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">{t('patients.relationship')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder={t('patients.select_relationship')} />
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
                  <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">{t('patients.insurance_information')}</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="insuranceProvider"
                        render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-sm font-medium">{t('patients.insurance_provider')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('patients.insurance_provider_placeholder')} {...field} className="h-10" />
                              </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="policyNumber"
                        render={({ field }) => (
                          <FormItem>
                              <FormLabel className="text-sm font-medium">{t('patients.policy_number')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('patients.policy_number_placeholder')} {...field} className="h-10" />
                              </FormControl>
                          </FormItem>
                        )}
                      />
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-base sm:text-lg font-medium">{t('patients.medical_history')}</h3>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                         <FormField
                            control={form.control}
                            name={`medicalHistory.${index}.condition`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormControl>
                                    <Input placeholder={t('patients.medical_condition_placeholder')} {...field} className="h-10" />
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
                      {t('patients.add_medical_condition')}
                    </Button>
                  </div>
                </div>
            </form>
          </Form>
        </div>
  <DialogFooter className="border-t pt-3 sm:pt-4 gap-2 print:hidden">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1 sm:flex-none">{t('common.cancel')}</Button>
          <Button type="submit" form="add-patient-form" className="flex-1 sm:flex-none">{t('patients.save_patient')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
