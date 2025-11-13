
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
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare as MessageSquareIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { GenerateMessageAi } from './generate-message-ai';
import { Patient } from '@/app/patients/page';
import { listDocuments } from '@/lib/data-client';
import { useLanguage } from '@/contexts/LanguageContext';

const messageSchema = z.object({
  patient: z.string({ required_error: 'communications.select_patient' }),
  type: z.enum(['Email', 'SMS'], { required_error: 'communications.message_type' }),
  subject: z.string().min(1, 'communications.subject'),
  message: z.string().min(1, 'communications.message'),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface NewMessageDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButtonText?: string;
  dialogTitle?: string;
  dialogDescription?: string;
  onSend: (data: any) => void;
  isReply?: boolean;
  initialData?: { patientName: string; subject: string, originalMessage?: string } | null;
}

export function NewMessageDialog({ 
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  triggerButtonText,
  dialogTitle,
  dialogDescription,
  onSend,
  isReply = false,
  initialData = null,
}: NewMessageDialogProps) {
  const { t, isRTL } = useLanguage();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen || setInternalOpen;

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      patient: '',
      type: 'Email',
      subject: '',
      message: '',
    }
  });

  React.useEffect(() => {
    async function fetchPatients() {
      // ✅ Fetch patients from Neon database
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to fetch patients');
      const { patients: data } = await response.json();
      
      setPatients(
        data.map((p: any) => ({
          ...p,
          dob: p.dob ? new Date(p.dob) : new Date(),
        })) as Patient[]
      );
    }
    if (open) {
        fetchPatients();
    }
  }, [open]);

  React.useEffect(() => {
    if (initialData && open) {
      const patient = patients.find(p => p.name === initialData.patientName);
      form.reset({
        patient: patient?.id || '',
        subject: initialData.subject,
        message: initialData.originalMessage 
            ? `\n\n--- Original Message ---\n${initialData.originalMessage}`
            : '',
        type: 'Email',
      });
    } else if (!isReply) {
      form.reset({
        patient: '',
        type: 'Email',
        subject: '',
        message: '',
      });
    }
  }, [initialData, open, form, isReply, patients]);


  const patientId = form.watch('patient');
  const patientName = React.useMemo(() => {
    return patients.find(p => p.id === patientId)?.name || '';
  }, [patientId, patients]);

  const onSubmit = (data: MessageFormData) => {
    const patientDetails = patients.find(p => p.id === data.patient);
    onSend({ ...data, patient: patientDetails?.name || 'Unknown Patient' });
    form.reset();
    setOpen(false);
  };

  const dialogTitleText = isReply ? `${t('communications.reply_to')} ${initialData?.patientName}` : (dialogTitle || t('communications.send_message'));
  const dialogDescriptionText = isReply ? `${t('communications.replying_to_message')}: "${initialData?.subject}"` : (dialogDescription || t('communications.content'));
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isReply && (
        <DialogTrigger asChild>
          <Button>
            <MessageSquareIcon className="mr-2 h-4 w-4" />
            {triggerButtonText ?? t('communications.send_message')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[625px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{dialogTitleText}</DialogTitle>
          <DialogDescription>
            {dialogDescriptionText}
          </DialogDescription>
        </DialogHeader>
        
        <GenerateMessageAi
          patientName={patientName}
          onGeneration={({ subject, message }) => {
            form.setValue('subject', subject);
            form.setValue('message', message);
          }}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="patient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('communications.patient')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isReply}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('communications.select_patient')} />
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
                  <FormMessage>
                    {(() => {
                      const err = form.formState.errors.patient;
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
                  <FormLabel>{t('communications.type')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="Email" id="r-email" />
                        </FormControl>
                        <FormLabel htmlFor="r-email">{t('communications.email')}</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="SMS" id="r-sms" />
                        </FormControl>
                        <FormLabel htmlFor="r-sms">{t('communications.sms')}</FormLabel>
                      </FormItem>
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
                  <FormLabel>{t('communications.subject')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('communications.subject_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage>
                    {(() => {
                      const err = form.formState.errors.subject;
                      if (!err) return null;
                      return t(String(err.message));
                    })()}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('communications.message')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('communications.message_placeholder')} className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage>
                    {(() => {
                      const err = form.formState.errors.message;
                      if (!err) return null;
                      return t(String(err.message));
                    })()}
                  </FormMessage>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('communications.send_message')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
