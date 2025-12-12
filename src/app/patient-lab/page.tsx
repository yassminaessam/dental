'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  Calendar,
  Loader2,
  Eye,
  Package,
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LabCaseUpdate {
  id: string;
  fromStatus: string;
  toStatus: string;
  message?: string;
  date: string;
}

interface LabCase {
  id: string;
  caseNumber: string;
  caseType: string;
  toothNumbers?: string;
  shade?: string;
  material?: string;
  status: string;
  priority: string;
  requestDate: string;
  dueDate?: string;
  sentToLabDate?: string;
  receivedDate?: string;
  deliveredDate?: string;
  description?: string;
  labName?: string;
  statusHistory: LabCaseUpdate[];
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; bgColor: string }> = {
  Draft: { color: 'text-gray-600', icon: FileText, bgColor: 'bg-gray-100 dark:bg-gray-800' },
  Submitted: { color: 'text-blue-600', icon: Package, bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  InProgress: { color: 'text-yellow-600', icon: Clock, bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  QualityCheck: { color: 'text-purple-600', icon: CheckCircle2, bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  Completed: { color: 'text-green-600', icon: CheckCircle2, bgColor: 'bg-green-100 dark:bg-green-900/30' },
  Delivered: { color: 'text-emerald-600', icon: Truck, bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  Cancelled: { color: 'text-red-600', icon: AlertCircle, bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

const priorityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  Normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  Urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

function PatientLabContent() {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [labCases, setLabCases] = React.useState<LabCase[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCase, setSelectedCase] = React.useState<LabCase | null>(null);

  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  React.useEffect(() => {
    if (user?.email) {
      fetchLabCases();
    }
  }, [user]);

  const fetchLabCases = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(
        `/api/patient/lab-cases?email=${encodeURIComponent(user.email)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setLabCases(data.labCases || []);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      console.error('Error fetching lab cases:', error);
      toast({
        title: t('patient_pages.lab.error_loading'),
        description: t('patient_pages.lab.error_loading_desc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      Draft: t('patient_pages.lab.status.draft'),
      Submitted: t('patient_pages.lab.status.submitted'),
      InProgress: t('patient_pages.lab.status.in_progress'),
      QualityCheck: t('patient_pages.lab.status.quality_check'),
      Completed: t('patient_pages.lab.status.completed'),
      Delivered: t('patient_pages.lab.status.delivered'),
      Cancelled: t('patient_pages.lab.status.cancelled'),
    };
    return statusLabels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const priorityLabels: Record<string, string> = {
      Low: t('patient_pages.lab.priority.low'),
      Normal: t('patient_pages.lab.priority.normal'),
      High: t('patient_pages.lab.priority.high'),
      Urgent: t('patient_pages.lab.priority.urgent'),
    };
    return priorityLabels[priority] || priority;
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    const total = labCases.length;
    const inProgress = labCases.filter(c => 
      ['Submitted', 'InProgress', 'QualityCheck'].includes(c.status)
    ).length;
    const completed = labCases.filter(c => 
      ['Completed', 'Delivered'].includes(c.status)
    ).length;
    const pending = labCases.filter(c => c.status === 'Draft').length;

    return { total, inProgress, completed, pending };
  }, [labCases]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <FlaskConical className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t('patient_pages.lab.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('patient_pages.lab.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {t('patient_pages.lab.total_cases')}
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.total}
                </p>
              </div>
              <FlaskConical className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20 border-yellow-200/50 dark:border-yellow-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  {t('patient_pages.lab.in_progress')}
                </p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {stats.inProgress}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200/50 dark:border-green-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  {t('patient_pages.lab.completed')}
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20 border-gray-200/50 dark:border-gray-800/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('patient_pages.lab.pending')}
                </p>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {stats.pending}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lab Cases List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('patient_pages.lab.your_cases')}
          </CardTitle>
          <CardDescription>
            {t('patient_pages.lab.your_cases_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {labCases.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FlaskConical className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">
                {t('patient_pages.lab.no_cases')}
              </h3>
              <p className="text-sm">
                {t('patient_pages.lab.no_cases_desc')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {labCases.map((labCase) => {
                const config = statusConfig[labCase.status] || statusConfig.Draft;
                const StatusIcon = config.icon;

                return (
                  <div
                    key={labCase.id}
                    className="group p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 bg-card"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Case Info */}
                      <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-xl", config.bgColor)}>
                          <StatusIcon className={cn("h-6 w-6", config.color)} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground">
                              {labCase.caseNumber}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {labCase.caseType}
                            </Badge>
                            <Badge className={cn("text-xs", priorityColors[labCase.priority])}>
                              {getPriorityLabel(labCase.priority)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {labCase.toothNumbers && (
                              <span>{t('patient_pages.lab.teeth')}: {labCase.toothNumbers}</span>
                            )}
                            {labCase.material && (
                              <span>{t('patient_pages.lab.material')}: {labCase.material}</span>
                            )}
                          </div>
                          {labCase.labName && (
                            <p className="text-sm text-muted-foreground">
                              {t('patient_pages.lab.lab')}: {labCase.labName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <Badge className={cn("mb-1", config.bgColor, config.color)}>
                            {getStatusLabel(labCase.status)}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(labCase.requestDate).toLocaleDateString(locale)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCase(labCase)}
                          className="group-hover:border-primary/50"
                        >
                          <Eye className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {t('patient_pages.lab.view_details')}
                        </Button>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    {labCase.status !== 'Cancelled' && labCase.status !== 'Draft' && (
                      <div className="mt-4 pt-4 border-t border-border/30">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>{t('patient_pages.lab.progress')}</span>
                          <span>
                            {labCase.dueDate && (
                              <>
                                {t('patient_pages.lab.due')}: {new Date(labCase.dueDate).toLocaleDateString(locale)}
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {['Submitted', 'InProgress', 'QualityCheck', 'Completed', 'Delivered'].map((step, index) => {
                            const steps = ['Submitted', 'InProgress', 'QualityCheck', 'Completed', 'Delivered'];
                            const currentIndex = steps.indexOf(labCase.status);
                            const isActive = index <= currentIndex;
                            const isCurrent = step === labCase.status;
                            
                            return (
                              <React.Fragment key={step}>
                                <div
                                  className={cn(
                                    "h-2 flex-1 rounded-full transition-all duration-500",
                                    isActive 
                                      ? isCurrent 
                                        ? "bg-primary animate-pulse" 
                                        : "bg-primary"
                                      : "bg-muted"
                                  )}
                                />
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Case Details Dialog */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-primary" />
              {t('patient_pages.lab.case_details')} - {selectedCase?.caseNumber}
            </DialogTitle>
            <DialogDescription>
              {t('patient_pages.lab.case_details_desc')}
            </DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6 pt-4">
              {/* Status Banner */}
              <div className={cn(
                "p-4 rounded-xl flex items-center gap-4",
                statusConfig[selectedCase.status]?.bgColor || 'bg-gray-100'
              )}>
                {(() => {
                  const config = statusConfig[selectedCase.status] || statusConfig.Draft;
                  const StatusIcon = config.icon;
                  return <StatusIcon className={cn("h-8 w-8", config.color)} />;
                })()}
                <div>
                  <p className="font-semibold text-lg">
                    {getStatusLabel(selectedCase.status)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('patient_pages.lab.current_status')}
                  </p>
                </div>
              </div>

              {/* Case Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">{t('patient_pages.lab.case_type')}</p>
                  <p className="font-medium">{selectedCase.caseType}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">{t('patient_pages.lab.priority_label')}</p>
                  <Badge className={priorityColors[selectedCase.priority]}>
                    {getPriorityLabel(selectedCase.priority)}
                  </Badge>
                </div>
                {selectedCase.toothNumbers && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">{t('patient_pages.lab.teeth')}</p>
                    <p className="font-medium">{selectedCase.toothNumbers}</p>
                  </div>
                )}
                {selectedCase.material && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">{t('patient_pages.lab.material')}</p>
                    <p className="font-medium">{selectedCase.material}</p>
                  </div>
                )}
                {selectedCase.shade && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">{t('patient_pages.lab.shade')}</p>
                    <p className="font-medium">{selectedCase.shade}</p>
                  </div>
                )}
                {selectedCase.labName && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-1">{t('patient_pages.lab.lab')}</p>
                    <p className="font-medium">{selectedCase.labName}</p>
                  </div>
                )}
              </div>

              {/* Important Dates */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('patient_pages.lab.important_dates')}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground">{t('patient_pages.lab.request_date')}</p>
                    <p className="font-medium">{new Date(selectedCase.requestDate).toLocaleDateString(locale)}</p>
                  </div>
                  {selectedCase.dueDate && (
                    <div className="p-3 rounded-lg border border-border/50">
                      <p className="text-xs text-muted-foreground">{t('patient_pages.lab.due_date')}</p>
                      <p className="font-medium">{new Date(selectedCase.dueDate).toLocaleDateString(locale)}</p>
                    </div>
                  )}
                  {selectedCase.sentToLabDate && (
                    <div className="p-3 rounded-lg border border-border/50">
                      <p className="text-xs text-muted-foreground">{t('patient_pages.lab.sent_to_lab')}</p>
                      <p className="font-medium">{new Date(selectedCase.sentToLabDate).toLocaleDateString(locale)}</p>
                    </div>
                  )}
                  {selectedCase.receivedDate && (
                    <div className="p-3 rounded-lg border border-border/50">
                      <p className="text-xs text-muted-foreground">{t('patient_pages.lab.received')}</p>
                      <p className="font-medium">{new Date(selectedCase.receivedDate).toLocaleDateString(locale)}</p>
                    </div>
                  )}
                  {selectedCase.deliveredDate && (
                    <div className="p-3 rounded-lg border border-border/50">
                      <p className="text-xs text-muted-foreground">{t('patient_pages.lab.delivered_date')}</p>
                      <p className="font-medium">{new Date(selectedCase.deliveredDate).toLocaleDateString(locale)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedCase.description && (
                <div>
                  <h4 className="font-semibold mb-2">{t('patient_pages.lab.description')}</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedCase.description}
                  </p>
                </div>
              )}

              {/* Status History */}
              {selectedCase.statusHistory && selectedCase.statusHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('patient_pages.lab.status_history')}
                  </h4>
                  <div className="space-y-3">
                    {selectedCase.statusHistory.map((update, index) => (
                      <div 
                        key={update.id} 
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border-l-4",
                          index === 0 ? "border-primary bg-primary/5" : "border-muted bg-muted/30"
                        )}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {getStatusLabel(update.fromStatus)}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Badge className="text-xs">
                              {getStatusLabel(update.toStatus)}
                            </Badge>
                          </div>
                          {update.message && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {update.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(update.date).toLocaleString(locale)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PatientLabPage() {
  return (
    <PatientOnly>
      <PatientLayout>
        <PatientLabContent />
      </PatientLayout>
    </PatientOnly>
  );
}
