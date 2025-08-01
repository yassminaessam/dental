
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { InventoryItem } from '@/app/inventory/page';
import type { Supplier } from '@/app/suppliers/page';

const orderItemSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
});

const purchaseOrderSchema = z.object({
  supplier: z.string({ required_error: 'Supplier is required.' }),
  orderDate: z.date({ required_error: 'Order date is required.' }),
  deliveryDate: z.date().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required."),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface NewPurchaseOrderDialogProps {
  onSave: (data: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSupplierId?: string;
  inventoryItems: InventoryItem[];
  suppliers: Supplier[];
}

export function NewPurchaseOrderDialog({ onSave, open, onOpenChange, initialSupplierId, inventoryItems, suppliers }: NewPurchaseOrderDialogProps) {
  const [orderDateOpen, setOrderDateOpen] = React.useState(false);
  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier: initialSupplierId,
      orderDate: new Date(),
      items: [{ itemId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  React.useEffect(() => {
    form.reset({
      supplier: initialSupplierId,
      orderDate: new Date(),
      items: [{ itemId: '', quantity: 1, unitPrice: 0 }],
    });
  }, [initialSupplierId, form]);

  const onSubmit = (data: PurchaseOrderFormData) => {
    const supplierName = suppliers.find(s => s.id === data.supplier)?.name;
    const itemsWithDesc = data.items.map(item => ({
        ...item,
        description: inventoryItems.find(inv => inv.id === item.itemId)?.name || 'Unknown Item'
    }));

    onSave({ ...data, supplier: supplierName, items: itemsWithDesc });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order for a supplier.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
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
                name="orderDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Order Date *</FormLabel>
                    <Popover open={orderDateOpen} onOpenChange={setOrderDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={(date) => {
                          field.onChange(date)
                          setOrderDateOpen(false)
                        }} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Order Items *</h3>
              <div className="rounded-lg border p-2 space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6"><Label>Item Description</Label></div>
                      <div className="col-span-2"><Label>Qty</Label></div>
                      <div className="col-span-3"><Label>Unit Price</Label></div>
                      <div className="col-span-1"></div>
                  </div>
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
                        <FormField
                            control={form.control}
                            name={`items.${index}.itemId`}
                            render={({ field }) => (
                                <FormItem className="col-span-6">
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                            <SelectValue placeholder="Select item" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {inventoryItems.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name}
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormControl>
                                        <Input type="number" placeholder="1" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                                <FormItem className="col-span-3">
                                    <FormControl>
                                        <Input type="number" placeholder="EGP 0.00" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <div className="col-span-1">
                            <Button variant="ghost" size="icon" type="button" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => append({ itemId: '', quantity: 1, unitPrice: 0 })}
                  >
                      <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                  <Controller
                    control={form.control}
                    name="items"
                    render={({ fieldState }) => fieldState.error && <p className="text-sm font-medium text-destructive">{fieldState.error.message}</p>}
                  />
              </div>
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                   <FormControl>
                    <Textarea id="notes" placeholder="Add any special instructions or notes for the supplier." {...field} />
                   </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Create Purchase Order</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
