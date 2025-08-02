'use client';

import React from 'react';
import type { Tooth, ToothCondition } from '@/app/dental-chart/page';
import type { ClinicalImage, MedicalRecord } from '@/app/medical-records/page';
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
import Image from 'next/image';

const conditionOptions: { value: ToothCondition, label: string }[] = [
    { value: 'healthy', label: 'Healthy' },
    { value: 'cavity', label: 'Cavity' },
    { value: 'filling', label: 'Filling' },
    { value: 'crown', label: 'Crown' },
    { value: 'missing', label: 'Missing' },
    { value: 'root-canal', label: 'Root Canal' },
];

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
    const [relatedImages, setRelatedImages] = React.useState<ClinicalImage[]>([]);
    const [relatedRecords, setRelatedRecords] = React.useState<MedicalRecord[]>([]);
    const [loading, setLoading] = React.useState(false);
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
            
            setRelatedImages(images);
            setRelatedRecords(records);
        } catch (error) {
            console.error('Error loading integrated data:', error);
            toast({
                title: "Error Loading Data",
                description: "Failed to load related images and records.",
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
                    title: "Treatment Record Created",
                    description: `Medical record automatically generated for tooth #${toothId} condition change.`,
                });
            } catch (error) {
                console.error('Error creating treatment record:', error);
                toast({
                    title: "Integration Warning",
                    description: "Tooth updated but medical record creation failed.",
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
                title: "Follow-up Record Created",
                description: `Follow-up record created for tooth #${tooth.id}.`,
            });

            // Reload the integrated data
            loadIntegratedData();
        } catch (error) {
            console.error('Error creating follow-up record:', error);
            toast({
                title: "Error",
                description: "Failed to create follow-up record.",
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
                <h3 className="mt-4 text-lg font-semibold">Select a Tooth</h3>
                <p className="mt-1 text-center text-sm text-muted-foreground">
                    Click on any tooth in the chart to view details, medical records, and manage conditions.
                </p>
            </Card>
        );
    }

    return (
        <Card className="relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 z-10" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
            
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Tooth #{tooth.id}
                    <Badge variant={tooth.condition === 'healthy' ? 'default' : 'secondary'}>
                        {tooth.condition.replace('-', ' ')}
                    </Badge>
                </CardTitle>
                <CardDescription>{toothNames[tooth.id] || 'Unknown Tooth'}</CardDescription>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="condition" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="condition">Condition</TabsTrigger>
                        <TabsTrigger value="records" className="relative">
                            Records
                            {relatedRecords.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                                    {relatedRecords.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="images" className="relative">
                            Images
                            {relatedImages.length > 0 && (
                                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                                    {relatedImages.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="condition" className="space-y-4">
                        <div>
                            <h4 className="font-medium mb-2">Current Condition</h4>
                            <p className="capitalize text-muted-foreground mb-3">
                                {tooth.condition.replace('-', ' ')}
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="mb-2 font-medium">Update Condition</h4>
                            <Select
                                value={tooth.condition}
                                onValueChange={(value: ToothCondition) => handleConditionUpdate(tooth.id, value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                <SelectContent>
                                    {conditionOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                                * Changing condition will automatically create a medical record
                            </p>
                        </div>

                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleCreateFollowUp}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Follow-up Note
                        </Button>
                    </TabsContent>

                    <TabsContent value="records" className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Medical Records</h4>
                            {onViewMedicalRecords && (
                                <Button variant="outline" size="sm" onClick={onViewMedicalRecords}>
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    View All
                                </Button>
                            )}
                        </div>
                        
                        <ScrollArea className="h-32">
                            {loading ? (
                                <div className="text-sm text-muted-foreground">Loading...</div>
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
                                                {(record as any).complaint || 'Medical record for this tooth'}
                                            </p>
                                        </div>
                                    ))}
                                    {relatedRecords.length > 3 && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            +{relatedRecords.length - 3} more records
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No medical records linked to this tooth yet.
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="images" className="space-y-3">
                        <h4 className="font-medium">Clinical Images</h4>
                        
                        <ScrollArea className="h-32">
                            {loading ? (
                                <div className="text-sm text-muted-foreground">Loading...</div>
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
                                            +{relatedImages.length - 2} more images
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No clinical images linked to this tooth yet.
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-3">
                        <h4 className="font-medium">Treatment History</h4>
                        
                        <ScrollArea className="h-32">
                            {tooth.history.length > 0 ? (
                                <div className="space-y-2">
                                    {tooth.history.slice(-3).reverse().map((entry, index) => (
                                        <div key={index} className="p-2 border rounded-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                <span className="text-sm font-medium">{entry.date}</span>
                                                <Badge variant="outline" className="text-xs capitalize">
                                                    {entry.condition.replace('-', ' ')}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {entry.notes}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    No treatment history for this tooth.
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
            
            <CardFooter className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => onViewHistory(tooth)}>
                    View Full History
                </Button>
            </CardFooter>
        </Card>
    );
}
