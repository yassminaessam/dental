

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
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { StaffMember } from '@/app/staff/page';
import { useLanguage } from '@/contexts/LanguageContext';

const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  role: z.string({ required_error: "Role is required." }),
  hireDate: z.date({ required_error: "Hire date is required." }),
  salary: z.string().min(1, "Salary is required."),
  status: z.enum(['Active', 'Inactive']),
  notes: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

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
  const [dateOpen, setDateOpen] = React.useState(false);
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });
  const { t, isRTL } = useLanguage();

  React.useEffect(() => {
    if (staffMember) {
      const nameParts = staffMember.name.split(' ');
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
      });
    }
  }, [staffMember, form]);

  const onSubmit = (data: EmployeeFormData) => {
    const updatedStaffMember: StaffMember = {
      ...staffMember,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone || '',
      role: data.role,
      hireDate: new Date(data.hireDate).toLocaleDateString(),
      salary: `EGP ${parseInt(data.salary).toLocaleString()}`,
      status: data.status,
      notes: data.notes || '',
    };
    onSave(updatedStaffMember);
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('staff.email')} *</FormLabel>
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
