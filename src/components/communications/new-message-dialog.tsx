
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Phone } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare as MessageSquareIcon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Patient } from '@/app/patients/page';
import { useLanguage } from '@/contexts/LanguageContext';

const messageSchema = z.object({
  patient: z.string({ required_error: 'communications.select_patient' }),
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
  const [comboOpen, setComboOpen] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen || setInternalOpen;

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      patient: '',
      subject: '',
      message: '',
    }
  });

  React.useEffect(() => {
    async function fetchPatients() {
      // ✅ Fetch patients from Neon database
      const response = await fetch('/api/patients?activeOnly=true');
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
      });
    } else if (!isReply) {
      form.reset({
        patient: '',
        subject: '',
        message: '',
      });
    }
  }, [initialData, open, form, isReply, patients]);


  const patientId = form.watch('patient');
  const patientName = React.useMemo(() => {
    return patients.find(p => p.id === patientId)?.name || '';
  }, [patientId, patients]);

  const onSubmit = async (data: MessageFormData) => {
    const patientDetails = patients.find(p => p.id === data.patient);
    onSend({ 
      ...data, 
      patient: patientDetails?.name || 'Unknown Patient',
      patientEmail: patientDetails?.email || '',
      patientPhone: patientDetails?.phone || '',
      type: 'Email' 
    });
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="patient"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('communications.patient')}</FormLabel>
                  <Popover open={comboOpen} onOpenChange={setComboOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={isReply}
                          className={`w-full justify-between ${!field.value && 'text-muted-foreground'}`}
                        >
                          {field.value
                            ? (() => {
                                const selectedPatient = patients.find(p => p.id === field.value);
                                return selectedPatient ? (
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                                      {selectedPatient.name.charAt(0)}
                                    </div>
                                    <div className={`flex flex-col items-start ${isRTL ? 'text-right' : 'text-left'}`}>
                                      <span className="font-medium">{selectedPatient.name}</span>
                                      {selectedPatient.phone && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          {selectedPatient.phone}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : t('communications.select_patient');
                              })()
                            : t('communications.select_patient')}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder={t('communications.search_patient')} />
                        <CommandList>
                          <CommandEmpty>{t('communications.no_patient_found')}</CommandEmpty>
                          <CommandGroup>
                            {patients.map((patient) => (
                              <CommandItem
                                key={patient.id}
                                value={`${patient.name} ${patient.phone || ''}`}
                                onSelect={() => {
                                  form.setValue('patient', patient.id);
                                  setComboOpen(false);
                                }}
                                className="flex items-center gap-3 py-3"
                              >
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                  {patient.name.charAt(0)}
                                </div>
                                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                  <div className="font-medium">{patient.name}</div>
                                  {patient.phone && (
                                    <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <Phone className="h-3 w-3" />
                                      {patient.phone}
                                    </div>
                                  )}
                                </div>
                                <Check
                                  className={`h-4 w-4 ${field.value === patient.id ? 'opacity-100' : 'opacity-0'}`}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
