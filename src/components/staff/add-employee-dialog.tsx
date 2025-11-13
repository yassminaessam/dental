

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import type { StaffMember } from '@/app/staff/page';

// Schema will be built inside component to use localized messages
// Define the form data type explicitly to avoid referencing schema before declaration
type EmployeeFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  hireDate: Date;
  salary: string;
  createUserAccount?: boolean;
  userPassword?: string;
  userSpecialization?: string;
  userDepartment?: string;
};

// System roles that match UserRole type from types.ts
const systemRoles = [
  { 
    value: "admin", 
    labelKey: "roles.admin",
    descriptionKey: "roles.admin_desc",
    permissions: ["Full system access", "User management", "All reports"]
  },
  { 
    value: "doctor", 
    labelKey: "roles.doctor",
    descriptionKey: "roles.doctor_desc", 
    permissions: ["Patient management", "Medical records", "Treatments"]
  },
  { 
    value: "receptionist", 
    labelKey: "roles.receptionist",
    descriptionKey: "roles.receptionist_desc",
    permissions: ["Appointments", "Billing", "Patient communications"]
  },
];

// Additional staff roles for non-system users
const staffRoles = [
  { 
    value: "dentist", 
    labelKey: "roles.dentist",
    descriptionKey: "roles.dentist_desc",
    permissions: ["Dental procedures", "Patient care", "Treatment plans"]
  },
  { 
    value: "hygienist", 
    labelKey: "roles.hygienist", 
    descriptionKey: "roles.hygienist_desc",
    permissions: ["Teeth cleaning", "Preventive care", "Patient education"]
  },
  { 
    value: "assistant", 
    labelKey: "roles.assistant",
    descriptionKey: "roles.assistant_desc",
    permissions: ["Assist procedures", "Sterilization", "Equipment setup"]
  },
  { 
    value: "manager", 
    labelKey: "roles.manager",
    descriptionKey: "roles.manager_desc",
    permissions: ["Staff management", "Operations", "Scheduling"]
  },
];

// Combine all roles
const allRoles = [...systemRoles, ...staffRoles];

interface AddEmployeeDialogProps {
  onSave: (data: Omit<StaffMember, 'id' | 'schedule' | 'status'>) => void;
}

