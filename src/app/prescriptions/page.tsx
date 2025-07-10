
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  commonMedicationsData,
  prescriptionPageStats,
  initialPrescriptionRecordsData,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Search,
  Download,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Pill,
} from "lucide-react";
import { NewPrescriptionDialog } from "@/components/pharmacy/new-prescription-dialog";
import { useToast } from '@/hooks/use-toast';

export type Prescription = {
  id: string;
  patient: string;
  medication: string;
  strength: string;
  dosage: string;
  duration: string;
  refills: number;
  doctor: string;
  date: string;
  status: 'Active' | 'Completed';
};

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>(initialPrescriptionRecordsData);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const { toast } = useToast();

  const handleSavePrescription = (data: any) => {
    const newPrescription: Prescription = {
      id: `RX-${Math.floor(100 + Math.random() * 900).toString().padStart(3, '0')}`,
      patient: data.patient,
      medication: data.medication,
      strength: data.dosage, // Assuming dosage field contains strength
      dosage: data.instructions,
      duration: 'As directed',
      refills: data.refills,
      doctor: data.doctor,
      date: new Date(data.date).toLocaleDateString(),
      status: 'Active',
    };
    setPrescriptions(prev => [newPrescription, ...prev]);
    toast({
      title: "Prescription Created",
      description: `A new prescription for ${newPrescription.patient} has been created.`,
    });
  };

  const filteredPrescriptions = React.useMemo(() => {
    return prescriptions
      .filter(p => 
        p.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.medication.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(p => statusFilter === 'all' || p.status.toLowerCase() === statusFilter);
  }, [prescriptions, searchTerm, statusFilter]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Prescription Management</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <NewPrescriptionDialog onSave={handleSavePrescription} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {prescriptionPageStats.map((stat) => (
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

        <Card>
          <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <CardTitle>Prescription Records</CardTitle>
            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search prescriptions..."
                  className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prescription ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage & Instructions</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrescriptions.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.id}</TableCell>
                    <TableCell>{record.patient}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{record.medication}</div>
                          <div className="text-xs text-muted-foreground">
                            {record.strength}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{record.dosage}</div>
                      <div className="text-xs text-muted-foreground">
                        {record.duration}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Refills: {record.refills}
                      </div>
                    </TableCell>
                    <TableCell>{record.doctor}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={record.status === 'Active' ? 'default' : 'outline'}
                        className={cn(
                            record.status === 'Active' && 'bg-foreground text-background hover:bg-foreground/80',
                            record.status === 'Completed' && 'bg-green-100 text-green-800 border-transparent'
                        )}
                      >
                        {record.status === 'Active' ? <Clock className="mr-1 h-3 w-3" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-3 w-3" />
                          View
                        </Button>
                        {record.status === 'Active' && (
                            <Button variant="outline" size="sm">
                                <Send className="mr-2 h-3 w-3" />
                                Send
                            </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                           <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Common Medications Database</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {commonMedicationsData.map((med) => (
                    <Card key={med.name}>
                        <CardHeader>
                            <CardTitle className="text-base">{med.name}</CardTitle>
                            <CardDescription>{med.genericName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{med.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>

      </main>
    </DashboardLayout>
  );
}
