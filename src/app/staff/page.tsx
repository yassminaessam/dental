

'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import { Search, User, MoreHorizontal, Pencil, Trash2, Eye, Loader2, UserPlus, Clock } from "lucide-react";
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
import { getCollection, setDocument, updateDocument, deleteDocument } from '@/services/firestore';
import { useLanguage } from '@/contexts/LanguageContext';

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  schedule: string;
  salary: string;
  hireDate: string;
  status: 'Active' | 'Inactive';
  notes?: string;
};

const staffRoles = [
  { name: "Dentist", color: "bg-blue-100 text-blue-800" },
  { name: "Hygienist", color: "bg-green-100 text-green-800" },
  { name: "Assistant", color: "bg-purple-100 text-purple-800" },
  { name: "Receptionist", color: "bg-yellow-100 text-yellow-800" },
  { name: "Manager", color: "bg-red-100 text-red-800" },
];

export default function StaffPage() {
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [staffToView, setStaffToView] = React.useState<StaffMember | null>(null);
  const [staffToEdit, setStaffToEdit] = React.useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = React.useState<StaffMember | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  React.useEffect(() => {
    async function fetchStaff() {
      try {
        const data = await getCollection<StaffMember>('staff');
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
      const newEmployee: StaffMember = {
        id: `EMP-${Date.now()}`,
        name: `${data.name}`,
        role: data.role,
        email: data.email,
        phone: data.phone,
        schedule: 'Mon-Fri, 9-5',
        salary: `EGP ${parseInt(data.salary).toLocaleString()}`,
        hireDate: new Date(data.hireDate).toLocaleDateString(),
        status: 'Active'
      };
      await setDocument('staff', newEmployee.id, newEmployee);
      setStaff(prev => [newEmployee, ...prev]);
      toast({
        title: t('staff.toast.employee_added'),
        description: t('staff.toast.employee_added_desc'),
      });
    } catch (e) {
      toast({ title: t('staff.toast.error_adding'), variant: "destructive" });
    }
  };
  
  const handleUpdateEmployee = async (updatedStaff: StaffMember) => {
    try {
      await updateDocument('staff', updatedStaff.id, updatedStaff);
      setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
      setStaffToEdit(null);
      toast({
        title: t('staff.toast.employee_updated'),
        description: t('staff.toast.employee_updated_desc'),
      });
    } catch(e) {
      toast({ title: t('staff.toast.error_updating'), variant: "destructive" });
    }
  };

  const handleDeleteEmployee = async () => {
    if (staffToDelete) {
      try {
        await deleteDocument('staff', staffToDelete.id);
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
    const lowercasedTerm = searchTerm.toLowerCase();
    return staff.filter(member =>
      member.name.toLowerCase().includes(lowercasedTerm) ||
      member.role.toLowerCase().includes(lowercasedTerm) ||
      member.email.toLowerCase().includes(lowercasedTerm) ||
      member.phone.includes(lowercasedTerm)
    );
  }, [staff, searchTerm]);


  return (
    <DashboardLayout>
    <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto">
        {/* Elite Header Section */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
                <User className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Staff Management</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('staff.title')}
            </h1>
            <p className="text-muted-foreground font-medium">Elite Team Directory</p>
          </div>
          <div className="flex items-center gap-3">
            <AddEmployeeDialog onSave={handleSaveEmployee} />
          </div>
        </div>

        {/* Elite Staff Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {staffPageStats.map((stat, index) => {
            const cardStyles = [
              'metric-card-blue',
              'metric-card-green', 
              'metric-card-orange'
            ];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group",
                  cardStyle
                )}
              >
                {/* Animated Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className="text-2xl font-bold text-white drop-shadow-sm">
                      {stat.value}
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                    <User className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 relative z-10">
                  <p className="text-xs text-white/80 font-medium">
                    {stat.description}
                  </p>
                  {/* Elite Status Indicator */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                    <span className="text-xs text-white/70 font-medium">Active</span>
                  </div>
                </CardContent>
                
                {/* Elite Corner Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent" />
              </Card>
            );
          })}
        </div>

        {/* Elite Role Breakdown */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {staffRoles.map((role, index) => {
            const cardStyles = [
              'bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20',
              'bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20',
              'bg-gradient-to-br from-orange-500/10 to-amber-600/10 border-orange-500/20',
              'bg-gradient-to-br from-purple-500/10 to-violet-600/10 border-purple-500/20',
              'bg-gradient-to-br from-pink-500/10 to-rose-600/10 border-pink-500/20'
            ];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card key={role.name} className={cn("elite-card hover:scale-105 transition-all duration-300", cardStyle)}>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground mb-2">{t(`roles.${role.name.toLowerCase()}`)}</div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{staff.filter(s => s.role === role.name).length}</span>
                    <Badge
                      className={cn(
                        "text-xs font-semibold",
                        role.color
                      )}
                    >
                      {t('common.active')}
                    </Badge>
                  </div>
                  {/* Elite Role Indicator */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground font-medium">Department</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>{t('staff.directory')}</CardTitle>
                <div className="relative w-full md:w-auto">
                  <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
                  <Input
                    type="search"
                    placeholder={t('staff.search_placeholder')}
                    className={cn("w-full rounded-lg bg-background lg:w-[336px]", isRTL ? 'pr-8 text-right' : 'pl-8')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
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
                            <div>{member.email}</div>
                            <div className="text-xs text-muted-foreground">{member.phone}</div>
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
