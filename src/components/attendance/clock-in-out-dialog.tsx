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
import { Loader2, LogIn, LogOut, Coffee, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClockInOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Array<{ id: string; name: string; role: string }>;
  onSuccess: () => void;
}

export function ClockInOutDialog({ open, onOpenChange, staff, onSuccess }: ClockInOutDialogProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [selectedStaff, setSelectedStaff] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [currentRecord, setCurrentRecord] = React.useState<any>(null);
  const [location, setLocation] = React.useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [locationLoading, setLocationLoading] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string>('');

  // Fetch current location on dialog open
  React.useEffect(() => {
    if (open) {
      getCurrentLocation();
    }
  }, [open]);

  // Fetch current attendance record when staff selected
  React.useEffect(() => {
    if (selectedStaff) {
      fetchCurrentRecord();
    }
  }, [selectedStaff]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError(t('attendance.location_not_supported'));
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc: { latitude: number; longitude: number; address?: string } = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        // Try to get address from coordinates (reverse geocoding)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.latitude}&lon=${loc.longitude}`
          );
          if (response.ok) {
            const data = await response.json();
            loc.address = data.display_name;
          }
        } catch {
          // Address lookup failed, continue without it
        }
        
        setLocation(loc);
        setLocationLoading(false);
      },
      (error) => {
        setLocationError(t('attendance.location_error'));
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchCurrentRecord = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `/api/attendance?staffId=${selectedStaff}&startDate=${today}&endDate=${today}`
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentRecord(data.records?.[0] || null);
      }
    } catch (error) {
      console.error('Failed to fetch current record', error);
    }
  };

  const handleAction = async (action: 'clockIn' | 'clockOut' | 'startBreak' | 'endBreak') => {
    if (!selectedStaff) {
      toast({
        title: t('common.error'),
        description: t('attendance.select_staff_first'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          staffId: selectedStaff,
          location: location || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process');
      }

      const messages: Record<string, { title: string; desc: string }> = {
        clockIn: { title: 'attendance.toast.clocked_in', desc: 'attendance.toast.clocked_in_desc' },
        clockOut: { title: 'attendance.toast.clocked_out', desc: 'attendance.toast.clocked_out_desc' },
        startBreak: { title: 'attendance.toast.break_started', desc: 'attendance.toast.break_started_desc' },
        endBreak: { title: 'attendance.toast.break_ended', desc: 'attendance.toast.break_ended_desc' },
      };

      toast({
        title: t(messages[action].title),
        description: t(messages[action].desc),
      });

      setCurrentRecord(data.record);
      onSuccess();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('attendance.toast.error_action'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canClockIn = !currentRecord || !currentRecord.clockIn;
  const canClockOut = currentRecord?.clockIn && !currentRecord?.clockOut;
  const canStartBreak = currentRecord?.clockIn && !currentRecord?.clockOut && !currentRecord?.breakStart;
  const canEndBreak = currentRecord?.breakStart && !currentRecord?.breakEnd;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>{t('attendance.clock_in_out')}</DialogTitle>
          <DialogDescription>{t('attendance.clock_in_out_desc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Staff Selection */}
          <div className="space-y-2">
            <Label>{t('attendance.select_employee')}</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
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

          {/* Location Status */}
          <div className="space-y-2">
            <Label>{t('attendance.location')}</Label>
            <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
              {locationLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">{t('attendance.getting_location')}</span>
                </>
              ) : locationError ? (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-500">{locationError}</span>
                  <Button variant="link" size="sm" onClick={getCurrentLocation}>
                    {t('common.retry')}
                  </Button>
                </>
              ) : location ? (
                <>
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-sm truncate flex-1">
                    {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('attendance.no_location')}</span>
                </>
              )}
            </div>
          </div>

          {/* Current Status */}
          {selectedStaff && currentRecord && (
            <div className="space-y-2">
              <Label>{t('attendance.todays_status')}</Label>
              <div className="p-4 rounded-lg border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('attendance.status')}</span>
                  <Badge>{currentRecord.status}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('attendance.clock_in')}</span>
                  <span className="font-medium">{formatTime(currentRecord.clockIn)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('attendance.clock_out')}</span>
                  <span className="font-medium">{formatTime(currentRecord.clockOut)}</span>
                </div>
                {currentRecord.lateMinutes > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('attendance.late_by')}</span>
                    <span className="font-medium text-amber-500">+{currentRecord.lateMinutes} min</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleAction('clockIn')}
              disabled={!canClockIn || loading || !selectedStaff}
              className="h-20 flex flex-col gap-1"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <LogIn className="h-6 w-6" />
              )}
              <span>{t('attendance.clock_in')}</span>
            </Button>
            
            <Button
              onClick={() => handleAction('clockOut')}
              disabled={!canClockOut || loading}
              variant="secondary"
              className="h-20 flex flex-col gap-1"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <LogOut className="h-6 w-6" />
              )}
              <span>{t('attendance.clock_out')}</span>
            </Button>
            
            <Button
              onClick={() => handleAction('startBreak')}
              disabled={!canStartBreak || loading}
              variant="outline"
              className="h-20 flex flex-col gap-1"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Coffee className="h-6 w-6" />
              )}
              <span>{t('attendance.start_break')}</span>
            </Button>
            
            <Button
              onClick={() => handleAction('endBreak')}
              disabled={!canEndBreak || loading}
              variant="outline"
              className="h-20 flex flex-col gap-1"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Coffee className="h-6 w-6" />
              )}
              <span>{t('attendance.end_break')}</span>
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
