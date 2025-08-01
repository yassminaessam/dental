
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
import { Upload } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { getCollection } from '@/services/firestore';
import { Patient } from '@/app/patients/page';

const imageSchema = z.object({
  patient: z.string({ required_error: 'Patient is required.' }),
  type: z.string({ required_error: 'Image type is required.' }),
  file: z.any().refine((files) => files?.length === 1, 'Image is required.'),
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

  const form = useForm<ImageFormData>({
    resolver: zodResolver(imageSchema),
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

  const onSubmit = (data: ImageFormData) => {
    const patientName = patients.find(p => p.id === data.patient)?.name;
    onUpload({ ...data, file: data.file[0], patientName });
    form.reset();
    setOpen(false);
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Upload</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
