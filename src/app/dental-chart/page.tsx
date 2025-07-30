
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
import { initialDentalChartData, dentalChartPatients, dentalChartStats } from "@/lib/data";
import { Download, Printer, RotateCw, Search, User } from "lucide-react";
import InteractiveDentalChart from "@/components/dental-chart/interactive-dental-chart";
import { ToothDetailCard } from '@/components/dental-chart/tooth-detail-card';
import { ToothHistoryDialog } from '@/components/dental-chart/tooth-history-dialog';
import { useToast } from '@/hooks/use-toast';

export type ToothCondition = 'healthy' | 'cavity' | 'filling' | 'crown' | 'missing' | 'root-canal';

export interface Tooth {
    id: number;
    condition: ToothCondition;
    history: { date: string; condition: ToothCondition; notes: string }[];
}


export default function DentalChartPage() {
    const [chartData, setChartData] = React.useState<Record<number, Tooth>>({ ...initialDentalChartData });
    const [selectedTooth, setSelectedTooth] = React.useState<Tooth | null>(null);
    const [historyTooth, setHistoryTooth] = React.useState<Tooth | null>(null);
    const [highlightedCondition, setHighlightedCondition] = React.useState<ToothCondition | 'all'>('all');
    const { toast } = useToast();

    const handleToothSelect = (toothId: number) => {
        setSelectedTooth(chartData[toothId] || null);
    };

    const handleUpdateCondition = (toothId: number, condition: ToothCondition) => {
        const newChartData = { ...chartData };
        const toothToUpdate = { ...newChartData[toothId] };
        
        toothToUpdate.condition = condition;
        toothToUpdate.history = [
            ...toothToUpdate.history,
            { date: new Date().toLocaleDateString(), condition: condition, notes: `Condition changed to ${condition}` }
        ];

        newChartData[toothId] = toothToUpdate;
        setChartData(newChartData);
        setSelectedTooth(newChartData[toothId]);
        toast({
            title: `Tooth ${toothId} Updated`,
            description: `Condition set to ${condition.replace('-', ' ')}.`,
        });
    };
    
    const handleResetChart = () => {
        setChartData({ ...initialDentalChartData });
        setSelectedTooth(null);
        setHighlightedCondition('all');
        toast({
            title: 'Chart Reset',
            description: 'The dental chart has been reset to its initial state.',
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        toast({
            title: 'Exporting Chart',
            description: 'The dental chart is being prepared for export.',
        });
    };

    const handlePatientChange = (patientId: string) => {
        handleResetChart();
        const patientName = dentalChartPatients.find(p => p.id === patientId)?.name;
        toast({
            title: 'Patient Changed',
            description: `Displaying chart for ${patientName}.`,
        });
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const toothId = parseInt(event.target.value, 10);
        if (chartData[toothId]) {
            handleToothSelect(toothId);
        } else if (event.target.value === '') {
            setSelectedTooth(null);
        }
    };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Dental Chart</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleResetChart}>
              <RotateCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              Patient Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select onValueChange={handlePatientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {dentalChartPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tooth number..."
                className="w-full rounded-lg bg-background pl-8"
                onChange={handleSearch}
              />
            </div>
            <Select onValueChange={(value) => setHighlightedCondition(value as ToothCondition | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="cavity">Cavities</SelectItem>
                <SelectItem value="filling">Filled</SelectItem>
                <SelectItem value="crown">Crowned</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="root-canal">Root Canal</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {dentalChartStats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className={`h-3 w-3 rounded-full ${stat.color} flex-shrink-0`}></span>
                <div>
                  <div className="text-sm text-muted-foreground">{stat.name}</div>
                  <div className="text-lg font-bold">{Object.values(chartData).filter(t => t.condition === stat.name.toLowerCase().replace(' ', '-')).length}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <InteractiveDentalChart
                chartData={chartData}
                selectedToothId={selectedTooth?.id || null}
                highlightedCondition={highlightedCondition}
                onToothSelect={handleToothSelect}
            />
          </div>
          <div className="lg:col-span-1">
            <ToothDetailCard 
                tooth={selectedTooth} 
                onUpdateCondition={handleUpdateCondition}
                onViewHistory={(tooth) => setHistoryTooth(tooth)}
                onClose={() => setSelectedTooth(null)}
            />
          </div>
        </div>

      </main>

      <ToothHistoryDialog
        tooth={historyTooth}
        open={!!historyTooth}
        onOpenChange={(isOpen) => !isOpen && setHistoryTooth(null)}
      />
    </DashboardLayout>
  );
}
