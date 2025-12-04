

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
import { Calendar as CalendarIcon, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Patient } from '@/app/patients/page';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { listDocuments } from '@/lib/data-client';

type InsuranceProvider = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

const buildPatientSchema = (t: (key: string, params?: Record<string, string | number>) => string) =>
  z.object({
    name: z.string().min(1, { message: t('patients.validation.first_name_required') }),
    lastName: z.string().min(1, { message: t('patients.validation.last_name_required') }),
    // Email is required for user account creation
    email: z.string().email({ message: t('validation.invalid_email') }).min(1, { message: 'Email is required' }),
    phone: z.string().min(1, { message: t('patients.validation.phone_required') }),
    dob: z.date({ required_error: t('patients.validation.dob_required') }),
    status: z.enum(['Active', 'Inactive']),
    address: z.string().optional(),
    ecName: z.string().optional(),
    ecPhone: z.string().optional(),
    ecRelationship: z.string().optional(),
    insuranceProvider: z.string().optional(),
    policyNumber: z.string().optional(),
    medicalHistory: z
      .array(
        z.object({
          condition: z.string().min(1, t('patients.validation.condition_required')),
        })
      )
      .optional(),
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


type PatientFormData = z.infer<ReturnType<typeof buildPatientSchema>>;

interface EditPatientDialogProps {
  patient: Patient;
  onSave: (data: Patient & { createUserAccount?: boolean; userPassword?: string }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emergencyContactRelationships = [
  { value: 'spouse', key: 'patients.relationship.spouse' },
  { value: 'parent', key: 'patients.relationship.parent' },
  { value: 'child', key: 'patients.relationship.child' },
  { value: 'sibling', key: 'patients.relationship.sibling' },
  { value: 'friend', key: 'patients.relationship.friend' },
  { value: 'other', key: 'patients.relationship.other' },
];


export function EditPatientDialog({ patient, onSave, open, onOpenChange }: EditPatientDialogProps) {
  const { t } = useLanguage();
  const [dobOpen, setDobOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [hasUserAccount, setHasUserAccount] = React.useState(false);
  const [insuranceProviders, setInsuranceProviders] = React.useState<InsuranceProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = React.useState(false);
  const form = useForm<PatientFormData>({
    resolver: zodResolver(buildPatientSchema(t)),
  });

   const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicalHistory",
  });

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

  // Check if patient has user account
  React.useEffect(() => {
    const checkUserAccount = async () => {
      if (patient && patient.email) {
        try {
          const response = await fetch(`/api/patient/profile?email=${encodeURIComponent(patient.email)}`);
          if (response.ok) {
            const data = await response.json();
            setHasUserAccount(!!data.patient);
          }
        } catch (error) {
          console.log('Could not check user account status');
        }
      }
    };
    checkUserAccount();
  }, [patient]);

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
        createUserAccount: false,
        userPassword: '',
      });
    }
  }, [patient, form]);

  const onSubmit = (data: PatientFormData) => {
    const updatedPatient: Patient & { createUserAccount?: boolean; userPassword?: string } = {
      ...patient,
      ...data,
      age: new Date().getFullYear() - new Date(data.dob).getFullYear(),
      createUserAccount: data.createUserAccount,
      userPassword: data.userPassword,
    };
    onSave(updatedPatient);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-3xl h-[90vh] flex flex-col min-h-0">
        <DialogHeader>
          <DialogTitle>{t('patients.edit_patient_details')}</DialogTitle>
          <DialogDescription>
            {t('patients.update_details_for', { name: patient.name })}
          </DialogDescription>
        </DialogHeader>
  <ScrollArea className="flex-1 min-h-0 pr-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="edit-patient-form" className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('patients.first_name')} *</FormLabel>
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
                        <FormLabel>{t('patients.last_name')} *</FormLabel>
                        <FormControl>
                        <Input placeholder="Ali" {...field} />
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
                        <FormLabel>{t('patients.phone')} *</FormLabel>
                        <FormControl>
                        <Input type="tel" placeholder={t('patients.phone_placeholder')} {...field} />
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
                        <FormLabel>{t('patients.date_of_birth')} *</FormLabel>
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
                                {field.value ? format(field.value, "PPP") : <span>{t('patients.dob_placeholder')}</span>}
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
                        <FormLabel>{t('common.status')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('common.select_status')} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Active">{t('common.active')}</SelectItem>
                                <SelectItem value="Inactive">{t('common.inactive')}</SelectItem>
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
                        <FormLabel>{t('patients.address')}</FormLabel>
                        <FormControl>
                        <Textarea placeholder={t('patients.address_placeholder')} {...field} />
                        </FormControl>
                    </FormItem>
                    )}
                />
                </div>

                <div>
                    <h3 className="mb-4 text-lg font-medium">{t('patients.emergency_contact')}</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormField control={form.control} name="ecName" render={({ field }) => (
                            <FormItem><FormLabel>{t('patients.ec_name')}</FormLabel><FormControl><Input placeholder={t('patients.emergency_name_placeholder')} {...field} /></FormControl></FormItem>
                        )}/>
                        <FormField control={form.control} name="ecPhone" render={({ field }) => (
                            <FormItem><FormLabel>{t('patients.ec_phone')}</FormLabel><FormControl><Input type="tel" placeholder={t('patients.phone_placeholder')} {...field} /></FormControl></FormItem>
                        )}/>
                        <FormField control={form.control} name="ecRelationship" render={({ field }) => (
                            <FormItem><FormLabel>{t('patients.relationship')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder={t('patients.select_relationship')} /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {emergencyContactRelationships.map((rel) => (
                                    <SelectItem key={rel.value} value={rel.value}>{t(rel.key)}</SelectItem>
                                  ))}
                                </SelectContent>
                            </Select>
                            </FormItem>
                        )}/>
                    </div>
                </div>
                <div>
                  <h3 className="mb-4 text-lg font-medium">{t('patients.insurance_information')}</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField control={form.control} name="insuranceProvider" render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('patients.insurance_provider')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <FormControl>
                                <SelectTrigger>
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
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="policyNumber" render={({ field }) => (
                          <FormItem><FormLabel>{t('patients.policy_number')}</FormLabel><FormControl><Input placeholder={t('patients.policy_number_placeholder')} {...field} /></FormControl></FormItem>
                      )}/>
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 text-lg font-medium">{t('patients.medical_history')}</h3>
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                         <FormField control={form.control} name={`medicalHistory.${index}.condition`} render={({ field }) => (
                              <FormItem className="flex-grow"><FormControl><Input placeholder={t('patients.medical_condition_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                         )}/>
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => append({ condition: '' })}><Plus className="mr-2 h-4 w-4" />{t('patients.add_medical_condition')}</Button>
                  </div>
                </div>

                {/* User Account Section */}
                <div className="border-t pt-4">
                  <h3 className="text-base sm:text-lg font-medium mb-3">{t('patients.user_account')}</h3>
                  <div className="space-y-4">
                    {!hasUserAccount && (
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
                    )}
                    
                    {hasUserAccount && (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-4">
                        <p className="text-sm text-green-800">
                          ✓ {t('patients.user_account_exists')}
                        </p>
                      </div>
                    )}
                    
                    {(hasUserAccount || form.watch('createUserAccount')) && (
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
                                  className="h-10" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="userPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium">
                                {hasUserAccount ? t('patients.new_password') : t('patients.user_password')} {!hasUserAccount && '*'}
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder={hasUserAccount ? t('patients.new_password_placeholder') : t('patients.user_password_placeholder')}
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
                                {hasUserAccount ? t('patients.password_update_hint') : t('patients.password_requirements')}
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
            </form>
          </Form>
        </ScrollArea>
  <DialogFooter className="border-t pt-4 print:hidden">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button type="submit" form="edit-patient-form">{t('common.save_changes')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
