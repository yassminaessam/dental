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
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Loader2, MapPin, Clock, Calendar, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AttendanceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AttendanceSettings {
  workStartTime: string;
  workEndTime: string;
  lunchBreakMinutes: number;
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
  overtimeEnabled: boolean;
  overtimeThresholdHours: number;
  locationTrackingEnabled: boolean;
  clinicLatitude: number | null;
  clinicLongitude: number | null;
  allowedRadiusMeters: number;
  workDays: string;
}

const defaultSettings: AttendanceSettings = {
  workStartTime: '09:00',
  workEndTime: '17:00',
  lunchBreakMinutes: 60,
  lateGraceMinutes: 15,
  earlyLeaveGraceMinutes: 15,
  overtimeEnabled: true,
  overtimeThresholdHours: 8,
  locationTrackingEnabled: true,
  clinicLatitude: null,
  clinicLongitude: null,
  allowedRadiusMeters: 100,
  workDays: '1,2,3,4,5',
};

const weekDays = [
  { value: '0', label: 'sunday' },
  { value: '1', label: 'monday' },
  { value: '2', label: 'tuesday' },
  { value: '3', label: 'wednesday' },
  { value: '4', label: 'thursday' },
  { value: '5', label: 'friday' },
  { value: '6', label: 'saturday' },
];

export function AttendanceSettingsDialog({ open, onOpenChange }: AttendanceSettingsDialogProps) {
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState<AttendanceSettings>(defaultSettings);
  const [selectedDays, setSelectedDays] = React.useState<string[]>(['1', '2', '3', '4', '5']);

  // Fetch settings on open
  React.useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/attendance/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
          setSelectedDays(data.settings.workDays?.split(',') || ['1', '2', '3', '4', '5']);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/attendance/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          workDays: selectedDays.join(','),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast({
        title: t('attendance.toast.settings_saved'),
        description: t('attendance.toast.settings_saved_desc'),
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('attendance.toast.error_saving_settings'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: t('common.error'),
        description: t('attendance.location_not_supported'),
        variant: 'destructive',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSettings(prev => ({
          ...prev,
          clinicLatitude: position.coords.latitude,
          clinicLongitude: position.coords.longitude,
        }));
        toast({
          title: t('attendance.toast.location_set'),
          description: t('attendance.toast.location_set_desc'),
        });
      },
      (error) => {
        toast({
          title: t('common.error'),
          description: t('attendance.location_error'),
          variant: 'destructive',
        });
      },
      { enableHighAccuracy: true }
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t('attendance.settings')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('attendance.settings')}
          </DialogTitle>
          <DialogDescription>{t('attendance.settings_desc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Work Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{t('attendance.work_hours')}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('attendance.work_start_time')}</Label>
                <Input
                  type="time"
                  value={settings.workStartTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, workStartTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('attendance.work_end_time')}</Label>
                <Input
                  type="time"
                  value={settings.workEndTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, workEndTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('attendance.lunch_break')} ({t('attendance.minutes')})</Label>
                <Input
                  type="number"
                  value={settings.lunchBreakMinutes}
                  onChange={(e) => setSettings(prev => ({ ...prev, lunchBreakMinutes: parseInt(e.target.value) || 0 }))}
                  min={0}
                  max={120}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('attendance.late_grace')} ({t('attendance.minutes')})</Label>
                <Input
                  type="number"
                  value={settings.lateGraceMinutes}
                  onChange={(e) => setSettings(prev => ({ ...prev, lateGraceMinutes: parseInt(e.target.value) || 0 }))}
                  min={0}
                  max={60}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Work Days */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{t('attendance.work_days')}</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDay(day.value)}
                >
                  {t(`common.${day.label}`)}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Overtime */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{t('attendance.overtime')}</h3>
              </div>
              <Switch
                checked={settings.overtimeEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, overtimeEnabled: checked }))}
              />
            </div>
            
            {settings.overtimeEnabled && (
              <div className="space-y-2">
                <Label>{t('attendance.overtime_threshold')} ({t('attendance.hours')})</Label>
                <Input
                  type="number"
                  value={settings.overtimeThresholdHours}
                  onChange={(e) => setSettings(prev => ({ ...prev, overtimeThresholdHours: parseFloat(e.target.value) || 8 }))}
                  min={1}
                  max={12}
                  step={0.5}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Location Tracking */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{t('attendance.location_tracking')}</h3>
              </div>
              <Switch
                checked={settings.locationTrackingEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, locationTrackingEnabled: checked }))}
              />
            </div>
            
            {settings.locationTrackingEnabled && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation}>
                    <MapPin className="h-4 w-4 mr-2" />
                    {t('attendance.set_clinic_location')}
                  </Button>
                  {settings.clinicLatitude && settings.clinicLongitude && (
                    <span className="text-sm text-muted-foreground">
                      {settings.clinicLatitude.toFixed(6)}, {settings.clinicLongitude.toFixed(6)}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>{t('attendance.allowed_radius')} ({t('attendance.meters')})</Label>
                  <Input
                    type="number"
                    value={settings.allowedRadiusMeters}
                    onChange={(e) => setSettings(prev => ({ ...prev, allowedRadiusMeters: parseInt(e.target.value) || 100 }))}
                    min={10}
                    max={1000}
                    step={10}
                  />
                  <p className="text-xs text-muted-foreground">{t('attendance.allowed_radius_desc')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
