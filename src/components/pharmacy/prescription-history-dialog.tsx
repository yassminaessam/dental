'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Pill, 
  Loader2,
  User,
  Calendar,
  Stethoscope,
  ClipboardList,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEGP } from '@/lib/currency';
import { Button } from '@/components/ui/button';

type Prescription = {
  id: string;
  patientId?: string;
  patientName: string;
  doctorId?: string;
  doctorName: string;
  medicationName: string;
  medicationId?: string;
  strength?: string;
  dosage?: string;
  instructions?: string;
  duration?: string;
  refills: number;
  status: 'Active' | 'Completed';
  invoiceId?: string;
  treatmentId?: string;
  dispensedAt?: string;
  dispensedQuantity?: number;
  totalAmount?: number;
  createdAt?: string;
};

interface PrescriptionHistoryDialogProps {
  medicationId?: string;
  medicationName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrescriptionHistoryDialog({ 
  medicationId,
  medicationName,
  open, 
  onOpenChange 
}: PrescriptionHistoryDialogProps) {
  const { t, language, isRTL } = useLanguage();
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  // Smart search states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'Active' | 'Completed'>('all');

  React.useEffect(() => {
    if (open && (medicationId || medicationName)) {
      setLoading(true);
      // Reset filters when dialog opens
      setSearchQuery('');
      setStatusFilter('all');
      fetch('/api/pharmacy/prescriptions')
        .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
        .then(data => {
          const allPrescriptions: Prescription[] = Array.isArray(data?.prescriptions) ? data.prescriptions : [];
          // Filter prescriptions for this medication
          const filtered = allPrescriptions.filter(p => 
            p.medicationId === medicationId || 
            p.medicationName?.toLowerCase() === medicationName?.toLowerCase()
          );
          // Sort by date descending
          filtered.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setPrescriptions(filtered);
        })
        .catch(err => {
          console.error('Failed to fetch prescription history:', err);
          setPrescriptions([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open, medicationId, medicationName]);

  // Filter prescriptions based on search and status
  const filteredPrescriptions = React.useMemo(() => {
    let result = prescriptions;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.patientName?.toLowerCase().includes(query) ||
        p.doctorName?.toLowerCase().includes(query) ||
        p.dosage?.toLowerCase().includes(query) ||
        p.instructions?.toLowerCase().includes(query) ||
        p.duration?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [prescriptions, searchQuery, statusFilter]);

  const stats = React.useMemo(() => {
    const total = prescriptions.length;
    const active = prescriptions.filter(p => p.status === 'Active').length;
    const completed = prescriptions.filter(p => p.status === 'Completed').length;
    const totalDispensed = prescriptions.reduce((acc, p) => acc + (p.dispensedQuantity ?? 0), 0);
    const totalAmount = prescriptions.reduce((acc, p) => acc + (p.totalAmount ?? 0), 0);
    return { total, active, completed, totalDispensed, totalAmount };
  }, [prescriptions]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            {t('pharmacy.prescription_history')}
          </DialogTitle>
          {medicationName && (
            <DialogDescription className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              {t('pharmacy.history_for_medication')}: <strong>{medicationName}</strong>
            </DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="py-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium mb-1">{t('pharmacy.no_prescription_history')}</p>
            <p className="text-sm text-muted-foreground">
              {t('pharmacy.no_prescription_history_desc')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{t('pharmacy.total_prescriptions')}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.active}</p>
                <p className="text-xs text-muted-foreground">{t('common.active')}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">{t('common.completed')}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalDispensed}</p>
                <p className="text-xs text-muted-foreground">{t('pharmacy.total_dispensed')}</p>
              </div>
            </div>

            {/* Smart Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                  isRTL ? "right-3" : "left-3"
                )} />
                <Input
                  placeholder={t('pharmacy.search_prescriptions_placeholder') || 'Search by patient, doctor, dosage...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(isRTL ? "pr-10" : "pl-10")}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-6 w-6",
                      isRTL ? "left-2" : "right-2"
                    )}
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="Active">{t('common.active')}</SelectItem>
                    <SelectItem value="Completed">{t('common.completed')}</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    {t('common.clear')}
                  </Button>
                )}
              </div>
            </div>

            {/* Results count when filtered */}
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground">
                {t('common.showing')} {filteredPrescriptions.length} {t('common.of')} {prescriptions.length} {t('pharmacy.prescriptions')}
              </p>
            )}

            {/* Prescriptions Table */}
            <div className="overflow-auto flex-1 border rounded-lg">
              {filteredPrescriptions.length === 0 ? (
                <div className="py-8 text-center">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('common.no_results_found')}</p>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.patient')}</TableHead>
                    <TableHead>{t('common.doctor')}</TableHead>
                    <TableHead>{t('pharmacy.dosage')}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('pharmacy.dispensed')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{prescription.patientName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          <span>{prescription.doctorName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{prescription.dosage || t('common.na')}</p>
                          <p className="text-xs text-muted-foreground">{prescription.duration}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {prescription.createdAt 
                              ? new Date(prescription.createdAt).toLocaleDateString(language)
                              : t('common.na')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {prescription.dispensedQuantity ? (
                          <div>
                            <p className="font-medium">{prescription.dispensedQuantity} {t('common.units')}</p>
                            {prescription.totalAmount && (
                              <p className="text-xs text-muted-foreground">
                                {formatEGP(prescription.totalAmount, true, language)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={prescription.status === 'Active' ? 'default' : 'outline'}
                          className={cn(
                            prescription.status === 'Active' && 'bg-foreground text-background',
                            prescription.status === 'Completed' && 'bg-green-100 text-green-800 border-transparent'
                          )}
                        >
                          {prescription.status === 'Active' 
                            ? <Clock className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />
                            : <CheckCircle2 className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                          {prescription.status === 'Active' ? t('common.active') : t('common.completed')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
