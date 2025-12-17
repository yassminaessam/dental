'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Loader2,
  Eye,
  User,
  Stethoscope,
  FileText,
  ArrowRight,
  CalendarCheck,
  XCircle,
  History
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ReferralStatusLog {
  id: string;
  fromStatus: string;
  toStatus: string;
  changedBy: string;
  changedAt: string;
  notes?: string;
}

interface Referral {
  id: string;
  specialty: string;
  specialist: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  referralDate: string;
  appointmentDate?: string;
  referringDoctor?: string;
  notes?: string;
  statusHistory: ReferralStatusLog[];
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; bgColor: string; textColor: string }> = {
  pending: { color: 'text-yellow-600', icon: Clock, bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-800 dark:text-yellow-300' },
  scheduled: { color: 'text-blue-600', icon: CalendarCheck, bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-800 dark:text-blue-300' },
  completed: { color: 'text-green-600', icon: CheckCircle2, bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-800 dark:text-green-300' },
  cancelled: { color: 'text-red-600', icon: XCircle, bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-800 dark:text-red-300' },
};

const urgencyColors: Record<string, string> = {
  routine: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  urgent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  emergency: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

function PatientReferralsContent() {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedReferral, setSelectedReferral] = React.useState<Referral | null>(null);

  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  React.useEffect(() => {
    if (user?.email) {
      fetchReferrals();
    }
  }, [user]);

  const fetchReferrals = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(
        `/api/patient/referrals?email=${encodeURIComponent(user.email)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReferrals(data.referrals || []);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
      toast({
        title: t('patient_pages.referrals.error_loading'),
        description: t('patient_pages.referrals.error_loading_desc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: t('patient_pages.referrals.status.pending'),
      scheduled: t('patient_pages.referrals.status.scheduled'),
      completed: t('patient_pages.referrals.status.completed'),
      cancelled: t('patient_pages.referrals.status.cancelled'),
    };
    return statusLabels[status] || status;
  };

  const getUrgencyLabel = (urgency: string) => {
    const urgencyLabels: Record<string, string> = {
      routine: t('patient_pages.referrals.urgency.routine'),
      urgent: t('patient_pages.referrals.urgency.urgent'),
      emergency: t('patient_pages.referrals.urgency.emergency'),
    };
    return urgencyLabels[urgency] || urgency;
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    const total = referrals.length;
    const pending = referrals.filter(r => r.status === 'pending').length;
    const scheduled = referrals.filter(r => r.status === 'scheduled').length;
    const completed = referrals.filter(r => r.status === 'completed').length;

    return { total, pending, scheduled, completed };
  }, [referrals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('patient_pages.referrals.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('patient_pages.referrals.subtitle')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">{t('patient_pages.referrals.total_referrals')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/30 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">{t('patient_pages.referrals.pending')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <CalendarCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.scheduled}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">{t('patient_pages.referrals.scheduled')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.completed}</p>
                <p className="text-sm text-green-600 dark:text-green-400">{t('patient_pages.referrals.completed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            {t('patient_pages.referrals.your_referrals')}
          </CardTitle>
          <CardDescription>
            {t('patient_pages.referrals.your_referrals_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{t('patient_pages.referrals.no_referrals')}</p>
              <p className="text-sm">{t('patient_pages.referrals.no_referrals_desc')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => {
                const config = statusConfig[referral.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                
                return (
                  <div
                    key={referral.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn('p-3 rounded-lg', config.bgColor)}>
                        <StatusIcon className={cn('h-6 w-6', config.color)} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{referral.specialty}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {referral.specialist}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge className={cn(config.bgColor, config.textColor, 'border-0')}>
                            {getStatusLabel(referral.status)}
                          </Badge>
                          <Badge className={cn(urgencyColors[referral.urgency], 'border-0')}>
                            {getUrgencyLabel(referral.urgency)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {t('patient_pages.referrals.referral_date')}: {new Date(referral.referralDate).toLocaleDateString(locale)}
                        </p>
                        {referral.appointmentDate && (
                          <p className="text-sm text-primary font-medium mt-1 flex items-center gap-1">
                            <CalendarCheck className="h-3.5 w-3.5" />
                            {t('patient_pages.referrals.appointment_date')}: {new Date(referral.appointmentDate).toLocaleDateString(locale)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedReferral(referral)}
                      className="shrink-0"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('patient_pages.referrals.view_details')}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Details Dialog */}
      <Dialog open={!!selectedReferral} onOpenChange={() => setSelectedReferral(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              {t('patient_pages.referrals.referral_details')}
            </DialogTitle>
            <DialogDescription>
              {t('patient_pages.referrals.referral_details_desc')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReferral && (
            <div className="space-y-6 pt-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    statusConfig[selectedReferral.status]?.bgColor,
                    statusConfig[selectedReferral.status]?.textColor,
                    'border-0 text-base px-3 py-1'
                  )}>
                    {getStatusLabel(selectedReferral.status)}
                  </Badge>
                  <Badge className={cn(urgencyColors[selectedReferral.urgency], 'border-0')}>
                    {getUrgencyLabel(selectedReferral.urgency)}
                  </Badge>
                </div>
              </div>

              {/* Specialist Info */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('patient_pages.referrals.specialist_info')}
                </h4>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('patient_pages.referrals.specialty')}</p>
                    <p className="font-medium">{selectedReferral.specialty}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('patient_pages.referrals.specialist_name')}</p>
                    <p className="font-medium">{selectedReferral.specialist}</p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('patient_pages.referrals.reason')}
                </h4>
                <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                  {selectedReferral.reason}
                </p>
              </div>

              {/* Important Dates */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('patient_pages.referrals.important_dates')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">{t('patient_pages.referrals.referral_date')}</p>
                    <p className="font-medium">
                      {new Date(selectedReferral.referralDate).toLocaleDateString(locale, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {selectedReferral.appointmentDate && (
                    <div className="p-3 rounded-lg bg-primary/10">
                      <p className="text-sm text-primary">{t('patient_pages.referrals.appointment_date')}</p>
                      <p className="font-medium text-primary">
                        {new Date(selectedReferral.appointmentDate).toLocaleDateString(locale, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Referring Doctor */}
              {selectedReferral.referringDoctor && (
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('patient_pages.referrals.referring_doctor')}</h4>
                  <p className="text-sm text-muted-foreground">{selectedReferral.referringDoctor}</p>
                </div>
              )}

              {/* Notes */}
              {selectedReferral.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">{t('patient_pages.referrals.notes')}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap p-3 rounded-lg bg-muted/50">
                    {selectedReferral.notes}
                  </p>
                </div>
              )}

              {/* Status History */}
              {selectedReferral.statusHistory && selectedReferral.statusHistory.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <History className="h-4 w-4" />
                    {t('patient_pages.referrals.status_history')}
                  </h4>
                  <div className="space-y-2">
                    {selectedReferral.statusHistory.map((log, index) => (
                      <div 
                        key={log.id} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border-l-4 border-primary/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {getStatusLabel(log.fromStatus)}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Badge className={cn(
                              statusConfig[log.toStatus]?.bgColor,
                              statusConfig[log.toStatus]?.textColor,
                              'border-0 text-xs'
                            )}>
                              {getStatusLabel(log.toStatus)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t('patient_pages.referrals.changed_by')}: {log.changedBy}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.changedAt).toLocaleString(locale)}
                          </p>
                          {log.notes && (
                            <p className="text-sm mt-1 italic">{log.notes}</p>
                          )}
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

export default function PatientReferralsPage() {
  return (
    <PatientOnly>
      <PatientLayout>
        <PatientReferralsContent />
      </PatientLayout>
    </PatientOnly>
  );
}
