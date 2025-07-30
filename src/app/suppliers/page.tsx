
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
import { initialSuppliersData, suppliersPageStats, initialPurchaseOrdersData } from "@/lib/data";
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
} from "lucide-react";
import { NewPurchaseOrderDialog } from "@/components/suppliers/new-purchase-order-dialog";
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog";
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { EditSupplierDialog } from '@/components/suppliers/edit-supplier-dialog';

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

export type PurchaseOrder = {
  id: string;
  supplier: string;
  orderDate: string;
  deliveryDate: string | null;
  total: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
};


const iconMap = {
  Building2,
  FileText,
  DollarSign,
  Star,
};

type IconKey = keyof typeof iconMap;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(initialSuppliersData);
  const [supplierToEdit, setSupplierToEdit] = React.useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = React.useState<Supplier | null>(null);
  const [supplierSearchTerm, setSupplierSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');

  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>(initialPurchaseOrdersData);
  const [poSearchTerm, setPoSearchTerm] = React.useState('');
  const [poStatusFilter, setPoStatusFilter] = React.useState('all');
  
  const [isNewPoOpen, setIsNewPoOpen] = React.useState(false);
  const [newPoSupplier, setNewPoSupplier] = React.useState<string | undefined>(undefined);


  const { toast } = useToast();
  
  const supplierCategories = [
    ...new Set(initialSuppliersData.map((s) => s.category)),
  ];

  const handleSaveSupplier = (data: Omit<Supplier, 'id' | 'rating' | 'status'>) => {
    const newSupplier: Supplier = {
      id: `SUP-${Math.floor(100 + Math.random() * 900).toString().padStart(3, '0')}`,
      ...data,
      rating: 5.0,
      status: 'active',
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    toast({
      title: "Supplier Added",
      description: `${newSupplier.name} has been added to your network.`,
    });
  };

  const handleUpdateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    setSupplierToEdit(null);
    toast({
      title: "Supplier Updated",
      description: `${updatedSupplier.name}'s record has been updated.`,
    });
  };

  const handleDeleteSupplier = () => {
    if (supplierToDelete) {
      setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete.id));
      toast({
        title: "Supplier Deleted",
        description: `${supplierToDelete.name} has been deleted.`,
        variant: "destructive"
      });
      setSupplierToDelete(null);
    }
  };

  const handleSavePurchaseOrder = (data: any) => {
    const newPurchaseOrder: PurchaseOrder = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: data.supplier,
      orderDate: new Date(data.orderDate).toLocaleDateString(),
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toLocaleDateString() : null,
      total: `$${data.items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0).toFixed(2)}`,
      status: 'Pending',
    };
    setPurchaseOrders(prev => [newPurchaseOrder, ...prev]);
    toast({
      title: "Purchase Order Created",
      description: `New PO for ${newPurchaseOrder.supplier} has been created.`,
    });
  };

  const openNewPoDialog = (supplierId?: string) => {
    setNewPoSupplier(supplierId);
    setIsNewPoOpen(true);
  };

  const filteredSuppliers = React.useMemo(() => {
    return suppliers
      .filter(supplier =>
        supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
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
                      <TableHead>Payment Terms</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier) => (
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
                            <Badge variant="secondary">
                              {supplier.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{supplier.paymentTerms}</TableCell>
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
                                    <DropdownMenuItem onClick={() => setSupplierToEdit(supplier)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSupplierToDelete(supplier)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => openNewPoDialog(supplier.id)}>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        New Purchase Order
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
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
                    {filteredPurchaseOrders.length > 0 ? (
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
                             <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-3 w-3" />
                                View
                              </Button>
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
          <TabsContent value="receiving">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-muted-foreground">
                No receiving records found.
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
      />
      
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

    </DashboardLayout>
  );
}
