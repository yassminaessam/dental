
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
import { Plus, Pencil } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useLanguage } from '@/contexts/LanguageContext';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.enum(['Email'], { required_error: 'Type is required' }),
  subject: z.string().optional(),
  body: z.string().min(1, 'Template body is required'),
});

export type Template = z.infer<typeof templateSchema> & { id: string };

interface NewTemplateDialogProps {
  onSave: (data: Omit<Template, 'id'>) => void;
  onUpdate?: (data: Template) => void;
  editTemplate?: Template | null;
  mode?: 'create' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NewTemplateDialog({ 
  onSave, 
  onUpdate, 
  editTemplate = null, 
  mode = 'create',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: NewTemplateDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const { t, isRTL } = useLanguage();
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen || setInternalOpen;
  
  const isEditMode = mode === 'edit' && editTemplate;

  const form = useForm<Omit<Template, 'id'>>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      type: 'Email',
      subject: '',
      body: '',
    },
  });

  // Reset form when editTemplate changes or dialog opens
  React.useEffect(() => {
    if (open) {
      if (isEditMode && editTemplate) {
        form.reset({
          name: editTemplate.name,
          type: editTemplate.type,
          subject: editTemplate.subject || '',
          body: editTemplate.body,
        });
      } else if (!isEditMode) {
        form.reset({
          name: '',
          type: 'Email',
          subject: '',
          body: '',
        });
      }
    }
  }, [editTemplate, isEditMode, form, open]);

  const onSubmit = (data: Omit<Template, 'id'>) => {
    if (isEditMode && editTemplate && onUpdate) {
      onUpdate({ ...data, id: editTemplate.id });
    } else {
      onSave(data);
    }
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {mode === 'create' && (
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            {t('communications.templates')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[625px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Pencil className="h-5 w-5" />
                {t('communications.edit_template') || 'Edit Template'}
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                {t('communications.create_template') || 'Create Template'}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? (t('communications.edit_template_desc') || 'Update your message template')
              : (t('communications.reusable_templates') || 'Create reusable message templates')
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('communications.template_name') || 'Template Name'} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('communications.template_name_placeholder') || 'e.g. Appointment Reminder'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Type is always Email, hidden field */}
            <input type="hidden" {...form.register('type')} value="Email" />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
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
                  <FormLabel>{t('communications.content')} *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('communications.template_body_placeholder') || 'Write your template message here. Use {patient_name}, {appointment_date}, etc. for dynamic content.'} 
                      className="min-h-[150px]" 
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('communications.template_variables_hint') || 'Available variables: {patient_name}, {appointment_date}, {appointment_time}, {doctor_name}, {clinic_name}'}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                {isEditMode ? (t('common.save_changes') || 'Save Changes') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
