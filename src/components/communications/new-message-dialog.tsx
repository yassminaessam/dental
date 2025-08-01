
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
import { getCollection } from '@/services/firestore';

const messageSchema = z.object({
  patient: z.string({ required_error: 'Please select a patient.' }),
  type: z.enum(['Email', 'SMS'], { required_error: 'Please select a message type.' }),
  subject: z.string().min(1, 'Subject is required.'),
  message: z.string().min(1, 'Message is required.'),
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
  triggerButtonText = "New Message",
  dialogTitle = "Create New Message",
  dialogDescription = "Compose and send a new message to a patient.",
  onSend,
  isReply = false,
  initialData = null,
}: NewMessageDialogProps) {
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
        const data = await getCollection<Patient>('patients');
        setPatients(data);
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

  const dialogTitleText = isReply ? `Reply to ${initialData?.patientName}` : dialogTitle;
  const dialogDescriptionText = isReply ? `Replying to the message: "${initialData?.subject}"` : dialogDescription;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isReply && (
        <DialogTrigger asChild>
          <Button>
            <MessageSquareIcon className="mr-2 h-4 w-4" />
            {triggerButtonText}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[625px]">
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
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isReply}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
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
                        <FormLabel htmlFor="r-email">Email</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="SMS" id="r-sms" />
                        </FormControl>
                        <FormLabel htmlFor="r-sms">SMS</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Your Appointment Reminder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Type your message here." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Send Message</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