export function AddEmployeeDialog({ onSave }: AddEmployeeDialogProps) {
  const { t, isRTL } = useLanguage();
  const employeeSchema = React.useMemo(() => z.object({
    firstName: z.string().min(1, t('staff.validation.first_name_required')),
    lastName: z.string().min(1, t('staff.validation.last_name_required')),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.string({ required_error: t('staff.validation.role_required') }),
    hireDate: z.date({ required_error: t('staff.validation.hire_date_required') }),
    salary: z.string().min(1, t('staff.validation.salary_required')),
    createUserAccount: z.boolean().optional(),
    userPassword: z.string().optional(),
    userSpecialization: z.string().optional(),
    userDepartment: z.string().optional(),
  }).refine((data) => {
    // If createUserAccount is true, email is required
    if (data.createUserAccount && !data.email) {
      return false;
    }
    // If email is provided, it should be valid
    if (data.email && data.email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return false;
      }
    }
    return true;
  }, {
    message: t('staff.validation.email_required'),
    path: ['email'],
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
  }), [t]);
  const [open, setOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      salary: '',
      createUserAccount: false,
      userPassword: '',
      userSpecialization: '',
      userDepartment: '',
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      // Save the staff member
      onSave({
        name: `${data.firstName} ${data.lastName}`,
        role: data.role,
        email: data.email,
        phone: data.phone || '',
        salary: data.salary,
        hireDate: data.hireDate.toISOString(),
      });

      // If user account creation is requested, create it
      if (data.createUserAccount && data.userPassword) {
        const userRole = ['admin', 'doctor', 'receptionist'].includes(data.role.toLowerCase()) 
          ? data.role.toLowerCase() 
          : 'receptionist'; // Default to receptionist for other staff roles

        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.email,
              password: data.userPassword,
              firstName: data.firstName,
              lastName: data.lastName,
              role: userRole,
              phone: data.phone || '',
              specialization: data.userSpecialization || null,
              department: data.userDepartment || null,
            }),
          });

          if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorMessage = 'Unknown error';
            
            if (contentType && contentType.includes('application/json')) {
              try {
                const errorData = await response.json();
                errorMessage = errorData.error || JSON.stringify(errorData);
              } catch (e) {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
              }
            } else {
              const errorText = await response.text();
              errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
            }
            
            console.error('Failed to create user account:', { status: response.status, error: errorMessage });
            // Don't throw error - staff was created, just notify
            alert(`${t('staff.user_account_creation_failed')}\n\nError: ${errorMessage}`);
          } else {
            console.log('User account created successfully');
          }
        } catch (error) {
          console.error('Error creating user account:', error);
          alert(`${t('staff.user_account_creation_failed')}\n\nError: ${error instanceof Error ? error.message : 'Network error'}`);
        }
      }

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error in onSubmit:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
          {t('staff.add_employee')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('staff.add_employee')}</DialogTitle>
          <DialogDescription>
            {t('staff.add_employee_description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('staff.first_name')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('staff.first_name_placeholder')} {...field} />
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
                    <FormLabel>{t('staff.last_name')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('staff.last_name_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('staff.phone')}</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder={t('staff.phone_placeholder')} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('staff.role')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('staff.select_role')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent 
                        className="max-h-[300px] overflow-y-auto" 
                        style={{ zIndex: 20000 }}
                        position="popper"
                        side="bottom"
                        align="start"
                      >
                        {/* System Roles Section */}
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50 rounded-md mb-1">
                          {t('staff.system_roles')}
                        </div>
                        {systemRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value} className="py-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="font-medium">{t(role.labelKey)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {t(role.descriptionKey)}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {role.permissions.slice(0, 2).map((permission, index) => (
                                  <span key={index} className="text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
                                    {permission}
                                  </span>
                                ))}
                                {role.permissions.length > 2 && (
                                  <span className="text-xs text-muted-foreground">+{role.permissions.length - 2}</span>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                        
                        {/* Staff Roles Section */}
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted/50 rounded-md mb-1 mt-2">
                          {t('staff.staff_roles')}
                        </div>
                        {staffRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value} className="py-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent" />
                                <span className="font-medium">{t(role.labelKey)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {t(role.descriptionKey)}
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {role.permissions.slice(0, 2).map((permission, index) => (
                                  <span key={index} className="text-xs bg-accent/10 text-accent-foreground px-1 py-0.5 rounded">
                                    {permission}
                                  </span>
                                ))}
                                {role.permissions.length > 2 && (
                                  <span className="text-xs text-muted-foreground">+{role.permissions.length - 2}</span>
                                )}
                              </div>
                            </div>
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
                name="hireDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('staff.hire_date')} *</FormLabel>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            <CalendarIcon className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                            {field.value ? format(field.value, "PPP") : <span>{t('staff.pick_date')}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0" 
                        style={{ zIndex: 20000 }}
                        side="bottom"
                        align="start"
                      >
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
            </div>
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('staff.salary_per_year')}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={t('staff.salary_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User Account Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {t('staff.user_account')}
              </h3>
              
              <FormField
                control={form.control}
                name="createUserAccount"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none flex-1">
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        {t('staff.create_login_account')}
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        {t('staff.create_login_account_desc')}
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch('createUserAccount') && (
                <div className="space-y-4 pl-7 animate-in slide-in-from-top-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {t('staff.email')} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder={t('staff.email_placeholder')}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          {t('staff.email_hint')}
                        </p>
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
                          {t('staff.password')} *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder={t('staff.password_placeholder')}
                              {...field}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground">
                          {t('staff.password_hint')}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {['admin', 'doctor', 'dentist'].includes(form.watch('role')?.toLowerCase() || '') && (
                    <>
                      <FormField
                        control={form.control}
                        name="userSpecialization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              {t('staff.specialization')}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('staff.specialization_placeholder')}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="userDepartment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">
                              {t('staff.department')}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t('staff.department_placeholder')}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('staff.save_employee')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
