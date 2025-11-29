"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatEGP } from '@/lib/currency';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Plus, ShoppingCart, AlertTriangle, CheckCircle2, Clock, Truck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
type PurchaseOrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

interface PurchaseOrderItem {
  itemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  supplierId?: string | null;
  supplierName: string;
  orderDate: string;
  deliveryDate?: string | null;
  total: number;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
}

interface InventoryItem {
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
}

interface Supplier {
  id: string;
  name: string;
  category?: string | null;
  rating?: number | null;
  status: 'Active' | 'Inactive';
  paymentTerms?: string | null;
}

type PurchaseOrderPayload = {
  supplierId?: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery?: string;
  total: number;
  status?: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
};

const mapPurchaseOrderResponse = (row: any): PurchaseOrder => ({
  id: row.id,
  supplierId: row.supplierId ?? null,
  supplierName: row.supplierName ?? row.supplier ?? 'Supplier',
  orderDate: row.orderDate ? new Date(row.orderDate).toISOString() : new Date().toISOString(),
  deliveryDate: row.expectedDelivery ? new Date(row.expectedDelivery).toISOString() : null,
  total: Number(row.total ?? 0),
  status: row.status ?? 'Pending',
  items: Array.isArray(row.items)
    ? row.items.map((item: any) => ({
        itemId: item.itemId ?? undefined,
        description: item.description ?? 'Item',
        quantity: Number(item.quantity ?? 0),
        unitPrice: Number(item.unitPrice ?? 0),
      }))
    : [],
});

const mapInventoryResponse = (row: any): InventoryItem => ({
  id: row.id,
  name: row.name,
  category: row.category ?? null,
  quantity: Number(row.quantity ?? row.stock ?? 0),
  minQuantity: Number(row.minQuantity ?? row.min ?? 0),
  maxQuantity: Number(row.maxQuantity ?? row.max ?? 0),
  status: row.status ?? 'Normal',
  unitCost: Number(row.unitCost ?? 0),
  supplierId: row.supplierId ?? null,
  supplierName: row.supplierName ?? row.supplier ?? null,
});

const mapSupplierResponse = (row: any): Supplier => ({
  id: row.id,
  name: row.name ?? 'Supplier',
  category: row.category ?? null,
  rating: row.rating != null ? Number(row.rating) : null,
  status: row.status === 'Inactive' ? 'Inactive' : 'Active',
  paymentTerms: row.paymentTerms ?? null,
});

const formatDateDisplay = (value?: string | null, language: string = 'en') => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-EG');
};

