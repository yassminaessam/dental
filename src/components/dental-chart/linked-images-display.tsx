'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, ExternalLink, Calendar } from "lucide-react";
import { ClinicalImage } from '@/app/medical-records/page';

interface LinkedImagesDisplayProps {
  toothNumber: number;
  images: ClinicalImage[];
  onImageClick?: (image: ClinicalImage) => void;
  onViewInMedicalRecords?: (patientId: string) => void;
}

export function LinkedImagesDisplay({ 
  toothNumber, 
  images, 
  onImageClick, 
  onViewInMedicalRecords 
}: LinkedImagesDisplayProps) {
  if (images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Clinical Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No clinical images linked to tooth #{toothNumber}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Clinical Images ({images.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onImageClick?.(image)}
          >
            <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
              {image.imageUrl ? (
                <img 
                  src={image.imageUrl} 
                  alt={`${image.type} thumbnail`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{image.type}</h4>
                <Badge variant="outline" className="text-xs">
                  {image.patient}
                </Badge>
              </div>
              
              {image.caption && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {image.caption}
                </p>
              )}
              
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {image.date}
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewInMedicalRecords?.(image.patient);
              }}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {images.length > 0 && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewInMedicalRecords?.(images[0].patient)}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View All in Medical Records
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
