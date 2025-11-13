

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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { StaffMember } from '@/app/staff/page';
import { useLanguage } from '@/contexts/LanguageContext';

type EmployeeFormData = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: string;
  hireDate: Date;
  salary: string;
  status: 'Active' | 'Inactive';
  notes?: string;
  hasUserAccount?: boolean;
  createUserAccount?: boolean;
  userPassword?: string;
  userSpecialization?: string;
  userDepartment?: string;
};

const staffRoles = [
  { name: "Dentist" },
  { name: "Hygienist" },
  { name: "Assistant" },
  { name: "Receptionist" },
  { name: "Manager" },
];

interface EditEmployeeDialogProps {
  staffMember: StaffMember;
  onSave: (data: StaffMember) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEmployeeDialog({ staffMember, onSave, open, onOpenChange }: EditEmployeeDialogProps) {
  const { t, isRTL } = useLanguage();
  const [dateOpen, setDateOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [hasExistingUser, setHasExistingUser] = React.useState(false);
  const [existingUser, setExistingUser] = React.useState<any>(null);
  
  const employeeSchema = React.useMemo(() => z.object({
    firstName: z.string().min(1, t('staff.validation.first_name_required')),
    lastName: z.string().min(1, t('staff.validation.last_name_required')),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.string({ required_error: t('staff.validation.role_required') }),
    hireDate: z.date({ required_error: t('staff.validation.hire_date_required') }),
    salary: z.string().min(1, t('staff.validation.salary_required')),
    status: z.enum(['Active', 'Inactive']),
    notes: z.string().optional(),
    hasUserAccount: z.boolean().optional(),
    createUserAccount: z.boolean().optional(),
    userPassword: z.string().optional(),
    userSpecialization: z.string().optional(),
    userDepartment: z.string().optional(),
  }).refine((data) => {
    // If creating user account, email is required
    if (data.createUserAccount && !data.email) {
      return false;
    }
    // Validate email format if provided
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
    // If creating user account, password is required
    if (data.createUserAccount && !data.userPassword) {
      return false;
    }
    // Validate password length if provided
    if (data.userPassword && data.userPassword.length < 8) {
      return false;
    }
    return true;
  }, {
    message: 'Password must be at least 8 characters when creating user account',
    path: ['userPassword'],
  }), [t]);

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  React.useEffect(() => {
    if (staffMember && open) {
      const nameParts = staffMember.name.split(' ');
      
      // Check if staff member has a linked user account
      const checkUserAccount = async () => {
        console.log('[EditEmployeeDialog] Checking user account for staff:', staffMember.name, 'userId:', (staffMember as any).userId);
        if ((staffMember as any).userId) {
          try {
            const response = await fetch(`/api/users/${(staffMember as any).userId}`);
            console.log('[EditEmployeeDialog] User fetch response status:', response.status);
            if (response.ok) {
              const data = await response.json();
              console.log('[EditEmployeeDialog] User data received:', data);
              setExistingUser(data.user);
              setHasExistingUser(true);
              console.log('[EditEmployeeDialog] Set hasExistingUser to true');
            } else {
              console.log('[EditEmployeeDialog] Response not OK, setting hasExistingUser to false');
              setHasExistingUser(false);
              setExistingUser(null);
            }
          } catch (error) {
            console.error('[EditEmployeeDialog] Error fetching user:', error);
            setHasExistingUser(false);
            setExistingUser(null);
          }
        } else if (staffMember.phone) {
          // Fallback: try lookup by phone if userId is missing
          try {
            const lookup = await fetch(`/api/auth/users/lookup?phone=${encodeURIComponent(staffMember.phone)}`);
            console.log('[EditEmployeeDialog] Lookup by phone status:', lookup.status);
            if (lookup.ok) {
              const data = await lookup.json();
              if (data.user) {
                setExistingUser(data.user);
                setHasExistingUser(true);
                console.log('[EditEmployeeDialog] Found user by phone, set hasExistingUser to true');
              } else {
                setHasExistingUser(false);
                setExistingUser(null);
              }
            } else {
              setHasExistingUser(false);
              setExistingUser(null);
            }
          } catch (e) {
            console.error('[EditEmployeeDialog] Phone lookup failed:', e);
            setHasExistingUser(false);
            setExistingUser(null);
          }
        } else {
          console.log('[EditEmployeeDialog] No userId or phone, setting hasExistingUser to false');
          setHasExistingUser(false);
          setExistingUser(null);
        }
      };
      
      checkUserAccount();
      
      form.reset({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: staffMember.email,
        phone: staffMember.phone,
        role: staffMember.role,
        hireDate: new Date(staffMember.hireDate),
        salary: staffMember.salary.replace(/[^0-9.-]+/g,""),
        status: staffMember.status,
        notes: staffMember.notes || '',
        hasUserAccount: !!(staffMember as any).userId,
        createUserAccount: false,
        userPassword: '',
        userSpecialization: '',
        userDepartment: '',
      });
    }
  }, [staffMember, form, open]);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      const updatedStaffMember: StaffMember = {
        ...staffMember,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email || '',
        phone: data.phone || '',
        role: data.role,
        hireDate: new Date(data.hireDate).toLocaleDateString(),
        salary: `EGP ${parseInt(data.salary).toLocaleString()}`,
        status: data.status,
        notes: data.notes || '',
      };
      
      // Save staff member first
      onSave(updatedStaffMember);

      // If creating new user account (only when there's no existing user)
      if (data.createUserAccount && !hasExistingUser && !existingUser && data.userPassword) {
        const userRole = ['admin', 'doctor', 'receptionist'].includes(data.role.toLowerCase()) 
          ? data.role.toLowerCase() 
          : 'receptionist';

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
            alert(`${t('staff.user_account_creation_failed')}\n\nError: ${errorMessage}`);
          } else {
            console.log('User account created successfully');
            alert(t('staff.user_account_created'));
          }
        } catch (error) {
          console.error('Error creating user account:', error);
          alert(`${t('staff.user_account_creation_failed')}\n\nError: ${error instanceof Error ? error.message : 'Network error'}`);
        }
      }
      
