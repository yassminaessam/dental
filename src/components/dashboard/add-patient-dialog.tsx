
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { emergencyContactRelationships } from '@/lib/data';

export function AddPatientDialog() {
  const [date, setDate] = React.useState<Date>();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter patient details to create a new record
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name *</Label>
              <Input id="first-name" placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name *</Label>
              <Input id="last-name" placeholder="Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" type="tel" placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dob"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>mm/dd/yyyy</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1930}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="123 Main St, Anytown, USA" />
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Emergency Contact</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ec-name">Name</Label>
                <Input id="ec-name" placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec-phone">Phone</Label>
                <Input id="ec-phone" type="tel" placeholder="(555) 987-6543" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ec-relationship">Relationship</Label>
                <Select>
                  <SelectTrigger id="ec-relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {emergencyContactRelationships.map((rel) => (
                      <SelectItem key={rel} value={rel.toLowerCase()}>
                        {rel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Insurance Information</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="insurance-provider">Insurance Provider</Label>
                    <Input id="insurance-provider" placeholder="DentalCare Plus" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="policy-number">Policy Number</Label>
                    <Input id="policy-number" placeholder="DCP123456789" />
                </div>
            </div>
          </div>
          
           <div>
            <h3 className="mb-4 text-lg font-medium">Medical History</h3>
            <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add medical condition
            </Button>
          </div>

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save Patient</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
