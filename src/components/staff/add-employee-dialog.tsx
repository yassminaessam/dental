

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
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
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
  // Email is optional: allow empty string or a valid email
  email: z.union([z.string().email(t('staff.validation.invalid_email')), z.literal('')]),
    phone: z.string().optional(),
    role: z.string({ required_error: t('staff.validation.role_required') }),
    hireDate: z.date({ required_error: t('staff.validation.hire_date_required') }),
    salary: z.string().min(1, t('staff.validation.salary_required')),
  }), [t]);
  const [open, setOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      salary: '',
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    onSave({
      name: `${data.firstName} ${data.lastName}`,
      role: data.role,
      email: data.email,
      phone: data.phone || '',
      salary: data.salary,
      hireDate: data.hireDate.toISOString(),
    });
    form.reset();
    setOpen(false);
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('staff.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('staff.email_placeholder')} {...field} />
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
                    <FormLabel>{t('staff.phone')}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder={t('staff.phone_placeholder')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
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
