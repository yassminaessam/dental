'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Loader2, Calendar } from 'lucide-react';

interface LeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Array<{ id: string; name: string; role: string }>;
  onSuccess: () => void;
}

const leaveTypes = [
  'Annual',
  'Sick',
  'Personal',
  'Unpaid',
  'Maternity',
  'Paternity',
  'Emergency',
  'Other',
] as const;

export function LeaveRequestDialog({ open, onOpenChange, staff, onSuccess }: LeaveRequestDialogProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    staffId: '',
    leaveType: '' as typeof leaveTypes[number] | '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const calculateDays = React.useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 0;
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.staffId || !formData.leaveType || !formData.startDate || !formData.endDate) {
      toast({
        title: t('common.error'),
        description: t('attendance.fill_required_fields'),
        variant: 'destructive',
      });
      return;
    }

    if (calculateDays <= 0) {
      toast({
        title: t('common.error'),
        description: t('attendance.invalid_date_range'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/attendance/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: formData.staffId,
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalDays: calculateDays,
          reason: formData.reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      toast({
        title: t('attendance.toast.leave_submitted'),
        description: t('attendance.toast.leave_submitted_desc'),
      });

      // Reset form
      setFormData({
        staffId: '',
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('attendance.toast.error_submit'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('attendance.request_leave')}</DialogTitle>
          <DialogDescription>{t('attendance.request_leave_desc')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Staff Selection */}
          <div className="space-y-2">
            <Label>{t('attendance.employee')} *</Label>
            <Select 
              value={formData.staffId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, staffId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('attendance.select_employee_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} - {s.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Leave Type */}
          <div className="space-y-2">
            <Label>{t('attendance.leave_type')} *</Label>
            <Select 
              value={formData.leaveType} 
              onValueChange={(value: typeof leaveTypes[number]) => setFormData(prev => ({ ...prev, leaveType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('attendance.select_leave_type')} />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`attendance.leave_type.${type.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('attendance.start_date')} *</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('attendance.end_date')} *</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Total Days */}
          {calculateDays > 0 && (
            <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('attendance.total_days')}</span>
              <span className="font-semibold">
                {calculateDays} {calculateDays === 1 ? t('attendance.day') : t('attendance.days')}
              </span>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label>{t('attendance.reason')}</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder={t('attendance.reason_placeholder')}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('attendance.submit_request')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
