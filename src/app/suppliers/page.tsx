
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
import { getCollection, setDocument, updateDocument, deleteDocument } from '@/services/firestore';
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
            const [suppliersData, poData, inventoryData] = await Promise.all([
                getCollection<Supplier>('suppliers'),
                getCollection<PurchaseOrder>('purchase-orders'),
                getCollection<InventoryItem>('inventory'),
            ]);
            setSuppliers(suppliersData);
            setPurchaseOrders(poData);
            setInventory(inventoryData);
        } catch(e) {
            toast({ title: "Error fetching data", variant: 'destructive'});
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
    
    return [
      { title: "Total Suppliers", value: totalSuppliers, icon: "Building2", description: "All active suppliers", valueClassName: "" },
      { title: "Pending POs", value: pendingPOs, icon: "FileText", description: "Orders awaiting shipment", valueClassName: "text-orange-500" },
      { title: "Total PO Value", value: `EGP ${totalPOValue.toLocaleString()}`, icon: "DollarSign", description: "Value of all orders", valueClassName: "" },
      { title: "Top Rated", value: `${topRatedSuppliers} Suppliers`, icon: "Star", description: "Rating of 4.5 or higher", valueClassName: "text-yellow-500" },
    ];
  }, [suppliers, purchaseOrders]);

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
          title: "No Low Stock Items",
          description: `No items from ${supplier.name} are currently low in stock.`,
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
      const updatedPOs = await getCollection<PurchaseOrder>('purchase-orders');
      setPurchaseOrders(updatedPOs);
      
      toast({
        title: "Quick Order Created",
        description: `Created purchase order for ${lowStockFromSupplier.length} low stock items from ${supplier.name}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quick purchase order",
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
          title: "Supplier Added",
          description: `${newSupplier.name} has been added to your network.`,
        });
    } catch(e) {
        toast({ title: "Error adding supplier", variant: 'destructive'});
    }
  };

  const handleUpdateSupplier = async (updatedSupplier: Supplier) => {
    try {
        await updateDocument('suppliers', updatedSupplier.id, updatedSupplier);
        setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
        setSupplierToEdit(null);
        toast({
          title: "Supplier Updated",
          description: `${updatedSupplier.name}'s record has been updated.`,
        });
    } catch(e) {
        toast({ title: "Error updating supplier", variant: 'destructive'});
    }
  };

  const handleDeleteSupplier = async () => {
    if (supplierToDelete) {
      try {
          await deleteDocument('suppliers', supplierToDelete.id);
          setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));
          toast({
            title: "Supplier Deleted",
            description: `${supplierToDelete.name} has been deleted.`,
            variant: "destructive"
          });
          setSupplierToDelete(null);
      } catch(e) {
          toast({ title: "Error deleting supplier", variant: 'destructive'});
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
          title: "Purchase Order Created",
          description: `New PO for ${newPurchaseOrder.supplier} has been created.`,
        });
    } catch(e) {
        toast({ title: "Error creating PO", variant: 'destructive'});
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
          title: "Item Added",
          description: `${newItem.name} has been added to inventory.`,
        });
        setIsAddItemOpen(false); // Close the dialog
    } catch(e) {
        toast({ title: 'Error adding item', variant: 'destructive'});
    }
  };

  const handlePoStatusChange = async (poId: string, status: PurchaseOrder['status']) => {
    try {
        await updateDocument('purchase-orders', poId, { status });
        setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status } : po));
        toast({
            title: "Order Status Updated",
            description: `Order ${poId} has been marked as ${status}.`
        });
    } catch (e) {
        toast({ title: "Error updating status", variant: 'destructive'});
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
        const updatedInventory = await getCollection<InventoryItem>('inventory');
        setInventory(updatedInventory);

        toast({
            title: "Order Received",
            description: `PO ${order.id} has been marked as delivered and inventory has been updated.`,
        });
    } catch (e) {
        toast({ title: "Error receiving order", variant: 'destructive'});
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
            <h1 className="text-3xl font-bold">Suppliers & Purchase Orders</h1>
            <p className="text-muted-foreground">
              Manage suppliers and procurement processes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => openNewPoDialog()}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Purchase Order
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
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="receiving">Receiving</TabsTrigger>
          </TabsList>
          <TabsContent value="suppliers" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Supplier Directory</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search suppliers..."
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                      value={supplierSearchTerm}
                      onChange={(e) => setSupplierSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
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
                      <TableHead>Supplier</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                                {performance.totalOrders} orders
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {performance.onTimeDelivery}% on-time
                              </div>
                              <div className="text-xs text-muted-foreground">
                                EGP {performance.totalValue.toLocaleString()} total
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
                              {supplier.status}
                            </Badge>
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
                                    <DropdownMenuItem onClick={() => createQuickPurchaseOrder(supplier)}>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Quick Order
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSupplierToEdit(supplier)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSupplierToDelete(supplier)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
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
                          No suppliers found.
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
                <CardTitle>Purchase Orders</CardTitle>
                 <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search orders..."
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                      value={poSearchTerm}
                      onChange={(e) => setPoSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={poStatusFilter} onValueChange={setPoStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                               {po.status}
                            </Badge>
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
                                  <DropdownMenuItem onClick={() => setPoToView(po)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handlePoStatusChange(po.id, 'Shipped')}>
                                    Mark as Shipped
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleReceiveOrder(po)} disabled={po.status !== 'Shipped'}>
                                    Mark as Delivered
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handlePoStatusChange(po.id, 'Cancelled')} className="text-destructive">
                                    Cancel Order
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No purchase orders found.
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
                    <CardTitle>Receiving</CardTitle>
                    <p className="text-muted-foreground">
                        Review and receive shipped orders to update your inventory.
                    </p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Expected Delivery</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
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
                                                Receive Items
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No orders awaiting receipt.
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier
              "{supplierToDelete?.name}" from your network.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSupplier}>Delete</AlertDialogAction>
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
