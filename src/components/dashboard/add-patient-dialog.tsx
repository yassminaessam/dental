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
import { Calendar as CalendarIcon, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Patient } from '@/app/patients/page';
import { useLanguage } from '@/contexts/LanguageContext';
import { listDocuments } from '@/lib/data-client';

type InsuranceProvider = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

const patientSchema = z.object({
  name: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }).min(1, { message: 'Email is required' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  dob: z.date({ required_error: 'Date of birth is required' }),
  address: z.string().optional(),
  ecName: z.string().optional(),
  ecPhone: z.string().optional(),
  ecRelationship: z.string().optional(),
  insuranceProvider: z.string().optional(),
  policyNumber: z.string().optional(),
  medicalHistory: z.array(z.object({ condition: z.string().min(1, 'Condition cannot be empty') })).optional(),
  createUserAccount: z.boolean().optional(),
  userPassword: z.string().optional(),
}).refine((data) => {
  // If createUserAccount is true, password is required
  if (data.createUserAccount && !data.userPassword) {
    return false;
  }
  // If password is provided, it should be at least 8 characters
  if (data.userPassword && data.userPassword.length < 8) {
    return false;
  }
  return true;
}, {
  message: 'Password must be at least 8 characters when creating user account',
  path: ['userPassword'],
});

type PatientFormData = z.infer<typeof patientSchema>;

interface AddPatientDialogProps {
  onSave: (patient: Omit<Patient, 'id'>) => Promise<{ success: boolean; error?: string }>;
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
  const [dobCalendarOpen, setDobCalendarOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = React.useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = React.useState(false);
  const [insuranceProviders, setInsuranceProviders] = React.useState<InsuranceProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = React.useState(false);

  // Fetch insurance providers on mount
  React.useEffect(() => {
    const fetchProviders = async () => {
      setIsLoadingProviders(true);
      try {
        const providers = await listDocuments<InsuranceProvider>('insurance-providers');
        setInsuranceProviders(providers);
      } catch (error) {
        console.error('Failed to fetch insurance providers:', error);
      } finally {
        setIsLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);
  
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
      createUserAccount: false,
      userPassword: '',
    },
  });

  const { fields: medicalHistoryFields, append: appendMedicalHistory, remove: removeMedicalHistory } = useFieldArray({
    control: form.control,
    name: 'medicalHistory',
  });

  // Clear phone error when phone field changes
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'phone' && phoneError) {
        setPhoneError(null);
      }
      if (name === 'email' && emailError) {
        setEmailError(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, phoneError, emailError]);

  // Check for duplicate phone on blur
  const checkPhoneDuplicate = React.useCallback(async (phone: string) => {
    if (!phone || phone.length < 3) return;
    setIsCheckingPhone(true);
    try {
      const response = await fetch('/api/patients/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (data.exists && data.field === 'phone') {
        setPhoneError(t('patients.phone_already_exists'));
      }
    } catch (error) {
      console.error('Error checking phone duplicate:', error);
    } finally {
      setIsCheckingPhone(false);
    }
  }, [t]);

  // Check for duplicate email on blur
  const checkEmailDuplicate = React.useCallback(async (email: string) => {
    if (!email || !email.includes('@')) return;
    setIsCheckingEmail(true);
    try {
      const response = await fetch('/api/patients/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.exists && data.field === 'email') {
        setEmailError(t('patients.email_already_exists'));
      }
    } catch (error) {
      console.error('Error checking email duplicate:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  }, [t]);

  const onSubmit = async (data: PatientFormData) => {
    setPhoneError(null);
    setEmailError(null);
    setIsSubmitting(true);
    
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
    
    try {
      const result = await onSave(patient);
      
      if (result.success) {
        setOpen(false);
        form.reset();
      } else if (result.error?.toLowerCase().includes('phone')) {
        setPhoneError(t('patients.phone_already_exists'));
      } else if (result.error?.toLowerCase().includes('email')) {
        setEmailError(t('patients.email_already_exists'));
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Error saving patient:', error);
    } finally {
      setIsSubmitting(false);
    }
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">{t('patients.phone')} *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('patients.phone_placeholder')} 
                            {...field} 
                            className={cn("h-10", phoneError && "border-red-500 focus-visible:ring-red-500")}
                            onChange={(e) => {
                              field.onChange(e);
                              if (phoneError) setPhoneError(null);
                            }}
                            onBlur={(e) => {
                              field.onBlur();
                              checkPhoneDuplicate(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {isCheckingPhone && (
                          <p className="text-sm text-muted-foreground mt-1">{t('common.checking')}...</p>
                        )}
                        {phoneError && (
                          <p className="text-sm font-medium text-red-500 mt-1">
                            {phoneError}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel className="text-sm font-medium">{t('patients.date_of_birth')} *</FormLabel>
                        <Popover open={dobCalendarOpen} onOpenChange={setDobCalendarOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal h-10",
                                  !field.value && "text-muted-foreground"
                                )}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setDobCalendarOpen(true);
                                }}
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
                                setDobCalendarOpen(false);
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
                    )}
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
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={isLoadingProviders ? t('common.loading') : t('patients.insurance_provider_placeholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t('patients.no_insurance')}</SelectItem>
                            {insuranceProviders.map((provider) => (
                              <SelectItem key={provider.id} value={provider.name}>
                                {provider.name}
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

              <div className="border-t pt-4">
                <h3 className="text-base sm:text-lg font-medium mb-3">{t('patients.user_account')}</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="createUserAccount"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">
                            {t('patients.create_user_account')}
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            {t('patients.create_user_account_description')}
                          </p>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                            aria-label={t('patients.create_user_account')}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('createUserAccount') && (
                    <>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              {t('patients.email')} *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder={t('patients.email_placeholder')} 
                                {...field} 
                                className={cn("h-10", emailError && "border-red-500 focus-visible:ring-red-500")}
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (emailError) setEmailError(null);
                                }}
                                onBlur={(e) => {
                                  field.onBlur();
                                  checkEmailDuplicate(e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                            {isCheckingEmail && (
                              <p className="text-sm text-muted-foreground mt-1">{t('common.checking')}...</p>
                            )}
                            {emailError && (
                              <p className="text-sm font-medium text-red-500 mt-1">
                                {emailError}
                              </p>
                            )}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="userPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              {t('patients.user_password')} *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword ? "text" : "password"}
                                  placeholder={t('patients.user_password_placeholder')}
                                  {...field} 
                                  className="h-10 pr-10" 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                  aria-label={showPassword ? t('common.hide_password') : t('common.show_password')}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              {t('patients.password_requirements')}
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </div>
              
              {/* Spacer at the bottom */}
              <div className="h-16"></div>
            </form>
          </Form>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button 
            type="button" 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {isSubmitting ? t('common.saving') : t('patients.save_patient')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}