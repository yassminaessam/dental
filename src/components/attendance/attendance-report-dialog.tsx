'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Loader2, Download, BarChart3, Users, Clock, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Array<{ id: string; name: string; role: string }>;
}

interface ReportData {
  records: any[];
  summary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    halfDays: number;
    leaveDays: number;
    totalWorkedHours: number;
    totalOvertimeHours: number;
    averageLateMinutes: number;
  };
  staffStats: Array<{
    staffName: string;
    staffRole: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    leaveDays: number;
    totalWorkedHours: number;
    totalOvertimeHours: number;
    averageLateMinutes: number;
  }>;
}

const statusColors: Record<string, string> = {
  Present: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Late: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  HalfDay: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  OnLeave: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

export function AttendanceReportDialog({ open, onOpenChange, staff }: AttendanceReportDialogProps) {
  const { t, language, isRTL } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [reportData, setReportData] = React.useState<ReportData | null>(null);
  
  // Date range - default to current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [filters, setFilters] = React.useState({
    staffId: 'all',
    startDate: firstDayOfMonth.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      
      if (filters.staffId !== 'all') {
        params.append('staffId', filters.staffId);
      }

      const response = await fetch(`/api/attendance?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('attendance.toast.error_generating_report'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const headers = [
      'Employee',
      'Role',
      'Date',
      'Status',
      'Clock In',
      'Clock Out',
      'Worked Hours',
      'Overtime Hours',
      'Late Minutes',
    ];

    const rows = reportData.records.map((record) => [
      record.staff?.name || '-',
      record.staff?.role || '-',
      new Date(record.date).toLocaleDateString(locale),
      record.status,
      record.clockIn ? new Date(record.clockIn).toLocaleTimeString(locale) : '-',
      record.clockOut ? new Date(record.clockOut).toLocaleTimeString(locale) : '-',
      record.workedHours?.toFixed(1) || '-',
      record.overtimeHours?.toFixed(1) || '-',
      record.lateMinutes || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_report_${filters.startDate}_${filters.endDate}.csv`;
    link.click();

    toast({
      title: t('attendance.toast.report_exported'),
      description: t('attendance.toast.report_exported_desc'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t('attendance.reports')}
          </DialogTitle>
          <DialogDescription>{t('attendance.reports_desc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label>{t('attendance.employee')}</Label>
              <Select 
                value={filters.staffId} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, staffId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('attendance.start_date')}</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('attendance.end_date')}</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>{t('attendance.generate_report')}</>
                )}
              </Button>
            </div>
          </div>

          {/* Report Results */}
          {reportData && (
            <>
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      {t('attendance.total_records')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.summary.totalDays}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      {t('attendance.attendance_rate')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reportData.summary.totalDays > 0
                        ? Math.round((reportData.summary.presentDays / reportData.summary.totalDays) * 100)
                        : 0}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      {t('attendance.total_hours')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.summary.totalWorkedHours.toFixed(1)}h</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      {t('attendance.late_days')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.summary.lateDays}</div>
                    <p className="text-xs text-muted-foreground">
                      {t('attendance.avg')}: {reportData.summary.averageLateMinutes} {t('attendance.min')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Staff Stats Table */}
              {reportData.staffStats.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">{t('attendance.staff_summary')}</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('attendance.employee')}</TableHead>
                        <TableHead>{t('attendance.role')}</TableHead>
                        <TableHead className="text-center">{t('attendance.present')}</TableHead>
                        <TableHead className="text-center">{t('attendance.absent')}</TableHead>
                        <TableHead className="text-center">{t('attendance.late')}</TableHead>
                        <TableHead className="text-center">{t('attendance.leave')}</TableHead>
                        <TableHead className="text-center">{t('attendance.hours')}</TableHead>
                        <TableHead className="text-center">{t('attendance.overtime')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.staffStats.map((stat, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{stat.staffName}</TableCell>
                          <TableCell>{stat.staffRole}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-green-50">{stat.presentDays}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-red-50">{stat.absentDays}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-amber-50">{stat.lateDays}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-blue-50">{stat.leaveDays}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{stat.totalWorkedHours.toFixed(1)}h</TableCell>
                          <TableCell className="text-center">
                            {stat.totalOvertimeHours > 0 ? (
                              <span className="text-green-600">+{stat.totalOvertimeHours.toFixed(1)}h</span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Detailed Records */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t('attendance.detailed_records')}</h3>
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('attendance.export_csv')}
                  </Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('attendance.date')}</TableHead>
                        <TableHead>{t('attendance.employee')}</TableHead>
                        <TableHead>{t('attendance.status')}</TableHead>
                        <TableHead>{t('attendance.clock_in')}</TableHead>
                        <TableHead>{t('attendance.clock_out')}</TableHead>
                        <TableHead>{t('attendance.hours')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.records.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {t('attendance.no_records')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        reportData.records.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              {new Date(record.date).toLocaleDateString(locale)}
                            </TableCell>
                            <TableCell>{record.staff?.name}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[record.status]}>
                                {t(`attendance.status.${record.status.toLowerCase()}`)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {record.clockIn
                                ? new Date(record.clockIn).toLocaleTimeString(locale, {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {record.clockOut
                                ? new Date(record.clockOut).toLocaleTimeString(locale, {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : '-'}
                            </TableCell>
                            <TableCell>
                              {record.workedHours ? `${record.workedHours.toFixed(1)}h` : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