const getToday = () => new Date().toISOString().split('T')[0];
const getFutureDate = (days = 7) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export default function PurchaseOrdersPage() {
  const { t, language } = useLanguage();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | PurchaseOrderStatus>('all');
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedItemQuantity, setSelectedItemQuantity] = useState(1);
  const [selectedItemPrice, setSelectedItemPrice] = useState("");
  const [newOrderDate, setNewOrderDate] = useState(getToday());
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(getFutureDate());
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const orderTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  }, [orderItems]);
  const availableInventoryItems = useMemo(() => {
    if (!selectedSupplier) return inventoryItems;
    const supplierName = suppliers.find((supplier) => supplier.id === selectedSupplier)?.name ?? '';
    return inventoryItems.filter(
      (item) => item.supplierId === selectedSupplier || (!item.supplierId && item.supplierName === supplierName)
    );
  }, [inventoryItems, selectedSupplier, suppliers]);

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, inventoryRes, suppliersRes] = await Promise.all([
        fetch('/api/purchase-orders'),
        fetch('/api/inventory'),
        fetch('/api/suppliers'),
      ]);

      const ordersPayload = ordersRes.ok ? await ordersRes.json().catch(() => ({})) : {};
      const inventoryPayload = inventoryRes.ok ? await inventoryRes.json().catch(() => ({})) : {};
      const suppliersPayload = suppliersRes.ok ? await suppliersRes.json().catch(() => ({})) : {};

      const mappedOrders = Array.isArray(ordersPayload?.orders)
        ? ordersPayload.orders.map(mapPurchaseOrderResponse)
        : [];
      const mappedInventory = Array.isArray(inventoryPayload?.items)
        ? inventoryPayload.items.map(mapInventoryResponse)
        : [];
      const mappedSuppliers = Array.isArray(suppliersPayload?.suppliers)
        ? suppliersPayload.suppliers.map(mapSupplierResponse)
        : [];

      setPurchaseOrders(mappedOrders);
      setInventoryItems(mappedInventory);
      setSuppliers(mappedSuppliers);
      setLowStockItems(mappedInventory.filter((item) => item.quantity <= item.minQuantity));
    } catch (error) {
      console.error('Error fetching purchase order data', error);
      toast({
        title: t('common.error'),
        description: t('communications.toast.error_fetching'),
        variant: 'destructive',
      });
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = purchaseOrders;

    if (searchTerm) {
      const normalized = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.supplierName.toLowerCase().includes(normalized) ||
        order.id.toLowerCase().includes(normalized)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [purchaseOrders, searchTerm, statusFilter]);

  const resetNewOrderForm = () => {
    setSelectedSupplier("");
    setOrderItems([]);
    setSelectedItemId("");
    setSelectedItemQuantity(1);
    setSelectedItemPrice("");
    setNewOrderDate(getToday());
    setExpectedDeliveryDate(getFutureDate());
    setIsSubmittingOrder(false);
  };

  const openNewOrderDialog = () => {
    resetNewOrderForm();
    setIsNewOrderDialogOpen(true);
  };

  const handleAddItem = () => {
    if (!selectedItemId) {
      toast({
        title: t('common.error'),
        description: 'Please select an item to add.',
        variant: 'destructive',
      });
      return;
    }

    const inventoryItem = inventoryItems.find((item) => item.id === selectedItemId);
    if (!inventoryItem) {
      toast({
        title: t('common.error'),
        description: 'Selected item is no longer available.',
        variant: 'destructive',
      });
      return;
    }

    const parsedUnitCost = Number(inventoryItem.unitCost ?? 0);
    const unitPriceValue = selectedItemPrice
      ? parseFloat(selectedItemPrice)
      : parsedUnitCost;
    const quantityValue = Math.max(1, Number(selectedItemQuantity) || 1);

    setOrderItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.itemId === selectedItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantityValue,
          unitPrice: unitPriceValue,
        };
        return updated;
      }
      return [
        ...prev,
        {
          itemId: selectedItemId,
          description: inventoryItem.name,
          quantity: quantityValue,
          unitPrice: unitPriceValue,
        },
      ];
    });

    setSelectedItemId("");
    setSelectedItemQuantity(1);
    setSelectedItemPrice("");
  };

  const handleOrderItemChange = (itemId: string, field: 'quantity' | 'unitPrice', value: number) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              [field]: field === 'quantity' ? Math.max(1, Math.floor(value) || 1) : Math.max(0, value || 0),
            }
          : item
      )
    );
  };

  const handleRemoveOrderItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const handleCreateOrder = async () => {
    if (!selectedSupplier) {
      toast({
        title: t('common.error'),
        description: 'Please select a supplier.',
        variant: 'destructive',
      });
      return;
    }

    if (!orderItems.length) {
      toast({
        title: t('common.error'),
        description: 'Add at least one item to the order.',
        variant: 'destructive',
      });
      return;
    }

    const supplierRecord = suppliers.find((supplier) => supplier.id === selectedSupplier);
    const preparedItems = orderItems.map((item) => ({
      itemId: item.itemId,
      description: item.description,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
    }));

    const payload: PurchaseOrderPayload = {
      supplierId: selectedSupplier,
      supplierName: supplierRecord?.name ?? 'Supplier',
      orderDate: new Date(newOrderDate || getToday()).toISOString(),
      expectedDelivery: expectedDeliveryDate ? new Date(expectedDeliveryDate).toISOString() : undefined,
      total: Number(orderTotal || 0),
      status: 'Pending',
      items: preparedItems,
    };

    try {
      setIsSubmittingOrder(true);
      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create purchase order');
      toast({
        title: t('suppliers.toast.po_created') || t('common.success'),
        description: t('suppliers.toast.po_created_desc') || 'Purchase order created successfully.',
      });
      resetNewOrderForm();
      setIsNewOrderDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: t('common.error'),
        description: t('suppliers.toast.error_updating') || 'Failed to create purchase order.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Shipped': return <Truck className="h-4 w-4" />;
      case 'Delivered': return <CheckCircle2 className="h-4 w-4" />;
      case 'Cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const createQuickOrder = async (item: InventoryItem) => {
    try {
      const orderQuantity = Math.max(0, item.maxQuantity - item.quantity);
      if (orderQuantity <= 0) {
        toast({ title: t('suppliers.toast.no_low_stock') });
        return;
      }
      const unitPrice = Number(item.unitCost ?? 0);
      const total = orderQuantity * unitPrice;
      const payload: PurchaseOrderPayload = {
        supplierId: item.supplierId ?? undefined,
        supplierName: item.supplierName ?? 'Supplier',
        orderDate: new Date().toISOString(),
        expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        total,
        status: 'Pending',
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
      if (!response.ok) throw new Error('Failed to create quick order');
      fetchData();
      toast({
        title: t('suppliers.toast.quick_order_created'),
        description: t('suppliers.toast.po_created_desc'),
      });
    } catch (error) {
      console.error('Error creating quick order:', error);
      toast({
        title: t('suppliers.toast.error_quick_order'),
        description: t('suppliers.toast.error_quick_order_desc'),
        variant: 'destructive',
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: PurchaseOrderStatus) => {
    try {
      const response = await fetch(`/api/purchase-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update order status');
      fetchData();
      toast({
        title: t('suppliers.toast.status_updated'),
        description: t('suppliers.toast.status_updated_desc'),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: t('suppliers.toast.error_updating_status'),
        variant: 'destructive',
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/purchase-orders/${orderId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete order');
      fetchData();
      toast({
        title: t('common.success'),
        description: t('purchase_orders.delete_order'),
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: t('common.error'),
        description: t('suppliers.toast.error_updating'),
        variant: 'destructive',
      });
    }
  };

  const statusLabel = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Pending':
        return t('common.pending');
      case 'Shipped':
        return t('suppliers.status.shipped');
      case 'Delivered':
        return t('suppliers.status.delivered');
      case 'Cancelled':
        return t('suppliers.status.cancelled');
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('purchase_orders.title')}</h1>
              <p className="text-muted-foreground">
                {t('suppliers.purchase_order_subtitle')}
              </p>
            </div>
            <Button onClick={openNewOrderDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {t('purchase_orders.new_order')}
            </Button>
          </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              {t('purchase_orders.low_stock_alert')} ({lowStockItems.length} {t('purchase_orders.items')})
            </CardTitle>
            <CardDescription>
              {t('purchase_orders.low_stock_description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.supply_chain.current_stock')}: {item.quantity} / {t('dashboard.supply_chain.min_stock')}: {item.minQuantity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('suppliers.supplier')}: {item.supplierName ?? t('common.na')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => createQuickOrder(item)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {t('inventory.quick_order')}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Input
          placeholder={t('purchase_orders.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | PurchaseOrderStatus)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('purchase_orders.filter_by_status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all_status')}</SelectItem>
            <SelectItem value="Pending">{t('common.pending')}</SelectItem>
            <SelectItem value="Shipped">{t('suppliers.status.shipped')}</SelectItem>
            <SelectItem value="Delivered">{t('suppliers.status.delivered')}</SelectItem>
            <SelectItem value="Cancelled">{t('suppliers.status.cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Purchase Orders Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('suppliers.po_number')}</TableHead>
              <TableHead>{t('suppliers.supplier')}</TableHead>
              <TableHead>{t('suppliers.order_date')}</TableHead>
              <TableHead>{t('suppliers.expected_delivery')}</TableHead>
              <TableHead>{t('suppliers.total')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead>{t('purchase_orders.items')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.supplierName}</TableCell>
                <TableCell>{formatDateDisplay(order.orderDate, language)}</TableCell>
                <TableCell>{formatDateDisplay(order.deliveryDate, language)}</TableCell>
                <TableCell>{formatEGP(order.total, true, language)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{statusLabel(order.status)}</span>
                  </Badge>
                </TableCell>
                <TableCell>{order.items?.length ?? 0} {t('purchase_orders.items')}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">{t('common.open_menu')}</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Shipped')}>
                        {t('suppliers.mark_as_shipped')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Delivered')}>
                        {t('suppliers.mark_as_delivered')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'Cancelled')}>
                        {t('suppliers.cancel_order')}
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            {t('purchase_orders.delete_order')}
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('purchase_orders.confirm_delete_description')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteOrder(order.id)}>
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
      </main>

      <Dialog
        open={isNewOrderDialogOpen}
        onOpenChange={(open) => {
          setIsNewOrderDialogOpen(open);
          if (!open) {
            resetNewOrderForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('purchase_orders.new_order')}</DialogTitle>
            <DialogDescription>
              Create a detailed purchase order with supplier items.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('suppliers.supplier')} *
                </label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('suppliers.select_supplier')} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('suppliers.order_date')}</label>
                <Input
                  type="date"
                  value={newOrderDate}
                  onChange={(event) => setNewOrderDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('suppliers.expected_delivery')}</label>
                <Input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(event) => setExpectedDeliveryDate(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('suppliers.total')}</label>
                <Input value={formatEGP(orderTotal, true, language)} disabled />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
                <Select
                  value={selectedItemId}
                  onValueChange={(value) => {
                    setSelectedItemId(value);
                    const inventoryItem = inventoryItems.find((item) => item.id === value);
                    if (inventoryItem) {
                      setSelectedItemPrice(String(inventoryItem.unitCost ?? ''));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('inventory.select_item')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInventoryItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} {item.quantity !== undefined && `(${item.quantity})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={selectedItemQuantity}
                  onChange={(event) => setSelectedItemQuantity(Number(event.target.value) || 1)}
                  placeholder="Qty"
                />
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={selectedItemPrice}
                  onChange={(event) => setSelectedItemPrice(event.target.value)}
                  placeholder="Unit price"
                />
                <Button type="button" onClick={handleAddItem}>
                  {t('inventory.add_item')}
                </Button>
              </div>

              <div className="rounded-lg border">
                {orderItems.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No items added yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('inventory.item')}</TableHead>
                        <TableHead>{t('suppliers.quantity')}</TableHead>
                        <TableHead>{t('suppliers.unit_price')}</TableHead>
                        <TableHead>{t('suppliers.total')}</TableHead>
                        <TableHead className="text-right">{t('table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.itemId}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(event) =>
                                handleOrderItemChange(item.itemId, 'quantity', Number(event.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={item.unitPrice}
                              onChange={(event) =>
                                handleOrderItemChange(item.itemId, 'unitPrice', parseFloat(event.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell>{formatEGP(item.quantity * item.unitPrice, true, language)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveOrderItem(item.itemId)}>
                              {t('common.remove')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('suppliers.total')}</p>
                <p className="text-xl font-semibold">{formatEGP(orderTotal, true, language)}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOrderDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateOrder} disabled={isSubmittingOrder}>
              {isSubmittingOrder ? t('common.please_wait') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
