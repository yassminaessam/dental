

'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatEGP } from '@/lib/currency';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Search, User, MoreHorizontal, Pencil, Trash2, Eye, Loader2, UserPlus, Clock, Sparkles, Users, Briefcase, X, Stethoscope, Heart, ClipboardList, ShieldCheck } from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import { AddEmployeeDialog } from "@/components/staff/add-employee-dialog";
import { EditEmployeeDialog } from "@/components/staff/edit-employee-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { ViewEmployeeDialog } from '@/components/staff/view-employee-dialog';
import { listDocuments, setDocument, updateDocument, deleteDocument } from '@/lib/data-client';
import { useLanguage } from '@/contexts/LanguageContext';
import type { StaffMember } from '@/lib/types';

export type { StaffMember } from '@/lib/types';

const staffRoles = [
  { name: "doctor", color: "bg-blue-100 text-blue-800" },
  { name: "hygienist", color: "bg-green-100 text-green-800" },
  { name: "assistant", color: "bg-purple-100 text-purple-800" },
  { name: "receptionist", color: "bg-yellow-100 text-yellow-800" },
  { name: "manager", color: "bg-red-100 text-red-800" },
  { name: "nurse", color: "bg-pink-100 text-pink-800" },
  { name: "admin", color: "bg-slate-100 text-slate-800" },
];

const normalizePhoneNumber = (value?: string | null) =>
  value ? value.replace(/\D/g, '') : '';

