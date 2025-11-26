
'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEGP } from '@/lib/currency';
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
  Package,
  Loader2,
  MoreHorizontal,
  Sparkles,
  Activity,
  PillBottle,
} from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewPrescriptionDialog } from "@/components/pharmacy/new-prescription-dialog";
import { AddMedicationDialog } from "@/components/pharmacy/add-medication-dialog";
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditMedicationDialog } from '@/components/pharmacy/edit-medication-dialog';
import { ViewPrescriptionDialog } from '@/components/pharmacy/view-prescription-dialog';
import { listDocuments, setDocument, deleteDocument, updateDocument } from '@/lib/data-client';

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

// Minimal inventory type used on this page
type InventoryItem = {
  id?: string;
  name: string;
  status: string;
  expires?: string;
  category?: string;
  stock?: number;
  min?: number;
  max?: number;
  unitCost?: string | number;
  supplier?: string;
  location?: string;
};

// Incoming payloads from dialogs
type MedicationInput = {
  name: string;
  category?: string;
  form?: string;
  strength?: string;
  stock: number;
  unitPrice: number | string;
  expiryDate?: Date | string;
};

type NewPrescriptionPayload = {
  patient: string;
  medication: string;
  strength?: string;
  dosage?: string;
  instructions?: string;
  refills: number;
  doctor: string;
  date: Date | string;
};

const iconMap = {
  Pill,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
};

type IconKey = keyof typeof iconMap;


