
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Specialist } from '@/app/referrals/page';
import { useLanguage } from '@/contexts/LanguageContext';

const specialistSchema = z.object({
  name: z.string().min(1, 'Specialist name is required.'),
  specialty: z.string({ required_error: 'Specialty is required.' }),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  clinicName: z.string().optional(),
});

type SpecialistFormData = z.infer<typeof specialistSchema>;

const specialistTypes = ['Oral Surgery', 'Periodontics', 'Orthodontics', 'Endodontics', 'Prosthodontics'];

interface EditSpecialistDialogProps {
  onSave: (data: Specialist) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialist: Specialist;
}

export function EditSpecialistDialog({ onSave, open, onOpenChange, specialist }: EditSpecialistDialogProps) {
  const { t } = useLanguage();
  const form = useForm<SpecialistFormData>({
    resolver: zodResolver(specialistSchema),
  });

  React.useEffect(() => {
    if (specialist) {
        form.reset({
            name: specialist.name,
            specialty: specialist.specialty,
            phone: specialist.phone,
            email: specialist.email,
            clinicName: specialist.clinicName,
        });
    }
  }, [specialist, form]);

  const onSubmit = (data: SpecialistFormData) => {
    onSave({ ...specialist, ...data });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('referrals.specialist.edit')}</DialogTitle>
          <DialogDescription>
            {t('referrals.specialist.edit_desc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('referrals.specialist.name')} *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Dr. Robert Chen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('referrals.specialty')} *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('referrals.specialist.select_specialty')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialistTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="specialist@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="clinicName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic/Practice Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., City Oral Surgery" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
