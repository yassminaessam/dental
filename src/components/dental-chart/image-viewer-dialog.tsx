'use client';

import React from 'react';
import styles from './image-viewer.module.css';
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
import { Label } from "@/components/ui/label";
import { Download, Calendar, Camera, Maximize2, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { ClinicalImage } from '@/app/medical-records/page';
import { toothNames } from '@/lib/data/dental-chart-data';
import { getClientFtpProxyUrl } from '@/lib/ftp-proxy-url';

interface ImageViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ClinicalImage | null;
  toothNumber?: number;
}

export function ImageViewerDialog({
  open,
  onOpenChange,
  image,
  toothNumber
}: ImageViewerDialogProps) {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  const toothName = toothNumber ? toothNames[toothNumber] : null;

  // Create a dynamic transform class
  const getTransformClasses = React.useMemo(() => {
    const zoomClass = `zoom-${Math.round(zoom * 100)}`;
    const rotateClass = `rotate-${rotation}`;
    return `${styles.imageTransform} ${styles[zoomClass]} ${styles[rotateClass]}`;
  }, [zoom, rotation]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (!image || !image.imageUrl) return;
    if (typeof window === 'undefined') return;
    
    // Create a download link for the image
    const link = document.createElement('a');
    link.href = image.imageUrl;
    link.download = `${image.type}_${image.patient}_${image.date}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  React.useEffect(() => {
    if (open) {
      setZoom(1);
      setRotation(0);
    }
  }, [open, image]);

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {image.type} - {image.patient}
            {toothName && (
              <Badge variant="outline" className="ml-2">
                {toothName}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Clinical image captured on {image.date}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-4 p-6 pt-0">
          {/* Image Display Area */}
          <div className="flex-1 relative">
            <Card className="h-[70vh] overflow-hidden">
              <CardContent className="p-0 h-full relative">
                {/* Image Controls */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRotate}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {/* Zoom indicator */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(zoom * 100)}%
                  </Badge>
                </div>

                {/* Image Container */}
                <div className="w-full h-full flex items-center justify-center bg-muted/50 overflow-auto">
                  <div className={`${styles.imageContainer} relative transition-transform duration-200 ease-in-out origin-center`}>
                    {/* Actual Image Display */}
                    {image.imageUrl ? (
                      <img 
                        src={getClientFtpProxyUrl(image.imageUrl)} 
                        alt={`${image.type} for ${image.patient}`}
                        className={`max-w-none max-h-none object-contain ${getTransformClasses} ${styles.fullSizeImage}`}
                      />
                    ) : (
                      <div className={`w-96 h-96 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20 ${getTransformClasses}`}>
                        <div className="text-center space-y-3">
                          <Camera className="h-16 w-16 text-muted-foreground mx-auto" />
                          <div>
                            <div className="font-medium text-lg">{image.type}</div>
                            <div className="text-sm text-muted-foreground">
                              {image.patient} - {image.date}
                            </div>
                            <div className="text-sm text-red-500 mt-2">
                              Image URL not available
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`${getImageTypeColor(image.type)}`}
                          >
                            {image.type}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Image Details Panel */}
          <div className="lg:w-80 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Image Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Type
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`${getImageTypeColor(image.type)}`}
                    >
                      {image.type}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Patient
                  </Label>
                  <div className="text-sm font-medium mt-1">{image.patient}</div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Date Captured
                  </Label>
                  <div className="text-sm flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {image.date}
                  </div>
                </div>

                {toothName && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Linked to Tooth
                    </Label>
                    <div className="text-sm font-medium mt-1">
                      {toothName} (#{toothNumber})
                    </div>
                  </div>
                )}

                {image.caption && (
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Caption / Notes
                    </Label>
                    <div className="text-sm mt-1 p-2 bg-muted/50 rounded">
                      {image.caption}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Image
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => typeof window !== 'undefined' && window.print()}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
