
'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
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
} from "lucide-react";
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


const iconMap = {
  Building2,
  FileText,
  DollarSign,
  Star,
};

type IconKey = keyof typeof iconMap;

export default function SuppliersPage() {
  const { t, language } = useLanguage();
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [supplierToEdit, setSupplierToEdit] = React.useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = React.useState<Supplier | null>(null);
  const [supplierSearchTerm, setSupplierSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');

  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>([]);
  const [poToView, setPoToView] = React.useState<PurchaseOrder | null>(null);
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
  
  const supplierCategories = React.useMemo(() => {
    return [...new Set(suppliers.map((s) => s.category))];
  }, [suppliers]);
  
  const suppliersPageStats = React.useMemo(() => {
    const totalSuppliers = suppliers.length;
    const pendingPOs = purchaseOrders.filter(po => po.status === 'Pending').length;
    const totalPOValue = purchaseOrders.reduce((acc, po) => acc + parseFloat(po.total.replace(/[^0-9.-]+/g, '')), 0);
    const topRatedSuppliers = suppliers.filter(s => s.rating >= 4.5).length;
    
    const currencyFormatter = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP' });
    return [
      { title: t('suppliers.total_suppliers'), value: totalSuppliers, icon: "Building2", description: t('suppliers.all_active_suppliers'), valueClassName: "" },
      { title: t('suppliers.pending_pos'), value: pendingPOs, icon: "FileText", description: t('suppliers.orders_awaiting_shipment'), valueClassName: "text-orange-500" },
      { title: t('suppliers.total_po_value'), value: currencyFormatter.format(totalPOValue), icon: "DollarSign", description: t('suppliers.value_of_all_orders'), valueClassName: "" },
      { title: t('suppliers.top_rated'), value: `${topRatedSuppliers} ${t('suppliers.suppliers')}`, icon: "Star", description: t('suppliers.rating_4_5_or_higher'), valueClassName: "text-yellow-500" },
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
        total: `EGP ${total.toLocaleString()}`,
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
    return purchaseOrders
      .filter(po =>
        po.supplier.toLowerCase().includes(poSearchTerm.toLowerCase()) ||
        po.id.toLowerCase().includes(poSearchTerm.toLowerCase())
      )
      .filter(po =>
        poStatusFilter === 'all' || po.status.toLowerCase() === poStatusFilter
      );
  }, [purchaseOrders, poSearchTerm, poStatusFilter]);

  const receivingOrders = React.useMemo(() => {
    return purchaseOrders.filter(po => po.status === 'Shipped');
  }, [purchaseOrders]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{`${t('suppliers.title')} & ${t('purchase_orders.title')}`}</h1>
            <p className="text-muted-foreground">
              {t('suppliers.page_description')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => openNewPoDialog()}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t('suppliers.new_purchase_order')}
            </Button>
            <AddSupplierDialog onSave={handleSaveSupplier} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {suppliersPageStats.map((stat) => {
            const Icon = iconMap[stat.icon as IconKey];
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon
                    className={cn(
                      "h-4 w-4 text-muted-foreground",
                      stat.valueClassName
                    )}
                  />
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

    <Tabs defaultValue="suppliers">
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
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
            placeholder={t('suppliers.search_suppliers')}
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
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
                <Table>
                  <TableHeader>
                    <TableRow>
            <TableHead>{t('suppliers.supplier')}</TableHead>
            <TableHead>{t('suppliers.contact')}</TableHead>
            <TableHead>{t('suppliers.category')}</TableHead>
            <TableHead>{t('suppliers.performance')}</TableHead>
            <TableHead>{t('suppliers.rating')}</TableHead>
            <TableHead>{t('common.status')}</TableHead>
            <TableHead className="text-right">{t('table.actions')}</TableHead>
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
                           <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">{t('table.actions')}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => createQuickPurchaseOrder(supplier)}>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                    {t('suppliers.quick_order')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSupplierToEdit(supplier)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                    {t('table.edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSupplierToDelete(supplier)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
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
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
            placeholder={t('purchase_orders.search_placeholder')}
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
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
                <Table>
                  <TableHeader>
                    <TableRow>
            <TableHead>{t('suppliers.po_number')}</TableHead>
            <TableHead>{t('suppliers.supplier')}</TableHead>
            <TableHead>{t('suppliers.order_date')}</TableHead>
            <TableHead>{t('suppliers.expected_delivery')}</TableHead>
            <TableHead>{t('suppliers.total')}</TableHead>
            <TableHead>{t('common.status')}</TableHead>
            <TableHead className="text-right">{t('table.actions')}</TableHead>
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
                          <TableCell>{po.total}</TableCell>
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
                               {po.status === 'Pending' && <Clock className="mr-1 h-3 w-3" />}
                               {po.status === 'Shipped' && <TruckIcon className="mr-1 h-3 w-3" />}
                               {po.status === 'Delivered' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                 {po.status === 'Pending' ? t('common.pending') : po.status === 'Shipped' ? t('suppliers.status.shipped') : po.status === 'Delivered' ? t('suppliers.status.delivered') : t('suppliers.status.cancelled')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">{t('table.actions')}</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setPoToView(po)}>
                                    <Eye className="mr-2 h-4 w-4" />
                  {t('table.view_details')}
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                <TableHead>{t('suppliers.po_number')}</TableHead>
                <TableHead>{t('suppliers.supplier')}</TableHead>
                <TableHead>{t('suppliers.expected_delivery')}</TableHead>
                <TableHead className="text-right">{t('table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {receivingOrders.length > 0 ? (
                                receivingOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.id}</TableCell>
                                        <TableCell>{order.supplier}</TableCell>
                                        <TableCell>{order.deliveryDate || 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleReceiveOrder(order)}>
                                                <Check className="mr-2 h-4 w-4" />
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

      <AddItemDialog onSave={handleSaveItem} open={isAddItemOpen} onOpenChange={setIsAddItemOpen} />
      
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

       <ViewPurchaseOrderDialog
        order={poToView}
        open={!!poToView}
        onOpenChange={(isOpen) => !isOpen && setPoToView(null)}
      />

    </DashboardLayout>
  );
}
