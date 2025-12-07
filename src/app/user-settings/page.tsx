'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Shield, Globe, Moon, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface UserSettings {
  emailNotifications: boolean;
  appointmentReminders: boolean;
  systemAlerts: boolean;
  language: string;
  timezone: string;
  darkMode: boolean;
  twoFactorEnabled: boolean;
}

export default function UserSettingsPage() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    appointmentReminders: true,
    systemAlerts: true,
    language: language,
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
      const response = await fetch(`/api/user/settings?userId=${user?.id}`);
      const data = await response.json();
      
      if (response.ok && data.settings) {
        setSettings({
          emailNotifications: data.settings.emailNotifications ?? true,
          appointmentReminders: data.settings.appointmentReminders ?? true,
          systemAlerts: data.settings.systemAlerts ?? true,
          language: data.settings.language || language,
          timezone: data.settings.timezone || 'Africa/Cairo',
          darkMode: data.settings.darkMode ?? false,
          twoFactorEnabled: data.settings.twoFactorEnabled ?? false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Use defaults if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.id) {
      toast({
        title: t('common.error'),
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...settings }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Apply language change if it was modified
        if (settings.language !== language) {
          setLanguage(settings.language as 'en' | 'ar');
        }
        
        toast({
          title: t('user_settings.saved'),
          description: t('user_settings.saved_desc'),
        });
      } else {
        toast({
          title: t('common.error'),
          description: data.error || t('user_settings.save_error'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: t('common.error'),
        description: t('user_settings.save_error'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!user) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'doctor', 'receptionist']}>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'doctor', 'receptionist']}>
      <DashboardLayout>
        <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Decorative Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-pink-200/10 dark:from-blue-900/15 dark:via-purple-900/10 dark:to-pink-900/5 rounded-full blur-3xl animate-pulse"></div>
          </div>

          {/* Header */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('user_settings.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('user_settings.subtitle')}</p>
          </div>

          <div className="space-y-6 max-w-4xl">
            {/* Notifications */}
            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  {t('user_settings.notifications')}
                </CardTitle>
                <CardDescription>{t('user_settings.notifications_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">{t('user_settings.email_notifications')}</Label>
                    <p className="text-sm text-muted-foreground">{t('user_settings.email_notifications_desc')}</p>
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
                    <Label htmlFor="appointment-reminders">{t('user_settings.appointment_reminders')}</Label>
                    <p className="text-sm text-muted-foreground">{t('user_settings.appointment_reminders_desc')}</p>
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
                    <Label htmlFor="system-alerts">{t('user_settings.system_alerts')}</Label>
                    <p className="text-sm text-muted-foreground">{t('user_settings.system_alerts_desc')}</p>
                  </div>
                  <Switch 
                    id="system-alerts" 
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) => updateSetting('systemAlerts', checked)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Language & Region */}
            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  {t('user_settings.language_region')}
                </CardTitle>
                <CardDescription>{t('user_settings.language_region_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language">{t('user_settings.language')}</Label>
                  <select 
                    id="language" 
                    aria-label={t('user_settings.language')} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="en">{t('user_settings.english')}</option>
                    <option value="ar">{t('user_settings.arabic')}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timezone">{t('user_settings.timezone')}</Label>
                  <select 
                    id="timezone" 
                    aria-label={t('user_settings.timezone')} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="Africa/Cairo">{t('user_settings.egypt_time')}</option>
                    <option value="UTC">{t('user_settings.utc')}</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Moon className="h-5 w-5 mr-2" />
                  {t('user_settings.appearance')}
                </CardTitle>
                <CardDescription>{t('user_settings.appearance_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">{t('user_settings.dark_mode')}</Label>
                    <p className="text-sm text-muted-foreground">{t('user_settings.dark_mode_desc')}</p>
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

            {/* Security */}
            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  {t('user_settings.security')}
                </CardTitle>
                <CardDescription>{t('user_settings.security_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">{t('user_settings.two_factor')}</Label>
                    <p className="text-sm text-muted-foreground">{t('user_settings.two_factor_desc')}</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    {t('user_settings.coming_soon')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving || isLoading}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('common.saving')}
                  </>
                ) : (
                  t('user_settings.save_all')
                )}
              </Button>
            </div>
          </div>
        </main>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