      // If updating existing user account
      if (hasExistingUser && existingUser && data.email) {
        try {
          const updateData: any = {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || '',
          };
          
          // Add specialization and department for doctors
          if (['admin', 'doctor', 'dentist'].includes(data.role.toLowerCase())) {
            updateData.specialization = data.userSpecialization || null;
            updateData.department = data.userDepartment || null;
          }
          
          // Add password if provided
          if (data.userPassword && data.userPassword.length >= 8) {
            updateData.password = data.userPassword;
          }

          const response = await fetch(`/api/users/${existingUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
          });

          if (!response.ok) {
            console.error('Failed to update user account:', await response.json());
          }
        } catch (error) {
          console.error('Error updating user account:', error);
        }
      }
      
    } catch (error) {
      console.error('Error in onSubmit:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('staff.edit_employee')}</DialogTitle>
          <DialogDescription>
            {t('staff.edit_employee_description')}
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
                      <SelectContent>
                        {staffRoles.map((role) => (
                          <SelectItem key={role.name} value={role.name}>
                            {t(`roles.${role.name.toLowerCase()}`)}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
            <FormLabel>{t('common.status')} *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                  <SelectValue placeholder={t('staff.select_status')} />
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
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('staff.notes')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('staff.notes_placeholder')} 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* User Account Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {t('staff.user_account')}
              </h3>
              
              {hasExistingUser && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-4">
                  <p className="text-sm text-green-800">
                    ✓ {t('staff.user_account_exists')}
                  </p>
                </div>
              )}
              
              {hasExistingUser ? (
                <div className="space-y-4">
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
                            {t('staff.new_password')}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('staff.new_password_placeholder')}
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
                            {t('staff.new_password_hint')}
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
              ) : (
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
              )}

              {!hasExistingUser && form.watch('createUserAccount') && (
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.save_changes')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
