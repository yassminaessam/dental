
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { getCollection } from '@/services/firestore';
import { Patient } from '@/app/patients/page';
import type { Transaction } from '@/app/financial/page';

const transactionSchema = z.object({
  date: z.date({ required_error: 'Date is required' }),
  amount: z.string().min(1, 'Amount is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string({ required_error: 'Category is required' }),
  paymentMethod: z.string({ required_error: 'Payment method is required' }),
  type: z.enum(['Revenue', 'Expense'], { required_error: 'Type is required' }),
  patient: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const transactionCategories = ['Patient Payment', 'Insurance Payment', 'Supplies', 'Salary', 'Rent', 'Utilities', 'Marketing', 'Other'];
const paymentMethods = ['Credit Card', 'Cash', 'Vodafone Cash', 'Fawry', 'Bank Transfer'];

interface EditTransactionDialogProps {
  transaction: Transaction;
  onSave: (data: Transaction) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({ transaction, onSave, open, onOpenChange }: EditTransactionDialogProps) {
  const [dateOpen, setDateOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });
  
  React.useEffect(() => {
    async function fetchPatients() {
        if(open) {
            const patientData = await getCollection<any>('patients');
            setPatients(patientData.map((p: any) => ({...p, dob: new Date(p.dob)})));
        }
    }
    fetchPatients();
  }, [open]);

  React.useEffect(() => {
    if (transaction) {
      const transactionDate = new Date(transaction.date);
      const patientId = patients.find(p => p.name === transaction.patient)?.id || '';
      form.reset({
        date: isValid(transactionDate) ? transactionDate : new Date(),
        amount: transaction.amount.replace(/[^0-9.-]+/g, ''),
        description: transaction.description,
        category: transaction.category,
        paymentMethod: transaction.paymentMethod,
        type: transaction.type,
        patient: patientId,
      });
    }
  }, [transaction, form, patients]);


  const onSubmit = (data: TransactionFormData) => {
    const patientName = patients.find(p => p.id === data.patient)?.name;
    const updatedTransaction: Transaction = {
      ...transaction,
      date: new Date(data.date),
      description: data.description,
      type: data.type,
      category: data.category,
      paymentMethod: data.paymentMethod,
      patient: patientName,
      amount: `EGP ${parseFloat(data.amount as string).toFixed(2)}`,
    };
    onSave(updatedTransaction);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the details for transaction {transaction.id}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date *</FormLabel>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
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
                          if(date) field.onChange(date)
                          setDateOpen(false)
                        }} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="EGP 0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Patient payment for cleaning" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="patient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {transactionCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Payment Method *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a method" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                                {method}
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
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Type *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4 items-center pt-2"
                            >
                            <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                <RadioGroupItem value="Revenue" id="r-revenue" />
                                </FormControl>
                                <FormLabel htmlFor="r-revenue">Revenue</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                <RadioGroupItem value="Expense" id="r-expense" />
                                </FormControl>
                                <FormLabel htmlFor="r-expense">Expense</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
