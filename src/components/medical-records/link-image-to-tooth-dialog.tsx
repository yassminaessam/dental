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
import { Search, Link as LinkIcon, X } from "lucide-react";
import { ClinicalImage } from '@/app/medical-records/page';
import { DentalIntegrationService } from '@/services/dental-integration';
import { useToast } from '@/hooks/use-toast';
import { toothNames } from '@/lib/data/dental-chart-data';

interface LinkImageToToothDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: ClinicalImage | null;
  onSuccess?: () => void;
}

// Valid tooth numbers in dental chart
const validToothNumbers = [
  11, 12, 13, 14, 15, 16, 17, 18,
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48
];

export function LinkImageToToothDialog({ 
  open, 
  onOpenChange, 
  image, 
  onSuccess 
}: LinkImageToToothDialogProps) {
  const [toothNumber, setToothNumber] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTooth, setSelectedTooth] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const filteredTeeth = React.useMemo(() => {
    if (!searchTerm) return validToothNumbers;
    
    return validToothNumbers.filter(num => {
      const toothName = toothNames[num] || '';
      return num.toString().includes(searchTerm) || 
             toothName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm]);

  const handleToothSelect = (toothNum: number) => {
    setSelectedTooth(toothNum);
    setToothNumber(toothNum.toString());
  };

  const handleSubmit = async () => {
    if (!image || !selectedTooth) {
      toast({
        title: "Missing Information",
        description: "Please select a tooth number to link the image.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Link the image to the tooth
      await DentalIntegrationService.linkImageToTooth(
        image.id,
        selectedTooth,
        image.patient,
        image.type
      );

      // Create a medical record for this image link
      await DentalIntegrationService.createImageRecord(
        image.patient,
        image,
        selectedTooth
      );

      toast({
        title: "Image Linked Successfully",
        description: `Clinical image linked to tooth #${selectedTooth} and medical record created.`,
      });

      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error linking image to tooth:', error);
      toast({
        title: "Error",
        description: "Failed to link image to tooth. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setToothNumber('');
    setSearchTerm('');
    setSelectedTooth(null);
  };

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Link Image to Tooth
          </DialogTitle>
          <DialogDescription>
            Link this clinical image to a specific tooth for better organization and treatment tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{image.type}</h4>
                <Badge variant="secondary">{image.patient}</Badge>
                <Badge variant="outline">{image.date}</Badge>
              </div>
              {image.caption && (
                <p className="text-sm text-muted-foreground mt-1">{image.caption}</p>
              )}
            </div>
          </div>

          {/* Tooth Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="tooth-search">Search for Tooth</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tooth-search"
                  placeholder="Search by tooth number or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label>Select Tooth Number</Label>
              <div className="grid grid-cols-8 gap-2 mt-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                {filteredTeeth.map(num => (
                  <Button
                    key={num}
                    variant={selectedTooth === num ? "default" : "outline"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleToothSelect(num)}
                  >
                    {num}
                  </Button>
                ))}
              </div>
              {filteredTeeth.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No teeth found matching your search.
                </p>
              )}
            </div>

            {selectedTooth && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Selected: Tooth #{selectedTooth}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTooth(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {toothNames[selectedTooth] || 'Unknown tooth'}
                </p>
              </div>
            )}
          </div>

          {/* Manual Input */}
          <div>
            <Label htmlFor="tooth-number">Or Enter Tooth Number Manually</Label>
            <Input
              id="tooth-number"
              type="number"
              placeholder="Enter tooth number (11-48)"
              value={toothNumber}
              onChange={(e) => {
                setToothNumber(e.target.value);
                const num = parseInt(e.target.value);
                if (validToothNumbers.includes(num)) {
                  setSelectedTooth(num);
                } else {
                  setSelectedTooth(null);
                }
              }}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedTooth || loading}
              className="flex-1"
            >
              {loading ? "Linking..." : "Link to Tooth"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
