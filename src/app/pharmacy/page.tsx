
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
import { initialMedicationInventoryData, pharmacyPageStats } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Search,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  Pill,
  ShoppingCart,
  Pencil,
} from "lucide-react";
import { NewPrescriptionDialog } from "@/components/pharmacy/new-prescription-dialog";
import { AddMedicationDialog } from "@/components/pharmacy/add-medication-dialog";
import { useToast } from '@/hooks/use-toast';

export type Medication = {
  id: string;
  name: string;
  fullName: string;
  strength: string;
  form: string;
  category: string;
  stock: number;
  unitPrice: string;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

const iconMap = {
  Pill,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
};

type IconKey = keyof typeof iconMap;


export default function PharmacyPage() {
    const [medications, setMedications] = React.useState<Medication[]>(initialMedicationInventoryData);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [categoryFilter, setCategoryFilter] = React.useState('all');
    const { toast } = useToast();

    const medicationCategories = [
        ...new Set(initialMedicationInventoryData.map((i) => i.category)),
    ];

    const handleSaveMedication = (data: any) => {
      const newMedication: Medication = {
        id: `MED-${Math.floor(100 + Math.random() * 900).toString().padStart(3, '0')}`,
        name: data.name,
        fullName: data.name,
        strength: data.strength,
        form: data.form,
        category: data.category,
        stock: data.stock,
        unitPrice: `$${parseFloat(data.unitPrice).toFixed(2)}`,
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : 'N/A',
        status: data.stock > 20 ? 'In Stock' : 'Low Stock',
      };
      setMedications(prev => [newMedication, ...prev]);
      toast({
        title: "Medication Added",
        description: `${newMedication.name} has been added to the inventory.`,
      });
    };

    const filteredMedications = React.useMemo(() => {
        return medications
          .filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .filter(med => categoryFilter === 'all' || med.category === categoryFilter);
    }, [medications, searchTerm, categoryFilter]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pharmacy Management</h1>
            <p className="text-muted-foreground">
              Manage medications, prescriptions, and dispensing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NewPrescriptionDialog onSave={() => {}} />
            <AddMedicationDialog onSave={handleSaveMedication} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pharmacyPageStats.map((stat) => {
             const Icon = iconMap[stat.icon as IconKey];
             return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                 <Icon className={cn("h-4 w-4 text-muted-foreground", stat.valueClassName)} />
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
        
        <Tabs defaultValue="medications">
          <TabsList>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="dispensing">Dispensing</TabsTrigger>
            <TabsTrigger value="stock-alerts">Stock Alerts</TabsTrigger>
          </TabsList>
          <TabsContent value="medications" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Medication Inventory</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search medications..."
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
                      {medicationCategories.map((cat) => (
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
                      <TableHead>Medication</TableHead>
                      <TableHead>Form & Strength</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedications.length > 0 ? (
                      filteredMedications.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.fullName}</div>
                          </TableCell>
                          <TableCell>
                             <div className="font-medium">{item.form}</div>
                             <div className="text-xs text-muted-foreground">{item.strength}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{item.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className={cn("font-medium", item.status === 'Low Stock' && 'text-destructive flex items-center gap-2')}>
                                {item.stock}
                                {item.status === 'Low Stock' && <AlertTriangle className="h-4 w-4" />}
                            </div>
                          </TableCell>
                          <TableCell>{item.unitPrice}</TableCell>
                          <TableCell>{item.expiryDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.status === "Low Stock"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {item.status}
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
                        <TableCell colSpan={8} className="h-24 text-center">
                          No medications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
           <TabsContent value="prescriptions">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    No prescriptions found.
                </CardContent>
             </Card>
          </TabsContent>
           <TabsContent value="dispensing">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    No dispensing records found.
                </CardContent>
             </Card>
          </TabsContent>
           <TabsContent value="stock-alerts">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    No stock alerts.
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
