
'use client';

import React from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Search, User, Download, Image as ImageIcon, Eye, Pencil, Loader2 } from "lucide-react";
import { UploadImageDialog } from "@/components/medical-records/upload-image-dialog";
import { NewRecordDialog } from "@/components/medical-records/new-record-dialog";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ViewRecordDialog } from '@/components/medical-records/view-record-dialog';
import { EditRecordDialog } from '@/components/medical-records/edit-record-dialog';
import { getCollection, setDocument, updateDocument } from '@/services/firestore';

export type MedicalRecord = {
  id: string;
  patient: string;
  type: string;
  complaint: string;
  provider: string;
  date: string;
  status: 'Final' | 'Draft';
};

export type MedicalRecordTemplate = {
  id: string;
  name: string;
  type: string;
  content: string;
};

export type ClinicalImage = {
  id: string;
  patient: string;
  type: string;
  date: string;
  imageUrl: string;
  caption?: string;
};

const medicalRecordTypes = ['SOAP', 'Clinical Note', 'Treatment Plan', 'Consultation'];

export default function MedicalRecordsPage() {
  const [records, setRecords] = React.useState<MedicalRecord[]>([]);
  const [images, setImages] = React.useState<ClinicalImage[]>([]);
  const [templates, setTemplates] = React.useState<MedicalRecordTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [recordSearchTerm, setRecordSearchTerm] = React.useState('');
  const [recordTypeFilter, setRecordTypeFilter] = React.useState('all');
  
  const [imageSearchTerm, setImageSearchTerm] = React.useState('');
  const [templateSearchTerm, setTemplateSearchTerm] = React.useState('');

  const [recordToView, setRecordToView] = React.useState<MedicalRecord | null>(null);
  const [recordToEdit, setRecordToEdit] = React.useState<MedicalRecord | null>(null);
  const { toast } = useToast();
  
  React.useEffect(() => {
    async function fetchData() {
        try {
            const [recordsData, imagesData, templatesData] = await Promise.all([
                getCollection<MedicalRecord>('medical-records'),
                getCollection<ClinicalImage>('clinical-images'),
                getCollection<MedicalRecordTemplate>('templates'),
            ]);
            setRecords(recordsData);
            setImages(imagesData);
            setTemplates(templatesData);
        } catch (e) {
            toast({ title: 'Error fetching data', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [toast]);

  const medicalRecordsPageStats = React.useMemo(() => {
    const draftRecords = records.filter(r => r.status === 'Draft').length;
    return [
      { title: "Total Records", value: records.length, description: "All patient records" },
      { title: "Clinical Images", value: images.length, description: "All uploaded images" },
      { title: "Templates Available", value: templates.length, description: "For faster documentation" },
      { title: "Draft Records", value: draftRecords, description: "Awaiting finalization", valueClassName: "text-orange-500" },
    ];
  }, [records, images, templates]);

  const handleSaveRecord = async (data: Omit<MedicalRecord, 'id' | 'status'>) => {
    try {
      const newRecord: MedicalRecord = {
        id: `MR-${Date.now()}`,
        ...data,
        status: 'Final',
      };
      await setDocument('medical-records', newRecord.id, newRecord);
      setRecords(prev => [newRecord, ...prev]);
      toast({
        title: "Medical Record Created",
        description: `New record for ${newRecord.patient} has been created.`,
      });
    } catch(e) {
      toast({ title: 'Error creating record', variant: 'destructive' });
    }
  };

  const handleUpdateRecord = async (updatedRecord: MedicalRecord) => {
    try {
      await updateDocument('medical-records', updatedRecord.id, updatedRecord);
      setRecords(prev => prev.map(rec => rec.id === updatedRecord.id ? updatedRecord : rec));
      setRecordToEdit(null);
      toast({
        title: "Medical Record Updated",
        description: `Record ${updatedRecord.id} has been updated.`,
      });
    } catch(e) {
      toast({ title: 'Error updating record', variant: 'destructive' });
    }
  };

  const handleImageUpload = async (data: any) => {
     try {
      const newImage: ClinicalImage = {
        id: `IMG-${Date.now()}`,
        patient: data.patientName,
        type: data.type,
        date: new Date().toLocaleDateString(),
        imageUrl: URL.createObjectURL(data.file), // Note: This is a temporary client-side URL
        caption: data.caption
      };
      // In a real app, you would upload the file to a storage service (like Firebase Storage)
      // and save the permanent URL. For this demo, we'll just add it to the state.
      // await setDocument('clinical-images', newImage.id, { ...newImage, imageUrl: 'PERMANENT_URL' });
      setImages(prev => [newImage, ...prev]);
      toast({
        title: "Image Uploaded",
        description: `A new ${data.type} image for ${data.patientName} has been uploaded.`,
      });
     } catch(e) {
        toast({ title: 'Error uploading image', variant: 'destructive' });
     }
  };
  
  const handleDownloadRecord = (recordId: string) => {
    toast({
      title: "Downloading Record",
      description: `Record ${recordId} is being prepared for download.`
    });
  };

  const filteredRecords = React.useMemo(() => {
    return records
      .filter(record => 
        record.patient.toLowerCase().includes(recordSearchTerm.toLowerCase()) ||
        record.complaint.toLowerCase().includes(recordSearchTerm.toLowerCase())
      )
      .filter(record => 
        recordTypeFilter === 'all' || record.type === recordTypeFilter
      );
  }, [records, recordSearchTerm, recordTypeFilter]);

  const filteredImages = React.useMemo(() => {
    return images.filter(image => 
      image.patient.toLowerCase().includes(imageSearchTerm.toLowerCase()) ||
      image.caption?.toLowerCase().includes(imageSearchTerm.toLowerCase())
    );
  }, [images, imageSearchTerm]);
  
  const filteredTemplates = React.useMemo(() => {
    return templates.filter(template =>
      template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(templateSearchTerm.toLowerCase())
    );
  }, [templates, templateSearchTerm]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <div className="flex items-center gap-2">
            <UploadImageDialog onUpload={handleImageUpload} />
            <NewRecordDialog onSave={handleSaveRecord} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {medicalRecordsPageStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", stat.valueClassName)}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Tabs defaultValue="medical-records">
          <TabsList>
            <TabsTrigger value="medical-records">Medical Records</TabsTrigger>
            <TabsTrigger value="clinical-images">Clinical Images</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="medical-records" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Patient Medical Records</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search records..."
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                      value={recordSearchTerm}
                      onChange={(e) => setRecordSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={recordTypeFilter} onValueChange={setRecordTypeFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {medicalRecordTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Record ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Chief Complaint</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={8} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{record.patient}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.type === 'SOAP' ? 'default' : 'secondary'}>{record.type}</Badge>
                          </TableCell>
                          <TableCell>{record.complaint}</TableCell>
                          <TableCell>{record.provider}</TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setRecordToView(record)}>
                                <Eye className="mr-2 h-3 w-3" /> View
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setRecordToEdit(record)}>
                                <Pencil className="mr-2 h-3 w-3" /> Edit
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDownloadRecord(record.id)}>
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No medical records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="clinical-images" className="mt-4">
             <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle>Clinical Images</CardTitle>
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                            type="search"
                            placeholder="Search images..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[250px] lg:w-[336px]"
                            value={imageSearchTerm}
                            onChange={(e) => setImageSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                      <div className="h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : filteredImages.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredImages.map((image) => (
                        <Card key={image.id} className="overflow-hidden">
                            <CardHeader className="p-0">
                            <div className="relative aspect-video">
                                <Image
                                src={image.imageUrl}
                                alt={image.caption || `Clinical image for ${image.patient}`}
                                fill
                                className="object-cover"
                                />
                            </div>
                            </CardHeader>
                            <CardContent className="p-4">
                            <CardTitle className="text-base">{image.caption || image.type}</CardTitle>
                            <CardDescription>{image.patient}</CardDescription>
                            </CardContent>
                            <CardFooter className="flex justify-between p-4 pt-0">
                                <Badge variant="secondary">{image.type}</Badge>
                                <span className="text-xs text-muted-foreground">{image.date}</span>
                            </CardFooter>
                        </Card>
                        ))}
                    </div>
                    ) : (
                    <div className="h-48 text-center text-muted-foreground flex flex-col items-center justify-center p-6 gap-4">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                        <span>No clinical images found.</span>
                    </div>
                    )}
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="templates" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle>Record Templates</CardTitle>
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                            type="search"
                            placeholder="Search templates..."
                            className="w-full rounded-lg bg-background pl-8 md:w-[250px] lg:w-[336px]"
                            value={templateSearchTerm}
                            onChange={(e) => setTemplateSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                {loading ? (
                  <div className="h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : filteredTemplates.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTemplates.map((template) => (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{template.name}</span>
                            <Badge variant="outline">{template.type}</Badge>
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                            {template.content}
                        </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                            Use Template
                        </Button>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
                ) : (
                <div className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    <p>No templates found.</p>
                </div>
                )}
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ViewRecordDialog 
        record={recordToView}
        open={!!recordToView}
        onOpenChange={(isOpen) => !isOpen && setRecordToView(null)}
      />

      {recordToEdit && (
        <EditRecordDialog
          record={recordToEdit}
          onSave={handleUpdateRecord}
          open={!!recordToEdit}
          onOpenChange={(isOpen) => !isOpen && setRecordToEdit(null)}
        />
      )}

    </DashboardLayout>
  );
}
