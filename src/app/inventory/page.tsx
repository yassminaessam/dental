
'use client';

import React from 'react';
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
import { cn } from "@/lib/utils";
import {
  Search,
  BarChart,
  AlertTriangle,
  ShoppingCart,
  Pencil,
  Trash2,
  Package as PackageIcon,
  Loader2,
  MoreHorizontal,
  Plus,
  TrendingDown,
  Star,
  Sparkles,
  Box,
  Boxes,
  PackageCheck,
  PillBottle,
} from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddItemDialog } from "@/components/inventory/add-item-dialog";
import { EditItemDialog } from "@/components/inventory/edit-item-dialog";
import { TransferToPharmacyDialog, type TransferFormData } from '@/components/inventory/transfer-to-pharmacy-dialog';
import { SupplierInfoDialog } from "@/components/inventory/supplier-info-dialog";
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
import { useToast } from '@/hooks/use-toast';
// Use client-side data client for all CRUD to avoid server-only imports in client components
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

export type InventoryItem = {
  id: string;
  name: string;
  category?: string | null;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  status: 'Normal' | 'LowStock' | 'OutOfStock';
  unitCost: number;
  supplierId?: string | null;
  supplierName?: string | null;
  location?: string | null;
  expires?: string | null;
  notes?: string | null;
};

type SupplierSummary = {
  id: string;
  name: string;
};

