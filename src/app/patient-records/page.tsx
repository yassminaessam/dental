'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Image as ImageIcon, Calendar, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

function PatientRecordsContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = React.useState<any[]>([]);
  const [images, setImages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (user?.email) {
      fetchRecordsAndImages();
    }
  }, [user]);

  const fetchRecordsAndImages = async () => {
    if (!user?.email) return;

    try {
      const recordsResponse = await fetch(
        `/api/patient/medical-records?email=${encodeURIComponent(user.email)}`
      );
      
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json();
        setRecords(recordsData.records || []);
      }

      const imagesResponse = await fetch(
        `/api/patient/images?email=${encodeURIComponent(user.email)}`
      );
      
      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        setImages(imagesData.images || []);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: 'Error',
        description: 'Failed to load medical records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('patient_pages.records.title')}</h1>
        <p className="text-gray-600">{t('patient_pages.records.subtitle')}</p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('patient_pages.records.documents')}</h2>
        {records.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No medical records found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {records.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        {record.title}
                      </CardTitle>
                      <CardDescription>
                        {record.type} • {record.doctor}
                      </CardDescription>
                    </div>
                    <Badge variant={record.status === 'Active' ? 'default' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => alert(`Viewing record: ${record.title}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('patient_pages.records.view')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => alert(`Downloading: ${record.title}`)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {t('patient_pages.records.download')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">{t('patient_pages.records.clinical_images')}</h2>
        {images.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No medical images found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id}>
                <CardHeader>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardTitle className="text-base">{image.title}</CardTitle>
                  <CardDescription>{image.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {new Date(image.date).toLocaleDateString()}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => alert(`Viewing image: ${image.title}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t('patient_pages.records.view_image')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function PatientRecordsPage() {
  return (
    <PatientOnly>
      <PatientLayout>
        <PatientRecordsContent />
      </PatientLayout>
    </PatientOnly>
  );
}
