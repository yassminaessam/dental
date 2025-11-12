'use client';

import React, { useEffect, useState } from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Shield, Globe, Moon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PatientSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  promotionalEmails: boolean;
  language: string;
  timezone: string;
  darkMode: boolean;
  twoFactorEnabled: boolean;
}

export default function PatientSettingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [settings, setSettings] = useState<PatientSettings>({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    promotionalEmails: false,
    language: 'en',
    timezone: 'Africa/Cairo',
    darkMode: false,
    twoFactorEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSettings();
    }
  }, [user?.id]);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/patient/settings?userId=${user?.id}`);
      const data = await response.json();
      
      if (response.ok && data.settings) {
        setSettings({
          emailNotifications: data.settings.emailNotifications,
          smsNotifications: data.settings.smsNotifications,
          appointmentReminders: data.settings.appointmentReminders,
          promotionalEmails: data.settings.promotionalEmails,
          language: data.settings.language,
          timezone: data.settings.timezone,
          darkMode: data.settings.darkMode,
          twoFactorEnabled: data.settings.twoFactorEnabled,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/patient/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...settings }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Settings saved successfully');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof PatientSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <PatientOnly>
      <PatientLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('patient_pages.settings.title')}</h1>
            <p className="text-gray-600">{t('patient_pages.settings.subtitle')}</p>
          </div>

          <div className="space-y-6 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  {t('patient_pages.settings.notifications')}
                </CardTitle>
                <CardDescription>{t('patient_pages.settings.notifications_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">{t('patient_pages.settings.email_notifications')}</Label>
                    <p className="text-sm text-gray-600">{t('patient_pages.settings.email_desc')}</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">{t('patient_pages.settings.sms_notifications')}</Label>
                    <p className="text-sm text-gray-600">{t('patient_pages.settings.sms_desc')}</p>
                  </div>
                  <Switch 
                    id="sms-notifications" 
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="appointment-reminders">{t('patient_pages.settings.appointment_reminders')}</Label>
                    <p className="text-sm text-gray-600">{t('patient_pages.settings.reminders_desc')}</p>
                  </div>
                  <Switch 
                    id="appointment-reminders" 
                    checked={settings.appointmentReminders}
                    onCheckedChange={(checked) => updateSetting('appointmentReminders', checked)}
                    disabled={isLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="promotional-emails">{t('patient_pages.settings.promotional_emails')}</Label>
                    <p className="text-sm text-gray-600">{t('patient_pages.settings.promotional_desc')}</p>
                  </div>
                  <Switch 
                    id="promotional-emails" 
                    checked={settings.promotionalEmails}
                    onCheckedChange={(checked) => updateSetting('promotionalEmails', checked)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  {t('patient_pages.settings.language_region')}
                </CardTitle>
                <CardDescription>{t('patient_pages.settings.language_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">{t('patient_pages.settings.language')}</Label>
                  <select 
                    id="language" 
                    aria-label={t('patient_pages.settings.language')} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="en">{t('patient_pages.settings.english')}</option>
                    <option value="ar">{t('patient_pages.settings.arabic')}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timezone">{t('patient_pages.settings.timezone')}</Label>
                  <select 
                    id="timezone" 
                    aria-label={t('patient_pages.settings.timezone')} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="Africa/Cairo">{t('patient_pages.settings.egypt_time')}</option>
                    <option value="UTC">{t('patient_pages.settings.utc')}</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Moon className="h-5 w-5 mr-2" />
                  {t('patient_pages.settings.appearance')}
                </CardTitle>
                <CardDescription>{t('patient_pages.settings.appearance_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">{t('patient_pages.settings.dark_mode')}</Label>
                    <p className="text-sm text-gray-600">{t('patient_pages.settings.dark_mode_desc')}</p>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  {t('patient_pages.settings.privacy_security')}
                </CardTitle>
                <CardDescription>{t('patient_pages.settings.privacy_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">{t('patient_pages.settings.two_factor')}</Label>
                    <p className="text-sm text-gray-600">{t('patient_pages.settings.two_factor_desc')}</p>
                  </div>
                  <Button variant="outline" size="sm">{t('patient_pages.settings.enable')}</Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving || isLoading}>
                {isSaving ? 'Saving...' : t('patient_pages.settings.save_all')}
              </Button>
            </div>
          </div>
        </div>
      </PatientLayout>
    </PatientOnly>
  );
}
