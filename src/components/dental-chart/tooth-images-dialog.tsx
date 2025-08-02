'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Camera, Calendar, ExternalLink, Plus, AlertCircle, Eye, Download, Link as LinkIcon } from "lucide-react";
import { ClinicalImage } from '@/app/medical-records/page';
import { toothNames } from '@/lib/data/dental-chart-data';

interface ToothImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toothNumber: number;
  patientName: string;
  images: ClinicalImage[];
  onViewFullImage?: (image: ClinicalImage) => void;
  onLinkNewImage?: () => void;
  onNavigateToUploadImages?: () => void;
}

export function ToothImagesDialog({
  open,
  onOpenChange,
  toothNumber,
  patientName,
  images,
  onViewFullImage,
  onLinkNewImage,
  onNavigateToUploadImages
}: ToothImagesDialogProps) {
  const toothName = toothNames[toothNumber] || `Tooth #${toothNumber}`;

  const getImageTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'x-ray': 
      case 'radiograph': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'intraoral': 
      case 'clinical photo': return 'bg-green-100 text-green-700 border-green-200';
      case 'panoramic': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'bitewing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'periapical': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const groupedImages = React.useMemo(() => {
    const groups: { [key: string]: ClinicalImage[] } = {};
    images.forEach(image => {
      const type = image.type || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(image);
    });
    return groups;
  }, [images]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Clinical Images for {toothName}
          </DialogTitle>
          <DialogDescription>
            All clinical images linked to {toothName} for patient {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{images.length}</div>
                <div className="text-xs text-muted-foreground">Total Images</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(groupedImages['X-Ray'] || []).length + (groupedImages['Radiograph'] || []).length}
                </div>
                <div className="text-xs text-muted-foreground">X-Rays</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(groupedImages['Intraoral'] || []).length + (groupedImages['Clinical Photo'] || []).length}
                </div>
                <div className="text-xs text-muted-foreground">Clinical Photos</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(groupedImages).length}
                </div>
                <div className="text-xs text-muted-foreground">Image Types</div>
              </div>
            </Card>
          </div>

          {/* Images by Type */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">All Images ({images.length})</h4>
              <div className="flex gap-2">
                {onLinkNewImage && (
                  <Button variant="outline" size="sm" onClick={onLinkNewImage}>
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Link Image
                  </Button>
                )}
                {onNavigateToUploadImages && (
                  <Button variant="outline" size="sm" onClick={onNavigateToUploadImages}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Medical Records
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="h-96">
              {images.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(groupedImages).map(([type, typeImages]) => (
                    <div key={type} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm">{type}</h5>
                        <Badge variant="outline" className="text-xs">
                          {typeImages.length} image{typeImages.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {typeImages.map((image) => (
                          <Card key={image.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <CardTitle className="text-sm flex items-center gap-2">
                                    <Camera className="h-4 w-4" />
                                    {image.type}
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getImageTypeColor(image.type)}`}
                                    >
                                      {image.type}
                                    </Badge>
                                  </CardTitle>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {image.date}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {image.patient}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  {onViewFullImage && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onViewFullImage(image)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                {/* Image Preview Placeholder */}
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                  <div className="text-center space-y-2">
                                    <Camera className="h-8 w-8 text-muted-foreground mx-auto" />
                                    <div className="text-xs text-muted-foreground">
                                      {image.type} Image
                                    </div>
                                  </div>
                                </div>
                                
                                {image.caption && (
                                  <div>
                                    <h6 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                      Caption
                                    </h6>
                                    <p className="text-sm">{image.caption}</p>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-2">
                                  <div className="text-xs text-muted-foreground">
                                    Linked to {toothName}
                                  </div>
                                  <div className="flex gap-1">
                                    {onViewFullImage && (
                                      <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => onViewFullImage(image)}
                                        className="h-auto p-0 text-xs"
                                      >
                                        View Full →
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="p-8">
                  <div className="text-center space-y-3">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h4 className="font-medium">No Clinical Images</h4>
                      <p className="text-sm text-muted-foreground">
                        No clinical images have been linked to {toothName} yet.
                      </p>
                    </div>
                    {onLinkNewImage && (
                      <Button variant="outline" onClick={onLinkNewImage}>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Link First Image
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </ScrollArea>
          </div>

          {/* Quick Actions */}
          <Separator />
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-muted-foreground">
              Images are automatically synced between dental chart and medical records
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
