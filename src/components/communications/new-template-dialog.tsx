
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
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function NewTemplateDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Design a reusable message template for emails or SMS.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input id="template-name" placeholder="e.g., Appointment Confirmation" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup defaultValue="email" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="t-email" />
                <Label htmlFor="t-email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="t-sms" />
                <Label htmlFor="t-sms">SMS</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-subject">Subject</Label>
            <Input id="template-subject" placeholder="e.g., Your Appointment is Confirmed" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-body">Template Body</Label>
            <Textarea 
              id="template-body" 
              placeholder="Use placeholders like {{patient_name}} or {{appointment_date}}." 
              className="min-h-[120px]" 
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
