'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  User, 
  Users,
  Calendar, 
  FileText, 
  Image, 
  DollarSign, 
  Shield, 
  Stethoscope, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Heart,
  Activity,
  TrendingUp,
  History,
  Eye,
  Edit,
  Plus,
  ExternalLink,
  Printer,
  Download,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@/app/patients/page';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatEGP } from '@/lib/currency';
import { PatientFamily } from './patient-family';

// Add custom styles for visible scrollbars
const scrollAreaStyles = `
  .patient-history-scroll [data-radix-scroll-area-scrollbar] {
    width: 12px !important;
    height: 12px !important;
    background: rgba(0, 0, 0, 0.1) !important;
    border-radius: 6px !important;
  }
  
  .patient-history-scroll [data-radix-scroll-area-thumb] {
    background: rgba(0, 0, 0, 0.4) !important;
    border-radius: 6px !important;
  }
  
  .patient-history-scroll [data-radix-scroll-area-thumb]:hover {
    background: rgba(0, 0, 0, 0.6) !important;
  }
`;

interface PatientHistoryData {
  appointments: any[];
  treatments: any[];
  medicalRecords: any[];
  clinicalImages: any[];
  invoices: any[];
  insuranceClaims: any[];
  dentalChart?: any;
  toothImageLinks: any[];
  messages: any[];
  prescriptions: any[];
  referrals: any[];
  labCases: any[];
}

interface ComprehensivePatientHistoryProps {
  patient: Patient;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ComprehensivePatientHistory({ patient, children, open: externalOpen, onOpenChange: externalOnOpenChange }: ComprehensivePatientHistoryProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [historyData, setHistoryData] = React.useState<PatientHistoryData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isRTL = false; // Force LTR layout as requested
  
  // State for detail dialogs
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [detailDialogType, setDetailDialogType] = React.useState<string | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<any>(null);
  
  // Open detail dialog for an item
  const openDetailDialog = React.useCallback((type: string, item: any) => {
    setDetailDialogType(type);
    setSelectedItem(item);
  }, []);
  
  // Close detail dialog
  const closeDetailDialog = React.useCallback(() => {
    setDetailDialogType(null);
    setSelectedItem(null);
  }, []);
  
  // Navigate to related page
  const navigateTo = React.useCallback((path: string) => {
    window.open(path, '_blank');
  }, []);
  
  // Local date helpers
  const toValidDate = React.useCallback((value: any): Date | null => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }, []);
  const formatDateSafe = React.useCallback((value: any, fmt: string = 'PPP'): string => {
    const d = toValidDate(value);
    return d ? format(d, fmt) : t('common.na');
  }, [toValidDate, t]);
  // Local helpers to translate common dynamic statuses
  const trMedicalRecordStatus = React.useCallback(
    (status: string) => {
      switch (status) {
        case 'Final':
          return t('medical_records.final');
        case 'Draft':
          return t('medical_records.draft');
        default:
          return status;
      }
    },
    [t]
  );

  const trMessageStatus = React.useCallback(
    (status: string) => {
      switch (status) {
        case 'Sent':
          return t('communications.sent');
        case 'Delivered':
          return t('communications.delivered');
        case 'Queued':
          return t('communications.queued');
        case 'Failed':
          return t('communications.failed');
        default:
          return status;
      }
    },
    [t]
  );

  const trInvoiceStatus = React.useCallback(
    (status: string) => {
      switch (status) {
        case 'Paid':
          return t('billing.paid');
        case 'Partial':
          return t('billing.partial');
        case 'Overdue':
          return t('billing.overdue');
        default:
          return status;
      }
    },
    [t]
  );

  // Use external control if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const onOpenChange = externalOnOpenChange || setInternalOpen;

