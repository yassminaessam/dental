
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
  MoreHorizontal,
  Plus,
  TrendingDown,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useLanguage } from '@/contexts/LanguageContext';

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
  notes?: string;
};

export default function InventoryPage() {
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const currencyFmt = new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 });
  const numberFmt = new Intl.NumberFormat(locale);
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [itemToEdit, setItemToEdit] = React.useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = React.useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchInventory() {
        try {
            const data = await getCollection<InventoryItem>('inventory');
            setInventory(data);
        } catch (error) {
            toast({ title: t('inventory.toast.error_fetching'), variant: 'destructive'});
        } finally {
            setLoading(false);
        }
    }
    fetchInventory();
  }, [toast, t]);

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
      { title: t('inventory.total_items'), value: numberFmt.format(totalItems), description: t('inventory.all_items_in_inventory') },
      { title: t('inventory.low_stock_items'), value: numberFmt.format(lowStockCount), description: t('inventory.items_needing_attention'), valueClassName: "text-red-500" },
      { title: t('inventory.categories'), value: numberFmt.format(categoryCount), description: t('inventory.total_item_categories') },
      { title: t('inventory.total_value'), value: currencyFmt.format(totalValue), description: t('inventory.estimated_inventory_value') }
    ];
  }, [inventory, lowStockItems, inventoryCategories, t, numberFmt, currencyFmt]);

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
    } catch(e) {
        toast({ title: t('inventory.toast.error_adding'), variant: 'destructive'});
    }
  };

  const handleUpdateItem = async (updatedItem: InventoryItem) => {
    try {
        await updateDocument('inventory', updatedItem.id, updatedItem);
        setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
        setItemToEdit(null);
        toast({
          title: t('inventory.toast.item_updated'),
          description: t('inventory.toast.item_updated_desc'),
        });
    } catch(e) {
        toast({ title: t('inventory.toast.error_updating'), variant: 'destructive'});
    }
  };

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await deleteDocument('inventory', itemToDelete.id);
        setInventory(prev => prev.filter(item => item.id !== itemToDelete.id));
        toast({
          title: t('inventory.toast.item_deleted'),
          description: t('inventory.toast.item_deleted_desc'),
          variant: "destructive",
        });
        setItemToDelete(null);
      } catch(e) {
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
      const orderQuantity = item.max - item.stock;
      const unitPrice = parseFloat(item.unitCost.replace(/[^\d.]/g, ''));
      const total = orderQuantity * unitPrice;

      const newPurchaseOrder = {
        supplier: item.supplier,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total: `EGP ${total.toLocaleString()}`,
        status: 'Pending',
        items: [{
          itemId: item.id,
          description: item.name,
          quantity: orderQuantity,
          unitPrice: unitPrice
        }]
      };

      await setDocument('purchase-orders', `PO-${Date.now()}`, newPurchaseOrder);
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

  const createQuickPurchaseOrder = async (item: InventoryItem) => {
    await handleRestock(item);
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
      <h1 className="text-3xl font-bold">{t('inventory.title')}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleAnalytics}>
              <BarChart className="mr-2 h-4 w-4" />
        {t('nav.analytics')}
            </Button>
            <AddItemDialog 
              onSave={handleSaveItem} 
              open={isAddItemDialogOpen}
              onOpenChange={setIsAddItemDialogOpen}
            />
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
      {t('purchase_orders.low_stock_alert')} ({numberFmt.format(lowStockItems.length)})
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
        {t('inventory.stock')}: {numberFmt.format(item.stock)} / {t('inventory.min')}: {numberFmt.format(item.min)}
                  </p>
                  <p className="text-sm text-muted-foreground">
        {t('inventory.supplier')}: {item.supplier}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => createQuickPurchaseOrder(item)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
        {t('inventory.quick_order')}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleRestock(item)}>
                    <Plus className="mr-2 h-4 w-4" />
        {t('inventory.manual_order')}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <CardTitle>{t('inventory.all_items_in_inventory')}</CardTitle>
            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('inventory.search_items')}
                  className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
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
          <CardContent>
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
                            {item.expires !== "N/A" && (
                              <div className="text-xs text-muted-foreground">
                                {t('inventory.expiry_date')}: {item.expires}
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
                          {t('inventory.min')}: {numberFmt.format(item.min)} | {t('inventory.max')}: {numberFmt.format(item.max)}
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
                          {item.status === 'Low Stock' ? t('inventory.status.low_stock') : item.status === 'Out of Stock' ? t('inventory.status.out_of_stock') : t('inventory.status.normal')}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.unitCost}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{item.location}</TableCell>
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
                            {(item.status === 'Low Stock' || item.status === 'Out of Stock') && (
                              <DropdownMenuItem onClick={() => createQuickPurchaseOrder(item)}>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                {t('inventory.quick_order')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => toast({
                              title: t('inventory.supplier_info'),
                              description: t('inventory.supplier_contact_desc')
                            })}>
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
        />
      )}

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
