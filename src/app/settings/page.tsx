
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Building, Users, Bell, Shield, Database, Palette, Loader2, Save, RotateCcw, Search, CheckCircle2, AlertCircle, Image as ImageIcon, Upload } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { getClientFtpProxyUrl } from '@/lib/ftp-proxy-url';
import { WeeklySchedule } from '@/components/settings/WeeklySchedule';

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

type ClinicSettings = {
  id: string;
  clinicName: string;
  phoneNumber: string;
  email: string;
  website: string;
  address: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  businessHours: string;
  weeklySchedule?: WeeklyScheduleData | null;
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
  logoUrl: null,
  faviconUrl: null,
  businessHours: 'mon-fri-8-6',
  weeklySchedule: null,
  timezone: 'eastern',
  appointmentDuration: '60',
  bookingLimit: '90',
  allowOnlineBooking: true
};

export default function SettingsPage() {
  const { t, isRTL } = useLanguage();
  const [settings, setSettings] = React.useState<ClinicSettings>(initialSettings);
  const [originalSettings, setOriginalSettings] = React.useState<ClinicSettings>(initialSettings);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [showResetDialog, setShowResetDialog] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [uploadingLogo, setUploadingLogo] = React.useState(false);
  const [uploadingFavicon, setUploadingFavicon] = React.useState(false);
  const { toast } = useToast();
  const autoSaveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        
        if (response.ok && data.settings) {
          const raw = data.settings;
          const normalized: ClinicSettings = {
            ...initialSettings,
            ...raw,
            appointmentDuration: String(raw.appointmentDuration ?? initialSettings.appointmentDuration),
            bookingLimit: String(raw.bookingLimit ?? initialSettings.bookingLimit),
          };
          setSettings(normalized);
          setOriginalSettings(normalized);
        } else {
          setSettings(initialSettings);
          setOriginalSettings(initialSettings);
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

  // Track unsaved changes
  React.useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasUnsavedChanges(hasChanges);
  }, [settings, originalSettings]);

  // Warn before leaving page with unsaved changes
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-save functionality
  React.useEffect(() => {
    if (hasUnsavedChanges && !loading) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3000); // Auto-save after 3 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [settings, hasUnsavedChanges, loading]);

  const validateSettings = (): boolean => {
    const errors: Record<string, string> = {};

    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      errors.email = 'Invalid email format';
    }

    if (settings.phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(settings.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number format';
    }

    if (settings.website && settings.website.trim() && !/^https?:\/\/.+/.test(settings.website)) {
      errors.website = 'Website must start with http:// or https://';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAutoSave = async () => {
    if (!validateSettings()) return;

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setOriginalSettings(settings);
        toast({
          title: "Auto-saved",
          description: "Your changes have been automatically saved",
          duration: 2000,
        });
      }
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: string, value: string) => {
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('settings.toast.invalid_file_type'),
        description: t('settings.toast.image_only'),
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t('settings.toast.file_too_large'),
        description: t('settings.toast.max_2mb'),
        variant: 'destructive',
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'clinic-branding');
      formData.append('imageType', 'logo');

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setSettings(prev => ({ ...prev, logoUrl: data.url }));
      
      toast({
        title: t('settings.toast.logo_uploaded'),
        description: t('settings.toast.logo_uploaded_desc'),
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      toast({
        title: t('settings.toast.upload_failed'),
        description: t('settings.toast.upload_failed_desc'),
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('settings.toast.invalid_file_type'),
        description: t('settings.toast.image_only'),
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 1MB for favicon)
    if (file.size > 1 * 1024 * 1024) {
      toast({
        title: t('settings.toast.file_too_large'),
        description: t('settings.toast.max_1mb'),
        variant: 'destructive',
      });
      return;
    }

    setUploadingFavicon(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'clinic-branding');
      formData.append('imageType', 'favicon');

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setSettings(prev => ({ ...prev, faviconUrl: data.url }));
      
      // Update favicon dynamically
      updateFavicon(data.url);
      
      toast({
        title: t('settings.toast.favicon_uploaded'),
        description: t('settings.toast.favicon_uploaded_desc'),
      });
    } catch (error) {
      console.error('Favicon upload error:', error);
      toast({
        title: t('settings.toast.upload_failed'),
        description: t('settings.toast.upload_failed_desc'),
        variant: 'destructive',
      });
    } finally {
      setUploadingFavicon(false);
    }
  };

  const updateFavicon = (url: string) => {
    // Update all favicon link elements
    const links = document.querySelectorAll("link[rel*='icon']");
    links.forEach(link => link.remove());

    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.type = 'image/x-icon';
    newLink.href = getClientFtpProxyUrl(url);
    document.head.appendChild(newLink);
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    setSettings(prev => ({ ...prev, [id]: checked }));
  };

  const handleSaveChanges = async () => {
    if (!validateSettings()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fix the errors before saving",
        variant: "destructive" 
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (response.ok) {
        setOriginalSettings(settings);
        toast({
          title: t('settings.toast.settings_saved'),
          description: t('settings.toast.settings_saved_desc'),
        });
      } else {
        toast({ title: data.error || t('settings.toast.error_saving'), variant: "destructive" });
      }
    } catch (error) {
      toast({ title: t('settings.toast.error_saving'), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setValidationErrors({});
    toast({
      title: "Settings Reset",
      description: "All changes have been reverted to last saved state",
    });
  };

  const handleResetToDefaults = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialSettings),
      });

      if (response.ok) {
        setSettings(initialSettings);
        setOriginalSettings(initialSettings);
        setShowResetDialog(false);
        toast({
          title: "Reset to Defaults",
          description: "All settings have been restored to default values",
        });
      } else {
        toast({ title: "Error resetting settings", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error resetting settings", variant: "destructive" });
    } finally {
      setSaving(false);
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
      <main className="flex w-full flex-1 flex-col gap-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-blue-100/50 via-purple-100/30 to-pink-100/20 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-tr from-green-100/50 via-cyan-100/30 to-blue-100/20 dark:from-green-950/20 dark:via-cyan-950/10 dark:to-blue-950/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header Section with Enhanced Design */}
        <div className="flex flex-col gap-6 relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                  <h1 className="relative text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 dark:from-blue-400 dark:via-cyan-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient">
                    {t('settings.title')}
                  </h1>
                </div>
                {hasUnsavedChanges && (
                  <span className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 px-4 py-2 rounded-full border-2 border-amber-300 dark:border-amber-700 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 animate-bounce">
                    <AlertCircle className="h-4 w-4 animate-pulse" />
                    <span className="font-semibold">{t('settings.unsaved_changes')}</span>
                  </span>
                )}
              </div>
              <p className="text-base text-muted-foreground font-medium flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></span>
                {t('settings.subtitle')}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap items-center">
              <Button 
                onClick={handleReset}
                variant="outline"
                size="lg"
                disabled={!hasUnsavedChanges || saving}
                className="gap-2 border-2 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
              >
                <RotateCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-semibold">{t('settings.reset')}</span>
              </Button>
              <Button 
                onClick={() => setShowResetDialog(true)}
                variant="outline"
                size="lg"
                disabled={saving}
                className="gap-2 border-2 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
              >
                <Database className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{t('settings.reset_to_defaults')}</span>
              </Button>
              <Button 
                onClick={handleSaveChanges} 
                size="lg"
                disabled={!hasUnsavedChanges || saving}
                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-bold">{t('settings.saving')}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-bold">{t('settings.save_changes')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative max-w-xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors duration-300" />
              <Input
                type="text"
                placeholder={t('settings.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-base border-2 border-muted hover:border-blue-300 dark:hover:border-blue-700 focus:border-blue-500 dark:focus:border-blue-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-background/80 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Tabs with Modern Design */}
        <Tabs defaultValue="clinic" className="space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
            <TabsList className="relative inline-flex h-auto flex-wrap gap-2 bg-gradient-to-br from-background/95 to-muted/30 backdrop-blur-md p-2 rounded-2xl border-2 border-muted/50 shadow-xl">
              <TabsTrigger 
                value="clinic" 
                className="gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105 transition-all duration-300 font-semibold group"
              >
                <Building className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:inline">{t('settings.tabs.clinic')}</span>
                <span className="sm:hidden">{t('settings.tabs.clinic')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105 transition-all duration-300 font-semibold group"
              >
                <Users className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:inline">{t('settings.tabs.users')}</span>
                <span className="sm:hidden">{t('settings.tabs.users')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105 transition-all duration-300 font-semibold group"
              >
                <Bell className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:inline">{t('settings.tabs.notifications')}</span>
                <span className="sm:hidden">{t('settings.tabs.notifications')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105 transition-all duration-300 font-semibold group"
              >
                <Shield className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:inline">{t('settings.tabs.security')}</span>
                <span className="sm:hidden">{t('settings.tabs.security')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="backup" 
                className="gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105 transition-all duration-300 font-semibold group"
              >
                <Database className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:inline">{t('settings.tabs.backup')}</span>
                <span className="sm:hidden">{t('settings.tabs.backup')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:scale-105 transition-all duration-300 font-semibold group"
              >
                <Palette className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="hidden sm:inline">{t('settings.tabs.appearance')}</span>
                <span className="sm:hidden">{t('settings.tabs.appearance')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="clinic" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="group relative border-2 border-muted hover:border-blue-200 dark:hover:border-blue-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-blue-50/30 dark:to-blue-950/10 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader className="space-y-3 pb-6 relative z-10">
                <CardTitle className="flex items-center gap-4 text-2xl">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div className="relative p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Building className="h-6 w-6" />
                    </div>
                  </div>
                  <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {t('settings.clinic.title')}
                  </span>
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium pl-16 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-blue-500"></span>
                  {t('settings.clinic.subtitle')}
                </p>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                  <div>
                    <Label htmlFor="clinicName">{t('settings.clinic.name')}</Label>
                    <Input id="clinicName" value={settings.clinicName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">{t('settings.clinic.phone')}</Label>
                    <Input 
                      id="phoneNumber" 
                      value={settings.phoneNumber} 
                      onChange={handleInputChange}
                      className={validationErrors.phoneNumber ? 'border-red-500' : ''}
                    />
                    {validationErrors.phoneNumber && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.phoneNumber}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">{t('settings.clinic.email')}</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={settings.email} 
                      onChange={handleInputChange}
                      className={validationErrors.email ? 'border-red-500' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="website">{t('settings.clinic.website')}</Label>
                    <Input 
                      id="website" 
                      value={settings.website} 
                      onChange={handleInputChange}
                      className={validationErrors.website ? 'border-red-500' : ''}
                      placeholder="https://example.com"
                    />
                    {validationErrors.website && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.website}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">{t('settings.clinic.address')}</Label>
                    <Input id="address" value={settings.address} onChange={handleInputChange} />
                  </div>
                  
                  {/* Logo Upload */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        {t('settings.clinic.logo')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.clinic.logo_description')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {settings.logoUrl && (
                        <div className="relative w-32 h-32 rounded-lg border-2 border-muted overflow-hidden bg-muted/20">
                          <Image
                            src={getClientFtpProxyUrl(settings.logoUrl)}
                            alt="Clinic Logo"
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="cursor-pointer"
                        />
                        {uploadingLogo && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('settings.clinic.uploading')}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t('settings.clinic.logo_size_hint')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Favicon Upload */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        {t('settings.clinic.favicon')}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.clinic.favicon_description')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {settings.faviconUrl && (
                        <div className="relative w-16 h-16 rounded-lg border-2 border-muted overflow-hidden bg-muted/20">
                          <Image
                            src={getClientFtpProxyUrl(settings.faviconUrl)}
                            alt="Favicon"
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFaviconUpload}
                          disabled={uploadingFavicon}
                          className="cursor-pointer"
                        />
                        {uploadingFavicon && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('settings.clinic.uploading')}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t('settings.clinic.favicon_size_hint')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <Label className="text-base font-semibold mb-2 block">{t('settings.clinic.business_hours')}</Label>
                    <WeeklySchedule 
                      value={settings.weeklySchedule || null}
                      onChange={(schedule) => setSettings({ ...settings, weeklySchedule: schedule })}
                    />
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

            <Card className="group relative border-2 border-muted hover:border-purple-200 dark:hover:border-purple-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-purple-50/20 dark:to-purple-950/10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <CardHeader className="space-y-3 pb-6 relative z-10">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  {t('settings.clinic.appointment_settings')}
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium pl-5">
                  {t('settings.clinic.appointment_subtitle')}
                </p>
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
                <div className="group flex items-center justify-between space-x-4 rounded-2xl border-2 border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/10 p-5 md:col-span-2 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex flex-col gap-2 relative z-10">
                    <Label htmlFor="allowOnlineBooking" className="text-base font-bold flex items-center gap-2 cursor-pointer">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      {t('settings.clinic.allow_online_booking')}
                    </Label>
                    <span className="text-sm text-muted-foreground font-medium">{t('settings.clinic.online_booking_desc')}</span>
                  </div>
                  <Switch 
                    id="allowOnlineBooking" 
                    checked={settings.allowOnlineBooking} 
                    onCheckedChange={(checked) => handleSwitchChange('allowOnlineBooking', checked)}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="users" className="space-y-6">
            <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  {t('settings.users.title')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('settings.users.subtitle')}
                </p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="2fa-switch" className="text-base font-medium">
                      Require Two-Factor Authentication
                    </Label>
                    <span className="text-sm text-muted-foreground">
                      All users must enable 2FA
                    </span>
                  </div>
                  <Switch id="2fa-switch" />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="autolock-switch" className="text-base font-medium">
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
          </TabsContent>
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Bell className="h-5 w-5" />
                  </div>
                  {t('settings.notifications.title')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('settings.notifications.subtitle')}
                </p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label className="text-base font-medium">Appointment Reminders</Label>
                    <span className="text-sm text-muted-foreground">
                      Send reminders to patients
                    </span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label className="text-base font-medium">Payment Notifications</Label>
                    <span className="text-sm text-muted-foreground">
                      Notify when payments are received
                    </span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label className="text-base font-medium">Staff Schedule Changes</Label>
                    <span className="text-sm text-muted-foreground">
                      Alert when staff schedules change
                    </span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label className="text-base font-medium">System Maintenance</Label>
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
          <TabsContent value="security" className="space-y-6">
            <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  {t('settings.security.title')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('settings.security.subtitle')}
                </p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="audit-logging" className="text-base font-medium">Enable Audit Logging</Label>
                    <span className="text-sm text-muted-foreground">
                      Track all system access and changes
                    </span>
                  </div>
                  <Switch id="audit-logging" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="encrypt-data" className="text-base font-medium">Encrypt Patient Data</Label>
                    <span className="text-sm text-muted-foreground">
                      Additional encryption for sensitive data
                    </span>
                  </div>
                  <Switch id="encrypt-data" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="hipaa-mode" className="text-base font-medium">HIPAA Compliance Mode</Label>
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
          <TabsContent value="backup" className="space-y-6">
            <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Database className="h-5 w-5" />
                  </div>
                  {t('settings.backup.title')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('settings.backup.subtitle')}
                </p>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="automatic-backups" className="text-base font-medium">Automatic Backups</Label>
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
                <div className="rounded-lg border-2 bg-gradient-to-br from-muted/30 to-muted/60 p-6 space-y-3">
                  <Label className="text-lg font-semibold">Manual Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Create an immediate backup of all data
                  </p>
                  <div className="pt-2">
                    <Button variant="outline" size="lg" className="gap-2 shadow-sm hover:shadow-md transition-shadow">
                      <Database className="h-4 w-4" />
                      Create Backup Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Palette className="h-5 w-5" />
                  </div>
                  {t('settings.appearance.title')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t('settings.appearance.subtitle')}
                </p>
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
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 md:col-span-2 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="compact-mode" className="text-base font-medium">Compact Mode</Label>
                    <span className="text-sm text-muted-foreground">
                      Use smaller spacing and elements
                    </span>
                  </div>
                  <Switch id="compact-mode" />
                </div>
                <div className="flex items-center justify-between space-x-4 rounded-lg border-2 bg-muted/50 p-4 md:col-span-2 hover:bg-muted/70 transition-colors">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="show-animations" className="text-base font-medium">Show Animations</Label>
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

        {/* Reset to Defaults Confirmation Dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Reset to Default Settings?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action will restore all settings to their default values. Any custom configurations will be lost. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleResetToDefaults}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Resetting...
                  </>
                ) : (
                  'Reset to Defaults'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </DashboardLayout>
  );
}