export default function PharmacyPage() {
  const { t, language, isRTL } = useLanguage();
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
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
    
    const { toast } = useToast();
    
    React.useEffect(() => {
        async function fetchData() {
            try {
        const [medicationData, prescriptionData, inventoryData] = await Promise.all([
          listDocuments<Medication>('medications'),
          listDocuments<Prescription>('prescriptions'),
          listDocuments<InventoryItem>('inventory'),
        ]);
                setMedications(medicationData);
                setPrescriptions(prescriptionData);
                setInventory(inventoryData);
      } catch (error) {
        toast({ title: t('pharmacy.toast.error_fetching'), variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        }
        fetchData();
  }, [toast, t]);

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
      { title: t('pharmacy.total_medications'), value: totalMedications, icon: "Pill", description: t('pharmacy.different_types_medicine') },
      { title: t('pharmacy.low_stock'), value: lowStockMedications, icon: "AlertTriangle", description: t('pharmacy.needs_reordering'), valueClassName: "text-destructive" },
      { title: t('pharmacy.expiring_soon'), value: expiringSoon, icon: "CalendarClock", description: t('pharmacy.within_30_days'), valueClassName: "text-orange-500" },
      { title: t('pharmacy.prescriptions'), value: totalPrescriptions, icon: "ClipboardList", description: t('pharmacy.total_prescriptions_written') },
    ];
  }, [medications, prescriptions, t]);

  const handleSaveMedication = async (data: MedicationInput) => {
      try {
          const newMedication: Medication = {
            id: `MED-${Date.now()}`,
            name: data.name,
            fullName: data.name,
      strength: data.strength ?? '',
      form: data.form ?? '',
      category: data.category ?? '',
            stock: data.stock,
      unitPrice: `$${parseFloat(String(data.unitPrice)).toFixed(2)}`,
      expiryDate: data.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : 'N/A',
            status: data.stock > 20 ? 'In Stock' : 'Low Stock',
          };
          await setDocument('medications', newMedication.id, newMedication);
          setMedications(prev => [newMedication, ...prev]);
          toast({
            title: t('pharmacy.toast.medication_added'),
            description: t('pharmacy.toast.medication_added_desc'),
          });
      } catch(e) {
         toast({ title: t('pharmacy.toast.error_adding'), variant: 'destructive'});
      }
    };

    const handleUpdateMedication = async (updatedMedication: Medication) => {
      try {
          await updateDocument('medications', updatedMedication.id, updatedMedication);
          setMedications(prev => prev.map(med => med.id === updatedMedication.id ? updatedMedication : med));
          setMedicationToEdit(null);
          toast({
            title: t('pharmacy.toast.medication_updated'),
            description: t('pharmacy.toast.medication_updated_desc'),
          });
      } catch(e) {
          toast({ title: t('pharmacy.toast.error_updating'), variant: 'destructive'});
      }
    };

    const handleDeleteMedication = async () => {
      if (medicationToDelete) {
        try {
            await deleteDocument('medications', medicationToDelete.id);
            setMedications(prev => prev.filter(med => med.id !== medicationToDelete.id));
            toast({
              title: t('pharmacy.toast.medication_deleted'),
              description: t('pharmacy.toast.medication_deleted_desc'),
              variant: "destructive",
            });
            setMedicationToDelete(null);
        } catch(e) {
            toast({ title: t('pharmacy.toast.error_deleting'), variant: 'destructive'});
        }
      }
    };

    const createMedicationPurchaseOrder = async (medication: Medication) => {
      try {
        const orderQuantity = 100; // Standard reorder quantity
        const unitPrice = parseFloat(medication.unitPrice.replace(/[^\d.]/g, ''));
        const total = orderQuantity * unitPrice;

        const newPurchaseOrder = {
          supplier: 'PharmaPlus', // Default pharmaceutical supplier
          orderDate: new Date().toISOString().split('T')[0],
          deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days
          total: formatEGP(total, true, language),
          status: 'Pending',
          items: [{
            itemId: medication.id,
            description: `${medication.fullName} ${medication.strength}`,
            quantity: orderQuantity,
            unitPrice: unitPrice
          }]
        };

        await setDocument('purchase-orders', `PO-MED-${Date.now()}`, newPurchaseOrder);
        
        toast({
          title: t('pharmacy.toast.purchase_order_created'),
          description: t('pharmacy.toast.purchase_order_created_desc', { name: medication.name, count: orderQuantity }),
        });
      } catch (error) {
        toast({
          title: t('common.error'),
          description: t('pharmacy.toast.error_purchase_order_desc'),
          variant: "destructive",
        });
      }
    };

    const syncWithInventory = async (medication: Medication) => {
      try {
        // Check if medication exists in main inventory
        const existingInventoryItem = inventory.find((item) =>
          item.name?.toLowerCase().includes(medication.name.toLowerCase())
        );

        if (existingInventoryItem) {
          toast({
            title: t('pharmacy.toast.already_in_inventory'),
            description: t('pharmacy.toast.already_in_inventory_desc', { name: medication.name }),
          });
        } else {
          // Create new inventory item
          const newInventoryItem: InventoryItem = {
            name: medication.name,
            expires: medication.expiryDate,
            category: 'Medications',
            stock: medication.stock,
            min: 20,
            max: 100,
            status: medication.status,
            unitCost: medication.unitPrice,
            supplier: 'PharmaPlus',
            location: 'Pharmacy'
          };

          await setDocument('inventory', `INV-MED-${Date.now()}`, newInventoryItem);
          
          toast({
            title: t('pharmacy.toast.added_to_inventory'),
            description: t('pharmacy.toast.added_to_inventory_desc', { name: medication.name }),
          });
        }
      } catch (error) {
        toast({
          title: t('common.error'),
          description: t('pharmacy.toast.error_inventory_sync_desc'),
          variant: "destructive",
        });
      }
    };
    
  const handleSavePrescription = async (data: NewPrescriptionPayload) => {
        try {
            const newPrescription: Prescription = {
              id: `RX-${Date.now()}`,
              patient: data.patient,
        medication: data.medication,
        strength: data.strength ?? '',
        dosage: data.instructions ?? '',
              duration: 'As directed',
              refills: data.refills,
              doctor: data.doctor,
        date: new Date(data.date).toLocaleDateString(),
              status: 'Active',
            };
            await setDocument('prescriptions', newPrescription.id, newPrescription);
            setPrescriptions(prev => [newPrescription, ...prev]);
            toast({
              title: t('pharmacy.toast.prescription_created'),
              description: t('pharmacy.toast.prescription_created_desc'),
            });
        } catch(e) {
            toast({ title: t('pharmacy.toast.error_creating_prescription'), variant: 'destructive'});
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
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/30 via-green-200/20 to-teal-200/10 dark:from-emerald-900/15 dark:via-green-900/10 dark:to-teal-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-rose-200/30 via-pink-200/20 to-red-200/10 dark:from-rose-900/15 dark:via-pink-900/10 dark:to-red-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Enhanced Pharmacy Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-green-500/5 to-teal-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-xl">
                    <Activity className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent animate-gradient">
                    {t('pharmacy.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('page.pharmacy.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <NewPrescriptionDialog onSave={handleSavePrescription} medications={medications} />
                <AddMedicationDialog onSave={handleSaveMedication} />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Pharmacy Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {pharmacyPageStats.map((stat, index) => {
            const Icon = iconMap[stat.icon as IconKey];
            const cardStyles = [
              'metric-card-blue',
              'metric-card-green', 
              'metric-card-orange',
              'metric-card-purple'
            ];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl transition-all duration-500",
                  cardStyle
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <CardIcon 
                    variant={(['blue', 'green', 'orange', 'purple'] as const)[index % 4]}
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </CardIcon>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Elite Pharmacy Tabs */}
        <Tabs defaultValue="medications">
          <TabsList className="bg-background/60 backdrop-blur-sm border border-border/50 p-1 rounded-xl">
            <TabsTrigger 
              value="medications" 
              className="rounded-lg px-6 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('pharmacy.medications')}
            </TabsTrigger>
            <TabsTrigger 
              value="prescriptions" 
              className="rounded-lg px-6 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('pharmacy.prescriptions')}
            </TabsTrigger>
            <TabsTrigger 
              value="dispensing" 
              className="rounded-lg px-6 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('pharmacy.dispensing')}
            </TabsTrigger>
            <TabsTrigger 
              value="stock-alerts" 
              className="rounded-lg px-6 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('pharmacy.stock_alerts')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="medications" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>{t('pharmacy.medication_inventory')}</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search
                      className={cn(
                        "absolute top-2.5 h-4 w-4 text-muted-foreground",
                        isRTL ? 'right-2.5' : 'left-2.5'
                      )}
                    />
                    <Input
                      type="search"
                      placeholder={t('pharmacy.search_medications')}
                      className={cn(
                        "w-full rounded-lg bg-background lg:w-[336px]",
                        isRTL ? 'pr-8 pl-2 text-right' : 'pl-8 pr-2'
                      )}
                      value={medicationSearchTerm}
                      onChange={(e) => setMedicationSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={medicationCategoryFilter} onValueChange={setMedicationCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder={t('common.all_categories')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_categories')}</SelectItem>
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
                <Table
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className={cn(
                    isRTL
                      ? 'text-right [&_th]:text-right [&_td]:text-right'
                      : 'text-left [&_th]:text-left [&_td]:text-left'
                  )}
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pharmacy.medication')}</TableHead>
                      <TableHead>{t('pharmacy.form_strength')}</TableHead>
                      <TableHead>{t('pharmacy.category')}</TableHead>
                      <TableHead>{t('pharmacy.stock_level')}</TableHead>
                      <TableHead>{t('pharmacy.unit_price')}</TableHead>
                      <TableHead>{t('pharmacy.expiry_date')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('common.actions')}</TableHead>
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
                          <TableCell>{item.expiryDate !== 'N/A' ? new Date(item.expiryDate).toLocaleDateString(language) : t('common.na')}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.status === "Low Stock"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {item.status === 'In Stock' && t('pharmacy.status.in_stock')}
                              {item.status === 'Low Stock' && t('pharmacy.status.low_stock')}
                              {item.status === 'Out of Stock' && t('pharmacy.status.out_of_stock')}
                            </Badge>
                          </TableCell>
                          <TableCell className={cn(isRTL ? 'text-left' : 'text-right')}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">{t('common.actions')}</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem onClick={() => setMedicationToEdit(item)}>
                                  <Pencil className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('common.edit')}
                                </DropdownMenuItem>
                                {(item.status === 'Low Stock' || item.status === 'Out of Stock') && (
                                  <DropdownMenuItem onClick={() => createMedicationPurchaseOrder(item)}>
                                    <ShoppingCart className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                    {t('pharmacy.actions.reorder')}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => syncWithInventory(item)}>
                                  <Package className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('pharmacy.actions.add_to_inventory')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast({
                                  title: t('pharmacy.toast.prescription_history'),
                                  description: t('pharmacy.toast.prescription_history_desc', { name: item.name })
                                })}>
                                  <ClipboardList className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('pharmacy.actions.prescription_history')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setMedicationToDelete(item)} className="text-destructive">
                                  <Trash2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('common.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          {t('pharmacy.no_medications_found')}
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
                <CardTitle>{t('pharmacy.prescription_records')}</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search
                      className={cn(
                        "absolute top-2.5 h-4 w-4 text-muted-foreground",
                        isRTL ? 'right-2.5' : 'left-2.5'
                      )}
                    />
                    <Input
                      type="search"
                      placeholder={t('pharmacy.search_prescriptions')}
                      className={cn(
                        "w-full rounded-lg bg-background lg:w-[336px]",
                        isRTL ? 'pr-8 pl-2 text-right' : 'pl-8 pr-2'
                      )}
                      value={prescriptionSearchTerm}
                      onChange={e => setPrescriptionSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={prescriptionStatusFilter} onValueChange={setPrescriptionStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder={t('common.all_status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_status')}</SelectItem>
                      <SelectItem value="active">{t('common.active')}</SelectItem>
                      <SelectItem value="completed">{t('common.completed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className={cn(
                    isRTL
                      ? 'text-right [&_th]:text-right [&_td]:text-right'
                      : 'text-left [&_th]:text-left [&_td]:text-left'
                  )}
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pharmacy.prescription_id')}</TableHead>
                      <TableHead>{t('common.patient')}</TableHead>
                      <TableHead>{t('pharmacy.medication')}</TableHead>
                      <TableHead>{t('pharmacy.dosage_instructions')}</TableHead>
                      <TableHead>{t('common.doctor')}</TableHead>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('common.actions')}</TableHead>
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
                                {t('pharmacy.refills')}: {record.refills}
                            </div>
                            </TableCell>
                            <TableCell>{record.doctor}</TableCell>
                            <TableCell>{new Date(record.date).toLocaleDateString(language)}</TableCell>
                            <TableCell>
                            <Badge
                                variant={record.status === 'Active' ? 'default' : 'outline'}
                                className={cn(
                                    record.status === 'Active' && 'bg-foreground text-background hover:bg-foreground/80',
                                    record.status === 'Completed' && 'bg-green-100 text-green-800 border-transparent'
                                )}
                            >
                                {record.status === 'Active'
                                  ? <Clock className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />
                                  : <CheckCircle2 className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                                {record.status}
                            </Badge>
                            </TableCell>
                            <TableCell className={cn(isRTL ? 'text-left' : 'text-right')}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">{t('common.actions')}</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem onClick={() => setPrescriptionToView(record)}>
                                  <Eye className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('common.view')}
                                </DropdownMenuItem>
                                {record.status === 'Active' && (
                                  <DropdownMenuItem>
                                    <Send className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                    {t('pharmacy.actions.send_to_patient')}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Download className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('pharmacy.actions.download_pdf')}
                                </DropdownMenuItem>
                                {record.status === 'Active' && (
                                  <DropdownMenuItem>
                                    <CheckCircle2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                    {t('pharmacy.actions.mark_as_completed')}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                            {t('pharmacy.no_prescriptions_found')}
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
                    {t('pharmacy.no_dispensing_records')}
                </CardContent>
             </Card>
          </TabsContent>
           <TabsContent value="stock-alerts">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    {t('pharmacy.no_stock_alerts')}
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
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('pharmacy.confirm_delete_medication_desc', { name: medicationToDelete?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMedication}>{t('common.delete')}</AlertDialogAction>
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
