"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
  DialogTrigger,
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
import { CalendarIcon, MoreHorizontal, Plus, ShoppingCart, AlertTriangle, CheckCircle2, Clock, Truck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { collection, getDocs, addDocument as addDoc, deleteDocument, doc, updateDocument, db } from "@/services/firestore";

interface PurchaseOrderItem {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  supplier: string;
  orderDate: string;
  deliveryDate: string;
  total: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: PurchaseOrderItem[];
}

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  min: number;
  max: number;
  status: string;
  unitCost: string;
  supplier: string;
  category: string;
}

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  status: string;
  paymentTerms: string;
}

export default function PurchaseOrdersPage() {
  const { t, language } = useLanguage();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [purchaseOrders, searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      // Fetch purchase orders
      const ordersSnapshot = await getDocs(collection(db, "purchase-orders"));
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PurchaseOrder[];
      setPurchaseOrders(ordersData);

      // Fetch inventory items
      const inventorySnapshot = await getDocs(collection(db, "inventory"));
      const inventoryData = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
      setInventoryItems(inventoryData);

      // Fetch suppliers
      const suppliersSnapshot = await getDocs(collection(db, "suppliers"));
      const suppliersData = suppliersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Supplier[];
      setSuppliers(suppliersData);

      // Find low stock items
      const lowStock = inventoryData.filter(item => item.stock <= item.min);
      setLowStockItems(lowStock);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: t('common.error'),
        description: t('communications.toast.error_fetching'),
        variant: "destructive",
      });
    }
  };

  const filterOrders = () => {
    let filtered = purchaseOrders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
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
      const orderQuantity = item.max - item.stock;
      const unitPrice = parseFloat(item.unitCost.replace(/[^\d.]/g, ''));
      const total = orderQuantity * unitPrice;

      const newOrder = {
        supplier: item.supplier,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total: `EGP ${total.toLocaleString()}`,
        status: 'Pending' as const,
        items: [{
          itemId: item.id,
          description: item.name,
          quantity: orderQuantity,
          unitPrice: unitPrice
        }]
      };

      await addDoc("purchase-orders", newOrder as any);
      fetchData();
      toast({
        title: t('suppliers.toast.quick_order_created'),
        description: t('suppliers.toast.po_created_desc'),
      });
    } catch (error) {
      console.error("Error creating quick order:", error);
      toast({
        title: t('suppliers.toast.error_quick_order'),
        description: t('suppliers.toast.error_quick_order_desc'),
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDocument("purchase-orders", orderId, { status: newStatus } as any);
      fetchData();
      toast({
        title: t('suppliers.toast.status_updated'),
        description: t('suppliers.toast.status_updated_desc'),
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: t('suppliers.toast.error_updating_status'),
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDocument("purchase-orders", orderId);
      fetchData();
      toast({
        title: t('common.success'),
        description: t('purchase_orders.delete_order'),
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: t('common.error'),
        description: t('suppliers.toast.error_updating'),
        variant: "destructive",
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
            <Button onClick={() => setIsNewOrderDialogOpen(true)}>
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
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.supply_chain.current_stock')}: {item.stock} / {t('dashboard.supply_chain.min_stock')}: {item.min}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t('suppliers.supplier')}: {item.supplier}
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                <TableCell>{order.supplier}</TableCell>
                <TableCell>{order.orderDate}</TableCell>
                <TableCell>{order.deliveryDate}</TableCell>
                <TableCell>{order.total}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{statusLabel(order.status)}</span>
                  </Badge>
                </TableCell>
                <TableCell>{order.items.length} {t('purchase_orders.items')}</TableCell>
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
    </DashboardLayout>
  );
}
