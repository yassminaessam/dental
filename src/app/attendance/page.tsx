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
import { cn } from "@/lib/utils";
import {
  Search,
  Users,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  Loader2,
  MoreHorizontal,
  LogIn,
  LogOut,
  Coffee,
  FileText,
  Settings,
  TrendingUp,
  UserCheck,
  UserX,
  ClipboardList,
  CalendarDays,
  BarChart3,
  Download,
  Sparkles,
  Wallet,
  ArrowRightLeft,
  Banknote,
} from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ClockInOutDialog } from '@/components/attendance/clock-in-out-dialog';
import { LeaveRequestDialog } from '@/components/attendance/leave-request-dialog';
import { AttendanceSettingsDialog } from '@/components/attendance/attendance-settings-dialog';
import { AttendanceReportDialog } from '@/components/attendance/attendance-report-dialog';
import { ManualAttendanceDialog } from '@/components/attendance/manual-attendance-dialog';
import { ShiftsManagement } from '@/components/attendance/shifts-management';
import { HandoverDialog } from '@/components/attendance/handover-dialog';
import { CashDrawerHandoverDialog } from '@/components/attendance/cash-drawer-handover-dialog';

interface AttendanceRecord {
  id: string;
  staffId: string;
  staff: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'HalfDay' | 'OnLeave' | 'Holiday' | 'Weekend';
  clockIn?: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalBreakMinutes?: number;
  clockInLocation?: { latitude: number; longitude: number; address?: string };
  clockOutLocation?: { latitude: number; longitude: number; address?: string };
  locationVerified?: boolean;
  scheduledHours?: number;
  workedHours?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  earlyDepartureMinutes?: number;
  notes?: string;
}

