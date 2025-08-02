"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface IntegrationStats {
  totalSuppliers: number;
  activeOrders: number;
  inventoryItems: number;
  lowStockItems: number;
  medications: number;
  lowStockMedications: number;
  integrationScore: number;
}

export function SupplyChainIntegration() {
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

  useEffect(() => {
    fetchIntegrationData();
  }, []);

  const fetchIntegrationData = async () => {
    try {
      const [
        suppliersSnapshot,
        purchaseOrdersSnapshot,
        inventorySnapshot,
        medicationsSnapshot,
      ] = await Promise.all([
        getDocs(collection(db, "suppliers")),
        getDocs(collection(db, "purchase-orders")),
        getDocs(collection(db, "inventory")),
        getDocs(collection(db, "medications")),
      ]);

      const suppliers = suppliersSnapshot.docs.map(doc => doc.data());
      const purchaseOrders = purchaseOrdersSnapshot.docs.map(doc => doc.data());
      const inventory = inventorySnapshot.docs.map(doc => doc.data());
      const medications = medicationsSnapshot.docs.map(doc => doc.data());

      const totalSuppliers = suppliers.length;
      const activeOrders = purchaseOrders.filter(po => po.status === 'Pending' || po.status === 'Shipped').length;
      const inventoryItems = inventory.length;
      const lowStockItems = inventory.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length;
      const totalMedications = medications.length;
      const lowStockMedications = medications.filter(med => med.status === 'Low Stock' || med.status === 'Out of Stock').length;

      // Calculate integration score (0-100)
      let integrationScore = 0;
      if (totalSuppliers > 0) integrationScore += 25;
      if (activeOrders > 0) integrationScore += 25;
      if (inventoryItems > 0 && lowStockItems / inventoryItems < 0.2) integrationScore += 25;
      if (totalMedications > 0 && lowStockMedications / totalMedications < 0.2) integrationScore += 25;

      setStats({
        totalSuppliers,
        activeOrders,
        inventoryItems,
        lowStockItems,
        medications: totalMedications,
        lowStockMedications,
        integrationScore,
      });
    } catch (error) {
      console.error("Error fetching integration data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getIntegrationScoreDescription = (score: number) => {
    if (score >= 80) return "Excellent integration";
    if (score >= 60) return "Good integration";
    if (score >= 40) return "Moderate integration";
    return "Poor integration";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Integration</CardTitle>
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
          Supply Chain Integration Dashboard
        </CardTitle>
        <CardDescription>
          Overview of how suppliers, inventory, and pharmacy work together
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
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Truck className="h-5 w-5" />
                Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Suppliers</span>
                <Badge variant="secondary">{stats.totalSuppliers}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Orders</span>
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
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Package className="h-5 w-5" />
                Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total Items</span>
                <Badge variant="secondary">{stats.inventoryItems}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Low Stock</span>
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
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Pill className="h-5 w-5" />
                Pharmacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Medications</span>
                <Badge variant="secondary">{stats.medications}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Low Stock</span>
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
              <CardTitle className="text-base">Automated Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Auto-reorder for low stock items</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Supplier performance tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Pharmacy-inventory integration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm">Purchase order management</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                View Low Stock Items
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <Truck className="mr-2 h-4 w-4" />
                Active Purchase Orders
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Supplier Performance
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Stock Alerts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Alerts */}
        {(stats.lowStockItems > 0 || stats.lowStockMedications > 0) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                Current Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.lowStockItems > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Inventory items running low</span>
                  <Badge variant="destructive">{stats.lowStockItems} items</Badge>
                </div>
              )}
              {stats.lowStockMedications > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medications running low</span>
                  <Badge variant="destructive">{stats.lowStockMedications} medications</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
