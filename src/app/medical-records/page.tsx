
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Search, User, Download, Image as ImageIcon, Eye, Pencil, Loader2, Trash2, MoreHorizontal, Replace, Link as LinkIcon, Sparkles, FileText, Images, X, Filter } from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import { PatientCombobox } from '@/components/ui/patient-combobox';
import { UploadImageDialog } from "@/components/medical-records/upload-image-dialog";
import { ReplaceImageDialog } from "@/components/medical-records/replace-image-dialog";
import { NewRecordDialog } from "@/components/medical-records/new-record-dialog";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ViewRecordDialog } from '@/components/medical-records/view-record-dialog';
import { EditRecordDialog } from '@/components/medical-records/edit-record-dialog';
import { LinkImageToToothDialog } from '@/components/medical-records/link-image-to-tooth-dialog';
import { ViewImageDialog } from '@/components/medical-records/view-image-dialog';
import type { ClinicalImage, MedicalRecord, MedicalRecordTemplate } from '@/lib/types';
import {
  listMedicalRecordTemplates,
} from '@/services/medical-records';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';

export type { MedicalRecord, MedicalRecordTemplate, ClinicalImage } from '@/lib/types';

const medicalRecordTypes = ['SOAP', 'Clinical Note', 'Treatment Plan', 'Consultation'];

