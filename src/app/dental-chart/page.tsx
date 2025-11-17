
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
import { PatientCombobox } from '@/components/ui/patient-combobox';
import { cn } from "@/lib/utils";
import { allHealthyDentalChart } from "@/lib/data/dental-chart-data";
import { Download, Printer, RotateCw, Search, User, Loader2, Sparkles, Activity } from "lucide-react";
import InteractiveDentalChart from "@/components/dental-chart/interactive-dental-chart";
import { ToothDetailCard } from '@/components/dental-chart/tooth-detail-card';
import { EnhancedToothDetailCard } from '@/components/dental-chart/enhanced-tooth-detail-card';
import { ToothHistoryDialog } from '@/components/dental-chart/tooth-history-dialog';
import { UploadImageDialog } from '@/components/medical-records/upload-image-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@/app/patients/page';
import { useLanguage } from '@/contexts/LanguageContext';

// Comprehensive tooth conditions organized by category
export type ToothCondition = 
  // Basic conditions
  | 'healthy' | 'cavity' | 'missing'
  // Bleaching
  | 'ext-bleach-arch' | 'ext-bleach-tooth' | 'int-bleach-tooth'
  // Bridges
  | 'bridge-ceramic' | 'bridge-ceramic-implant' | 'fpd-repair' | 'metal-crown-bridge' | 'pfm-crown-bridge' | 'pontic-ceramic' | 'pontic-pfm'
  // Crowns
  | 'crown' | 'crown-ceramic' | 'crown-composite' | 'crown-implant' | 'crown-metal' | 'crown-pfm' | 'crown-porcelain' | 'crown-prov' | 'titanium-post-core-bridge'
  // Fillings & Composites
  | 'filling' | 'composite-filling' | 'composite-crown' | 'composite-filling-1-3' | 'composite-filling-ant-complex' | 'composite-filling-ant-compound' | 'composite-filling-ant-incisal' | 'composite-filling-ant-simple' | 'composite-filling-4-8' | 'composite-filling-post-complex' | 'composite-filling-post-compound' | 'composite-filling-post-simple'
  // Inlays & Onlays
  | 'ceramic-inlay' | 'inlay-ceramic-i' | 'inlay-ceramic-ii' | 'inlay-ceramic-iii' | 'ceramic-onlay' | 'onlay-ceramic-ii' | 'onlay-ceramic-iii' | 'onlay-ceramic-iv' | 'composite-inlay' | 'inlay-composite-i' | 'inlay-composite-ii' | 'inlay-composite-iii' | 'composite-onlay' | 'onlay-composite-ii'
  // Extractions
  | 'extraction' | 'bone-impaction' | 'complicated-impaction' | 'extraction-crown-pri' | 'extraction-tooth' | 'part-impaction' | 'remaining-roots-removal' | 'soft-impaction' | 'surgical-extraction' | 'titanium-post-crown'
  // Gingivectomy
  | 'gingivectomy' | 'gingivectomy-gingivoplasty'
  // Implants
  | 'implant'
  // Imaging
  | 'opg' | 'cephalometric-xray' | 'opg-xray'
  // Posts & Cores
  | 'post' | 'additional-titanium-post' | 'core' | 'titanium-post-core-bridge' | 'titanium-post-crown'
  // Pulpotomy
  | 'pulpotomy' | 'pulpotomy-1st-visit' | 'pulpotomy-ant-pri-1st' | 'pulpotomy-post-pri-1st' | 'pulpotomy-pri-per'
  // Root Canal Treatment (RCT)
  | 'root-canal' | 'rc-obstruction' | 'rct-ant-1st' | 'rct-molar-1st' | 'rct-premolar-1st' | 'rct-retreat-ant' | 'rct-retreat-molar' | 'rct-retreat-premolar' | 'root-perforation'
  // Scaling
  | 'scaling-polishing' | 'scaling-adults' | 'scaling-child'
  // Veneers
  | 'veneer' | 'ceramic-veneer-lab' | 'composite-veneer-lab' | 'composite-veneer-office'
  // Other
  | 'waxup' | 'periapical-radiograph';

export interface Tooth {
    id: number;
    condition: ToothCondition;
    history: { date: string; condition: ToothCondition; notes: string }[];
}

