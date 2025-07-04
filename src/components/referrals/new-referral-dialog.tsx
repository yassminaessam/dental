
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { dentalChartPatients, specialistNetwork, referralUrgency } from '@/lib/data';

export function NewReferralDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          New Referral
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New Referral</DialogTitle>
          <DialogDescription>
            Fill out the form to refer a patient to a specialist.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select>
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select patient" />
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
              <Label htmlFor="specialist">Specialist *</Label>
              <Select>
                <SelectTrigger id="specialist">
                  <SelectValue placeholder="Select specialist" />
                </SelectTrigger>
                <SelectContent>
                  {specialistNetwork.map((specialist) => (
                    <SelectItem key={specialist.id} value={specialist.id}>
                      {specialist.name} ({specialist.specialty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Referral *</Label>
            <Textarea 
              id="reason" 
              placeholder="Provide a detailed reason for the referral."
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency *</Label>
            <Select>
              <SelectTrigger id="urgency">
                <SelectValue placeholder="Select urgency level" />
              </SelectTrigger>
              <SelectContent>
                {referralUrgency.map((urgency) => (
                  <SelectItem key={urgency} value={urgency.toLowerCase()}>
                    <span className="capitalize">{urgency}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Send Referral</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
