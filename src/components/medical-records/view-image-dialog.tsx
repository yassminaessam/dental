'use client';

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import type { ClinicalImage } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { getClientFtpProxyUrl } from '@/lib/ftp-proxy-url';

interface ViewImageDialogProps {
  image: ClinicalImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewImageDialog({ image, open, onOpenChange }: ViewImageDialogProps) {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const { toast } = useToast();
  const imageContainerRef = React.useRef<HTMLDivElement>(null);
  const { t, isRTL } = useLanguage();

  // Reset zoom and rotation when dialog opens/closes or image changes
  React.useEffect(() => {
    if (open && image) {
      setZoom(1);
      setRotation(0);
    }
  }, [open, image]);

  // Apply transform to image container using ref
  React.useEffect(() => {
    try {
      if (imageContainerRef.current) {
        imageContainerRef.current.style.transform = `scale(${zoom}) rotate(${rotation}deg)`;
      }
    } catch (error) {
      console.error('Error applying transform:', error);
    }
  }, [zoom, rotation]);

  if (!image) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">
              {image.caption || `${image.type} ${t('medical_records.image')}`}
            </DialogTitle>
            <Badge variant="secondary">{image.type}</Badge>
          </div>
          <DialogDescription className="sr-only">
            {t('medical_records.view_image_for', { patient: image.patient, type: image.type, date: image.date })}
          </DialogDescription>
          
          {/* Image controls */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t('common.patient')}:</span>
              <span className="text-sm font-medium">{image.patient}</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{image.date}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                {t('common.reset')}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Image container */}
        <div className="flex-1 flex items-center justify-center overflow-auto bg-muted/20 rounded-lg p-4 min-h-0">
          <div 
            ref={imageContainerRef}
            className="relative transition-transform duration-200 ease-in-out origin-center"
          >
            <Image
              src={getClientFtpProxyUrl(image.imageUrl)}
              alt={image.caption || t('medical_records.clinical_image_for', { patient: image.patient })}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              unoptimized
            />
          </div>
        </div>

        {/* Image details */}
        {image.caption && (
          <div className="flex-shrink-0 pt-4 border-t">
            <div className="space-y-2">
              <div className="text-sm font-medium">{t('medical_records.image_caption')}:</div>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                {image.caption}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
