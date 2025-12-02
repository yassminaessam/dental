
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus, Search, Package, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';

// Inventory item from database
type InventoryItem = {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unitCost: number;
  expires?: string | null;
  status?: string;
  location?: string;
  supplierName?: string;
};

const medicationSchema = z.object({
  name: z.string().min(1, 'pharmacy.validation.medication_name_required'),
  category: z.string().optional(),
  form: z.string().optional(),
  strength: z.string().optional(),
  stock: z.coerce.number().min(0, 'pharmacy.validation.stock_non_negative'),
  unitPrice: z.coerce.number().min(0, 'pharmacy.validation.price_non_negative'),
  expiryDate: z.date().optional(),
  inventoryId: z.string().optional(), // Link to inventory item
});

type MedicationFormData = z.infer<typeof medicationSchema>;

interface AddMedicationDialogProps {
  onSave: (data: MedicationFormData) => void;
}

export function AddMedicationDialog({ onSave }: AddMedicationDialogProps) {
  const { t, isRTL } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  const [inventoryOpen, setInventoryOpen] = React.useState(false);
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = React.useState<InventoryItem | null>(null);
  
  const form = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      category: '',
      form: '',
      strength: '',
      stock: 0,
      unitPrice: 0,
    },
  });

  // Fetch inventory items when dialog opens
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      fetch('/api/inventory')
        .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
        .then(data => {
          const items = Array.isArray(data?.items) ? data.items : [];
          setInventoryItems(items);
        })
        .catch(err => {
          console.error('Failed to fetch inventory:', err);
          setInventoryItems([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  // Handle inventory item selection
  const handleSelectInventoryItem = (item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setInventoryOpen(false);
    
    // Auto-populate form fields from inventory item
    form.setValue('name', item.name);
    form.setValue('category', item.category || '');
    form.setValue('stock', item.quantity);
    form.setValue('unitPrice', item.unitCost);
    form.setValue('inventoryId', item.id);
    
    // Parse expiry date if available
    if (item.expires) {
      try {
        form.setValue('expiryDate', new Date(item.expires));
      } catch {
        // Invalid date, skip
      }
    }
  };

  // Clear selection and reset form
  const handleClearSelection = () => {
    setSelectedInventoryItem(null);
    form.reset({
      name: '',
      category: '',
      form: '',
      strength: '',
      stock: 0,
      unitPrice: 0,
      inventoryId: undefined,
    });
  };

  const onSubmit = (data: MedicationFormData) => {
    onSave(data);
    form.reset();
    setSelectedInventoryItem(null);
    setOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset();
      setSelectedInventoryItem(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
          {t('pharmacy.add_medication')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('pharmacy.add_new_medication')}</DialogTitle>
          <DialogDescription>
            {t('pharmacy.add_new_medication_desc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            {/* Inventory Item Selector */}
            <div className="space-y-2">
              <FormLabel>{t('pharmacy.select_from_inventory')}</FormLabel>
              <Popover open={inventoryOpen} onOpenChange={setInventoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={inventoryOpen}
                    className={cn(
                      "w-full justify-between",
                      !selectedInventoryItem && "text-muted-foreground"
                    )}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('common.loading')}...
                      </span>
                    ) : selectedInventoryItem ? (
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {selectedInventoryItem.name}
                        {selectedInventoryItem.category && (
                          <Badge variant="secondary" className="ml-2">{selectedInventoryItem.category}</Badge>
                        )}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        {t('pharmacy.search_inventory_items')}
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder={t('pharmacy.search_inventory_items')} />
                    <CommandList>
                      <CommandEmpty>{t('pharmacy.no_inventory_items_found')}</CommandEmpty>
                      <CommandGroup heading={t('inventory.items')}>
                        {inventoryItems.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={item.name}
                            onSelect={() => handleSelectInventoryItem(item)}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  selectedInventoryItem?.id === item.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.category && `${item.category} • `}
                                  {t('pharmacy.stock')}: {item.quantity} • {t('pharmacy.unit_price')}: {item.unitCost}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant={item.quantity <= 0 ? 'destructive' : item.quantity <= 10 ? 'secondary' : 'default'}
                              className="ml-2"
                            >
                              {item.quantity}
                            </Badge>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedInventoryItem && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-muted-foreground"
                >
                  {t('pharmacy.clear_selection_enter_manually')}
                </Button>
              )}
            </div>

            {/* Info banner when item selected */}
            {selectedInventoryItem && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <Package className={cn("inline h-4 w-4", isRTL ? "ml-1" : "mr-1")} />
                  {t('pharmacy.form_populated_from_inventory')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.medication_name')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('pharmacy.placeholder.medication_name')} {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.name?.message && t(String(form.formState.errors.name.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.category')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('pharmacy.placeholder.category')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="form"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.form')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('pharmacy.placeholder.form')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="strength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.strength')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('pharmacy.placeholder.strength')} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.stock_level')} *</FormLabel>
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
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('pharmacy.unit_price')} *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder={t('pharmacy.placeholder.unit_price')} {...field} />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.unitPrice?.message && t(String(form.formState.errors.unitPrice.message))}
                    </FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('pharmacy.expiry_date')}</FormLabel>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {field.value ? format(field.value, "PPP") : <span>{t('appointments.pick_date')}</span>}
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
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('pharmacy.save_medication')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
