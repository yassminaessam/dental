
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
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useLanguage } from '@/contexts/LanguageContext';

const templateSchema = z.object({
  name: z.string().min(1, 'communications.templates'),
  type: z.enum(['Email', 'SMS'], { required_error: 'communications.type' }),
  subject: z.string().optional(),
  body: z.string().min(1, 'communications.content'),
});

export type Template = z.infer<typeof templateSchema> & { id: string };

interface NewTemplateDialogProps {
  onSave: (data: Omit<Template, 'id'>) => void;
}

export function NewTemplateDialog({ onSave }: NewTemplateDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { t, isRTL } = useLanguage();
  const form = useForm<Omit<Template, 'id'>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      type: 'Email',
      subject: '',
      body: '',
    },
  });

  const onSubmit = (data: Omit<Template, 'id'>) => {
    onSave(data);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          {t('communications.templates')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('communications.templates')}</DialogTitle>
          <DialogDescription>
            {t('communications.reusable_templates')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name *</FormLabel>
                  <FormLabel>{t('communications.templates')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('communications.subject_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage>
                    {(() => {
                      const err = form.formState.errors.name;
                      if (!err) return null;
                      return t(String(err.message));
                    })()}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <FormLabel>{t('communications.type')} *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Email" id="t-email" />
                        </FormControl>
                        <FormLabel htmlFor="t-email">Email</FormLabel>
                        <FormLabel htmlFor="t-email">{t('communications.email')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="SMS" id="t-sms" />
                        </FormControl>
                        <FormLabel htmlFor="t-sms">SMS</FormLabel>
                      </FormItem>
                          <FormLabel htmlFor="t-sms">{t('communications.sms')}</FormLabel>
                    </RadioGroup>
                  </FormControl>
                    <FormMessage>
                      {(() => {
                        const err = form.formState.errors.type;
                        if (!err) return null;
                        return t(String(err.message));
                      })()}
                    </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormLabel>{t('communications.subject')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('communications.subject_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Body *</FormLabel>
                  <FormLabel>{t('communications.content')} *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('communications.message_placeholder')} 
                      className="min-h-[120px]" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>
                    {(() => {
                      const err = form.formState.errors.body;
                      if (!err) return null;
                      return t(String(err.message));
                    })()}
                  </FormMessage>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
