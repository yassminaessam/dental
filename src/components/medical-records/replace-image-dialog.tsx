'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Upload, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { clinicalImagesStorage } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';
import { ClinicalImage } from '@/app/medical-records/page';

const replaceImageSchema = z.object({
  file: z.any().refine((files) => files?.length === 1, 'New image file is required.'),
  caption: z.string().optional(),
});

type ReplaceImageFormData = z.infer<typeof replaceImageSchema>;

interface ReplaceImageDialogProps {
  image: ClinicalImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplace: (imageId: string, newImageUrl: string, caption?: string) => void;
}

export function ReplaceImageDialog({ 
  image, 
  open, 
  onOpenChange, 
  onReplace 
}: ReplaceImageDialogProps) {
  const [replacing, setReplacing] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<ReplaceImageFormData>({
    resolver: zodResolver(replaceImageSchema),
    defaultValues: {
      file: undefined,
      caption: image?.caption || '',
    },
  });

  React.useEffect(() => {
    if (image) {
      form.setValue('caption', image.caption || '');
    }
  }, [image, form]);

  const onSubmit = async (data: ReplaceImageFormData) => {
    if (!image) return;
    
    setReplacing(true);
    try {
      let newImageUrl: string;
      
      // Check if the current image is from Firebase Storage
      if (image.imageUrl.includes('firebasestorage.googleapis.com') || image.imageUrl.includes('storage.googleapis.com')) {
        // Replace image in Firebase Storage
        newImageUrl = await clinicalImagesStorage.replaceClinicalImage(
          image.imageUrl,
          data.file[0],
          image.id.split('_')[0], // Extract patient ID from image ID
          image.type
        );
      } else {
        // If it's an external URL (like Unsplash), just upload new image
        const patientId = image.patient.replace(/\s+/g, '_').toLowerCase(); // Convert patient name to ID-like format
        newImageUrl = await clinicalImagesStorage.uploadClinicalImage(
          data.file[0],
          patientId,
          image.type
        );
      }

      // Update the image record
      onReplace(image.id, newImageUrl, data.caption);

      form.reset();
      onOpenChange(false);
      
      toast({
        title: "Image Replaced Successfully",
        description: `The ${image.type} image for ${image.patient} has been replaced.`,
      });
    } catch (error) {
      console.error('Replace error:', error);
      toast({
        title: "Replace Failed",
        description: "Failed to replace image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReplacing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Replace Clinical Image</DialogTitle>
          <DialogDescription>
            {image && `Replace the ${image.type} image for ${image.patient}. The old image will be permanently deleted.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Current Image:</strong> {image?.caption || 'No caption'}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Date:</strong> {image?.date}
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Image File *</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      {...form.register("file")}
                      disabled={replacing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Updated X-ray of tooth #14" 
                      {...field} 
                      disabled={replacing}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={replacing}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={replacing}>
                {replacing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Replacing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Replace Image
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
