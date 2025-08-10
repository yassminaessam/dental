
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { Specialist } from '@/app/referrals/page';
import type { Patient } from '@/app/patients/page';

const referralSchema = z.object({
  patient: z.string({ required_error: 'Patient is required.' }),
  specialist: z.string({ required_error: 'Specialist is required.' }),
  reason: z.string().min(1, 'Reason for referral is required.'),
  urgency: z.enum(['routine', 'urgent', 'emergency'], { required_error: 'Urgency level is required.' }),
});

type ReferralFormData = z.infer<typeof referralSchema>;

const referralUrgency = ['Routine', 'Urgent', 'Emergency'];

interface NewReferralDialogProps {
  onSave: (data: any) => void;
  specialists: Specialist[];
  patients: Patient[];
}

export function NewReferralDialog({ onSave, specialists, patients }: NewReferralDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { t } = useLanguage();
  const form = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
  });

  const onSubmit = (data: ReferralFormData) => {
    onSave(data);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          {t('referrals.new_referral')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('referrals.create_new_referral')}</DialogTitle>
          <DialogDescription>
            {t('referrals.create_new_referral_desc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
        <FormLabel>{t('referrals.form.patient')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
          <SelectValue placeholder={t('referrals.placeholder.select_patient')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
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
                name="specialist"
                render={({ field }) => (
                  <FormItem>
        <FormLabel>{t('referrals.form.specialist')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
          <SelectValue placeholder={t('referrals.placeholder.select_specialist')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialists.map((specialist) => (
                          <SelectItem key={specialist.id} value={specialist.id}>
                            {specialist.name} ({specialist.specialty})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('referrals.form.reason')} *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('referrals.placeholder.reason_detail')}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('referrals.form.urgency')} *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('referrals.placeholder.select_urgency')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="routine">{t('referrals.urgency.routine')}</SelectItem>
                      <SelectItem value="urgent">{t('referrals.urgency.urgent')}</SelectItem>
                      <SelectItem value="emergency">{t('referrals.urgency.emergency')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('referrals.actions.send_referral')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