export default function StaffPage() {
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [staffToView, setStaffToView] = React.useState<StaffMember | null>(null);
  const [staffToEdit, setStaffToEdit] = React.useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = React.useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);
  const { toast } = useToast();
  const { t, isRTL, language } = useLanguage();

  React.useEffect(() => {
    async function fetchStaff() {
      try {
        // ✅ Fetch from Neon database via API
        const response = await fetch('/api/staff');
        if (!response.ok) throw new Error('Failed to fetch staff');
        const { staff: data } = await response.json();
        setStaff(data);
      } catch (error) {
        toast({ title: t('staff.toast.error_fetching'), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, [toast, t]);
  
  const staffPageStats = React.useMemo(() => {
    const totalStaff = staff.length;
    const activeStaff = staff.filter(s => s.status === 'Active').length;
    const newHires = staff.filter(s => {
      const hireDate = new Date(s.hireDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return hireDate > thirtyDaysAgo;
    }).length;

    return [
      { title: t('staff.total_staff'), value: totalStaff, description: t('staff.all_employees_description') },
      { title: t('staff.active_staff'), value: activeStaff, description: t('staff.currently_working_description') },
      { title: t('staff.new_hires_30d'), value: newHires, description: t('staff.joined_last_month_description') },
    ];
  }, [staff, t]);


  const handleSaveEmployee = async (data: Omit<StaffMember, 'id' | 'schedule' | 'status'>) => {
    try {
      // ✅ Create via API (Neon database)
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          role: data.role,
          email: data.email,
          phone: data.phone,
          schedule: 'Mon-Fri, 9-5',
          salary: formatEGP(parseInt(data.salary), true, language),
          hireDate: new Date(data.hireDate).toISOString(),
          status: 'Active',
          userId: data.userId, // Link to user account if created
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create staff');
      }
      
      const { staff: newEmployee } = await response.json();
      setStaff(prev => [newEmployee, ...prev]);
      toast({
        title: t('staff.toast.employee_added'),
        description: t('staff.toast.employee_added_desc'),
      });
    } catch (e: any) {
      toast({ 
        title: t('staff.toast.error_adding'), 
        description: e.message,
        variant: "destructive" 
      });
    }
  };
  
  const handleUpdateEmployee = async (updatedStaff: StaffMember) => {
    try {
      // ✅ Update via API (Neon database)
      const response = await fetch(`/api/staff/${updatedStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStaff),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update staff');
      }
      
      setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
      setStaffToEdit(null);
      toast({
        title: t('staff.toast.employee_updated'),
        description: t('staff.toast.employee_updated_desc'),
      });
    } catch(e: any) {
      toast({ 
        title: t('staff.toast.error_updating'), 
        description: e.message,
        variant: "destructive" 
      });
    }
  };

  const handleDeleteEmployee = async () => {
    if (staffToDelete) {
      try {
        // ✅ Delete via API (Neon database)
        const response = await fetch(`/api/staff/${staffToDelete.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete staff');
        }
        
        setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));
        toast({
          title: t('staff.toast.employee_deleted'),
          description: t('staff.toast.employee_deleted_desc'),
          variant: "destructive"
        });
        setStaffToDelete(null);
      } catch(e) {
        toast({ title: t('staff.toast.error_deleting'), variant: "destructive" });
      }
    }
  };

  const filteredStaff = React.useMemo(() => {
    const lowercasedTerm = searchTerm.toLowerCase().trim();
    const numericSearchTerm = searchTerm.replace(/\D/g, '');
    const hasTextSearch = lowercasedTerm.length > 0;
    const hasNumericSearch = numericSearchTerm.length > 0;

    return staff.filter((member) => {
      // First apply role filter if selected
      if (selectedRole && member.role !== selectedRole) {
        return false;
      }

      // If no search term and role matches (or no role filter), include the member
      if (!hasTextSearch && !hasNumericSearch) return true;

      const matchesName = member.name.toLowerCase().includes(lowercasedTerm);
      const matchesRole = member.role.toLowerCase().includes(lowercasedTerm);
      const matchesEmail = (member.email || '').toLowerCase().includes(lowercasedTerm);
      const matchesSchedule = (member.schedule || '').toLowerCase().includes(lowercasedTerm);
      const matchesSalary = (member.salary || '').toLowerCase().includes(lowercasedTerm);
      const matchesStatus = (member.status || '').toLowerCase().includes(lowercasedTerm);

      const phoneValue = member.phone || '';
      const normalizedPhone = normalizePhoneNumber(phoneValue);
      const matchesPhone = hasNumericSearch
        ? normalizedPhone.includes(numericSearchTerm)
        : phoneValue.toLowerCase().includes(lowercasedTerm);

      return (
        matchesName ||
        matchesRole ||
        matchesEmail ||
        matchesSchedule ||
        matchesSalary ||
        matchesStatus ||
        matchesPhone
      );
    });
  }, [staff, searchTerm, selectedRole]);


  return (
    <DashboardLayout>
    <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-200/30 via-fuchsia-200/20 to-pink-200/10 dark:from-violet-900/15 dark:via-fuchsia-900/10 dark:to-pink-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-sky-200/30 via-blue-200/20 to-indigo-200/10 dark:from-sky-900/15 dark:via-blue-900/10 dark:to-indigo-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-pink-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-xl">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    {t('staff.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('page.staff.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <AddEmployeeDialog onSave={handleSaveEmployee} />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Staff Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {staffPageStats.map((stat, index) => {
            const cardStyles = ['metric-card-blue','metric-card-green','metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            const variants = ['blue','green','pink'];
            const variant = variants[index % variants.length] as 'blue'|'green'|'pink';
            return (
              <Card
                key={stat.title}
                className={cn(
                  'relative overflow-hidden border-0 shadow-xl transition-all duration-500 group',
                  cardStyle
                )}
                role="button"
                tabIndex={0}
                aria-label={stat.title}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <CardIcon variant={variant} aria-hidden="true">
                    {index === 0 && <Users className="h-5 w-5" />}
                    {index === 1 && <UserPlus className="h-5 w-5" />}
                    {index === 2 && <Briefcase className="h-5 w-5" />}
                  </CardIcon>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-2">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Role Breakdown */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {staffRoles.map((role, index) => {
            const icons = [Stethoscope, Heart, UserPlus, ClipboardList, Briefcase, Heart, ShieldCheck];
            const Icon = icons[index % icons.length];
            const count = staff.filter(s => s.role === role.name).length;
            const isSelected = selectedRole === role.name;
            
            return (
              <Card 
                key={role.name} 
                onClick={() => setSelectedRole(isSelected ? null : role.name)}
                className={cn(
                  "group relative border-2 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background cursor-pointer hover:scale-105",
                  isSelected 
                    ? "border-violet-500 dark:border-violet-400 ring-2 ring-violet-500/50 dark:ring-violet-400/50 to-violet-100/30 dark:to-violet-900/20 scale-105" 
                    : "border-muted hover:border-violet-200 dark:hover:border-violet-900 to-violet-50/10 dark:to-violet-950/5"
                )}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <CardContent className="relative z-10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn(
                      "p-2 rounded-xl transition-colors",
                      isSelected 
                        ? "bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30" 
                        : "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 group-hover:from-violet-500/20 group-hover:to-fuchsia-500/20"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        isSelected 
                          ? "text-violet-700 dark:text-violet-300" 
                          : "text-violet-600 dark:text-violet-400"
                      )} />
                    </div>
                    <Badge className={cn("text-xs font-semibold", role.color)}>
                      {isSelected ? t('common.filtered') : t('common.active')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-muted-foreground">{t(`roles.${role.name}`)}</div>
                    <div className={cn(
                      "text-2xl font-black bg-clip-text text-transparent",
                      isSelected 
                        ? "bg-gradient-to-r from-violet-700 to-fuchsia-700 dark:from-violet-300 dark:to-fuchsia-300" 
                        : "bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400"
                    )}>
                      {count}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      isSelected ? "bg-violet-600 animate-pulse" : "bg-violet-500 animate-pulse"
                    )} />
                    <span className="text-xs text-muted-foreground font-medium">
                      {isSelected ? t('common.click_to_clear') : t('common.click_to_filter')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="lg:col-span-3">
            <Card className="group relative border-2 border-muted hover:border-sky-200 dark:hover:border-sky-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-sky-50/10 dark:to-sky-950/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-500/5 to-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardHeader className="relative z-10 flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 group-hover:from-sky-500/20 group-hover:to-blue-500/20 transition-colors">
                    <Users className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent">
                    {t('staff.directory')}
                  </CardTitle>
                  {selectedRole && (
                    <Badge 
                      variant="secondary"
                      className="flex items-center gap-1 cursor-pointer hover:bg-destructive/20 transition-colors"
                      onClick={() => setSelectedRole(null)}
                    >
                      <span>{t(`roles.${selectedRole}`)}</span>
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
                
                <div className="relative w-full md:w-auto group/search">
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-xl blur-lg opacity-0 group-hover/search:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <Search className={cn("absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover/search:text-sky-500 transition-colors duration-300", isRTL ? 'right-3' : 'left-3')} />
                    <Input
                      type="search"
                      placeholder={t('staff.search_placeholder')}
                      className={cn("w-full rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted hover:border-sky-300 dark:hover:border-sky-700 focus:border-sky-500 dark:focus:border-sky-600 py-5 h-auto lg:w-[336px] shadow-sm hover:shadow-md transition-all duration-300", isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('staff.employee')}</TableHead>
                      <TableHead>{t('staff.role')}</TableHead>
                      <TableHead>{t('staff.contact_info')}</TableHead>
                      <TableHead>{t('staff.schedule')}</TableHead>
                      <TableHead>{t('staff.salary')}</TableHead>
                      <TableHead>{t('staff.hire_date')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredStaff.length > 0 ? (
                      filteredStaff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="font-medium">{member.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>{t(`roles.${member.role.toLowerCase()}`) || member.role}</TableCell>
                          <TableCell>
                            <div>{member.email || t('common.na')}</div>
                            <div className="text-xs text-muted-foreground">
                              <span
                                dir="ltr"
                                className={cn('inline-flex', isRTL && 'text-left')}
                              >
                                {member.phone || t('common.na')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{member.schedule}</TableCell>
                          <TableCell>{member.salary}</TableCell>
                          <TableCell>{member.hireDate}</TableCell>
                          <TableCell>
                            <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                              {member.status === 'Active' ? t('common.active') : t('common.inactive')}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn(isRTL ? 'text-left' : 'text-right')}>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">{t('table.actions')}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setStaffToView(member)}>
                                        <Eye className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                                        {t('table.view_details')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStaffToEdit(member)}>
                                        <Pencil className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                                        {t('table.edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStaffToDelete(member)} className="text-destructive">
                                        <Trash2 className={cn('h-4 w-4', isRTL ? 'ml-2' : 'mr-2')} />
                                        {t('table.delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">{t('staff.no_staff_found')}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

       {staffToView && (
        <ViewEmployeeDialog
          staffMember={staffToView}
          open={!!staffToView}
          onOpenChange={(isOpen) => !isOpen && setStaffToView(null)}
        />
      )}

       {staffToEdit && (
        <EditEmployeeDialog
          staffMember={staffToEdit}
          onSave={handleUpdateEmployee}
          open={!!staffToEdit}
          onOpenChange={(isOpen) => !isOpen && setStaffToEdit(null)}
        />
      )}

      <AlertDialog open={!!staffToDelete} onOpenChange={(isOpen) => !isOpen && setStaffToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('staff.confirm_delete_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('staff.confirm_delete_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmployee}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
