
'use client';

import * as React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Building, Users, Bell, Shield, Database, Palette, Loader2 } from "lucide-react";
import { getCollection, setDocument } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, db } from '@/services/firestore';

type ClinicSettings = {
  id: string;
  clinicName: string;
  phoneNumber: string;
  email: string;
  website: string;
  address: string;
  businessHours: string;
  timezone: string;
  appointmentDuration: string;
  bookingLimit: string;
  allowOnlineBooking: boolean;
};

const initialSettings: ClinicSettings = {
  id: 'main',
  clinicName: '',
  phoneNumber: '',
  email: '',
  website: '',
  address: '',
  businessHours: 'mon-fri-8-6',
  timezone: 'eastern',
  appointmentDuration: '60',
  bookingLimit: '90',
  allowOnlineBooking: true
};

export default function SettingsPage() {
  const { t, isRTL } = useLanguage();
  const [settings, setSettings] = React.useState<ClinicSettings>(initialSettings);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, "clinic-settings", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const raw = (docSnap.data() as any) || {};
          const normalized: ClinicSettings = {
            ...initialSettings,
            ...raw,
            phoneNumber: raw.phoneNumber ?? raw.phone ?? initialSettings.phoneNumber,
            appointmentDuration: String(raw.appointmentDuration ?? initialSettings.appointmentDuration),
            bookingLimit: String(raw.bookingLimit ?? initialSettings.bookingLimit),
          };
          setSettings(normalized);
        } else {
          // Auto-create defaults then refetch so UI reflects persisted values
          await setDocument('clinic-settings', 'main', initialSettings);
          try {
            const again = await getDoc(docRef);
            if (again.exists()) {
              const raw = (again.data() as any) || {};
              const normalized: ClinicSettings = {
                ...initialSettings,
                ...raw,
                phoneNumber: raw.phoneNumber ?? raw.phone ?? initialSettings.phoneNumber,
                appointmentDuration: String(raw.appointmentDuration ?? initialSettings.appointmentDuration),
                bookingLimit: String(raw.bookingLimit ?? initialSettings.bookingLimit),
              };
              setSettings(normalized);
            } else {
              // Fallback: still not found; use local defaults
              setSettings(initialSettings);
            }
          } catch (refetchErr) {
            console.warn('Refetch after create failed:', refetchErr);
            setSettings(initialSettings);
          }
        }
  } catch (error) {
    console.warn('Failed to fetch settings:', error);
    toast({ title: t('settings.toast.error_fetching'), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [toast, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: string, value: string) => {
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    setSettings(prev => ({ ...prev, [id]: checked }));
  };

  const handleSaveChanges = async () => {
    try {
      await setDocument('clinic-settings', 'main', settings);
      toast({
        title: t('settings.toast.settings_saved'),
        description: t('settings.toast.settings_saved_desc'),
      });
    } catch (error) {
      toast({ title: t('settings.toast.error_saving'), variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">{t('settings.loading')}</p>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
  <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
          <Button onClick={handleSaveChanges}>{t('settings.save_changes')}</Button>
        </div>

        <Tabs defaultValue="clinic">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="clinic">{t('settings.tabs.clinic')}</TabsTrigger>
            <TabsTrigger value="users">{t('settings.tabs.users')}</TabsTrigger>
            <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
            <TabsTrigger value="security">{t('settings.tabs.security')}</TabsTrigger>
            <TabsTrigger value="backup">{t('settings.tabs.backup')}</TabsTrigger>
            <TabsTrigger value="appearance">{t('settings.tabs.appearance')}</TabsTrigger>
          </TabsList>

          <TabsContent value="clinic" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Building className="h-5 w-5" />
                    {t('settings.clinic.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="clinicName">{t('settings.clinic.name')}</Label>
                    <Input id="clinicName" value={settings.clinicName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">{t('settings.clinic.phone')}</Label>
                    <Input id="phoneNumber" value={settings.phoneNumber} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('settings.clinic.email')}</Label>
                    <Input id="email" type="email" value={settings.email} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="website">{t('settings.clinic.website')}</Label>
                    <Input id="website" value={settings.website} onChange={handleInputChange} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">{t('settings.clinic.address')}</Label>
                    <Input id="address" value={settings.address} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="businessHours">{t('settings.clinic.business_hours')}</Label>
                    <Select value={settings.businessHours} onValueChange={(value) => handleSelectChange('businessHours', value)}>
                      <SelectTrigger id="businessHours">
                        <SelectValue placeholder={t('settings.clinic.select_hours')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mon-fri-8-6">{t('settings.clinic.sun_thu_9_7')}</SelectItem>
                        <SelectItem value="mon-fri-9-5">{t('settings.clinic.sun_thu_10_6')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">{t('settings.clinic.timezone')}</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSelectChange('timezone', value)}>
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder={t('settings.clinic.select_timezone')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eastern">{t('settings.clinic.egypt_time')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.clinic.appointment_settings')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="appointmentDuration">{t('settings.clinic.default_duration')}</Label>
                    <Select value={settings.appointmentDuration} onValueChange={(value) => handleSelectChange('appointmentDuration', value)}>
                      <SelectTrigger id="appointmentDuration">
                        <SelectValue placeholder={t('settings.clinic.select_duration')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">{t('settings.clinic.30_minutes')}</SelectItem>
                        <SelectItem value="60">{t('settings.clinic.60_minutes')}</SelectItem>
                        <SelectItem value="90">{t('settings.clinic.90_minutes')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bookingLimit">{t('settings.clinic.advance_booking_limit')}</Label>
                    <Select value={settings.bookingLimit} onValueChange={(value) => handleSelectChange('bookingLimit', value)}>
                      <SelectTrigger id="bookingLimit">
                        <SelectValue placeholder={t('settings.clinic.select_limit')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">{t('settings.clinic.30_days')}</SelectItem>
                        <SelectItem value="60">{t('settings.clinic.60_days')}</SelectItem>
                        <SelectItem value="90">{t('settings.clinic.90_days')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-4 rounded-md border p-4 md:col-span-2">
                    <Switch id="allowOnlineBooking" checked={settings.allowOnlineBooking} onCheckedChange={(checked) => handleSwitchChange('allowOnlineBooking', checked)} />
                    <div className="flex flex-col">
                      <Label htmlFor="allowOnlineBooking">{t('settings.clinic.allow_online_booking')}</Label>
                      <span className="text-sm text-muted-foreground">{t('settings.clinic.online_booking_desc')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Users className="h-5 w-5" />
                    {t('settings.users.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                    <div className="flex flex-col">
                      <Label htmlFor="2fa-switch">
                        Require Two-Factor Authentication
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        All users must enable 2FA
                      </span>
                    </div>
                    <Switch id="2fa-switch" />
                  </div>
                  <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                    <div className="flex flex-col">
                      <Label htmlFor="autolock-switch">
                        Auto-lock Inactive Sessions
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        Lock sessions after 30 minutes of inactivity
                      </span>
                    </div>
                    <Switch id="autolock-switch" defaultChecked />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="session-timeout">Session Timeout</Label>
                      <Select defaultValue="30">
                        <SelectTrigger id="session-timeout">
                          <SelectValue placeholder="Select timeout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="password-policy">Password Policy</Label>
                      <Select defaultValue="strong">
                        <SelectTrigger id="password-policy">
                          <SelectValue placeholder="Select policy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">
                            Simple (8+ chars)
                          </SelectItem>
                          <SelectItem value="strong">
                            Strong (8+ chars, mixed case, numbers, symbols)
                          </SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Bell className="h-5 w-5" />
                  {t('settings.notifications.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label>Appointment Reminders</Label>
                    <span className="text-sm text-muted-foreground">
                      Send reminders to patients
                    </span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label>Payment Notifications</Label>
                    <span className="text-sm text-muted-foreground">
                      Notify when payments are received
                    </span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label>Staff Schedule Changes</Label>
                    <span className="text-sm text-muted-foreground">
                      Alert when staff schedules change
                    </span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label>System Maintenance</Label>
                    <span className="text-sm text-muted-foreground">
                      Notify about system updates
                    </span>
                  </div>
                  <Switch />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="reminder-timing">Reminder Timing</Label>
                    <Select defaultValue="24h">
                      <SelectTrigger id="reminder-timing">
                        <SelectValue placeholder="Select timing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour before</SelectItem>
                        <SelectItem value="24h">24 hours before</SelectItem>
                        <SelectItem value="48h">2 days before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notification-method">Notification Method</Label>
                    <Select defaultValue="both">
                      <SelectTrigger id="notification-method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email only</SelectItem>
                        <SelectItem value="sms">SMS only</SelectItem>
                        <SelectItem value="both">Both email and SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5" />
                  {t('settings.security.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label htmlFor="audit-logging">Enable Audit Logging</Label>
                    <span className="text-sm text-muted-foreground">
                      Track all system access and changes
                    </span>
                  </div>
                  <Switch id="audit-logging" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label htmlFor="encrypt-data">Encrypt Patient Data</Label>
                    <span className="text-sm text-muted-foreground">
                      Additional encryption for sensitive data
                    </span>
                  </div>
                  <Switch id="encrypt-data" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div className="flex flex-col">
                    <Label htmlFor="hipaa-mode">HIPAA Compliance Mode</Label>
                    <span className="text-sm text-muted-foreground">
                      Enable strict HIPAA compliance features
                    </span>
                  </div>
                  <Switch id="hipaa-mode" defaultChecked />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <Select defaultValue="7y">
                    <SelectTrigger id="data-retention" className="w-full md:w-1/2">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1y">1 year</SelectItem>
                      <SelectItem value="3y">3 years</SelectItem>
                      <SelectItem value="5y">5 years</SelectItem>
                      <SelectItem value="7y">7 years</SelectItem>
                      <SelectItem value="forever">Indefinitely</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="backup" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Database className="h-5 w-5" />
                  {t('settings.backup.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                  <div>
                    <Label htmlFor="automatic-backups">Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Daily automatic backups of all data
                    </p>
                  </div>
                  <Switch id="automatic-backups" defaultChecked />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="backup-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="backup-retention">Backup Retention</Label>
                    <Select defaultValue="30d">
                      <SelectTrigger id="backup-retention">
                        <SelectValue placeholder="Select retention" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="90d">90 days</SelectItem>
                        <SelectItem value="1y">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Manual Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Create an immediate backup of all data
                  </p>
                  <div className="mt-2">
                    <Button variant="outline">
                      <Database className="mr-2 h-4 w-4" />
                      Create Backup Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Palette className="h-5 w-5" />
                  {t('settings.appearance.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select defaultValue="light">
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="english">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4 md:col-span-2">
                  <div className="flex flex-col">
                    <Label htmlFor="compact-mode">Compact Mode</Label>
                    <span className="text-sm text-muted-foreground">
                      Use smaller spacing and elements
                    </span>
                  </div>
                  <Switch id="compact-mode" />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-md border p-4 md:col-span-2">
                  <div className="flex flex-col">
                    <Label htmlFor="show-animations">Show Animations</Label>
                    <span className="text-sm text-muted-foreground">
                      Enable UI animations and transitions
                    </span>
                  </div>
                  <Switch id="show-animations" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