const dentalChartStats: { condition: ToothCondition; labelKey: string; color: string; category: string }[] = [
  // Basic
  { condition: 'healthy', labelKey: 'dental_chart.healthy', color: 'bg-green-200', category: 'basic' },
  { condition: 'cavity', labelKey: 'dental_chart.cavity', color: 'bg-red-500', category: 'basic' },
  { condition: 'missing', labelKey: 'dental_chart.missing', color: 'bg-gray-400', category: 'basic' },
  // Fillings
  { condition: 'filling', labelKey: 'dental_chart.filling', color: 'bg-blue-500', category: 'fillings' },
  { condition: 'composite-filling', labelKey: 'dental_chart.composite_filling', color: 'bg-blue-400', category: 'fillings' },
  // Crowns
  { condition: 'crown', labelKey: 'dental_chart.crown', color: 'bg-purple-500', category: 'crowns' },
  { condition: 'crown-ceramic', labelKey: 'dental_chart.crown_ceramic', color: 'bg-purple-400', category: 'crowns' },
  { condition: 'crown-metal', labelKey: 'dental_chart.crown_metal', color: 'bg-purple-600', category: 'crowns' },
  { condition: 'crown-pfm', labelKey: 'dental_chart.crown_pfm', color: 'bg-purple-300', category: 'crowns' },
  // Root Canal
  { condition: 'root-canal', labelKey: 'dental_chart.root_canal', color: 'bg-yellow-500', category: 'root_canal' },
  // Implants
  { condition: 'implant', labelKey: 'dental_chart.implant', color: 'bg-cyan-500', category: 'implants' },
  // Veneers
  { condition: 'veneer', labelKey: 'dental_chart.veneer', color: 'bg-pink-400', category: 'veneers' },
  { condition: 'ceramic-veneer-lab', labelKey: 'dental_chart.ceramic_veneer_lab', color: 'bg-pink-300', category: 'veneers' },
  // Extractions
  { condition: 'extraction', labelKey: 'dental_chart.extraction', color: 'bg-orange-500', category: 'extractions' },
  // Bridges
  { condition: 'bridge-ceramic', labelKey: 'dental_chart.bridge_ceramic', color: 'bg-indigo-500', category: 'bridges' },
  // Inlays
  { condition: 'ceramic-inlay', labelKey: 'dental_chart.ceramic_inlay', color: 'bg-teal-500', category: 'inlays' },
  // Onlays
  { condition: 'ceramic-onlay', labelKey: 'dental_chart.ceramic_onlay', color: 'bg-lime-500', category: 'onlays' },
  // Posts & Cores
  { condition: 'post', labelKey: 'dental_chart.post', color: 'bg-amber-500', category: 'posts_cores' },
  // Bleaching
  { condition: 'ext-bleach-tooth', labelKey: 'dental_chart.ext_bleach_tooth', color: 'bg-sky-300', category: 'bleaching' },
  // Scaling
  { condition: 'scaling-polishing', labelKey: 'dental_chart.scaling_polishing', color: 'bg-emerald-400', category: 'scaling' },
];

