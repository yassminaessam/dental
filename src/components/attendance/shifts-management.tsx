'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Clock,
  Play,
  Square,
  Users,
  DollarSign,
  ArrowRightLeft,
  MoreHorizontal,
  Plus,
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  Banknote,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface Shift {
  id: string;
  staffId: string;
  staff: Staff;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  shiftType: string;
  openingCashAmount?: number;
  closingCashAmount?: number;
  expectedCashAmount?: number;
  cashDiscrepancy?: number;
  totalTransactions?: number;
  totalRevenue?: number;
  totalAppointments?: number;
  notes?: string;
}

interface ShiftsManagementProps {
  staff: Staff[];
  currentStaffId?: string;
  onShiftChange?: () => void;
}

const shiftStatusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

export function ShiftsManagement({ staff, currentStaffId, onShiftChange }: ShiftsManagementProps) {
  const { t, language, isRTL } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [activeShift, setActiveShift] = React.useState<Shift | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = React.useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = React.useState(false);
  const [selectedShift, setSelectedShift] = React.useState<Shift | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    staffId: '',
    scheduledStart: '',
    scheduledEnd: '',
    shiftType: 'Regular',
    openingCashAmount: '',
    closingCashAmount: '',
    cashDiscrepancyNotes: '',
    notes: '',
  });

  React.useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const [shiftsRes, activeRes] = await Promise.all([
        fetch('/api/shifts'),
        fetch('/api/shifts?action=active'),
      ]);

      if (shiftsRes.ok) {
        const data = await shiftsRes.json();
        setShifts(data.shifts || []);
      }

      if (activeRes.ok) {
        const data = await activeRes.json();
        if (data.shifts?.length > 0) {
          setActiveShift(data.shifts[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          staffId: formData.staffId,
          scheduledStart: formData.scheduledStart,
          scheduledEnd: formData.scheduledEnd,
          shiftType: formData.shiftType,
          notes: formData.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to create shift');

      toast({
        title: t('shifts.toast.created'),
        description: t('shifts.toast.created_desc'),
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchShifts();
      onShiftChange?.();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('shifts.toast.error_create'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartShift = async () => {
    if (!selectedShift) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          shiftId: selectedShift.id,
          openingCashAmount: parseFloat(formData.openingCashAmount) || 0,
          notes: formData.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to start shift');

      toast({
        title: t('shifts.toast.started'),
        description: t('shifts.toast.started_desc'),
      });

      setIsStartDialogOpen(false);
      resetForm();
      fetchShifts();
      onShiftChange?.();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('shifts.toast.error_start'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndShift = async () => {
    if (!selectedShift) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          shiftId: selectedShift.id,
          closingCashAmount: parseFloat(formData.closingCashAmount) || 0,
          cashDiscrepancyNotes: formData.cashDiscrepancyNotes,
          notes: formData.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to end shift');

      toast({
        title: t('shifts.toast.ended'),
        description: t('shifts.toast.ended_desc'),
      });

      setIsEndDialogOpen(false);
      resetForm();
      fetchShifts();
      onShiftChange?.();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('shifts.toast.error_end'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      staffId: '',
      scheduledStart: '',
      scheduledEnd: '',
      shiftType: 'Regular',
      openingCashAmount: '',
      closingCashAmount: '',
      cashDiscrepancyNotes: '',
      notes: '',
    });
    setSelectedShift(null);
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EGP',
    }).format(amount);
  };

  const receptionists = staff.filter(s => 
    s.role.toLowerCase().includes('reception') || 
    s.role.toLowerCase().includes('استقبال')
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('shifts.title')}
              </CardTitle>
              <CardDescription>{t('shifts.description')}</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t('shifts.schedule_shift')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Active Shift Summary */}
          {activeShift && (
            <div className="mb-6 p-4 rounded-lg border-2 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {t('shifts.active_shift')}
                  </span>
                </div>
                <Badge className={shiftStatusColors[activeShift.status]}>
                  {t(`shifts.status.${activeShift.status.toLowerCase()}`)}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('shifts.receptionist')}:</span>
                  <p className="font-medium">{activeShift.staff.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('shifts.started_at')}:</span>
                  <p className="font-medium">{formatTime(activeShift.actualStart)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('shifts.opening_cash')}:</span>
                  <p className="font-medium">{formatCurrency(activeShift.openingCashAmount)}</p>
                </div>
                <div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedShift(activeShift);
                      setIsEndDialogOpen(true);
                    }}
                  >
                    <Square className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('shifts.end_shift')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Shifts Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('shifts.receptionist')}</TableHead>
                <TableHead>{t('shifts.date')}</TableHead>
                <TableHead>{t('shifts.scheduled')}</TableHead>
                <TableHead>{t('shifts.actual')}</TableHead>
                <TableHead>{t('shifts.type')}</TableHead>
                <TableHead>{t('shifts.status')}</TableHead>
                <TableHead>{t('shifts.cash_summary')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t('shifts.no_shifts')}
                  </TableCell>
                </TableRow>
              ) : (
                shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell className="font-medium">{shift.staff.name}</TableCell>
                    <TableCell>{formatDate(shift.scheduledStart)}</TableCell>
                    <TableCell>
                      {formatTime(shift.scheduledStart)} - {formatTime(shift.scheduledEnd)}
                    </TableCell>
                    <TableCell>
                      {shift.actualStart ? (
                        <>
                          {formatTime(shift.actualStart)} - {shift.actualEnd ? formatTime(shift.actualEnd) : '...'}
                        </>
                      ) : (
                        <span className="text-muted-foreground">{t('shifts.not_started')}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{shift.shiftType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={shiftStatusColors[shift.status]}>
                        {t(`shifts.status.${shift.status.toLowerCase()}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {shift.status === 'Completed' && shift.closingCashAmount !== undefined ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">{t('shifts.closing')}:</span>
                            <span>{formatCurrency(shift.closingCashAmount)}</span>
                          </div>
                          {shift.cashDiscrepancy !== 0 && shift.cashDiscrepancy !== undefined && (
                            <div className={cn(
                              "flex items-center gap-1",
                              shift.cashDiscrepancy > 0 ? "text-green-600" : "text-red-600"
                            )}>
                              <AlertCircle className="h-3 w-3" />
                              <span>{formatCurrency(shift.cashDiscrepancy)}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isRTL ? "start" : "end"}>
                          {shift.status === 'Active' && !shift.actualStart && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedShift(shift);
                                setIsStartDialogOpen(true);
                              }}
                            >
                              <Play className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                              {t('shifts.start_shift')}
                            </DropdownMenuItem>
                          )}
                          {shift.status === 'Active' && shift.actualStart && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedShift(shift);
                                setIsEndDialogOpen(true);
                              }}
                            >
                              <Square className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                              {t('shifts.end_shift')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Banknote className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                            {t('shifts.view_transactions')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Shift Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('shifts.schedule_shift')}</DialogTitle>
            <DialogDescription>{t('shifts.schedule_shift_desc')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="staffId">{t('shifts.receptionist')}</Label>
              <Select
                value={formData.staffId}
                onValueChange={(value) => setFormData({ ...formData, staffId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('shifts.select_receptionist')} />
                </SelectTrigger>
                <SelectContent>
                  {receptionists.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="scheduledStart">{t('shifts.start_time')}</Label>
                <Input
                  id="scheduledStart"
                  type="datetime-local"
                  value={formData.scheduledStart}
                  onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scheduledEnd">{t('shifts.end_time')}</Label>
                <Input
                  id="scheduledEnd"
                  type="datetime-local"
                  value={formData.scheduledEnd}
                  onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shiftType">{t('shifts.type')}</Label>
              <Select
                value={formData.shiftType}
                onValueChange={(value) => setFormData({ ...formData, shiftType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular">{t('shifts.types.regular')}</SelectItem>
                  <SelectItem value="Morning">{t('shifts.types.morning')}</SelectItem>
                  <SelectItem value="Evening">{t('shifts.types.evening')}</SelectItem>
                  <SelectItem value="Night">{t('shifts.types.night')}</SelectItem>
                  <SelectItem value="Weekend">{t('shifts.types.weekend')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">{t('common.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('shifts.notes_placeholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateShift} disabled={submitting || !formData.staffId}>
              {submitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />}
              {t('shifts.schedule')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Shift Dialog */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('shifts.start_shift')}</DialogTitle>
            <DialogDescription>
              {selectedShift && t('shifts.start_shift_desc', { name: selectedShift.staff.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="openingCash">{t('shifts.opening_cash_amount')}</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="openingCash"
                  type="number"
                  step="0.01"
                  className="pl-9"
                  value={formData.openingCashAmount}
                  onChange={(e) => setFormData({ ...formData, openingCashAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startNotes">{t('common.notes')}</Label>
              <Textarea
                id="startNotes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('shifts.start_notes_placeholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleStartShift} disabled={submitting}>
              {submitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />}
              <Play className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t('shifts.start')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Shift Dialog */}
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('shifts.end_shift')}</DialogTitle>
            <DialogDescription>
              {selectedShift && t('shifts.end_shift_desc', { name: selectedShift.staff.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedShift && (
              <div className="p-3 rounded-lg bg-muted">
                <div className="text-sm text-muted-foreground mb-1">{t('shifts.opening_cash')}:</div>
                <div className="font-semibold">{formatCurrency(selectedShift.openingCashAmount)}</div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="closingCash">{t('shifts.closing_cash_amount')}</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="closingCash"
                  type="number"
                  step="0.01"
                  className="pl-9"
                  value={formData.closingCashAmount}
                  onChange={(e) => setFormData({ ...formData, closingCashAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            {selectedShift && formData.closingCashAmount && (
              <div className={cn(
                "p-3 rounded-lg",
                parseFloat(formData.closingCashAmount) === selectedShift.openingCashAmount
                  ? "bg-green-50 dark:bg-green-900/20"
                  : "bg-amber-50 dark:bg-amber-900/20"
              )}>
                <div className="text-sm font-medium">
                  {t('shifts.discrepancy')}:{' '}
                  <span className={cn(
                    parseFloat(formData.closingCashAmount) >= (selectedShift.openingCashAmount || 0)
                      ? "text-green-600"
                      : "text-red-600"
                  )}>
                    {formatCurrency(parseFloat(formData.closingCashAmount) - (selectedShift.openingCashAmount || 0))}
                  </span>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="discrepancyNotes">{t('shifts.discrepancy_notes')}</Label>
              <Textarea
                id="discrepancyNotes"
                value={formData.cashDiscrepancyNotes}
                onChange={(e) => setFormData({ ...formData, cashDiscrepancyNotes: e.target.value })}
                placeholder={t('shifts.discrepancy_notes_placeholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEndDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleEndShift} disabled={submitting}>
              {submitting && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />}
              <Square className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t('shifts.end')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
