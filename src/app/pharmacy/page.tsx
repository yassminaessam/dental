
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Search,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  Pill,
  ShoppingCart,
  Pencil,
  Trash2,
  Download,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { NewPrescriptionDialog } from "@/components/pharmacy/new-prescription-dialog";
import { AddMedicationDialog } from "@/components/pharmacy/add-medication-dialog";
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditMedicationDialog } from '@/components/pharmacy/edit-medication-dialog';
import { ViewPrescriptionDialog } from '@/components/pharmacy/view-prescription-dialog';
import { getCollection, setDocument, deleteDocument, updateDocument } from '@/services/firestore';

export type Medication = {
  id: string;
  name: string;
  fullName: string;
  strength: string;
  form: string;
  category: string;
  stock: number;
  unitPrice: string;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

export type Prescription = {
  id: string;
  patient: string;
  medication: string;
  strength: string;
  dosage: string;
  duration: string;
  refills: number;
  doctor: string;
  date: string;
  status: 'Active' | 'Completed';
};

const iconMap = {
  Pill,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
};

type IconKey = keyof typeof iconMap;


export default function PharmacyPage() {
    const [medications, setMedications] = React.useState<Medication[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [medicationToEdit, setMedicationToEdit] = React.useState<Medication | null>(null);
    const [medicationToDelete, setMedicationToDelete] = React.useState<Medication | null>(null);
    const [medicationSearchTerm, setMedicationSearchTerm] = React.useState('');
    const [medicationCategoryFilter, setMedicationCategoryFilter] = React.useState('all');
    
    const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
    const [prescriptionToView, setPrescriptionToView] = React.useState<Prescription | null>(null);
    const [prescriptionSearchTerm, setPrescriptionSearchTerm] = React.useState('');
    const [prescriptionStatusFilter, setPrescriptionStatusFilter] = React.useState('all');
    
    const { toast } = useToast();
    
    React.useEffect(() => {
        async function fetchData() {
            try {
                const [medicationData, prescriptionData] = await Promise.all([
                    getCollection<Medication>('medications'),
                    getCollection<Prescription>('prescriptions'),
                ]);
                setMedications(medicationData);
                setPrescriptions(prescriptionData);
            } catch (error) {
                toast({ title: "Error fetching data", variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);

    const medicationCategories = React.useMemo(() => {
        return [...new Set(medications.map((i) => i.category))];
    }, [medications]);

    const pharmacyPageStats = React.useMemo(() => {
        const totalMedications = medications.length;
        const totalPrescriptions = prescriptions.length;
        const lowStockMedications = medications.filter(m => m.status === 'Low Stock' || m.status === 'Out of Stock').length;
        const expiringSoon = medications.filter(m => {
            if (m.expiryDate === 'N/A') return false;
            const expiry = new Date(m.expiryDate);
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);
            return expiry > today && expiry <= thirtyDaysFromNow;
        }).length;
        
        return [
            { title: "Total Medications", value: totalMedications, icon: "Pill", description: "Different types of medicine" },
            { title: "Low Stock", value: lowStockMedications, icon: "AlertTriangle", description: "Needs reordering", valueClassName: "text-destructive" },
            { title: "Expiring Soon", value: expiringSoon, icon: "CalendarClock", description: "Within 30 days", valueClassName: "text-orange-500" },
            { title: "Prescriptions", value: totalPrescriptions, icon: "ClipboardList", description: "Total prescriptions written" },
        ];
    }, [medications, prescriptions]);

    const handleSaveMedication = async (data: any) => {
      try {
          const newMedication: Medication = {
            id: `MED-${Date.now()}`,
            name: data.name,
            fullName: data.name,
            strength: data.strength,
            form: data.form,
            category: data.category,
            stock: data.stock,
            unitPrice: `$${parseFloat(data.unitPrice).toFixed(2)}`,
            expiryDate: data.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : 'N/A',
            status: data.stock > 20 ? 'In Stock' : 'Low Stock',
          };
          await setDocument('medications', newMedication.id, newMedication);
          setMedications(prev => [newMedication, ...prev]);
          toast({
            title: "Medication Added",
            description: `${newMedication.name} has been added to the inventory.`,
          });
      } catch(e) {
         toast({ title: 'Error adding medication', variant: 'destructive'});
      }
    };

    const handleUpdateMedication = async (updatedMedication: Medication) => {
      try {
          await updateDocument('medications', updatedMedication.id, updatedMedication);
          setMedications(prev => prev.map(med => med.id === updatedMedication.id ? updatedMedication : med));
          setMedicationToEdit(null);
          toast({
            title: "Medication Updated",
            description: `${updatedMedication.name} has been successfully updated.`,
          });
      } catch(e) {
          toast({ title: 'Error updating medication', variant: 'destructive'});
      }
    };

    const handleDeleteMedication = async () => {
      if (medicationToDelete) {
        try {
            await deleteDocument('medications', medicationToDelete.id);
            setMedications(prev => prev.filter(med => med.id !== medicationToDelete.id));
            toast({
              title: "Medication Deleted",
              description: `${medicationToDelete.name} has been removed from inventory.`,
              variant: "destructive",
            });
            setMedicationToDelete(null);
        } catch(e) {
            toast({ title: 'Error deleting medication', variant: 'destructive'});
        }
      }
    };
    
    const handleSavePrescription = async (data: any) => {
        try {
            const newPrescription: Prescription = {
              id: `RX-${Date.now()}`,
              patient: data.patient,
              medication: data.medication,
              strength: data.dosage,
              dosage: data.instructions,
              duration: 'As directed',
              refills: data.refills,
              doctor: data.doctor,
              date: new Date(data.date).toLocaleDateString(),
              status: 'Active',
            };
            await setDocument('prescriptions', newPrescription.id, newPrescription);
            setPrescriptions(prev => [newPrescription, ...prev]);
            toast({
              title: "Prescription Created",
              description: `A new prescription for ${newPrescription.patient} has been created.`,
            });
        } catch(e) {
            toast({ title: 'Error creating prescription', variant: 'destructive'});
        }
      };

    const filteredMedications = React.useMemo(() => {
        return medications
          .filter(med => med.name.toLowerCase().includes(medicationSearchTerm.toLowerCase()))
          .filter(med => medicationCategoryFilter === 'all' || med.category === medicationCategoryFilter);
    }, [medications, medicationSearchTerm, medicationCategoryFilter]);

    const filteredPrescriptions = React.useMemo(() => {
        return prescriptions
          .filter(p => 
            p.patient.toLowerCase().includes(prescriptionSearchTerm.toLowerCase()) ||
            p.medication.toLowerCase().includes(prescriptionSearchTerm.toLowerCase())
          )
          .filter(p => prescriptionStatusFilter === 'all' || p.status.toLowerCase() === prescriptionStatusFilter);
      }, [prescriptions, prescriptionSearchTerm, prescriptionStatusFilter]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pharmacy Management</h1>
            <p className="text-muted-foreground">
              Manage medications, prescriptions, and dispensing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NewPrescriptionDialog onSave={handleSavePrescription} medications={medications} />
            <AddMedicationDialog onSave={handleSaveMedication} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pharmacyPageStats.map((stat) => {
             const Icon = iconMap[stat.icon as IconKey];
             return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                 <Icon className={cn("h-4 w-4 text-muted-foreground", stat.valueClassName)} />
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", stat.valueClassName)}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
             );
          })}
        </div>
        
        <Tabs defaultValue="medications">
          <TabsList>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="dispensing">Dispensing</TabsTrigger>
            <TabsTrigger value="stock-alerts">Stock Alerts</TabsTrigger>
          </TabsList>
          <TabsContent value="medications" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Medication Inventory</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search medications..."
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                      value={medicationSearchTerm}
                      onChange={(e) => setMedicationSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={medicationCategoryFilter} onValueChange={setMedicationCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {medicationCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Form & Strength</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredMedications.length > 0 ? (
                      filteredMedications.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.fullName}</div>
                          </TableCell>
                          <TableCell>
                             <div className="font-medium">{item.form}</div>
                             <div className="text-xs text-muted-foreground">{item.strength}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className={cn("font-medium", item.status === 'Low Stock' && 'text-destructive flex items-center gap-2')}>
                                {item.stock}
                                {item.status === 'Low Stock' && <AlertTriangle className="h-4 w-4" />}
                            </div>
                          </TableCell>
                          <TableCell>{item.unitPrice}</TableCell>
                          <TableCell>{item.expiryDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.status === "Low Stock"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setMedicationToEdit(item)}>
                                <Pencil className="mr-2 h-3 w-3" />
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => setMedicationToDelete(item)}>
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No medications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="prescriptions" className="mt-4">
             <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Prescription Records</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search prescriptions..."
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                      value={prescriptionSearchTerm}
                      onChange={e => setPrescriptionSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={prescriptionStatusFilter} onValueChange={setPrescriptionStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prescription ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage & Instructions</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredPrescriptions.length > 0 ? (
                        filteredPrescriptions.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.id}</TableCell>
                            <TableCell>{record.patient}</TableCell>
                            <TableCell>
                            <div className="flex items-center gap-2">
                                <Pill className="h-4 w-4 text-muted-foreground" />
                                <div>
                                <div className="font-medium">{record.medication}</div>
                                <div className="text-xs text-muted-foreground">
                                    {record.strength}
                                </div>
                                </div>
                            </div>
                            </TableCell>
                            <TableCell>
                            <div>{record.dosage}</div>
                            <div className="text-xs text-muted-foreground">
                                {record.duration}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Refills: {record.refills}
                            </div>
                            </TableCell>
                            <TableCell>{record.doctor}</TableCell>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>
                            <Badge
                                variant={record.status === 'Active' ? 'default' : 'outline'}
                                className={cn(
                                    record.status === 'Active' && 'bg-foreground text-background hover:bg-foreground/80',
                                    record.status === 'Completed' && 'bg-green-100 text-green-800 border-transparent'
                                )}
                            >
                                {record.status === 'Active' ? <Clock className="mr-1 h-3 w-3" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                                {record.status}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPrescriptionToView(record)}>
                                <Eye className="mr-2 h-3 w-3" />
                                View
                                </Button>
                                {record.status === 'Active' && (
                                    <Button variant="outline" size="sm" disabled>
                                        <Send className="mr-2 h-3 w-3" />
                                        Send
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" disabled>
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                                </Button>
                            </div>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                            No prescriptions found.
                            </TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="dispensing">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    No dispensing records found.
                </CardContent>
             </Card>
          </TabsContent>
           <TabsContent value="stock-alerts">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    No stock alerts.
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>

      {medicationToEdit && (
        <EditMedicationDialog
          medication={medicationToEdit}
          onSave={handleUpdateMedication}
          open={!!medicationToEdit}
          onOpenChange={(isOpen) => !isOpen && setMedicationToEdit(null)}
        />
      )}

      <AlertDialog open={!!medicationToDelete} onOpenChange={(isOpen) => !isOpen && setMedicationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the medication
              "{medicationToDelete?.name}" from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMedication}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ViewPrescriptionDialog
        prescription={prescriptionToView}
        open={!!prescriptionToView}
        onOpenChange={(isOpen) => !isOpen && setPrescriptionToView(null)}
      />

    </DashboardLayout>
  );
}