export default function DentalChartPage() {
    const [loading, setLoading] = React.useState(false);
    const router = useRouter();
  const { t, language, isRTL } = useLanguage();
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
            try {
                const response = await fetch('/api/patients');
                if (!response.ok) throw new Error('Failed to fetch patients');
                
                const data = await response.json();
                setPatients(data.patients.map((p: any) => ({
                    ...p, 
                    dob: new Date(p.dob)
                })));
            } catch (error) {
                console.error('Error fetching patients:', error);
                toast({
                    title: t('dental_chart.toast.error_fetching_patients'),
                    description: t('dental_chart.toast.error_fetching_patients_desc'),
                    variant: 'destructive'
                });
            }
        }
        fetchPatients();
    }, [toast, t]);

    const fetchChartData = async (patientId: string) => {
        setLoading(true);
        try {
            console.log('📥 Fetching dental chart from Neon database for patient:', patientId);
            const response = await fetch(`/api/dental-charts?patientId=${patientId}`);
            if (response.ok) {
                const { chart, updatedAt } = await response.json();
                console.log('✅ Successfully fetched dental chart from database:', chart ? 'Data found' : 'No data, using default');
                if (updatedAt) {
                    console.log('📅 Last updated:', new Date(updatedAt).toLocaleString());
                }
                setChartData(chart || { ...allHealthyDentalChart });
            } else {
                console.warn('⚠️ Failed to fetch chart, using default healthy chart');
                setChartData({ ...allHealthyDentalChart });
            }
        } catch (error) {
            console.error('❌ Error fetching dental chart:', error);
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
            console.log('💾 Saving dental chart to Neon database for tooth:', toothId, 'condition:', condition);
            const response = await fetch('/api/dental-charts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: selectedPatientId,
                    chartData: newChartData,
                }),
            });
            
            if (!response.ok) throw new Error('Failed to save dental chart');
            
            const result = await response.json();
            console.log('✅ Successfully saved dental chart to database. Updated at:', new Date(result.updatedAt).toLocaleString());
            
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
            const response = await fetch('/api/dental-charts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: selectedPatientId,
                    chartData: allHealthyDentalChart,
                }),
            });
            
            if (!response.ok) throw new Error('Failed to reset dental chart');
            
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
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    {t('dental_chart.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('page.dental_chart.subtitle')}
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
            <PatientCombobox
              patients={patients}
              value={selectedPatientId || ''}
              onValueChange={handlePatientChange}
              placeholder={t('dental_chart.select_patient')}
              searchPlaceholder={language === 'ar' ? 'ابحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
              emptyMessage={t('dental_chart.no_patient_found')}
              className="rounded-xl border-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            />
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
              <SelectContent className="max-h-96 overflow-y-auto">
                <SelectItem value="all">{t('dental_chart.all_conditions')}</SelectItem>
                <SelectItem value="healthy">{t('dental_chart.healthy')}</SelectItem>
                <SelectItem value="cavity">{t('dental_chart.cavity')}</SelectItem>
                <SelectItem value="filling">{t('dental_chart.filling')}</SelectItem>
                <SelectItem value="crown">{t('dental_chart.crown')}</SelectItem>
                <SelectItem value="missing">{t('dental_chart.missing')}</SelectItem>
                <SelectItem value="root-canal">{t('dental_chart.root_canal')}</SelectItem>
                <SelectItem value="implant">{t('dental_chart.implant')}</SelectItem>
                <SelectItem value="veneer">{t('dental_chart.veneer')}</SelectItem>
                <SelectItem value="extraction">{t('dental_chart.extraction')}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        {selectedPatientId && (
          <Card className="border-2 border-indigo-200 dark:border-indigo-900 shadow-lg bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {Object.keys(chartData).length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{t('dental_chart.total_teeth')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {teethCountByCondition['healthy'] || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{t('dental_chart.healthy')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {Object.keys(chartData).length - (teethCountByCondition['healthy'] || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{t('dental_chart.needs_treatment')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Object.values(teethCountByCondition).filter((count, idx) => Object.keys(teethCountByCondition)[idx] !== 'healthy' && count > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{t('dental_chart.condition_types')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Group stats by category with smart design */}
          {['basic', 'fillings', 'crowns', 'root_canal', 'implants', 'veneers', 'extractions', 'bridges', 'inlays', 'onlays', 'posts_cores', 'bleaching', 'scaling'].map((categoryKey, categoryIndex) => {
            const categoryStats = dentalChartStats.filter(stat => stat.category === categoryKey);
            if (categoryStats.length === 0) return null;
            
            // Calculate category totals
            const categoryTotal = categoryStats.reduce((sum, stat) => sum + (teethCountByCondition[stat.condition] || 0), 0);
            const hasData = categoryTotal > 0;
            
            return (
              <Card key={categoryKey} className={cn(
                "group/category relative overflow-hidden transition-all duration-300",
                hasData ? "border-2 border-indigo-200 dark:border-indigo-800 shadow-lg" : "border border-muted"
              )}>
                {hasData && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
                )}
                
                <CardContent className="p-4">
                  {/* Compact Category Header */}
                  <div className="relative mb-3 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">
                        {t(`dental_chart.category_${categoryKey}`)}
                      </h3>
                      {hasData && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mt-1">
                          {categoryTotal}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Compact Horizontal Cards */}
                  <div className="flex flex-wrap gap-1.5">
                  {categoryStats.map((stat, index) => {
                    const count = teethCountByCondition[stat.condition] || 0;
                    const isActive = count > 0;
                    const isHighlighted = highlightedCondition === stat.condition;
                    
                    const colorSchemes: Partial<Record<ToothCondition, {bg: string, border: string, text: string, icon: string, glow: string}>> = {
                      'healthy': {bg: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-400', icon: 'bg-green-500', glow: 'shadow-green-500/20'},
                      'cavity': {bg: 'from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400', icon: 'bg-red-500', glow: 'shadow-red-500/20'},
                      'filling': {bg: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400', icon: 'bg-blue-500', glow: 'shadow-blue-500/20'},
                      'composite-filling': {bg: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-600 dark:text-blue-300', icon: 'bg-blue-400', glow: 'shadow-blue-400/20'},
                      'crown': {bg: 'from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-400', icon: 'bg-purple-500', glow: 'shadow-purple-500/20'},
                      'crown-ceramic': {bg: 'from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-600 dark:text-purple-300', icon: 'bg-purple-400', glow: 'shadow-purple-400/20'},
                      'crown-metal': {bg: 'from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20', border: 'border-slate-300 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-400', icon: 'bg-slate-500', glow: 'shadow-slate-500/20'},
                      'crown-pfm': {bg: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20', border: 'border-purple-300 dark:border-purple-700', text: 'text-purple-600 dark:text-purple-300', icon: 'bg-purple-300', glow: 'shadow-purple-300/20'},
                      'missing': {bg: 'from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20', border: 'border-gray-300 dark:border-gray-700', text: 'text-gray-700 dark:text-gray-400', icon: 'bg-gray-400', glow: 'shadow-gray-400/20'},
                      'root-canal': {bg: 'from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20', border: 'border-yellow-300 dark:border-yellow-700', text: 'text-yellow-700 dark:text-yellow-400', icon: 'bg-yellow-500', glow: 'shadow-yellow-500/20'},
                      'implant': {bg: 'from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20', border: 'border-cyan-300 dark:border-cyan-700', text: 'text-cyan-700 dark:text-cyan-400', icon: 'bg-cyan-500', glow: 'shadow-cyan-500/20'},
                      'veneer': {bg: 'from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20', border: 'border-pink-300 dark:border-pink-700', text: 'text-pink-700 dark:text-pink-400', icon: 'bg-pink-400', glow: 'shadow-pink-400/20'},
                      'ceramic-veneer-lab': {bg: 'from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-600 dark:text-pink-300', icon: 'bg-pink-300', glow: 'shadow-pink-300/20'},
                      'extraction': {bg: 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20', border: 'border-orange-300 dark:border-orange-700', text: 'text-orange-700 dark:text-orange-400', icon: 'bg-orange-500', glow: 'shadow-orange-500/20'},
                      'bridge-ceramic': {bg: 'from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20', border: 'border-indigo-300 dark:border-indigo-700', text: 'text-indigo-700 dark:text-indigo-400', icon: 'bg-indigo-500', glow: 'shadow-indigo-500/20'},
                      'ceramic-inlay': {bg: 'from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20', border: 'border-teal-300 dark:border-teal-700', text: 'text-teal-700 dark:text-teal-400', icon: 'bg-teal-500', glow: 'shadow-teal-500/20'},
                      'ceramic-onlay': {bg: 'from-lime-50 to-green-50 dark:from-lime-950/20 dark:to-green-950/20', border: 'border-lime-300 dark:border-lime-700', text: 'text-lime-700 dark:text-lime-400', icon: 'bg-lime-500', glow: 'shadow-lime-500/20'},
                      'post': {bg: 'from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-400', icon: 'bg-amber-500', glow: 'shadow-amber-500/20'},
                      'ext-bleach-tooth': {bg: 'from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20', border: 'border-sky-200 dark:border-sky-800', text: 'text-sky-700 dark:text-sky-400', icon: 'bg-sky-300', glow: 'shadow-sky-300/20'},
                      'scaling-polishing': {bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-400', icon: 'bg-emerald-400', glow: 'shadow-emerald-400/20'},
                    };
                    
                    const scheme = colorSchemes[stat.condition] || {bg: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-400', icon: 'bg-blue-500', glow: 'shadow-blue-500/20'};
                    
                    return (
                      <div 
                        key={stat.condition}
                        className={cn(
                          "group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-all duration-300",
                          "bg-gradient-to-r", scheme.bg,
                          "border", scheme.border,
                          isActive ? "shadow-sm hover:shadow-md" : "opacity-40 hover:opacity-80",
                          isHighlighted && "ring-2 ring-indigo-500 ring-offset-1 scale-105",
                          "hover:scale-105"
                        )}
                        onClick={() => setHighlightedCondition(stat.condition)}
                      >
                        {/* Status Icon */}
                        <div className={cn(
                          "flex items-center justify-center w-4 h-4 rounded-full",
                          scheme.icon,
                          "shadow-sm transition-transform duration-300 group-hover:scale-110"
                        )}>
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        
                        {/* Label */}
                        <span className={cn("text-xs font-semibold whitespace-nowrap", scheme.text)}>
                          {t(stat.labelKey)}
                        </span>
                        
                        {/* Count Badge */}
                        {isActive && (
                          <div className={cn(
                            "flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full",
                            "bg-white dark:bg-black/40 shadow-inner text-[10px]",
                            "transition-transform duration-300 group-hover:scale-110"
                          )}>
                            <span className={cn("font-bold", scheme.text)}>{count}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
