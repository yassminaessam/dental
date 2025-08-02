
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
import { allHealthyDentalChart } from "@/lib/data/dental-chart-data";
import { Download, Printer, RotateCw, Search, User, Loader2 } from "lucide-react";
import InteractiveDentalChart from "@/components/dental-chart/interactive-dental-chart";
import { ToothDetailCard } from '@/components/dental-chart/tooth-detail-card';
import { EnhancedToothDetailCard } from '@/components/dental-chart/enhanced-tooth-detail-card';
import { ToothHistoryDialog } from '@/components/dental-chart/tooth-history-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@/app/patients/page';
import { getCollection, setDocument } from '@/services/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type ToothCondition = 'healthy' | 'cavity' | 'filling' | 'crown' | 'missing' | 'root-canal';

export interface Tooth {
    id: number;
    condition: ToothCondition;
    history: { date: string; condition: ToothCondition; notes: string }[];
}

const dentalChartStats = [
  { name: 'Healthy', color: 'bg-green-200' },
  { name: 'Cavity', color: 'bg-red-500' },
  { name: 'Filling', color: 'bg-blue-500' },
  { name: 'Crown', color: 'bg-purple-500' },
  { name: 'Missing', color: 'bg-gray-400' },
  { name: 'Root Canal', color: 'bg-yellow-500' },
];

export default function DentalChartPage() {
    const [loading, setLoading] = React.useState(false);
    const [patients, setPatients] = React.useState<Patient[]>([]);
    const [chartData, setChartData] = React.useState<Record<number, Tooth>>({ ...allHealthyDentalChart });
    const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null);
    const [selectedTooth, setSelectedTooth] = React.useState<Tooth | null>(null);
    const [historyTooth, setHistoryTooth] = React.useState<Tooth | null>(null);
    const [highlightedCondition, setHighlightedCondition] = React.useState<ToothCondition | 'all'>('all');
    const { toast } = useToast();

    React.useEffect(() => {
        async function fetchPatients() {
            const patientData = await getCollection<Patient>('patients');
            setPatients(patientData);
        }
        fetchPatients();
    }, []);

    const fetchChartData = async (patientId: string) => {
        setLoading(true);
        try {
            const docRef = doc(db, 'dental-charts', patientId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setChartData(docSnap.data().chart);
            } else {
                setChartData({ ...allHealthyDentalChart });
            }
        } catch (error) {
            toast({ title: 'Error fetching chart data', variant: 'destructive' });
            setChartData({ ...allHealthyDentalChart });
        } finally {
            setLoading(false);
        }
    };

    const handleToothSelect = (toothId: number) => {
        if (!selectedPatientId) {
            toast({
                title: 'No Patient Selected',
                description: 'Please select a patient to view or edit their dental chart.',
                variant: 'destructive',
            });
            return;
        }
        setSelectedTooth(chartData[toothId] || null);
    };

    const handleUpdateCondition = async (toothId: number, condition: ToothCondition) => {
        if (!selectedPatientId) return;

        const newChartData = { ...chartData };
        const toothToUpdate = { ...(newChartData[toothId] || { id: toothId, condition: 'healthy', history: [] }) };
        
        toothToUpdate.condition = condition;
        toothToUpdate.history.push({ date: new Date().toLocaleDateString(), condition: condition, notes: `Condition changed to ${condition}` });

        newChartData[toothId] = toothToUpdate;
        
        try {
            await setDocument('dental-charts', selectedPatientId, { chart: newChartData });
            setChartData(newChartData);
            setSelectedTooth(newChartData[toothId]);
            toast({
                title: `Tooth ${toothId} Updated`,
                description: `Condition set to ${condition.replace('-', ' ')}.`,
            });
        } catch (error) {
            toast({ title: 'Error updating chart', variant: 'destructive' });
        }
    };
    
    const handleResetChart = async () => {
        if (!selectedPatientId) return;
        try {
            await setDocument('dental-charts', selectedPatientId, { chart: allHealthyDentalChart });
            setChartData({ ...allHealthyDentalChart });
            setSelectedTooth(null);
            setHighlightedCondition('all');
            toast({
                title: 'Chart Reset',
                description: 'The dental chart has been reset to a healthy state.',
            });
        } catch (error) {
            toast({ title: 'Error resetting chart', variant: 'destructive' });
        }
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
        setSelectedPatientId(patientId);
        setSelectedTooth(null);
        setHighlightedCondition('all');
        fetchChartData(patientId);
        const patientName = patients.find(p => p.id === patientId)?.name || "Selected Patient";
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
    
    const teethCountByCondition = React.useMemo(() => {
        return Object.values(chartData).reduce((acc, tooth) => {
            acc[tooth.condition] = (acc[tooth.condition] || 0) + 1;
            return acc;
        }, {} as Record<ToothCondition, number>);
    }, [chartData]);


  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Dental Chart</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleResetChart} disabled={!selectedPatientId}>
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
            <Select onValueChange={handlePatientChange} value={selectedPatientId || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
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
            <Select onValueChange={(value) => setHighlightedCondition(value as ToothCondition | 'all')} value={highlightedCondition}>
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
                  <div className="text-lg font-bold">{teethCountByCondition[stat.name.toLowerCase().replace(' ', '-') as ToothCondition] || 0}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {loading ? (
                <Card className="flex h-[500px] items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                </Card>
            ) : (
                <InteractiveDentalChart
                    chartData={chartData}
                    selectedToothId={selectedTooth?.id || null}
                    highlightedCondition={highlightedCondition}
                    onToothSelect={handleToothSelect}
                />
            )}
          </div>
          <div className="lg:col-span-1">
            <EnhancedToothDetailCard 
                tooth={selectedTooth} 
                patientId={selectedPatientId}
                patientName={patients.find(p => p.id === selectedPatientId)?.name || "Selected Patient"}
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
