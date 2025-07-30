
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
import { dentalChartPatients } from '@/lib/data';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';

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
}

export function NewInvoiceDialog({ onSave }: NewInvoiceDialogProps) {
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
    const patientDetails = dentalChartPatients.find(p => p.id === data.patient);
    const totalAmount = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    onSave({
        ...data,
        patient: patientDetails?.name || 'Unknown Patient',
        patientId: patientDetails?.id || 'N/A',
        issueDate: format(data.issueDate, "MMM d, yyyy"),
        dueDate: format(data.dueDate, "MMM d, yyyy"),
        totalAmount,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            Fill out the details to create a new invoice for a patient.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dentalChartPatients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
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
                    <FormLabel>Issue Date *</FormLabel>
                    <Popover><PopoverTrigger asChild>
                      <FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button></FormControl>
                    </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Due Date *</FormLabel>
                    <Popover><PopoverTrigger asChild>
                      <FormControl><Button variant="outline" className={cn(!field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button></FormControl>
                    </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormLabel>Line Items *</FormLabel>
              <div className="mt-2 space-y-2 rounded-lg border p-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2">
                    <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                      <FormItem className="col-span-6"><FormControl><Input placeholder="Service or product description" {...field} /></FormControl><FormMessage/></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                      <FormItem className="col-span-2"><FormControl><Input type="number" placeholder="Qty" {...field} /></FormControl><FormMessage/></FormItem>
                    )}/>
                    <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => (
                      <FormItem className="col-span-3"><FormControl><Input type="number" placeholder="Unit Price" {...field} /></FormControl><FormMessage/></FormItem>
                    )}/>
                    <Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ id: `${fields.length + 1}`, description: '', quantity: 1, unitPrice: 0 })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
                <FormMessage>{form.formState.errors.items?.message}</FormMessage>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Create Invoice</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
