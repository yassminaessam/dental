
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
import { medicalRecordsPageStats, initialMedicalRecordsData, medicalRecordTypes } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Search, User, Download, Image as ImageIcon } from "lucide-react";
import { UploadImageDialog } from "@/components/medical-records/upload-image-dialog";
import { NewRecordDialog } from "@/components/medical-records/new-record-dialog";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export type MedicalRecord = {
  id: string;
  patient: string;
  type: string;
  complaint: string;
  provider: string;
  date: string;
  status: 'Final' | 'Draft';
};

export type ClinicalImage = {
  id: string;
  patient: string;
  type: string;
  date: string;
  imageUrl: string;
  caption?: string;
};

export default function MedicalRecordsPage() {
  const [records, setRecords] = React.useState<MedicalRecord[]>(initialMedicalRecordsData);
  const [images, setImages] = React.useState<ClinicalImage[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const { toast } = useToast();

  const handleSaveRecord = (data: Omit<MedicalRecord, 'id' | 'status'>) => {
    const newRecord: MedicalRecord = {
      id: `MR-${Math.floor(100 + Math.random() * 900).toString().padStart(3, '0')}`,
      ...data,
      date: new Date(data.date).toLocaleDateString(),
      status: 'Final',
    };
    setRecords(prev => [newRecord, ...prev]);
    toast({
      title: "Medical Record Created",
      description: `New record for ${newRecord.patient} has been created.`,
    });
  };

  const handleImageUpload = (data: any) => {
    const newImage: ClinicalImage = {
      id: `IMG-${Math.floor(100 + Math.random() * 900).toString().padStart(3, '0')}`,
      patient: data.patientName,
      type: data.type,
      date: new Date().toLocaleDateString(),
      imageUrl: URL.createObjectURL(data.file),
      caption: data.caption
    };
    setImages(prev => [newImage, ...prev]);
    toast({
      title: "Image Uploaded",
      description: `A new ${data.type} image for ${data.patientName} has been uploaded.`,
    });
  };
  
  const filteredRecords = React.useMemo(() => {
    return records
      .filter(record => 
        record.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.complaint.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(record => 
        typeFilter === 'all' || record.type === typeFilter
      );
  }, [records, searchTerm, typeFilter]);

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
          <TabsContent value="medical-records">
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
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
                    {filteredRecords.length > 0 ? (
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
                              <Button variant="ghost" size="sm">View</Button>
                              <Button variant="ghost" size="sm">Edit</Button>
                              <Button variant="ghost" size="icon">
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
             {images.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {images.map((image) => (
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
               <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex flex-col items-center justify-center p-6 gap-4">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                    <span>No clinical images found. Upload one to get started.</span>
                </CardContent>
               </Card>
            )}
          </TabsContent>
          <TabsContent value="templates">
            <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    No templates found.
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
