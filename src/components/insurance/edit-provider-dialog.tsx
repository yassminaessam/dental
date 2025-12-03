
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
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '../ui/form';
import { Plus, Trash2 } from 'lucide-react';
import type { InsuranceProvider, ProcedurePricing } from '@/app/insurance/page';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const providerSchema = z.object({
  name: z.string().min(1, 'Provider name is required.'),
  phone: z.string().optional(),
  email: z.string().email({ message: "Invalid email." }).optional().or(z.literal('')),
  address: z.string().optional(),
  defaultCoveragePercentage: z.number().min(0).max(100).optional(),
  maxAnnualCoverage: z.number().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  notes: z.string().optional(),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface EditProviderDialogProps {
  onSave: (data: InsuranceProvider) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: InsuranceProvider;
}

export function EditProviderDialog({ onSave, open, onOpenChange, provider }: EditProviderDialogProps) {
  const { t, isRTL } = useLanguage();
  const [procedurePricing, setProcedurePricing] = React.useState<ProcedurePricing[]>([]);
  const [newProcedure, setNewProcedure] = React.useState<ProcedurePricing>({
    procedureCode: '',
    procedureName: '',
    coveragePercentage: 80,
    maxCoverage: undefined,
    patientCopay: undefined,
  });
  
  const form = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
  });

  React.useEffect(() => {
    if (provider) {
        form.reset({
            name: provider.name,
            phone: provider.phone,
            email: provider.email,
            address: provider.address,
            defaultCoveragePercentage: provider.defaultCoveragePercentage,
            maxAnnualCoverage: provider.maxAnnualCoverage,
            contractStartDate: provider.contractStartDate,
            contractEndDate: provider.contractEndDate,
            notes: provider.notes,
        });
        setProcedurePricing(provider.procedurePricing || []);
    }
  }, [provider, form]);

  const addProcedurePricing = () => {
    if (newProcedure.procedureCode && newProcedure.procedureName) {
      setProcedurePricing([...procedurePricing, newProcedure]);
      setNewProcedure({
        procedureCode: '',
        procedureName: '',
        coveragePercentage: 80,
        maxCoverage: undefined,
        patientCopay: undefined,
      });
    }
  };

  const removeProcedurePricing = (index: number) => {
    setProcedurePricing(procedurePricing.filter((_, i) => i !== index));
  };

  const onSubmit = (data: ProviderFormData) => {
    onSave({ ...provider, ...data, procedurePricing: procedurePricing.length > 0 ? procedurePricing : undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('insurance.edit_insurance_provider')}</DialogTitle>
          <DialogDescription>
            {t('insurance.update_provider_details', { name: provider.name })}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">{t('insurance.basic_info')}</TabsTrigger>
                <TabsTrigger value="coverage">{t('insurance.coverage_pricing')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('insurance.provider_name')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('insurance.placeholder.provider_name_example')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('insurance.phone')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('insurance.placeholder.phone_example')} {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('insurance.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('insurance.placeholder.email_example')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('insurance.address')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('insurance.placeholder.address_example')} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('insurance.contract_start_date')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contractEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('insurance.contract_end_date')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.notes')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('insurance.placeholder.notes')} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="coverage" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="defaultCoveragePercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('insurance.default_coverage_rate')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0} 
                            max={100} 
                            placeholder="80"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>{t('insurance.coverage_rate_desc')}</FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxAnnualCoverage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('insurance.max_annual_coverage')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={0} 
                            placeholder="50000"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>{t('insurance.max_annual_coverage_desc')}</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Procedure-specific pricing */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">{t('insurance.procedure_specific_pricing')}</h4>
                  
                  {/* Add new procedure */}
                  <div className="grid grid-cols-5 gap-2 items-end">
                    <div>
                      <label className="text-xs text-muted-foreground">{t('insurance.procedure_code')}</label>
                      <Input
                        placeholder="D1110"
                        value={newProcedure.procedureCode}
                        onChange={(e) => setNewProcedure({ ...newProcedure, procedureCode: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t('insurance.procedure')}</label>
                      <Input
                        placeholder={t('insurance.placeholder.procedure_example')}
                        value={newProcedure.procedureName}
                        onChange={(e) => setNewProcedure({ ...newProcedure, procedureName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t('insurance.coverage_percent')}</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="80"
                        value={newProcedure.coveragePercentage}
                        onChange={(e) => setNewProcedure({ ...newProcedure, coveragePercentage: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{t('insurance.max_coverage')}</label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="5000"
                        value={newProcedure.maxCoverage || ''}
                        onChange={(e) => setNewProcedure({ ...newProcedure, maxCoverage: e.target.value ? parseInt(e.target.value) : undefined })}
                      />
                    </div>
                    <Button type="button" onClick={addProcedurePricing} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* List of added procedures */}
                  {procedurePricing.length > 0 && (
                    <div className="space-y-2">
                      {procedurePricing.map((proc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex gap-4 text-sm">
                            <span className="font-mono">{proc.procedureCode}</span>
                            <span>{proc.procedureName}</span>
                            <span className="text-muted-foreground">{proc.coveragePercentage}%</span>
                            {proc.maxCoverage && <span className="text-muted-foreground">Max: {proc.maxCoverage} EGP</span>}
                          </div>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeProcedurePricing(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">{t('common.save_changes')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
