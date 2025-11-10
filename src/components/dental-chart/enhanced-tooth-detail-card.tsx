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

const conditionOptionsValues: ToothCondition[] = ['healthy','cavity','filling','crown','missing','root-canal'];

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
                        {(() => {
                            switch (tooth.condition) {
                                case 'healthy': return t('dental_chart.healthy');
                                case 'cavity': return t('dental_chart.cavity');
                                case 'filling': return t('dental_chart.filled');
                                case 'crown': return t('dental_chart.crowned');
                                case 'missing': return t('dental_chart.missing');
                                case 'root-canal': return t('dental_chart.root_canal');
                            }
                        })()}
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
                            <p className="capitalize text-muted-foreground mb-3">
                                {(() => {
                                    switch (tooth.condition) {
                                        case 'healthy': return t('dental_chart.healthy');
                                        case 'cavity': return t('dental_chart.cavity');
                                        case 'filling': return t('dental_chart.filled');
                                        case 'crown': return t('dental_chart.crowned');
                                        case 'missing': return t('dental_chart.missing');
                                        case 'root-canal': return t('dental_chart.root_canal');
                                    }
                                })()}
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
                                <SelectContent>
                                    {conditionOptionsValues.map(opt => (
                                        <SelectItem key={opt} value={opt}>
                                            {(() => {
                                                switch (opt) {
                                                    case 'healthy': return t('dental_chart.healthy');
                                                    case 'cavity': return t('dental_chart.cavity');
                                                    case 'filling': return t('dental_chart.filling');
                                                    case 'crown': return t('dental_chart.crown');
                                                    case 'missing': return t('dental_chart.missing');
                                                    case 'root-canal': return t('dental_chart.root_canal');
                                                }
                                            })()}
                                        </SelectItem>
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
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {(() => {
                                                        switch (entry.condition) {
                                                            case 'healthy': return t('dental_chart.healthy');
                                                            case 'cavity': return t('dental_chart.cavity');
                                                            case 'filling': return t('dental_chart.filled');
                                                            case 'crown': return t('dental_chart.crowned');
                                                            case 'missing': return t('dental_chart.missing');
                                                            case 'root-canal': return t('dental_chart.root_canal');
                                                        }
                                                    })()}
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
