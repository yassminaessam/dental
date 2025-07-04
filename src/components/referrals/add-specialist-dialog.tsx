
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
import { UserPlus } from 'lucide-react';
import { specialistTypes } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function AddSpecialistDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Specialist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Specialist</DialogTitle>
          <DialogDescription>
            Add a new specialist to your referral network.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="specialist-name">Specialist Name *</Label>
            <Input id="specialist-name" placeholder="e.g., Dr. Robert Chen" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty *</Label>
            <Select>
                <SelectTrigger id="specialty">
                    <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                    {specialistTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                            {type}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" type="tel" placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="specialist@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clinic-name">Clinic/Practice Name</Label>
            <Input id="clinic-name" placeholder="e.g., City Oral Surgery" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save Specialist</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
