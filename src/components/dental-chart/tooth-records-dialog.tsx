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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, User, ExternalLink, Plus, AlertCircle } from "lucide-react";
import { MedicalRecord } from '@/app/medical-records/page';
import { toothNames } from '@/lib/data/dental-chart-data';
import { useLanguage } from '@/contexts/LanguageContext';

interface ToothRecordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toothNumber: number;
  patientName: string;
  records: MedicalRecord[];
  onViewFullRecord?: (record: MedicalRecord) => void;
  onCreateNewRecord?: () => void;
  onNavigateToMedicalRecords?: () => void;
}

export function ToothRecordsDialog({
  open,
  onOpenChange,
  toothNumber,
  patientName,
  records,
  onViewFullRecord,
  onCreateNewRecord,
  onNavigateToMedicalRecords
}: ToothRecordsDialogProps) {
  const { t } = useLanguage();
  const toothName = toothNames[toothNumber] || t('dental_chart.tooth_number_display', { id: toothNumber });

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'SOAP': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Clinical Note': return 'bg-green-100 text-green-700 border-green-200';
      case 'Treatment Plan': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Consultation': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('dental_chart.medical_records')} {t('common.for') ? t('common.for') : ''} {toothName}
          </DialogTitle>
          <DialogDescription>
            {t('dental_chart.full_history_for_tooth', { id: toothNumber })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{records.length}</div>
                <div className="text-xs text-muted-foreground">{t('dental_chart.records_tab')}</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {records.filter(r => r.type === 'Treatment Plan').length}
                </div>
                <div className="text-xs text-muted-foreground">{t('treatmentPlan')}</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {records.filter(r => r.type === 'SOAP').length}
                </div>
                <div className="text-xs text-muted-foreground">SOAP</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {records.filter(r => r.type === 'Consultation').length}
                </div>
                <div className="text-xs text-muted-foreground">{t('consultation')}</div>
              </div>
            </Card>
          </div>

          {/* Records List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
      <h4 className="font-medium">{t('dental_chart.records_tab')} ({records.length})</h4>
              <div className="flex gap-2">
                {onCreateNewRecord && (
                  <Button variant="outline" size="sm" onClick={onCreateNewRecord}>
                    <Plus className="h-4 w-4 mr-1" />
        {t('newRecord')}
                  </Button>
                )}
                {onNavigateToMedicalRecords && (
                  <Button variant="outline" size="sm" onClick={onNavigateToMedicalRecords}>
                    <ExternalLink className="h-4 w-4 mr-1" />
        {t('dental_chart.medical_records')}
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="h-96">
              {records.length > 0 ? (
                <div className="space-y-3">
                  {records.map((record) => (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {record.type}
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getRecordTypeColor(record.type)}`}
                              >
                                {record.type}
                              </Badge>
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {record.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {record.provider}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {record.patient}
                              </Badge>
                            </div>
                          </div>
                          {onViewFullRecord && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewFullRecord(record)}
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {record.complaint && (
                            <div>
                              <h6 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('chiefComplaint')}</h6>
                              <p className="text-sm">{record.complaint}</p>
                            </div>
                          )}
                          
                          <div>
                            <h6 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('chiefComplaint')}</h6>
                            <p className="text-sm line-clamp-3">{record.complaint}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <Badge 
                              variant="outline" 
                              className={
                                record.status === 'Final' ? 'text-green-700 border-green-200' :
                                record.status === 'Draft' ? 'text-blue-700 border-blue-200' :
                                'text-gray-700 border-gray-200'
                              }
                            >
                              {record.status}
                            </Badge>
                            {onViewFullRecord && (
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => onViewFullRecord(record)}
                                className="h-auto p-0 text-xs"
                              >
                                {t('table.view_details')} →
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8">
                  <div className="text-center space-y-3">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h4 className="font-medium">{t('dental_chart.no_medical_records')}</h4>
                      <p className="text-sm text-muted-foreground">{t('dental_chart.no_medical_records')}</p>
                    </div>
                    {onCreateNewRecord && (
                      <Button variant="outline" onClick={onCreateNewRecord}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('newRecord')}
                      </Button>
                    )}
                  </div>
                </Card>
              )}
            </ScrollArea>
          </div>

          {/* Quick Actions */}
          <Separator />
          <div className="flex justify-between items-center pt-2">
      <div className="text-sm text-muted-foreground">{t('dental_chart.integration_warning')}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
        {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
