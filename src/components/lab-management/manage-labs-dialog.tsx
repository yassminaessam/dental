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
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Loader2, Plus, Pencil, Trash2, Building2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Lab } from '@/services/lab-management';

const labSchema = z.object({
  name: z.string().min(1, 'Lab name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  contactName: z.string().optional(),
  specialty: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  notes: z.string().optional(),
});

type LabFormValues = z.infer<typeof labSchema>;

interface ManageLabsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labs: Lab[];
  onLabsChange: () => void;
}

export function ManageLabsDialog({ open, onOpenChange, labs, onLabsChange }: ManageLabsDialogProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [isAddingLab, setIsAddingLab] = React.useState(false);
  const [editingLab, setEditingLab] = React.useState<Lab | null>(null);
  const [labToDelete, setLabToDelete] = React.useState<Lab | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Normalize phone numbers for search
  const normalizePhone = (phone?: string | null) => phone ? phone.replace(/\D/g, '') : '';

  // Filter labs by search term
  const filteredLabs = React.useMemo(() => {
    const lower = searchTerm.toLowerCase().trim();
    const digits = searchTerm.replace(/\D/g, '');
    if (!lower && !digits) return labs;
    return labs.filter((lab) => {
      const matchesName = lab.name.toLowerCase().includes(lower);
      const matchesContact = (lab.contactName || '').toLowerCase().includes(lower);
      const matchesPhone = digits 
        ? normalizePhone(lab.phone).includes(digits)
        : (lab.phone || '').toLowerCase().includes(lower);
      const matchesEmail = (lab.email || '').toLowerCase().includes(lower);
      const matchesSpecialty = (lab.specialty || '').toLowerCase().includes(lower);
      return matchesName || matchesContact || matchesPhone || matchesEmail || matchesSpecialty;
    });
  }, [labs, searchTerm]);

  const form = useForm<LabFormValues>({
    resolver: zodResolver(labSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      contactName: '',
      specialty: '',
      rating: undefined,
      notes: '',
    },
  });

  React.useEffect(() => {
    if (editingLab) {
      form.reset({
        name: editingLab.name,
        address: editingLab.address || '',
        phone: editingLab.phone || '',
        email: editingLab.email || '',
        contactName: editingLab.contactName || '',
        specialty: editingLab.specialty || '',
        rating: editingLab.rating,
        notes: editingLab.notes || '',
      });
    } else {
      form.reset({
        name: '',
        address: '',
        phone: '',
        email: '',
        contactName: '',
        specialty: '',
        rating: undefined,
        notes: '',
      });
    }
  }, [editingLab, form]);

  const handleCreateLab = async (data: LabFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/lab/labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create lab');
      toast({
        title: t('lab.toast.lab_created'),
        description: t('lab.toast.lab_created_desc'),
      });
      form.reset();
      setIsAddingLab(false);
      onLabsChange();
    } catch (error) {
      console.error('Create lab error:', error);
      toast({ title: t('lab.toast.error_creating'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLab = async (data: LabFormValues) => {
    if (!editingLab) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/lab/labs/${editingLab.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update lab');
      toast({
        title: t('lab.toast.lab_updated'),
        description: t('lab.toast.lab_updated_desc'),
      });
      setEditingLab(null);
      onLabsChange();
    } catch (error) {
      console.error('Update lab error:', error);
      toast({ title: t('lab.toast.error_updating'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLab = async () => {
    if (!labToDelete) return;
    try {
      const response = await fetch(`/api/lab/labs/${labToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete lab');
      toast({
        title: t('lab.toast.lab_deleted'),
        description: t('lab.toast.lab_deleted_desc'),
        variant: 'destructive',
      });
      setLabToDelete(null);
      onLabsChange();
    } catch (error) {
      console.error('Delete lab error:', error);
      toast({ title: t('lab.toast.error_deleting'), variant: 'destructive' });
    }
  };

  const handleToggleActive = async (lab: Lab) => {
    try {
      const response = await fetch(`/api/lab/labs/${lab.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !lab.isActive }),
      });
      if (!response.ok) throw new Error('Failed to update lab');
      onLabsChange();
    } catch (error) {
      console.error('Toggle active error:', error);
      toast({ title: t('lab.toast.error_updating'), variant: 'destructive' });
    }
  };

  const onSubmit = (data: LabFormValues) => {
    if (editingLab) {
      handleUpdateLab(data);
    } else {
      handleCreateLab(data);
    }
  };

  const renderForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lab.lab_name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('lab.lab_name_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lab.contact_name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('lab.contact_name_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lab.phone')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('lab.phone_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lab.email')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('lab.email_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lab.specialty')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('lab.specialty_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('lab.rating')}</FormLabel>
                <FormControl>
                  <Input type="number" min="0" max="5" step="0.1" placeholder="0-5" {...field} />
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
              <FormLabel>{t('lab.address')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('lab.address_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsAddingLab(false);
              setEditingLab(null);
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? 'ml-2' : 'mr-2')} />}
            {editingLab ? t('common.save') : t('common.add')}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('lab.manage_labs')}
            </DialogTitle>
          </DialogHeader>

          {isAddingLab || editingLab ? (
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-4">
                {editingLab ? t('lab.edit_lab') : t('lab.add_lab')}
              </h4>
              {renderForm()}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('lab.search_labs')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button onClick={() => setIsAddingLab(true)}>
                  <Plus className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('lab.add_lab')}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('lab.lab_name')}</TableHead>
                    <TableHead>{t('lab.contact_name')}</TableHead>
                    <TableHead>{t('lab.phone')}</TableHead>
                    <TableHead>{t('lab.specialty')}</TableHead>
                    <TableHead>{t('lab.active')}</TableHead>
                    <TableHead className="text-right">{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLabs.length > 0 ? (
                    filteredLabs.map((lab) => (
                      <TableRow key={lab.id}>
                        <TableCell className="font-medium">{lab.name}</TableCell>
                        <TableCell>{lab.contactName || '-'}</TableCell>
                        <TableCell dir="ltr">{lab.phone || '-'}</TableCell>
                        <TableCell>{lab.specialty || '-'}</TableCell>
                        <TableCell>
                          <Switch
                            checked={lab.isActive}
                            onCheckedChange={() => handleToggleActive(lab)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingLab(lab)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLabToDelete(lab)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {searchTerm ? t('common.no_results') : t('lab.no_labs_found')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!labToDelete} onOpenChange={(open) => !open && setLabToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('lab.confirm_delete_lab')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLab}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
