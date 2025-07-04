
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare as MessageSquareIcon } from 'lucide-react';
import { dentalChartPatients } from '@/lib/data';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface NewMessageDialogProps {
  triggerButtonText?: string;
  dialogTitle?: string;
  dialogDescription?: string;
}

export function NewMessageDialog({ 
  triggerButtonText = "New Message",
  dialogTitle = "Create New Message",
  dialogDescription = "Compose and send a new message to a patient."
}: NewMessageDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <MessageSquareIcon className="mr-2 h-4 w-4" />
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient</Label>
            <Select>
              <SelectTrigger id="patient">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {dentalChartPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup defaultValue="email" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="r-email" />
                <Label htmlFor="r-email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="r-sms" />
                <Label htmlFor="r-sms">SMS</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="e.g., Your Appointment Reminder" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Type your message here." className="min-h-[120px]" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Send Message</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
