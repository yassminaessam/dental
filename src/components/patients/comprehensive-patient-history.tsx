'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
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
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getCollection } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Patient } from '@/app/patients/page';

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

  // Use external control if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const onOpenChange = externalOnOpenChange || setInternalOpen;

  const fetchPatientHistory = async () => {
    if (!patient) return;
    
    setLoading(true);
    try {
      const [
        appointments,
        treatments,
        medicalRecords,
        clinicalImages,
        invoices,
        insuranceClaims,
        toothImageLinks,
        messages,
        prescriptions,
        referrals
      ] = await Promise.all([
        getCollection('appointments'),
        getCollection('treatments'),
        getCollection('medical-records'),
        getCollection('clinical-images'),
        getCollection('invoices'),
        getCollection('insurance-claims'),
        getCollection('tooth-image-links'),
        getCollection('messages'),
        getCollection('prescriptions'),
        getCollection('referrals')
      ]);

      // Filter data by patient
      const patientData: PatientHistoryData = {
        appointments: (appointments as any[]).filter((apt: any) => apt.patient === patient.name),
        treatments: (treatments as any[]).filter((t: any) => t.patient === patient.name),
        medicalRecords: (medicalRecords as any[]).filter((r: any) => r.patient === patient.name),
        clinicalImages: (clinicalImages as any[]).filter((img: any) => img.patient === patient.name),
        invoices: (invoices as any[]).filter((inv: any) => inv.patientId === patient.id || inv.patient === patient.name),
        insuranceClaims: (insuranceClaims as any[]).filter((claim: any) => claim.patientId === patient.id || claim.patient === patient.name),
        toothImageLinks: (toothImageLinks as any[]).filter((link: any) => link.patient === patient.name),
        messages: (messages as any[]).filter((msg: any) => msg.patient === patient.name),
        prescriptions: (prescriptions as any[]).filter((rx: any) => rx.patient === patient.name),
        referrals: (referrals as any[]).filter((ref: any) => ref.patient === patient.name)
      };

      setHistoryData(patientData);
    } catch (error) {
      console.error('Error fetching patient history:', error);
      toast({
        title: "Error Loading Patient History",
        description: "Failed to load comprehensive patient data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && patient) {
      fetchPatientHistory();
    }
  }, [open, patient]);

  const getPatientStats = () => {
    if (!historyData) return null;

    const totalVisits = historyData.appointments.length;
    const completedTreatments = historyData.treatments.filter(t => t.status === 'Completed').length;
    const totalSpent = historyData.invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const lastVisit = historyData.appointments
      .sort((a, b) => new Date(b.dateTime || b.date).getTime() - new Date(a.dateTime || a.date).getTime())[0];

    return {
      totalVisits,
      completedTreatments,
      totalSpent,
      lastVisit: lastVisit ? format(new Date(lastVisit.dateTime || lastVisit.date), 'PPP') : 'Never',
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
      events.push({
        type: 'appointment',
        date: new Date(apt.dateTime || apt.date),
        title: `Appointment - ${apt.type}`,
        description: `${apt.duration} with ${apt.doctor}`,
        status: apt.status,
        icon: Calendar,
        color: 'blue'
      });
    });

    // Add treatments
    historyData.treatments.forEach(treatment => {
      events.push({
        type: 'treatment',
        date: new Date(treatment.date),
        title: `Treatment - ${treatment.procedure}`,
        description: `${treatment.cost} with ${treatment.doctor}`,
        status: treatment.status,
        icon: Stethoscope,
        color: 'green'
      });
    });

    // Add medical records
    historyData.medicalRecords.forEach(record => {
      events.push({
        type: 'record',
        date: new Date(record.date),
        title: `Medical Record - ${record.type}`,
        description: record.complaint,
        status: record.status,
        icon: FileText,
        color: 'purple'
      });
    });

    // Add clinical images
    historyData.clinicalImages.forEach(image => {
      events.push({
        type: 'image',
        date: new Date(image.date),
        title: `Clinical Image - ${image.type}`,
        description: image.caption,
        status: 'Completed',
        icon: Image,
        color: 'orange'
      });
    });

    // Add invoices
    historyData.invoices.forEach(invoice => {
      events.push({
        type: 'billing',
        date: new Date(invoice.issueDate),
        title: `Invoice ${invoice.id}`,
        description: `EGP ${invoice.totalAmount} - ${invoice.status}`,
        status: invoice.status,
        icon: DollarSign,
        color: 'red'
      });
    });

    // Add messages
    historyData.messages.forEach(message => {
      events.push({
        type: 'communication',
        date: new Date(message.date),
        title: `${message.type} - ${message.subject}`,
        description: message.snippet,
        status: message.status,
        icon: Mail,
        color: 'blue'
      });
    });

    // Add prescriptions
    historyData.prescriptions.forEach(prescription => {
      events.push({
        type: 'prescription',
        date: new Date(prescription.date),
        title: `Prescription - ${prescription.medication}`,
        description: `${prescription.strength} - ${prescription.dosage}`,
        status: prescription.status,
        icon: Heart,
        color: 'green'
      });
    });

    // Add referrals
    historyData.referrals.forEach(referral => {
      events.push({
        type: 'referral',
        date: new Date(referral.date),
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
      <DialogContent className="max-w-[98vw] sm:max-w-6xl lg:max-w-7xl h-[98vh] sm:h-[90vh] overflow-hidden flex flex-col p-2 sm:p-4 lg:p-6">
        <DialogHeader className="flex-shrink-0 pb-2 sm:pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Comprehensive Patient History - {patient.name} {patient.lastName}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Complete medical, dental, and billing history for patient ID: {patient.id}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading comprehensive patient history...</p>
            </div>
          </div>
        ) : historyData && stats ? (
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="space-y-3 sm:space-y-4 lg:space-y-6 p-1 pr-4">
                {/* Patient Overview Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2 sm:gap-4">
                <Card className="p-2 sm:p-3">
                  <div className="text-center">
                    <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.totalVisits}</div>
                    <div className="text-xs text-muted-foreground">Total Visits</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3">
                  <div className="text-center">
                    <Stethoscope className="h-4 w-4 sm:h-6 sm:w-6 text-green-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.completedTreatments}</div>
                    <div className="text-xs text-muted-foreground">Treatments</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3">
                  <div className="text-center">
                    <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.totalRecords}</div>
                    <div className="text-xs text-muted-foreground">Records</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3">
                  <div className="text-center">
                    <Image className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.totalImages}</div>
                    <div className="text-xs text-muted-foreground">Images</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3">
                  <div className="text-center">
                    <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-red-600 mx-auto mb-1" />
                    <div className="text-sm sm:text-xl font-bold">EGP {stats.totalSpent.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Total Paid</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3">
                  <div className="text-center">
                    <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.activeClaims}</div>
                    <div className="text-xs text-muted-foreground">Active Claims</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3">
                  <div className="text-center">
                    <Mail className="h-4 w-4 sm:h-6 sm:w-6 text-cyan-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.totalMessages}</div>
                    <div className="text-xs text-muted-foreground">Messages</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3">
                  <div className="text-center">
                    <Heart className="h-4 w-4 sm:h-6 sm:w-6 text-pink-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.activePrescriptions}</div>
                    <div className="text-xs text-muted-foreground">Rx Active</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3">
                  <div className="text-center">
                    <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-violet-600 mx-auto mb-1" />
                    <div className="text-lg sm:text-xl font-bold">{stats.totalReferrals}</div>
                    <div className="text-xs text-muted-foreground">Referrals</div>
                  </div>
                </Card>
                <Card className="p-2 sm:p-3">
                  <div className="text-center">
                    <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600 mx-auto mb-1" />
                    <div className="text-xs sm:text-sm font-bold">{stats.lastVisit}</div>
                    <div className="text-xs text-muted-foreground">Last Visit</div>
                  </div>
                </Card>
              </div>

              <Tabs defaultValue="timeline" className="w-full">
                {/* Horizontal scrollable tab list */}
                <div className="relative border-b">
                  <ScrollArea className="w-full" orientation="horizontal">
                    <div className="w-full overflow-x-auto">
                      <TabsList className="inline-flex h-10 items-center justify-start rounded-none bg-transparent p-0 w-max min-w-full">
                        <TabsTrigger value="timeline" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Timeline</TabsTrigger>
                        <TabsTrigger value="personal" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Personal</TabsTrigger>
                        <TabsTrigger value="medical" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Medical</TabsTrigger>
                        <TabsTrigger value="dental" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Dental</TabsTrigger>
                        <TabsTrigger value="billing" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Billing</TabsTrigger>
                        <TabsTrigger value="images" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Images</TabsTrigger>
                        <TabsTrigger value="communications" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Messages</TabsTrigger>
                        <TabsTrigger value="prescriptions" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Prescriptions</TabsTrigger>
                        <TabsTrigger value="referrals" className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap">Referrals</TabsTrigger>
                      </TabsList>
                    </div>
                  </ScrollArea>
                  <div className="sm:hidden text-center py-1 text-xs text-muted-foreground bg-muted/30">
                    ← Swipe tabs horizontally →
                  </div>
                </div>

              {/* Timeline View */}
              <TabsContent value="timeline" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <History className="h-4 w-4 sm:h-5 sm:w-5" />
                      Patient Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64 sm:h-80 lg:h-96 border rounded-md">
                      <div className="space-y-3 sm:space-y-4 p-3">
                        {timeline.map((event, index) => {
                        const IconComponent = event.icon;
                        return (
                          <div key={index} className="flex items-start gap-2 sm:gap-3 border-l-2 border-muted pl-3 sm:pl-4 pb-3 sm:pb-4">
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
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-medium text-sm truncate">{event.title}</p>
                                <Badge variant="outline" className="text-xs whitespace-nowrap">
                                  {event.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
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
                        ↕ Scroll vertically to see all {timeline.length} timeline events
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personal Information */}
              <TabsContent value="personal" className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        Personal Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 pt-0">
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
                        <span className="text-sm">{format(patient.dob, 'PPP')} ({patient.age} years old)</span>
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
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Emergency Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {patient.ecName ? (
                        <>
                          <div>
                            <span className="text-sm font-medium">Name: </span>
                            <span className="text-sm">{patient.ecName}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Phone: </span>
                            <span className="text-sm">{patient.ecPhone}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Relationship: </span>
                            <span className="text-sm capitalize">{patient.ecRelationship}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">No emergency contact information</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Insurance Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {patient.insuranceProvider ? (
                        <>
                          <div>
                            <span className="text-sm font-medium">Provider: </span>
                            <span className="text-sm">{patient.insuranceProvider}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Policy Number: </span>
                            <span className="text-sm">{patient.policyNumber}</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">No insurance information</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Patient Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={patient.status === 'Active' ? 'default' : 'secondary'}>
                          {patient.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Last Visit: </span>
                        <span className="text-sm">{patient.lastVisit}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Medical History */}
                {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Medical History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-1">
                        {patient.medicalHistory.map((condition, index) => (
                          <li key={index} className="text-sm">{condition.condition}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Medical Records */}
              <TabsContent value="medical" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Medical Records ({historyData.medicalRecords.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80 lg:h-96">
                      {historyData.medicalRecords.length > 0 ? (
                        <div className="space-y-3 p-2">
                          {historyData.medicalRecords
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((record, index) => (
                              <Card key={index} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge variant="outline">{record.type}</Badge>
                                  <span className="text-xs text-muted-foreground">{record.date}</span>
                                </div>
                                <h4 className="font-medium">{record.complaint}</h4>
                                <p className="text-sm text-muted-foreground">Provider: {record.provider}</p>
                                <Badge className="mt-2" variant={record.status === 'Final' ? 'default' : 'secondary'}>
                                  {record.status}
                                </Badge>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No medical records found</div>
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
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Stethoscope className="h-5 w-5" />
                          Treatments ({historyData.treatments.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-64 lg:h-80">
                          {historyData.treatments.length > 0 ? (
                            <div className="space-y-3 p-2">
                              {historyData.treatments
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((treatment, index) => (
                                  <div key={index} className="border rounded p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium text-sm">{treatment.procedure}</h4>
                                      <Badge variant={
                                        treatment.status === 'Completed' ? 'default' :
                                        treatment.status === 'In Progress' ? 'secondary' : 'outline'
                                      }>
                                        {treatment.status}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {treatment.date} • {treatment.doctor} • {treatment.cost}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">No treatments found</div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Appointments ({historyData.appointments.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-64 lg:h-80">
                          {historyData.appointments.length > 0 ? (
                            <div className="space-y-3 p-2">
                              {historyData.appointments
                                .sort((a, b) => new Date(b.dateTime || b.date).getTime() - new Date(a.dateTime || a.date).getTime())
                                .map((appointment, index) => (
                                  <div key={index} className="border rounded p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium text-sm">{appointment.type}</h4>
                                      <Badge variant={
                                        appointment.status === 'Completed' ? 'default' :
                                        appointment.status === 'Confirmed' ? 'secondary' :
                                        appointment.status === 'Cancelled' ? 'destructive' : 'outline'
                                      }>
                                        {appointment.status}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {format(new Date(appointment.dateTime || appointment.date), 'PPP')} • {appointment.doctor} • {appointment.duration}
                                    </p>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">No appointments found</div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
                <div className="md:hidden text-center py-1 text-xs text-muted-foreground bg-muted/30 rounded">
                  ↔ Scroll horizontally to see all cards
                </div>
              </TabsContent>

              {/* Billing Information */}
              <TabsContent value="billing" className="space-y-3 sm:space-y-4 mt-4">
                <ScrollArea className="w-full" orientation="horizontal">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[600px] p-1">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Invoices ({historyData.invoices.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-64 lg:h-80">
                          {historyData.invoices.length > 0 ? (
                            <div className="space-y-3 p-2">
                              {historyData.invoices
                                .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                                .map((invoice, index) => (
                                  <div key={index} className="border rounded p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium text-sm">{invoice.id}</h4>
                                      <Badge variant={
                                        invoice.status === 'Paid' ? 'default' :
                                        invoice.status === 'Overdue' ? 'destructive' : 'secondary'
                                      }>
                                        {invoice.status}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <p>Total: EGP {invoice.totalAmount?.toFixed(2) || '0.00'}</p>
                                      <p>Paid: EGP {invoice.amountPaid?.toFixed(2) || '0.00'}</p>
                                      <p>Date: {invoice.issueDate}</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">No invoices found</div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Insurance Claims ({historyData.insuranceClaims.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-64 lg:h-80">
                          {historyData.insuranceClaims.length > 0 ? (
                            <div className="space-y-3 p-2">
                              {historyData.insuranceClaims
                                .sort((a, b) => new Date(b.submitDate).getTime() - new Date(a.submitDate).getTime())
                                .map((claim, index) => (
                                  <div key={index} className="border rounded p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <h4 className="font-medium text-sm">{claim.procedure}</h4>
                                      <Badge variant={
                                        claim.status === 'Approved' ? 'default' :
                                        claim.status === 'Denied' ? 'destructive' : 'secondary'
                                      }>
                                        {claim.status}
                                      </Badge>
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
                            <div className="text-center py-8 text-muted-foreground">No insurance claims found</div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
                <div className="md:hidden text-center py-1 text-xs text-muted-foreground bg-muted/30 rounded">
                  ↔ Scroll horizontally to see all cards
                </div>
              </TabsContent>

              {/* Clinical Images */}
              <TabsContent value="images" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Image className="h-4 w-4 sm:h-5 sm:w-5" />
                      Clinical Images ({historyData.clinicalImages.length})
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
                                    <Card key={index} className="p-2 sm:p-3 w-48 flex-shrink-0">
                                      <div className="aspect-square bg-muted rounded-lg mb-2 sm:mb-3 overflow-hidden">
                                        <img 
                                          src={image.imageUrl} 
                                          alt={image.caption}
                                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                        />
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
                                        <p className="text-xs text-muted-foreground">{image.date}</p>
                                      </div>
                                    </Card>
                                  );
                                })}
                            </div>
                          </ScrollArea>
                          <div className="text-center py-2 text-xs text-muted-foreground border-t mt-2">
                            ↔ Scroll horizontally and ↕ vertically to see all {historyData.clinicalImages.length} images
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No clinical images found</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Communications/Messages */}
              <TabsContent value="communications" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Communications ({historyData.messages.length})
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
                                  {message.status}
                                </Badge>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No messages found</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prescriptions */}
              <TabsContent value="prescriptions" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Prescriptions ({historyData.prescriptions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80 lg:h-96">
                      {historyData.prescriptions.length > 0 ? (
                        <div className="space-y-3 p-2">
                          {historyData.prescriptions
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((prescription, index) => (
                              <Card key={index} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{prescription.medication} {prescription.strength}</h4>
                                  <Badge variant={prescription.status === 'Active' ? 'default' : 'secondary'}>
                                    {prescription.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p><strong>Dosage:</strong> {prescription.dosage}</p>
                                  <p><strong>Duration:</strong> {prescription.duration}</p>
                                  <p><strong>Refills:</strong> {prescription.refills}</p>
                                  <p><strong>Prescribed by:</strong> {prescription.doctor}</p>
                                  <p><strong>Date:</strong> {prescription.date}</p>
                                </div>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No prescriptions found</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Referrals */}
              <TabsContent value="referrals" className="space-y-3 sm:space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Specialist Referrals ({historyData.referrals.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80 lg:h-96">
                      {historyData.referrals.length > 0 ? (
                        <div className="space-y-3 p-2">
                          {historyData.referrals
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((referral, index) => (
                              <Card key={index} className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{referral.specialist}</h4>
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
                                  <p><strong>Specialty:</strong> {referral.specialty}</p>
                                  <p><strong>Reason:</strong> {referral.reason}</p>
                                  <p><strong>Referral Date:</strong> {referral.date}</p>
                                  {referral.apptDate && <p><strong>Appointment:</strong> {referral.apptDate}</p>}
                                </div>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">No referrals found</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No data available for this patient</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
