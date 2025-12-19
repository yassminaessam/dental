'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/lib/auth';
import { AdminOnly } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Phone,
  Mail,
  Activity,
  Sparkles,
  UserCog
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ROLE_PERMISSIONS } from '@/lib/types';
import type { User, UserRole, RegisterData, UserPermission } from '@/lib/types';
import { format } from 'date-fns';

// All available permissions for checkbox selection
const ALL_PERMISSIONS: UserPermission[] = [
  'view_patients', 'edit_patients', 'delete_patients',
  'view_appointments', 'edit_appointments', 'delete_appointments',
  'view_treatments', 'edit_treatments', 'delete_treatments',
  'view_billing', 'edit_billing', 'delete_billing',
  'view_wallets', 'edit_wallets', 'delete_wallets',
  'view_reports', 'edit_reports',
  'view_staff', 'edit_staff', 'delete_staff',
  'view_attendance', 'edit_attendance', 'delete_attendance',
  'view_inventory', 'edit_inventory', 'delete_inventory',
  'view_lab_management', 'edit_lab_management', 'delete_lab_management',
  'view_settings', 'edit_settings',
  'view_website_edit', 'edit_website_edit',
  'view_medical_records', 'edit_medical_records',
  'view_dental_chart', 'edit_dental_chart',
  'view_communications', 'send_communications',
  'view_insurance', 'edit_insurance',
  'view_analytics', 'view_own_data',
  'view_patient_portal', 'edit_patient_portal',
  'view_pharmacy', 'edit_pharmacy', 'delete_pharmacy',
  'view_prescriptions', 'edit_prescriptions', 'delete_prescriptions',
  'view_purchase_orders', 'edit_purchase_orders', 'delete_purchase_orders',
  'view_referrals', 'edit_referrals', 'delete_referrals',
  'view_financial', 'edit_financial', 'delete_financial',
  'view_suppliers', 'edit_suppliers', 'delete_suppliers',
  'view_chats', 'send_chats', 'delete_chats',
  'view_users', 'edit_users', 'delete_users',
  'view_help', 'edit_help'
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const { t } = useLanguage();
  const auth = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const userData = await AuthService.getAllUsers();
      setUsers(userData);
      setFilteredUsers(userData);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: t('users.error_loading'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower))
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user =>
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async (data: RegisterData & { permissions?: UserPermission[] }): Promise<{ success: boolean; error?: string; field?: string }> => {
    try {
      // Create user data with custom permissions if provided
      const userData = {
        ...data,
        permissions: data.permissions || ROLE_PERMISSIONS[data.role] || []
      };
      await AuthService.register(userData);
      toast({
        title: t('common.success'),
        description: t('users.toast.created'),
      });
      setIsCreateDialogOpen(false);
      loadUsers();
      return { success: true };
    } catch (error: any) {
      // Check if it's a phone/email duplicate error
      const errorMessage = error.message?.toLowerCase() || '';
      if (errorMessage.includes('email')) {
        return { success: false, error: error.message, field: 'email' };
      }
      if (errorMessage.includes('phone')) {
        return { success: false, error: error.message, field: 'phone' };
      }
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await AuthService.deactivateUser(userId);
        // Sync staff status to Inactive
        try {
          await fetch(`/api/staff/by-user/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Inactive' }),
          });
        } catch (e) {
          console.log('No linked staff member to update');
        }
        // Sync patient status to Inactive
        try {
          const patientSyncRes = await fetch(`/api/patient/sync-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, isActive: false }),
          });
          const patientSyncData = await patientSyncRes.json();
          console.log('[UserManagement] Patient sync result:', patientSyncData);
        } catch (e) {
          console.log('No linked patient to update or sync failed:', e);
        }
        toast({
          title: t('common.success'),
          description: t('users.toast.deactivated'),
        });
      } else {
        await AuthService.activateUser(userId);
        // Sync staff status to Active
        try {
          await fetch(`/api/staff/by-user/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Active' }),
          });
        } catch (e) {
          console.log('No linked staff member to update');
        }
        // Sync patient status to Active
        try {
          const patientSyncRes = await fetch(`/api/patient/sync-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, isActive: true }),
          });
          const patientSyncData = await patientSyncRes.json();
          console.log('[UserManagement] Patient sync result:', patientSyncData);
        } catch (e) {
          console.log('No linked patient to update or sync failed:', e);
        }
        toast({
          title: t('common.success'),
          description: t('users.toast.activated'),
        });
      }
      loadUsers();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePermissions = async (userId: string, permissions: UserPermission[]) => {
    try {
      await AuthService.updateUserPermissions(userId, permissions);
      toast({
        title: t('common.success'),
        description: t('users.toast.permissions_updated'),
      });
      setIsEditingPermissions(false);
      loadUsers();
      // Update selected user if it's the same user
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, permissions });
      }
      // Refresh current user context if editing own permissions
      if (userId === auth.user?.id) {
        await auth.refreshUser();
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (userId: string, updates: { email?: string; password?: string; firstName?: string; lastName?: string; phone?: string }): Promise<{ success: boolean; error?: string; field?: string }> => {
    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const data = await response.json();
        if (data.field === 'email') {
          return { success: false, error: data.error, field: 'email' };
        }
        throw new Error(data.error || 'Failed to update user');
      }
      
      toast({
        title: t('common.success'),
        description: t('users.toast.updated'),
      });
      setIsEditDialogOpen(false);
      loadUsers();
      return { success: true };
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'doctor': return 'default';
      case 'receptionist': return 'secondary';
      case 'patient': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <ShieldCheck className="h-4 w-4" />;
      case 'doctor': return <Activity className="h-4 w-4" />;
      case 'receptionist': return <Users className="h-4 w-4" />;
      case 'patient': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  return (
    <AdminOnly>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-6 relative">
          {/* Decorative Background */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-200/30 via-purple-200/20 to-fuchsia-200/10 dark:from-violet-900/15 dark:via-purple-900/10 dark:to-fuchsia-900/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-fuchsia-200/30 via-pink-200/20 to-rose-200/10 dark:from-fuchsia-900/15 dark:via-pink-900/10 dark:to-rose-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
          </div>

          {/* Ultra Enhanced Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                {/* Left side: Icon + Title */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-xl">
                      <UserCog className="h-8 w-8" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-violet-500 bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full">Admin Panel</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent animate-gradient">
                      {t('nav.user_management')}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      {t('users.page_subtitle')}
                    </p>
                  </div>
                </div>

                {/* Right side: Action Button */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-11 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700">
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t('users.add_user')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <CreateUserForm onSubmit={handleCreateUser} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Smart Filters */}
          <Card className="border-2 border-muted/50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('users.filters')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('users.search')}</Label>
                  <Input
                    placeholder={t('users.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10"
                  />
                </div>

                {/* Role Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('users.role')}</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={t('users.all_roles')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('users.all_roles')}</SelectItem>
                      <SelectItem value="admin">{t('users.admin')}</SelectItem>
                      <SelectItem value="doctor">{t('users.doctor')}</SelectItem>
                      <SelectItem value="receptionist">{t('users.receptionist')}</SelectItem>
                      <SelectItem value="patient">{t('users.patient')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('users.status')}</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={t('users.all_statuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('users.all_statuses')}</SelectItem>
                      <SelectItem value="active">{t('users.active')}</SelectItem>
                      <SelectItem value="inactive">{t('users.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Stats */}
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {t('users.showing')} {filteredUsers.length} {t('users.of')} {users.length} {t('users.users')}
                </span>
                {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    {t('users.clear_filters')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredUsers.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{t('users.no_users_found')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('users.no_users_found_description')}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card 
                key={user.id} 
                className={`relative overflow-hidden border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group ${!user.isActive ? 'opacity-60' : ''}`}
              >
                {/* Animated Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 font-bold shadow-md">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1 font-medium">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 relative z-10">
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <div className="p-1 rounded bg-violet-100 dark:bg-violet-900/30">
                        <Phone className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                      </div>
                      {user.phone}
                    </div>
                  )}
                  {user.lastLoginAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/30">
                        <Calendar className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      {t('users.last_login')}: {format(user.lastLoginAt, 'MMM dd, yyyy')}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={user.isActive ? 'default' : 'secondary'} 
                      className="font-bold shadow-sm"
                    >
                      {user.isActive ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsViewDialogOpen(true);
                      }}
                      className="flex-1 font-bold hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {t('common.view')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant={user.isActive ? 'destructive' : 'default'}
                      onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                      className="flex-1 font-bold"
                    >
                      {user.isActive ? (
                        <>
                          <ShieldX className="h-3 w-3 mr-1" />
                          {t('users.deactivate')}
                        </>
                      ) : (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          {t('users.activate')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View User Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setIsEditingPermissions(false);
          }
        }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            {selectedUser && (
              <UserDetailsView 
                user={selectedUser} 
                isEditingPermissions={isEditingPermissions}
                onEditPermissions={() => setIsEditingPermissions(true)}
                onCancelEdit={() => setIsEditingPermissions(false)}
                onUpdatePermissions={handleUpdatePermissions}
                onEditUser={() => {
                  setIsViewDialogOpen(false);
                  setIsEditDialogOpen(true);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            {selectedUser && (
              <EditUserForm 
                user={selectedUser}
                onSubmit={(updates) => handleUpdateUser(selectedUser.id, updates)}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
        </div>
      </DashboardLayout>
    </AdminOnly>
  );
}

function CreateUserForm({ onSubmit }: { onSubmit: (data: RegisterData & { permissions?: UserPermission[] }) => Promise<{ success: boolean; error?: string; field?: string }> }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'receptionist',
    phone: '',
    specialization: '',
    licenseNumber: '',
    employeeId: '',
    department: '',
  });
  const [selectedPermissions, setSelectedPermissions] = useState<UserPermission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  // Check for duplicate email on blur
  const checkEmailDuplicate = async (email: string) => {
    if (!email || !email.includes('@')) return;
    setIsCheckingEmail(true);
    try {
      const response = await fetch('/api/users/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.exists && data.field === 'email') {
        setEmailError(t('users.email_already_exists'));
      }
    } catch (error) {
      console.error('Error checking email duplicate:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Check for duplicate phone on blur
  const checkPhoneDuplicate = async (phone: string) => {
    if (!phone || phone.length < 3) return;
    setIsCheckingPhone(true);
    try {
      const response = await fetch('/api/users/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (data.exists && data.field === 'phone') {
        setPhoneError(t('users.phone_already_exists'));
      }
    } catch (error) {
      console.error('Error checking phone duplicate:', error);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  // Update default permissions when role changes
  useEffect(() => {
    const defaultPermissions = ROLE_PERMISSIONS[formData.role] || [];
    setSelectedPermissions(defaultPermissions);
  }, [formData.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPhoneError(null);
    setIsSubmitting(true);
    try {
      const result = await onSubmit({ ...formData, permissions: selectedPermissions });
      if (!result.success) {
        if (result.field === 'email' || result.error?.toLowerCase().includes('email')) {
          setEmailError(t('users.email_already_exists'));
        } else if (result.field === 'phone' || result.error?.toLowerCase().includes('phone')) {
          setPhoneError(t('users.phone_already_exists'));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermissionChange = (permission: UserPermission, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const formatPermissionLabel = (permission: UserPermission) => {
    // permission pattern: action_subject e.g. view_patients, edit_billing, delete_staff, send_communications, view_own_data
    const permLower = permission.toLowerCase();
    const [action, ...subjectParts] = permLower.split('_');
    const subject = subjectParts.join('_');
    const actionLabel = t(`permissions.action.${action}`);
    const subjectLabel = t(`permissions.subject.${subject}`);
    return `${actionLabel || action} ${subjectLabel || subject}`;
  };

  const groupPermissions = (permissions: UserPermission[]) => {
    const groups: Record<string, UserPermission[]> = {
      'patients': [],
      'appointments': [],
      'treatments': [],
      'billing': [],
      'wallets': [],
      'financial': [],
      'reports': [],
      'staff': [],
      'attendance': [],
      'inventory': [],
      'lab_management': [],
      'pharmacy': [],
      'prescriptions': [],
      'purchase_orders': [],
      'suppliers': [],
      'referrals': [],
      'settings': [],
      'website_edit': [],
      'medical_records': [],
      'dental_chart': [],
      'communications': [],
      'chats': [],
      'insurance': [],
      'analytics': [],
      'patient_portal': [],
      'users': [],
      'help': [],
      'other': []
    };

    permissions.forEach(permission => {
      if (permission.includes('patient') && permission.includes('portal')) groups['patient_portal'].push(permission);
      else if (permission.includes('patient')) groups['patients'].push(permission);
      else if (permission.includes('appointment')) groups['appointments'].push(permission);
      else if (permission.includes('treatment')) groups['treatments'].push(permission);
      else if (permission.includes('wallet')) groups['wallets'].push(permission);
      else if (permission.includes('billing')) groups['billing'].push(permission);
      else if (permission.includes('financial')) groups['financial'].push(permission);
      else if (permission.includes('report')) groups['reports'].push(permission);
      else if (permission.includes('attendance')) groups['attendance'].push(permission);
      else if (permission.includes('staff')) groups['staff'].push(permission);
      else if (permission.includes('lab_management')) groups['lab_management'].push(permission);
      else if (permission.includes('inventory')) groups['inventory'].push(permission);
      else if (permission.includes('pharmacy')) groups['pharmacy'].push(permission);
      else if (permission.includes('prescription')) groups['prescriptions'].push(permission);
      else if (permission.includes('purchase_order')) groups['purchase_orders'].push(permission);
      else if (permission.includes('supplier')) groups['suppliers'].push(permission);
      else if (permission.includes('referral')) groups['referrals'].push(permission);
      else if (permission.includes('website_edit')) groups['website_edit'].push(permission);
      else if (permission.includes('settings')) groups['settings'].push(permission);
      else if (permission.includes('medical_records')) groups['medical_records'].push(permission);
      else if (permission.includes('dental_chart')) groups['dental_chart'].push(permission);
      else if (permission.includes('communication')) groups['communications'].push(permission);
      else if (permission.includes('chat')) groups['chats'].push(permission);
      else if (permission.includes('insurance')) groups['insurance'].push(permission);
      else if (permission.includes('analytics')) groups['analytics'].push(permission);
      else if (permission.includes('user')) groups['users'].push(permission);
      else if (permission.includes('help')) groups['help'].push(permission);
      else groups['other'].push(permission);
    });

    // Filter out empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, perms]) => perms.length > 0)
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('users.create_new')}</DialogTitle>
        <DialogDescription>
          {t('users.create_new_desc')}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">{t('patients.first_name')}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">{t('patients.last_name')}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">{t('patients.email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, email: e.target.value }));
                if (emailError) setEmailError(null);
              }}
              onBlur={(e) => checkEmailDuplicate(e.target.value)}
              required
              className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {isCheckingEmail && (
              <p className="text-sm text-muted-foreground mt-1">{t('common.checking')}...</p>
            )}
            {emailError && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {emailError}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="role">{t('staff.role')}</Label>
            <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                <SelectItem value="doctor">{t('roles.dentist')}</SelectItem>
                <SelectItem value="receptionist">{t('roles.receptionist')}</SelectItem>
                <SelectItem value="patient">{t('common.patient')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="phone">{t('common.phone')}</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, phone: e.target.value }));
                if (phoneError) setPhoneError(null);
              }}
              onBlur={(e) => checkPhoneDuplicate(e.target.value)}
              className={phoneError ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {isCheckingPhone && (
              <p className="text-sm text-muted-foreground mt-1">{t('common.checking')}...</p>
            )}
            {phoneError && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {phoneError}
              </p>
            )}
          </div>
          {formData.role === 'doctor' && (
            <>
              <div>
                <Label htmlFor="specialization">{t('users.specialization')}</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber">{t('users.license_number')}</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                />
              </div>
            </>
          )}
          {(formData.role === 'receptionist' || formData.role === 'admin') && (
            <>
              <div>
                <Label htmlFor="employeeId">{t('users.employee_id')}</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="department">{t('users.department')}</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </>
          )}
          
          {/* Permissions Section */}
          <div>
            <Label className="text-sm font-medium">{t('users.permissions')}</Label>
            <p className="text-xs text-muted-foreground mb-2">
              {t('users.permissions_hint')}
            </p>
            <div className="max-h-48 overflow-y-auto border rounded-md p-3">
              {Object.entries(groupPermissions(ALL_PERMISSIONS)).map(([group, permissions]) => (
                <div key={group} className="mb-4 last:mb-0">
                  <h4 className="font-semibold text-sm text-foreground mb-2 pb-1 border-b">{t(`permissions.group.${group}`)}</h4>
                  <div className="space-y-1.5 mt-2">
                    {permissions.map(permission => (
                      <div key={permission} className="flex items-center gap-2">
                        <Checkbox
                          id={`create-${permission}`}
                          checked={selectedPermissions.includes(permission)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(permission, checked as boolean)
                          }
                        />
                        <Label htmlFor={`create-${permission}`} className="text-sm font-normal cursor-pointer">
                          {formatPermissionLabel(permission)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('users.create_user_action')}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function UserDetailsView({ 
  user, 
  isEditingPermissions, 
  onEditPermissions, 
  onCancelEdit, 
  onUpdatePermissions,
  onEditUser 
}: { 
  user: User;
  isEditingPermissions: boolean;
  onEditPermissions: () => void;
  onCancelEdit: () => void;
  onUpdatePermissions: (userId: string, permissions: UserPermission[]) => void;
  onEditUser: () => void;
}) {
  const { t } = useLanguage();
  const [selectedPermissions, setSelectedPermissions] = useState<UserPermission[]>(user.permissions);

  // Reset selected permissions when user changes or edit mode starts
  useEffect(() => {
    setSelectedPermissions(user.permissions);
  }, [user.permissions, isEditingPermissions]);

  const handlePermissionChange = (permission: UserPermission, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleSavePermissions = () => {
    onUpdatePermissions(user.id, selectedPermissions);
  };

  const formatPermissionLabel = (permission: UserPermission) => {
    const permLower = permission.toLowerCase();
    const [action, ...subjectParts] = permLower.split('_');
    const subject = subjectParts.join('_');
    const actionLabel = t(`permissions.action.${action}`);
    const subjectLabel = t(`permissions.subject.${subject}`);
    return `${actionLabel || action} ${subjectLabel || subject}`;
  };

  const groupPermissions = (permissions: UserPermission[]) => {
    const groups: Record<string, UserPermission[]> = {
      'patients': [],
      'appointments': [],
      'treatments': [],
      'billing': [],
      'wallets': [],
      'financial': [],
      'reports': [],
      'staff': [],
      'attendance': [],
      'inventory': [],
      'lab_management': [],
      'pharmacy': [],
      'prescriptions': [],
      'purchase_orders': [],
      'suppliers': [],
      'referrals': [],
      'settings': [],
      'website_edit': [],
      'medical_records': [],
      'dental_chart': [],
      'communications': [],
      'chats': [],
      'insurance': [],
      'analytics': [],
      'patient_portal': [],
      'users': [],
      'help': [],
      'other': []
    };

    permissions.forEach(permission => {
      if (permission.includes('patient') && permission.includes('portal')) groups['patient_portal'].push(permission);
      else if (permission.includes('patient')) groups['patients'].push(permission);
      else if (permission.includes('appointment')) groups['appointments'].push(permission);
      else if (permission.includes('treatment')) groups['treatments'].push(permission);
      else if (permission.includes('wallet')) groups['wallets'].push(permission);
      else if (permission.includes('billing')) groups['billing'].push(permission);
      else if (permission.includes('financial')) groups['financial'].push(permission);
      else if (permission.includes('report')) groups['reports'].push(permission);
      else if (permission.includes('attendance')) groups['attendance'].push(permission);
      else if (permission.includes('staff')) groups['staff'].push(permission);
      else if (permission.includes('lab_management')) groups['lab_management'].push(permission);
      else if (permission.includes('inventory')) groups['inventory'].push(permission);
      else if (permission.includes('pharmacy')) groups['pharmacy'].push(permission);
      else if (permission.includes('prescription')) groups['prescriptions'].push(permission);
      else if (permission.includes('purchase_order')) groups['purchase_orders'].push(permission);
      else if (permission.includes('supplier')) groups['suppliers'].push(permission);
      else if (permission.includes('referral')) groups['referrals'].push(permission);
      else if (permission.includes('website_edit')) groups['website_edit'].push(permission);
      else if (permission.includes('settings')) groups['settings'].push(permission);
      else if (permission.includes('medical_records')) groups['medical_records'].push(permission);
      else if (permission.includes('dental_chart')) groups['dental_chart'].push(permission);
      else if (permission.includes('communication')) groups['communications'].push(permission);
      else if (permission.includes('chat')) groups['chats'].push(permission);
      else if (permission.includes('insurance')) groups['insurance'].push(permission);
      else if (permission.includes('analytics')) groups['analytics'].push(permission);
      else if (permission.includes('user')) groups['users'].push(permission);
      else if (permission.includes('help')) groups['help'].push(permission);
      else groups['other'].push(permission);
    });

    // Filter out empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, perms]) => perms.length > 0)
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {getRoleIcon(user.role)}
          {user.firstName} {user.lastName}
        </DialogTitle>
        <DialogDescription>{t('users.details_and_permissions')}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {/* Edit User Details Button */}
        <div className="flex justify-end">
          <Button size="sm" variant="outline" onClick={onEditUser}>
            <Edit className="h-3 w-3 mr-1" />
            {t('users.edit_details')}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">{t('staff.role')}</Label>
            <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
              {user.role}
            </Badge>
          </div>
          <div>
            <Label className="text-sm font-medium">{t('common.status')}</Label>
            <Badge variant={user.isActive ? 'default' : 'secondary'} className="mt-1">
              {user.isActive ? t('common.active') : t('common.inactive')}
            </Badge>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">{t('patients.email')}</Label>
          <p className="text-sm">{user.email}</p>
        </div>
        {user.phone && (
          <div>
            <Label className="text-sm font-medium">{t('common.phone')}</Label>
            <p className="text-sm">{user.phone}</p>
          </div>
        )}
        {user.specialization && (
          <div>
            <Label className="text-sm font-medium">{t('users.specialization')}</Label>
            <p className="text-sm">{user.specialization}</p>
          </div>
        )}
        {user.licenseNumber && (
          <div>
            <Label className="text-sm font-medium">{t('users.license_number')}</Label>
            <p className="text-sm">{user.licenseNumber}</p>
          </div>
        )}
        {user.employeeId && (
          <div>
            <Label className="text-sm font-medium">{t('users.employee_id')}</Label>
            <p className="text-sm">{user.employeeId}</p>
          </div>
        )}
        <div>
          <Label className="text-sm font-medium">{t('common.created_at')}</Label>
          <p className="text-sm">{format(user.createdAt, 'PPP')}</p>
        </div>
        {user.lastLoginAt && (
          <div>
            <Label className="text-sm font-medium">{t('users.last_login')}</Label>
            <p className="text-sm">{format(user.lastLoginAt, 'PPp')}</p>
          </div>
        )}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{t('users.permissions')}</Label>
            {!isEditingPermissions && (
              <Button size="sm" variant="outline" onClick={onEditPermissions}>
                <Edit className="h-3 w-3 mr-1" />
                {t('common.edit')}
              </Button>
            )}
          </div>
          
          {isEditingPermissions ? (
            <div className="mt-2 space-y-4">
              <div className="max-h-60 overflow-y-auto border rounded-md p-3">
                {Object.entries(groupPermissions(ALL_PERMISSIONS)).map(([group, permissions]) => (
                  <div key={group} className="mb-4 last:mb-0">
                    <h4 className="font-semibold text-sm text-foreground mb-2 pb-1 border-b">{t(`permissions.group.${group}`)}</h4>
                    <div className="space-y-1.5 mt-2">
                      {permissions.map(permission => (
                        <div key={permission} className="flex items-center gap-2">
                          <Checkbox
                            id={permission}
                            checked={selectedPermissions.includes(permission)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission, checked as boolean)
                            }
                          />
                          <Label htmlFor={permission} className="text-sm font-normal cursor-pointer">
                            {formatPermissionLabel(permission)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSavePermissions}>
                  {t('common.save_changes')}
                </Button>
                <Button size="sm" variant="outline" onClick={onCancelEdit}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 mt-1">
              {user.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {formatPermissionLabel(permission)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function getRoleBadgeVariant(role: UserRole) {
  switch (role) {
    case 'admin': return 'destructive' as const;
    case 'doctor': return 'default' as const;
    case 'receptionist': return 'secondary' as const;
    case 'patient': return 'outline' as const;
    default: return 'outline' as const;
  }
}

function getRoleIcon(role: UserRole) {
  switch (role) {
    case 'admin': return <ShieldCheck className="h-4 w-4" />;
    case 'doctor': return <Activity className="h-4 w-4" />;
    case 'receptionist': return <Users className="h-4 w-4" />;
    case 'patient': return <Users className="h-4 w-4" />;
    default: return <Users className="h-4 w-4" />;
  }
}

function EditUserForm({ 
  user, 
  onSubmit, 
  onCancel 
}: { 
  user: User;
  onSubmit: (updates: { email?: string; password?: string; firstName?: string; lastName?: string; phone?: string }) => Promise<{ success: boolean; error?: string; field?: string }>;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEmailError(null);

    // Only include fields that changed
    const updates: any = {};
    if (formData.email !== user.email) updates.email = formData.email;
    if (formData.firstName !== user.firstName) updates.firstName = formData.firstName;
    if (formData.lastName !== user.lastName) updates.lastName = formData.lastName;
    if (formData.phone !== (user.phone || '')) updates.phone = formData.phone;
    if (formData.password) updates.password = formData.password;

    if (Object.keys(updates).length === 0) {
      onCancel();
      return;
    }

    const result = await onSubmit(updates);
    
    if (!result.success) {
      if (result.field === 'email') {
        setEmailError(result.error || t('users.email_already_exists'));
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          {t('users.edit_user')}
        </DialogTitle>
        <DialogDescription>
          {t('users.edit_user_desc', { name: `${user.firstName} ${user.lastName}` })}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editFirstName">{t('patients.first_name')}</Label>
              <Input
                id="editFirstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="editLastName">{t('patients.last_name')}</Label>
              <Input
                id="editLastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="editEmail">{t('patients.email')}</Label>
            <Input
              id="editEmail"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, email: e.target.value }));
                setEmailError(null);
              }}
              required
            />
            {emailError && (
              <p className="text-sm text-red-500 mt-1">{emailError}</p>
            )}
            {user.patientId && (
              <p className="text-xs text-muted-foreground mt-1">
                {t('users.email_sync_patient_note')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="editPhone">{t('common.phone')}</Label>
            <Input
              id="editPhone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="editPassword">{t('users.new_password')}</Label>
            <div className="relative">
              <Input
                id="editPassword"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={t('users.leave_blank_password')}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('users.password_change_hint')}
            </p>
          </div>

          {user.role === 'patient' && user.patientId && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-3">
              <p className="text-sm text-blue-800 dark:text-blue-400">
                ℹ️ {t('users.patient_sync_note')}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.save_changes')}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
