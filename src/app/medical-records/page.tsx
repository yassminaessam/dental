
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
import { Search, User, Download, Image as ImageIcon, Eye, Pencil, Loader2, Trash2, MoreHorizontal, Replace, Link as LinkIcon } from "lucide-react";
import { UploadImageDialog } from "@/components/medical-records/upload-image-dialog";
import { ReplaceImageDialog } from "@/components/medical-records/replace-image-dialog";
import { NewRecordDialog } from "@/components/medical-records/new-record-dialog";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ViewRecordDialog } from '@/components/medical-records/view-record-dialog';
import { EditRecordDialog } from '@/components/medical-records/edit-record-dialog';
import { LinkImageToToothDialog } from '@/components/medical-records/link-image-to-tooth-dialog';
import { ViewImageDialog } from '@/components/medical-records/view-image-dialog';
import { getCollection, setDocument, updateDocument, deleteDocument } from '@/services/firestore';
import { clinicalImagesStorage } from '@/services/storage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';

export type MedicalRecord = {
  id: string;
  patient: string;
  type: string;
  complaint: string;
  provider: string;
  date: string;
  status: 'Final' | 'Draft';
  notes?: string;
};

export type MedicalRecordTemplate = {
  id: string;
  name: string;
  type: string;
  content: string;
};

export type ClinicalImage = {
  id: string;
  patient: string;
  type: string;
  date: string;
  imageUrl: string;
  caption?: string;
};

const medicalRecordTypes = ['SOAP', 'Clinical Note', 'Treatment Plan', 'Consultation'];

