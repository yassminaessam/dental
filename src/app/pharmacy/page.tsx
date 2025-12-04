
'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
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
import { DispenseMedicationDialog } from '@/components/pharmacy/dispense-medication-dialog';
import { PrescriptionHistoryDialog } from '@/components/pharmacy/prescription-history-dialog';
import { NewPurchaseOrderDialog } from '@/components/suppliers/new-purchase-order-dialog';
import { AddItemDialog } from '@/components/inventory/add-item-dialog';
import type { NewPrescriptionPayload } from '@/components/pharmacy/new-prescription-dialog';
import type { Patient, StaffMember } from '@/lib/types';
import type { Supplier, SupplierStatus } from '@/app/suppliers/page';

export type Medication = {
  id: string;
  name: string;
  fullName?: string;
  strength?: string;
  form?: string;
  category?: string;
  stock: number;
  unitPrice: number;
  expiryDate?: string | null;
  status: 'InStock' | 'LowStock' | 'OutOfStock';
};

export type Prescription = {
  id: string;
  patientId?: string;
  patientName: string;
  doctorId?: string;
  doctorName: string;
  medicationName: string;
  medicationId?: string;
  strength?: string;
  dosage?: string;
  instructions?: string;
  duration?: string;
  refills: number;
  status: 'Active' | 'Completed';
  invoiceId?: string;
  treatmentId?: string;
  dispensedAt?: string;
  dispensedQuantity?: number;
  totalAmount?: number;
  createdAt?: string;
};

// Minimal inventory type used on this page
type InventoryItem = {
  id: string;
  name: string;
  status: 'Normal' | 'LowStock' | 'OutOfStock';
  expires?: string | null;
  category?: string | null;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitCost: number;
  supplierName?: string | null;
  location?: string | null;
};

