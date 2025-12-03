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
  BarChart3,
  AlertTriangle,
  Pencil,
  Trash2,
  Loader2,
  MoreHorizontal,
  Plus,
  Sparkles,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  Package,
  Send,
  Eye,
  Paperclip,
  TrendingUp,
  Calendar,
  DollarSign,
  FlaskConical,
} from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEGP } from '@/lib/currency';
import { AddLabCaseDialog } from '@/components/lab-management/add-lab-case-dialog';
import { EditLabCaseDialog } from '@/components/lab-management/edit-lab-case-dialog';
import { LabCaseDetailsDialog } from '@/components/lab-management/lab-case-details-dialog';
import { ManageLabsDialog } from '@/components/lab-management/manage-labs-dialog';
import { LabAnalyticsDialog } from '@/components/lab-management/lab-analytics-dialog';
import type { LabCase, Lab, LabCaseStatus, LabCasePriority } from '@/services/lab-management';

const statusColors: Record<LabCaseStatus, string> = {
  Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  Submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  InProgress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  QualityCheck: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const priorityColors: Record<LabCasePriority, string> = {
  Low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  Normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function LabManagementPage() {
  const { t, language, isRTL } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const numberFmt = new Intl.NumberFormat(locale);
  const [cases, setCases] = React.useState<LabCase[]>([]);
  const [labs, setLabs] = React.useState<Lab[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [caseToEdit, setCaseToEdit] = React.useState<LabCase | null>(null);
  const [caseToView, setCaseToView] = React.useState<LabCase | null>(null);
  const [caseToDelete, setCaseToDelete] = React.useState<LabCase | null>(null);
  const [isAddCaseDialogOpen, setIsAddCaseDialogOpen] = React.useState(false);
  const [isManageLabsOpen, setIsManageLabsOpen] = React.useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = React.useState(false);
  const [analytics, setAnalytics] = React.useState<any>(null);
  const { toast } = useToast();

  // Fetch data on mount
  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [casesRes, labsRes, analyticsRes] = await Promise.all([
        fetch('/api/lab/cases'),
        fetch('/api/lab/labs'),
        fetch('/api/lab/analytics'),
      ]);

      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setCases(Array.isArray(casesData) ? casesData : []);
      }

      if (labsRes.ok) {
        const labsData = await labsRes.json();
        setLabs(Array.isArray(labsData) ? labsData : []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('[LabManagementPage] fetch error', error);
      toast({ title: t('lab.toast.error_fetching'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const stats = React.useMemo(() => {
    const totalCases = cases.length;
    const pendingCases = cases.filter(c => 
      c.status === 'Draft' || c.status === 'Submitted' || c.status === 'InProgress'
    ).length;
    const completedCases = cases.filter(c => 
      c.status === 'Completed' || c.status === 'Delivered'
    ).length;
    const overdueCases = cases.filter(c => {
      if (!c.dueDate || c.status === 'Completed' || c.status === 'Delivered' || c.status === 'Cancelled') {
        return false;
      }
      return new Date(c.dueDate) < new Date();
    }).length;

    return [
      { 
        title: t('lab.total_cases'), 
        value: numberFmt.format(totalCases), 
        description: t('lab.all_lab_cases'),
        icon: FileText,
        variant: 'blue' as const,
      },
      { 
        title: t('lab.pending_cases'), 
        value: numberFmt.format(pendingCases), 
        description: t('lab.cases_in_progress'),
        icon: Clock,
        variant: 'orange' as const,
      },
      { 
        title: t('lab.completed_cases'), 
        value: numberFmt.format(completedCases), 
        description: t('lab.cases_completed'),
        icon: CheckCircle2,
        variant: 'green' as const,
      },
      { 
        title: t('lab.overdue_cases'), 
        value: numberFmt.format(overdueCases), 
        description: t('lab.cases_past_due'),
        icon: AlertTriangle,
        variant: 'purple' as const,
        valueClassName: overdueCases > 0 ? 'text-red-500' : undefined,
      },
    ];
  }, [cases, t, numberFmt]);

  // Filtered cases
  const filteredCases = React.useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = 
        c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.caseType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, searchTerm, statusFilter, priorityFilter]);

  // Handlers
  const handleAddCase = async (data: any) => {
    try {
      const response = await fetch('/api/lab/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create lab case');
      const newCase = await response.json();
      setCases(prev => [newCase, ...prev]);
      setIsAddCaseDialogOpen(false);
      toast({
        title: t('lab.toast.case_created'),
        description: t('lab.toast.case_created_desc'),
      });
    } catch (error) {
      console.error('[LabManagementPage] add case error', error);
      toast({ title: t('lab.toast.error_creating'), variant: 'destructive' });
    }
  };

  const handleUpdateCase = async (data: any) => {
    if (!caseToEdit) return;
    try {
      const response = await fetch(`/api/lab/cases/${caseToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update lab case');
      const updatedCase = await response.json();
      setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
      setCaseToEdit(null);
      toast({
        title: t('lab.toast.case_updated'),
        description: t('lab.toast.case_updated_desc'),
      });
    } catch (error) {
      console.error('[LabManagementPage] update case error', error);
      toast({ title: t('lab.toast.error_updating'), variant: 'destructive' });
    }
  };

  const handleStatusUpdate = async (caseId: string, status: LabCaseStatus, message?: string) => {
    try {
      const response = await fetch(`/api/lab/cases/${caseId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, message }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const updatedCase = await response.json();
      setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
      if (caseToView?.id === caseId) {
        setCaseToView(updatedCase);
      }
      toast({
        title: t('lab.toast.status_updated'),
        description: t('lab.toast.status_updated_desc'),
      });
    } catch (error) {
      console.error('[LabManagementPage] status update error', error);
      toast({ title: t('lab.toast.error_updating_status'), variant: 'destructive' });
    }
  };

  const handleDeleteCase = async () => {
    if (!caseToDelete) return;
    try {
      const response = await fetch(`/api/lab/cases/${caseToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete lab case');
      setCases(prev => prev.filter(c => c.id !== caseToDelete.id));
      setCaseToDelete(null);
      toast({
        title: t('lab.toast.case_deleted'),
        description: t('lab.toast.case_deleted_desc'),
        variant: 'destructive',
      });
    } catch (error) {
      console.error('[LabManagementPage] delete case error', error);
      toast({ title: t('lab.toast.error_deleting'), variant: 'destructive' });
    }
  };

  const handleLabsChange = async () => {
    // Refresh labs list
    const labsRes = await fetch('/api/lab/labs');
    if (labsRes.ok) {
      const labsData = await labsRes.json();
      setLabs(Array.isArray(labsData) ? labsData : []);
    }
  };

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

  const getPriorityLabel = (priority: LabCasePriority) => {
    const priorityLabels: Record<LabCasePriority, string> = {
      Low: t('lab.priority.low'),
      Normal: t('lab.priority.normal'),
      High: t('lab.priority.high'),
      Urgent: t('lab.priority.urgent'),
    };
    return priorityLabels[priority];
  };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-teal-200/30 via-cyan-200/20 to-blue-200/10 dark:from-teal-900/15 dark:via-cyan-900/10 dark:to-blue-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-200/30 via-indigo-200/20 to-blue-200/10 dark:from-purple-900/15 dark:via-indigo-900/10 dark:to-blue-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Page Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-blue-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-xl">
                    <FlaskConical className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent animate-gradient">
                    {t('lab.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('lab.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAnalyticsOpen(true)}
                  className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <BarChart3 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('nav.analytics')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsManageLabsOpen(true)}
                  className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Building2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('lab.manage_labs')}
                </Button>
                <Button 
                  onClick={() => setIsAddCaseDialogOpen(true)}
                  className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  <Plus className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                  {t('lab.new_case')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const cardStyles = ['metric-card-blue','metric-card-orange','metric-card-green','metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            const Icon = stat.icon;
            return (
              <Card
                key={stat.title}
                className={cn(
                  'relative overflow-hidden border-0 shadow-xl transition-all duration-500 group',
                  cardStyle
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <CardIcon variant={stat.variant} aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </CardIcon>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className={cn("text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2", stat.valueClassName)}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Card className="group relative border-2 border-muted hover:border-teal-200 dark:hover:border-teal-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-teal-50/10 dark:to-teal-950/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <CardHeader className="relative z-10 flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 group-hover:from-teal-500/20 group-hover:to-cyan-500/20 transition-colors">
                <Package className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {t('lab.all_cases')}
              </CardTitle>
            </div>
            
            <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
              <div className="relative w-full md:w-auto group/search">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl blur-lg opacity-0 group-hover/search:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <Search className={cn("absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover/search:text-teal-500 transition-colors duration-300", isRTL ? 'right-3' : 'left-3')} />
                  <Input
                    type="search"
                    placeholder={t('lab.search_cases')}
                    className={cn(
                      "w-full rounded-xl bg-background/80 backdrop-blur-sm border-2 border-muted hover:border-teal-300 dark:hover:border-teal-700 focus:border-teal-500 dark:focus:border-teal-600 py-5 h-auto lg:w-[280px] shadow-sm hover:shadow-md transition-all duration-300",
                      isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4'
                    )}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px] rounded-xl border-2 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors">
                  <SelectValue placeholder={t('lab.all_statuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('lab.all_statuses')}</SelectItem>
                  <SelectItem value="Draft">{t('lab.status.draft')}</SelectItem>
                  <SelectItem value="Submitted">{t('lab.status.submitted')}</SelectItem>
                  <SelectItem value="InProgress">{t('lab.status.in_progress')}</SelectItem>
                  <SelectItem value="QualityCheck">{t('lab.status.quality_check')}</SelectItem>
                  <SelectItem value="Completed">{t('lab.status.completed')}</SelectItem>
                  <SelectItem value="Delivered">{t('lab.status.delivered')}</SelectItem>
                  <SelectItem value="Cancelled">{t('lab.status.cancelled')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-[150px] rounded-xl border-2 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors">
                  <SelectValue placeholder={t('lab.all_priorities')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('lab.all_priorities')}</SelectItem>
                  <SelectItem value="Low">{t('lab.priority.low')}</SelectItem>
                  <SelectItem value="Normal">{t('lab.priority.normal')}</SelectItem>
                  <SelectItem value="High">{t('lab.priority.high')}</SelectItem>
                  <SelectItem value="Urgent">{t('lab.priority.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('lab.case_number')}</TableHead>
                  <TableHead>{t('lab.patient')}</TableHead>
                  <TableHead>{t('lab.doctor')}</TableHead>
                  <TableHead>{t('lab.case_type')}</TableHead>
                  <TableHead>{t('lab.lab')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('lab.priority')}</TableHead>
                  <TableHead>{t('lab.due_date')}</TableHead>
                  <TableHead>{t('lab.cost')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : filteredCases.length > 0 ? (
                  filteredCases.map((labCase) => (
                    <TableRow key={labCase.id}>
                      <TableCell>
                        <div className="font-medium">{labCase.caseNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(labCase.requestDate).toLocaleDateString(locale)}
                        </div>
                      </TableCell>
                      <TableCell>{labCase.patientName}</TableCell>
                      <TableCell>{labCase.doctorName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{labCase.caseType}</Badge>
                        {labCase.toothNumbers && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {t('lab.teeth')}: {labCase.toothNumbers}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{labCase.labName || t('lab.not_assigned')}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[labCase.status]}>
                          {getStatusLabel(labCase.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[labCase.priority]}>
                          {getPriorityLabel(labCase.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {labCase.dueDate ? (
                          <div className={cn(
                            "text-sm",
                            new Date(labCase.dueDate) < new Date() && 
                            labCase.status !== 'Completed' && 
                            labCase.status !== 'Delivered' && 
                            labCase.status !== 'Cancelled'
                              ? 'text-red-500 font-medium'
                              : ''
                          )}>
                            {new Date(labCase.dueDate).toLocaleDateString(locale)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t('common.na')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {labCase.estimatedCost ? (
                          <div>
                            <div className="font-medium">{formatEGP(labCase.estimatedCost, true, language)}</div>
                            {labCase.actualCost && (
                              <div className="text-xs text-muted-foreground">
                                {t('lab.actual')}: {formatEGP(labCase.actualCost, true, language)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t('common.na')}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">{t('table.actions')}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setCaseToView(labCase)}>
                              <Eye className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                              {t('common.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setCaseToEdit(labCase)}>
                              <Pencil className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            {labCase.status === 'Draft' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(labCase.id, 'Submitted')}>
                                <Send className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                                {t('lab.send_to_lab')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setCaseToDelete(labCase)} className="text-destructive">
                              <Trash2 className={cn("h-4 w-4", isRTL ? 'ml-2' : 'mr-2')} />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      {t('lab.no_cases_found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <AddLabCaseDialog
        open={isAddCaseDialogOpen}
        onOpenChange={setIsAddCaseDialogOpen}
        onSave={handleAddCase}
        labs={labs}
      />

      {caseToEdit && (
        <EditLabCaseDialog
          open={!!caseToEdit}
          onOpenChange={(open: boolean) => !open && setCaseToEdit(null)}
          labCase={caseToEdit}
          onSave={handleUpdateCase}
          labs={labs}
        />
      )}

      {caseToView && (
        <LabCaseDetailsDialog
          open={!!caseToView}
          onOpenChange={(open: boolean) => !open && setCaseToView(null)}
          labCase={caseToView}
          onStatusUpdate={handleStatusUpdate}
          onRefresh={() => {
            fetchData();
            setCaseToView(null);
          }}
        />
      )}

      <ManageLabsDialog
        open={isManageLabsOpen}
        onOpenChange={setIsManageLabsOpen}
        labs={labs}
        onLabsChange={handleLabsChange}
      />

      <LabAnalyticsDialog
        open={isAnalyticsOpen}
        onOpenChange={setIsAnalyticsOpen}
        analytics={analytics}
      />

      <AlertDialog open={!!caseToDelete} onOpenChange={(open) => !open && setCaseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('lab.confirm_delete_case')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCase}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
