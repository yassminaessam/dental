'use client';

import React from 'react';
import type { Tooth, ToothCondition } from '@/app/dental-chart/page';
import type { ClinicalImage, MedicalRecord } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toothNames } from '@/lib/data/dental-chart-data';
import { Search, X, FileText, Camera, Calendar, Plus, ExternalLink } from 'lucide-react';
import { DentalIntegrationService } from '@/services/dental-integration';
import { useToast } from '@/hooks/use-toast';
import { ToothRecordsDialog } from './tooth-records-dialog';
import { ToothImagesDialog } from './tooth-images-dialog';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

// Organized procedure categories for dropdown with translation keys
const procedureCategories = {
  'basic': ['healthy', 'cavity', 'missing'] as ToothCondition[],
  'bleaching': ['ext-bleach-arch', 'ext-bleach-tooth', 'int-bleach-tooth'] as ToothCondition[],
  'bridges': ['bridge-ceramic', 'bridge-ceramic-implant', 'fpd-repair', 'metal-crown-bridge', 'pfm-crown-bridge', 'pontic-ceramic', 'pontic-pfm'] as ToothCondition[],
  'crowns': ['crown', 'crown-ceramic', 'crown-composite', 'crown-implant', 'crown-metal', 'crown-pfm', 'crown-porcelain', 'crown-prov'] as ToothCondition[],
  'fillings': ['filling', 'composite-filling', 'composite-filling-1-3', 'composite-filling-ant-simple', 'composite-filling-ant-compound', 'composite-filling-ant-complex', 'composite-filling-ant-incisal', 'composite-filling-4-8', 'composite-filling-post-simple', 'composite-filling-post-compound', 'composite-filling-post-complex'] as ToothCondition[],
  'inlays': ['ceramic-inlay', 'inlay-ceramic-i', 'inlay-ceramic-ii', 'inlay-ceramic-iii', 'composite-inlay', 'inlay-composite-i', 'inlay-composite-ii', 'inlay-composite-iii'] as ToothCondition[],
  'onlays': ['ceramic-onlay', 'onlay-ceramic-ii', 'onlay-ceramic-iii', 'onlay-ceramic-iv', 'composite-onlay', 'onlay-composite-ii'] as ToothCondition[],
  'extractions': ['extraction', 'bone-impaction', 'complicated-impaction', 'extraction-crown-pri', 'extraction-tooth', 'part-impaction', 'remaining-roots-removal', 'soft-impaction', 'surgical-extraction'] as ToothCondition[],
  'root_canal': ['root-canal', 'rc-obstruction', 'rct-ant-1st', 'rct-molar-1st', 'rct-premolar-1st', 'rct-retreat-ant', 'rct-retreat-molar', 'rct-retreat-premolar', 'root-perforation'] as ToothCondition[],
  'pulpotomy': ['pulpotomy', 'pulpotomy-1st-visit', 'pulpotomy-ant-pri-1st', 'pulpotomy-post-pri-1st', 'pulpotomy-pri-per'] as ToothCondition[],
  'posts_cores': ['post', 'additional-titanium-post', 'core', 'titanium-post-core-bridge', 'titanium-post-crown'] as ToothCondition[],
  'implants': ['implant'] as ToothCondition[],
  'veneers': ['veneer', 'ceramic-veneer-lab', 'composite-veneer-lab', 'composite-veneer-office'] as ToothCondition[],
  'scaling': ['scaling-polishing', 'scaling-adults', 'scaling-child'] as ToothCondition[],
  'gingivectomy': ['gingivectomy', 'gingivectomy-gingivoplasty'] as ToothCondition[],
  'imaging': ['opg', 'cephalometric-xray', 'opg-xray', 'periapical-radiograph'] as ToothCondition[],
  'other': ['waxup', 'composite-crown'] as ToothCondition[],
};

