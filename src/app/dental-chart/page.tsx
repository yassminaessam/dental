
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
import { Download, Printer, RotateCw, Search, User, Loader2, Sparkles, Activity } from "lucide-react";
import InteractiveDentalChart from "@/components/dental-chart/interactive-dental-chart";
import { ToothDetailCard } from '@/components/dental-chart/tooth-detail-card';
import { EnhancedToothDetailCard } from '@/components/dental-chart/enhanced-tooth-detail-card';
import { ToothHistoryDialog } from '@/components/dental-chart/tooth-history-dialog';
import { UploadImageDialog } from '@/components/medical-records/upload-image-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@/app/patients/page';
import { getCollection, setDocument } from '@/services/firestore';
import { doc, getDoc, db } from '@/services/firestore';
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
            const docRef = doc(db, 'dental-charts', patientId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setChartData(docSnap.data().chart);
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
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-200/30 via-purple-200/20 to-pink-200/10 dark:from-indigo-900/15 dark:via-purple-900/10 dark:to-pink-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/30 via-blue-200/20 to-teal-200/10 dark:from-cyan-900/15 dark:via-blue-900/10 dark:to-teal-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-xl">
                    <Activity className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-gradient">
                    {t('dental_chart.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    نظام تفاعلي لإدارة صحة الأسنان
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={handleResetChart} disabled={!selectedPatientId} className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <RotateCw className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                  {t('dental_chart.reset')}
                </Button>
                <Button variant="outline" onClick={handlePrint} className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <Printer className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                  {t('common.print')}
                </Button>
                <Button variant="outline" onClick={handleExport} className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <Download className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                  {t('common.export')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Card className="group relative border-2 border-muted hover:border-indigo-200 dark:hover:border-indigo-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-indigo-50/10 dark:to-indigo-950/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-colors">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t('dental_chart.patient_selection')}
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select onValueChange={handlePatientChange} value={selectedPatientId || ''}>
              <SelectTrigger className="rounded-xl border-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
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
            <div className="relative group/search">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover/search:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover/search:text-indigo-500 transition-colors duration-300 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  type="search"
                  placeholder={t('dental_chart.search_tooth_placeholder')}
                  className={`w-full rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted hover:border-indigo-300 dark:hover:border-indigo-700 focus:border-indigo-500 dark:focus:border-indigo-600 py-5 h-auto shadow-sm hover:shadow-md transition-all duration-300 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <Select onValueChange={(value) => setHighlightedCondition(value as ToothCondition | 'all')} value={highlightedCondition}>
              <SelectTrigger className="rounded-xl border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
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

        <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {dentalChartStats.map((stat) => {
            const gradientClasses = {
              'healthy': 'metric-card-green',
              'cavity': 'metric-card-red',
              'filling': 'metric-card-blue',
              'crown': 'metric-card-purple',
              'missing': 'metric-card-gray',
              'root-canal': 'metric-card-orange'
            };
            
            return (
              <Card 
                key={stat.condition}
                className={`relative overflow-hidden border-0 shadow-xl transition-all duration-500 cursor-pointer hover:scale-105 ${gradientClasses[stat.condition]}`}
                onClick={() => setHighlightedCondition(stat.condition)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="flex flex-col gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${stat.color} flex-shrink-0 shadow-lg`}></span>
                    <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t(stat.labelKey)}</div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {teethCountByCondition[stat.condition] || 0}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
