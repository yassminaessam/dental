
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
import { Download, Printer, Search, User, Loader2, Sparkles, Activity } from "lucide-react";
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

// Category mapping - only show category names
const dentalChartCategories = [
  'basic', 'missing', 'bleaching', 'bridges', 'crowns', 'fillings', 'inlays', 'onlays', 
  'extractions', 'root_canal', 'pulpotomy', 'posts_cores', 'implants', 
  'veneers', 'scaling', 'gingivectomy', 'imaging', 'other'
];

const dentalChartStats: { condition: ToothCondition; labelKey: string; color: string; category: string }[] = [
  // Basic
  { condition: 'healthy', labelKey: 'dental_chart.healthy', color: 'bg-green-500', category: 'basic' },
  { condition: 'cavity', labelKey: 'dental_chart.cavity', color: 'bg-red-500', category: 'basic' },
  
  // Missing
  { condition: 'missing', labelKey: 'dental_chart.missing', color: 'bg-gray-500', category: 'missing' },
  
  // Bleaching
  { condition: 'ext-bleach-arch', labelKey: 'dental_chart.ext_bleach_arch', color: 'bg-sky-400', category: 'bleaching' },
  { condition: 'ext-bleach-tooth', labelKey: 'dental_chart.ext_bleach_tooth', color: 'bg-sky-500', category: 'bleaching' },
  { condition: 'int-bleach-tooth', labelKey: 'dental_chart.int_bleach_tooth', color: 'bg-sky-300', category: 'bleaching' },
  
  // Bridges
  { condition: 'bridge-ceramic', labelKey: 'dental_chart.bridge_ceramic', color: 'bg-indigo-500', category: 'bridges' },
  { condition: 'bridge-ceramic-implant', labelKey: 'dental_chart.bridge_ceramic_implant', color: 'bg-indigo-400', category: 'bridges' },
  { condition: 'fpd-repair', labelKey: 'dental_chart.fpd_repair', color: 'bg-indigo-600', category: 'bridges' },
  { condition: 'metal-crown-bridge', labelKey: 'dental_chart.metal_crown_bridge', color: 'bg-slate-600', category: 'bridges' },
  { condition: 'pfm-crown-bridge', labelKey: 'dental_chart.pfm_crown_bridge', color: 'bg-indigo-300', category: 'bridges' },
  { condition: 'pontic-ceramic', labelKey: 'dental_chart.pontic_ceramic', color: 'bg-violet-500', category: 'bridges' },
  { condition: 'pontic-pfm', labelKey: 'dental_chart.pontic_pfm', color: 'bg-violet-400', category: 'bridges' },
  
  // Crowns
  { condition: 'crown', labelKey: 'dental_chart.crown', color: 'bg-purple-500', category: 'crowns' },
  { condition: 'crown-ceramic', labelKey: 'dental_chart.crown_ceramic', color: 'bg-purple-400', category: 'crowns' },
  { condition: 'crown-composite', labelKey: 'dental_chart.crown_composite', color: 'bg-purple-600', category: 'crowns' },
  { condition: 'crown-implant', labelKey: 'dental_chart.crown_implant', color: 'bg-purple-300', category: 'crowns' },
  { condition: 'crown-metal', labelKey: 'dental_chart.crown_metal', color: 'bg-slate-500', category: 'crowns' },
  { condition: 'crown-pfm', labelKey: 'dental_chart.crown_pfm', color: 'bg-purple-700', category: 'crowns' },
  { condition: 'crown-porcelain', labelKey: 'dental_chart.crown_porcelain', color: 'bg-fuchsia-400', category: 'crowns' },
  { condition: 'crown-prov', labelKey: 'dental_chart.crown_prov', color: 'bg-purple-200', category: 'crowns' },
  
  // Fillings
  { condition: 'filling', labelKey: 'dental_chart.filling', color: 'bg-blue-500', category: 'fillings' },
  { condition: 'composite-filling', labelKey: 'dental_chart.composite_filling', color: 'bg-blue-400', category: 'fillings' },
  { condition: 'composite-filling-1-3', labelKey: 'dental_chart.composite_filling_1_3', color: 'bg-blue-600', category: 'fillings' },
  { condition: 'composite-filling-ant-simple', labelKey: 'dental_chart.composite_filling_ant_simple', color: 'bg-blue-300', category: 'fillings' },
  { condition: 'composite-filling-ant-compound', labelKey: 'dental_chart.composite_filling_ant_compound', color: 'bg-blue-700', category: 'fillings' },
  { condition: 'composite-filling-ant-complex', labelKey: 'dental_chart.composite_filling_ant_complex', color: 'bg-cyan-600', category: 'fillings' },
  { condition: 'composite-filling-ant-incisal', labelKey: 'dental_chart.composite_filling_ant_incisal', color: 'bg-cyan-400', category: 'fillings' },
  { condition: 'composite-filling-4-8', labelKey: 'dental_chart.composite_filling_4_8', color: 'bg-cyan-500', category: 'fillings' },
  { condition: 'composite-filling-post-simple', labelKey: 'dental_chart.composite_filling_post_simple', color: 'bg-sky-600', category: 'fillings' },
  { condition: 'composite-filling-post-compound', labelKey: 'dental_chart.composite_filling_post_compound', color: 'bg-sky-700', category: 'fillings' },
  { condition: 'composite-filling-post-complex', labelKey: 'dental_chart.composite_filling_post_complex', color: 'bg-sky-800', category: 'fillings' },
  
  // Inlays
  { condition: 'ceramic-inlay', labelKey: 'dental_chart.ceramic_inlay', color: 'bg-teal-500', category: 'inlays' },
  { condition: 'inlay-ceramic-i', labelKey: 'dental_chart.inlay_ceramic_i', color: 'bg-teal-400', category: 'inlays' },
  { condition: 'inlay-ceramic-ii', labelKey: 'dental_chart.inlay_ceramic_ii', color: 'bg-teal-600', category: 'inlays' },
  { condition: 'inlay-ceramic-iii', labelKey: 'dental_chart.inlay_ceramic_iii', color: 'bg-teal-700', category: 'inlays' },
  { condition: 'composite-inlay', labelKey: 'dental_chart.composite_inlay', color: 'bg-teal-300', category: 'inlays' },
  { condition: 'inlay-composite-i', labelKey: 'dental_chart.inlay_composite_i', color: 'bg-cyan-400', category: 'inlays' },
  { condition: 'inlay-composite-ii', labelKey: 'dental_chart.inlay_composite_ii', color: 'bg-cyan-500', category: 'inlays' },
  { condition: 'inlay-composite-iii', labelKey: 'dental_chart.inlay_composite_iii', color: 'bg-cyan-600', category: 'inlays' },
  
  // Onlays
  { condition: 'ceramic-onlay', labelKey: 'dental_chart.ceramic_onlay', color: 'bg-lime-500', category: 'onlays' },
  { condition: 'onlay-ceramic-ii', labelKey: 'dental_chart.onlay_ceramic_ii', color: 'bg-lime-600', category: 'onlays' },
  { condition: 'onlay-ceramic-iii', labelKey: 'dental_chart.onlay_ceramic_iii', color: 'bg-lime-700', category: 'onlays' },
  { condition: 'onlay-ceramic-iv', labelKey: 'dental_chart.onlay_ceramic_iv', color: 'bg-lime-800', category: 'onlays' },
  { condition: 'composite-onlay', labelKey: 'dental_chart.composite_onlay', color: 'bg-lime-400', category: 'onlays' },
  { condition: 'onlay-composite-ii', labelKey: 'dental_chart.onlay_composite_ii', color: 'bg-lime-300', category: 'onlays' },
  
  // Extractions
  { condition: 'extraction', labelKey: 'dental_chart.extraction', color: 'bg-orange-500', category: 'extractions' },
  { condition: 'bone-impaction', labelKey: 'dental_chart.bone_impaction', color: 'bg-orange-600', category: 'extractions' },
  { condition: 'complicated-impaction', labelKey: 'dental_chart.complicated_impaction', color: 'bg-orange-700', category: 'extractions' },
  { condition: 'extraction-crown-pri', labelKey: 'dental_chart.extraction_crown_pri', color: 'bg-orange-400', category: 'extractions' },
  { condition: 'extraction-tooth', labelKey: 'dental_chart.extraction_tooth', color: 'bg-orange-300', category: 'extractions' },
  { condition: 'part-impaction', labelKey: 'dental_chart.part_impaction', color: 'bg-red-600', category: 'extractions' },
  { condition: 'remaining-roots-removal', labelKey: 'dental_chart.remaining_roots_removal', color: 'bg-red-700', category: 'extractions' },
  { condition: 'soft-impaction', labelKey: 'dental_chart.soft_impaction', color: 'bg-orange-800', category: 'extractions' },
  { condition: 'surgical-extraction', labelKey: 'dental_chart.surgical_extraction', color: 'bg-red-800', category: 'extractions' },
  
  // Root Canal (RCT)
  { condition: 'root-canal', labelKey: 'dental_chart.root_canal', color: 'bg-yellow-500', category: 'root_canal' },
  { condition: 'rc-obstruction', labelKey: 'dental_chart.rc_obstruction', color: 'bg-yellow-600', category: 'root_canal' },
  { condition: 'rct-ant-1st', labelKey: 'dental_chart.rct_ant_1st', color: 'bg-yellow-400', category: 'root_canal' },
  { condition: 'rct-molar-1st', labelKey: 'dental_chart.rct_molar_1st', color: 'bg-yellow-700', category: 'root_canal' },
  { condition: 'rct-premolar-1st', labelKey: 'dental_chart.rct_premolar_1st', color: 'bg-amber-500', category: 'root_canal' },
  { condition: 'rct-retreat-ant', labelKey: 'dental_chart.rct_retreat_ant', color: 'bg-amber-600', category: 'root_canal' },
  { condition: 'rct-retreat-molar', labelKey: 'dental_chart.rct_retreat_molar', color: 'bg-amber-700', category: 'root_canal' },
  { condition: 'rct-retreat-premolar', labelKey: 'dental_chart.rct_retreat_premolar', color: 'bg-amber-800', category: 'root_canal' },
  { condition: 'root-perforation', labelKey: 'dental_chart.root_perforation', color: 'bg-red-600', category: 'root_canal' },
  
  // Pulpotomy
  { condition: 'pulpotomy', labelKey: 'dental_chart.pulpotomy', color: 'bg-rose-500', category: 'pulpotomy' },
  { condition: 'pulpotomy-1st-visit', labelKey: 'dental_chart.pulpotomy_1st_visit', color: 'bg-rose-400', category: 'pulpotomy' },
  { condition: 'pulpotomy-ant-pri-1st', labelKey: 'dental_chart.pulpotomy_ant_pri_1st', color: 'bg-rose-600', category: 'pulpotomy' },
  { condition: 'pulpotomy-post-pri-1st', labelKey: 'dental_chart.pulpotomy_post_pri_1st', color: 'bg-rose-700', category: 'pulpotomy' },
  { condition: 'pulpotomy-pri-per', labelKey: 'dental_chart.pulpotomy_pri_per', color: 'bg-rose-300', category: 'pulpotomy' },
  
  // Posts & Cores
  { condition: 'post', labelKey: 'dental_chart.post', color: 'bg-amber-500', category: 'posts_cores' },
  { condition: 'additional-titanium-post', labelKey: 'dental_chart.additional_titanium_post', color: 'bg-amber-600', category: 'posts_cores' },
  { condition: 'core', labelKey: 'dental_chart.core', color: 'bg-amber-400', category: 'posts_cores' },
  { condition: 'titanium-post-core-bridge', labelKey: 'dental_chart.titanium_post_core_bridge', color: 'bg-amber-700', category: 'posts_cores' },
  { condition: 'titanium-post-crown', labelKey: 'dental_chart.titanium_post_crown', color: 'bg-amber-300', category: 'posts_cores' },
  
  // Implants
  { condition: 'implant', labelKey: 'dental_chart.implant', color: 'bg-cyan-500', category: 'implants' },
  
  // Veneers
  { condition: 'veneer', labelKey: 'dental_chart.veneer', color: 'bg-pink-500', category: 'veneers' },
  { condition: 'ceramic-veneer-lab', labelKey: 'dental_chart.ceramic_veneer_lab', color: 'bg-pink-400', category: 'veneers' },
  { condition: 'composite-veneer-lab', labelKey: 'dental_chart.composite_veneer_lab', color: 'bg-pink-600', category: 'veneers' },
  { condition: 'composite-veneer-office', labelKey: 'dental_chart.composite_veneer_office', color: 'bg-pink-300', category: 'veneers' },
  
  // Scaling
  { condition: 'scaling-polishing', labelKey: 'dental_chart.scaling_polishing', color: 'bg-emerald-500', category: 'scaling' },
  { condition: 'scaling-adults', labelKey: 'dental_chart.scaling_adults', color: 'bg-emerald-600', category: 'scaling' },
  { condition: 'scaling-child', labelKey: 'dental_chart.scaling_child', color: 'bg-emerald-400', category: 'scaling' },
  
  // Gingivectomy
  { condition: 'gingivectomy', labelKey: 'dental_chart.gingivectomy', color: 'bg-fuchsia-500', category: 'gingivectomy' },
  { condition: 'gingivectomy-gingivoplasty', labelKey: 'dental_chart.gingivectomy_gingivoplasty', color: 'bg-fuchsia-600', category: 'gingivectomy' },
  
  // Imaging
  { condition: 'opg', labelKey: 'dental_chart.opg', color: 'bg-violet-500', category: 'imaging' },
  { condition: 'cephalometric-xray', labelKey: 'dental_chart.cephalometric_xray', color: 'bg-violet-600', category: 'imaging' },
  { condition: 'opg-xray', labelKey: 'dental_chart.opg_xray', color: 'bg-violet-400', category: 'imaging' },
  { condition: 'periapical-radiograph', labelKey: 'dental_chart.periapical_radiograph', color: 'bg-violet-700', category: 'imaging' },
  
  // Other
  { condition: 'waxup', labelKey: 'dental_chart.waxup', color: 'bg-stone-500', category: 'other' },
  { condition: 'composite-crown', labelKey: 'dental_chart.composite_crown', color: 'bg-stone-600', category: 'other' },
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
            // Save the uploaded image metadata to Neon database
            const response = await fetch('/api/clinical-images', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient: data.patientName,
                    patientId: data.patient,
                    type: data.type,
                    imageUrl: data.imageUrl,
                    caption: data.caption || '',
                    date: new Date().toISOString(),
                }),
            });
            
            if (!response.ok) throw new Error('Failed to save clinical image to database');
            
            const { image } = await response.json();
            console.log('Image saved to Neon database:', image);
            
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
        const tooth = chartData[toothId] || null;
        setSelectedTooth(tooth);
        
        // Sync with category cards - highlight the category of the selected tooth
        // But don't highlight healthy teeth (سليم) to avoid highlighting all healthy teeth
        if (tooth && tooth.condition && tooth.condition !== 'healthy') {
            setHighlightedCondition(tooth.condition);
        } else {
            setHighlightedCondition('all');
        }
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
            // Sync with category cards after update
            setHighlightedCondition(condition);
      toast({
        title: t('dental_chart.toast.tooth_updated'),
        description: t('dental_chart.toast.tooth_updated_desc'),
      });
        } catch (error) {
      toast({ title: t('dental_chart.toast.error_updating_chart'), variant: 'destructive' });
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {teethCountByCondition['missing'] || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{t('dental_chart.missing')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {Object.keys(chartData).length - (teethCountByCondition['healthy'] || 0) - (teethCountByCondition['missing'] || 0)}
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

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {/* Interactive colorful category cards */}
          {dentalChartCategories.map((categoryKey) => {
            const categoryStats = dentalChartStats.filter(stat => stat.category === categoryKey);
            
            // Calculate category totals
            const categoryTotal = categoryStats.reduce((sum, stat) => sum + (teethCountByCondition[stat.condition] || 0), 0);
            const hasData = categoryTotal > 0;
            
            // Get the first condition from this category to use for highlighting
            const firstCondition = categoryStats.length > 0 ? categoryStats[0].condition : null;
            const isHighlighted = firstCondition && highlightedCondition !== 'all' && categoryStats.some(s => s.condition === highlightedCondition);
            
            // Check if this category contains the selected tooth's condition
            const isSelectedToothCategory = selectedTooth && categoryStats.some(s => s.condition === selectedTooth.condition);
            
            // Category color schemes
            const categoryColors: Record<string, {bg: string, gradient: string, text: string, badge: string, glow: string, dot: string}> = {
              'basic': {bg: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30', gradient: 'from-green-500 to-emerald-500', text: 'text-green-700 dark:text-green-300', badge: 'bg-gradient-to-r from-green-600 to-emerald-600', glow: 'from-green-500/20 to-emerald-500/20', dot: 'bg-green-500'},
              'missing': {bg: 'from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30', gradient: 'from-gray-500 to-slate-500', text: 'text-gray-700 dark:text-gray-300', badge: 'bg-gradient-to-r from-gray-600 to-slate-600', glow: 'from-gray-500/20 to-slate-500/20', dot: 'bg-gray-500'},
              'bleaching': {bg: 'from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30', gradient: 'from-sky-400 to-blue-500', text: 'text-sky-700 dark:text-sky-300', badge: 'bg-gradient-to-r from-sky-500 to-blue-600', glow: 'from-sky-500/20 to-blue-500/20', dot: 'bg-sky-400'},
              'bridges': {bg: 'from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30', gradient: 'from-indigo-500 to-violet-500', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-gradient-to-r from-indigo-600 to-violet-600', glow: 'from-indigo-500/20 to-violet-500/20', dot: 'bg-indigo-500'},
              'crowns': {bg: 'from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30', gradient: 'from-purple-500 to-fuchsia-500', text: 'text-purple-700 dark:text-purple-300', badge: 'bg-gradient-to-r from-purple-600 to-fuchsia-600', glow: 'from-purple-500/20 to-fuchsia-500/20', dot: 'bg-purple-500'},
              'fillings': {bg: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30', gradient: 'from-blue-500 to-cyan-500', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-gradient-to-r from-blue-600 to-cyan-600', glow: 'from-blue-500/20 to-cyan-500/20', dot: 'bg-blue-500'},
              'inlays': {bg: 'from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30', gradient: 'from-teal-500 to-emerald-500', text: 'text-teal-700 dark:text-teal-300', badge: 'bg-gradient-to-r from-teal-600 to-emerald-600', glow: 'from-teal-500/20 to-emerald-500/20', dot: 'bg-teal-500'},
              'onlays': {bg: 'from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/30', gradient: 'from-lime-500 to-green-500', text: 'text-lime-700 dark:text-lime-300', badge: 'bg-gradient-to-r from-lime-600 to-green-600', glow: 'from-lime-500/20 to-green-500/20', dot: 'bg-lime-500'},
              'extractions': {bg: 'from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30', gradient: 'from-orange-500 to-red-500', text: 'text-orange-700 dark:text-orange-300', badge: 'bg-gradient-to-r from-orange-600 to-red-600', glow: 'from-orange-500/20 to-red-500/20', dot: 'bg-orange-500'},
              'root_canal': {bg: 'from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30', gradient: 'from-yellow-500 to-amber-500', text: 'text-yellow-700 dark:text-yellow-300', badge: 'bg-gradient-to-r from-yellow-600 to-amber-600', glow: 'from-yellow-500/20 to-amber-500/20', dot: 'bg-yellow-500'},
              'pulpotomy': {bg: 'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30', gradient: 'from-rose-500 to-pink-500', text: 'text-rose-700 dark:text-rose-300', badge: 'bg-gradient-to-r from-rose-600 to-pink-600', glow: 'from-rose-500/20 to-pink-500/20', dot: 'bg-rose-500'},
              'posts_cores': {bg: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30', gradient: 'from-amber-500 to-orange-500', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-gradient-to-r from-amber-600 to-orange-600', glow: 'from-amber-500/20 to-orange-500/20', dot: 'bg-amber-500'},
              'implants': {bg: 'from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30', gradient: 'from-cyan-500 to-teal-500', text: 'text-cyan-700 dark:text-cyan-300', badge: 'bg-gradient-to-r from-cyan-600 to-teal-600', glow: 'from-cyan-500/20 to-teal-500/20', dot: 'bg-cyan-500'},
              'veneers': {bg: 'from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30', gradient: 'from-pink-500 to-rose-500', text: 'text-pink-700 dark:text-pink-300', badge: 'bg-gradient-to-r from-pink-600 to-rose-600', glow: 'from-pink-500/20 to-rose-500/20', dot: 'bg-pink-500'},
              'scaling': {bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30', gradient: 'from-emerald-500 to-teal-500', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-gradient-to-r from-emerald-600 to-teal-600', glow: 'from-emerald-500/20 to-teal-500/20', dot: 'bg-emerald-500'},
              'gingivectomy': {bg: 'from-fuchsia-50 to-purple-50 dark:from-fuchsia-950/30 dark:to-purple-950/30', gradient: 'from-fuchsia-500 to-purple-500', text: 'text-fuchsia-700 dark:text-fuchsia-300', badge: 'bg-gradient-to-r from-fuchsia-600 to-purple-600', glow: 'from-fuchsia-500/20 to-purple-500/20', dot: 'bg-fuchsia-500'},
              'imaging': {bg: 'from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30', gradient: 'from-violet-500 to-indigo-500', text: 'text-violet-700 dark:text-violet-300', badge: 'bg-gradient-to-r from-violet-600 to-indigo-600', glow: 'from-violet-500/20 to-indigo-500/20', dot: 'bg-violet-500'},
              'other': {bg: 'from-stone-50 to-gray-50 dark:from-stone-950/30 dark:to-gray-950/30', gradient: 'from-stone-500 to-gray-500', text: 'text-stone-700 dark:text-stone-300', badge: 'bg-gradient-to-r from-stone-600 to-gray-600', glow: 'from-stone-500/20 to-gray-500/20', dot: 'bg-stone-500'},
            };
            
            const colors = categoryColors[categoryKey] || categoryColors['other'];
            
            const handleCategoryClick = () => {
              // Cycle through conditions in this category
              if (firstCondition) {
                const currentIndex = categoryStats.findIndex(s => s.condition === highlightedCondition);
                const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % categoryStats.length;
                setHighlightedCondition(categoryStats[nextIndex].condition);
              }
            };
            
            // Ref for scrolling to highlighted card
            const cardRef = React.useRef<HTMLDivElement>(null);
            React.useEffect(() => {
              if (isSelectedToothCategory && cardRef.current) {
                cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }
            }, [isSelectedToothCategory]);
            
            return (
              <Card 
                key={categoryKey}
                ref={cardRef}
                className={cn(
                  "group/category relative overflow-hidden transition-all duration-500 cursor-pointer",
                  "bg-gradient-to-br", colors.bg,
                  "border-2 hover:border-4",
                  hasData ? "shadow-lg hover:shadow-2xl border-transparent hover:scale-110" : "shadow-sm hover:shadow-lg opacity-50 hover:opacity-100 border-muted",
                  isHighlighted && "ring-4 ring-offset-2 ring-indigo-500 scale-110 animate-pulse",
                  isSelectedToothCategory && "ring-4 ring-offset-2 ring-yellow-400 scale-110 shadow-2xl animate-pulse"
                )}
                onClick={handleCategoryClick}
              >
                {/* Animated gradient overlay */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover/category:opacity-100 transition-opacity duration-500",
                  colors.glow
                )} />
                
                {/* Pulsing glow for active categories */}
                {hasData && (
                  <div className={cn("absolute -inset-1 bg-gradient-to-br blur-xl opacity-30 group-hover/category:opacity-60 transition-opacity duration-500", colors.glow)} />
                )}
                
                <CardContent className="p-2 relative">
                  {/* Category indicator dot */}
                  <div className={cn("absolute top-1 right-1 w-2 h-2 rounded-full shadow-sm animate-pulse", colors.dot)} />
                  
                  <div className="flex flex-col items-center justify-center text-center min-h-[50px]">
                    <h3 className={cn("text-xs font-bold mb-1 group-hover/category:scale-110 transition-transform duration-300 leading-tight", colors.text)}>
                      {t(`dental_chart.category_${categoryKey}`)}
                    </h3>
                    {hasData ? (
                      <span className={cn(
                        "inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-sm font-bold text-white rounded-full shadow-md",
                        "group-hover/category:scale-125 transition-transform duration-300",
                        colors.badge
                      )}>
                        {categoryTotal}
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">0</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Hidden section - keeping the stat mapping for data calculation */}
        <div className="hidden">
          {dentalChartStats.map((stat, index) => {
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
            
            return null;
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
        defaultToothNumber={selectedTooth?.id}
      />
    </DashboardLayout>
  );
}
