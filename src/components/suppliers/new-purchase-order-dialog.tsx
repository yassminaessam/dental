
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import type { InventoryItem } from '../../app/inventory/page';
import type { Supplier } from '../../app/suppliers/page';
import { useLanguage } from '@/contexts/LanguageContext';

const orderItemSchema = z.object({
  itemId: z.string().min(1, 'suppliers.validation.item_required'),
  quantity: z.coerce.number().min(1, 'suppliers.validation.quantity_min'),
  unitPrice: z.coerce.number().min(0, 'suppliers.validation.price_positive'),
});

const purchaseOrderSchema = z.object({
  supplier: z.string({ required_error: 'suppliers.validation.supplier_required' }),
  orderDate: z.date({ required_error: 'suppliers.validation.order_date_required' }),
  deliveryDate: z.date().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'suppliers.validation.at_least_one_item'),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface NewPurchaseOrderDialogProps {
  onSave: (data: unknown) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSupplierId?: string;
  inventoryItems: InventoryItem[];
  suppliers: Supplier[];
  onAddItem: () => void;
}

export function NewPurchaseOrderDialog({ onSave, open, onOpenChange, initialSupplierId, inventoryItems, suppliers, onAddItem }: NewPurchaseOrderDialogProps) {
  const { t, isRTL } = useLanguage();
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
          <DialogTitle>{t('suppliers.new_purchase_order')}</DialogTitle>
          <DialogDescription>
            {t('suppliers.create_purchase_order_description')}
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
                    <FormLabel>{t('suppliers.supplier')} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('suppliers.select_supplier')} />
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
                    <FormMessage>
                      {form.formState.errors.supplier?.message && t(String(form.formState.errors.supplier.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('suppliers.order_date')} *</FormLabel>
                    <Popover open={orderDateOpen} onOpenChange={setOrderDateOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            <CalendarIcon className={isRTL ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
                            {field.value ? format(field.value, "PPP") : <span>{t('appointments.pick_a_date')}</span>}
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
                    <FormMessage>
                      {form.formState.errors.orderDate?.message && t(String(form.formState.errors.orderDate.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">{t('suppliers.order_items')} *</h3>
                <Button type="button" size="sm" variant="outline" onClick={onAddItem}>
                    <Plus className={isRTL ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} /> {t('inventory.add_item')}
                </Button>
              </div>
              <div className="rounded-lg border p-2 space-y-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6"><Label>{t('inventory.item')}</Label></div>
                      <div className="col-span-2"><Label>{t('suppliers.quantity')}</Label></div>
                      <div className="col-span-3"><Label>{t('suppliers.unit_price')}</Label></div>
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
                                            <SelectValue placeholder={t('inventory.select_item')} />
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
                                    <FormMessage>
                                      {form.formState.errors.items?.[index]?.itemId?.message && t(String(form.formState.errors.items?.[index]?.itemId?.message))}
                                    </FormMessage>
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
                                    <FormMessage>
                                      {form.formState.errors.items?.[index]?.quantity?.message && t(String(form.formState.errors.items?.[index]?.quantity?.message))}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                                <FormItem className="col-span-3">
                                    <FormControl>
                                        <Input type="number" placeholder={t('inventory.unit_cost_placeholder')} {...field} />
                                    </FormControl>
                                    <FormMessage>
                                      {form.formState.errors.items?.[index]?.unitPrice?.message && t(String(form.formState.errors.items?.[index]?.unitPrice?.message))}
                                    </FormMessage>
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
                      <Plus className={isRTL ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} /> {t('inventory.add_item')}
                  </Button>
                  <Controller
                    control={form.control}
                    name="items"
                    render={({ fieldState }) => (
                      <>
                        {fieldState.error ? (
                          <p className="text-sm font-medium text-destructive">{t(String(fieldState.error.message))}</p>
                        ) : null}
                      </>
                    )}
                  />
              </div>
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('common.notes')}</FormLabel>
                   <FormControl>
                    <Textarea id="notes" placeholder={t('suppliers.po_notes_placeholder')} {...field} />
                   </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
                <Button type="submit">{t('suppliers.create_purchase_order')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