// Helper function to get display label for condition
const getConditionLabel = (condition: ToothCondition, t: any): string => {
  const labels: Record<ToothCondition, string> = {
    'healthy': t('dental_chart.healthy'),
    'cavity': t('dental_chart.cavity'),
    'missing': t('dental_chart.missing'),
    'filling': t('dental_chart.filling'),
    'crown': t('dental_chart.crown'),
    'root-canal': t('dental_chart.root_canal'),
    'implant': t('dental_chart.implant'),
    'veneer': t('dental_chart.veneer'),
    'extraction': t('dental_chart.extraction'),
    // Bleaching
    'ext-bleach-arch': t('dental_chart.ext_bleach_arch'),
    'ext-bleach-tooth': t('dental_chart.ext_bleach_tooth'),
    'int-bleach-tooth': t('dental_chart.int_bleach_tooth'),
    // Bridges
    'bridge-ceramic': t('dental_chart.bridge_ceramic'),
    'bridge-ceramic-implant': t('dental_chart.bridge_ceramic_implant'),
    'fpd-repair': t('dental_chart.fpd_repair'),
    'metal-crown-bridge': t('dental_chart.metal_crown_bridge'),
    'pfm-crown-bridge': t('dental_chart.pfm_crown_bridge'),
    'pontic-ceramic': t('dental_chart.pontic_ceramic'),
    'pontic-pfm': t('dental_chart.pontic_pfm'),
    // Crowns
    'crown-ceramic': t('dental_chart.crown_ceramic'),
    'crown-composite': t('dental_chart.crown_composite'),
    'crown-implant': t('dental_chart.crown_implant'),
    'crown-metal': t('dental_chart.crown_metal'),
    'crown-pfm': t('dental_chart.crown_pfm'),
    'crown-porcelain': t('dental_chart.crown_porcelain'),
    'crown-prov': t('dental_chart.crown_prov'),
    'titanium-post-core-bridge': t('dental_chart.titanium_post_core_bridge'),
    // Fillings
    'composite-filling': t('dental_chart.composite_filling'),
    'composite-crown': t('dental_chart.composite_crown'),
    'composite-filling-1-3': t('dental_chart.composite_filling_1_3'),
    'composite-filling-ant-complex': t('dental_chart.composite_filling_ant_complex'),
    'composite-filling-ant-compound': t('dental_chart.composite_filling_ant_compound'),
    'composite-filling-ant-incisal': t('dental_chart.composite_filling_ant_incisal'),
    'composite-filling-ant-simple': t('dental_chart.composite_filling_ant_simple'),
    'composite-filling-4-8': t('dental_chart.composite_filling_4_8'),
    'composite-filling-post-complex': t('dental_chart.composite_filling_post_complex'),
    'composite-filling-post-compound': t('dental_chart.composite_filling_post_compound'),
    'composite-filling-post-simple': t('dental_chart.composite_filling_post_simple'),
    // Inlays
    'ceramic-inlay': t('dental_chart.ceramic_inlay'),
    'inlay-ceramic-i': t('dental_chart.inlay_ceramic_i'),
    'inlay-ceramic-ii': t('dental_chart.inlay_ceramic_ii'),
    'inlay-ceramic-iii': t('dental_chart.inlay_ceramic_iii'),
    'composite-inlay': t('dental_chart.composite_inlay'),
    'inlay-composite-i': t('dental_chart.inlay_composite_i'),
    'inlay-composite-ii': t('dental_chart.inlay_composite_ii'),
    'inlay-composite-iii': t('dental_chart.inlay_composite_iii'),
    // Onlays
    'ceramic-onlay': t('dental_chart.ceramic_onlay'),
    'onlay-ceramic-ii': t('dental_chart.onlay_ceramic_ii'),
    'onlay-ceramic-iii': t('dental_chart.onlay_ceramic_iii'),
    'onlay-ceramic-iv': t('dental_chart.onlay_ceramic_iv'),
    'composite-onlay': t('dental_chart.composite_onlay'),
    'onlay-composite-ii': t('dental_chart.onlay_composite_ii'),
    // Extractions
    'bone-impaction': t('dental_chart.bone_impaction'),
    'complicated-impaction': t('dental_chart.complicated_impaction'),
    'extraction-crown-pri': t('dental_chart.extraction_crown_pri'),
    'extraction-tooth': t('dental_chart.extraction_tooth'),
    'part-impaction': t('dental_chart.part_impaction'),
    'remaining-roots-removal': t('dental_chart.remaining_roots_removal'),
    'soft-impaction': t('dental_chart.soft_impaction'),
    'surgical-extraction': t('dental_chart.surgical_extraction'),
    // Gingivectomy
    'gingivectomy': t('dental_chart.gingivectomy'),
    'gingivectomy-gingivoplasty': t('dental_chart.gingivectomy_gingivoplasty'),
    // Imaging
    'opg': t('dental_chart.opg'),
    'cephalometric-xray': t('dental_chart.cephalometric_xray'),
    'opg-xray': t('dental_chart.opg_xray'),
    // Posts & Cores
    'post': t('dental_chart.post'),
    'additional-titanium-post': t('dental_chart.additional_titanium_post'),
    'core': t('dental_chart.core'),
    'titanium-post-crown': t('dental_chart.titanium_post_crown'),
    // Pulpotomy
    'pulpotomy': t('dental_chart.pulpotomy'),
    'pulpotomy-1st-visit': t('dental_chart.pulpotomy_1st_visit'),
    'pulpotomy-ant-pri-1st': t('dental_chart.pulpotomy_ant_pri_1st'),
    'pulpotomy-post-pri-1st': t('dental_chart.pulpotomy_post_pri_1st'),
    'pulpotomy-pri-per': t('dental_chart.pulpotomy_pri_per'),
    // RCT
    'rc-obstruction': t('dental_chart.rc_obstruction'),
    'rct-ant-1st': t('dental_chart.rct_ant_1st'),
    'rct-molar-1st': t('dental_chart.rct_molar_1st'),
    'rct-premolar-1st': t('dental_chart.rct_premolar_1st'),
    'rct-retreat-ant': t('dental_chart.rct_retreat_ant'),
    'rct-retreat-molar': t('dental_chart.rct_retreat_molar'),
    'rct-retreat-premolar': t('dental_chart.rct_retreat_premolar'),
    'root-perforation': t('dental_chart.root_perforation'),
    // Scaling
    'scaling-polishing': t('dental_chart.scaling_polishing'),
    'scaling-adults': t('dental_chart.scaling_adults'),
    'scaling-child': t('dental_chart.scaling_child'),
    // Veneers
    'ceramic-veneer-lab': t('dental_chart.ceramic_veneer_lab'),
    'composite-veneer-lab': t('dental_chart.composite_veneer_lab'),
    'composite-veneer-office': t('dental_chart.composite_veneer_office'),
    // Other
    'waxup': t('dental_chart.waxup'),
    'periapical-radiograph': t('dental_chart.periapical_radiograph'),
  };
  return labels[condition] || condition;
};

