
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { InsuranceProvider } from '@/app/insurance/page';

const providerSchema = z.object({
  name: z.string().min(1, 'Provider name is required.'),
  phone: z.string().optional(),
  email: z.string().email({ message: "Invalid email." }).optional().or(z.literal('')),
  address: z.string().optional(),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface EditProviderDialogProps {
  onSave: (data: InsuranceProvider) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: InsuranceProvider;
}

export function EditProviderDialog({ onSave, open, onOpenChange, provider }: EditProviderDialogProps) {
  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
  });

  React.useEffect(() => {
    if (provider) {
        form.reset({
            name: provider.name,
            phone: provider.phone,
            email: provider.email,
            address: provider.address,
        });
    }
  }, [provider, form]);

  const onSubmit = (data: ProviderFormData) => {
    onSave({ ...provider, ...data });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Insurance Provider</DialogTitle>
          <DialogDescription>
            Update the details for {provider.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Misr Insurance" {...field} />
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
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 19001" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g., claims@misr.com" {...field} />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Nile St, Cairo" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
