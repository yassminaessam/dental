'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Image as ImageIcon, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PatientRecordsPage() {
  const { t } = useLanguage();
  const records = [
    {
      id: 1,
      type: 'Treatment Plan',
      title: 'Root Canal Treatment',
      date: '2025-01-10',
      doctor: 'Dr. Smith',
      status: 'Active'
    },
    {
      id: 2,
      type: 'X-Ray',
      title: 'Dental X-Ray - Full Mouth',
      date: '2025-01-05',
      doctor: 'Dr. Johnson',
      status: 'Complete'
    },
    {
      id: 3,
      type: 'Clinical Note',
      title: 'Regular Checkup Notes',
      date: '2024-12-20',
      doctor: 'Dr. Smith',
      status: 'Complete'
    },
    {
      id: 4,
      type: 'Lab Result',
      title: 'Oral Pathology Test',
      date: '2024-12-15',
      doctor: 'Dr. Johnson',
      status: 'Complete'
    }
  ];

  const images = [
    {
      id: 1,
      title: 'X-Ray - Upper Jaw',
      date: '2025-01-05',
      type: 'Radiograph'
    },
    {
      id: 2,
      title: 'Intraoral Photo',
      date: '2025-01-05',
      type: 'Photo'
    },
    {
      id: 3,
      title: 'X-Ray - Lower Jaw',
      date: '2024-12-20',
      type: 'Radiograph'
    }
  ];

  return (
    <PatientOnly>
      <PatientLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('patient_pages.records.title')}</h1>
            <p className="text-gray-600">{t('patient_pages.records.subtitle')}</p>
          </div>

          {/* Medical Records */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t('patient_pages.records.documents')}</h2>
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
                          onClick={() => {
                            // Open in new tab (simulated)
                            alert(`Viewing record: ${record.title}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t('patient_pages.records.view')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Trigger download (simulated)
                            alert(`Downloading: ${record.title}`);
                          }}
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
          </section>

          {/* Clinical Images */}
          <section>
            <h2 className="text-xl font-semibold mb-4">{t('patient_pages.records.clinical_images')}</h2>
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
                      onClick={() => {
                        // Open image viewer (simulated)
                        alert(`Viewing image: ${image.title}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('patient_pages.records.view_image')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </PatientLayout>
    </PatientOnly>
  );
}
