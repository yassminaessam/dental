'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEGP } from '@/lib/currency';
import {
  BarChart3,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
  PieChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface LabAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analytics: {
    totalCases: number;
    statusCounts: Record<string, number>;
    priorityCounts: Record<string, number>;
    caseTypeCounts: Record<string, number>;
    avgTurnaroundDays: number;
    totalEstimatedCost: number;
    totalActualCost: number;
    overdueCases: number;
    completedCases: number;
  } | null;
}

export function LabAnalyticsDialog({ open, onOpenChange, analytics }: LabAnalyticsDialogProps) {
  const { t, language, isRTL } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const numberFmt = new Intl.NumberFormat(locale);

  if (!analytics) {
    return null;
  }

  const completionRate = analytics.totalCases > 0
    ? Math.round((analytics.completedCases / analytics.totalCases) * 100)
    : 0;

  const costVariance = analytics.totalEstimatedCost > 0
    ? Math.round(((analytics.totalActualCost - analytics.totalEstimatedCost) / analytics.totalEstimatedCost) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('lab.analytics')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  {t('lab.total_cases')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{numberFmt.format(analytics.totalCases)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {t('lab.completion_rate')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <Progress value={completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  {t('lab.avg_turnaround')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.avgTurnaroundDays} {t('lab.days')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  {t('lab.overdue_cases')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", analytics.overdueCases > 0 && "text-red-500")}>
                  {numberFmt.format(analytics.overdueCases)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t('lab.cost_analysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">{t('lab.total_estimated')}</div>
                  <div className="text-xl font-bold">
                    {formatEGP(analytics.totalEstimatedCost, true, language)}
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">{t('lab.total_actual')}</div>
                  <div className="text-xl font-bold">
                    {formatEGP(analytics.totalActualCost, true, language)}
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">{t('lab.cost_variance')}</div>
                  <div className={cn(
                    "text-xl font-bold",
                    costVariance > 0 ? "text-red-500" : costVariance < 0 ? "text-green-500" : ""
                  )}>
                    {costVariance > 0 ? '+' : ''}{costVariance}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                {t('lab.status_breakdown')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(analytics.statusCounts).map(([status, count]) => (
                  <div key={status} className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">{t(`lab.status.${status.toLowerCase()}`) || status}</div>
                    <div className="text-lg font-bold">{numberFmt.format(count)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Case Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('lab.case_type_breakdown')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.caseTypeCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([type, count]) => {
                    const percentage = Math.round((count / analytics.totalCases) * 100);
                    return (
                      <div key={type} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{type}</span>
                          <span className="text-muted-foreground">{numberFmt.format(count)} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Priority Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>{t('lab.priority_breakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(analytics.priorityCounts).map(([priority, count]) => {
                  const priorityColors: Record<string, string> = {
                    Low: 'bg-gray-100 text-gray-800',
                    Normal: 'bg-blue-100 text-blue-800',
                    High: 'bg-orange-100 text-orange-800',
                    Urgent: 'bg-red-100 text-red-800',
                  };
                  return (
                    <div key={priority} className={cn("p-3 rounded-lg", priorityColors[priority] || 'bg-muted')}>
                      <div className="text-sm">{t(`lab.priority.${priority.toLowerCase()}`) || priority}</div>
                      <div className="text-lg font-bold">{numberFmt.format(count)}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
