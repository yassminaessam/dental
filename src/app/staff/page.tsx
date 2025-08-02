

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

  React.useEffect(() => {
    async function fetchStaff() {
      try {
        const data = await getCollection<StaffMember>('staff');
        setStaff(data);
      } catch (error) {
        toast({ title: "Error fetching staff data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
  }, [toast]);
  
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
      { title: "Total Staff", value: totalStaff, description: "All clinic employees" },
      { title: "Active Staff", value: activeStaff, description: "Currently working employees" },
      { title: "New Hires (30d)", value: newHires, description: "Joined in the last month" },
    ];
  }, [staff]);


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
        title: "Employee Added",
        description: `${newEmployee.name} has been added to the staff.`,
      });
    } catch (e) {
      toast({ title: "Error adding employee", variant: "destructive" });
    }
  };
  
  const handleUpdateEmployee = async (updatedStaff: StaffMember) => {
    try {
      await updateDocument('staff', updatedStaff.id, updatedStaff);
      setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
      setStaffToEdit(null);
      toast({
        title: "Employee Updated",
        description: `${updatedStaff.name}'s record has been updated.`,
      });
    } catch(e) {
      toast({ title: "Error updating employee", variant: "destructive" });
    }
  };

  const handleDeleteEmployee = async () => {
    if (staffToDelete) {
      try {
        await deleteDocument('staff', staffToDelete.id);
        setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));
        toast({
          title: "Employee Deleted",
          description: `${staffToDelete.name}'s record has been deleted.`,
          variant: "destructive"
        });
        setStaffToDelete(null);
      } catch(e) {
        toast({ title: "Error deleting employee", variant: "destructive" });
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
          <h1 className="text-3xl font-bold">Staff Management</h1>
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
                <div className="text-sm font-medium text-muted-foreground">
                  {role.name}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">{staff.filter(s => s.role === role.name).length}</span>
                  <Badge
                    className={cn(
                      "text-xs font-semibold",
                      role.color
                    )}
                  >
                    Active
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
                <CardTitle>Staff Directory</CardTitle>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search staff..."
                    className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                          <TableCell>{member.role}</TableCell>
                          <TableCell>
                            <div>{member.email}</div>
                            <div className="text-xs text-muted-foreground">{member.phone}</div>
                          </TableCell>
                          <TableCell>{member.schedule}</TableCell>
                          <TableCell>{member.salary}</TableCell>
                          <TableCell>{member.hireDate}</TableCell>
                          <TableCell>
                            <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>{member.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setStaffToView(member)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStaffToEdit(member)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStaffToDelete(member)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No staff found.
                        </TableCell>
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member's record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmployee}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
