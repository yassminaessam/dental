
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
  DialogTrigger,
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
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Supplier } from '@/app/suppliers/page';
import { listDocuments } from '@/lib/data-client';
import { useLanguage } from '@/contexts/LanguageContext';

const itemSchema = z.object({
  name: z.string().min(1, 'inventory.validation.item_name_required'),
  category: z.string().optional(),
  supplier: z.string().optional(),
  stock: z.coerce.number().min(0, 'inventory.validation.stock_non_negative'),
  unitCost: z.coerce.number().min(0, 'inventory.validation.unit_cost_non_negative'),
  location: z.string().optional(),
  expires: z.date().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface AddItemDialogProps {
  onSave: (data: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showTrigger?: boolean;
}

export function AddItemDialog({ onSave, open, onOpenChange, showTrigger = true }: AddItemDialogProps) {
  const { t, language } = useLanguage();
  const [dateOpen, setDateOpen] = React.useState(false);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      category: '',
      supplier: '',
      stock: 0,
      unitCost: 0,
      location: '',
      expires: undefined,
    }
  });

  React.useEffect(() => {
    async function fetchSuppliers() {
  const data = await listDocuments<Supplier>('suppliers');
      setSuppliers(data);
    }
    if (open) {
      fetchSuppliers();
    }
  }, [open]);

  const onSubmit = (data: ItemFormData) => {
    const supplierId = data.supplier || undefined;
    const supplierName = supplierId ? suppliers.find(s => s.id === supplierId)?.name : undefined;
    onSave({
      name: data.name,
      category: data.category,
      supplier: supplierName ?? '',
      supplierName: supplierName ?? '',
      supplierId,
      stock: data.stock,
      unitCost: data.unitCost,
      location: data.location,
      expires: data.expires,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
       {showTrigger && (
      <DialogTrigger asChild>
        <Button>
        <Plus className="mr-2 h-4 w-4" />
        {t('inventory.add_item')}
        </Button>
      </DialogTrigger>
       )}
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{t('inventory.add_item')}</DialogTitle>
          <DialogDescription>
            {t('inventory.enter_item_details')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('inventory.item_name')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('inventory.item_name_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.name?.message && t(String(form.formState.errors.name.message))}
                  </FormMessage>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inventory.category')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('inventory.category_placeholder')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inventory.supplier')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('suppliers.select_supplier')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((sup) => (
                          <SelectItem key={sup.id} value={sup.id}>
                            {sup.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inventory.initial_stock')} *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.stock?.message && t(String(form.formState.errors.stock.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inventory.unit_cost')} *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder={t('inventory.unit_cost_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.unitCost?.message && t(String(form.formState.errors.unitCost.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('inventory.location')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('inventory.location_placeholder')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="expires"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('inventory.expiry_date')}</FormLabel>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>{t('appointments.pick_a_date')}</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={(date) => {
                        field.onChange(date)
                        setDateOpen(false)
                      }} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('inventory.save_item')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
