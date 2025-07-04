
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { medicationCategories } from '@/lib/data';

export function AddMedicationDialog() {
  const [date, setDate] = React.useState<Date>();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Medication</DialogTitle>
          <DialogDescription>
            Add a new medication to the pharmacy inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="med-name">Medication Name *</Label>
              <Input id="med-name" placeholder="e.g., Amoxicillin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-category">Category</Label>
              <Select>
                <SelectTrigger id="med-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {medicationCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="med-form">Form</Label>
              <Input id="med-form" placeholder="e.g., Tablet" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-strength">Strength</Label>
              <Input id="med-strength" placeholder="e.g., 500mg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="med-stock">Stock Level *</Label>
              <Input id="med-stock" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-price">Unit Price *</Label>
              <Input id="med-price" type="number" placeholder="$0.00" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="med-expiry">Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="med-expiry"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save Medication</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
