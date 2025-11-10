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
import { useLanguage } from '@/contexts/LanguageContext';

const patientSchema = z.object({
  name: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
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
  'Other'
];

export function AddPatientDialog({ onSave }: AddPatientDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      ecName: '',
      ecPhone: '',
      ecRelationship: '',
      insuranceProvider: '',
      policyNumber: '',
      medicalHistory: [],
    },
  });

  const { fields: medicalHistoryFields, append: appendMedicalHistory, remove: removeMedicalHistory } = useFieldArray({
    control: form.control,
    name: 'medicalHistory',
  });

  const onSubmit = (data: PatientFormData) => {
    const currentYear = new Date().getFullYear();
    const birthYear = data.dob.getFullYear();
    const age = currentYear - birthYear;
    
    const patient: Omit<Patient, 'id'> = {
      name: data.name,
      lastName: data.lastName,
      email: data.email || '',
      phone: data.phone,
      dob: data.dob,
      age: age,
      lastVisit: 'Never',
      status: 'Active' as const,
      address: data.address || undefined,
      ecName: data.ecName || undefined,
      ecPhone: data.ecPhone || undefined,
      ecRelationship: data.ecRelationship || undefined,
      insuranceProvider: data.insuranceProvider || undefined,
      policyNumber: data.policyNumber || undefined,
      medicalHistory: data.medicalHistory?.map(item => ({ condition: item.condition })).filter(item => Boolean(item.condition)) || [],
    };
    onSave(patient);
    setOpen(false);
    form.reset();
  };

  console.log('Dialog state:', open);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      console.log('Dialog state changing from', open, 'to', newOpen);
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          onClick={() => {
            console.log('Add Patient button clicked');
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('patients.add_patient')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {t('patients.add_patient')}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            {t('patients.add_patient_description')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(85vh-200px)] pr-2 thin-scrollbar">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">{t('patients.personal_information')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <Input placeholder={t('patients.phone_placeholder')} {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => {
                      const [open, setOpen] = React.useState(false);
                      return (
                        <FormItem className="sm:col-span-1">
                          <FormLabel className="text-sm font-medium">{t('patients.date_of_birth')} *</FormLabel>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal h-10",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>{t('patients.pick_date')}</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setOpen(false);
                                }}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t('patients.address')}</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('patients.address_placeholder')} {...field} className="min-h-[80px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">{t('patients.emergency_contact')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ecName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t('patients.emergency_contact_name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('patients.emergency_contact_name_placeholder')} {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ecPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t('patients.emergency_contact_phone')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('patients.emergency_contact_phone_placeholder')} {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ecRelationship"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-sm font-medium">{t('patients.emergency_contact_relationship')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={t('patients.emergency_contact_relationship_placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {emergencyContactRelationships.map((relationship) => (
                              <SelectItem key={relationship} value={relationship}>
                                {t(`patients.relationships.${relationship.toLowerCase()}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">{t('patients.insurance_information')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="insuranceProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t('patients.insurance_provider')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('patients.insurance_provider_placeholder')} {...field} className="h-10" />
                        </FormControl>
                        <FormMessage />
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-medium">{t('patients.medical_history')}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendMedicalHistory({ condition: '' })}
                    className="h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {t('patients.add_condition')}
                  </Button>
                </div>
                {medicalHistoryFields.length > 0 && (
                  <div className="space-y-2">
                    {medicalHistoryFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`medicalHistory.${index}.condition`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder={t('patients.medical_condition_placeholder')} {...field} className="h-9" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMedicalHistory(index)}
                          className="h-9 w-9 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Spacer at the bottom */}
              <div className="h-16"></div>
            </form>
          </Form>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            type="button" 
            onClick={form.handleSubmit(onSubmit)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {t('patients.save_patient')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}