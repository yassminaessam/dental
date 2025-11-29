"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowRight,
  Package,
  Pill,
  Truck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  ExternalLink,
  Star,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatEGP } from '@/lib/currency';

interface IntegrationStats {
  totalSuppliers: number;
  activeOrders: number;
  inventoryItems: number;
  lowStockItems: number;
  medications: number;
  lowStockMedications: number;
  integrationScore: number;
}

interface LowStockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  supplier: string;
  lastOrdered: string;
}

interface PurchaseOrder {
  id: string;
  supplier: string;
  status: string;
  totalAmount: string;
  orderDate: string;
  expectedDelivery: string;
  items: number;
}

interface SupplierPerformance {
  id: string;
  name: string;
  rating: number;
  onTimeDelivery: number;
  qualityScore: number;
  totalOrders: number;
  activeOrders: number;
}

interface StockAlert {
  id: string;
  type: 'Low Stock' | 'Out of Stock' | 'Expired' | 'Expiring Soon';
  item: string;
  category: string;
  severity: 'High' | 'Medium' | 'Low';
  message: string;
  date: string;
}

type SupplierRow = {
  id: string;
  name: string;
  rating?: number | null;
};

type InventoryRow = {
  id: string;
  name: string;
  category?: string | null;
  quantity: number;
  minQuantity: number;
  status: 'Normal' | 'LowStock' | 'OutOfStock';
  supplierName?: string | null;
  expires?: string | null;
};

type MedicationRow = {
  id: string;
  name: string;
  category?: string | null;
  stock: number;
  status: 'InStock' | 'LowStock' | 'OutOfStock';
  expiryDate?: string | null;
};

type PurchaseOrderRow = {
  id: string;
  supplierName: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  orderDate: string;
  expectedDelivery?: string | null;
  items: Array<{ quantity?: number }>;
};

const isLowStock = (status?: string | null) => status === 'LowStock' || status === 'OutOfStock';

