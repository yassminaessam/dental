
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
import { medicationInventoryData, pharmacyPageStats } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Plus,
  Search,
  ClipboardPen,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  Pill,
  ShoppingCart,
  Pencil,
} from "lucide-react";

const iconMap = {
  Pill,
  AlertTriangle,
  CalendarClock,
  ClipboardList,
};

type IconKey = keyof typeof iconMap;


export default function PharmacyPage() {
    const medicationCategories = [
        ...new Set(medicationInventoryData.map((i) => i.category)),
    ];
  return (
    <DashboardLayout>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pharmacy Management</h1>
            <p className="text-muted-foreground">
              Manage medications, prescriptions, and dispensing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <ClipboardPen className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
                <CardTitle>Medication Inventory</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search medications..."
                      className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
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
                    {medicationInventoryData.length > 0 ? (
                      medicationInventoryData.map((item) => (
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
