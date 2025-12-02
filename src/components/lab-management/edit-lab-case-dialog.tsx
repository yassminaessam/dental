'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Loader2, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import type { Lab, LabCase, LabCaseStatus, LabCasePriority } from '@/services/lab-management';

const labCaseSchema = z.object({
  caseType: z.string().min(1, 'Case type is required'),
  toothNumbers: z.string().optional(),
  shade: z.string().optional(),
  material: z.string().optional(),
  labId: z.string().optional(),
  labName: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  status: z.enum(['Draft', 'Submitted', 'InProgress', 'QualityCheck', 'Completed', 'Delivered', 'Cancelled']),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']),
  dueDate: z.date().optional().nullable(),
  estimatedCost: z.coerce.number().optional(),
  actualCost: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type LabCaseFormValues = z.infer<typeof labCaseSchema>;

interface EditLabCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labCase: LabCase;
  onSave: (data: LabCaseFormValues) => void;
  labs: Lab[];
}

const caseTypes = [
  'Crown',
  'Bridge',
  'Denture',
  'Partial Denture',
  'Implant Crown',
  'Implant Bridge',
  'Veneer',
  'Inlay',
  'Onlay',
  'Night Guard',
  'Retainer',
  'Orthodontic Appliance',
  'Surgical Guide',
  'Other',
];

const materials = [
  'Zirconia',
  'E-Max',
  'PFM (Porcelain Fused to Metal)',
  'Full Metal',
  'Acrylic',
  'Composite',
  'Titanium',
  'Chrome Cobalt',
  'Gold',
  'PEEK',
  'Other',
];

export function EditLabCaseDialog({ open, onOpenChange, labCase, onSave, labs }: EditLabCaseDialogProps) {
  const { t, isRTL } = useLanguage();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<LabCaseFormValues>({
    resolver: zodResolver(labCaseSchema),
    defaultValues: {
      caseType: labCase.caseType,
      toothNumbers: labCase.toothNumbers || '',
      shade: labCase.shade || '',
      material: labCase.material || '',
      labId: labCase.labId || '',
      labName: labCase.labName || '',
      description: labCase.description || '',
      instructions: labCase.instructions || '',
      status: labCase.status,
      priority: labCase.priority,
      dueDate: labCase.dueDate ? new Date(labCase.dueDate) : null,
      estimatedCost: labCase.estimatedCost,
      actualCost: labCase.actualCost,
      notes: labCase.notes || '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        caseType: labCase.caseType,
        toothNumbers: labCase.toothNumbers || '',
        shade: labCase.shade || '',
        material: labCase.material || '',
        labId: labCase.labId || '',
        labName: labCase.labName || '',
        description: labCase.description || '',
        instructions: labCase.instructions || '',
        status: labCase.status,
        priority: labCase.priority,
        dueDate: labCase.dueDate ? new Date(labCase.dueDate) : null,
        estimatedCost: labCase.estimatedCost,
        actualCost: labCase.actualCost,
        notes: labCase.notes || '',
      });
    }
  }, [open, labCase, form]);

  const handleLabChange = (labId: string) => {
    const lab = labs.find(l => l.id === labId);
    if (lab) {
      form.setValue('labId', lab.id);
      form.setValue('labName', lab.name);
    }
  };

  const onSubmit = async (data: LabCaseFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('lab.edit_case')} - {labCase.caseNumber}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Patient & Doctor Info (read-only) */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-muted-foreground">{t('lab.patient')}:</span>
                <p className="font-medium">{labCase.patientName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">{t('lab.doctor')}:</span>
                <p className="font-medium">{labCase.doctorName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Case Type */}
              <FormField
                control={form.control}
                name="caseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.case_type')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('lab.select_case_type')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {caseTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Lab Selection */}
              <FormField
                control={form.control}
                name="labId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.lab')}</FormLabel>
                    <Select onValueChange={handleLabChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('lab.select_lab')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {labs.filter(l => l.isActive).map((lab) => (
                          <SelectItem key={lab.id} value={lab.id}>
                            {lab.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.status')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft">{t('lab.status.draft')}</SelectItem>
                        <SelectItem value="Submitted">{t('lab.status.submitted')}</SelectItem>
                        <SelectItem value="InProgress">{t('lab.status.in_progress')}</SelectItem>
                        <SelectItem value="QualityCheck">{t('lab.status.quality_check')}</SelectItem>
                        <SelectItem value="Completed">{t('lab.status.completed')}</SelectItem>
                        <SelectItem value="Delivered">{t('lab.status.delivered')}</SelectItem>
                        <SelectItem value="Cancelled">{t('lab.status.cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.priority')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">{t('lab.priority.low')}</SelectItem>
                        <SelectItem value="Normal">{t('lab.priority.normal')}</SelectItem>
                        <SelectItem value="High">{t('lab.priority.high')}</SelectItem>
                        <SelectItem value="Urgent">{t('lab.priority.urgent')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tooth Numbers */}
              <FormField
                control={form.control}
                name="toothNumbers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.tooth_numbers')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('lab.tooth_numbers_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shade */}
              <FormField
                control={form.control}
                name="shade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.shade')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('lab.shade_placeholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Material */}
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.material')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('lab.select_material')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materials.map((mat) => (
                          <SelectItem key={mat} value={mat}>
                            {mat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.due_date')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{t('lab.select_due_date')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Cost */}
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.estimated_cost')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Actual Cost */}
              <FormField
                control={form.control}
                name="actualCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('lab.actual_cost')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lab.description')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('lab.description_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lab.instructions')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('lab.instructions_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lab.notes')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('lab.notes_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? 'ml-2' : 'mr-2')} />}
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
