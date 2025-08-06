
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import type { Patient } from '@/app/patients/page';

const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1, "Qty must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
});

const invoiceSchema = z.object({
  patient: z.string({ required_error: 'Patient is required.' }),
  issueDate: z.date({ required_error: 'Issue date is required.' }),
  dueDate: z.date({ required_error: 'Due date is required.' }),
  items: z.array(lineItemSchema).min(1, "At least one item is required."),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface NewInvoiceDialogProps {
  onSave: (data: any) => void;
  patients: Patient[];
}

export function NewInvoiceDialog({ onSave, patients }: NewInvoiceDialogProps) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      items: [{ id: '1', description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (data: InvoiceFormData) => {
    const patientDetails = patients.find(p => p.id === data.patient);
    const totalAmount = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    onSave({
        patient: patientDetails?.name || 'Unknown Patient',
        patientId: patientDetails?.id || 'N/A',
        issueDate: format(data.issueDate, "MMM d, yyyy"),
        dueDate: format(data.dueDate, "MMM d, yyyy"),
        totalAmount,
        items: data.items,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-9 sm:h-10">
          <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">Invoice</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] w-[95vw] sm:w-full flex flex-col">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="text-lg sm:text-xl">Create New Invoice</DialogTitle>
          <DialogDescription className="text-sm">
            Fill out the details to create a new invoice for a patient.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-4 sm:space-y-6 overflow-y-auto px-1">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
              <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Patient *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 sm:h-10">
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Issue Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 sm:h-10 justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Due Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-9 sm:h-10 justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <FormLabel className="text-sm font-medium">Line Items *</FormLabel>
              <div className="space-y-3 sm:space-y-4 rounded-lg border p-3 sm:p-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-12">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-6">
                          <FormLabel className="sr-only sm:not-sr-only text-xs">Description</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Service or product description"
                              className="h-9 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel className="sr-only sm:not-sr-only text-xs">Qty</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Qty"
                              className="h-9 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem className="sm:col-span-3">
                          <FormLabel className="sr-only sm:not-sr-only text-xs">Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Unit Price"
                              className="h-9 text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="sm:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-9"
                  onClick={() => append({ 
                    id: `${fields.length + 1}`, 
                    description: '', 
                    quantity: 1, 
                    unitPrice: 0 
                  })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
                <FormMessage>{form.formState.errors.items?.message}</FormMessage>
              </div>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-4 sm:pt-6">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full sm:w-auto order-2 sm:order-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Create Invoice
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
