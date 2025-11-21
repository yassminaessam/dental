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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Link as LinkIcon, Camera, Calendar, Upload, ExternalLink } from "lucide-react";
import type { ClinicalImage } from '@/lib/types';
import { DentalIntegrationService } from '@/services/dental-integration';
import { useToast } from '@/hooks/use-toast';
import { toothNames } from '@/lib/data/dental-chart-data';

interface LinkImageToToothFromChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toothNumber: number;
  patientName: string;
  onSuccess?: () => void;
  onNavigateToUploadImages?: () => void;
}

export function LinkImageToToothFromChartDialog({ 
  open, 
  onOpenChange, 
  toothNumber,
  patientName,
  onSuccess,
  onNavigateToUploadImages
}: LinkImageToToothFromChartDialogProps) {
  const [availableImages, setAvailableImages] = React.useState<ClinicalImage[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedImage, setSelectedImage] = React.useState<ClinicalImage | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingImages, setLoadingImages] = React.useState(false);
  const { toast } = useToast();

  const toothName = toothNames[toothNumber] || `Tooth #${toothNumber}`;

  React.useEffect(() => {
    if (open && patientName) {
      loadAvailableImages();
    }
  }, [open, patientName]);

  const loadAvailableImages = async () => {
    setLoadingImages(true);
    try {
      // Get all clinical images for this patient
      const allImages = await DentalIntegrationService.getPatientImages(patientName);
      
      // Filter out images already linked to this tooth
      const linkedImages = await DentalIntegrationService.getToothImages(toothNumber, patientName);
      const linkedImageIds = linkedImages.map(img => img.id);
      
      const nextAvailable: ClinicalImage[] = allImages.filter(img => !linkedImageIds.includes(img.id));
      setAvailableImages(() => nextAvailable);
    } catch (error) {
      console.error('Error loading available images:', error);
      toast({
        title: "Error Loading Images",
        description: "Failed to load available clinical images.",
        variant: "destructive"
      });
    } finally {
      setLoadingImages(false);
    }
  };

  const filteredImages = React.useMemo(() => {
    if (!searchTerm) return availableImages;
    
    return availableImages.filter(image => 
      image.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.date.includes(searchTerm)
    );
  }, [availableImages, searchTerm]);

  const handleLinkImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      await DentalIntegrationService.linkImageToTooth(
        selectedImage.id,
        toothNumber
      );

      toast({
        title: "Image Linked Successfully",
        description: `${selectedImage.type} image has been linked to ${toothName}.`,
      });

      onSuccess?.();
      onOpenChange(false);
      setSelectedImage(null);
      setSearchTerm('');
    } catch (error) {
      console.error('Error linking image to tooth:', error);
      toast({
        title: "Error Linking Image",
        description: "Failed to link image to tooth. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Link Image to {toothName}
          </DialogTitle>
          <DialogDescription>
            Select a clinical image to link to {toothName} for patient {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Images</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by type, date, or caption..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Selected Image */}
          {selectedImage && (
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Selected Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedImage.type}</span>
                      <Badge 
                        variant="outline" 
                        className={getImageTypeColor(selectedImage.type)}
                      >
                        {selectedImage.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {selectedImage.date}
                    </div>
                    {selectedImage.caption && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {selectedImage.caption}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Available Images ({filteredImages.length})
              </h4>
              {onNavigateToUploadImages && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    onNavigateToUploadImages();
                    onOpenChange(false);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Add New Image
                </Button>
              )}
            </div>

            <ScrollArea className="h-96">
              {loadingImages ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <div className="text-sm text-muted-foreground">Loading images...</div>
                  </div>
                </div>
              ) : filteredImages.length > 0 ? (
                <div className="space-y-3">
                  {filteredImages.map((image) => (
                    <Card 
                      key={image.id} 
                      className={`cursor-pointer transition-colors hover:border-primary/50 ${
                        selectedImage?.id === image.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedImage(image)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <Camera className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{image.type}</span>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getImageTypeColor(image.type)}`}
                              >
                                {image.type}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {image.date}
                            </div>
                            {image.caption && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {image.caption}
                              </div>
                            )}
                          </div>
                          {selectedImage?.id === image.id && (
                            <div className="text-primary">
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8">
                  <div className="text-center space-y-3">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h4 className="font-medium">No Available Images</h4>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm 
                          ? "No images match your search criteria."
                          : `No unlinked clinical images found for ${patientName}.`
                        }
                      </p>
                    </div>
                    {onNavigateToUploadImages && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          onNavigateToUploadImages();
                          onOpenChange(false);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Images
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              Select an image above to link it to {toothName}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleLinkImage}
                disabled={!selectedImage || loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Linking...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
