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
import { Loader2, ClipboardList } from 'lucide-react';

interface ManualAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Array<{ id: string; name: string; role: string }>;
  onSuccess: () => void;
}

const statusOptions = [
  'Present',
  'Absent',
  'Late',
  'HalfDay',
  'OnLeave',
  'Holiday',
  'Weekend',
] as const;

export function ManualAttendanceDialog({ open, onOpenChange, staff, onSuccess }: ManualAttendanceDialogProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    status: '' as typeof statusOptions[number] | '',
    clockIn: '',
    clockOut: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.staffId || !formData.date || !formData.status) {
      toast({
        title: t('common.error'),
        description: t('attendance.fill_required_fields'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // First, mark attendance with status
      let response;
      
      if (formData.status === 'Absent') {
        response = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'markAbsent',
            staffId: formData.staffId,
            date: formData.date,
            notes: formData.notes,
          }),
        });
      } else {
        // For other statuses, create/update the record
        const dateOnly = new Date(formData.date);
        dateOnly.setHours(0, 0, 0, 0);

        const clockInTime = formData.clockIn 
          ? new Date(`${formData.date}T${formData.clockIn}:00`).toISOString()
          : undefined;
        
        const clockOutTime = formData.clockOut 
          ? new Date(`${formData.date}T${formData.clockOut}:00`).toISOString()
          : undefined;

        // First try to get existing record
        const checkResponse = await fetch(
          `/api/attendance?staffId=${formData.staffId}&startDate=${formData.date}&endDate=${formData.date}`
        );
        const existingData = await checkResponse.json();
        
        if (existingData.records && existingData.records.length > 0) {
          // Update existing record
          response = await fetch('/api/attendance', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: existingData.records[0].id,
              status: formData.status,
              clockIn: clockInTime,
              clockOut: clockOutTime,
              notes: formData.notes,
            }),
          });
        } else {
          // Clock in first, then update
          response = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'clockIn',
              staffId: formData.staffId,
            }),
          });
          
          if (response.ok) {
            const { record } = await response.json();
            // Update with correct times and status
            response = await fetch('/api/attendance', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: record.id,
                status: formData.status,
                clockIn: clockInTime,
                clockOut: clockOutTime,
                notes: formData.notes,
              }),
            });
          }
        }
      }

      if (response && !response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save attendance');
      }

      toast({
        title: t('attendance.toast.attendance_saved'),
        description: t('attendance.toast.attendance_saved_desc'),
      });

      // Reset form
      setFormData({
        staffId: '',
        date: new Date().toISOString().split('T')[0],
        status: '',
        clockIn: '',
        clockOut: '',
        notes: '',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('attendance.toast.error_saving'),
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
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {t('attendance.manual_entry')}
          </DialogTitle>
          <DialogDescription>{t('attendance.manual_entry_desc')}</DialogDescription>
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

          {/* Date */}
          <div className="space-y-2">
            <Label>{t('attendance.date')} *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>{t('attendance.status')} *</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: typeof statusOptions[number]) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('attendance.select_status')} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`attendance.status.${status.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Fields - Only show for certain statuses */}
          {formData.status && !['Absent', 'OnLeave', 'Holiday', 'Weekend'].includes(formData.status) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('attendance.clock_in')}</Label>
                <Input
                  type="time"
                  value={formData.clockIn}
                  onChange={(e) => setFormData(prev => ({ ...prev, clockIn: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('attendance.clock_out')}</Label>
                <Input
                  type="time"
                  value={formData.clockOut}
                  onChange={(e) => setFormData(prev => ({ ...prev, clockOut: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>{t('attendance.notes')}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={t('attendance.notes_placeholder')}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
