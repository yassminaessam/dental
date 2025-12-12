'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  Loader2,
  Camera,
  Key,
  Calendar,
  MapPin,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { cn } from '@/lib/utils';

export default function UserProfilePage() {
  const { user, refreshUser } = useAuth();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form State
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);

  // Personal Info State
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [profileImageUrl, setProfileImageUrl] = React.useState<string | undefined>(undefined);

  // Password State
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [changingPassword, setChangingPassword] = React.useState(false);

  // Notification Preferences State
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [appointmentReminders, setAppointmentReminders] = React.useState(true);
  const [savingNotifications, setSavingNotifications] = React.useState(false);

  // Load user data
  React.useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setProfileImageUrl(user.profileImageUrl || undefined);
    }
  }, [user]);

  const getUserInitials = () => {
    const first = firstName?.[0] || user?.firstName?.[0] || '';
    const last = lastName?.[0] || user?.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const getRoleDisplayName = () => {
    if (!user?.role) return '';
    return t(`roles.${user.role}`) || user.role;
  };

  const getRoleBadgeVariant = () => {
    switch (user?.role) {
      case 'admin': return 'destructive';
      case 'doctor': return 'default';
      case 'receptionist': return 'secondary';
      default: return 'outline';
    }
  };

  const handleSavePersonalInfo = async () => {
    if (!user?.id) {
      toast({
        title: t('common.error'),
        description: 'User not found',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      toast({
        title: t('profile.profile_updated'),
        description: t('profile.profile_updated_desc')
      });

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('profile.update_error'),
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast({
        title: t('common.error'),
        description: t('profile.current_password_required'),
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('profile.password_mismatch'),
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: t('common.error'),
        description: t('profile.password_too_short'),
        variant: 'destructive'
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: t('common.error'),
        description: 'User not found',
        variant: 'destructive'
      });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast({
        title: t('profile.password_changed'),
        description: t('profile.password_changed_desc')
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message === 'Current password is incorrect'
          ? t('profile.current_password_incorrect')
          : t('profile.password_change_error'),
        variant: 'destructive'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: t('common.error'),
        description: t('profile.invalid_file_type'),
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('common.error'),
        description: t('profile.file_too_large'),
        variant: 'destructive',
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'profile-photos');
      formData.append('patientId', user.id);
      formData.append('imageType', 'profile');

      // Upload to FTP-enabled uploads API
      const uploadResponse = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      const newPhotoUrl = uploadData.url;

      // Update user profile image
      const updateResponse = await fetch(`/api/auth/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImageUrl: newPhotoUrl }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile');
      }

      setProfileImageUrl(newPhotoUrl);

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      toast({
        title: t('profile.photo_uploaded'),
        description: t('profile.photo_uploaded_desc'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('profile.photo_upload_error'),
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveNotifications = async () => {
    // For now, just show a success message
    // In a real implementation, this would save to user preferences
    setSavingNotifications(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: t('profile.notifications_updated'),
        description: t('profile.notifications_updated_desc')
      });
    } finally {
      setSavingNotifications(false);
    }
  };

  if (!user) {
    return (
      <ProtectedRoute requiredRoles={['admin', 'doctor', 'receptionist']}>
        <DashboardLayout>
          <div className="p-6 flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <div className="animate-pulse text-lg">{t('common.loading')}</div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['admin', 'doctor', 'receptionist']}>
      <DashboardLayout>
        <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Decorative Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-pink-200/10 dark:from-blue-900/15 dark:via-purple-900/10 dark:to-pink-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-200/30 via-cyan-200/20 to-blue-200/10 dark:from-green-900/15 dark:via-cyan-900/10 dark:to-blue-900/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* Header */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('profile.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t('profile.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture & Role Card */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle>{t('profile.picture')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      <Avatar className="h-32 w-32 ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
                        <AvatarImage
                          src={profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${getUserInitials()}`}
                          alt={`${firstName} ${lastName}`}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl font-bold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/90"
                      >
                        {uploadingPhoto ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Camera className="h-5 w-5" />
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground text-center">
                      {t('profile.photo_hint')}
                    </p>
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-semibold">{firstName} {lastName}</h3>
                      <p className="text-sm text-muted-foreground">{email}</p>
                      <Badge variant={getRoleBadgeVariant() as any} className="mt-2">
                        {getRoleDisplayName()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    {t('profile.notifications')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">{t('profile.email_notifications')}</Label>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="appointment-reminders">{t('profile.appointment_reminders')}</Label>
                    <Switch
                      id="appointment-reminders"
                      checked={appointmentReminders}
                      onCheckedChange={setAppointmentReminders}
                    />
                  </div>
                  <Button
                    className="w-full mt-2"
                    onClick={handleSaveNotifications}
                    disabled={savingNotifications}
                    variant="outline"
                  >
                    {savingNotifications ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('common.saving')}
                      </>
                    ) : (
                      t('profile.save_notifications')
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Account Info Card */}
              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    {t('profile.account_info')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('profile.member_since')}:</span>
                    <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('profile.last_login')}:</span>
                    <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '-'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('profile.role')}:</span>
                    <Badge variant={getRoleBadgeVariant() as any} className="text-xs">
                      {getRoleDisplayName()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {t('profile.personal_info')}
                  </CardTitle>
                  <CardDescription>{t('profile.update_details')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t('profile.first_name')}</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t('profile.last_name')}</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('profile.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{t('profile.email_cannot_change')}</p>
                    </div>
                    <div>
                      <Label htmlFor="phone">{t('profile.phone')}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+20 100 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={handleSavePersonalInfo}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('common.saving')}
                      </>
                    ) : (
                      t('profile.save_changes')
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Change Password */}
              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    {t('profile.security')}
                  </CardTitle>
                  <CardDescription>{t('profile.change_password')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">{t('profile.current_password')}</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">{t('profile.new_password')}</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">{t('profile.confirm_password')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    className="mt-4"
                    onClick={handleChangePassword}
                    disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('common.saving')}
                      </>
                    ) : (
                      t('profile.update_password')
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
