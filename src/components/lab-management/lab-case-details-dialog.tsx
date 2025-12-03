'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { formatEGP } from '@/lib/currency';
import {
  Clock,
  Calendar,
  User,
  Stethoscope,
  Building2,
  FileText,
  Send,
  Paperclip,
  Download,
  Trash2,
  Plus,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { LabCase, LabCaseStatus, LabCaseUpdate, LabCaseAttachment } from '@/services/lab-management';

const statusColors: Record<LabCaseStatus, string> = {
  Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  Submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  InProgress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  QualityCheck: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface LabCaseDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labCase: LabCase;
  onStatusUpdate: (caseId: string, status: LabCaseStatus, message?: string) => void;
  onRefresh: () => void;
}

export function LabCaseDetailsDialog({ open, onOpenChange, labCase, onStatusUpdate, onRefresh }: LabCaseDetailsDialogProps) {
  const { t, language, isRTL } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const { toast } = useToast();
  const [newStatus, setNewStatus] = React.useState<LabCaseStatus>(labCase.status);
  const [statusMessage, setStatusMessage] = React.useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const [isUploadingFile, setIsUploadingFile] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getStatusLabel = (status: LabCaseStatus) => {
    const statusLabels: Record<LabCaseStatus, string> = {
      Draft: t('lab.status.draft'),
      Submitted: t('lab.status.submitted'),
      InProgress: t('lab.status.in_progress'),
      QualityCheck: t('lab.status.quality_check'),
      Completed: t('lab.status.completed'),
      Delivered: t('lab.status.delivered'),
      Cancelled: t('lab.status.cancelled'),
    };
    return statusLabels[status];
  };

  const handleStatusUpdate = async () => {
    if (newStatus === labCase.status && !statusMessage) return;
    setIsUpdatingStatus(true);
    try {
      await onStatusUpdate(labCase.id, newStatus, statusMessage || undefined);
      setStatusMessage('');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingFile(true);
    try {
      // In a real app, you would upload to a file storage service
      // For now, we'll create a mock URL
      const file = files[0];
      const mockUrl = URL.createObjectURL(file);
      
      const response = await fetch(`/api/lab/cases/${labCase.id}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileUrl: mockUrl,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!response.ok) throw new Error('Failed to upload file');
      
      toast({
        title: t('lab.toast.file_uploaded'),
        description: t('lab.toast.file_uploaded_desc'),
      });
      onRefresh();
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: t('lab.toast.error_uploading'),
        variant: 'destructive',
      });
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const response = await fetch(`/api/lab/cases/${labCase.id}/attachments/${attachmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete attachment');
      toast({
        title: t('lab.toast.file_deleted'),
        description: t('lab.toast.file_deleted_desc'),
      });
      onRefresh();
    } catch (error) {
      console.error('Delete attachment error:', error);
      toast({
        title: t('lab.toast.error_deleting'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('lab.case_details')} - {labCase.caseNumber}</span>
            <Badge className={statusColors[labCase.status]}>
              {getStatusLabel(labCase.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">{t('lab.details')}</TabsTrigger>
            <TabsTrigger value="updates">{t('lab.updates')}</TabsTrigger>
            <TabsTrigger value="attachments">{t('lab.attachments')}</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Patient Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{t('lab.patient')}</span>
                </div>
                <p className="font-medium">{labCase.patientName}</p>
              </div>

              {/* Doctor Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{t('lab.doctor')}</span>
                </div>
                <p className="font-medium">{labCase.doctorName}</p>
              </div>

              {/* Lab Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{t('lab.lab')}</span>
                </div>
                <p className="font-medium">{labCase.labName || t('lab.not_assigned')}</p>
              </div>

              {/* Case Type */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{t('lab.case_type')}</span>
                </div>
                <p className="font-medium">{labCase.caseType}</p>
                {labCase.toothNumbers && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('lab.teeth')}: {labCase.toothNumbers}
                  </p>
                )}
              </div>
            </div>

            {/* Material & Shade */}
            {(labCase.material || labCase.shade) && (
              <div className="grid grid-cols-2 gap-4">
                {labCase.material && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">{t('lab.material')}</span>
                    <p className="font-medium">{labCase.material}</p>
                  </div>
                )}
                {labCase.shade && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">{t('lab.shade')}</span>
                    <p className="font-medium">{labCase.shade}</p>
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <span className="text-xs font-medium text-muted-foreground">{t('lab.request_date')}</span>
                <p className="text-sm font-medium">
                  {new Date(labCase.requestDate).toLocaleDateString(locale)}
                </p>
              </div>
              {labCase.dueDate && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs font-medium text-muted-foreground">{t('lab.due_date')}</span>
                  <p className={cn(
                    "text-sm font-medium",
                    new Date(labCase.dueDate) < new Date() && labCase.status !== 'Completed' && labCase.status !== 'Delivered'
                      ? 'text-red-500'
                      : ''
                  )}>
                    {new Date(labCase.dueDate).toLocaleDateString(locale)}
                  </p>
                </div>
              )}
              {labCase.sentToLabDate && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs font-medium text-muted-foreground">{t('lab.sent_to_lab')}</span>
                  <p className="text-sm font-medium">
                    {new Date(labCase.sentToLabDate).toLocaleDateString(locale)}
                  </p>
                </div>
              )}
              {labCase.deliveredDate && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs font-medium text-muted-foreground">{t('lab.delivered_date')}</span>
                  <p className="text-sm font-medium">
                    {new Date(labCase.deliveredDate).toLocaleDateString(locale)}
                  </p>
                </div>
              )}
            </div>

            {/* Costs */}
            <div className="grid grid-cols-2 gap-4">
              {labCase.estimatedCost && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">{t('lab.estimated_cost')}</span>
                  <p className="text-lg font-bold">{formatEGP(labCase.estimatedCost, true, language)}</p>
                </div>
              )}
              {labCase.actualCost && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">{t('lab.actual_cost')}</span>
                  <p className="text-lg font-bold">{formatEGP(labCase.actualCost, true, language)}</p>
                </div>
              )}
            </div>

            {/* Description & Instructions */}
            {labCase.description && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">{t('lab.description')}</span>
                <p className="mt-1">{labCase.description}</p>
              </div>
            )}
            {labCase.instructions && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">{t('lab.instructions')}</span>
                <p className="mt-1">{labCase.instructions}</p>
              </div>
            )}

            {/* Status Update Section */}
            <div className="p-4 border rounded-lg space-y-4">
              <h4 className="font-medium">{t('lab.update_status')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('common.status')}</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as LabCaseStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">{t('lab.status.draft')}</SelectItem>
                      <SelectItem value="Submitted">{t('lab.status.submitted')}</SelectItem>
                      <SelectItem value="InProgress">{t('lab.status.in_progress')}</SelectItem>
                      <SelectItem value="QualityCheck">{t('lab.status.quality_check')}</SelectItem>
                      <SelectItem value="Completed">{t('lab.status.completed')}</SelectItem>
                      <SelectItem value="Delivered">{t('lab.status.delivered')}</SelectItem>
                      <SelectItem value="Cancelled">{t('lab.status.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{t('lab.status_message')}</Label>
                <Textarea
                  placeholder={t('lab.status_message_placeholder')}
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                />
              </div>
              <Button onClick={handleStatusUpdate} disabled={isUpdatingStatus}>
                {isUpdatingStatus && <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? 'ml-2' : 'mr-2')} />}
                <Send className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                {t('lab.update_status')}
              </Button>
            </div>
          </TabsContent>

          {/* Updates Tab */}
          <TabsContent value="updates" className="space-y-4">
            {labCase.updates && labCase.updates.length > 0 ? (
              <div className="space-y-3">
                {labCase.updates.map((update: LabCaseUpdate) => (
                  <div key={update.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={statusColors[update.status]}>
                        {getStatusLabel(update.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.createdAt).toLocaleString(locale)}
                      </span>
                    </div>
                    {update.message && (
                      <p className="text-sm mt-2">{update.message}</p>
                    )}
                    {update.updatedBy && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('lab.updated_by')}: {update.updatedBy}
                      </p>
                    )}
                    {update.isSharedWithLab && (
                      <Badge variant="outline" className="mt-2">
                        {t('lab.shared_with_lab')}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('lab.no_updates')}</p>
              </div>
            )}
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.stl,.obj"
                aria-label="Upload attachment"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile}
              >
                {isUploadingFile ? (
                  <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? 'ml-2' : 'mr-2')} />
                ) : (
                  <Plus className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                )}
                {t('lab.add_attachment')}
              </Button>
            </div>

            {labCase.attachments && labCase.attachments.length > 0 ? (
              <div className="space-y-2">
                {labCase.attachments.map((attachment: LabCaseAttachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{attachment.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.fileSize
                            ? `${(attachment.fileSize / 1024).toFixed(1)} KB`
                            : attachment.fileType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Paperclip className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('lab.no_attachments')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