export default function MedicalRecordsPage() {
  const { t, isRTL } = useLanguage();
  const [records, setRecords] = React.useState<MedicalRecord[]>([]);
  const [images, setImages] = React.useState<ClinicalImage[]>([]);
  const [templates, setTemplates] = React.useState<MedicalRecordTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);

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
            const [recordsData, imagesData, templatesData] = await Promise.all([
                getCollection<MedicalRecord>('medical-records'),
                getCollection<ClinicalImage>('clinical-images'),
                getCollection<MedicalRecordTemplate>('templates'),
            ]);
            setRecords(recordsData);
            setImages(imagesData);
            setTemplates(templatesData);
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
  }, [toast]);

  const medicalRecordsPageStats = React.useMemo(() => {
    const draftRecords = records.filter(r => r.status === 'Draft').length;
    return [
      { title: t('medical_records.total_records'), value: records.length, description: t('medical_records.all_patient_records') },
      { title: t('medical_records.clinical_images'), value: images.length, description: t('medical_records.all_uploaded_images') },
      { title: t('medical_records.templates'), value: templates.length, description: t('medical_records.for_faster_documentation') },
      { title: t('medical_records.draft_records'), value: draftRecords, description: t('medical_records.awaiting_finalization'), valueClassName: "text-orange-500" },
    ];
  }, [records, images, templates]);

  const handleSaveRecord = async (data: Omit<MedicalRecord, 'id' | 'status'>) => {
    try {
      const newRecord: MedicalRecord = {
        id: `MR-${Date.now()}`,
        ...data,
        status: 'Final',
      };
      await setDocument('medical-records', newRecord.id, newRecord);
      setRecords(prev => [newRecord, ...prev]);
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
      await updateDocument('medical-records', updatedRecord.id, updatedRecord);
      setRecords(prev => prev.map(rec => rec.id === updatedRecord.id ? updatedRecord : rec));
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
      await deleteDocument('medical-records', recordToDelete.id);
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
      const newImage: ClinicalImage = {
        id: `IMG-${Date.now()}`,
        patient: data.patientName,
        type: data.type,
        date: new Date().toLocaleDateString(),
        imageUrl: data.imageUrl, // Now using the actual Firebase Storage URL
        caption: data.caption
      };
      
      // Save to Firestore with the actual storage URL
      await setDocument('clinical-images', newImage.id, newImage);
      setImages(prev => [newImage, ...prev]);
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
        date: new Date().toLocaleDateString(), // Update date when replaced
      };

      await updateDocument('clinical-images', imageId, updatedImageData);
      setImages(prev => prev.map(img => img.id === imageId ? updatedImageData : img));
      
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
      // Delete from Firebase Storage (only if it's a Firebase Storage URL)
      if (imageToDelete.imageUrl.includes('firebasestorage.googleapis.com') || imageToDelete.imageUrl.includes('storage.googleapis.com')) {
        await clinicalImagesStorage.deleteClinicalImage(imageToDelete.imageUrl);
      }
      
      // Always delete from Firestore regardless of URL type
      await deleteDocument('clinical-images', imageToDelete.id);
      
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

  const filteredRecords = React.useMemo(() => {
    return records
      .filter(record => 
        record.patient.toLowerCase().includes(recordSearchTerm.toLowerCase()) ||
        record.complaint.toLowerCase().includes(recordSearchTerm.toLowerCase())
      )
      .filter(record => 
        recordTypeFilter === 'all' || record.type === recordTypeFilter
      );
  }, [records, recordSearchTerm, recordTypeFilter]);

  const filteredImages = React.useMemo(() => {
    return images.filter(image => 
      image.patient.toLowerCase().includes(imageSearchTerm.toLowerCase()) ||
      image.caption?.toLowerCase().includes(imageSearchTerm.toLowerCase())
    );
  }, [images, imageSearchTerm]);
  
  const filteredTemplates = React.useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(templateSearchTerm.toLowerCase())
    );
  }, [templates, templateSearchTerm]);

  return (
    <ErrorBoundary>
      <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Elite Medical Records Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
                <User className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Clinical Documentation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('medical_records.title')}
            </h1>
            <p className="text-muted-foreground font-medium">
              Elite Healthcare Records
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <UploadImageDialog onUpload={handleImageUpload} />
            <NewRecordDialog onSave={handleSaveRecord} />
          </div>
        </div>

        {/* Elite Medical Records Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {medicalRecordsPageStats.map((stat, index) => {
            const cardStyles = [
              'metric-card-blue',
              'metric-card-green', 
              'metric-card-orange',
              'metric-card-purple'
            ];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group",
                  cardStyle
                )}
              >
                {/* Animated Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className={cn("text-2xl font-bold text-white drop-shadow-sm")}>
                      {stat.value}
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                    <User className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 relative z-10">
                  <p className="text-xs text-white/80 font-medium">
                    {stat.description}
                  </p>
                  {/* Elite Status Indicator */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                    <span className="text-xs text-white/70 font-medium">Active</span>
                  </div>
                </CardContent>
                
                {/* Elite Corner Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent" />
              </Card>
            );
          })}
        </div>
        
        {/* Elite Medical Records Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-background/60 backdrop-blur-sm border border-border/50 p-1 rounded-xl">
            <TabsTrigger 
              value="medical-records" 
              className="rounded-lg px-6 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('medical_records.medical_records')}
            </TabsTrigger>
            <TabsTrigger 
              value="clinical-images" 
              className="rounded-lg px-6 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('medical_records.clinical_images')}
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="rounded-lg px-6 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('medical_records.templates')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="medical-records" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>{t('medical_records.patient_medical_records')}</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
                    <Input
                      type="search"
                      placeholder={t('medical_records.search_records')}
                      className={cn("w-full rounded-lg bg-background lg:w-[336px]", isRTL ? 'pr-8' : 'pl-8')}
                      value={recordSearchTerm}
                      onChange={(e) => setRecordSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
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
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('medical_records.record_id')}</TableHead>
                      <TableHead>{t('common.patient')}</TableHead>
                      <TableHead>{t('medical_records.type')}</TableHead>
                      <TableHead>{t('medical_records.chief_complaint')}</TableHead>
                      <TableHead>{t('medical_records.provider')}</TableHead>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className="text-right">{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
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
                          <TableCell>
                            <Badge variant={record.type === 'SOAP' ? 'default' : 'secondary'}>{record.type}</Badge>
                          </TableCell>
                          <TableCell>{record.complaint}</TableCell>
                          <TableCell>{record.provider}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.status === 'Draft' ? t('medical_records.draft') : t('medical_records.final')}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">{t('common.actions')}</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setRecordToView(record)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t('table.view')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setRecordToEdit(record)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  {t('table.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadRecord(record.id)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  {t('table.download')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setRecordToDelete(record)} className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('table.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
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
             <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle>{t('medical_records.clinical_images')}</CardTitle>
                        <div className="relative w-full md:w-auto">
                            <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? 'right-2.5' : 'left-2.5')} />
                            <Input
                            type="search"
                            placeholder={t('medical_records.search_images') + '...'}
                            className={cn("w-full rounded-lg bg-background md:w-[250px] lg:w-[336px]", isRTL ? 'pr-8' : 'pl-8')}
                            value={imageSearchTerm}
                            onChange={(e) => setImageSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                      <div className="h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : filteredImages.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredImages.map((image) => (
                        <Card key={image.id} className="overflow-hidden group">
                            <CardHeader className="p-0">
                            <div className="relative aspect-video">
                                <Image
                                src={image.imageUrl}
                                alt={image.caption || `Clinical image for ${image.patient}`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover"
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