export default function MedicalRecordsPage() {
  const { t, isRTL } = useLanguage();
  const [records, setRecords] = React.useState<MedicalRecord[]>([]);
  const [images, setImages] = React.useState<ClinicalImage[]>([]);
  const [templates, setTemplates] = React.useState<MedicalRecordTemplate[]>([]);
  const [patients, setPatients] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [selectedPatientId, setSelectedPatientId] = React.useState<string>('');
  const [recordSearchTerm, setRecordSearchTerm] = React.useState('');
  const [recordTypeFilter, setRecordTypeFilter] = React.useState('all');
  
  const [imageSearchTerm, setImageSearchTerm] = React.useState('');
  const [templateSearchTerm, setTemplateSearchTerm] = React.useState('');

  const [recordToView, setRecordToView] = React.useState<MedicalRecord | null>(null);
  const [recordToEdit, setRecordToEdit] = React.useState<MedicalRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = React.useState<MedicalRecord | null>(null);
  
  const [imageToReplace, setImageToReplace] = React.useState<ClinicalImage | null>(null);
  const [imageToDelete, setImageToDelete] = React.useState<ClinicalImage | null>(null);
  const [imageToLink, setImageToLink] = React.useState<ClinicalImage | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
  const [imageToView, setImageToView] = React.useState<ClinicalImage | null>(null);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('medical-records');
  
  const { toast } = useToast();
  
  // Handle hash navigation
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the # character
      if (hash === 'clinical-images') {
        setActiveTab('clinical-images');
      } else if (hash === 'templates') {
        setActiveTab('templates');
      } else if (hash === 'medical-records' || hash === '') {
        setActiveTab('medical-records');
      }
    };

    // Handle initial hash on load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  React.useEffect(() => {
    async function fetchData() {
        try {
        // Fetch all data from Neon database
        const [patientsResponse, recordsResponse, imagesResponse, templatesData] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/medical-records'),
          fetch('/api/clinical-images'),
          listMedicalRecordTemplates(),
        ]);
        
        const patientsData = patientsResponse.ok ? await patientsResponse.json() : { patients: [] };
        const recordsData = recordsResponse.ok ? await recordsResponse.json() : { records: [] };
        const imagesData = imagesResponse.ok ? await imagesResponse.json() : { images: [] };
        
            setRecords(recordsData.records || []);
            setImages(imagesData.images || []);
            setTemplates(templatesData);
            setPatients(patientsData.patients || []);
        } catch (e) {
            console.error('Error fetching data:', e);
            toast({ title: t('medical_records.toast.error_fetching'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchData().catch(error => {
      console.error('Unhandled error in fetchData:', error);
    });
  }, [toast, t]);

  // Filtered data computations
  const filteredRecords = React.useMemo(() => {
    let filtered = records;
    
    // Apply patient filter if selected
    if (selectedPatientId) {
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      filtered = filtered.filter(r => {
        // Match by patientId OR by patient name (fallback for old records)
        const matchById = r.patientId === selectedPatientId;
        const matchByName = selectedPatient && r.patient === selectedPatient.name;
        return matchById || matchByName;
      });
    }
    
    // Apply search filter
    filtered = filtered.filter(record => 
      record.patient.toLowerCase().includes(recordSearchTerm.toLowerCase()) ||
      record.complaint.toLowerCase().includes(recordSearchTerm.toLowerCase())
    );
    
    // Apply type filter
    if (recordTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.type === recordTypeFilter);
    }
    
    return filtered;
  }, [records, selectedPatientId, recordSearchTerm, recordTypeFilter, patients]);

  const filteredImages = React.useMemo(() => {
    let filtered = images;
    
    // Apply patient filter if selected
    if (selectedPatientId) {
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      filtered = filtered.filter(img => {
        // Match by patientId OR by patient name (fallback for old records)
        const matchById = img.patientId === selectedPatientId;
        const matchByName = selectedPatient && img.patient === selectedPatient.name;
        return matchById || matchByName;
      });
    }
    
    // Apply search filter
    filtered = filtered.filter(image => {
      const searchLower = imageSearchTerm.toLowerCase().trim();
      const patientMatch = image.patient?.toLowerCase().includes(searchLower) || false;
      const captionMatch = image.caption?.toLowerCase().includes(searchLower) || false;
      return patientMatch || captionMatch;
    });
    
    return filtered;
  }, [images, selectedPatientId, imageSearchTerm, patients]);
  
  const filteredTemplates = React.useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(templateSearchTerm.toLowerCase())
    );
  }, [templates, templateSearchTerm]);

  const medicalRecordsPageStats = React.useMemo(() => {
    const draftRecords = filteredRecords.filter(r => r.status === 'Draft').length;
    const recordsTitle = selectedPatientId ? t('medical_records.patient_records') : t('medical_records.total_records');
    const imagesTitle = selectedPatientId ? t('medical_records.patient_images') : t('medical_records.clinical_images');
    
    return [
      { title: recordsTitle, value: filteredRecords.length, description: t('medical_records.all_patient_records'), cardStyle: 'metric-card-blue' },
      { title: imagesTitle, value: filteredImages.length, description: t('medical_records.all_uploaded_images'), cardStyle: 'metric-card-green' },
      { title: t('medical_records.templates'), value: templates.length, description: t('medical_records.for_faster_documentation'), cardStyle: 'metric-card-purple' },
      { title: t('medical_records.draft_records'), value: draftRecords, description: t('medical_records.awaiting_finalization'), cardStyle: 'metric-card-orange' },
    ];
  }, [filteredRecords, filteredImages, templates, selectedPatientId, t]);

  const handleSaveRecord = async (data: any) => {
    try {
      // Find patient to get patientId
      const patient = patients.find(p => p.id === data.patient);
      
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: patient?.name || '',
          patientId: data.patient,
          type: data.type,
          complaint: data.complaint || '',
          provider: data.provider,
          providerId: data.providerId,
          date: data.date,
          status: data.status || 'Final',
          notes: data.notes || '',
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create medical record');
      
      const { record } = await response.json();
      setRecords((prev) => [record, ...prev]);
      toast({
        title: t('medical_records.toast.record_created'),
        description: t('medical_records.toast.record_created_desc'),
      });
    } catch(e) {
      toast({ title: t('medical_records.toast.error_creating_record'), variant: 'destructive' });
    }
  };

  const handleUpdateRecord = async (updatedRecord: MedicalRecord) => {
    try {
      const response = await fetch(`/api/medical-records/${updatedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecord),
      });
      
      if (!response.ok) throw new Error('Failed to update medical record');
      
      const { record } = await response.json();
      setRecords(prev => prev.map(rec => rec.id === record.id ? record : rec));
      setRecordToEdit(null);
      toast({
        title: t('medical_records.toast.record_updated'),
        description: t('medical_records.toast.record_updated_desc'),
      });
    } catch(e) {
      toast({ title: t('medical_records.toast.error_updating_record'), variant: 'destructive' });
    }
  };

  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;
    try {
      const response = await fetch(`/api/medical-records/${recordToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete medical record');
      
      setRecords(prev => prev.filter(record => record.id !== recordToDelete.id));
      setRecordToDelete(null);
      toast({
        title: t('medical_records.toast.record_deleted'),
        description: t('medical_records.toast.record_deleted_desc'),
        variant: "destructive",
      });
    } catch (e) {
      toast({ title: t('medical_records.toast.error_deleting_record'), variant: "destructive" });
    }
  };

  const handleImageUpload = async (data: any) => {
     try {
      // Find patient to get patientId
      const patient = patients.find(p => p.name === data.patientName);
      
      const response = await fetch('/api/clinical-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: data.patientName,
          patientId: patient?.id,
          type: data.type,
          imageUrl: data.imageUrl,
          caption: data.caption || '',
          date: new Date().toISOString(),
          toothNumber: data.toothNumber || null,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to upload clinical image');
      
      const { image } = await response.json();
      setImages(prev => [image, ...prev]);
      toast({
        title: t('medical_records.toast.image_uploaded'),
        description: t('medical_records.toast.image_uploaded_desc'),
      });
     } catch(e) {
        toast({ title: t('medical_records.toast.error_uploading_image'), variant: 'destructive' });
     }
  };

  const handleReplaceImage = async (imageId: string, newImageUrl: string, caption?: string) => {
    try {
      const updatedImage = images.find(img => img.id === imageId);
      if (!updatedImage) return;

      const updatedImageData = {
        ...updatedImage,
        imageUrl: newImageUrl,
        caption: caption || updatedImage.caption,
        date: new Date().toISOString(),
      };

      const response = await fetch(`/api/clinical-images/${imageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedImageData),
      });
      
      if (!response.ok) throw new Error('Failed to update clinical image');
      
      const { image } = await response.json();
      setImages(prev => prev.map(img => img.id === imageId ? image : img));
      
      toast({
        title: t('medical_records.toast.image_replaced'),
        description: t('medical_records.toast.image_replaced_desc'),
      });
    } catch (e) {
      toast({ title: t('medical_records.toast.error_replacing_image'), variant: 'destructive' });
    }
  };

  const handleDeleteImage = async () => {
    if (!imageToDelete) return;
    
    try {
      // Delete file from local storage
      if (imageToDelete.imageUrl) {
        try {
          await fetch(`/api/uploads?url=${encodeURIComponent(imageToDelete.imageUrl)}`, {
            method: 'DELETE',
          });
        } catch (e) {
          console.warn('Failed to delete image file:', e);
        }
      }
      
      // Delete record from Neon database
      const response = await fetch(`/api/clinical-images/${imageToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete clinical image');
      
      setImages(prev => prev.filter(img => img.id !== imageToDelete.id));
      setImageToDelete(null);
      
      toast({
        title: t('medical_records.toast.image_deleted'),
        description: t('medical_records.toast.image_deleted_desc'),
        variant: "destructive",
      });
    } catch (e) {
      toast({ title: t('medical_records.toast.error_deleting_image'), variant: 'destructive' });
    }
  };
  
  const handleDownloadRecord = (recordId: string) => {
    toast({
      title: t('medical_records.toast.downloading_record'),
      description: t('medical_records.toast.downloading_record_desc')
    });
  };

  // Helper function to get patient phone by name
  const getPatientPhone = React.useCallback((patientName: string) => {
    const patient = patients.find(p => p.name === patientName);
    return patient?.phone || '-';
  }, [patients]);

  // Helper function to get selected patient name
  const selectedPatientName = React.useMemo(() => {
    if (!selectedPatientId) return null;
    const patient = patients.find(p => p.id === selectedPatientId);
    return patient?.name || null;
  }, [selectedPatientId, patients]);

  return (
    <ErrorBoundary>
      <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-rose-200/30 via-red-200/20 to-orange-200/10 dark:from-rose-900/15 dark:via-red-900/10 dark:to-orange-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-teal-200/30 via-emerald-200/20 to-green-200/10 dark:from-teal-900/15 dark:via-emerald-900/10 dark:to-green-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-red-500/5 to-orange-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-xl">
                    <FileText className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400 bg-clip-text text-transparent animate-gradient">
                    {t('medical_records.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('page.medical_records.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <UploadImageDialog onUpload={handleImageUpload} defaultPatient={selectedPatientId} />
                <NewRecordDialog onSave={handleSaveRecord} />
              </div>
            </div>
            
            {/* Patient Filter Section */}
            <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
                <div className="w-full sm:w-auto sm:min-w-[300px]">
                  <PatientCombobox
                    patients={patients}
                    value={selectedPatientId}
                    onValueChange={setSelectedPatientId}
                    placeholder={t('medical_records.filter_by_patient')}
                    searchPlaceholder={t('medical_records.search_patient_placeholder')}
                    emptyMessage={t('medical_records.no_patient_found')}
                  />
                </div>
                {selectedPatientId && selectedPatientName && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                      <Filter className={cn("h-3.5 w-3.5", isRTL ? "ml-1.5" : "mr-1.5")} />
                      {t('medical_records.viewing')}: {selectedPatientName}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPatientId('')}
                      className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className={cn("h-4 w-4", isRTL ? "ml-1" : "mr-1")} />
                      {t('medical_records.clear_filter')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {medicalRecordsPageStats.map((stat, idx) => (
            <Card
              key={stat.title}
              className={cn(
                "relative overflow-hidden border-0 shadow-xl transition-all duration-500 cursor-pointer hover:scale-105",
                stat.cardStyle
              )}
              role="button"
              tabIndex={0}
              aria-label={stat.title}
              onClick={() => {
                // 0: total records -> records tab, 1: images -> images tab, 2: templates -> templates tab, 3: drafts -> records tab
                if (idx === 0 || idx === 3) setActiveTab('medical-records');
                else if (idx === 1) setActiveTab('clinical-images');
                else if (idx === 2) setActiveTab('templates');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  (e.currentTarget as HTMLDivElement).click();
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <CardIcon variant={(['blue','green','pink','purple'] as const)[idx % 4]} aria-hidden="true">
                  {idx === 0 && <FileText className="h-5 w-5" />}
                  {idx === 1 && <Images className="h-5 w-5" />}
                  {idx === 2 && <User className="h-5 w-5" />}
                  {idx === 3 && <Pencil className="h-5 w-5" />}
                </CardIcon>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-2">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="medical-records">{t('medical_records.medical_records')}</TabsTrigger>
            <TabsTrigger value="clinical-images">{t('medical_records.clinical_images')}</TabsTrigger>
            <TabsTrigger value="templates">{t('medical_records.templates')}</TabsTrigger>
          </TabsList>
          <TabsContent value="medical-records" className="mt-4">
            <Card className="group relative border-2 border-muted hover:border-rose-200 dark:hover:border-rose-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-rose-50/10 dark:to-rose-950/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-500/5 to-red-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardHeader className="relative z-10 flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/10 to-red-500/10 group-hover:from-rose-500/20 group-hover:to-red-500/20 transition-colors">
                    <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-rose-600 to-red-600 dark:from-rose-400 dark:to-red-400 bg-clip-text text-transparent">
                    {t('medical_records.patient_medical_records')}
                  </CardTitle>
                </div>
                
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto group/search">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-red-500/20 rounded-xl blur-lg opacity-0 group-hover/search:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <Search className={cn("absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover/search:text-rose-500 transition-colors duration-300", isRTL ? 'right-3' : 'left-3')} />
                      <Input
                        type="search"
                        placeholder={t('medical_records.search_records')}
                        className={cn("w-full rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted hover:border-rose-300 dark:hover:border-rose-700 focus:border-rose-500 dark:focus:border-rose-600 py-5 h-auto lg:w-[336px] shadow-sm hover:shadow-md transition-all duration-300", isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')}
                        value={recordSearchTerm}
                        onChange={(e) => setRecordSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
                    <SelectTrigger className="w-full md:w-[180px] rounded-xl border-2 hover:border-red-300 dark:hover:border-red-700 transition-colors">
                      <SelectValue placeholder={t('medical_records.all_types')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('medical_records.all_types')}</SelectItem>
                      {medicalRecordTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('medical_records.record_id')}</TableHead>
                      <TableHead>{t('common.patient')}</TableHead>
                      <TableHead>{t('common.phone')}</TableHead>
                      <TableHead>{t('medical_records.type')}</TableHead>
                      <TableHead>{t('medical_records.chief_complaint')}</TableHead>
                      <TableHead>{t('medical_records.provider')}</TableHead>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className={cn("text-right", isRTL && "text-left")}>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={9} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{record.patient}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{getPatientPhone(record.patient)}</TableCell>
                          <TableCell>
                            <Badge variant={record.type === 'SOAP' ? 'default' : 'secondary'}>{record.type}</Badge>
                          </TableCell>
                          <TableCell>{record.complaint}</TableCell>
                          <TableCell>{record.provider}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.status === 'Draft' ? t('medical_records.draft') : t('medical_records.final')}</Badge>
                          </TableCell>
                          <TableCell className={cn("text-right", isRTL && "text-left")}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">{t('common.actions')}</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? "start" : "end"}>
                                <DropdownMenuItem onClick={() => setRecordToView(record)}>
                                  <Eye className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                                  {t('table.view')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setRecordToEdit(record)}>
                                  <Pencil className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                                  {t('table.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadRecord(record.id)}>
                                  <Download className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                                  {t('table.download')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setRecordToDelete(record)} className="text-destructive">
                                  <Trash2 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                                  {t('table.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          {t('medical_records.no_records_found')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="clinical-images" className="mt-4">
             <Card className="group relative border-2 border-muted hover:border-teal-200 dark:hover:border-teal-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-teal-50/10 dark:to-teal-950/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <CardHeader className="relative z-10">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 group-hover:from-teal-500/20 group-hover:to-emerald-500/20 transition-colors">
                            <Images className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                          </div>
                          <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                            {t('medical_records.clinical_images')}
                          </CardTitle>
                        </div>
                        
                        <div className="relative w-full md:w-auto group/search">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-xl blur-lg opacity-0 group-hover/search:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative">
                              <Search className={cn("absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover/search:text-teal-500 transition-colors duration-300", isRTL ? 'right-3' : 'left-3')} />
                              <Input
                                type="search"
                                placeholder={t('medical_records.search_images') + '...'}
                                className={cn("w-full rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted hover:border-teal-300 dark:hover:border-teal-700 focus:border-teal-500 dark:focus:border-teal-600 py-5 h-auto md:w-[250px] lg:w-[336px] shadow-sm hover:shadow-md transition-all duration-300", isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')}
                                value={imageSearchTerm}
                                onChange={(e) => setImageSearchTerm(e.target.value)}
                              />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    {loading ? (
                      <div className="h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : filteredImages.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredImages.map((image) => (
                        <Card key={image.id} className="overflow-hidden group">
                            <CardHeader className="p-0">
                            <div className="relative aspect-video bg-muted">
                                <Image
                                src={image.imageUrl}
                                alt={image.caption || `Clinical image for ${image.patient}`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover"
                                onError={(e) => {
                                  console.error('❌ Image failed to load:', image.imageUrl);
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-muted"><div class="text-center"><svg class="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p class="mt-2 text-sm text-muted-foreground">Image not found</p><p class="text-xs text-muted-foreground mt-1">Check FTP server</p></div></div>';
                                  }
                                }}
                                />
                                {/* Quick view button overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                                  <Button
                                    variant="secondary"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-10 w-10"
                                    onClick={() => setImageToView(image)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                            </div>
                            </CardHeader>
                            <CardContent className="p-4">
                            <CardTitle className="text-base">{image.caption || image.type}</CardTitle>
                            <CardDescription>{image.patient}</CardDescription>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center p-4 pt-0">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{image.type}</Badge>
                                    <span className="text-xs text-muted-foreground">{image.date}</span>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">{t('common.open_menu')}</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => setImageToView(image)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            {t('medical_records.view_full_image')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            setImageToReplace(image);
                                            setIsReplaceDialogOpen(true);
                                        }}>
                                            <Replace className="mr-2 h-4 w-4" />
                                            {t('medical_records.replace_image')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            setImageToLink(image);
                                            setIsLinkDialogOpen(true);
                                        }}>
                                            <LinkIcon className="mr-2 h-4 w-4" />
                                            {t('medical_records.link_to_tooth')}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            onClick={() => setImageToDelete(image)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {t('medical_records.delete_image')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardFooter>
                        </Card>
                        ))}
                    </div>
                    ) : (
                    <div className="h-48 text-center text-muted-foreground flex flex-col items-center justify-center p-6 gap-4">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                        <span>{t('dental_chart.no_clinical_images')}</span>
                    </div>
                    )}
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="templates" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle>{t('medical_records.templates')}</CardTitle>
                        <div className="relative w-full md:w-auto">
                            <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
                            <Input
                            type="search"
                            placeholder={t('medical_records.search_templates')}
                            className={cn("w-full rounded-lg bg-background md:w-[250px] lg:w-[336px]", isRTL ? 'pr-8' : 'pl-8')}
                            value={templateSearchTerm}
                            onChange={(e) => setTemplateSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                {loading ? (
                  <div className="h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : filteredTemplates.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTemplates.map((template) => (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{template.name}</span>
                            <Badge variant="outline">{template.type}</Badge>
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {template.content}
                        </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                            {t('medical_records.use_template')}
                        </Button>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
                ) : (
                <div className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    <p>{t('medical_records.no_templates_found')}</p>
                </div>
                )}
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ViewRecordDialog 
        record={recordToView}
        open={!!recordToView}
        onOpenChange={(isOpen) => !isOpen && setRecordToView(null)}
      />

      {recordToEdit && (
        <EditRecordDialog
          record={recordToEdit}
          onSave={handleUpdateRecord}
          open={!!recordToEdit}
          onOpenChange={(isOpen) => !isOpen && setRecordToEdit(null)}
        />
      )}

      <ReplaceImageDialog
        image={imageToReplace}
        open={isReplaceDialogOpen}
        onOpenChange={setIsReplaceDialogOpen}
        onReplace={handleReplaceImage}
      />

      <ViewImageDialog
        image={imageToView}
        open={!!imageToView}
        onOpenChange={(isOpen) => !isOpen && setImageToView(null)}
      />

  <LinkImageToToothDialog
        image={imageToLink}
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        onSuccess={() => {
          setImageToLink(null);
          toast({
    title: t('medical_records.toast.image_linked'),
    description: t('medical_records.toast.image_linked_desc'),
          });
        }}
      />

      <AlertDialog open={!!recordToDelete} onOpenChange={(isOpen) => !isOpen && setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('medical_records.confirm_delete_record_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!imageToDelete} onOpenChange={(isOpen) => !isOpen && setImageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('medical_records.delete_clinical_image_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('medical_records.confirm_delete_image_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteImage} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('medical_records.delete_image')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
    </ErrorBoundary>
  );
}
