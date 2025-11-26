
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
  ShoppingCart,
  Building2,
  FileText,
  DollarSign,
  Star,
  Phone,
  Mail,
  Pencil,
  Eye,
  CheckCircle2,
  Clock,
  Truck as TruckIcon,
  MoreHorizontal,
  Trash2,
  Check,
  Loader2,
  Plus,
  Sparkles,
  Users,
  Package,
} from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import { NewPurchaseOrderDialog } from "@/components/suppliers/new-purchase-order-dialog";
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog";
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditSupplierDialog } from '@/components/suppliers/edit-supplier-dialog';
import { ViewPurchaseOrderDialog } from '@/components/suppliers/view-purchase-order-dialog';
import { InventoryItem } from '../inventory/page';
import { listDocuments, setDocument, updateDocument, deleteDocument } from '@/lib/data-client';
import { AddItemDialog } from '@/components/inventory/add-item-dialog';
import { useRouter, useSearchParams } from 'next/navigation';

export type Supplier = {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  category: string;
  paymentTerms: string;
  rating: number;
  status: 'active' | 'inactive';
};

export type PurchaseOrderItem = {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type PurchaseOrder = {
  id: string;
  supplier: string;
  orderDate: string;
  deliveryDate: string | null;
  total: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: PurchaseOrderItem[];
};

const ARABIC_TO_ENGLISH_DIGITS: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9'
};

const normalizeDigits = (value: string): string =>
  value.replace(/[٠-٩]/g, (digit) => ARABIC_TO_ENGLISH_DIGITS[digit] ?? digit);


const iconMap = {
  Building2,
  FileText,
  DollarSign,
  Star,
};

type IconKey = keyof typeof iconMap;