  const fetchPatientHistory = React.useCallback(async () => {
    if (!patient || !patient.id) return;

    setLoading(true);
    try {
      // Fetch all patient history from the new unified API endpoint
      const response = await fetch(`/api/patients/${patient.id}/history`, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patient history (${response.status})`);
      }

      const data = await response.json();

      if (data.success && data.history) {
        setHistoryData(data.history);
      } else {
        throw new Error(data.error || 'Unknown error fetching patient history');
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
      toast({
        title: t('patients.toast.error_loading_history'),
        description: t('patients.toast.error_loading_history_desc'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [patient, t, toast]);

  React.useEffect(() => {
    if (open && patient) {
      fetchPatientHistory();
    }
  }, [open, patient, fetchPatientHistory]);

  const getPatientStats = () => {
    if (!historyData) return null;

    const totalVisits = historyData.appointments.length;
    const completedTreatments = historyData.treatments.filter(t => t.status === 'Completed').length;
    const totalSpent = historyData.invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const lastVisit = historyData.appointments
      .sort((a, b) => {
        const bt = toValidDate(b.dateTime || b.date)?.getTime() ?? -Infinity;
        const at = toValidDate(a.dateTime || a.date)?.getTime() ?? -Infinity;
        return bt - at;
      })[0];

    return {
      totalVisits,
      completedTreatments,
      totalSpent,
  lastVisit: lastVisit ? formatDateSafe(lastVisit.dateTime || lastVisit.date, 'PPP') : t('common.na'),
      totalImages: historyData.clinicalImages.length,
      totalRecords: historyData.medicalRecords.length,
      activeClaims: historyData.insuranceClaims.filter(c => c.status === 'Processing').length,
      totalMessages: historyData.messages.length,
      activePrescriptions: historyData.prescriptions.filter(rx => rx.status === 'Active').length,
      totalReferrals: historyData.referrals.length
    };
  };

  const getTimelineEvents = () => {
    if (!historyData) return [];

    const events: any[] = [];

    // Add appointments
    historyData.appointments.forEach(apt => {
      const d = toValidDate(apt.dateTime || apt.date);
      if (!d) return;
      events.push({
        type: 'appointment',
        date: d,
        title: `Appointment - ${apt.type}`,
        description: `${apt.duration} with ${apt.doctor}`,
        status: apt.status,
        icon: Calendar,
        color: 'blue'
      });
    });

    // Add treatments
    historyData.treatments.forEach(treatment => {
      const d = toValidDate(treatment.date);
      if (!d) return;
      events.push({
        type: 'treatment',
        date: d,
        title: `Treatment - ${treatment.procedure}`,
        description: `${treatment.cost} with ${treatment.doctor}`,
        status: treatment.status,
        icon: Stethoscope,
        color: 'green'
      });
    });

    // Add medical records
    historyData.medicalRecords.forEach(record => {
      const d = toValidDate(record.date);
      if (!d) return;
      events.push({
        type: 'record',
        date: d,
        title: `Medical Record - ${record.type}`,
        description: record.complaint,
        status: record.status,
        icon: FileText,
        color: 'purple'
      });
    });

    // Add clinical images
    historyData.clinicalImages.forEach(image => {
      const d = toValidDate(image.date);
      if (!d) return;
      events.push({
        type: 'image',
        date: d,
        title: `Clinical Image - ${image.type}`,
        description: image.caption,
        status: 'Completed',
        icon: Image,
        color: 'orange'
      });
    });

    // Add invoices
    historyData.invoices.forEach(invoice => {
      const d = toValidDate(invoice.issueDate);
      if (!d) return;
      events.push({
        type: 'billing',
        date: d,
        title: `Invoice ${invoice.id}`,
  description: `EGP ${invoice.totalAmount} - ${trInvoiceStatus(invoice.status)}`,
        status: invoice.status,
        icon: DollarSign,
        color: 'red'
      });
    });

    // Add messages
    historyData.messages.forEach(message => {
      const d = toValidDate(message.date);
      if (!d) return;
      events.push({
        type: 'communication',
        date: d,
        title: `${message.type} - ${message.subject}`,
        description: message.snippet,
        status: message.status,
        icon: Mail,
        color: 'blue'
      });
    });

    // Add prescriptions
    historyData.prescriptions.forEach(prescription => {
      const d = toValidDate(prescription.date);
      if (!d) return;
      events.push({
        type: 'prescription',
        date: d,
        title: `Prescription - ${prescription.medication}`,
        description: `${prescription.strength} - ${prescription.dosage}`,
        status: prescription.status,
        icon: Heart,
        color: 'green'
      });
    });

    // Add referrals
    historyData.referrals.forEach(referral => {
      const d = toValidDate(referral.date);
      if (!d) return;
      events.push({
        type: 'referral',
        date: d,
        title: `Referral - ${referral.specialty}`,
        description: `To ${referral.specialist} - ${referral.reason}`,
        status: referral.status,
        icon: TrendingUp,
        color: 'purple'
      });
    });

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const stats = getPatientStats();
  const timeline = getTimelineEvents();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <style dangerouslySetInnerHTML={{ __html: scrollAreaStyles }} />
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
    <DialogContent className="max-w-[96vw] sm:max-w-[92vw] md:max-w-4xl lg:max-w-6xl xl:max-w-7xl h-[95vh] sm:h-[92vh] md:h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col p-2 sm:p-3 md:p-5 lg:p-6" dir="ltr">
      <DialogHeader className={cn("sticky top-0 z-10 bg-background/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm pb-2 sm:pb-3 md:pb-4 border-b shadow-sm", isRTL ? "text-right sm:text-right" : "text-left sm:text-left") }>
          <DialogTitle className={cn("flex items-center gap-2 text-sm sm:text-base md:text-lg", isRTL ? "text-right sm:text-right" : "text-left sm:text-left") }>
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
    <span className="truncate">{t('patients.comprehensive_history_title')} - {patient.name} {patient.lastName}</span>
          </DialogTitle>
          <DialogDescription className={cn("text-xs sm:text-sm", isRTL ? "text-right sm:text-right" : "text-left sm:text-left") }>
    {t('patients.comprehensive_history_desc', { id: patient.id })}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p>{t('patients.loading_history')}</p>
            </div>
          </div>
        ) : historyData && stats ? (
          <div className="flex-1 min-h-0">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-1 sm:p-2 md:p-0">
                {/* Patient Overview Stats */}
              <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-4 overflow-x-auto sm:overflow-visible snap-x sm:snap-none pb-2 sm:pb-0 [-webkit-overflow-scrolling:touch]">
                {/* Stats cards */}
                <Card className="p-2 sm:p-3 min-w-[120px] snap-start">
                  <div className="text-center">
                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.totalVisits}</div>
          <div className="text-xs text-muted-foreground">{t('patients.total_visits')}</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3 min-w-[120px] snap-start">
                  <div className="text-center">
                    <Stethoscope className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.completedTreatments}</div>
          <div className="text-xs text-muted-foreground">{t('treatments.title')}</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3 min-w-[120px] snap-start">
                  <div className="text-center">
                    <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.totalRecords}</div>
          <div className="text-xs text-muted-foreground">{t('patients.records_count_label')}</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3 min-w-[120px] snap-start">
                  <div className="text-center">
                    <Image className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.totalImages}</div>
          <div className="text-xs text-muted-foreground">{t('patients.images_count_label')}</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3 min-w-[120px] snap-start">
                  <div className="text-center">
                    <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-red-600 mx-auto mb-1" />
                    <div className="text-sm sm:text-xl font-bold">{formatEGP(stats.totalSpent, true, language)}</div>
          <div className="text-xs text-muted-foreground">{t('patients.total_paid_label')}</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3 min-w-[120px] snap-start">
                  <div className="text-center">
                    <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.activeClaims}</div>
          <div className="text-xs text-muted-foreground">{t('patients.active_claims')}</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3 min-w-[120px] snap-start">
                  <div className="text-center">
                    <Mail className="h-4 w-4 sm:h-6 sm:w-6 text-cyan-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.totalMessages}</div>
          <div className="text-xs text-muted-foreground">{t('patients.messages')}</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3 min-w-[120px] snap-start">
                  <div className="text-center">
                    <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-pink-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.activePrescriptions}</div>
          <div className="text-xs text-muted-foreground">{t('patients.rx_active')}</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3 min-w-[120px] snap-start">
                  <div className="text-center">
                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-violet-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.totalReferrals}</div>
          <div className="text-xs text-muted-foreground">{t('patients.referrals')}</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3 min-w-[120px] snap-start">
                  <div className="text-center">
                    <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600 mx-auto mb-1" />
                    <div className="text-xs sm:text-sm font-bold">{stats.lastVisit}</div>
          <div className="text-xs text-muted-foreground">{t('patients.last_visit')}</div>
                  </div>
                </Card>
                </div>

              <Tabs defaultValue="timeline" className="w-full mt-1 sm:mt-2">
                {/* Horizontal scrollable tab list */}
                <div className="relative border-b">
                  <div className="w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
                      <TabsList className={cn("inline-flex h-10 items-center rounded-none bg-transparent p-0 w-max", isRTL ? "justify-end" : "justify-start")}> 
            <TabsTrigger value="timeline" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">{t('patients.tabs.timeline')}</TabsTrigger>
            <TabsTrigger value="personal" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">{t('patients.tabs.personal')}</TabsTrigger>
            <TabsTrigger value="family" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">{t('patients.tabs.family')}</TabsTrigger>
            <TabsTrigger value="medical" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">{t('patients.tabs.medical')}</TabsTrigger>
            <TabsTrigger value="dental" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">{t('patients.tabs.dental')}</TabsTrigger>
            <TabsTrigger value="billing" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">{t('patients.tabs.billing')}</TabsTrigger>
            <TabsTrigger value="images" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">{t('patients.tabs.images')}</TabsTrigger>
            <TabsTrigger value="communications" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">{t('patients.tabs.communications')}</TabsTrigger>
            <TabsTrigger value="prescriptions" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">{t('patients.tabs.prescriptions')}</TabsTrigger>
            <TabsTrigger value="referrals" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">{t('patients.tabs.referrals')}</TabsTrigger>
            <TabsTrigger value="labcases" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">{t('patients.tabs.lab_cases')}</TabsTrigger>
                      </TabsList>
                    </div>
                  <div className="sm:hidden text-center py-1 text-xs text-muted-foreground bg-muted/30">
          ← {t('patients.hint.swipe_tabs')} →
                  </div>
                </div>

              {/* Timeline View */}
              <TabsContent value="timeline" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                    <CardHeader className={cn("pb-3 sm:pb-6", isRTL ? "text-right" : undefined)}>
                    <CardTitle className={cn("flex items-center gap-2 text-base sm:text-lg", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                      <History className="h-4 w-4 sm:h-5 sm:w-5" />
                      {t('patients.patient_history')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 sm:h-80 lg:h-96 border rounded-md">
                      <div className="space-y-3 sm:space-y-4 p-3">
                        {timeline.map((event, index) => {
                        const IconComponent = event.icon;
                        return (
                          <div key={index} className={cn(
                            "flex items-start gap-2 sm:gap-3 pb-3 sm:pb-4",
                            isRTL ? "border-r-2 pr-3 sm:pr-4" : "border-l-2 pl-3 sm:pl-4",
                            "border-muted",
                            isRTL ? "flex-row-reverse" : undefined
                          )}>
                            <div className={cn(
                              "rounded-full p-2 mt-1 flex-shrink-0",
                              event.color === 'blue' && "bg-blue-100 text-blue-600",
                              event.color === 'green' && "bg-green-100 text-green-600",
                              event.color === 'purple' && "bg-purple-100 text-purple-600",
                              event.color === 'orange' && "bg-orange-100 text-orange-600",
                              event.color === 'red' && "bg-red-100 text-red-600"
                            )}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={cn("flex items-center justify-between gap-2", isRTL ? "flex-row-reverse" : undefined)}>
                                <p className="font-medium text-sm truncate">{event.title}</p>
                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                  {event.status}
                                </Badge>
                              </div>
                              <p className={cn("text-sm text-muted-foreground mt-1 line-clamp-2", isRTL ? "text-right" : undefined)}>{event.description}</p>
                              <p className={cn("text-xs text-muted-foreground mt-1", isRTL ? "text-right" : undefined)}>
                                {format(event.date, 'PPP')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    </ScrollArea>
          {timeline.length > 5 && (
                      <div className="text-center py-2 text-xs text-muted-foreground border-t mt-2">
            ↕ {t('patients.hint.scroll_vertical_events', { count: timeline.length })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personal Information */}
              <TabsContent value="personal" className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <Card>
                    <CardHeader className={cn("pb-3 sm:pb-6", isRTL ? "text-right" : undefined)}>
                      <CardTitle className={cn("flex items-center gap-2 text-base sm:text-lg", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                        <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        {t('patients.personal_details')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={cn("space-y-2 sm:space-y-3 pt-0", isRTL ? "text-right" : undefined)}>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm truncate">{patient.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span className="text-xs sm:text-sm">{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span className="text-sm">{format(patient.dob, 'PPP')} ({t('patients.years_old', { age: patient.age })})</span>
                      </div>
                      {patient.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{patient.address}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                      <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                        <Heart className="h-5 w-5" />
                        {t('patients.emergency_contact')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={cn("space-y-3", isRTL ? "text-right" : undefined)}>
                      {patient.ecName ? (
                        <>
                          <div>
                            <span className="text-sm font-medium">{t('patients.ec_name')}: </span>
                            <span className="text-sm">{patient.ecName}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">{t('patients.ec_phone')}: </span>
                            <span className="text-sm">{patient.ecPhone}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">{t('patients.relationship')}: </span>
                            <span className="text-sm capitalize">{patient.ecRelationship ? t(`patients.relationship.${patient.ecRelationship}`) : ''}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">{t('patients.no_emergency_contact')}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                      <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                        <Shield className="h-5 w-5" />
                        {t('patients.insurance_information')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={cn("space-y-3", isRTL ? "text-right" : undefined)}>
                      {patient.insuranceProvider ? (
                        <>
                          <div>
                            <span className="text-sm font-medium">{t('patients.insurance_provider')}: </span>
                            <span className="text-sm">{patient.insuranceProvider}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">{t('patients.policy_number')}: </span>
                            <span className="text-sm">{patient.policyNumber}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">{t('patients.no_insurance_info')}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                      <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                        <Activity className="h-5 w-5" />
                        {t('patients.status')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={cn("space-y-3", isRTL ? "text-right" : undefined)}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{t('patients.status')}:</span>
                        <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'}>
                          {t(patient.status === 'Active' ? 'common.active' : 'common.inactive')}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">{t('patients.last_visit')}: </span>
                        <span className="text-sm">{patient.lastVisit}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Medical History */}
                {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                  <Card>
                    <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                      <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                        <Heart className="h-5 w-5" />
                        {t('patients.medical_history')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className={cn(isRTL ? "text-right" : undefined)}>
                      <ul className="list-disc list-inside space-y-1"> 
                        {patient.medicalHistory.map((condition, index) => (
                          <li key={index} className="text-sm">{condition.condition}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Family Members */}
              <TabsContent value="family" className="space-y-3 sm:space-y-4 mt-4">
                <PatientFamily
                  patientId={patient.id}
                  patientName={`${patient.name} ${patient.lastName}`}
                  familyMembers={patient.familyMembers || []}
                  compact={false}
                />
              </TabsContent>

              {/* Medical Records */}
              <TabsContent value="medical" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                    <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                      <FileText className="h-5 w-5" />
                      {t('medical_records.medical_records')} ({historyData.medicalRecords.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80 lg:h-96">
                      {historyData.medicalRecords.length > 0 ? (
                        <div className="space-y-3 p-2">
                          {historyData.medicalRecords
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((record, index) => (
                              <Card 
                                key={index} 
                                className="p-4 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200 group"
                                onClick={() => openDetailDialog('medical-record', record)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">{record.type}</Badge>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{formatDateSafe(record.date, 'PPP')}</span>
                                    <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                  </div>
                                </div>
                                <h4 className="font-medium">{record.complaint}</h4>
                                <p className="text-sm text-muted-foreground">{t('medical_records.provider')}: {record.provider}</p>
                                <Badge className="mt-2" variant={record.status === 'Final' ? 'default' : 'secondary'}>
                                  {trMedicalRecordStatus(record.status)}
                                </Badge>
                              </Card>
                            ))}
                        </div>
                      ) : (
      <div className="text-center py-8 text-muted-foreground">{t('medical_records.no_records_found')}</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Dental Information */}
              <TabsContent value="dental" className="space-y-3 sm:space-y-4 mt-4">
                <ScrollArea className="w-full" orientation="horizontal">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[600px] p-1">
                    <Card>
                      <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                        <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                          <Stethoscope className="h-5 w-5" />
                          {t('treatments.title')} ({historyData.treatments.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className={cn(isRTL ? "text-right" : undefined)}>
                        <ScrollArea className="h-64 lg:h-80">
                          {historyData.treatments.length > 0 ? (
                            <div className="space-y-3 p-2">
                              {historyData.treatments
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((treatment, index) => (
                                  <div 
                                    key={treatment.id || index} 
                                    className="border rounded p-3 hover:bg-muted/50 cursor-pointer transition-colors group"
                                    onClick={() => openDetailDialog('treatment', treatment)}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium text-sm">{treatment.procedure}</h4>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={
                                          treatment.status === 'Completed' ? 'default' :
                                          treatment.status === 'InProgress' ? 'secondary' : 'outline'
                                        }>
                                          {treatment.status}
                                        </Badge>
                                        <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDateSafe(treatment.date, 'PPP')} • {treatment.doctor} • {formatEGP(parseFloat(treatment.cost) || 0, true, language)}
                                    </p>
                                    {treatment.notes && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{treatment.notes}</p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">{t('treatments.toast.error_fetching')}</div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                        <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                          <Calendar className="h-5 w-5" />
                          {t('appointments.title')} ({historyData.appointments.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className={cn(isRTL ? "text-right" : undefined)}>
                        <ScrollArea className="h-64 lg:h-80">
                          {historyData.appointments.length > 0 ? (
                            <div className="space-y-3 p-2">
                              {historyData.appointments
                                .sort((a, b) => new Date(b.dateTime || b.date).getTime() - new Date(a.dateTime || a.date).getTime())
                                .map((appointment, index) => (
                                  <div 
                                    key={appointment.id || index} 
                                    className="border rounded p-3 hover:bg-muted/50 cursor-pointer transition-colors group"
                                    onClick={() => openDetailDialog('appointment', appointment)}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium text-sm">{appointment.type}</h4>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={
                                          appointment.status === 'Completed' ? 'default' :
                                          appointment.status === 'Confirmed' ? 'secondary' :
                                          appointment.status === 'Cancelled' ? 'destructive' : 'outline'
                                        }>
                                          {appointment.status}
                                        </Badge>
                                        <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDateSafe(appointment.dateTime || appointment.date, 'PPP')} • {appointment.doctor} • {appointment.duration}
                                    </p>
                                    {appointment.notes && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{appointment.notes}</p>
                                    )}
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">{t('appointments.no_appointments_found')}</div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
                <div className="md:hidden text-center py-1 text-xs text-muted-foreground bg-muted/30 rounded">
                  ↔ {t('patients.hint.scroll_horizontal_cards')}
                </div>
              </TabsContent>

              {/* Billing Information */}
              <TabsContent value="billing" className="space-y-3 sm:space-y-4 mt-4">
                <ScrollArea className="w-full" orientation="horizontal">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[600px] p-1">
                    <Card>
                      <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                        <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                          <DollarSign className="h-5 w-5" />
                          {t('billing.title')} ({historyData.invoices.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className={cn(isRTL ? "text-right" : undefined)}>
                        <ScrollArea className="h-64 lg:h-80">
                          {historyData.invoices.length > 0 ? (
                            <div className="space-y-3 p-2">
                              {historyData.invoices
                                .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                                .map((invoice, index) => (
                                  <div 
                                    key={invoice.id || index} 
                                    className="border rounded p-3 hover:bg-muted/50 cursor-pointer transition-colors group"
                                    onClick={() => openDetailDialog('invoice', invoice)}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium text-sm">{invoice.id}</h4>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={
                                          invoice.status === 'Paid' ? 'default' :
                                          invoice.status === 'Overdue' ? 'destructive' : 'secondary'
                                        }>
                                          {invoice.status}
                                        </Badge>
                                        <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                      </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <p>{t('common.total')}: {formatEGP(invoice.totalAmount || 0, true, language)}</p>
                                      <p>{t('billing.paid')}: {formatEGP(invoice.amountPaid || 0, true, language)}</p>
                                      <p>Date: {formatDateSafe(invoice.issueDate, 'PPP')}</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">{t('billing.no_invoices_found')}</div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                        <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                          <Shield className="h-5 w-5" />
                          {t('insurance.insurance_claims')} ({historyData.insuranceClaims.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className={cn(isRTL ? "text-right" : undefined)}>
                        <ScrollArea className="h-64 lg:h-80">
                          {historyData.insuranceClaims.length > 0 ? (
                            <div className="space-y-3 p-2">
                              {historyData.insuranceClaims
                                .sort((a, b) => new Date(b.submitDate).getTime() - new Date(a.submitDate).getTime())
                                .map((claim, index) => (
                                  <div 
                                    key={claim.id || index} 
                                    className="border rounded p-3 hover:bg-muted/50 cursor-pointer transition-colors group"
                                    onClick={() => openDetailDialog('insurance-claim', claim)}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium text-sm">{claim.procedure}</h4>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={
                                          claim.status === 'Approved' ? 'default' :
                                          claim.status === 'Denied' ? 'destructive' : 'secondary'
                                        }>
                                          {claim.status}
                                        </Badge>
                                        <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                      </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <p>Insurance: {claim.insurance}</p>
                                      <p>Amount: {claim.amount}</p>
                                      {claim.approvedAmount && <p>Approved: {claim.approvedAmount}</p>}
                                      <p>Submit Date: {claim.submitDate}</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">{t('insurance.no_claims_found')}</div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
                <div className="md:hidden text-center py-1 text-xs text-muted-foreground bg-muted/30 rounded">
                  ↔ {t('patients.hint.scroll_horizontal_cards')}
                </div>
              </TabsContent>

              {/* Clinical Images */}
              <TabsContent value="images" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader className={cn("pb-3 sm:pb-6", isRTL ? "text-right" : undefined)}>
                    <CardTitle className={cn("flex items-center gap-2 text-base sm:text-lg", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                      <Image className="h-4 w-4 sm:h-5 sm:w-5" />
                      {t('dental_chart.clinical_images')} ({historyData.clinicalImages.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 sm:h-80 lg:h-96 border rounded-md">
                      {historyData.clinicalImages.length > 0 ? (
                        <div className="p-3">
                          <ScrollArea className="w-full" orientation="horizontal">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 min-w-max pr-4">
                              {historyData.clinicalImages
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((image, index) => {
                                  const linkedTooth = historyData.toothImageLinks.find(link => link.imageId === image.id);
                                  return (
                                    <Card 
                                      key={index} 
                                      className="p-2 sm:p-3 w-48 flex-shrink-0 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group"
                                      onClick={() => setSelectedImage({
                                        ...image,
                                        toothNumber: linkedTooth?.toothNumber
                                      })}
                                    >
                                      <div className="aspect-square bg-muted rounded-lg mb-2 sm:mb-3 overflow-hidden relative">
                                        <img 
                                          src={image.imageUrl} 
                                          alt={image.caption}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                          <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-1">
                                          <Badge variant="outline" className="text-xs">{image.type}</Badge>
                                          {linkedTooth && (
                                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                              <Activity className="h-3 w-3" />
                                              #{linkedTooth.toothNumber}
                                            </Badge>
                                          )}
                                        </div>
                                        <h4 className="text-sm font-medium line-clamp-2">{image.caption}</h4>
                                        <p className="text-xs text-muted-foreground">{formatDateSafe(image.date, 'PPP')}</p>
                                      </div>
                                    </Card>
                                  );
                                })}
                            </div>
                          </ScrollArea>
                          <div className="text-center py-2 text-xs text-muted-foreground border-t mt-2">
                            ↔ {t('patients.hint.scroll_images_multi', { count: historyData.clinicalImages.length })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">{t('dental_chart.no_clinical_images')}</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Communications/Messages */}
              <TabsContent value="communications" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                    <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                      <Mail className="h-5 w-5" />
                      {t('communications.title')} ({historyData.messages.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80 lg:h-96">
                      {historyData.messages.length > 0 ? (
                        <div className="space-y-3 p-2">
                          {historyData.messages
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((message, index) => (
                              <Card key={index} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">{message.type}</Badge>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={message.priority === 'high' ? 'destructive' : 'secondary'}>
                                      {message.priority}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">{message.date}</span>
                                  </div>
                                </div>
                                <h4 className="font-medium">{message.subject}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{message.snippet}</p>
                                <Badge variant={message.status === 'Sent' ? 'default' : 'secondary'}>
                                  {trMessageStatus(message.status)}
                                </Badge>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">{t('communications.no_messages_found')}</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prescriptions */}
              <TabsContent value="prescriptions" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                    <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                      <Heart className="h-5 w-5" />
                      {t('pharmacy.prescriptions')} ({historyData.prescriptions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80 lg:h-96">
                      {historyData.prescriptions.length > 0 ? (
                        <div className="space-y-3 p-2">
                          {historyData.prescriptions
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((prescription, index) => (
                              <Card 
                                key={index} 
                                className="p-4 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200 group"
                                onClick={() => openDetailDialog('prescription', prescription)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium flex items-center gap-2">
                                    {prescription.medication} {prescription.strength}
                                    <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                  </h4>
                                  <Badge variant={prescription.status === 'Active' ? 'default' : 'secondary'}>
                                    {prescription.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p><strong>{t('pharmacy.dosage')}:</strong> {prescription.dosage}</p>
                                  <p><strong>{t('appointments.duration')}:</strong> {prescription.duration}</p>
                                  <p><strong>{t('pharmacy.refills')}:</strong> {prescription.refills}</p>
                                  <p><strong>{t('appointments.doctor')}:</strong> {prescription.doctor}</p>
                                  <p><strong>{t('common.date')}:</strong> {formatDateSafe(prescription.date, 'PPP')}</p>
                                </div>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">{t('pharmacy.no_prescriptions_found')}</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Referrals */}
              <TabsContent value="referrals" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                    <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                      <TrendingUp className="h-5 w-5" />
                      {t('referrals.specialist_network')} ({historyData.referrals.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80 lg:h-96">
                      {historyData.referrals.length > 0 ? (
                        <div className="space-y-3 p-2">
                          {historyData.referrals
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((referral, index) => (
                              <Card 
                                key={index} 
                                className="p-4 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200 group"
                                onClick={() => openDetailDialog('referral', referral)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium flex items-center gap-2">
                                    {referral.specialist}
                                    <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={referral.urgency === 'urgent' ? 'destructive' : 'secondary'}>
                                      {referral.urgency}
                                    </Badge>
                                    <Badge variant={
                                      referral.status === 'completed' ? 'default' :
                                      referral.status === 'scheduled' ? 'secondary' : 'outline'
                                    }>
                                      {referral.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p><strong>{t('referrals.specialty')}:</strong> {referral.specialty}</p>
                                  <p><strong>{t('referrals.reason')}:</strong> {referral.reason}</p>
                                  <p><strong>{t('referrals.referral_date')}:</strong> {formatDateSafe(referral.date, 'PPP')}</p>
                                  {referral.apptDate && <p><strong>{t('appointments.appointment')}:</strong> {formatDateSafe(referral.apptDate, 'PPP')}</p>}
                                </div>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">{t('referrals.pending_referrals')}</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Lab Cases */}
              <TabsContent value="labcases" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader className={cn(isRTL ? "text-right" : undefined)}>
                    <CardTitle className={cn("flex items-center gap-2", isRTL ? "justify-end text-right flex-row-reverse" : undefined)}>
                      <FlaskConical className="h-5 w-5" />
                      {t('lab.title')} ({historyData.labCases?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80 lg:h-96">
                      {historyData.labCases && historyData.labCases.length > 0 ? (
                        <div className="space-y-3 p-2">
                          {historyData.labCases
                            .sort((a: any, b: any) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
                            .map((labCase: any, index: number) => (
                              <Card 
                                key={index} 
                                className="p-4 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all duration-200 group"
                                onClick={() => openDetailDialog('labCase', labCase)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium flex items-center gap-2">
                                    {labCase.caseNumber} - {labCase.caseType}
                                    <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <Badge variant={
                                      labCase.priority === 'Urgent' ? 'destructive' :
                                      labCase.priority === 'High' ? 'default' : 'secondary'
                                    }>
                                      {t(`lab.priority.${labCase.priority.toLowerCase()}`)}
                                    </Badge>
                                    <Badge variant={
                                      labCase.status === 'Delivered' || labCase.status === 'Completed' ? 'default' :
                                      labCase.status === 'InProgress' || labCase.status === 'QualityCheck' ? 'secondary' :
                                      labCase.status === 'Cancelled' ? 'destructive' : 'outline'
                                    }>
                                      {t(`lab.status.${labCase.status.toLowerCase().replace('inprogress', 'in_progress').replace('qualitycheck', 'quality_check')}`)}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  {labCase.labName && <p><strong>{t('lab.lab')}:</strong> {labCase.labName}</p>}
                                  {labCase.doctorName && <p><strong>{t('lab.doctor')}:</strong> {labCase.doctorName}</p>}
                                  {labCase.toothNumbers && <p><strong>{t('lab.tooth_numbers')}:</strong> {labCase.toothNumbers}</p>}
                                  {labCase.material && <p><strong>{t('lab.material')}:</strong> {labCase.material}</p>}
                                  <p><strong>{t('lab.request_date')}:</strong> {formatDateSafe(labCase.requestDate, 'PPP')}</p>
                                  {labCase.dueDate && <p><strong>{t('lab.due_date')}:</strong> {formatDateSafe(labCase.dueDate, 'PPP')}</p>}
                                  {labCase.estimatedCost && <p><strong>{t('lab.estimated_cost')}:</strong> {formatEGP(labCase.estimatedCost)}</p>}
                                </div>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">{t('lab.no_cases_found')}</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
              </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('patients.no_data_for_patient')}</p>
          </div>
        )}
      </DialogContent>
      
      {/* Detail Dialog for viewing item details */}
      <Dialog open={!!detailDialogType} onOpenChange={() => closeDetailDialog()}>
        <DialogContent className="max-w-lg">
          {selectedItem && (
            <>
              {/* Appointment Detail */}
              {detailDialogType === 'appointment' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      {t('appointments.appointment_details')}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedItem.type} - {formatDateSafe(selectedItem.dateTime || selectedItem.date, 'PPP')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('appointments.type')}</p>
                        <p className="font-medium">{selectedItem.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('appointments.status')}</p>
                        <Badge variant={
                          selectedItem.status === 'Completed' ? 'default' :
                          selectedItem.status === 'Confirmed' ? 'secondary' :
                          selectedItem.status === 'Cancelled' ? 'destructive' : 'outline'
                        }>
                          {selectedItem.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('appointments.doctor')}</p>
                        <p>{selectedItem.doctor}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('appointments.duration')}</p>
                        <p>{selectedItem.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('appointments.date')}</p>
                        <p>{formatDateSafe(selectedItem.dateTime || selectedItem.date, 'PPP p')}</p>
                      </div>
                      {selectedItem.reason && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{t('appointments.reason')}</p>
                          <p>{selectedItem.reason}</p>
                        </div>
                      )}
                    </div>
                    {selectedItem.notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.notes')}</p>
                        <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedItem.notes}</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => closeDetailDialog()}>
                      {t('common.close')}
                    </Button>
                    <Button onClick={() => navigateTo('/appointments')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('appointments.view_all')}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* Treatment Detail */}
              {detailDialogType === 'treatment' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      {t('treatments.treatment_details')}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedItem.procedure}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('treatments.procedure')}</p>
                        <p className="font-medium">{selectedItem.procedure}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('treatments.status')}</p>
                        <Badge variant={
                          selectedItem.status === 'Completed' ? 'default' :
                          selectedItem.status === 'InProgress' ? 'secondary' : 'outline'
                        }>
                          {selectedItem.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('appointments.doctor')}</p>
                        <p>{selectedItem.doctor}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('treatments.cost')}</p>
                        <p className="font-medium">{formatEGP(parseFloat(selectedItem.cost) || 0, true, language)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.date')}</p>
                        <p>{formatDateSafe(selectedItem.date, 'PPP')}</p>
                      </div>
                    </div>
                    {selectedItem.notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.notes')}</p>
                        <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedItem.notes}</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => closeDetailDialog()}>
                      {t('common.close')}
                    </Button>
                    <Button onClick={() => navigateTo('/treatments')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('treatments.view_all')}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* Invoice Detail */}
              {detailDialogType === 'invoice' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-red-600" />
                      {t('billing.invoice_details')}
                    </DialogTitle>
                    <DialogDescription>
                      {t('billing.invoice')} #{selectedItem.id}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('billing.invoice_number')}</p>
                        <p className="font-medium">{selectedItem.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.status')}</p>
                        <Badge variant={
                          selectedItem.status === 'Paid' ? 'default' :
                          selectedItem.status === 'Overdue' ? 'destructive' : 'secondary'
                        }>
                          {selectedItem.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.total')}</p>
                        <p className="font-medium text-lg">{formatEGP(selectedItem.totalAmount || 0, true, language)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('billing.paid')}</p>
                        <p className="font-medium text-lg text-green-600">{formatEGP(selectedItem.amountPaid || 0, true, language)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('billing.outstanding')}</p>
                        <p className="font-medium text-lg text-orange-600">
                          {formatEGP((selectedItem.totalAmount || 0) - (selectedItem.amountPaid || 0), true, language)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('billing.issue_date')}</p>
                        <p>{formatDateSafe(selectedItem.issueDate, 'PPP')}</p>
                      </div>
                    </div>
                    {selectedItem.items && selectedItem.items.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">{t('billing.items')}</p>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                <th className="text-left p-2">{t('common.description')}</th>
                                <th className="text-right p-2">{t('common.qty')}</th>
                                <th className="text-right p-2">{t('billing.price')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedItem.items.map((item: any, idx: number) => (
                                <tr key={idx} className="border-t">
                                  <td className="p-2">{item.description}</td>
                                  <td className="text-right p-2">{item.quantity}</td>
                                  <td className="text-right p-2">{formatEGP(Number(item.total) || 0, true, language)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => closeDetailDialog()}>
                      {t('common.close')}
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                      <Printer className="h-4 w-4 mr-2" />
                      {t('common.print')}
                    </Button>
                    <Button onClick={() => navigateTo('/billing')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('billing.view_all')}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* Insurance Claim Detail */}
              {detailDialogType === 'insurance-claim' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-indigo-600" />
                      {t('insurance.claim_details')}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedItem.procedure}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('insurance.procedure')}</p>
                        <p className="font-medium">{selectedItem.procedure}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.status')}</p>
                        <Badge variant={
                          selectedItem.status === 'Approved' ? 'default' :
                          selectedItem.status === 'Denied' ? 'destructive' : 'secondary'
                        }>
                          {selectedItem.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('insurance.provider')}</p>
                        <p>{selectedItem.insurance}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('insurance.claim_amount')}</p>
                        <p className="font-medium">{formatEGP(selectedItem.amount || 0, true, language)}</p>
                      </div>
                      {selectedItem.approvedAmount && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{t('insurance.approved_amount')}</p>
                          <p className="font-medium text-green-600">{formatEGP(selectedItem.approvedAmount, true, language)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('insurance.submit_date')}</p>
                        <p>{formatDateSafe(selectedItem.submitDate, 'PPP')}</p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => closeDetailDialog()}>
                      {t('common.close')}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* Medical Record Detail */}
              {detailDialogType === 'medical-record' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      {t('medical_records.record_details')}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedItem.type} - {formatDateSafe(selectedItem.date, 'PPP')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('medical_records.type')}</p>
                        <p className="font-medium">{selectedItem.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.status')}</p>
                        <Badge variant={selectedItem.status === 'Final' ? 'default' : 'secondary'}>
                          {trMedicalRecordStatus(selectedItem.status)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('medical_records.provider')}</p>
                        <p>{selectedItem.provider}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.date')}</p>
                        <p>{formatDateSafe(selectedItem.date, 'PPP')}</p>
                      </div>
                    </div>
                    {selectedItem.complaint && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('medical_records.complaint')}</p>
                        <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedItem.complaint}</p>
                      </div>
                    )}
                    {selectedItem.notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.notes')}</p>
                        <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedItem.notes}</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => closeDetailDialog()}>
                      {t('common.close')}
                    </Button>
                    <Button onClick={() => navigateTo('/medical-records')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('medical_records.view_all')}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* Prescription Detail */}
              {detailDialogType === 'prescription' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pink-600" />
                      {t('pharmacy.prescription_details')}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedItem.medication} {selectedItem.strength}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('pharmacy.medication')}</p>
                        <p className="font-medium">{selectedItem.medication}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.status')}</p>
                        <Badge variant={selectedItem.status === 'Active' ? 'default' : 'secondary'}>
                          {selectedItem.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('pharmacy.strength')}</p>
                        <p>{selectedItem.strength}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('pharmacy.dosage')}</p>
                        <p>{selectedItem.dosage}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('appointments.duration')}</p>
                        <p>{selectedItem.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('pharmacy.refills')}</p>
                        <p>{selectedItem.refills}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('appointments.doctor')}</p>
                        <p>{selectedItem.doctor}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.date')}</p>
                        <p>{formatDateSafe(selectedItem.date, 'PPP')}</p>
                      </div>
                    </div>
                    {selectedItem.instructions && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('pharmacy.instructions')}</p>
                        <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedItem.instructions}</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => closeDetailDialog()}>
                      {t('common.close')}
                    </Button>
                    <Button onClick={() => navigateTo('/pharmacy')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('pharmacy.view_all')}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {/* Referral Detail */}
              {detailDialogType === 'referral' && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-violet-600" />
                      {t('referrals.referral_details')}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedItem.specialty} - {selectedItem.specialist}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('referrals.specialty')}</p>
                        <p className="font-medium">{selectedItem.specialty}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('common.status')}</p>
                        <Badge variant={
                          selectedItem.status === 'completed' ? 'default' :
                          selectedItem.status === 'scheduled' ? 'secondary' : 'outline'
                        }>
                          {selectedItem.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('referrals.specialist')}</p>
                        <p>{selectedItem.specialist}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('referrals.urgency')}</p>
                        <Badge variant={selectedItem.urgency === 'urgent' ? 'destructive' : 'secondary'}>
                          {selectedItem.urgency}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{t('referrals.referral_date')}</p>
                        <p>{formatDateSafe(selectedItem.date, 'PPP')}</p>
                      </div>
                      {selectedItem.apptDate && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{t('appointments.appointment')}</p>
                          <p>{formatDateSafe(selectedItem.apptDate, 'PPP')}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('referrals.reason')}</p>
                      <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedItem.reason}</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => closeDetailDialog()}>
                      {t('common.close')}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          {selectedImage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-orange-600" />
                  {selectedImage.type}
                </DialogTitle>
                <DialogDescription>
                  {selectedImage.caption}
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center py-4">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.caption}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {formatDateSafe(selectedImage.date, 'PPP')}
                  {selectedImage.toothNumber && ` • Tooth #${selectedImage.toothNumber}`}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedImage(null)}>
                    {t('common.close')}
                  </Button>
                  <Button variant="outline" onClick={() => window.open(selectedImage.imageUrl, '_blank')}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('common.download')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
