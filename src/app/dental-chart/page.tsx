
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
import { UploadImageDialog } from '@/components/medical-records/upload-image-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@/app/patients/page';
import { getCollection, setDocument, getDocument } from '@/services/database';
import { useLanguage } from '@/contexts/LanguageContext';

export type ToothCondition = 'healthy' | 'cavity' | 'filling' | 'crown' | 'missing' | 'root-canal';

export interface Tooth {
    id: number;
    condition: ToothCondition;
    history: { date: string; condition: ToothCondition; notes: string }[];
}

const dentalChartStats: { condition: ToothCondition; labelKey: string; color: string }[] = [
  { condition: 'healthy', labelKey: 'dental_chart.healthy', color: 'bg-green-200' },
  { condition: 'cavity', labelKey: 'dental_chart.cavity', color: 'bg-red-500' },
  { condition: 'filling', labelKey: 'dental_chart.filling', color: 'bg-blue-500' },
  { condition: 'crown', labelKey: 'dental_chart.crown', color: 'bg-purple-500' },
  { condition: 'missing', labelKey: 'dental_chart.missing', color: 'bg-gray-400' },
  { condition: 'root-canal', labelKey: 'dental_chart.root_canal', color: 'bg-yellow-500' },
];

export default function DentalChartPage() {
    const [loading, setLoading] = React.useState(false);
    const router = useRouter();
  const { t, isRTL } = useLanguage();
    const [patients, setPatients] = React.useState<Patient[]>([]);
    const [chartData, setChartData] = React.useState<Record<number, Tooth>>({ ...allHealthyDentalChart });
    const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null);
    const [selectedTooth, setSelectedTooth] = React.useState<Tooth | null>(null);
    const [historyTooth, setHistoryTooth] = React.useState<Tooth | null>(null);
    const [highlightedCondition, setHighlightedCondition] = React.useState<ToothCondition | 'all'>('all');
    const [showUploadDialog, setShowUploadDialog] = React.useState(false);
    const { toast } = useToast();

    // Handle image upload from dental chart context
  const handleImageUpload = async (data: any) => {
        try {
            // The upload dialog handles the actual upload to Firebase
            // Here we just show success feedback and optionally refresh data
            toast({
        title: t('dental_chart.toast.image_uploaded'),
        description: t('dental_chart.toast.image_uploaded_desc'),
            });
            
            // Optionally refresh the selected tooth data if needed
            if (selectedTooth) {
                // You could refresh the tooth's related images here
            }
        } catch (error) {
            console.error('Error handling image upload:', error);
            toast({
                title: t('dental_chart.toast.upload_error'),
                description: t('dental_chart.toast.upload_error_desc'),
                variant: "destructive",
            });
        }
    };

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
            const docSnap = await getDocument('dental-charts', patientId);
            if (docSnap && (docSnap as any).chart) {
                setChartData((docSnap as any).chart);
            } else {
                setChartData({ ...allHealthyDentalChart });
            }
        } catch (error) {
            toast({ title: t('dental_chart.toast.error_fetching_chart'), variant: 'destructive' });
            setChartData({ ...allHealthyDentalChart });
        } finally {
            setLoading(false);
        }
    };

    const handleToothSelect = (toothId: number) => {
        if (!selectedPatientId) {
      toast({
        title: t('dental_chart.toast.no_patient_selected'),
        description: t('dental_chart.toast.no_patient_selected_desc'),
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
        title: t('dental_chart.toast.tooth_updated'),
        description: t('dental_chart.toast.tooth_updated_desc'),
      });
        } catch (error) {
      toast({ title: t('dental_chart.toast.error_updating_chart'), variant: 'destructive' });
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
        title: t('dental_chart.toast.chart_reset'),
        description: t('dental_chart.toast.chart_reset_desc'),
      });
        } catch (error) {
      toast({ title: t('dental_chart.toast.error_resetting_chart'), variant: 'destructive' });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
    toast({
      title: t('dental_chart.toast.exporting_chart'),
      description: t('dental_chart.toast.exporting_chart_desc'),
    });
    };

    const handlePatientChange = (patientId: string) => {
        setSelectedPatientId(patientId);
        setSelectedTooth(null);
        setHighlightedCondition('all');
        fetchChartData(patientId);
    toast({
      title: t('dental_chart.toast.patient_changed'),
      description: t('dental_chart.toast.patient_changed_desc'),
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
          <h1 className="text-3xl font-bold">{t('dental_chart.title')}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleResetChart} disabled={!selectedPatientId}>
              <RotateCw className="mr-2 h-4 w-4" />
              {t('dental_chart.reset')}
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              {t('common.print')}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t('common.export')}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              {t('dental_chart.patient_selection')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select onValueChange={handlePatientChange} value={selectedPatientId || ''}>
              <SelectTrigger>
                <SelectValue placeholder={t('dental_chart.select_patient')} />
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
              <Search className={`absolute ${isRTL ? 'right-2.5' : 'left-2.5'} top-2.5 h-4 w-4 text-muted-foreground`} />
              <Input
                type="search"
                placeholder={t('dental_chart.search_tooth_placeholder')}
                className={`w-full rounded-lg bg-background ${isRTL ? 'pr-8' : 'pl-8'}`}
                onChange={handleSearch}
              />
            </div>
            <Select onValueChange={(value) => setHighlightedCondition(value as ToothCondition | 'all')} value={highlightedCondition}>
              <SelectTrigger>
                <SelectValue placeholder={t('dental_chart.all_conditions')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('dental_chart.all_conditions')}</SelectItem>
                <SelectItem value="healthy">{t('dental_chart.healthy')}</SelectItem>
                <SelectItem value="cavity">{t('dental_chart.cavities')}</SelectItem>
                <SelectItem value="filling">{t('dental_chart.filled')}</SelectItem>
                <SelectItem value="crown">{t('dental_chart.crowned')}</SelectItem>
                <SelectItem value="missing">{t('dental_chart.missing')}</SelectItem>
                <SelectItem value="root-canal">{t('dental_chart.root_canal')}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {dentalChartStats.map((stat) => (
            <Card key={stat.condition}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className={`h-3 w-3 rounded-full ${stat.color} flex-shrink-0`}></span>
                <div>
                  <div className="text-sm text-muted-foreground">{t(stat.labelKey)}</div>
                  <div className="text-lg font-bold">{teethCountByCondition[stat.condition] || 0}</div>
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
                patientName={patients.find(p => p.id === selectedPatientId)?.name || t('dental_chart.selected_patient')}
                onUpdateCondition={handleUpdateCondition}
                onViewHistory={(tooth) => setHistoryTooth(tooth)}
                onClose={() => setSelectedTooth(null)}
                onViewMedicalRecords={() => {
                    // Open the upload dialog instead of navigating to medical records
                    setShowUploadDialog(true);
                }}
                onAddTreatmentNote={(toothId) => {
                    // Navigate to medical records with specific tooth context
                    router.push(`/medical-records?toothId=${toothId}&patientId=${selectedPatientId}#clinical-images`);
                }}
            />
          </div>
        </div>

      </main>

      <ToothHistoryDialog
        tooth={historyTooth}
        open={!!historyTooth}
        onOpenChange={(isOpen) => !isOpen && setHistoryTooth(null)}
      />

      <UploadImageDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={handleImageUpload}
        defaultPatient={selectedPatientId || undefined}
      />
    </DashboardLayout>
  );
}
