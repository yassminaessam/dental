
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
} from "lucide-react";
import { AddItemDialog } from "@/components/inventory/add-item-dialog";
import { EditItemDialog } from "@/components/inventory/edit-item-dialog";
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
import { getCollection, setDocument, updateDocument, deleteDocument } from '@/services/firestore';

export type InventoryItem = {
  id: string;
  name: string;
  expires: string;
  category: string;
  stock: number;
  min: number;
  max: number;
  status: 'Normal' | 'Low Stock' | 'Out of Stock';
  unitCost: string;
  supplier: string;
  location: string;
};

export default function InventoryPage() {
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [itemToEdit, setItemToEdit] = React.useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = React.useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchInventory() {
        try {
            const data = await getCollection<InventoryItem>('inventory');
            setInventory(data);
        } catch (error) {
            toast({ title: "Error fetching inventory", variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }
    fetchInventory();
  }, [toast]);

  const inventoryCategories = React.useMemo(() => {
    return [...new Set(inventory.map((i) => i.category))];
  }, [inventory]);
  
  const lowStockItems = React.useMemo(() => inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock'), [inventory]);

  const inventoryPageStats = React.useMemo(() => {
    const totalItems = inventory.length;
    const lowStockCount = lowStockItems.length;
    const categoryCount = inventoryCategories.length;
    const totalValue = inventory.reduce((acc, item) => {
        const cost = parseFloat(item.unitCost.replace(/[^0-9.-]+/g, '')) || 0;
        return acc + (cost * item.stock);
    }, 0);

    return [
      { title: "Total Items", value: totalItems, description: "All items in inventory" },
      { title: "Low Stock Items", value: lowStockCount, description: "Items needing attention", valueClassName: "text-red-500" },
      { title: "Categories", value: categoryCount, description: "Total item categories" },
      { title: "Total Value", value: `EGP ${totalValue.toLocaleString()}`, description: "Estimated inventory value" }
    ];
  }, [inventory, lowStockItems, inventoryCategories]);

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
    } catch(e) {
        toast({ title: 'Error adding item', variant: 'destructive'});
    }
  };

  const handleUpdateItem = async (updatedItem: InventoryItem) => {
    try {
        await updateDocument('inventory', updatedItem.id, updatedItem);
        setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        setItemToEdit(null);
        toast({
          title: "Item Updated",
          description: `${updatedItem.name} has been successfully updated.`,
        });
    } catch(e) {
        toast({ title: 'Error updating item', variant: 'destructive'});
    }
  };

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await deleteDocument('inventory', itemToDelete.id);
        setInventory(prev => prev.filter(item => item.id !== itemToDelete.id));
        toast({
          title: "Item Deleted",
          description: `${itemToDelete.name} has been removed from inventory.`,
          variant: "destructive",
        });
        setItemToDelete(null);
      } catch(e) {
        toast({ title: 'Error deleting item', variant: 'destructive'});
      }
    }
  };
  
  const handleAnalytics = () => {
    toast({
        title: "Loading Analytics",
        description: "Inventory analytics dashboard is being prepared.",
    });
  };
  
  const handleRestock = (itemName: string) => {
    toast({
        title: "Restock Requested",
        description: `A purchase order for ${itemName} has been initiated.`,
    });
  };

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
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleAnalytics}>
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <AddItemDialog onSave={handleSaveItem} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {inventoryPageStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
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
          ))}
        </div>

        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {lowStockItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg border bg-card p-3"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.stock} / {item.min} min
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleRestock(item.name)}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Restock
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <CardTitle>Inventory Items</CardTitle>
            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search items..."
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
                  {inventoryCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
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
                  <TableHead className="w-[300px]">Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                            {item.expires !== "N/A" && (
                              <div className="text-xs text-muted-foreground">
                                Expires: {item.expires}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.stock}</div>
                        <div className="text-xs text-muted-foreground">
                          Min: {item.min} | Max: {item.max}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "Low Stock"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.unitCost}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setItemToEdit(item)}>
                            <Pencil className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setItemToDelete(item)}>
                            <Trash2 className="mr-2 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No inventory items found.
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
        />
      )}

      <AlertDialog open={!!itemToDelete} onOpenChange={(isOpen) => !isOpen && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item
              "{itemToDelete?.name}" from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