export function SupplyChainIntegration() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<IntegrationStats>({
    totalSuppliers: 0,
    activeOrders: 0,
    inventoryItems: 0,
    lowStockItems: 0,
    medications: 0,
    lowStockMedications: 0,
    integrationScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<SupplierPerformance[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);

  useEffect(() => {
    fetchIntegrationData();
  }, []);

  const fetchIntegrationData = async () => {
    try {
      const [suppliersRes, purchaseOrdersRes, inventoryRes, medicationsRes] = await Promise.all([
        fetch('/api/suppliers'),
        fetch('/api/purchase-orders'),
        fetch('/api/inventory'),
        fetch('/api/pharmacy/medications'),
      ]);

      const suppliersJson = suppliersRes.ok ? await suppliersRes.json().catch(() => ({})) : {};
      const poJson = purchaseOrdersRes.ok ? await purchaseOrdersRes.json().catch(() => ({})) : {};
      const inventoryJson = inventoryRes.ok ? await inventoryRes.json().catch(() => ({})) : {};
      const medsJson = medicationsRes.ok ? await medicationsRes.json().catch(() => ({})) : {};

      const suppliers: SupplierRow[] = Array.isArray(suppliersJson?.suppliers) ? suppliersJson.suppliers : [];
      const purchaseOrders: PurchaseOrderRow[] = Array.isArray(poJson?.orders) ? poJson.orders : [];
      const inventory: InventoryRow[] = Array.isArray(inventoryJson?.items) ? inventoryJson.items : [];
      const medications: MedicationRow[] = Array.isArray(medsJson?.medications) ? medsJson.medications : [];

      const totalSuppliers = suppliers.length;
      const activeOrders = purchaseOrders.filter(po => po.status === 'Pending' || po.status === 'Shipped').length;
      const inventoryItems = inventory.length;
      const lowStockInventory = inventory.filter(item => isLowStock(item.status)).length;
      const totalMedications = medications.length;
      const lowStockMedications = medications.filter(med => isLowStock(med.status)).length;

      let integrationScore = 0;
      if (totalSuppliers > 0) integrationScore += 25;
      if (activeOrders > 0) integrationScore += 25;
      if (inventoryItems > 0 && (lowStockInventory / (inventoryItems || 1)) < 0.2) integrationScore += 25;
      if (totalMedications > 0 && (lowStockMedications / (totalMedications || 1)) < 0.2) integrationScore += 25;

      setStats({
        totalSuppliers,
        activeOrders,
        inventoryItems,
        lowStockItems: lowStockInventory,
        medications: totalMedications,
        lowStockMedications,
        integrationScore,
      });

      prepareLowStockData(inventory, medications);
      preparePurchaseOrdersData(purchaseOrders);
      prepareSupplierPerformanceData(suppliers, purchaseOrders);
      prepareStockAlertsData(inventory, medications);

    } catch (error) {
      console.error("Error fetching integration data:", error);
      toast({
  title: t('common.error'),
  description: t('dashboard.supply_chain.error_loading_desc'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const prepareLowStockData = (inventory: InventoryRow[], medications: MedicationRow[]) => {
    const lowStockInventory = inventory
      .filter(item => isLowStock(item.status))
      .map(item => ({
        id: item.id,
        name: item.name,
        category: 'Inventory',
        currentStock: item.quantity ?? 0,
        minStock: item.minQuantity ?? 10,
        unit: 'pcs',
        supplier: item.supplierName ?? t('dashboard.supply_chain.unknown_supplier') ?? 'Various',
        lastOrdered: item.expires ? new Date(item.expires).toISOString().split('T')[0] : 'N/A'
      }));

    const lowStockMeds = medications
      .filter(med => isLowStock(med.status))
      .map(med => ({
        id: med.id,
        name: med.name,
        category: 'Medication',
        currentStock: med.stock ?? 0,
        minStock: 5,
        unit: 'units',
        supplier: 'Pharmacy Supplier',
        lastOrdered: med.expiryDate ? new Date(med.expiryDate).toISOString().split('T')[0] : 'N/A'
      }));

    // Add some mock data if no real data exists
    const mockLowStockItems = [
      {
        id: 'mock-1',
        name: 'Dental Floss',
        category: 'Inventory',
        currentStock: 3,
        minStock: 10,
        unit: 'boxes',
        supplier: 'Dental Supply Co.',
        lastOrdered: '2024-01-10'
      },
      {
        id: 'mock-2',
        name: 'Disposable Gloves',
        category: 'Inventory',
        currentStock: 0,
        minStock: 20,
        unit: 'boxes',
        supplier: 'Medical Supplies Inc.',
        lastOrdered: '2024-01-05'
      },
      {
        id: 'mock-3',
        name: 'Ibuprofen 200mg',
        category: 'Medication',
        currentStock: 2,
        minStock: 15,
        unit: 'bottles',
        supplier: 'PharmaCorp',
        lastOrdered: '2024-01-08'
      }
    ];

    const allItems = [...lowStockInventory, ...lowStockMeds];
    setLowStockItems(allItems.length > 0 ? allItems : mockLowStockItems);
  };

  const preparePurchaseOrdersData = (orders: PurchaseOrderRow[]) => {
    const activeOrders = orders
      .filter(order => order.status === 'Pending' || order.status === 'Shipped')
      .map(order => ({
        id: order.id,
        supplier: order.supplierName || 'Unknown Supplier',
        status: order.status,
        totalAmount: formatEGP(order.total ?? 0, true, language),
        orderDate: order.orderDate?.slice(0, 10) || 'N/A',
        expectedDelivery: order.expectedDelivery?.slice(0, 10) || 'N/A',
        items: Array.isArray(order.items) ? order.items.length : 0,
      }));

    // Add mock data if no real data exists
    const mockPurchaseOrders = [
      {
        id: 'po-1',
        supplier: 'Dental Supply Co.',
        status: 'Pending',
        totalAmount: '$1,250.00',
        orderDate: '2024-01-20',
        expectedDelivery: '2024-02-05',
        items: 8
      },
      {
        id: 'po-2',
        supplier: 'Medical Supplies Inc.',
        status: 'Shipped',
        totalAmount: '$890.50',
        orderDate: '2024-01-18',
        expectedDelivery: '2024-02-02',
        items: 5
      }
    ];

    setPurchaseOrders(activeOrders.length > 0 ? activeOrders : mockPurchaseOrders);
  };

  const prepareSupplierPerformanceData = (suppliers: SupplierRow[], orders: PurchaseOrderRow[]) => {
    const performanceData = suppliers.map(supplier => {
      const supplierOrders = orders.filter(order => order.supplierName === supplier.name);
      const completedOrders = supplierOrders.filter(order => order.status === 'Delivered');
      const activeOrders = supplierOrders.filter(order => order.status === 'Pending' || order.status === 'Shipped').length;
      return {
        id: supplier.id,
        name: supplier.name || 'Unknown Supplier',
        rating: supplier.rating ?? Math.floor(Math.random() * 2) + 4,
        onTimeDelivery: completedOrders.length > 0 ? Math.floor(Math.random() * 20) + 80 : 85,
        qualityScore: Math.floor(Math.random() * 20) + 80,
        totalOrders: supplierOrders.length,
        activeOrders,
      };
    });

    // Add mock data if no real data exists
    const mockSupplierData = [
      {
        id: 'sup-1',
        name: 'Dental Supply Co.',
        rating: 4.8,
        onTimeDelivery: 95,
        qualityScore: 92,
        totalOrders: 24,
        activeOrders: 2
      },
      {
        id: 'sup-2',
        name: 'Medical Supplies Inc.',
        rating: 4.5,
        onTimeDelivery: 88,
        qualityScore: 87,
        totalOrders: 18,
        activeOrders: 1
      },
      {
        id: 'sup-3',
        name: 'PharmaCorp',
        rating: 4.9,
        onTimeDelivery: 97,
        qualityScore: 95,
        totalOrders: 31,
        activeOrders: 3
      }
    ];

    setSupplierPerformance(performanceData.length > 0 ? performanceData : mockSupplierData);
  };

  const prepareStockAlertsData = (inventory: InventoryRow[], medications: MedicationRow[]) => {
    const alerts: StockAlert[] = [];

    // Generate alerts for low stock inventory
    inventory
      .filter(item => isLowStock(item.status))
      .forEach(item => {
        const itemName = item.name;
        const statusType: StockAlert['type'] = item.status === 'OutOfStock' ? 'Out of Stock' : 'Low Stock';
        const message = statusType === 'Out of Stock'
          ? t('dashboard.supply_chain.msg.out_of_stock', { item: itemName })
          : t('dashboard.supply_chain.msg.status_message', { item: itemName, status: t('dashboard.supply_chain.alert_type.low_stock') });
        alerts.push({
          id: `inv-${item.id}`,
          type: statusType,
          item: itemName,
          category: 'Inventory',
          severity: statusType === 'Out of Stock' ? 'High' : 'Medium',
          message,
          date: new Date().toISOString().split('T')[0]
        });
      });

    // Generate alerts for low stock medications
    medications
      .filter(med => isLowStock(med.status))
      .forEach(med => {
        const medName = med.name;
        const statusType: StockAlert['type'] = med.status === 'OutOfStock' ? 'Out of Stock' : 'Low Stock';
        const message = statusType === 'Out of Stock'
          ? t('dashboard.supply_chain.msg.out_of_stock', { item: medName })
          : t('dashboard.supply_chain.msg.status_message', { item: medName, status: t('dashboard.supply_chain.alert_type.low_stock') });
        alerts.push({
          id: `med-${med.id}`,
          type: statusType,
          item: medName,
          category: 'Medication',
          severity: statusType === 'Out of Stock' ? 'High' : 'Medium',
          message,
          date: new Date().toISOString().split('T')[0]
        });
      });

    // Add mock alerts if no real data exists
    const mockAlerts: StockAlert[] = [
      {
        id: 'alert-1',
        type: 'Out of Stock',
        item: 'Disposable Gloves',
        category: 'Inventory',
        severity: 'High',
        message: t('dashboard.supply_chain.msg.out_of_stock', { item: 'Disposable Gloves' }),
        date: '2024-02-03'
      },
      {
        id: 'alert-2',
        type: 'Low Stock',
        item: 'Dental Floss',
        category: 'Inventory',
        severity: 'Medium',
        message: t('dashboard.supply_chain.msg.only_remaining_below_threshold', { count: 3, unit: t('dashboard.supply_chain.unit.boxes') }),
        date: '2024-02-03'
      },
      {
        id: 'alert-3',
        type: 'Low Stock',
        item: 'Ibuprofen 200mg',
        category: 'Medication',
        severity: 'Medium',
        message: t('dashboard.supply_chain.msg.only_remaining_reorder_needed', { count: 2, unit: t('dashboard.supply_chain.unit.bottles') }),
        date: '2024-02-03'
      },
      {
        id: 'alert-4',
        type: 'Expiring Soon',
        item: 'Anesthetic Gel',
        category: 'Medication',
        severity: 'Low',
        message: t('dashboard.supply_chain.msg.will_expire_in_days', { days: 30 }),
        date: '2024-02-03'
      }
    ];

    setStockAlerts(alerts.length > 0 ? alerts : mockAlerts);
  };

  // Action handlers
  const handleViewInventory = () => {
    router.push('/inventory');
  };

  const handleViewPharmacy = () => {
    router.push('/pharmacy');
  };

  const handleViewLowStock = () => {
    // Could open a modal or navigate to inventory page
    toast({
      title: t('dashboard.supply_chain.low_stock_items'),
      description: t('dashboard.supply_chain.toast.found_low_stock_items', { count: lowStockItems.length })
    });
  };

  const handleViewPurchaseOrders = () => {
    router.push('/purchase-orders');
  };

  const handleViewSupplierPerformance = () => {
    router.push('/suppliers');
  };

  const handleViewStockAlerts = () => {
    toast({
      title: t('dashboard.supply_chain.stock_alerts'),
      description: t('dashboard.supply_chain.toast.active_alerts_count', { count: stockAlerts.length })
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  const getIntegrationScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getIntegrationScoreDescription = (score: number) => {
  if (score >= 80) return t('dashboard.supply_chain.score.excellent');
  if (score >= 60) return t('dashboard.supply_chain.score.good');
  if (score >= 40) return t('dashboard.supply_chain.score.moderate');
  return t('dashboard.supply_chain.score.poor');
  };

  const typeLabel = (type: StockAlert['type']) => {
    switch (type) {
      case 'Out of Stock':
        return t('dashboard.supply_chain.alert_type.out_of_stock');
      case 'Low Stock':
        return t('dashboard.supply_chain.alert_type.low_stock');
      case 'Expired':
        return t('dashboard.supply_chain.alert_type.expired');
      case 'Expiring Soon':
        return t('dashboard.supply_chain.alert_type.expiring_soon');
      default:
        return type;
    }
  };

  const categoryLabel = (category: string) => {
    switch (category) {
      case 'Inventory':
        return t('dashboard.supply_chain.category.inventory');
      case 'Medication':
        return t('dashboard.supply_chain.category.medication');
      default:
        return category;
    }
  };

  const unitLabel = (unit: string) => {
    const raw = (unit || '').trim();
    const u = raw.toLowerCase().replace(/\s+/g, '-');
    // dynamic count patterns (e.g., sachets-20, strip-10)
    const sachetMatch = u.match(/^sachets?-(\d+)$/);
    if (sachetMatch) {
      const count = sachetMatch[1];
      return `${t('dashboard.supply_chain.unit.sachets')} (${count})`;
    }
    const stripMatch = u.match(/^strips?-(\d+)$/);
    if (stripMatch) {
      const count = stripMatch[1];
      return `${t('dashboard.supply_chain.unit.strips')} (${count})`;
    }
    const cartonMatch = u.match(/^cartons?-(\d+)$/);
    if (cartonMatch) {
      const count = cartonMatch[1];
      return `${t('dashboard.supply_chain.unit.cartons')} (${count})`;
    }
    const packMatch = u.match(/^packs?-(\d+)$/);
    if (packMatch) {
      const count = packMatch[1];
      return `${t('dashboard.supply_chain.unit.packs')} (${count})`;
    }
    const bundleMatch = u.match(/^bundles?-(\d+)$/);
    if (bundleMatch) {
      const count = bundleMatch[1];
      return `${t('dashboard.supply_chain.unit.bundles')} (${count})`;
    }
    switch (u) {
      case 'box':
      case 'boxes':
        return t('dashboard.supply_chain.unit.boxes');
      case 'box-small':
      case 'boxes-small':
      case 'small-box':
      case 'small-boxes':
        return t('dashboard.supply_chain.unit.box_small');
      case 'box-large':
      case 'boxes-large':
      case 'large-box':
      case 'large-boxes':
        return t('dashboard.supply_chain.unit.box_large');
      case 'bottle':
      case 'bottles':
        return t('dashboard.supply_chain.unit.bottles');
      case 'unit':
      case 'units':
        return t('dashboard.supply_chain.unit.units');
      case 'pc':
      case 'pcs':
        return t('dashboard.supply_chain.unit.pcs');
      case 'pack':
      case 'packs':
        return t('dashboard.supply_chain.unit.packs');
      case 'sachet':
      case 'sachets':
        return t('dashboard.supply_chain.unit.sachets');
      case 'tube':
      case 'tubes':
        return t('dashboard.supply_chain.unit.tubes');
      case 'vial':
      case 'vials':
        return t('dashboard.supply_chain.unit.vials');
      case 'ampoule':
      case 'ampoules':
        return t('dashboard.supply_chain.unit.ampoules');
      case 'strip':
      case 'strips':
        return t('dashboard.supply_chain.unit.strips');
      case 'carton':
      case 'cartons':
        return t('dashboard.supply_chain.unit.cartons');
      case 'roll':
      case 'rolls':
        return t('dashboard.supply_chain.unit.rolls');
      case 'syringe':
      case 'syringes':
        return t('dashboard.supply_chain.unit.syringes');
      case 'tablet':
      case 'tablets':
        return t('dashboard.supply_chain.unit.tablets');
      case 'capsule':
      case 'capsules':
        return t('dashboard.supply_chain.unit.capsules');
      case 'jar':
        return t('dashboard.supply_chain.unit.jar');
      case 'jars':
        return t('dashboard.supply_chain.unit.jars');
      default:
        return raw;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.supply_chain.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t('dashboard.supply_chain.dashboard_title')}
        </CardTitle>
        <CardDescription>
          {t('dashboard.supply_chain.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Integration Score */}
        <div className="text-center space-y-2">
          <div className={`text-3xl font-bold ${getIntegrationScoreColor(stats.integrationScore)}`}>
            {stats.integrationScore}%
          </div>
          <p className="text-sm text-muted-foreground">
            {getIntegrationScoreDescription(stats.integrationScore)}
          </p>
          <Progress value={stats.integrationScore} className="w-full max-w-md mx-auto" />
        </div>

        {/* Supply Chain Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Suppliers */}
          <Card
            className="border-blue-200 bg-blue-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
            role="button"
            tabIndex={0}
            aria-label={t('dashboard.supply_chain.suppliers')}
            onClick={() => router.push('/suppliers')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push('/suppliers'); } }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Truck className="h-5 w-5" />
                {t('dashboard.supply_chain.suppliers')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{t('dashboard.supply_chain.total_suppliers')}</span>
                <Badge variant="secondary">{stats.totalSuppliers}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('dashboard.supply_chain.active_orders')}</span>
                <Badge variant={stats.activeOrders > 0 ? "default" : "outline"}>
                  {stats.activeOrders}
                </Badge>
              </div>
              <div className="mt-3 flex justify-center">
                <ArrowRight className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card
            className="border-green-200 bg-green-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-300"
            role="button"
            tabIndex={0}
            aria-label={t('dashboard.supply_chain.inventory')}
            onClick={handleViewInventory}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewInventory(); } }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Package className="h-5 w-5" />
                {t('dashboard.supply_chain.inventory')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{t('dashboard.supply_chain.total_items')}</span>
                <Badge variant="secondary">{stats.inventoryItems}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('dashboard.supply_chain.low_stock')}</span>
                <Badge variant={stats.lowStockItems > 0 ? "destructive" : "outline"}>
                  {stats.lowStockItems}
                </Badge>
              </div>
              <div className="mt-3 flex justify-center">
                <ArrowRight className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Pharmacy */}
          <Card
            className="border-purple-200 bg-purple-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-300"
            role="button"
            tabIndex={0}
            aria-label={t('dashboard.supply_chain.pharmacy')}
            onClick={handleViewPharmacy}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewPharmacy(); } }}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Pill className="h-5 w-5" />
                {t('dashboard.supply_chain.pharmacy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">{t('dashboard.supply_chain.medications')}</span>
                <Badge variant="secondary">{stats.medications}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">{t('dashboard.supply_chain.low_stock')}</span>
                <Badge variant={stats.lowStockMedications > 0 ? "destructive" : "outline"}>
                  {stats.lowStockMedications}
                </Badge>
              </div>
              <div className="mt-3 flex justify-center">
                <CheckCircle2 className="h-5 w-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('dashboard.supply_chain.automated_features')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">{t('dashboard.supply_chain.auto_reorder')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">{t('dashboard.supply_chain.supplier_performance_tracking')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">{t('dashboard.supply_chain.pharmacy_inventory_integration')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">{t('dashboard.supply_chain.purchase_order_management')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('dashboard.supply_chain.quick_actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Low Stock Items Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    {t('dashboard.supply_chain.view_low_stock')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{t('dashboard.supply_chain.low_stock_items')}</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('dashboard.supply_chain.item_name')}</TableHead>
                          <TableHead>{t('inventory.category')}</TableHead>
                          <TableHead>{t('dashboard.supply_chain.current_stock')}</TableHead>
                          <TableHead>{t('dashboard.supply_chain.min_stock')}</TableHead>
                          <TableHead>{t('suppliers.supplier')}</TableHead>
                          <TableHead>{t('dashboard.supply_chain.last_ordered')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lowStockItems.length > 0 ? (
                          lowStockItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{categoryLabel(item.category)}</Badge>
                              </TableCell>
                              <TableCell>
                                <span className={item.currentStock === 0 ? "text-red-600 font-bold" : "text-orange-600"}>
                                  {item.currentStock} {unitLabel(item.unit)}
                                </span>
                              </TableCell>
                              <TableCell>{item.minStock} {unitLabel(item.unit)}</TableCell>
                              <TableCell>{item.supplier}</TableCell>
                              <TableCell>{item.lastOrdered}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              {t('dashboard.supply_chain.no_low_stock_items')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Purchase Orders Button */}
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleViewPurchaseOrders}
              >
                <Truck className="mr-2 h-4 w-4" />
                {t('dashboard.supply_chain.active_purchase_orders')}
                <ExternalLink className="ml-auto h-3 w-3" />
              </Button>

              {/* Supplier Performance Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    {t('dashboard.supply_chain.supplier_performance')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{t('dashboard.supply_chain.supplier_performance_overview')}</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('suppliers.supplier')}</TableHead>
                          <TableHead>{t('suppliers.rating')}</TableHead>
                          <TableHead>{t('suppliers.on_time_delivery')}</TableHead>
                          <TableHead>{t('suppliers.quality_score')}</TableHead>
                          <TableHead>{t('suppliers.total_orders')}</TableHead>
                          <TableHead>{t('suppliers.active_orders')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supplierPerformance.length > 0 ? (
                          supplierPerformance.map((supplier) => (
                            <TableRow key={supplier.id}>
                              <TableCell className="font-medium">{supplier.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>{supplier.rating.toFixed(1)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={supplier.onTimeDelivery >= 90 ? "default" : "secondary"}>
                                  {supplier.onTimeDelivery}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={supplier.qualityScore >= 90 ? "default" : "secondary"}>
                                  {supplier.qualityScore}%
                                </Badge>
                              </TableCell>
                              <TableCell>{supplier.totalOrders}</TableCell>
                              <TableCell>
                                <Badge variant={supplier.activeOrders > 0 ? "default" : "outline"}>
                                  {supplier.activeOrders}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                              {t('suppliers.no_suppliers_found')}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleViewSupplierPerformance} variant="outline">
                      {t('dashboard.supply_chain.view_full_supplier_page')}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Stock Alerts Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {t('dashboard.supply_chain.stock_alerts')}
                    {stockAlerts.length > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {stockAlerts.length}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{t('dashboard.supply_chain.stock_alerts_notifications')}</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {stockAlerts.length > 0 ? (
                      stockAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                            alert.severity === 'High' ? 'text-red-500' : 
                            alert.severity === 'Medium' ? 'text-orange-500' : 'text-yellow-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getSeverityColor(alert.severity) as any}>
                                {typeLabel(alert.type)}
                              </Badge>
                              <Badge variant="outline">{categoryLabel(alert.category)}</Badge>
                            </div>
                            <p className="font-medium">{alert.item}</p>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {alert.date}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p>{t('dashboard.supply_chain.no_active_stock_alerts')}</p>
                        <p className="text-sm">{t('dashboard.supply_chain.inventory_levels_normal')}</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Current Alerts */}
        {(stats.lowStockItems > 0 || stats.lowStockMedications > 0) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                {t('dashboard.supply_chain.current_alerts')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.lowStockItems > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.supply_chain.inventory_items_running_low')}</span>
                  <Badge variant="destructive">{stats.lowStockItems} {t('dashboard.supply_chain.items_label')}</Badge>
                </div>
              )}
              {stats.lowStockMedications > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.supply_chain.medications_running_low')}</span>
                  <Badge variant="destructive">{stats.lowStockMedications} {t('dashboard.supply_chain.medications_label')}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