function SuppliersPageContent() {
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'suppliers' | 'purchase-orders' | 'receiving'>('suppliers');
  const [supplierToEdit, setSupplierToEdit] = React.useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = React.useState<Supplier | null>(null);
  const [supplierSearchTerm, setSupplierSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');

  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>([]);
  const [poToView, setPoToView] = React.useState<PurchaseOrder | null>(null);
  const [poToEdit, setPoToEdit] = React.useState<PurchaseOrder | null>(null);
  const [poToDelete, setPoToDelete] = React.useState<PurchaseOrder | null>(null);
  const [poSearchTerm, setPoSearchTerm] = React.useState('');
  const [poStatusFilter, setPoStatusFilter] = React.useState('all');
  
  const [isNewPoOpen, setIsNewPoOpen] = React.useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = React.useState(false);
  const [newPoSupplier, setNewPoSupplier] = React.useState<string | undefined>(undefined);


  const { toast } = useToast();
  
  React.useEffect(() => {
    async function fetchData() {
        try {
      // Replaced legacy getCollection calls with listDocuments (client REST layer)
      const [suppliersData, poData, inventoryData] = await Promise.all([
        listDocuments<Supplier>('suppliers'),
        listDocuments<PurchaseOrder>('purchase-orders'),
        listDocuments<InventoryItem>('inventory'),
      ]);
            setSuppliers(suppliersData);
            setPurchaseOrders(poData);
            setInventory(inventoryData);
    } catch(e) {
      toast({ title: t('suppliers.toast.error_fetching'), variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast]);

  React.useEffect(() => {
    const shouldOpenDialog = searchParams.get('openNewPo');
    if (!shouldOpenDialog || suppliers.length === 0) {
      return;
    }

    const supplierNameParam = searchParams.get('supplierName');
    const supplierIdParam = searchParams.get('supplierId');
    const matchedSupplier = supplierIdParam
      ? suppliers.find((supplier) => supplier.id === supplierIdParam)
      : supplierNameParam
        ? suppliers.find((supplier) => supplier.name.toLowerCase() === supplierNameParam.toLowerCase())
        : undefined;

    setNewPoSupplier(matchedSupplier?.id ?? supplierIdParam ?? undefined);
    setActiveTab('purchase-orders');
    setIsNewPoOpen(true);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('openNewPo');
    params.delete('supplierName');
    params.delete('inventoryItemId');
    params.delete('supplierId');
    const next = params.toString();
    router.replace(next ? `/suppliers?${next}` : '/suppliers', { scroll: false });
  }, [searchParams, suppliers, router]);
  
  const supplierCategories = React.useMemo(() => {
    return [...new Set(suppliers.map((s) => s.category))];
  }, [suppliers]);
  
  const suppliersPageStats = React.useMemo(() => {
    const totalSuppliers = suppliers.length;
    const pendingPOs = purchaseOrders.filter(po => po.status === 'Pending').length;
    const totalPOValue = purchaseOrders.reduce((acc, po) => acc + parseFloat(po.total.replace(/[^0-9.-]+/g, '')), 0);
    const topRatedSuppliers = suppliers.filter(s => s.rating >= 4.5).length;
    
    const englishDigitsAmount = formatEGP(totalPOValue, false, 'en');
    const totalPoValueLabel = language === 'ar'
      ? `${englishDigitsAmount} جم`
      : `EGP ${englishDigitsAmount}`;
    return [
      { title: t('suppliers.total_suppliers'), value: totalSuppliers, icon: "Building2", description: t('suppliers.all_active_suppliers'), cardStyle: 'metric-card-blue' },
      { title: t('suppliers.pending_pos'), value: pendingPOs, icon: "FileText", description: t('suppliers.orders_awaiting_shipment'), cardStyle: 'metric-card-orange' },
      { title: t('suppliers.total_po_value'), value: totalPoValueLabel, icon: "DollarSign", description: t('suppliers.value_of_all_orders'), cardStyle: 'metric-card-green' },
      { title: t('suppliers.top_rated'), value: `${topRatedSuppliers} ${t('suppliers.suppliers')}`, icon: "Star", description: t('suppliers.rating_4_5_or_higher'), cardStyle: 'metric-card-purple' },
    ];
  }, [suppliers, purchaseOrders, language, t]);

  const getSupplierPerformance = React.useCallback((supplierName: string) => {
    const supplierOrders = purchaseOrders.filter(po => po.supplier === supplierName);
    const totalOrders = supplierOrders.length;
    const deliveredOrders = supplierOrders.filter(po => po.status === 'Delivered').length;
    const pendingOrders = supplierOrders.filter(po => po.status === 'Pending').length;
    const onTimeDelivery = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
    const totalValue = supplierOrders.reduce((acc, po) => acc + parseFloat(po.total.replace(/[^0-9.-]+/g, '')), 0);
    
    return {
      totalOrders,
      deliveredOrders,
      pendingOrders,
      onTimeDelivery,
      totalValue,
      averageOrderValue: totalOrders > 0 ? totalValue / totalOrders : 0
    };
  }, [purchaseOrders]);

  const formatPurchaseOrderTotal = React.useCallback((total: string) => {
    const normalized = normalizeDigits(total ?? '');
    const numericPortion = normalized.replace(/[^0-9.,-]+/g, '').trim();
    const fallback = '0.00';
    const symbol = language === 'ar' ? 'جم' : 'EGP';
    return `${numericPortion || fallback} ${symbol}`;
  }, [language]);

  const createQuickPurchaseOrder = async (supplier: Supplier) => {
    try {
      // Find low stock items from this supplier
      const lowStockFromSupplier = inventory.filter(item => 
        item.supplier === supplier.name && 
        (item.status === 'Low Stock' || item.status === 'Out of Stock')
      );

      if (lowStockFromSupplier.length === 0) {
        toast({
          title: t('suppliers.toast.no_low_stock'),
        });
        return;
      }

      const orderItems = lowStockFromSupplier.map(item => ({
        itemId: item.id,
        description: item.name,
        quantity: item.max - item.stock,
        unitPrice: parseFloat(item.unitCost.replace(/[^\d.]/g, ''))
      }));

      const total = orderItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

      const newPurchaseOrder = {
        supplier: supplier.name,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total: formatEGP(total, true, language),
        status: 'Pending',
        items: orderItems
      };

      await setDocument('purchase-orders', `PO-${Date.now()}`, newPurchaseOrder);
      
      // Refresh purchase orders
  const updatedPOs = await listDocuments<PurchaseOrder>('purchase-orders');
      setPurchaseOrders(updatedPOs);
      
      toast({
        title: t('suppliers.toast.quick_order_created'),
        description: t('suppliers.toast.po_created_desc'),
      });
    } catch (error) {
      toast({
        title: t('suppliers.toast.error_quick_order'),
        description: t('suppliers.toast.error_quick_order_desc'),
        variant: "destructive",
      });
    }
  };

  const handleSaveSupplier = async (data: Omit<Supplier, 'id' | 'rating' | 'status'>) => {
    try {
        const newSupplier: Supplier = {
          id: `SUP-${Date.now()}`,
          ...data,
          rating: 5.0,
          status: 'active',
        };
        await setDocument('suppliers', newSupplier.id, newSupplier);
        setSuppliers(prev => [newSupplier, ...prev]);
        toast({
          title: t('suppliers.toast.supplier_added'),
          description: t('suppliers.toast.supplier_added_desc'),
        });
    } catch(e) {
        toast({ title: t('suppliers.toast.error_adding'), variant: 'destructive'});
    }
  };

  const handleUpdateSupplier = async (updatedSupplier: Supplier) => {
    try {
        await updateDocument('suppliers', updatedSupplier.id, updatedSupplier);
        setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
        setSupplierToEdit(null);
        toast({
          title: t('suppliers.toast.supplier_updated'),
          description: t('suppliers.toast.supplier_updated_desc'),
        });
    } catch(e) {
        toast({ title: t('suppliers.toast.error_updating'), variant: 'destructive'});
    }
  };

  const handleDeleteSupplier = async () => {
    if (supplierToDelete) {
      try {
          await deleteDocument('suppliers', supplierToDelete.id);
          setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));
          toast({
            title: t('suppliers.toast.supplier_deleted'),
            description: t('suppliers.toast.supplier_deleted_desc'),
            variant: "destructive"
          });
          setSupplierToDelete(null);
      } catch(e) {
          toast({ title: t('suppliers.toast.error_deleting'), variant: 'destructive'});
      }
    }
  };

  const handleSavePurchaseOrder = async (data: any) => {
    try {
        const newPurchaseOrder: PurchaseOrder = {
          id: `PO-${Date.now()}`,
          supplier: data.supplier,
          orderDate: new Date(data.orderDate).toLocaleDateString(),
          deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString() : null,
          total: `$${data.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)}`,
          status: 'Pending',
          items: data.items,
        };
        await setDocument('purchase-orders', newPurchaseOrder.id, newPurchaseOrder);
        setPurchaseOrders(prev => [newPurchaseOrder, ...prev]);
        toast({
          title: t('suppliers.toast.po_created'),
          description: t('suppliers.toast.po_created_desc'),
        });
    } catch(e) {
        toast({ title: t('suppliers.toast.error_creating_po'), variant: 'destructive'});
    }
  };

  const handleSaveItem = async (data: any) => {
    try {
        const newItem: InventoryItem = {
          id: `INV-${Date.now()}`,
          name: data.name,
          expires: data.expires ? new Date(data.expires).toLocaleDateString() : 'N/A',
          category: data.category,
          stock: data.stock,
          min: 10,
          max: 50,
          status: data.stock < 10 ? 'Low Stock' : 'Normal',
          unitCost: `EGP ${parseFloat(data.unitCost).toFixed(2)}`,
          supplier: data.supplier,
          location: data.location,
        };
        await setDocument('inventory', newItem.id, newItem);
        setInventory(prev => [newItem, ...prev]);
        toast({
          title: t('inventory.toast.item_added'),
          description: t('inventory.toast.item_added_desc'),
        });
        setIsAddItemOpen(false); // Close the dialog
    } catch(e) {
        toast({ title: t('inventory.toast.error_adding'), variant: 'destructive'});
    }
  };

  const handlePoStatusChange = async (poId: string, status: PurchaseOrder['status']) => {
    try {
        await updateDocument('purchase-orders', poId, { status });
        setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status } : po));
    toast({
      title: t('suppliers.toast.status_updated'),
      description: t('suppliers.toast.status_updated_desc')
    });
    } catch (e) {
    toast({ title: t('suppliers.toast.error_updating_status'), variant: 'destructive'});
    }
  };
  
  const handleReceiveOrder = async (order: PurchaseOrder) => {
    try {
        // 1. Update PO status to Delivered
        await handlePoStatusChange(order.id, 'Delivered');

        // 2. Update inventory stock
        for (const orderItem of order.items) {
            const inventoryItem = inventory.find(invItem => invItem.id === orderItem.itemId);
            if (inventoryItem) {
                const newStock = inventoryItem.stock + orderItem.quantity;
                const newStatus = newStock >= inventoryItem.min ? 'Normal' : inventoryItem.status;
                await updateDocument('inventory', inventoryItem.id, { stock: newStock, status: newStatus });
            }
        }
        
        // Refetch inventory to show updated stock
  const updatedInventory = await listDocuments<InventoryItem>('inventory');
        setInventory(updatedInventory);

    toast({
      title: t('suppliers.toast.status_updated'),
      description: t('suppliers.toast.status_updated_desc'),
    });
    } catch (e) {
    toast({ title: t('suppliers.toast.error_updating_status'), variant: 'destructive'});
    }
  };

  const handleUpdatePurchaseOrder = async (data: any) => {
    const targetId = data?.id ?? poToEdit?.id;
    if (!targetId) return;
    try {
      const total = data.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);
      const updatedOrder: PurchaseOrder = {
        id: targetId,
        supplier: data.supplier,
        orderDate: data.orderDate ? new Date(data.orderDate).toLocaleDateString() : (poToEdit?.orderDate ?? ''),
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString() : null,
        total: `$${total.toFixed(2)}`,
        status: purchaseOrders.find((po) => po.id === targetId)?.status ?? 'Pending',
        items: data.items,
      };
      await updateDocument('purchase-orders', targetId, {
        supplier: updatedOrder.supplier,
        orderDate: updatedOrder.orderDate,
        deliveryDate: updatedOrder.deliveryDate,
        total: updatedOrder.total,
        status: updatedOrder.status,
        items: updatedOrder.items,
      });
      setPurchaseOrders((prev) => prev.map((po) => (po.id === targetId ? updatedOrder : po)));
      setPoToEdit(null);
      toast({ title: language === 'ar' ? 'تم تحديث أمر الشراء' : 'Purchase order updated' });
    } catch (e) {
      toast({ title: language === 'ar' ? 'فشل تحديث أمر الشراء' : 'Failed to update purchase order', variant: 'destructive' });
    }
  };

  const handleDeletePurchaseOrder = async () => {
    if (!poToDelete) return;
    try {
      await deleteDocument('purchase-orders', poToDelete.id);
      setPurchaseOrders((prev) => prev.filter((po) => po.id !== poToDelete.id));
      toast({ title: language === 'ar' ? 'تم حذف أمر الشراء' : 'Purchase order deleted' });
    } catch (e) {
      toast({ title: language === 'ar' ? 'فشل حذف أمر الشراء' : 'Failed to delete purchase order', variant: 'destructive' });
    } finally {
      setPoToDelete(null);
    }
  };

  const openNewPoDialog = (supplierId?: string) => {
    setNewPoSupplier(supplierId);
    setIsNewPoOpen(true);
  };

  const filteredSuppliers = React.useMemo(() => {
    return suppliers
      .filter(supplier =>
        supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        supplier.category.toLowerCase().includes(supplierSearchTerm.toLowerCase())
      )
      .filter(supplier =>
        categoryFilter === 'all' || supplier.category.toLowerCase() === categoryFilter.toLowerCase()
      );
  }, [suppliers, supplierSearchTerm, categoryFilter]);

  const filteredPurchaseOrders = React.useMemo(() => {
    const normalizedSearch = poSearchTerm.toLowerCase();
    const normalizedStatus = poStatusFilter.toLowerCase();

    return purchaseOrders
      .filter((po) => {
        const supplierName = (po.supplier ?? '').toLowerCase();
        const poId = (po.id ?? '').toLowerCase();
        return (
          supplierName.includes(normalizedSearch) ||
          poId.includes(normalizedSearch)
        );
      })
      .filter((po) => {
        if (normalizedStatus === 'all') return true;
        const status = (po.status ?? '').toLowerCase();
        return status === normalizedStatus;
      });
  }, [purchaseOrders, poSearchTerm, poStatusFilter]);

  const receivingOrders = React.useMemo(() => {
    return purchaseOrders.filter(po => po.status === 'Shipped');
  }, [purchaseOrders]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-200/30 via-blue-200/20 to-sky-200/10 dark:from-indigo-900/15 dark:via-blue-900/10 dark:to-sky-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-200/30 via-amber-200/20 to-yellow-200/10 dark:from-orange-900/15 dark:via-amber-900/10 dark:to-yellow-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Enhanced Suppliers Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-sky-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-xl">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 dark:from-indigo-400 dark:via-blue-400 dark:to-sky-400 bg-clip-text text-transparent animate-gradient">
                    {t('suppliers.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('page.suppliers.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => openNewPoDialog()} className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <ShoppingCart className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('suppliers.new_purchase_order')}
                </Button>
                <AddSupplierDialog onSave={handleSaveSupplier} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {suppliersPageStats.map((stat, idx) => {
            const Icon = iconMap[stat.icon as IconKey];
            return (
              <Card
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl transition-all duration-500",
                  stat.cardStyle
                )}
                role="button"
                tabIndex={0}
                aria-label={stat.title}
                onClick={() => {
                  // 0: total suppliers -> suppliers tab, 1: pending POs -> purchase-orders with pending filter
                  // 2: total PO value -> purchase-orders (all), 3: top rated -> suppliers tab
                  if (idx === 0) {
                    setActiveTab('suppliers');
                    setSupplierSearchTerm('');
                    setCategoryFilter('all');
                  } else if (idx === 1) {
                    setActiveTab('purchase-orders');
                    setPoStatusFilter('pending');
                  } else if (idx === 2) {
                    setActiveTab('purchase-orders');
                    setPoStatusFilter('all');
                  } else if (idx === 3) {
                    setActiveTab('suppliers');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    (e.currentTarget as HTMLDivElement).click();
                  }
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <CardIcon variant={(['blue','orange','green','purple'] as const)[idx % 4]} aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </CardIcon>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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

    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
      <TabsTrigger value="suppliers">{t('suppliers.suppliers')}</TabsTrigger>
      <TabsTrigger value="purchase-orders">{t('purchase_orders.title')}</TabsTrigger>
      <TabsTrigger value="receiving">{t('suppliers.receiving')}</TabsTrigger>
          </TabsList>
          <TabsContent value="suppliers" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <CardTitle>{t('suppliers.supplier_directory')}</CardTitle>
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
            placeholder={t('suppliers.search_suppliers')}
                      className={cn(
                        "w-full rounded-lg bg-background lg:w-[336px]",
                        isRTL ? 'pr-8 pl-2 text-right' : 'pl-8 pr-2'
                      )}
                      value={supplierSearchTerm}
                      onChange={(e) => setSupplierSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('common.all_categories')} />
                    </SelectTrigger>
                    <SelectContent>
            <SelectItem value="all">{t('common.all_categories')}</SelectItem>
                      {supplierCategories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
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
            <TableHead>{t('suppliers.supplier')}</TableHead>
            <TableHead>{t('suppliers.contact')}</TableHead>
            <TableHead>{t('suppliers.category')}</TableHead>
            <TableHead>{t('suppliers.performance')}</TableHead>
            <TableHead>{t('suppliers.rating')}</TableHead>
            <TableHead>{t('common.status')}</TableHead>
            <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier) => {
                        const performance = getSupplierPerformance(supplier.name);
                        return (
                        <TableRow key={supplier.id}>
                          <TableCell>
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {supplier.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              <span>{supplier.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{supplier.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{supplier.category}</Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {supplier.paymentTerms}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                {performance.totalOrders} {t('suppliers.orders')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                {performance.onTimeDelivery}% {t('suppliers.on_time')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                {new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP' }).format(performance.totalValue)} {t('suppliers.total_value_label')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span className="font-medium">
                                {supplier.rating}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                supplier.status === "active"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                supplier.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : ""
                              }
                            >
                {supplier.status === 'active' ? t('common.active') : t('common.inactive')}
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
                                    <DropdownMenuItem onClick={() => createQuickPurchaseOrder(supplier)}>
                                        <ShoppingCart className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                    {t('suppliers.quick_order')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSupplierToEdit(supplier)}>
                                        <Pencil className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                    {t('table.edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSupplierToDelete(supplier)} className="text-destructive">
                                        <Trash2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                    {t('table.delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
              {t('suppliers.no_suppliers_found')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="purchase-orders" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <CardTitle>{t('purchase_orders.title')}</CardTitle>
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
            placeholder={t('purchase_orders.search_placeholder')}
                      className={cn(
                        "w-full rounded-lg bg-background lg:w-[336px]",
                        isRTL ? 'pr-8 pl-2 text-right' : 'pl-8 pr-2'
                      )}
                      value={poSearchTerm}
                      onChange={(e) => setPoSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={poStatusFilter} onValueChange={setPoStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('common.all_status')} />
                    </SelectTrigger>
                    <SelectContent>
            <SelectItem value="all">{t('common.all_status')}</SelectItem>
            <SelectItem value="pending">{t('common.pending')}</SelectItem>
            <SelectItem value="shipped">{t('suppliers.status.shipped')}</SelectItem>
            <SelectItem value="delivered">{t('suppliers.status.delivered')}</SelectItem>
            <SelectItem value="cancelled">{t('suppliers.status.cancelled')}</SelectItem>
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
            <TableHead>{t('suppliers.po_number')}</TableHead>
            <TableHead>{t('suppliers.supplier')}</TableHead>
            <TableHead>{t('suppliers.order_date')}</TableHead>
            <TableHead>{t('suppliers.expected_delivery')}</TableHead>
            <TableHead>{t('suppliers.total')}</TableHead>
            <TableHead>{t('common.status')}</TableHead>
            <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredPurchaseOrders.length > 0 ? (
                      filteredPurchaseOrders.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell className="font-medium">{po.id}</TableCell>
                          <TableCell>{po.supplier}</TableCell>
                          <TableCell>{po.orderDate}</TableCell>
                          <TableCell>{po.deliveryDate || 'N/A'}</TableCell>
                          <TableCell>{formatPurchaseOrderTotal(po.total)}</TableCell>
                          <TableCell>
                             <Badge
                              variant={
                                po.status === "Delivered" ? "default" :
                                po.status === "Cancelled" ? "destructive" : "outline"
                              }
                              className={cn(
                                "capitalize",
                                po.status === 'Delivered' && 'bg-green-100 text-green-800',
                                po.status === 'Shipped' && 'bg-blue-100 text-blue-800'
                              )}
                            >
                               {po.status === 'Pending' && <Clock className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                               {po.status === 'Shipped' && <TruckIcon className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                               {po.status === 'Delivered' && <CheckCircle2 className={cn("h-3 w-3", isRTL ? 'ml-1' : 'mr-1')} />}
                 {po.status === 'Pending' ? t('common.pending') : po.status === 'Shipped' ? t('suppliers.status.shipped') : po.status === 'Delivered' ? t('suppliers.status.delivered') : t('suppliers.status.cancelled')}
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
                                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                  <DropdownMenuItem onClick={() => setPoToView(po)}>
                                    <Eye className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('table.view_details')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setPoToEdit(po)}>
                                    <Pencil className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                    {t('table.edit')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setPoToDelete(po)} className="text-destructive">
                                    <Trash2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                    {t('table.delete')}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handlePoStatusChange(po.id, 'Shipped')}>
                  {t('suppliers.mark_as_shipped')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReceiveOrder(po)} disabled={po.status !== 'Shipped'}>
                  {t('suppliers.mark_as_delivered')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePoStatusChange(po.id, 'Cancelled')} className="text-destructive">
                  {t('suppliers.cancel_order')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
              {t('suppliers.no_purchase_orders_found')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="receiving" className="mt-4">
             <Card>
                <CardHeader>
          <CardTitle>{t('suppliers.receiving')}</CardTitle>
                    <p className="text-muted-foreground">
            {t('suppliers.receiving_description')}
                    </p>
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
                <TableHead>{t('suppliers.po_number')}</TableHead>
                <TableHead>{t('suppliers.supplier')}</TableHead>
                <TableHead>{t('suppliers.expected_delivery')}</TableHead>
                <TableHead className={cn(isRTL ? 'text-left' : 'text-right')}>{t('table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receivingOrders.length > 0 ? (
                                receivingOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>{order.supplier}</TableCell>
                                        <TableCell>{order.deliveryDate || 'N/A'}</TableCell>
                                        <TableCell className={cn(isRTL ? 'text-left' : 'text-right')}>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleReceiveOrder(order)}
                                              className={cn('inline-flex items-center', isRTL ? 'flex-row-reverse' : 'flex-row')}
                                            >
                                                <Check className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                        {t('suppliers.receive_items')}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                    {t('suppliers.no_orders_awaiting_receipt')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <NewPurchaseOrderDialog
        key={newPoSupplier}
        open={isNewPoOpen}
        onOpenChange={setIsNewPoOpen}
        onSave={handleSavePurchaseOrder}
        initialSupplierId={newPoSupplier}
        inventoryItems={inventory}
        suppliers={suppliers}
        onAddItem={() => setIsAddItemOpen(true)}
      />

      <NewPurchaseOrderDialog
        key={poToEdit?.id ?? 'edit-po'}
        open={!!poToEdit}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPoToEdit(null);
        }}
        onSave={handleUpdatePurchaseOrder}
        initialSupplierId={poToEdit ? suppliers.find((s) => s.name === poToEdit.supplier)?.id : undefined}
        inventoryItems={inventory}
        suppliers={suppliers}
        onAddItem={() => setIsAddItemOpen(true)}
        initialOrder={poToEdit}
        mode="edit"
      />

      <AddItemDialog onSave={handleSaveItem} open={isAddItemOpen} onOpenChange={setIsAddItemOpen} showTrigger={false} />
      
      {supplierToEdit && (
        <EditSupplierDialog
          supplier={supplierToEdit}
          onSave={handleUpdateSupplier}
          open={!!supplierToEdit}
          onOpenChange={(isOpen) => !isOpen && setSupplierToEdit(null)}
        />
      )}

      <AlertDialog open={!!supplierToDelete} onOpenChange={(isOpen) => !isOpen && setSupplierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('suppliers.confirm_delete_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSupplier}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!poToDelete} onOpenChange={(isOpen) => !isOpen && setPoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' ? 'هل أنت متأكد من حذف أمر الشراء هذا؟' : 'Are you sure you want to delete this purchase order?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePurchaseOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <ViewPurchaseOrderDialog
        order={poToView}
        open={!!poToView}
        onOpenChange={(isOpen) => !isOpen && setPoToView(null)}
      />

    </DashboardLayout>
  );
}

function SuppliersPageLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center py-20 text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      Loading suppliers...
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <React.Suspense fallback={<SuppliersPageLoading />}>
      <SuppliersPageContent />
    </React.Suspense>
  );
}
