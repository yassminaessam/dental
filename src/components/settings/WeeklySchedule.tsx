'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, Trash2, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

type TimeSlot = {
  start: string;
  end: string;
};

type WeeklyScheduleData = {
  sunday?: TimeSlot[];
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
};

interface WeeklyScheduleProps {
  value: WeeklyScheduleData | null;
  onChange: (schedule: WeeklyScheduleData) => void;
}

const DAYS_OF_WEEK = [
  { key: 'sunday', labelEn: 'Sunday', labelAr: 'الأحد' },
  { key: 'monday', labelEn: 'Monday', labelAr: 'الإثنين' },
  { key: 'tuesday', labelEn: 'Tuesday', labelAr: 'الثلاثاء' },
  { key: 'wednesday', labelEn: 'Wednesday', labelAr: 'الأربعاء' },
  { key: 'thursday', labelEn: 'Thursday', labelAr: 'الخميس' },
  { key: 'friday', labelEn: 'Friday', labelAr: 'الجمعة' },
  { key: 'saturday', labelEn: 'Saturday', labelAr: 'السبت' },
];

export function WeeklySchedule({ value, onChange }: WeeklyScheduleProps) {
  const { t, language } = useLanguage();

  const schedule = value || {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  };

  const addTimeSlot = (day: string) => {
    const newSchedule = { ...schedule };
    const daySchedule = newSchedule[day as keyof WeeklyScheduleData] || [];
    const updatedDaySchedule = [...daySchedule, { start: '09:00', end: '17:00' }];
    onChange({ ...newSchedule, [day]: updatedDaySchedule });
  };

  const removeTimeSlot = (day: string, index: number) => {
    const newSchedule = { ...schedule };
    const daySchedule = newSchedule[day as keyof WeeklyScheduleData] || [];
    const updatedDaySchedule = daySchedule.filter((_, i) => i !== index);
    onChange({ ...newSchedule, [day]: updatedDaySchedule });
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    const newSchedule = { ...schedule };
    const daySchedule = [...(newSchedule[day as keyof WeeklyScheduleData] || [])];
    daySchedule[index] = { ...daySchedule[index], [field]: value };
    onChange({ ...newSchedule, [day]: daySchedule });
  };

  const copyToAllDays = (day: string) => {
    const daySchedule = schedule[day as keyof WeeklyScheduleData] || [];
    const newSchedule: WeeklyScheduleData = {};
    DAYS_OF_WEEK.forEach(d => {
      newSchedule[d.key as keyof WeeklyScheduleData] = JSON.parse(JSON.stringify(daySchedule));
    });
    onChange(newSchedule);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {t('settings.clinic.weekly_schedule_desc')}
        </p>
      </div>

      {DAYS_OF_WEEK.map((day) => {
        const daySchedule = schedule[day.key as keyof WeeklyScheduleData] || [];
        const hasSlots = daySchedule.length > 0;

        return (
          <Card key={day.key} className={cn(
            "p-4 border-2 transition-all duration-300",
            hasSlots ? "border-primary/30 bg-primary/5" : "border-muted"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-base">
                  {language === 'ar' ? day.labelAr : day.labelEn}
                </h4>
                {!hasSlots && (
                  <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted">
                    {t('settings.clinic.closed')}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {hasSlots && daySchedule.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToAllDays(day.key)}
                    className="text-xs"
                  >
                    {t('settings.clinic.copy_to_all')}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeSlot(day.key)}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  {t('settings.clinic.add_time_slot')}
                </Button>
              </div>
            </div>

            {daySchedule.length > 0 && (
              <div className="space-y-3">
                {daySchedule.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3 bg-background/50 p-3 rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs mb-1">{t('settings.clinic.start_time')}</Label>
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(day.key, index, 'start', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs mb-1">{t('settings.clinic.end_time')}</Label>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(day.key, index, 'end', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTimeSlot(day.key, index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