interface EnhancedToothDetailCardProps {
    tooth: Tooth | null;
    patientId: string | null;
    patientName: string;
    onUpdateCondition: (toothId: number, condition: ToothCondition) => void;
    onViewHistory: (tooth: Tooth) => void;
    onClose: () => void;
    onViewMedicalRecords?: () => void;
    onAddTreatmentNote?: (toothId: number) => void;
}

export function EnhancedToothDetailCard({ 
    tooth, 
    patientId,
    patientName,
    onUpdateCondition, 
    onViewHistory, 
    onClose,
    onViewMedicalRecords,
    onAddTreatmentNote
}: EnhancedToothDetailCardProps) {
    const { t } = useLanguage();
    const [relatedImages, setRelatedImages] = React.useState<ClinicalImage[]>([]);
    const [relatedRecords, setRelatedRecords] = React.useState<MedicalRecord[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [showRecordsDialog, setShowRecordsDialog] = React.useState(false);
    const [showImagesDialog, setShowImagesDialog] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        if (tooth && patientName) {
            loadIntegratedData();
        }
    }, [tooth, patientName]);

    const loadIntegratedData = async () => {
        if (!tooth) return;
        
        setLoading(true);
        try {
            const [images, records] = await Promise.all([
                DentalIntegrationService.getToothImages(tooth.id, patientName),
                DentalIntegrationService.getToothMedicalRecords(tooth.id, patientName)
            ]);
            
            setRelatedImages(() => images as ClinicalImage[]);
            setRelatedRecords(() => records as MedicalRecord[]);
        } catch (error) {
            console.error('Error loading integrated data:', error);
            toast({
                title: t('dental_chart.error_loading_data'),
                description: t('dental_chart.failed_to_load_related'),
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleConditionUpdate = async (toothId: number, newCondition: ToothCondition) => {
        if (!tooth || !patientId) return;

        const oldCondition = tooth.condition;
        
        // Update the tooth condition first
        onUpdateCondition(toothId, newCondition);

        // Create automated medical record if condition actually changed
        if (oldCondition !== newCondition) {
            try {
                await DentalIntegrationService.createTreatmentRecord(
                    patientId,
                    patientName,
                    toothId,
                    oldCondition,
                    newCondition,
                    `Condition updated via dental chart integration`
                );

                toast({
                    title: t('dental_chart.treatment_record_created'),
                    description: t('dental_chart.medical_record_auto'),
                });
            } catch (error) {
                console.error('Error creating treatment record:', error);
                toast({
                    title: t('dental_chart.integration_warning'),
                    description: t('dental_chart.record_creation_failed'),
                    variant: "destructive"
                });
            }
        }
    };

    const handleCreateFollowUp = async () => {
        if (!tooth || !patientId) return;

        try {
            await DentalIntegrationService.createFollowUpRecord(
                patientId,
                patientName,
                tooth.id,
                "Follow-up assessment completed via dental chart integration",
                "Schedule next appointment as needed"
            );

            toast({
                title: t('dental_chart.follow_up_record_created'),
                description: t('dental_chart.follow_up_for_tooth', { id: tooth.id }),
            });

            // Reload the integrated data
            loadIntegratedData();
        } catch (error) {
            console.error('Error creating follow-up record:', error);
            toast({
                title: t('common.error'),
                description: t('dental_chart.failed_to_create_follow_up'),
                variant: "destructive"
            });
        }
    };

    if (!tooth) {
        return (
            <Card className="flex h-full flex-col items-center justify-center p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{t('dental_chart.select_tooth_heading')}</h3>
                <p className="mt-1 text-center text-sm text-muted-foreground">
                    {t('dental_chart.select_tooth_description')}
                </p>
            </Card>
        );
    }

    return (
        <>
        <Card className="relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
            
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {t('dental_chart.tooth_number_display', { id: tooth.id })}
                    <Badge variant={tooth.condition === 'healthy' ? 'default' : 'secondary'}>
                        {getConditionLabel(tooth.condition, t)}
                    </Badge>
                </CardTitle>
                <CardDescription>{toothNames[tooth.id] || t('dental_chart.unknown_tooth')}</CardDescription>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="condition" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="condition">{t('dental_chart.condition_tab')}</TabsTrigger>
                        <TabsTrigger value="records" className="relative">
                            {t('dental_chart.records_tab')}
                            {relatedRecords.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                                    {relatedRecords.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="images" className="relative">
                            {t('dental_chart.images_tab')}
                            {relatedImages.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                                    {relatedImages.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="history">{t('dental_chart.history_tab')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="condition" className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">{t('dental_chart.current_condition')}</h4>
                            <p className="text-muted-foreground mb-3">
                                {getConditionLabel(tooth.condition, t)}
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="mb-2 font-medium">{t('dental_chart.update_condition')}</h4>
                            <Select
                                value={tooth.condition}
                                onValueChange={(value: ToothCondition) => handleConditionUpdate(tooth.id, value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('dental_chart.select_condition')} />
                                </SelectTrigger>
                                <SelectContent className="max-h-96 overflow-y-auto">
                                    {Object.entries(procedureCategories).map(([category, procedures]) => (
                                        <React.Fragment key={category}>
                                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                                                {t(`dental_chart.category_${category}`)}
                                            </div>
                                            {procedures.map((procedure) => (
                                                <SelectItem key={procedure} value={procedure} className="pl-4">
                                                    {getConditionLabel(procedure, t)}
                                                </SelectItem>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">{t('dental_chart.medical_record_auto')}</p>
                        </div>

                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleCreateFollowUp}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {t('dental_chart.add_follow_up')}
                        </Button>
                    </TabsContent>

                    <TabsContent value="records" className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">{t('dental_chart.medical_records')}</h4>
                            <div className="flex gap-1">
                                <Button variant="outline" size="sm" onClick={() => setShowRecordsDialog(true)}>
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    {t('dental_chart.view_all')}
                                </Button>
                                {onViewMedicalRecords && (
                                    <Button variant="outline" size="sm" onClick={onViewMedicalRecords}>
                                        {t('dental_chart.upload')}
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        <ScrollArea className="h-32">
                            {loading ? (
                                <div className="text-sm text-muted-foreground">{t('common.loading')}</div>
                            ) : relatedRecords.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedRecords.slice(0, 3).map((record, index) => (
                                        <div key={index} className="p-2 border rounded-sm">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-3 w-3" />
                                                <span className="text-sm font-medium">{record.type}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {record.date}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {(record as any).complaint || t('dental_chart.medical_records')}
                                            </p>
                                        </div>
                                    ))}
                                    {relatedRecords.length > 3 && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            +{relatedRecords.length - 3} {t('dental_chart.more_records')}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{t('dental_chart.no_medical_records')}</div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="images" className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">{t('dental_chart.clinical_images')}</h4>
                            <div className="flex gap-1">
                                <Button variant="outline" size="sm" onClick={() => setShowImagesDialog(true)}>
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    {t('dental_chart.view_all')}
                                </Button>
                                {onViewMedicalRecords && (
                                    <Button variant="outline" size="sm" onClick={onViewMedicalRecords}>
                                        {t('dental_chart.upload')}
                                    </Button>
                                )}
                            </div>
                        </div>
                        
                        <ScrollArea className="h-32">
                            {loading ? (
                                <div className="text-sm text-muted-foreground">{t('common.loading')}</div>
                            ) : relatedImages.length > 0 ? (
                                <div className="space-y-2">
                                    {relatedImages.slice(0, 2).map((image, index) => (
                                        <div key={index} className="p-2 border rounded-sm">
                                            <div className="flex items-center gap-2">
                                                <Camera className="h-3 w-3" />
                                                <span className="text-sm font-medium">{image.type}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {image.date}
                                                </Badge>
                                            </div>
                                            {image.caption && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {image.caption}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                    {relatedImages.length > 2 && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            +{relatedImages.length - 2} {t('dental_chart.more_images')}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{t('dental_chart.no_clinical_images')}</div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-3">
                        <h4 className="font-medium">{t('dental_chart.treatment_history')}</h4>
                        
                        <ScrollArea className="h-32">
                            {tooth.history.length > 0 ? (
                                <div className="space-y-2">
                                    {tooth.history.slice(-3).reverse().map((entry, index) => (
                                        <div key={index} className="p-2 border rounded-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                <span className="text-sm font-medium">{entry.date}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {getConditionLabel(entry.condition, t)}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {entry.notes}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">{t('dental_chart.no_history_for_tooth', { id: tooth.id })}</div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
            
            <CardFooter className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => onViewHistory(tooth)}>
                    {t('dental_chart.view_full_history')}
                </Button>
            </CardFooter>
        </Card>

        {/* Records Dialog */}
        <ToothRecordsDialog
            open={showRecordsDialog}
            onOpenChange={setShowRecordsDialog}
            toothNumber={tooth.id}
            patientName={patientName}
            records={relatedRecords}
        />

        {/* Images Dialog */}
        <ToothImagesDialog
            open={showImagesDialog}
            onOpenChange={setShowImagesDialog}
            toothNumber={tooth.id}
            patientName={patientName}
            images={relatedImages}
        />
        </>
    );
}
