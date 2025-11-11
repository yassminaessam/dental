'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Shield, Globe, Moon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PatientSettingsPage() {
  const { t } = useLanguage();
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
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">{t('patient_pages.settings.sms_notifications')}</Label>
                    <p className="text-sm text-gray-600">{t('patient_pages.settings.sms_desc')}</p>
                  </div>
                  <Switch id="sms-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="appointment-reminders">{t('patient_pages.settings.appointment_reminders')}</Label>
                    <p className="text-sm text-gray-600">{t('patient_pages.settings.reminders_desc')}</p>
                  </div>
                  <Switch id="appointment-reminders" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="promotional-emails">{t('patient_pages.settings.promotional_emails')}</Label>
                    <p className="text-sm text-gray-600">{t('patient_pages.settings.promotional_desc')}</p>
                  </div>
                  <Switch id="promotional-emails" />
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
                  <select id="language" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2">
                    <option value="en">{t('patient_pages.settings.english')}</option>
                    <option value="ar">{t('patient_pages.settings.arabic')}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timezone">{t('patient_pages.settings.timezone')}</Label>
                  <select id="timezone" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2">
                    <option>{t('patient_pages.settings.egypt_time')}</option>
                    <option>{t('patient_pages.settings.utc')}</option>
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
                  <Switch id="dark-mode" />
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
                    <Label htmlFor="share-data">{t('patient_pages.settings.share_data')}</Label>
                    <p className="text-sm text-gray-600">{t('patient_pages.settings.share_desc')}</p>
                  </div>
                  <Switch id="share-data" defaultChecked />
                </div>
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
              <Button>{t('patient_pages.settings.save_all')}</Button>
            </div>
          </div>
        </div>
      </PatientLayout>
    </PatientOnly>
  );
}
