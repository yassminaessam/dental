'use client';

import React, { useState, useEffect } from 'react';
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
  Activity
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
  'view_reports', 'edit_reports',
  'view_staff', 'edit_staff', 'delete_staff',
  'view_inventory', 'edit_inventory',
  'view_settings', 'edit_settings',
  'view_medical_records', 'edit_medical_records',
  'view_dental_chart', 'edit_dental_chart',
  'view_communications', 'send_communications',
  'view_insurance', 'edit_insurance',
  'view_analytics', 'view_own_data',
  'view_patient_portal', 'edit_patient_portal'
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const userData = await AuthService.getAllUsers();
      setUsers(userData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (data: RegisterData & { permissions?: UserPermission[] }) => {
    try {
      // Create user data with custom permissions if provided
      const userData = {
        ...data,
        permissions: data.permissions || ROLE_PERMISSIONS[data.role] || []
      };
      await AuthService.register(userData);
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setIsCreateDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await AuthService.deactivateUser(userId);
        toast({
          title: "Success",
          description: "User deactivated successfully",
        });
      } else {
        await AuthService.activateUser(userId);
        toast({
          title: "Success",
          description: "User activated successfully",
        });
      }
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePermissions = async (userId: string, permissions: UserPermission[]) => {
    try {
      await AuthService.updateUserPermissions(userId, permissions);
      toast({
        title: "Success",
        description: "User permissions updated successfully",
      });
      setIsEditingPermissions(false);
      loadUsers();
      // Update selected user if it's the same user
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, permissions });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage system users and their permissions</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <CreateUserForm onSubmit={handleCreateUser} />
              </DialogContent>
          </Dialog>
        </div>

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
          ) : (
            users.map((user) => (
              <Card key={user.id} className={`${!user.isActive ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {user.phone}
                    </div>
                  )}
                  {user.lastLoginAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Last login: {format(user.lastLoginAt, 'MMM dd, yyyy')}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
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
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant={user.isActive ? 'destructive' : 'default'}
                      onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? (
                        <>
                          <ShieldX className="h-3 w-3 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Activate
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
              />
            )}
          </DialogContent>
        </Dialog>
        </div>
      </DashboardLayout>
    </AdminOnly>
  );
}

function CreateUserForm({ onSubmit }: { onSubmit: (data: RegisterData & { permissions?: UserPermission[] }) => void }) {
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

  // Update default permissions when role changes
  useEffect(() => {
    const defaultPermissions = ROLE_PERMISSIONS[formData.role] || [];
    setSelectedPermissions(defaultPermissions);
  }, [formData.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, permissions: selectedPermissions });
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
    return permission
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const groupPermissions = (permissions: UserPermission[]) => {
    const groups: Record<string, UserPermission[]> = {
      'Patients': [],
      'Appointments': [],
      'Treatments': [],
      'Billing': [],
      'Reports': [],
      'Staff': [],
      'Inventory': [],
      'Settings': [],
      'Medical Records': [],
      'Dental Chart': [],
      'Communications': [],
      'Insurance': [],
      'Analytics': [],
      'Patient Portal': [],
      'Other': []
    };

    permissions.forEach(permission => {
      if (permission.includes('patient') && permission.includes('portal')) groups['Patient Portal'].push(permission);
      else if (permission.includes('patient')) groups['Patients'].push(permission);
      else if (permission.includes('appointment')) groups['Appointments'].push(permission);
      else if (permission.includes('treatment')) groups['Treatments'].push(permission);
      else if (permission.includes('billing')) groups['Billing'].push(permission);
      else if (permission.includes('report')) groups['Reports'].push(permission);
      else if (permission.includes('staff')) groups['Staff'].push(permission);
      else if (permission.includes('inventory')) groups['Inventory'].push(permission);
      else if (permission.includes('settings')) groups['Settings'].push(permission);
      else if (permission.includes('medical_records')) groups['Medical Records'].push(permission);
      else if (permission.includes('dental_chart')) groups['Dental Chart'].push(permission);
      else if (permission.includes('communication')) groups['Communications'].push(permission);
      else if (permission.includes('insurance')) groups['Insurance'].push(permission);
      else if (permission.includes('analytics')) groups['Analytics'].push(permission);
      else groups['Other'].push(permission);
    });

    // Filter out empty groups
    return Object.fromEntries(
      Object.entries(groups).filter(([_, perms]) => perms.length > 0)
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New User</DialogTitle>
        <DialogDescription>
          Add a new user to the system with their role and permissions.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
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
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="receptionist">Receptionist</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          {formData.role === 'doctor' && (
            <>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber">License Number</Label>
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
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
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
            <Label className="text-sm font-medium">Permissions</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Customize permissions or use role defaults
            </p>
            <div className="max-h-48 overflow-y-auto border rounded-md p-3">
              {Object.entries(groupPermissions(ALL_PERMISSIONS)).map(([group, permissions]) => (
                <div key={group} className="mb-3">
                  <h4 className="font-medium text-xs text-muted-foreground mb-2">{group}</h4>
                  <div className="space-y-1">
                    {permissions.map(permission => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={`create-${permission}`}
                          checked={selectedPermissions.includes(permission)}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(permission, checked as boolean)
                          }
                        />
                        <Label htmlFor={`create-${permission}`} className="text-xs font-normal">
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
            {isSubmitting ? 'Creating...' : 'Create User'}
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
  onUpdatePermissions 
}: { 
  user: User;
  isEditingPermissions: boolean;
  onEditPermissions: () => void;
  onCancelEdit: () => void;
  onUpdatePermissions: (userId: string, permissions: UserPermission[]) => void;
}) {
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
    return permission
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const groupPermissions = (permissions: UserPermission[]) => {
    const groups: Record<string, UserPermission[]> = {
      'Patients': [],
      'Appointments': [],
      'Treatments': [],
      'Billing': [],
      'Reports': [],
      'Staff': [],
      'Inventory': [],
      'Settings': [],
      'Medical Records': [],
      'Dental Chart': [],
      'Communications': [],
      'Insurance': [],
      'Analytics': [],
      'Patient Portal': [],
      'Other': []
    };

    permissions.forEach(permission => {
      if (permission.includes('patient') && permission.includes('portal')) groups['Patient Portal'].push(permission);
      else if (permission.includes('patient')) groups['Patients'].push(permission);
      else if (permission.includes('appointment')) groups['Appointments'].push(permission);
      else if (permission.includes('treatment')) groups['Treatments'].push(permission);
      else if (permission.includes('billing')) groups['Billing'].push(permission);
      else if (permission.includes('report')) groups['Reports'].push(permission);
      else if (permission.includes('staff')) groups['Staff'].push(permission);
      else if (permission.includes('inventory')) groups['Inventory'].push(permission);
      else if (permission.includes('settings')) groups['Settings'].push(permission);
      else if (permission.includes('medical_records')) groups['Medical Records'].push(permission);
      else if (permission.includes('dental_chart')) groups['Dental Chart'].push(permission);
      else if (permission.includes('communication')) groups['Communications'].push(permission);
      else if (permission.includes('insurance')) groups['Insurance'].push(permission);
      else if (permission.includes('analytics')) groups['Analytics'].push(permission);
      else groups['Other'].push(permission);
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
        <DialogDescription>User details and permissions</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Role</Label>
            <Badge variant={getRoleBadgeVariant(user.role)} className="mt-1">
              {user.role}
            </Badge>
          </div>
          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Badge variant={user.isActive ? 'default' : 'secondary'} className="mt-1">
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Email</Label>
          <p className="text-sm">{user.email}</p>
        </div>
        {user.phone && (
          <div>
            <Label className="text-sm font-medium">Phone</Label>
            <p className="text-sm">{user.phone}</p>
          </div>
        )}
        {user.specialization && (
          <div>
            <Label className="text-sm font-medium">Specialization</Label>
            <p className="text-sm">{user.specialization}</p>
          </div>
        )}
        {user.licenseNumber && (
          <div>
            <Label className="text-sm font-medium">License Number</Label>
            <p className="text-sm">{user.licenseNumber}</p>
          </div>
        )}
        {user.employeeId && (
          <div>
            <Label className="text-sm font-medium">Employee ID</Label>
            <p className="text-sm">{user.employeeId}</p>
          </div>
        )}
        <div>
          <Label className="text-sm font-medium">Created</Label>
          <p className="text-sm">{format(user.createdAt, 'PPP')}</p>
        </div>
        {user.lastLoginAt && (
          <div>
            <Label className="text-sm font-medium">Last Login</Label>
            <p className="text-sm">{format(user.lastLoginAt, 'PPp')}</p>
          </div>
        )}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Permissions</Label>
            {!isEditingPermissions && (
              <Button size="sm" variant="outline" onClick={onEditPermissions}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
          </div>
          
          {isEditingPermissions ? (
            <div className="mt-2 space-y-4">
              <div className="max-h-60 overflow-y-auto border rounded-md p-3">
                {Object.entries(groupPermissions(ALL_PERMISSIONS)).map(([group, permissions]) => (
                  <div key={group} className="mb-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">{group}</h4>
                    <div className="space-y-2">
                      {permissions.map(permission => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={selectedPermissions.includes(permission)}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(permission, checked as boolean)
                            }
                          />
                          <Label htmlFor={permission} className="text-xs font-normal">
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
                  Save Changes
                </Button>
                <Button size="sm" variant="outline" onClick={onCancelEdit}>
                  Cancel
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