type PharmacyMedication = {
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

export default function InventoryPage() {
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const currencyFmt = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });
  const numberFmt = new Intl.NumberFormat(locale);
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = React.useState<SupplierSummary[]>([]);
  const [medications, setMedications] = React.useState<PharmacyMedication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [itemToEdit, setItemToEdit] = React.useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = React.useState<InventoryItem | null>(null);
  const [itemToTransfer, setItemToTransfer] = React.useState<InventoryItem | null>(null);
  const [itemForSupplierInfo, setItemForSupplierInfo] = React.useState<InventoryItem | null>(null);
  const [isTransferLoading, setIsTransferLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchInventory() {
      try {
        const [inventoryRes, suppliersRes, medicationsRes] = await Promise.all([
          fetch('/api/inventory'),
          fetch('/api/suppliers'),
          fetch('/api/pharmacy/medications'),
        ]);

        const inventoryPayload = inventoryRes.ok ? await inventoryRes.json().catch(() => ({})) : {};
        const supplierPayload = suppliersRes.ok ? await suppliersRes.json().catch(() => ({})) : {};
        const medicationPayload = medicationsRes.ok ? await medicationsRes.json().catch(() => ({})) : {};

        setInventory(Array.isArray(inventoryPayload?.items) ? inventoryPayload.items.map(mapInventoryResponse) : []);
        setSuppliers(Array.isArray(supplierPayload?.suppliers)
          ? supplierPayload.suppliers.map((supplier: any) => ({ id: supplier.id, name: supplier.name ?? supplier.id }))
          : []);
        setMedications(Array.isArray(medicationPayload?.medications)
          ? medicationPayload.medications.map(mapMedicationResponse)
          : []);
      } catch (error) {
        console.error('[InventoryPage] fetch error', error);
        toast({ title: t('inventory.toast.error_fetching'), variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, [toast, t]);

  const supplierNameMap = React.useMemo(() => {
    return suppliers.reduce<Record<string, string>>((acc, supplier) => {
      acc[supplier.id] = supplier.name;
      return acc;
    }, {});
  }, [suppliers]);

  const missingSupplierLabel = React.useMemo(() => language === 'ar' ? 'غير محدد' : 'Unassigned', [language]);

  const getSupplierDisplayName = React.useCallback((item: InventoryItem) => {
    const fromName = typeof item.supplierName === 'string' && item.supplierName.trim().length > 0 ? item.supplierName.trim() : '';
    const fromId = item.supplierId ? supplierNameMap[item.supplierId] : undefined;
    return fromName || fromId || missingSupplierLabel;
  }, [supplierNameMap, missingSupplierLabel]);


const inventoryStatusKeyMap: Record<InventoryItem['status'], string> = {
  Normal: 'inventory.status.normal',
  LowStock: 'inventory.status.low_stock',
  OutOfStock: 'inventory.status.out_of_stock',
};

const resolveInventoryStatusValue = (stock: number, min?: number): InventoryItem['status'] => {
  if (stock <= 0) return 'OutOfStock';
  const threshold = min ?? 10;
  if (stock < threshold) return 'LowStock';
  return 'Normal';
};

const resolveMedicationStatusValue = (stock: number): PharmacyMedication['status'] => {
  if (stock <= 0) return 'OutOfStock';
  if (stock <= 20) return 'LowStock';
  return 'InStock';
};

const mapInventoryResponse = (row: any): InventoryItem => ({
  id: row.id,
  name: row.name,
  category: row.category ?? null,
  quantity: Number(row.quantity ?? 0),
  minQuantity: Number(row.minQuantity ?? row.min ?? 0),
  maxQuantity: Number(row.maxQuantity ?? row.max ?? 0),
  status: row.status ?? resolveInventoryStatusValue(Number(row.quantity ?? 0), Number(row.minQuantity ?? row.min ?? 0)),
  unitCost: Number(row.unitCost ?? 0),
  supplierId: row.supplierId ?? null,
  supplierName: row.supplierName ?? row.supplier ?? null,
  location: row.location ?? null,
  expires: row.expires ?? row.expiryDate ?? null,
  notes: row.notes ?? null,
});

const mapMedicationResponse = (row: any): PharmacyMedication => ({
  id: row.id,
  name: row.name,
  fullName: row.fullName ?? row.name,
  strength: row.strength ?? '',
  form: row.form ?? '',
  category: row.category ?? '',
  stock: Number(row.stock ?? 0),
  unitPrice: Number(row.unitPrice ?? 0),
  expiryDate: row.expiryDate ?? null,
  status: row.status ?? resolveMedicationStatusValue(Number(row.stock ?? 0)),
});

  const inventoryCategories = React.useMemo(() => {
    return [...new Set(inventory.map((i) => i.category).filter(Boolean))] as string[];
  }, [inventory]);
  
  const lowStockItems = React.useMemo(
    () => inventory.filter((i) => i.status === 'LowStock' || i.status === 'OutOfStock'),
    [inventory]
  );

  const inventoryPageStats = React.useMemo(() => {
    const totalItems = inventory.length;
    const lowStockCount = lowStockItems.length;
    const categoryCount = inventoryCategories.length;
    const totalValue = inventory.reduce((acc, item) => acc + item.unitCost * item.quantity, 0);

    return [
      { title: t('inventory.total_items'), value: numberFmt.format(totalItems), description: t('inventory.all_items_in_inventory') },
      { title: t('inventory.low_stock_items'), value: numberFmt.format(lowStockCount), description: t('inventory.items_needing_attention'), valueClassName: "text-red-500" },
      { title: t('inventory.categories'), value: numberFmt.format(categoryCount), description: t('inventory.total_item_categories') },
      { title: t('inventory.total_value'), value: currencyFmt.format(totalValue), description: t('inventory.estimated_inventory_value') }
    ];
  }, [inventory, lowStockItems, inventoryCategories, t, numberFmt, currencyFmt]);

  const handleSaveItem = async (data: any) => {
    try {
      const supplierId = data.supplierId && data.supplierId.length > 0 ? data.supplierId : undefined;
      let supplierName = data.supplierName ?? data.supplier ?? '';
      if (supplierId && (!supplierName || supplierName === supplierId)) {
        supplierName = supplierNameMap[supplierId] ?? supplierName;
      }
      const quantity = Number(data.stock ?? 0);
      const minQuantity = 10;
      const maxQuantity = 50;
      const unitCostValue = typeof data.unitCost === 'number' ? data.unitCost : Number(data.unitCost ?? 0);
      const payload = {
        name: data.name,
        category: data.category,
        supplierId,
        supplierName: supplierName || undefined,
        quantity,
        minQuantity,
        maxQuantity,
        unitCost: unitCostValue,
        status: resolveInventoryStatusValue(quantity, minQuantity),
        expires: data.expires ? data.expires.toISOString() : undefined,
        location: data.location,
      };

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create inventory item');
      const result = await response.json();
      const created = result?.item ? mapInventoryResponse(result.item) : null;
      if (created) {
        setInventory((prev) => [created, ...prev]);
      }
      toast({
        title: t('inventory.toast.item_added'),
        description: t('inventory.toast.item_added_desc'),
      });
    } catch (error) {
      console.error('[InventoryPage] add item error', error);
      toast({ title: t('inventory.toast.error_adding'), variant: 'destructive' });
    }
  };

  const handleTransferToPharmacy = React.useCallback(async (transferData: TransferFormData) => {
    if (!itemToTransfer) return;
    const availableQuantity = itemToTransfer.quantity ?? 0;
    if (availableQuantity <= 0 || transferData.quantity > availableQuantity) {
      toast({
        title: t('inventory.transfer_error_title'),
        description: t('inventory.transfer_insufficient_stock'),
        variant: 'destructive',
      });
      return;
    }

    setIsTransferLoading(true);
    try {
      const remainingQuantity = availableQuantity - transferData.quantity;
      const inventoryResponse = await fetch(`/api/inventory/${itemToTransfer.id}` , {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: remainingQuantity,
          status: resolveInventoryStatusValue(remainingQuantity, itemToTransfer.minQuantity),
        }),
      });
      if (!inventoryResponse.ok) throw new Error('Failed to update inventory item');
      const inventoryPayload = await inventoryResponse.json();
      const nextInventoryItem = inventoryPayload?.item
        ? mapInventoryResponse(inventoryPayload.item)
        : { ...itemToTransfer, quantity: remainingQuantity, status: resolveInventoryStatusValue(remainingQuantity, itemToTransfer.minQuantity) };
      setInventory((prev) => prev.map((inv) => (inv.id === nextInventoryItem.id ? nextInventoryItem : inv)));

      const normalizedName = itemToTransfer.name.trim().toLowerCase();
      const existingMedication = medications.find((med) => med.name.trim().toLowerCase() === normalizedName);
      const unitPriceValue = typeof transferData.unitPrice === 'number'
        ? transferData.unitPrice
        : itemToTransfer.unitCost;
      const expirySource = itemToTransfer.expires || existingMedication?.expiryDate || null;
      let nextMedication: PharmacyMedication | null = null;

      if (existingMedication) {
        const nextStock = existingMedication.stock + transferData.quantity;
        const medicationResponse = await fetch(`/api/pharmacy/medications/${existingMedication.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stock: nextStock,
            unitPrice: unitPriceValue,
            status: resolveMedicationStatusValue(nextStock),
            expiryDate: expirySource ?? undefined,
          }),
        });
        if (!medicationResponse.ok) throw new Error('Failed to update medication');
        const payload = await medicationResponse.json();
        nextMedication = payload?.medication ? mapMedicationResponse(payload.medication) : null;
      } else {
        const medicationResponse = await fetch('/api/pharmacy/medications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: itemToTransfer.name,
            fullName: itemToTransfer.name,
            category: itemToTransfer.category,
            stock: transferData.quantity,
            unitPrice: unitPriceValue,
            expiryDate: expirySource ?? undefined,
            status: resolveMedicationStatusValue(transferData.quantity),
            inventoryItemId: itemToTransfer.id,
          }),
        });
        if (!medicationResponse.ok) throw new Error('Failed to create medication');
        const payload = await medicationResponse.json();
        nextMedication = payload?.medication ? mapMedicationResponse(payload.medication) : null;
      }

      if (nextMedication) {
        setMedications((prev) => {
          const index = prev.findIndex((med) => med.id === nextMedication!.id);
          if (index === -1) {
            return [nextMedication, ...prev];
          }
          const clone = [...prev];
          clone[index] = nextMedication;
          return clone;
        });
      }

      toast({
        title: t('inventory.transfer_success_title'),
        description: t('inventory.transfer_success_description', {
          name: itemToTransfer.name,
          quantity: transferData.quantity,
        }),
      });
      setItemToTransfer(null);
    } catch (error) {
      console.error('Transfer to pharmacy failed', error);
      toast({
        title: t('inventory.transfer_error_title'),
        description: t('inventory.transfer_error_description'),
        variant: 'destructive',
      });
    } finally {
      setIsTransferLoading(false);
    }
  }, [itemToTransfer, medications, t, toast]);

  const handleUpdateItem = async (updatedItem: InventoryItem) => {
    try {
      const response = await fetch(`/api/inventory/${updatedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedItem.name,
          category: updatedItem.category,
          supplierId: updatedItem.supplierId ?? undefined,
          supplierName: updatedItem.supplierName ?? undefined,
          quantity: updatedItem.quantity,
          minQuantity: updatedItem.minQuantity,
          maxQuantity: updatedItem.maxQuantity,
          unitCost: updatedItem.unitCost,
          status: updatedItem.status,
          expires: updatedItem.expires ?? undefined,
          location: updatedItem.location ?? undefined,
          notes: updatedItem.notes ?? undefined,
        }),
      });
      if (!response.ok) throw new Error('Failed to update inventory item');
      const payload = await response.json();
      const nextItem = payload?.item ? mapInventoryResponse(payload.item) : updatedItem;
      setInventory((prev) => prev.map((item) => (item.id === nextItem.id ? nextItem : item)));
      setItemToEdit(null);
      toast({
        title: t('inventory.toast.item_updated'),
        description: t('inventory.toast.item_updated_desc'),
      });
    } catch (error) {
      console.error('[InventoryPage] update item error', error);
      toast({ title: t('inventory.toast.error_updating'), variant: 'destructive' });
    }
  };

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      try {
        const response = await fetch(`/api/inventory/${itemToDelete.id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete inventory item');
        setInventory(prev => prev.filter(item => item.id !== itemToDelete.id));
        toast({
          title: t('inventory.toast.item_deleted'),
          description: t('inventory.toast.item_deleted_desc'),
          variant: "destructive",
        });
        setItemToDelete(null);
      } catch(error) {
        console.error('[InventoryPage] delete item error', error);
        toast({ title: t('inventory.toast.error_deleting'), variant: 'destructive'});
      }
    }
  };
  
  const handleAnalytics = () => {
    toast({
        title: t('inventory.toast.analytics_loading'),
        description: t('inventory.toast.analytics_loading_desc'),
    });
  };
  
  const handleRestock = async (item: InventoryItem) => {
    try {
      const orderQuantity = Math.max(0, item.maxQuantity - item.quantity);
      if (orderQuantity <= 0) {
        toast({ title: t('inventory.toast.error_purchase_order'), description: t('inventory.toast.error_purchase_order_desc'), variant: 'destructive' });
        return;
      }
      const unitPrice = item.unitCost;
      const total = orderQuantity * unitPrice;
      const supplierLabel = getSupplierDisplayName(item);

      const payload = {
        supplierId: item.supplierId ?? undefined,
        supplierName: supplierLabel,
        total,
        status: 'Pending',
        orderDate: new Date().toISOString(),
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        items: [{
          itemId: item.id,
          description: item.name,
          quantity: orderQuantity,
          unitPrice,
        }],
      };

      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create purchase order');
      toast({
        title: t('inventory.toast.purchase_order_created'),
        description: t('inventory.toast.purchase_order_created_desc'),
      });
    } catch (error) {
      toast({
        title: t('inventory.toast.error_purchase_order'),
        description: t('inventory.toast.error_purchase_order_desc'),
        variant: "destructive",
      });
    }
  };

  const createQuickPurchaseOrder = React.useCallback((item: InventoryItem) => {
    const params = new URLSearchParams();
    params.set('openNewPo', '1');
    const supplierLabel = getSupplierDisplayName(item);
    if (supplierLabel && supplierLabel !== missingSupplierLabel) {
      params.set('supplierName', supplierLabel);
    } else if (item.supplierId) {
      params.set('supplierId', item.supplierId);
    }
    params.set('inventoryItemId', item.id);
    router.push(`/suppliers?${params.toString()}`);
  }, [getSupplierDisplayName, missingSupplierLabel, router]);

  const handleManualOrderRedirect = React.useCallback((item: InventoryItem) => {
    const params = new URLSearchParams();
    params.set('openNewPo', '1');
    const supplierLabel = getSupplierDisplayName(item);
    if (supplierLabel && supplierLabel !== missingSupplierLabel) {
      params.set('supplierName', supplierLabel);
    } else if (item.supplierId) {
      params.set('supplierId', item.supplierId);
    }
    params.set('inventoryItemId', item.id);
    router.push(`/suppliers?${params.toString()}`);
  }, [getSupplierDisplayName, missingSupplierLabel, router]);

  const filteredInventory = React.useMemo(() => {
    return inventory
      .filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(item =>
        categoryFilter === 'all' || item.category === categoryFilter
      );
  }, [inventory, searchTerm, categoryFilter]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-200/30 via-purple-200/20 to-fuchsia-200/10 dark:from-violet-900/15 dark:via-purple-900/10 dark:to-fuchsia-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-teal-200/30 via-cyan-200/20 to-sky-200/10 dark:from-teal-900/15 dark:via-cyan-900/10 dark:to-sky-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Enhanced Inventory Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-xl">
                    <Boxes className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    {t('inventory.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('page.inventory.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleAnalytics}
                  className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <BarChart className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('nav.analytics')}
                </Button>
                <AddItemDialog 
                  onSave={handleSaveItem} 
                  open={isAddItemDialogOpen}
                  onOpenChange={setIsAddItemDialogOpen}
                  suppliers={suppliers}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Inventory Stats */}
        <div className="grid gap-1.5 grid-cols-2 lg:grid-cols-4">
          {inventoryPageStats.map((stat, index) => {
            const cardStyles = ['metric-card-blue','metric-card-green','metric-card-orange','metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            const variants = ['blue','green','orange','purple'] as const;
            const variant = variants[index % variants.length];
            return (
              <Card
                key={stat.title}
                className={cn(
                  'relative overflow-hidden border-0 shadow-sm transition-all duration-500 group min-h-0',
                  cardStyle
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-0.5 p-1.5 space-y-0">
                  <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide leading-tight">
                    {stat.title}
                  </CardTitle>
                  <CardIcon variant={variant} className="w-10 h-10" aria-hidden="true">
                    {index === 0 && <Boxes className="h-5 w-5" />}
                    {index === 1 && <PackageCheck className="h-5 w-5" />}
                    {index === 2 && <AlertTriangle className="h-5 w-5" />}
                    {index === 3 && <TrendingDown className="h-5 w-5" />}
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

        {/* Enhanced Low Stock Alert */}
        <Card className="group relative border-2 border-orange-200 dark:border-orange-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-orange-50/50 via-background to-red-50/30 dark:from-orange-950/10 dark:via-background dark:to-red-950/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-colors">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="flex flex-col gap-1">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                  {t('purchase_orders.low_stock_alert')}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {numberFmt.format(lowStockItems.length)} {t('inventory.items_needing_attention')}
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 grid gap-4 grid-cols-1 md:grid-cols-2">
            {lowStockItems.map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-3 rounded-lg border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-base break-words">{item.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('inventory.stock')}: {numberFmt.format(item.quantity)} / {t('inventory.min')}: {numberFmt.format(item.minQuantity)}
                  </p>
                  <p className="text-sm text-muted-foreground break-words">
                    {t('inventory.supplier')}: {getSupplierDisplayName(item)}
                  </p>
                </div>
                <div className="flex flex-col xs:flex-row gap-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 min-w-0"
                    onClick={() => createQuickPurchaseOrder(item)}
                  >
                    <ShoppingCart className={cn('h-4 w-4 shrink-0', isRTL ? 'ml-2' : 'mr-2')} />
                    <span className="truncate">{t('inventory.quick_order')}</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 min-w-0"
                    onClick={() => handleManualOrderRedirect(item)}
                  >
                    <Plus className={cn('h-4 w-4 shrink-0', isRTL ? 'ml-2' : 'mr-2')} />
                    <span className="truncate">{t('inventory.manual_order')}</span>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="group relative border-2 border-muted hover:border-teal-200 dark:hover:border-teal-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-teal-50/10 dark:to-teal-950/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <CardHeader className="relative z-10 flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 group-hover:from-teal-500/20 group-hover:to-cyan-500/20 transition-colors">
                <Box className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {t('inventory.all_items_in_inventory')}
              </CardTitle>
            </div>
            
            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
              <div className="relative w-full md:w-auto group/search">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl blur-lg opacity-0 group-hover/search:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <Search className={cn("absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover/search:text-teal-500 transition-colors duration-300", isRTL ? 'right-3' : 'left-3')} />
                  <Input
                    type="search"
                    placeholder={t('inventory.search_items')}
                    className={cn(
                      "w-full rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted hover:border-teal-300 dark:hover:border-teal-700 focus:border-teal-500 dark:focus:border-teal-600 py-5 h-auto lg:w-[336px] shadow-sm hover:shadow-md transition-all duration-300",
                      isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'
                    )}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px] rounded-xl border-2 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors">
                  <SelectValue placeholder={t('common.all_categories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all_categories')}</SelectItem>
                  {inventoryCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">{t('inventory.item')}</TableHead>
                  <TableHead>{t('inventory.category')}</TableHead>
                  <TableHead>{t('inventory.stock')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('inventory.unit_cost')}</TableHead>
                  <TableHead>{t('inventory.supplier')}</TableHead>
                  <TableHead>{t('inventory.location')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                ) : filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                            <PackageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.expires && (
                              <div className="text-xs text-muted-foreground">
                                {t('inventory.expiry_date')}: {new Date(item.expires).toLocaleDateString(language)}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category || t('common.na')}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{numberFmt.format(item.quantity)}</div>
                        <div className="text-xs text-muted-foreground">
                          {t('inventory.min')}: {numberFmt.format(item.minQuantity)} | {t('inventory.max')}: {numberFmt.format(item.maxQuantity)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === 'Normal' ? 'secondary' : 'destructive'}
                        >
                          {t(inventoryStatusKeyMap[item.status])}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatEGP(item.unitCost, true, language)}</TableCell>
                      <TableCell>{getSupplierDisplayName(item)}</TableCell>
                      <TableCell>{item.location || t('common.na')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">{t('table.actions')}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setItemToEdit(item)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            {(item.status === 'LowStock' || item.status === 'OutOfStock') && (
                              <DropdownMenuItem onClick={() => createQuickPurchaseOrder(item)}>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                {t('inventory.quick_order')}
                            </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setItemToTransfer(item)}
                              disabled={(item.quantity ?? 0) <= 0}
                            >
                              <PillBottle className="mr-2 h-4 w-4" />
                              {t('inventory.transfer_to_pharmacy')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setItemForSupplierInfo(item)}>
                              <Star className="mr-2 h-4 w-4" />
                              {t('inventory.supplier_info')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setItemToDelete(item)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
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
                      {t('inventory.no_items_found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      
      {itemToEdit && (
        <EditItemDialog
          item={itemToEdit}
          onSave={handleUpdateItem}
          open={!!itemToEdit}
          onOpenChange={(isOpen) => !isOpen && setItemToEdit(null)}
          suppliers={suppliers}
        />
      )}

      <TransferToPharmacyDialog
        itemName={itemToTransfer?.name}
        availableQuantity={itemToTransfer?.quantity ?? 0}
        defaultUnitPrice={itemToTransfer?.unitCost ?? 0}
        open={!!itemToTransfer}
        onOpenChange={(isOpen) => {
          if (!isOpen) setItemToTransfer(null);
        }}
        onConfirm={handleTransferToPharmacy}
        isSubmitting={isTransferLoading}
      />

      <SupplierInfoDialog
        supplierId={itemForSupplierInfo?.supplierId}
        supplierName={itemForSupplierInfo?.supplierName}
        itemName={itemForSupplierInfo?.name}
        open={!!itemForSupplierInfo}
        onOpenChange={(isOpen) => {
          if (!isOpen) setItemForSupplierInfo(null);
        }}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('purchase_orders.confirm_delete_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