interface LeaveRequest {
  id: string;
  staffId: string;
  staff: {
    id: string;
    name: string;
    role: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

interface AttendanceSummary {
  totalStaff: number;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  attendanceRate: number;
  records: AttendanceRecord[];
}

const statusColors: Record<string, string> = {
  Present: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Late: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  HalfDay: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  OnLeave: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Holiday: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Weekend: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const leaveStatusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  Approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

export default function AttendancePage() {
  const { t, language, isRTL } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState<AttendanceSummary | null>(null);
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [staff, setStaff] = React.useState<any[]>([]);
  const [isClockDialogOpen, setIsClockDialogOpen] = React.useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = React.useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = React.useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = React.useState(false);
  const [isManualDialogOpen, setIsManualDialogOpen] = React.useState(false);
  const [isHandoverDialogOpen, setIsHandoverDialogOpen] = React.useState(false);
  const [isCashDrawerDialogOpen, setIsCashDrawerDialogOpen] = React.useState(false);
  const [activeShift, setActiveShift] = React.useState<any>(null);
  const [currentStaffId, setCurrentStaffId] = React.useState<string | undefined>();
  const { toast } = useToast();

  // Fetch data on mount
  React.useEffect(() => {
    fetchData();
    fetchActiveShift();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, leaveRes, staffRes] = await Promise.all([
        fetch('/api/attendance?summary=today'),
        fetch('/api/attendance/leave?status=Pending'),
        fetch('/api/staff'),
      ]);

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }

      if (leaveRes.ok) {
        const data = await leaveRes.json();
        setLeaveRequests(data.requests || []);
      }

      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error('[AttendancePage] fetch error', error);
      toast({
        title: t('common.error'),
        description: t('attendance.toast.error_loading'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveShift = async () => {
    try {
      // TODO: Get current staff ID from auth context
      const staffId = currentStaffId;
      if (!staffId) return;
      
      const response = await fetch(`/api/shifts?action=active&staffId=${staffId}`);
      if (response.ok) {
        const data = await response.json();
        setActiveShift(data.shift);
      }
    } catch (error) {
      console.error('[AttendancePage] fetchActiveShift error', error);
    }
  };

  const handleReviewLeave = async (id: string, status: 'Approved' | 'Rejected', reviewNotes?: string) => {
    try {
      const response = await fetch('/api/attendance/leave', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'review',
          status,
          reviewedBy: 'Admin', // TODO: Get from auth context
          reviewNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to review leave request');

      toast({
        title: t('attendance.toast.leave_reviewed'),
        description: status === 'Approved' 
          ? t('attendance.toast.leave_approved_desc') 
          : t('attendance.toast.leave_rejected_desc'),
      });

      fetchData();
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('attendance.toast.error_review'),
        variant: 'destructive',
      });
    }
  };

  // Filter records
  const filteredRecords = React.useMemo(() => {
    if (!summary?.records) return [];
    
    return summary.records.filter((record) => {
      const matchesSearch = 
        record.staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.staff.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [summary?.records, searchTerm, statusFilter]);

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHours = (hours?: number) => {
    if (!hours) return '-';
    return `${hours.toFixed(1)}h`;
  };

  const stats = [
    {
      title: t('attendance.stats.total_staff'),
      value: summary?.totalStaff || 0,
      description: t('attendance.stats.active_employees'),
      icon: Users,
      variant: 'blue' as const,
    },
    {
      title: t('attendance.stats.present'),
      value: summary?.present || 0,
      description: t('attendance.stats.clocked_in_today'),
      icon: UserCheck,
      variant: 'green' as const,
    },
    {
      title: t('attendance.stats.absent'),
      value: summary?.absent || 0,
      description: t('attendance.stats.not_clocked_in'),
      icon: UserX,
      variant: 'red' as const,
    },
    {
      title: t('attendance.stats.late'),
      value: summary?.late || 0,
      description: t('attendance.stats.arrived_late'),
      icon: Clock,
      variant: 'orange' as const,
    },
    {
      title: t('attendance.stats.on_leave'),
      value: summary?.onLeave || 0,
      description: t('attendance.stats.approved_leave'),
      icon: Calendar,
      variant: 'purple' as const,
    },
    {
      title: t('attendance.stats.attendance_rate'),
      value: `${summary?.attendanceRate || 0}%`,
      description: t('attendance.stats.today_rate'),
      icon: TrendingUp,
      variant: 'green' as const,
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-200/30 via-teal-200/20 to-cyan-200/10 dark:from-emerald-900/15 dark:via-teal-900/10 dark:to-cyan-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-sky-200/30 via-blue-200/20 to-indigo-200/10 dark:from-sky-900/15 dark:via-blue-900/10 dark:to-indigo-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Enhanced Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl">
                    <Clock className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    {t('attendance.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('attendance.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setIsReportDialogOpen(true)} className="rounded-xl">
                  <BarChart3 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('attendance.reports')}
                </Button>
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(true)} className="rounded-xl">
                  <Settings className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('attendance.settings')}
                </Button>
                <Button variant="outline" onClick={() => setIsHandoverDialogOpen(true)} className="rounded-xl">
                  <ArrowRightLeft className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('handover.title')}
                </Button>
                <Button variant="outline" onClick={() => setIsCashDrawerDialogOpen(true)} className="rounded-xl">
                  <Banknote className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('cash_drawer.title')}
                </Button>
                <Button variant="outline" onClick={() => setIsLeaveDialogOpen(true)} className="rounded-xl">
                  <CalendarDays className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('attendance.request_leave')}
                </Button>
                <Button onClick={() => setIsClockDialogOpen(true)} className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg">
                  <Clock className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                  {t('attendance.clock_in_out')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title} className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <CardIcon variant={stat.variant}>
                    <IconComponent className="h-4 w-4" />
                  </CardIcon>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="today" className="space-y-4">
          <TabsList>
            <TabsTrigger value="today">
              <Clock className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t('attendance.today')}
            </TabsTrigger>
            <TabsTrigger value="shifts">
              <Wallet className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t('shifts.title')}
            </TabsTrigger>
            <TabsTrigger value="leave">
              <CalendarDays className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t('attendance.leave_requests')}
              {leaveRequests.length > 0 && (
                <Badge variant="secondary" className={cn("h-5", isRTL ? "mr-2" : "ml-2")}>
                  {leaveRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Today's Attendance Tab */}
          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>{t('attendance.todays_attendance')}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date().toLocaleDateString(locale, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4" />
                      {new Date().toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                      <Search className={cn(
                        "absolute top-2.5 h-4 w-4 text-muted-foreground",
                        isRTL ? "right-2.5" : "left-2.5"
                      )} />
                      <Input
                        placeholder={t('attendance.search_staff')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cn("w-full sm:w-[250px]", isRTL ? "pr-8" : "pl-8")}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={t('attendance.filter_status')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('common.all')}</SelectItem>
                        <SelectItem value="Present">{t('attendance.status.present')}</SelectItem>
                        <SelectItem value="Late">{t('attendance.status.late')}</SelectItem>
                        <SelectItem value="Absent">{t('attendance.status.absent')}</SelectItem>
                        <SelectItem value="OnLeave">{t('attendance.status.on_leave')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => setIsManualDialogOpen(true)}>
                      <ClipboardList className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('attendance.manual_entry')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('attendance.employee')}</TableHead>
                      <TableHead>{t('attendance.role')}</TableHead>
                      <TableHead>{t('attendance.status')}</TableHead>
                      <TableHead>{t('attendance.clock_in')}</TableHead>
                      <TableHead>{t('attendance.clock_out')}</TableHead>
                      <TableHead>{t('attendance.worked_hours')}</TableHead>
                      <TableHead>{t('attendance.overtime')}</TableHead>
                      <TableHead>{t('attendance.location')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          {t('attendance.no_records')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.staff.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.staff.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[record.status]}>
                              {t(`attendance.status.${record.status.toLowerCase()}`)}
                            </Badge>
                            {record.lateMinutes && record.lateMinutes > 0 && (
                              <span className="text-xs text-muted-foreground block">
                                +{record.lateMinutes} {t('attendance.minutes')}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{formatTime(record.clockIn)}</TableCell>
                          <TableCell>{formatTime(record.clockOut)}</TableCell>
                          <TableCell>{formatHours(record.workedHours)}</TableCell>
                          <TableCell>
                            {record.overtimeHours && record.overtimeHours > 0 ? (
                              <span className="text-green-600">+{formatHours(record.overtimeHours)}</span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {record.locationVerified ? (
                              <Badge variant="outline" className="text-green-600">
                                <MapPin className="h-3 w-3 mr-1" />
                                {t('attendance.verified')}
                              </Badge>
                            ) : record.clockInLocation ? (
                              <Badge variant="outline" className="text-amber-600">
                                <MapPin className="h-3 w-3 mr-1" />
                                {t('attendance.unverified')}
                              </Badge>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  {t('attendance.view_details')}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Clock className="h-4 w-4 mr-2" />
                                  {t('attendance.edit_time')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {t('attendance.mark_absent')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shifts Management Tab */}
          <TabsContent value="shifts" className="space-y-4">
            <ShiftsManagement 
              staff={staff}
              currentStaffId={currentStaffId}
              onShiftChange={fetchActiveShift}
            />
          </TabsContent>

          {/* Leave Requests Tab */}
          <TabsContent value="leave" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('attendance.pending_leave_requests')}</CardTitle>
                    <CardDescription>{t('attendance.review_leave_desc')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('attendance.employee')}</TableHead>
                      <TableHead>{t('attendance.leave_type')}</TableHead>
                      <TableHead>{t('attendance.start_date')}</TableHead>
                      <TableHead>{t('attendance.end_date')}</TableHead>
                      <TableHead>{t('attendance.total_days')}</TableHead>
                      <TableHead>{t('attendance.reason')}</TableHead>
                      <TableHead>{t('attendance.status')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          {t('attendance.no_pending_requests')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      leaveRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.staff.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {t(`attendance.leave_type.${request.leaveType.toLowerCase()}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(request.startDate).toLocaleDateString(locale)}
                          </TableCell>
                          <TableCell>
                            {new Date(request.endDate).toLocaleDateString(locale)}
                          </TableCell>
                          <TableCell>{request.totalDays}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {request.reason || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge className={leaveStatusColors[request.status]}>
                              {t(`attendance.leave_status.${request.status.toLowerCase()}`)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                                onClick={() => handleReviewLeave(request.id, 'Approved')}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleReviewLeave(request.id, 'Rejected')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <ClockInOutDialog
        open={isClockDialogOpen}
        onOpenChange={setIsClockDialogOpen}
        staff={staff}
        onSuccess={fetchData}
      />

      <LeaveRequestDialog
        open={isLeaveDialogOpen}
        onOpenChange={setIsLeaveDialogOpen}
        staff={staff}
        onSuccess={fetchData}
      />

      <AttendanceSettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      />

      <AttendanceReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        staff={staff}
      />

      <ManualAttendanceDialog
        open={isManualDialogOpen}
        onOpenChange={setIsManualDialogOpen}
        staff={staff}
        onSuccess={fetchData}
      />

      <HandoverDialog
        open={isHandoverDialogOpen}
        onOpenChange={setIsHandoverDialogOpen}
        staff={staff}
        activeShift={activeShift}
        currentStaffId={currentStaffId}
        onHandoverComplete={() => {
          fetchActiveShift();
          fetchData();
        }}
      />

      <CashDrawerHandoverDialog
        open={isCashDrawerDialogOpen}
        onOpenChange={setIsCashDrawerDialogOpen}
        staff={staff}
        activeShift={activeShift}
        currentStaffId={currentStaffId}
        onHandoverComplete={() => {
          fetchActiveShift();
          fetchData();
        }}
      />
    </DashboardLayout>
  );
}
