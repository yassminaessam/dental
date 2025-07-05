
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
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
  treatmentCategories,
  treatmentPageStats,
  treatmentStats,
  initialTreatmentsData,
} from "@/lib/data";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { NewTreatmentPlanDialog } from "@/components/treatments/new-treatment-plan-dialog";

export type Treatment = {
  id: string;
  date: string;
  patient: string;
  procedure: string;
  doctor: string;
  tooth: string | null;
  cost: string;
  status: 'In Progress' | 'Completed' | 'Pending';
  followUp: string | null;
};

export default function TreatmentsPage() {
  const [treatments, setTreatments] = React.useState<Treatment[]>(initialTreatmentsData);

  const handleSavePlan = (data: any) => {
    const newTreatment: Treatment = {
      id: `TRT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date(data.startDate).toLocaleDateString(),
      patient: data.patient,
      procedure: data.treatmentName,
      doctor: data.doctor,
      tooth: 'Multiple',
      cost: '$' + Math.floor(500 + Math.random() * 2000),
      status: 'Pending',
      followUp: new Date(data.endDate).toLocaleDateString(),
    };
    setTreatments(prev => [newTreatment, ...prev]);
  };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Treatments</h1>
          <NewTreatmentPlanDialog onSave={handleSavePlan} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {treatmentPageStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {treatmentCategories.map((category) => (
            <Card key={category.name}>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  {category.name}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">{category.count}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      category.color
                    )}
                  >
                    {category.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Treatment Records</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search treatments..."
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Procedure</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Tooth</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Follow-up</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treatments.length > 0 ? (
                      treatments.map((treatment) => (
                        <TableRow key={treatment.id}>
                          <TableCell>{treatment.date}</TableCell>
                          <TableCell>{treatment.patient}</TableCell>
                          <TableCell>{treatment.procedure}</TableCell>
                          <TableCell>{treatment.doctor}</TableCell>
                          <TableCell>{treatment.tooth ?? 'N/A'}</TableCell>
                          <TableCell>{treatment.cost}</TableCell>
                          <TableCell>{treatment.status}</TableCell>
                          <TableCell>{treatment.followUp ?? 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          No records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
