
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
import { initialSuppliersData, suppliersPageStats } from "@/lib/data";
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
} from "lucide-react";
import { NewPurchaseOrderDialog } from "@/components/suppliers/new-purchase-order-dialog";
import { AddSupplierDialog } from "@/components/suppliers/add-supplier-dialog";
import { useToast } from '@/hooks/use-toast';

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

const iconMap = {
  Building2,
  FileText,
  DollarSign,
  Star,
};

type IconKey = keyof typeof iconMap;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(initialSuppliersData);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
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

  const filteredSuppliers = React.useMemo(() => {
    return suppliers
      .filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(supplier =>
        categoryFilter === 'all' || supplier.category.toLowerCase() === categoryFilter.toLowerCase()
      );
  }, [suppliers, searchTerm, categoryFilter]);

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
            <NewPurchaseOrderDialog />
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Pencil className="mr-2 h-3 w-3" />
                                Edit
                              </Button>
                              <Button variant="outline" size="icon">
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            </div>
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
          <TabsContent value="purchase-orders">
            <Card>
              <CardContent className="flex h-48 items-center justify-center p-6 text-muted-foreground">
                No purchase orders found.
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
    </DashboardLayout>
  );
}
