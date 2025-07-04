
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { suppliersData } from '@/lib/data';
import { Input } from '../ui/input';

export function NewPurchaseOrderDialog() {
  const [orderDate, setOrderDate] = React.useState<Date>(new Date());
  const [deliveryDate, setDeliveryDate] = React.useState<Date>();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ShoppingCart className="mr-2 h-4 w-4" />
          New Purchase Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order for a supplier.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliersData.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-date">Order Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="order-date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(orderDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={orderDate}
                    onSelect={(d) => d && setOrderDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Order Items</h3>
            <div className="rounded-lg border p-2">
                <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6"><Label>Item Description</Label></div>
                    <div className="col-span-2"><Label>Qty</Label></div>
                    <div className="col-span-3"><Label>Unit Price</Label></div>
                    <div className="col-span-1"></div>
                </div>
                 <div className="grid grid-cols-12 gap-2 items-center mt-2">
                    <div className="col-span-6"><Input placeholder="Item description" /></div>
                    <div className="col-span-2"><Input type="number" placeholder="1" /></div>
                    <div className="col-span-3"><Input type="number" placeholder="$0.00" /></div>
                    <div className="col-span-1">
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Add any special instructions or notes for the supplier." />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Create Purchase Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
