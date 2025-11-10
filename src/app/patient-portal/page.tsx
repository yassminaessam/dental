
'use client';

import React, { Suspense } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Settings, Search, User, Eye, Reply, Circle, CheckCircle2, Check, X, FileText, Trash2, KeyRound, Loader2, Globe, Sparkles, Users } from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import { NewMessageDialog } from "@/components/communications/new-message-dialog";
import { useToast } from '@/hooks/use-toast';
import { ViewMessageDialog } from '@/components/patient-portal/view-message-dialog';
import type { Appointment } from '@/app/appointments/page';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { listDocuments, updateDocument, deleteDocument, setDocument } from '@/lib/data-client';
import type { Message } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminContent from '@/components/patient-portal/AdminContent';
import { useSearchParams, useRouter } from 'next/navigation';


export type PortalUser = {
    id: string;
    name: string;
    email: string;
    status: 'Active' | 'Deactivated';
    lastLogin: string;
};

export type SharedDocument = {
    id: string;
    name: string;
    patient: string;
    type: 'Treatment Plan' | 'Invoice' | 'Lab Result';
    sharedDate: string;
};

function TabSync({ onTab }: { onTab: (value: string) => void }) {
  const searchParams = useSearchParams();
  React.useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab) onTab(tab);
  }, [searchParams, onTab]);
  return null;
}