// Dispense record type
type DispenseRecord = {
  id: string;
  prescriptionId?: string;
  medicationId?: string;
  medicationName?: string;
  patientId?: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  invoiceId?: string;
  treatmentId?: string;
  notes?: string;
  dispensedBy: string;
  dispensedAt: string;
  createdAt?: string;
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

const iconMap = {
  Pill,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
};

type IconKey = keyof typeof iconMap;

const resolveMedicationStatus = (stock: number): Medication['status'] => {
  if (stock <= 0) return 'OutOfStock';
  if (stock <= 20) return 'LowStock';
  return 'InStock';
};

const formatMedicationStatusLabel = (status: Medication['status']) => {
  switch (status) {
    case 'OutOfStock':
      return 'Out of Stock';
    case 'LowStock':
      return 'Low Stock';
    default:
      return 'In Stock';
  }
};

const medicationStatusVariant = (status: Medication['status']): 'destructive' | 'secondary' | 'default' => {
  if (status === 'OutOfStock') return 'destructive';
  if (status === 'LowStock') return 'secondary';
  return 'default';
};

const mapMedicationStatusToInventory = (status: Medication['status']): InventoryItem['status'] => {
  if (status === 'OutOfStock') return 'OutOfStock';
  if (status === 'LowStock') return 'LowStock';
  return 'Normal';
};

const mapMedicationResponse = (row: any): Medication => ({
  id: row.id,
  name: row.name,
  fullName: row.fullName ?? row.name,
  strength: row.strength ?? '',
  form: row.form ?? '',
  category: row.category ?? '',
  stock: row.stock ?? 0,
  unitPrice: Number(row.unitPrice ?? 0),
  expiryDate: row.expiryDate ?? null,
  status: row.status ?? resolveMedicationStatus(row.stock ?? 0),
});

const mapPrescriptionResponse = (row: any): Prescription => ({
  id: row.id,
  patientId: row.patientId ?? undefined,
  patientName: row.patientName ?? row.patient ?? '',
  doctorId: row.doctorId ?? undefined,
  doctorName: row.doctorName ?? row.doctor ?? '',
  medicationId: row.medicationId ?? undefined,
  medicationName: row.medicationName ?? row.medication ?? '',
  strength: row.strength ?? '',
  dosage: row.dosage ?? '',
  instructions: row.instructions ?? '',
  duration: row.duration ?? 'As directed',
  refills: row.refills ?? 0,
  status: row.status ?? 'Active',
  invoiceId: row.invoiceId ?? undefined,
  treatmentId: row.treatmentId ?? undefined,
  dispensedAt: row.dispensedAt ?? undefined,
  dispensedQuantity: row.dispensedQuantity ?? undefined,
  totalAmount: row.totalAmount != null ? Number(row.totalAmount) : undefined,
  createdAt: row.createdAt ?? row.date ?? undefined,
});

const mapInventoryResponse = (row: any): InventoryItem => ({
  id: row.id,
  name: row.name,
  status: row.status ?? 'Normal',
  expires: row.expires ?? null,
  category: row.category ?? null,
  quantity: row.quantity ?? row.stock ?? 0,
  minQuantity: row.minQuantity ?? row.min ?? 0,
  maxQuantity: row.maxQuantity ?? row.max ?? 0,
  unitCost: Number(row.unitCost ?? 0),
  supplierName: row.supplierName ?? row.supplier ?? null,
  location: row.location ?? null,
});

const mapDispenseResponse = (row: any): DispenseRecord => ({
  id: row.id,
  prescriptionId: row.prescriptionId ?? undefined,
  medicationId: row.medicationId ?? undefined,
  medicationName: row.medicationName ?? '',
  patientId: row.patientId ?? undefined,
  patientName: row.patientName ?? '',
  doctorId: row.doctorId ?? undefined,
  doctorName: row.doctorName ?? '',
  quantity: row.quantity ?? 0,
  unitPrice: Number(row.unitPrice ?? 0),
  totalAmount: Number(row.totalAmount ?? 0),
  invoiceId: row.invoiceId ?? undefined,
  treatmentId: row.treatmentId ?? undefined,
  notes: row.notes ?? undefined,
  dispensedBy: row.dispensedBy ?? '',
  dispensedAt: row.dispensedAt ?? row.createdAt ?? new Date().toISOString(),
  createdAt: row.createdAt ?? undefined,
});

const parseCurrencyValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const numeric = parseFloat(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};


export default function PharmacyPage() {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
    const [medications, setMedications] = React.useState<Medication[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [medicationToEdit, setMedicationToEdit] = React.useState<Medication | null>(null);
    const [medicationToDelete, setMedicationToDelete] = React.useState<Medication | null>(null);
    const [medicationSearchTerm, setMedicationSearchTerm] = React.useState('');
    const [medicationCategoryFilter, setMedicationCategoryFilter] = React.useState('all');
    
    const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([]);
    const [prescriptionToView, setPrescriptionToView] = React.useState<Prescription | null>(null);
    const [prescriptionToDispense, setPrescriptionToDispense] = React.useState<Prescription | null>(null);
    const [medicationForDispense, setMedicationForDispense] = React.useState<Medication | null>(null);
    const [isDispenseLoading, setIsDispenseLoading] = React.useState(false);
    const [prescriptionSearchTerm, setPrescriptionSearchTerm] = React.useState('');
    const [prescriptionStatusFilter, setPrescriptionStatusFilter] = React.useState('all');
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [patientsDirectory, setPatientsDirectory] = React.useState<Patient[]>([]);
  const [doctorsDirectory, setDoctorsDirectory] = React.useState<StaffMember[]>([]);
  
  // New states for Reorder, Prescription History, and Stock Alerts
  const [medicationForHistory, setMedicationForHistory] = React.useState<Medication | null>(null);
  const [medicationToReorder, setMedicationToReorder] = React.useState<Medication | null>(null);
  const [isNewPoOpen, setIsNewPoOpen] = React.useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = React.useState(false);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  
  // Dispensing tab states
  const [dispenses, setDispenses] = React.useState<DispenseRecord[]>([]);
  const [dispenseSearchTerm, setDispenseSearchTerm] = React.useState('');
  const [dispenseDateFilter, setDispenseDateFilter] = React.useState<'all' | 'today' | 'week' | 'month'>('all');
    
    const { toast } = useToast();
    
    React.useEffect(() => {
        async function fetchData() {
            try {
        const [medicationsRes, prescriptionsRes, inventoryRes, suppliersRes, dispensesRes] = await Promise.all([
          fetch('/api/pharmacy/medications'),
          fetch('/api/pharmacy/prescriptions'),
          fetch('/api/inventory'),
          fetch('/api/suppliers'),
          fetch('/api/pharmacy/dispenses'),
        ]);
        const medicationsPayload = medicationsRes.ok ? await medicationsRes.json().catch(() => ({})) : {};
        const prescriptionsPayload = prescriptionsRes.ok ? await prescriptionsRes.json().catch(() => ({})) : {};
        const inventoryPayload = inventoryRes.ok ? await inventoryRes.json().catch(() => ({})) : {};
        const suppliersPayload = suppliersRes.ok ? await suppliersRes.json().catch(() => ({})) : {};
        const dispensesPayload = dispensesRes.ok ? await dispensesRes.json().catch(() => ({})) : {};
        const medicationData = Array.isArray(medicationsPayload?.medications)
          ? medicationsPayload.medications.map(mapMedicationResponse)
          : [];
        const prescriptionData = Array.isArray(prescriptionsPayload?.prescriptions)
          ? prescriptionsPayload.prescriptions.map(mapPrescriptionResponse)
          : [];
        const inventoryData = Array.isArray(inventoryPayload?.items)
          ? inventoryPayload.items.map(mapInventoryResponse)
          : [];
        const suppliersData: Supplier[] = Array.isArray(suppliersPayload?.suppliers)
          ? suppliersPayload.suppliers.map((s: any) => ({
              id: s.id,
              name: s.name,
              status: (s.status as SupplierStatus) ?? 'Active',
              address: s.address ?? null,
              phone: s.phone ?? null,
              email: s.email ?? null,
              category: s.category ?? null,
              paymentTerms: s.paymentTerms ?? null,
              rating: s.rating ?? null,
            }))
          : [];
        const dispensesData = Array.isArray(dispensesPayload?.dispenses)
          ? dispensesPayload.dispenses.map(mapDispenseResponse)
          : [];
                setMedications(medicationData);
                setPrescriptions(prescriptionData);
                setInventory(inventoryData);
                setSuppliers(suppliersData);
                setDispenses(dispensesData);
      } catch (error) {
        toast({ title: t('pharmacy.toast.error_fetching'), variant: 'destructive'});
            } finally {
                setLoading(false);
            }
        }
        fetchData();
  }, [toast, t]);

  React.useEffect(() => {
    async function fetchDirectories() {
      try {
        const res = await fetch('/api/patients');
        if (res.ok) {
          const data = await res.json();
          setPatientsDirectory(Array.isArray(data?.patients) ? data.patients : []);
        }
      } catch (error) {
        console.error('[PharmacyPage] fetch patients error', error);
      }

      try {
        const res = await fetch('/api/doctors');
        if (res.ok) {
          const data = await res.json();
          setDoctorsDirectory(Array.isArray(data?.doctors) ? data.doctors : []);
        }
      } catch (error) {
        console.error('[PharmacyPage] fetch doctors error', error);
      }
    }

    fetchDirectories();
  }, []);

  const findPatientRecord = React.useCallback(
    (id?: string, displayName?: string) => {
      if (id) {
        const byId = patientsDirectory.find((patient) => patient.id === id);
        if (byId) return byId;
      }
      if (displayName) {
        const target = displayName.trim().toLowerCase();
        return patientsDirectory.find((patient) => {
          const fullName = `${patient.name} ${patient.lastName ?? ''}`.trim().toLowerCase();
          return fullName === target || patient.name.trim().toLowerCase() === target;
        });
      }
      return undefined;
    },
    [patientsDirectory]
  );

  const findDoctorRecord = React.useCallback(
    (id?: string, displayName?: string) => {
      if (id) {
        const byId = doctorsDirectory.find((doctor) => doctor.id === id);
        if (byId) return byId;
      }
      if (displayName) {
        const target = displayName.trim().toLowerCase();
        return doctorsDirectory.find((doctor) => doctor.name.trim().toLowerCase() === target);
      }
      return undefined;
    },
    [doctorsDirectory]
  );

    const medicationCategories = React.useMemo(() => {
        return [...new Set(medications.map((i) => i.category).filter((cat): cat is string => !!cat))];
    }, [medications]);

    const pharmacyPageStats = React.useMemo(() => {
        const totalMedications = medications.length;
        const totalPrescriptions = prescriptions.length;
        const lowStockMedications = medications.filter(m => m.status === 'LowStock' || m.status === 'OutOfStock').length;
        const expiringSoon = medications.filter(m => {
            if (!m.expiryDate) return false;
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
          const response = await fetch('/api/pharmacy/medications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.name,
              fullName: data.name,
              strength: data.strength,
              form: data.form,
              category: data.category,
              stock: data.stock,
              unitPrice: typeof data.unitPrice === 'number' ? data.unitPrice : parseFloat(String(data.unitPrice)),
              expiryDate: data.expiryDate ? (typeof data.expiryDate === 'string' ? data.expiryDate : data.expiryDate.toISOString()) : undefined,
            }),
          });
          if (!response.ok) throw new Error('Failed to create medication');
          const payload = await response.json();
          const createdMedication = payload?.medication ? mapMedicationResponse(payload.medication) : null;
          if (createdMedication) {
            setMedications(prev => [createdMedication, ...prev]);
          }
          toast({
            title: t('pharmacy.toast.medication_added'),
            description: t('pharmacy.toast.medication_added_desc'),
          });
      } catch(e) {
         toast({ title: t('pharmacy.toast.error_adding'), variant: 'destructive'});
      }
    };

  const openDispenseDialog = React.useCallback((record: Prescription) => {
    const medicationMatch = medications.find((med) => (
      med.id === record.medicationId || med.name.trim().toLowerCase() === record.medicationName.trim().toLowerCase()
    ));

    if (!medicationMatch) {
      toast({ title: t('common.error'), description: t('pharmacy.toast.error_dispensing'), variant: 'destructive' });
      return;
    }

    setPrescriptionToDispense(record);
    setMedicationForDispense(medicationMatch);
  }, [medications, t, toast]);

  const handleDispenseMedication = React.useCallback(async (input: { quantity: number; unitPrice?: number; notes?: string }) => {
    if (!prescriptionToDispense || !medicationForDispense) return;

    const currentStock = medicationForDispense.stock;
    if (input.quantity <= 0 || input.quantity > currentStock) {
      toast({ title: t('common.error'), description: t('inventory.validation.transfer_quantity_max', { max: currentStock }), variant: 'destructive' });
      return;
    }

    const patientRecord = findPatientRecord(prescriptionToDispense.patientId, prescriptionToDispense.patientName);
    if (!patientRecord) {
      toast({ title: t('common.error'), description: t('pharmacy.toast.missing_patient'), variant: 'destructive' });
      return;
    }

    const doctorRecord = findDoctorRecord(prescriptionToDispense.doctorId, prescriptionToDispense.doctorName);
    if (!doctorRecord) {
      toast({ title: t('common.error'), description: t('pharmacy.toast.missing_doctor'), variant: 'destructive' });
      return;
    }

    const parsedUnitPrice = input.unitPrice ?? parseCurrencyValue(medicationForDispense.unitPrice);
    const unitPrice = Number(parsedUnitPrice.toFixed(2));
    const totalAmount = unitPrice * input.quantity;
    const patientName = `${patientRecord.name} ${patientRecord.lastName ?? ''}`.trim() || prescriptionToDispense.patientName;

    setIsDispenseLoading(true);

    try {
      const treatmentResponse = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patientRecord.id,
          patientName,
          doctorId: doctorRecord.id,
          doctorName: doctorRecord.name,
          procedure: `${medicationForDispense.name} - Pharmacy Dispense`,
          cost: formatEGP(totalAmount, true, language),
          notes: input.notes ?? `Prescription ${prescriptionToDispense.id}`,
          status: 'Completed',
          appointments: [],
        }),
      });

      if (!treatmentResponse.ok) {
        throw new Error('Failed to create treatment');
      }

      const treatmentPayload = await treatmentResponse.json().catch(() => ({}));
      const treatmentId: string | undefined = treatmentPayload?.treatment?.id;

      const invoiceResponse = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: `INV-RX-${Date.now()}`,
          patientId: patientRecord.id,
          patientNameSnapshot: patientName,
          patientPhoneSnapshot: patientRecord.phone,
          treatmentId,
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Sent',
          notes: input.notes ?? `Prescription ${prescriptionToDispense.id}`,
          items: [
            {
              description: `${medicationForDispense.name} (${prescriptionToDispense.dosage || t('common.na')})`,
              quantity: input.quantity,
              unitPrice,
            },
          ],
        }),
      });

      if (!invoiceResponse.ok) {
        throw new Error('Failed to create invoice');
      }

      const invoicePayload = await invoiceResponse.json().catch(() => ({}));
      const invoiceId: string | undefined = invoicePayload?.invoice?.id;

      const nextStock = currentStock - input.quantity;
      const medicationResponse = await fetch(`/api/pharmacy/medications/${medicationForDispense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: nextStock,
          status: resolveMedicationStatus(nextStock),
        }),
      });
      if (!medicationResponse.ok) throw new Error('Failed to update medication stock');
      const medicationPayload = await medicationResponse.json();
      const updatedMedication = medicationPayload?.medication
        ? mapMedicationResponse(medicationPayload.medication)
        : { ...medicationForDispense, stock: nextStock, status: resolveMedicationStatus(nextStock) };
      setMedications((prev) => prev.map((med) => (med.id === updatedMedication.id ? updatedMedication : med)));

      const dispenseResponse = await fetch('/api/pharmacy/dispenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptionId: prescriptionToDispense.id,
          patientId: patientRecord.id,
          patientName,
          doctorId: doctorRecord.id,
          doctorName: doctorRecord.name,
          medicationId: medicationForDispense.id,
          quantity: input.quantity,
          unitPrice,
          totalAmount,
          invoiceId,
          treatmentId,
          notes: input.notes ?? '',
          dispensedAt: new Date().toISOString(),
          dispensedBy: user ? `${user.firstName} ${user.lastName}`.trim() : 'System',
        }),
      });
      if (!dispenseResponse.ok) throw new Error('Failed to record dispense');

      const prescriptionResponse = await fetch(`/api/pharmacy/prescriptions/${prescriptionToDispense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Completed',
          invoiceId,
          treatmentId,
          dispensedAt: new Date().toISOString(),
          dispensedQuantity: input.quantity,
          totalAmount,
        }),
      });
      if (!prescriptionResponse.ok) throw new Error('Failed to update prescription');
      const prescriptionPayload = await prescriptionResponse.json();
      const updatedPrescription = prescriptionPayload?.prescription
        ? mapPrescriptionResponse(prescriptionPayload.prescription)
        : {
            ...prescriptionToDispense,
            status: 'Completed' as const,
            invoiceId,
            treatmentId,
            dispensedAt: new Date().toISOString(),
            dispensedQuantity: input.quantity,
            totalAmount,
          };

      setPrescriptions((prev) => prev.map((record) => (record.id === updatedPrescription.id ? updatedPrescription : record)));

      toast({
        title: t('pharmacy.toast.dispensed'),
        description: t('pharmacy.toast.dispensed_desc', { name: medicationForDispense.name, patient: patientName }),
      });

      setPrescriptionToDispense(null);
      setMedicationForDispense(null);
    } catch (error) {
      console.error('[PharmacyPage] dispense error', error);
      toast({ title: t('common.error'), description: t('pharmacy.toast.error_dispensing'), variant: 'destructive' });
    } finally {
      setIsDispenseLoading(false);
    }
  }, [findDoctorRecord, findPatientRecord, formatEGP, language, medicationForDispense, prescriptionToDispense, t, toast, user]);

    const handleUpdateMedication = async (updatedMedication: Medication) => {
      try {
          const response = await fetch(`/api/pharmacy/medications/${updatedMedication.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: updatedMedication.name,
              fullName: updatedMedication.fullName,
              category: updatedMedication.category,
              form: updatedMedication.form,
              strength: updatedMedication.strength,
              stock: updatedMedication.stock,
              unitPrice: updatedMedication.unitPrice,
              expiryDate: updatedMedication.expiryDate,
              status: updatedMedication.status,
            }),
          });
          if (!response.ok) throw new Error('Failed to update medication');
          const payload = await response.json();
          const nextMedication = payload?.medication ? mapMedicationResponse(payload.medication) : updatedMedication;
          setMedications(prev => prev.map(med => med.id === nextMedication.id ? nextMedication : med));
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
            const response = await fetch(`/api/pharmacy/medications/${medicationToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
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

    // Open Reorder dialog with medication pre-filled
    const openReorderDialog = React.useCallback((medication: Medication) => {
      setMedicationToReorder(medication);
      setIsNewPoOpen(true);
    }, []);

    // Inventory options for purchase order dialog (medications + inventory items)
    const inventoryOptions = React.useMemo(() => {
      const medOptions = medications.map((m) => ({ id: m.id, name: `${m.name} ${m.strength || ''}`.trim() }));
      const invOptions = inventory.map((i) => ({ id: i.id, name: i.name }));
      // Combine and deduplicate
      const combined = [...medOptions];
      invOptions.forEach((inv) => {
        if (!combined.find((c) => c.id === inv.id)) {
          combined.push(inv);
        }
      });
      return combined;
    }, [medications, inventory]);

    // Initial items for purchase order when reordering a medication
    const initialPoItems = React.useMemo(() => {
      if (!medicationToReorder) return undefined;
      return [{
        itemId: medicationToReorder.id,
        itemName: `${medicationToReorder.name} ${medicationToReorder.strength || ''}`.trim(),
        quantity: 100, // Default reorder quantity
        unitPrice: medicationToReorder.unitPrice,
      }];
    }, [medicationToReorder]);

    // Handle saving a new purchase order
    const handleSavePurchaseOrder = async (data: any) => {
      try {
        const total = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
        const response = await fetch('/api/purchase-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            supplierId: data.supplierId,
            supplierName: data.supplierName,
            orderDate: data.orderDate,
            expectedDelivery: data.deliveryDate,
            total,
            status: 'Pending',
            items: data.items,
          }),
        });
        if (!response.ok) throw new Error('Failed to create purchase order');
        
        toast({
          title: t('pharmacy.purchase_order_created'),
          description: t('pharmacy.toast.purchase_order_created_desc', { 
            name: medicationToReorder?.name || 'Item', 
            count: data.items[0]?.quantity || 0 
          }),
        });
        setMedicationToReorder(null);
      } catch (error) {
        toast({
          title: t('common.error'),
          description: t('pharmacy.toast.error_purchase_order_desc'),
          variant: "destructive",
        });
      }
    };

    // Handle saving a new inventory item from AddItemDialog
    const handleSaveInventoryItem = async (data: any) => {
      try {
        const response = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            category: data.category,
            supplierId: data.supplierId,
            supplierName: data.supplierName,
            quantity: data.stock,
            minQuantity: 10,
            maxQuantity: 50,
            unitCost: data.unitCost,
            status: 'Normal',
            expires: data.expires ? data.expires.toISOString() : undefined,
            location: data.location,
          }),
        });
        if (!response.ok) throw new Error('Failed to create inventory item');
        const result = await response.json();
        if (result?.item) {
          setInventory((prev) => [mapInventoryResponse(result.item), ...prev]);
        }
        toast({
          title: t('inventory.toast.item_added'),
          description: t('inventory.toast.item_added_desc'),
        });
      } catch (error) {
        toast({ title: t('inventory.toast.error_adding'), variant: 'destructive' });
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
          const response = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: medication.name,
              category: 'Medications',
              quantity: medication.stock,
              minQuantity: 20,
              maxQuantity: 100,
              unitCost: medication.unitPrice,
              status: mapMedicationStatusToInventory(medication.status),
              expires: medication.expiryDate ?? undefined,
              supplierName: 'PharmaPlus',
              location: 'Pharmacy',
            }),
          });
          if (!response.ok) throw new Error('Failed to sync inventory');
          const payload = await response.json();
          if (payload?.item) {
            setInventory((prev) => [mapInventoryResponse(payload.item), ...prev]);
          }
          
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
            const response = await fetch('/api/pharmacy/prescriptions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                patientId: data.patientId,
                patientName: data.patientName,
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                medicationId: data.medicationId,
                medicationName: data.medicationName,
                strength: data.strength,
                dosage: data.dosage,
                instructions: data.instructions,
                refills: data.refills,
              date: data.date.toISOString(),
                duration: 'As directed',
              }),
            });
            if (!response.ok) throw new Error('Failed to create prescription');
            const payload = await response.json();
            const createdPrescription = payload?.prescription ? mapPrescriptionResponse(payload.prescription) : null;
            if (createdPrescription) {
              setPrescriptions(prev => [createdPrescription, ...prev]);
            }
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
            p.patientName.toLowerCase().includes(prescriptionSearchTerm.toLowerCase()) ||
            p.medicationName.toLowerCase().includes(prescriptionSearchTerm.toLowerCase())
          )
          .filter(p => prescriptionStatusFilter === 'all' || p.status.toLowerCase() === prescriptionStatusFilter);
      }, [prescriptions, prescriptionSearchTerm, prescriptionStatusFilter]);

    // Filter dispenses based on search and date
    const filteredDispenses = React.useMemo(() => {
      let result = dispenses;
      
      // Apply search filter
      if (dispenseSearchTerm.trim()) {
        const query = dispenseSearchTerm.toLowerCase().trim();
        result = result.filter(d =>
          d.patientName?.toLowerCase().includes(query) ||
          d.medicationName?.toLowerCase().includes(query) ||
          d.doctorName?.toLowerCase().includes(query) ||
          d.dispensedBy?.toLowerCase().includes(query)
        );
      }
      
      // Apply date filter
      if (dispenseDateFilter !== 'all') {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        result = result.filter(d => {
          const dispenseDate = new Date(d.dispensedAt);
          switch (dispenseDateFilter) {
            case 'today':
              return dispenseDate >= startOfToday;
            case 'week': {
              const weekAgo = new Date(startOfToday);
              weekAgo.setDate(weekAgo.getDate() - 7);
              return dispenseDate >= weekAgo;
            }
            case 'month': {
              const monthAgo = new Date(startOfToday);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return dispenseDate >= monthAgo;
            }
            default:
              return true;
          }
        });
      }
      
      return result;
    }, [dispenses, dispenseSearchTerm, dispenseDateFilter]);

    // Dispense stats
    const dispenseStats = React.useMemo(() => {
      const total = dispenses.length;
      const totalQuantity = dispenses.reduce((sum, d) => sum + d.quantity, 0);
      const totalRevenue = dispenses.reduce((sum, d) => sum + d.totalAmount, 0);
      const todayCount = dispenses.filter(d => {
        const today = new Date();
        const dispenseDate = new Date(d.dispensedAt);
        return dispenseDate.toDateString() === today.toDateString();
      }).length;
      return { total, totalQuantity, totalRevenue, todayCount };
    }, [dispenses]);

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
        <div className="grid gap-1.5 grid-cols-2 lg:grid-cols-4">
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
                  "relative overflow-hidden border-0 shadow-sm transition-all duration-500 min-h-0",
                  cardStyle
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-0.5 p-1.5 space-y-0">
                  <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide leading-tight">
                    {stat.title}
                  </CardTitle>
                  <CardIcon 
                    variant={(['blue', 'green', 'orange', 'purple'] as const)[index % 4]}
                    className="w-10 h-10"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </CardIcon>
                </CardHeader>
                
                <CardContent className="pt-0 p-1.5">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
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
              <div
                className={cn(
                  'font-medium flex items-center gap-2',
                  (item.status === 'LowStock' || item.status === 'OutOfStock') && 'text-destructive'
                )}
              >
                {item.stock}
                {(item.status === 'LowStock' || item.status === 'OutOfStock') && <AlertTriangle className="h-4 w-4" />}
                            </div>
                          </TableCell>
                          <TableCell>{formatEGP(item.unitPrice, true, language)}</TableCell>
                          <TableCell>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString(language) : t('common.na')}</TableCell>
                          <TableCell>
                            <Badge variant={medicationStatusVariant(item.status)}>
                              {formatMedicationStatusLabel(item.status)}
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
                                {(item.status === 'LowStock' || item.status === 'OutOfStock') && (
                                  <DropdownMenuItem onClick={() => openReorderDialog(item)}>
                                    <ShoppingCart className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                    {t('pharmacy.actions.reorder')}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => syncWithInventory(item)}>
                                  <Package className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                  {t('pharmacy.actions.add_to_inventory')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setMedicationForHistory(item)}>
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
                            <TableCell>{record.patientName}</TableCell>
                            <TableCell>
                            <div className="flex items-center gap-2">
                                <Pill className="h-4 w-4 text-muted-foreground" />
                                <div>
                                <div className="font-medium">{record.medicationName}</div>
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
                            <TableCell>{record.doctorName}</TableCell>
                            <TableCell>{record.createdAt ? new Date(record.createdAt).toLocaleDateString(language) : t('common.na')}</TableCell>
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
                                  <DropdownMenuItem onClick={() => openDispenseDialog(record)}>
                                    <PillBottle className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                    {t('pharmacy.actions.dispense')}
                                  </DropdownMenuItem>
                                )}
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
               <CardHeader className="pb-3">
                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                   <CardTitle className="flex items-center gap-2">
                     <Package className="h-5 w-5 text-primary" />
                     {t('pharmacy.dispensing_history')}
                   </CardTitle>
                   {/* Stats Summary */}
                   <div className="flex flex-wrap gap-3">
                     <div className="bg-muted/50 rounded-lg px-3 py-2 text-center min-w-[80px]">
                       <p className="text-lg font-bold">{dispenseStats.total}</p>
                       <p className="text-xs text-muted-foreground">{t('common.total')}</p>
                     </div>
                     <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg px-3 py-2 text-center min-w-[80px]">
                       <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{dispenseStats.todayCount}</p>
                       <p className="text-xs text-muted-foreground">{t('common.today')}</p>
                     </div>
                     <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg px-3 py-2 text-center min-w-[80px]">
                       <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{dispenseStats.totalQuantity}</p>
                       <p className="text-xs text-muted-foreground">{t('common.units')}</p>
                     </div>
                     <div className="bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2 text-center min-w-[80px]">
                       <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatEGP(dispenseStats.totalRevenue, true, language)}</p>
                       <p className="text-xs text-muted-foreground">{t('common.revenue')}</p>
                     </div>
                   </div>
                 </div>
               </CardHeader>
               <CardContent>
                 {/* Search and Filter Controls */}
                 <div className="flex flex-col sm:flex-row gap-3 mb-4">
                   <div className="relative flex-1">
                     <Search className={cn(
                       "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                       isRTL ? "right-3" : "left-3"
                     )} />
                     <Input
                       placeholder={t('pharmacy.search_dispenses_placeholder') || 'Search by patient, medication, doctor...'}
                       value={dispenseSearchTerm}
                       onChange={(e) => setDispenseSearchTerm(e.target.value)}
                       className={cn(isRTL ? "pr-10" : "pl-10")}
                     />
                   </div>
                   <Select value={dispenseDateFilter} onValueChange={(v) => setDispenseDateFilter(v as typeof dispenseDateFilter)}>
                     <SelectTrigger className="w-[160px]">
                       <CalendarClock className="h-4 w-4 mr-2" />
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">{t('common.all_time')}</SelectItem>
                       <SelectItem value="today">{t('common.today')}</SelectItem>
                       <SelectItem value="week">{t('common.this_week')}</SelectItem>
                       <SelectItem value="month">{t('common.this_month')}</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 {/* Dispenses Table */}
                 {loading ? (
                   <div className="flex items-center justify-center py-12">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   </div>
                 ) : filteredDispenses.length === 0 ? (
                   <div className="text-center py-12">
                     <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                     <p className="text-lg font-medium mb-1">
                       {dispenses.length === 0 ? t('pharmacy.no_dispensing_records') : t('common.no_results_found')}
                     </p>
                     <p className="text-sm text-muted-foreground">
                       {dispenses.length === 0 
                         ? t('pharmacy.no_dispensing_records_desc')
                         : t('pharmacy.try_different_search')
                       }
                     </p>
                   </div>
                 ) : (
                   <div className="rounded-lg border overflow-auto">
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead>{t('common.patient')}</TableHead>
                           <TableHead>{t('pharmacy.medication')}</TableHead>
                           <TableHead className="text-center">{t('pharmacy.quantity')}</TableHead>
                           <TableHead className="text-right">{t('common.unit_price')}</TableHead>
                           <TableHead className="text-right">{t('common.total')}</TableHead>
                           <TableHead>{t('pharmacy.dispensed_by')}</TableHead>
                           <TableHead>{t('common.date')}</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {filteredDispenses.map((record) => (
                           <TableRow key={record.id}>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950">
                                   <PillBottle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                 </div>
                                 <div>
                                   <p className="font-medium">{record.patientName}</p>
                                   {record.doctorName && (
                                     <p className="text-xs text-muted-foreground">{t('common.by')} {record.doctorName}</p>
                                   )}
                                 </div>
                               </div>
                             </TableCell>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <Pill className="h-4 w-4 text-muted-foreground" />
                                 <span className="font-medium">{record.medicationName || t('common.na')}</span>
                               </div>
                             </TableCell>
                             <TableCell className="text-center">
                               <Badge variant="secondary">{record.quantity}</Badge>
                             </TableCell>
                             <TableCell className="text-right font-medium">
                               {formatEGP(record.unitPrice, true, language)}
                             </TableCell>
                             <TableCell className="text-right">
                               <span className="font-bold text-green-600 dark:text-green-400">
                                 {formatEGP(record.totalAmount, true, language)}
                               </span>
                             </TableCell>
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 <CheckCircle2 className="h-4 w-4 text-green-500" />
                                 <span className="text-sm">{record.dispensedBy}</span>
                               </div>
                             </TableCell>
                             <TableCell>
                               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                 <CalendarClock className="h-4 w-4" />
                                 {new Date(record.dispensedAt).toLocaleDateString(language)}
                               </div>
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                     </Table>
                   </div>
                 )}
                 
                 {/* Results count when filtered */}
                 {(dispenseSearchTerm.trim() || dispenseDateFilter !== 'all') && filteredDispenses.length > 0 && (
                   <p className="text-sm text-muted-foreground mt-3">
                     {t('common.showing')} {filteredDispenses.length} {t('common.of')} {dispenses.length} {t('pharmacy.records')}
                   </p>
                 )}
               </CardContent>
             </Card>
          </TabsContent>
           <TabsContent value="stock-alerts">
             <div className="grid gap-6 md:grid-cols-2">
               {/* Low Stock Medications */}
               <Card className="border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50/50 via-background to-red-50/30 dark:from-orange-950/10 dark:via-background dark:to-red-950/5">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                     <AlertTriangle className="h-5 w-5" />
                     {t('pharmacy.low_stock_medications')}
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   {medications.filter(m => m.status === 'LowStock' || m.status === 'OutOfStock').length === 0 ? (
                     <div className="text-center py-8 text-muted-foreground">
                       <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                       <p>{t('pharmacy.no_stock_alerts')}</p>
                     </div>
                   ) : (
                     medications.filter(m => m.status === 'LowStock' || m.status === 'OutOfStock').map((med) => (
                       <div key={med.id} className="flex items-center justify-between p-3 rounded-lg bg-background border">
                         <div className="flex items-center gap-3">
                           <div className={cn(
                             "p-2 rounded-lg",
                             med.status === 'OutOfStock' ? 'bg-red-100 dark:bg-red-950' : 'bg-orange-100 dark:bg-orange-950'
                           )}>
                             <Pill className={cn(
                               "h-4 w-4",
                               med.status === 'OutOfStock' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
                             )} />
                           </div>
                           <div>
                             <p className="font-medium">{med.name}</p>
                             <p className="text-sm text-muted-foreground">
                               {t('pharmacy.stock_level')}: <span className={cn(
                                 "font-semibold",
                                 med.status === 'OutOfStock' ? 'text-red-600' : 'text-orange-600'
                               )}>{med.stock}</span>
                             </p>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                           <Badge variant={med.status === 'OutOfStock' ? 'destructive' : 'secondary'}>
                             {med.status === 'OutOfStock' ? t('pharmacy.out_of_stock') : t('pharmacy.low_stock')}
                           </Badge>
                           <Button size="sm" onClick={() => openReorderDialog(med)}>
                             <ShoppingCart className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                             {t('pharmacy.reorder_now')}
                           </Button>
                         </div>
                       </div>
                     ))
                   )}
                 </CardContent>
               </Card>

               {/* Expiring Medications */}
               <Card className="border-2 border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50/50 via-background to-yellow-50/30 dark:from-amber-950/10 dark:via-background dark:to-yellow-950/5">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                     <CalendarClock className="h-5 w-5" />
                     {t('pharmacy.expiring_medications')}
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   {medications.filter(m => {
                     if (!m.expiryDate) return false;
                     const expiry = new Date(m.expiryDate);
                     const today = new Date();
                     const ninetyDaysFromNow = new Date();
                     ninetyDaysFromNow.setDate(today.getDate() + 90);
                     return expiry <= ninetyDaysFromNow;
                   }).length === 0 ? (
                     <div className="text-center py-8 text-muted-foreground">
                       <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                       <p>{t('pharmacy.no_stock_alerts')}</p>
                     </div>
                   ) : (
                     medications.filter(m => {
                       if (!m.expiryDate) return false;
                       const expiry = new Date(m.expiryDate);
                       const today = new Date();
                       const ninetyDaysFromNow = new Date();
                       ninetyDaysFromNow.setDate(today.getDate() + 90);
                       return expiry <= ninetyDaysFromNow;
                     }).sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime()).map((med) => {
                       const expiry = new Date(med.expiryDate!);
                       const today = new Date();
                       const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                       const isExpired = daysUntilExpiry < 0;
                       
                       return (
                         <div key={med.id} className="flex items-center justify-between p-3 rounded-lg bg-background border">
                           <div className="flex items-center gap-3">
                             <div className={cn(
                               "p-2 rounded-lg",
                               isExpired ? 'bg-red-100 dark:bg-red-950' : 'bg-amber-100 dark:bg-amber-950'
                             )}>
                               <CalendarClock className={cn(
                                 "h-4 w-4",
                                 isExpired ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                               )} />
                             </div>
                             <div>
                               <p className="font-medium">{med.name}</p>
                               <p className="text-sm text-muted-foreground">
                                 {t('pharmacy.expiry_date')}: {expiry.toLocaleDateString(language)}
                               </p>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <Badge variant={isExpired ? 'destructive' : 'secondary'} className={cn(
                               !isExpired && daysUntilExpiry <= 30 && 'bg-amber-100 text-amber-800 border-transparent'
                             )}>
                               {isExpired 
                                 ? t('pharmacy.expired') 
                                 : `${daysUntilExpiry} ${t('pharmacy.days_until_expiry')}`}
                             </Badge>
                             <Button size="sm" variant="outline" onClick={() => openReorderDialog(med)}>
                               <ShoppingCart className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                               {t('pharmacy.reorder_now')}
                             </Button>
                           </div>
                         </div>
                       );
                     })
                   )}
                 </CardContent>
               </Card>
             </div>
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

      <DispenseMedicationDialog
        prescription={prescriptionToDispense}
        medication={medicationForDispense}
        open={!!prescriptionToDispense}
        isSubmitting={isDispenseLoading}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDispenseLoading) {
            setPrescriptionToDispense(null);
            setMedicationForDispense(null);
          }
        }}
        onConfirm={handleDispenseMedication}
      />

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

      {/* Prescription History Dialog */}
      <PrescriptionHistoryDialog
        medicationId={medicationForHistory?.id}
        medicationName={medicationForHistory?.name}
        open={!!medicationForHistory}
        onOpenChange={(isOpen) => {
          if (!isOpen) setMedicationForHistory(null);
        }}
      />

      {/* New Purchase Order Dialog for Reorder */}
      <NewPurchaseOrderDialog
        key={medicationToReorder?.id ?? 'new-po'}
        open={isNewPoOpen}
        onOpenChange={(isOpen) => {
          setIsNewPoOpen(isOpen);
          if (!isOpen) setMedicationToReorder(null);
        }}
        onSave={handleSavePurchaseOrder}
        initialItems={initialPoItems}
        inventoryItems={inventoryOptions}
        suppliers={suppliers}
        onAddItem={() => setIsAddItemOpen(true)}
      />

      {/* Add Item Dialog for creating new inventory items */}
      <AddItemDialog
        onSave={handleSaveInventoryItem}
        open={isAddItemOpen}
        onOpenChange={setIsAddItemOpen}
        showTrigger={false}
        suppliers={suppliers}
      />

    </DashboardLayout>
  );
}
