
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { getCollection } from '@/services/firestore';
import { Patient } from '@/app/patients/page';
import { clinicalImagesStorage } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';

const imageSchema = z.object({
  patient: z.string({ required_error: 'Patient is required.' }),
  type: z.string({ required_error: 'Image type is required.' }),
  file: z.any()
    .refine((files) => files?.length === 1, 'Image is required.')
    .refine((files) => files?.[0]?.size <= 10 * 1024 * 1024, 'File size must be less than 10MB.')
    .refine((files) => {
      const file = files?.[0];
      return file && ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
    }, 'File must be a valid image (JPEG, PNG, GIF, or WebP).'),
  caption: z.string().optional(),
});

type ImageFormData = z.infer<typeof imageSchema>;

const clinicalImageTypes = ['X-Ray', 'Intraoral Photo', 'Scan', 'Other'];

interface UploadImageDialogProps {
  onUpload: (data: any) => void;
}

export function UploadImageDialog({ onUpload }: UploadImageDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<ImageFormData>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      patient: '',
      type: '',
      file: undefined,
      caption: '',
    },
  });
  
  React.useEffect(() => {
    async function fetchPatients() {
        const data = await getCollection<Patient>('patients');
        setPatients(data);
    }
    if (open) {
        fetchPatients();
    }
  }, [open]);

  const onSubmit = async (data: ImageFormData) => {
    setUploading(true);
    console.log('Starting upload process...', { 
      fileName: data.file[0]?.name,
      fileSize: data.file[0]?.size,
      fileType: data.file[0]?.type 
    });
    
    try {
      const selectedPatient = patients.find(p => p.id === data.patient);
      if (!selectedPatient) {
        throw new Error('Patient not found');
      }

      console.log('Patient found:', selectedPatient.name);
      console.log('Attempting to upload to Firebase Storage...');

      // Upload image to Firebase Storage
      const imageUrl = await clinicalImagesStorage.uploadClinicalImage(
        data.file[0],
        data.patient,
        data.type
      );

      console.log('Upload successful, URL:', imageUrl);

      // Pass the data with the uploaded image URL to parent component
      onUpload({
        ...data,
        file: data.file[0],
        patientName: selectedPatient.name,
        imageUrl: imageUrl
      });

      form.reset();
      setOpen(false);
      
      toast({
        title: "Image Uploaded Successfully",
        description: `Clinical image for ${selectedPatient.name} has been uploaded to storage.`,
      });
    } catch (error) {
      console.error('Upload error details:', error);
      
      let errorMessage = "Failed to upload image. Please try again.";
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized')) {
          errorMessage = "Upload failed: Storage permissions denied. Please check Firebase Storage rules.";
        } else if (error.message.includes('storage/invalid-format')) {
          errorMessage = "Upload failed: Invalid image format. Please use JPG, PNG, or GIF.";
        } else if (error.message.includes('storage/object-not-found')) {
          errorMessage = "Upload failed: Storage configuration error.";
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upload Clinical Image</DialogTitle>
          <DialogDescription>
            Select a patient and upload a new clinical image like an X-ray or photo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
            <FormField
              control={form.control}
              name="patient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select image type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clinicalImageTypes.map((type) => (
                        <SelectItem key={type.toLowerCase()} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image File *</FormLabel>
                   <FormControl>
                    <Input type="file" accept="image/*" {...form.register("file")} />
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
                    <Input placeholder="e.g., Upper right molar X-ray" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
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
