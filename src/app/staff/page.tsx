

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
import type { StaffMember } from '@/lib/types';

export type { StaffMember } from '@/lib/types';

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
    <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-3xl font-bold">{t('staff.title')}</h1>
          <AddEmployeeDialog onSave={handleSaveEmployee} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {staffPageStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {staffRoles.map((role) => (
            <Card key={role.name}>
              <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground">{t(`roles.${role.name.toLowerCase()}`)}</div>
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
              </CardContent>
            </Card>
          ))}
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
