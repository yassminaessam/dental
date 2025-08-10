
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { UserPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const providerSchema = z.object({
  name: z.string().min(1, 'Provider name is required.'),
  phone: z.string().optional(),
  email: z.string().email({ message: "Invalid email." }).optional().or(z.literal('')),
  address: z.string().optional(),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface AddProviderDialogProps {
  onSave: (data: ProviderFormData) => void;
}

export function AddProviderDialog({ onSave }: AddProviderDialogProps) {
  const { t, isRTL } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
        name: '',
        phone: '',
        email: '',
        address: '',
    }
  });

  const onSubmit = (data: ProviderFormData) => {
    onSave(data);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
          {t('insurance.add_provider')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('insurance.add_insurance_provider')}</DialogTitle>
          <DialogDescription>
            {t('insurance.add_insurance_provider_desc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('insurance.provider_name')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('insurance.placeholder.provider_name_example')} {...field} />
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
                  <FormLabel>{t('insurance.phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('insurance.placeholder.phone_example')} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('insurance.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t('insurance.placeholder.email_example')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('insurance.address')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('insurance.placeholder.address_example')} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('insurance.save_provider')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