export default function PatientPortalPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('messages');
  const router = useRouter();
  
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = React.useState<Message | null>(null);
  const [isReplyOpen, setIsReplyOpen] = React.useState(false);
  const [replyData, setReplyData] = React.useState<{ patientName: string; subject: string, originalMessage: string } | null>(null);

  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [portalUsers, setPortalUsers] = React.useState<PortalUser[]>([]);
  const [sharedDocuments, setSharedDocuments] = React.useState<SharedDocument[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [msgData, apptData, userData, docData] = await Promise.all([
          listDocuments<Message>('messages'),
          listDocuments<Appointment>('appointments'),
          listDocuments<PortalUser>('portal-users'),
          listDocuments<SharedDocument>('shared-documents'),
        ]);
        setMessages(msgData.filter(m => m.category === 'billing' || m.category === 'other'));
        setAppointments(apptData.map(a => ({...a, dateTime: new Date(a.dateTime) })));
        setPortalUsers(userData);
        setSharedDocuments(docData);
      } catch (error) {
        toast({ title: t('patient_portal.toast.error_fetching'), variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast, t]);

  // Sync tab from URL using Suspense-wrapped client effect
  // This avoids the Next.js CSR bailout error during prerender
  // by ensuring useSearchParams() runs inside a Suspense boundary.

  const onTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', value);
      router.replace(url.pathname + '?' + url.searchParams.toString());
    }
  };


  const pendingRequests = React.useMemo(() => {
    return appointments.filter(appt => appt.status === 'Pending');
  }, [appointments]);

  const patientPortalPageStats = React.useMemo(() => {
    const unreadMessages = messages.filter(m => m.status === 'Unread').length;
    return [
      { title: t('patient_portal.active_portal_users'), value: portalUsers.length, description: t('patient_portal.patients_with_portal_access') },
      { title: t('patient_portal.unread_messages'), value: unreadMessages, description: t('patient_portal.new_messages_from_patients'), valueClassName: "text-orange-500" },
      { title: t('patient_portal.pending_requests'), value: pendingRequests.length, description: t('patient_portal.appointment_requests_to_review'), valueClassName: "text-red-500" },
      { title: t('patient_portal.shared_documents'), value: sharedDocuments.length, description: t('patient_portal.documents_available_to_patients') },
    ];
  }, [messages, portalUsers, pendingRequests, sharedDocuments, t]);


  const handleRequestStatusChange = async (appointmentId: string, newStatus: 'Confirmed' | 'Cancelled') => {
    try {
        await updateDocument('appointments', appointmentId, { status: newStatus });
        setAppointments(prev => prev.map(appt =>
          appt.id === appointmentId ? { ...appt, status: newStatus } : appt
        ));
        toast({
          title: t('patient_portal.toast.request_updated'),
          description: t('patient_portal.toast.request_updated_desc'),
          variant: newStatus === 'Cancelled' ? 'destructive' : undefined,
        });
    } catch (error) {
        toast({ title: t('patient_portal.toast.error_updating_request'), variant: 'destructive' });
    }
  };

  const handleReply = (message: Message) => {
    setReplyData({
      patientName: message.patient,
      subject: `Re: ${message.subject}`,
      originalMessage: message.fullMessage || '',
    });
    setIsReplyOpen(true);
  };
  
  const handleSendMessage = async (data: any) => {
    try {
      const newMessage: Message = {
        id: `MSG-${Date.now()}`,
        patient: data.patient,
        type: data.type,
        status: 'Sent',
        sent: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        subject: data.subject,
        content: data.subject,
        subContent: data.message,
        snippet: data.message.substring(0, 50) + '...',
        fullMessage: data.message,
        category: 'other', // Default category for staff-initiated messages
        priority: 'normal',
      };
      await setDocument('messages', newMessage.id, newMessage);
      toast({
        title: t('patient_portal.toast.message_sent'),
        description: t('patient_portal.toast.message_sent_desc'),
      });
    } catch(e) {
        toast({ title: t('patient_portal.toast.error_sending_message'), variant: 'destructive' });
    }
  };

  const handleUserStatusChange = async (userId: string) => {
    const user = portalUsers.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'Active' ? 'Deactivated' : 'Active';
    try {
        await updateDocument('portal-users', userId, { status: newStatus });
        setPortalUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        toast({
          title: t('patient_portal.toast.user_status_updated'),
          description: t('patient_portal.toast.user_status_updated_desc'),
          variant: newStatus === 'Deactivated' ? 'destructive' : undefined
        });
    } catch (e) {
        toast({ title: t('patient_portal.toast.error_updating_user_status'), variant: 'destructive' });
    }
  };

  const handleResetPassword = (userName: string) => {
    toast({
      title: t('patient_portal.toast.notification_sent'),
      description: t('patient_portal.toast.notification_sent_desc')
    });
  };

  const handleRevokeDocument = async (docId: string) => {
    const doc = sharedDocuments.find(d => d.id === docId);
    if (!doc) return;
    try {
        await deleteDocument('shared-documents', docId);
        setSharedDocuments(prev => prev.filter(d => d.id !== docId));
        toast({
          title: t('patient_portal.toast.document_revoked'),
          description: t('patient_portal.toast.document_revoked_desc'),
          variant: "destructive",
        });
    } catch (e) {
        toast({ title: t('patient_portal.toast.error_revoking_document'), variant: 'destructive' });
    }
  };
  
  const handleSaveChanges = () => {
    toast({
      title: t('settings.toast.settings_saved'),
      description: t('settings.toast.settings_saved_desc'),
    });
  };


  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto relative">
        {/* Sync tab from URL */}
        <Suspense fallback={null}>
          <TabSync onTab={setActiveTab} />
        </Suspense>

        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 via-indigo-200/20 to-purple-200/10 dark:from-blue-900/15 dark:via-indigo-900/10 dark:to-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-200/30 via-pink-200/20 to-rose-200/10 dark:from-purple-900/15 dark:via-pink-900/10 dark:to-rose-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Ultra Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* Left side: Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white shadow-xl">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">Patient Portal</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient">
                    {t('patient_portal.management_title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('patient_portal.management_subtitle')}
                  </p>
                </div>
              </div>

              {/* Right side: Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => onTabChange('settings')} 
                  className="h-11 px-6 rounded-xl font-bold border-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t('patient_portal.portal_settings')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onTabChange('content-admin')} 
                  className="h-11 px-6 rounded-xl font-bold border-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all duration-300"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  {t('patient_portal_admin.portal_content_settings')}
                </Button>
                <NewMessageDialog 
                  onSend={handleSendMessage}
                  triggerButtonText={t('patient_portal.send_message')}
                  dialogTitle={t('patient_portal.dialog.send_new_message.title')}
                  dialogDescription={t('patient_portal.dialog.send_new_message.description')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ultra Enhanced Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {patientPortalPageStats.map((stat, index) => {
            const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-orange', 'metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer group",
                  cardStyle
                )}
              >
                {/* Animated Background Layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                        {stat.title}
                      </CardTitle>
                      <div className={cn("text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-md mb-2 group-hover:scale-110 transition-transform duration-300")}>
                        {stat.value}
                      </div>
                    </div>
                    <CardIcon 
                      variant={(['blue', 'green', 'orange', 'purple'] as const)[index % 4]}
                      size="lg"
                      className="group-hover:rotate-12"
                      aria-hidden="true"
                    >
                      <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    </CardIcon>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 relative z-10">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-3">
                    {stat.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500 dark:bg-gray-400 animate-pulse" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('patient_portal.online')}</span>
                    <div className="ml-auto">
                      <div className="text-xs text-white/60 font-bold">↗</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Elite Patient Portal Tabs */}
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="bg-background/60 backdrop-blur-sm border border-border/50 p-1 rounded-xl grid w-full grid-cols-2 md:w-auto md:grid-cols-6">
            <TabsTrigger 
              value="messages" 
              className="rounded-lg px-4 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('patient_portal.tabs.messages')}
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="rounded-lg px-4 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('patient_portal.tabs.requests')}
              {pendingRequests.length > 0 && <Badge className="ml-2 bg-primary text-primary-foreground">{pendingRequests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="rounded-lg px-4 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('patient_portal.tabs.users')}
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="rounded-lg px-4 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('patient_portal.tabs.documents')}
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="rounded-lg px-4 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('patient_portal.tabs.settings')}
            </TabsTrigger>
            <TabsTrigger 
              value="content-admin" 
              className="rounded-lg px-4 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
            >
              {t('patient_portal_admin.tabs.content')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="messages" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>{t('patient_portal.section.patient_messages')}</CardTitle>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t('patient_portal.search_messages')}
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">{t('patient_portal.table.patient')}</TableHead>
                      <TableHead>{t('patient_portal.table.subject')}</TableHead>
                      <TableHead>{t('patient_portal.table.category')}</TableHead>
                      <TableHead>{t('patient_portal.table.priority')}</TableHead>
                      <TableHead>{t('patient_portal.table.date')}</TableHead>
                      <TableHead>{t('patient_portal.table.status')}</TableHead>
                      <TableHead className="text-right">{t('patient_portal.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                    ) : messages.length > 0 ? (
                      messages.map((message) => (
                        <TableRow key={message.id} className={message.status === 'Unread' ? 'bg-accent/10' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-2 font-medium">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{message.patient}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{message.subject}</div>
                            <div className="text-sm text-muted-foreground">{message.snippet}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{t(`patient_portal.category.${message.category}`) || message.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={message.priority === 'high' ? 'destructive' : 'secondary'}
                              className="capitalize"
                            >
                              {message.priority === 'high' ? t('patient_portal.priority.high') : t('patient_portal.priority.normal')}
                            </Badge>
                          </TableCell>
                          <TableCell>{message.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                                {message.status === 'Unread' ? 
                                    <Circle className="h-3 w-3 text-primary fill-primary" /> : 
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                }
                                <span>{message.status === 'Unread' ? t('patient_portal.message_status.unread') : t('patient_portal.message_status.sent')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedMessage(message)}>
                                <Eye className="mr-2 h-3 w-3" />
                                {t('patient_portal.actions.view')}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleReply(message)}>
                                <Reply className="mr-2 h-3 w-3" />
                                {t('patient_portal.actions.reply')}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          {t('patient_portal.empty.no_messages')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="requests" className="mt-4">
             <Card>
                <CardHeader>
                  <CardTitle>{t('patient_portal.section.pending_requests')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('patient_portal.table.patient')}</TableHead>
                        <TableHead>{t('patient_portal.table.doctor')}</TableHead>
                        <TableHead>{t('patient_portal.table.requested_date')}</TableHead>
                        <TableHead>{t('patient_portal.table.type')}</TableHead>
                        <TableHead className="text-right">{t('patient_portal.table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {loading ? (
                          <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                        ) : pendingRequests.length > 0 ? (
                        pendingRequests.map(request => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.patient}</TableCell>
                            <TableCell>{request.doctor}</TableCell>
                            <TableCell>{request.dateTime.toLocaleString()}</TableCell>
                            <TableCell>{request.type}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleRequestStatusChange(request.id, 'Confirmed')}>
                                  <Check className="mr-2 h-4 w-4" /> {t('patient_portal.actions.approve')}
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleRequestStatusChange(request.id, 'Cancelled')}>
                                  <X className="mr-2 h-4 w-4" /> {t('patient_portal.actions.decline')}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            {t('patient_portal.empty.no_requests')}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="users" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>{t('patient_portal.section.portal_users')}</CardTitle>
                    <CardDescription>{t('patient_portal.section.portal_users_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('patient_portal.table.patient')}</TableHead>
                                <TableHead>{t('patient_portal.table.email')}</TableHead>
                                <TableHead>{t('patient_portal.table.last_login')}</TableHead>
                                <TableHead>{t('patient_portal.table.status')}</TableHead>
                                <TableHead className="text-right">{t('patient_portal.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                            ) : portalUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.lastLogin}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status === 'Active' ? t('patient_portal.user_status.active') : t('patient_portal.user_status.deactivated')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleUserStatusChange(user.id)}>
                                                {user.status === 'Active' ? t('patient_portal.actions.deactivate') : t('patient_portal.actions.activate')}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.name)}>
                                                <KeyRound className="mr-2 h-4 w-4" /> {t('patient_portal.actions.reset_password')}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="documents" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>{t('patient_portal.section.shared_documents')}</CardTitle>
                    <CardDescription>{t('patient_portal.section.shared_documents_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('patient_portal.table.document_name')}</TableHead>
                                <TableHead>{t('patient_portal.table.patient')}</TableHead>
                                <TableHead>{t('patient_portal.table.shared_on')}</TableHead>
                                <TableHead>{t('patient_portal.table.type')}</TableHead>
                                <TableHead className="text-right">{t('patient_portal.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {loading ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                             ) : sharedDocuments.map(doc => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground"/> {doc.name}</TableCell>
                                    <TableCell>{doc.patient}</TableCell>
                                    <TableCell>{doc.sharedDate}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{doc.type === 'Treatment Plan' ? t('patient_portal.document_type.treatment_plan') : doc.type === 'Invoice' ? t('patient_portal.document_type.invoice') : t('patient_portal.document_type.lab_result')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-2 h-4 w-4" /> {t('patient_portal.actions.view_document')}
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleRevokeDocument(doc.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> {t('patient_portal.actions.revoke_access')}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>{t('patient_portal.portal_settings')}</CardTitle>
                    <p className="text-muted-foreground">{t('patient_portal.section.portal_settings_desc')}</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('patient_portal.settings.access_and_registration')}</h3>
                    <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                      <div className="flex flex-col">
                        <Label htmlFor="allow-registration">{t('patient_portal.settings.allow_registration')}</Label>
                        <span className="text-sm text-muted-foreground">
                          {t('patient_portal.settings.allow_registration_desc')}
                        </span>
                      </div>
                      <Switch id="allow-registration" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                      <div className="flex flex-col">
                        <Label htmlFor="auto-enroll">{t('patient_portal.settings.auto_enroll')}</Label>
                        <span className="text-sm text-muted-foreground">
                          {t('patient_portal.settings.auto_enroll_desc')}
                        </span>
                      </div>
                      <Switch id="auto-enroll" />
                    </div>
                  </div>

                   <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('patient_portal.settings.features')}</h3>
                     <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                      <div className="flex flex-col">
                        <Label htmlFor="allow-booking">{t('patient_portal.settings.online_booking')}</Label>
                        <span className="text-sm text-muted-foreground">
                          {t('patient_portal.settings.online_booking_desc')}
                        </span>
                      </div>
                      <Switch id="allow-booking" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                      <div className="flex flex-col">
                        <Label htmlFor="allow-messaging">{t('patient_portal.settings.secure_messaging')}</Label>
                        <span className="text-sm text-muted-foreground">
                          {t('patient_portal.settings.secure_messaging_desc')}
                        </span>
                      </div>
                      <Switch id="allow-messaging" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                      <div className="flex flex-col">
                        <Label htmlFor="show-billing">{t('patient_portal.settings.show_billing')}</Label>
                        <span className="text-sm text-muted-foreground">
                          {t('patient_portal.settings.show_billing_desc')}
                        </span>
                      </div>
                      <Switch id="show-billing" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSaveChanges}>{t('patient_portal.actions.save_changes')}</Button>
                </CardFooter>
             </Card>
          </TabsContent>
          <TabsContent value="content-admin" className="mt-4">
            <AdminContent />
          </TabsContent>
        </Tabs>
      </main>

      <ViewMessageDialog 
        message={selectedMessage}
        open={!!selectedMessage}
        onOpenChange={(isOpen) => !isOpen && setSelectedMessage(null)}
      />

      {replyData && (
        <NewMessageDialog
          open={isReplyOpen}
          onOpenChange={setIsReplyOpen}
          onSend={handleSendMessage}
          initialData={replyData}
          isReply
        />
      )}

    </DashboardLayout>
  );
}
