
'use client';

import React from 'react';
// Migrated from server getCollection to client listDocuments
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
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
import { Mail, MessageSquare as MessageSquareIcon, CheckCircle2, Clock, Pencil, Trash2, Loader2, Send, Sparkles, TrendingUp, Zap, Search as SearchIcon } from "lucide-react";
import { CardIcon } from '@/components/ui/card-icon';
import { NewMessageDialog } from "@/components/communications/new-message-dialog";
import { NewTemplateDialog, Template } from "@/components/communications/new-template-dialog";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { listDocuments, setDocument, deleteDocument } from '@/lib/data-client';
import type { Message } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CommunicationsPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [templateToDelete, setTemplateToDelete] = React.useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const { toast } = useToast();
  const { t, isRTL, language } = useLanguage();
  const getStatusLabel = React.useCallback((status: string) => {
    switch (status) {
      case 'Sent':
        return t('communications.sent');
      case 'Delivered':
      case 'Read':
        return t('communications.delivered');
      case 'Queued':
        return t('communications.queued');
      case 'Failed':
        return t('communications.failed');
      default:
        return status;
    }
  }, [t]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [messageDataRaw, templateData] = await Promise.all([
          listDocuments<any>('messages'),
          listDocuments<Template>('templates'),
        ]);
        const messageData: Message[] = messageDataRaw.map((message: any) => ({
          ...message,
          patientPhone: message.patientPhone ?? message.patient_phone ?? message.phone ?? null,
        }));
        setMessages(messageData);
        setTemplates(templateData);
      } catch (error) {
  toast({ title: t('communications.toast.error_fetching'), variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const communicationsPageStats = React.useMemo(() => {
    const totalMessages = messages.length;
    const totalTemplates = templates.length;
    const deliveredRate = totalMessages > 0 ? 
      (messages.filter(m => m.status === 'Delivered' || m.status === 'Read').length / totalMessages) * 100 
      : 0;

    return [
      { title: t('communications.messages_sent'), value: totalMessages, description: t('communications.total_messages_desc') },
      { title: t('communications.templates_created'), value: totalTemplates, description: t('communications.reusable_templates') },
      { title: t('communications.delivered_rate'), value: `${deliveredRate.toFixed(1)}%`, description: t('communications.successful_delivery'), valueClassName: "text-green-600" },
      { title: t('communications.automations'), value: 0, description: t('communications.automated_workflows') }
    ];
  }, [messages, templates, t]);

  const filteredMessages = React.useMemo(() => {
    if (!searchTerm.trim()) return messages;
    const normalized = searchTerm.trim().toLowerCase();
    const digitQuery = searchTerm.replace(/[^\d]/g, '');
    return messages.filter((message) => {
      const patientMatch = message.patient?.toLowerCase().includes(normalized);
      const typeMatch = message.type?.toLowerCase().includes(normalized);
      const statusMatch = message.status?.toLowerCase().includes(normalized);
      const subjectMatch = message.subject?.toLowerCase().includes(normalized);
      const contentMatch = message.content?.toLowerCase().includes(normalized)
        || message.subContent?.toLowerCase().includes(normalized);
      const phoneDigits = (message.patientPhone ?? '').replace(/[^\d]/g, '');
      const phoneMatch = digitQuery.length > 0 && phoneDigits.includes(digitQuery);
      return patientMatch || typeMatch || statusMatch || subjectMatch || contentMatch || phoneMatch;
    });
  }, [messages, searchTerm]);
  
  const handleSendMessage = async (data: any) => {
    try {
      // Show loading toast
      toast({
        title: t('communications.sending_email'),
        description: t('common.please_wait'),
      });

      // Send actual email via API
      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.patientEmail,
          subject: data.subject,
          message: data.message,
          patientName: data.patient,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      const emailResult = await emailResponse.json();

      // Save message record to database
      const newMessage: Message = {
        id: `MSG-${Date.now()}`,
        patient: data.patient,
        patientPhone: data.patientPhone ?? null,
        type: 'Email',
        status: 'Delivered',
        sent: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        subject: data.subject,
        content: data.subject,
        subContent: data.message,
        snippet: data.message.substring(0, 50) + '...',
        fullMessage: data.message,
        category: 'other',
        priority: 'normal',
      };
      
      await setDocument('messages', newMessage.id, newMessage);
      setMessages(prev => [newMessage, ...prev]);
      
      toast({
        title: t('communications.toast.message_sent'),
        description: `${t('communications.toast.message_sent_desc')} (${emailResult.messageId})`,
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({ 
        title: t('communications.toast.error_sending_message'), 
        description: error.message || 'Unknown error',
        variant: 'destructive' 
      });
    }
  };

  const handleSaveTemplate = async (data: Omit<Template, 'id'>) => {
    try {
      const newTemplate: Template = {
        ...data,
        id: `TMPL-${Date.now()}`,
      };
      await setDocument('templates', newTemplate.id, newTemplate);
      setTemplates(prev => [...prev, newTemplate]);
      toast({
  title: t('communications.toast.template_saved'),
  description: t('communications.toast.template_saved_desc'),
      });
    } catch (error) {
       toast({ title: t('communications.toast.error_saving_template'), variant: 'destructive' });
    }
  };

  const handleDeleteTemplate = async () => {
    if (templateToDelete) {
      try {
        await deleteDocument('templates', templateToDelete.id);
        setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
        toast({
          title: t('communications.toast.template_deleted'),
          description: t('communications.toast.template_deleted_desc'),
          variant: "destructive",
        });
        setTemplateToDelete(null);
      } catch(e) {
        toast({ title: t('communications.toast.error_deleting_template'), variant: 'destructive' });
      }
    }
  };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto relative" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-cyan-200/10 dark:from-blue-900/15 dark:via-purple-900/10 dark:to-cyan-900/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-200/30 via-teal-200/20 to-blue-200/10 dark:from-cyan-900/15 dark:via-teal-900/10 dark:to-blue-900/5 rounded-full blur-3xl animate-pulse animation-delay-1500"></div>
        </div>

        {/* Ultra Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* Left side: Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 text-white shadow-xl">
                    <MessageSquareIcon className="h-8 w-8" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">Communication Hub</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 dark:from-blue-400 dark:via-cyan-400 dark:to-sky-400 bg-clip-text text-transparent animate-gradient">
                    {t('communications.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Elite Messaging & Notification System
                  </p>
                </div>
              </div>

              {/* Right side: Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <NewTemplateDialog onSave={handleSaveTemplate} />
                <NewMessageDialog onSend={handleSendMessage} />
              </div>
            </div>
          </div>
        </div>

        {/* Ultra Enhanced Stats Cards */}
        <div className="grid gap-1.5 grid-cols-2 lg:grid-cols-4">
          {communicationsPageStats.map((stat, index) => {
            const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-orange', 'metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            const icons = [Send, CheckCircle2, TrendingUp, Zap];
            const Icon = icons[index % icons.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-sm transition-all duration-500 hover:scale-105 cursor-pointer group min-h-0",
                  cardStyle
                )}
              >
                {/* Animated Background Layers */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="pb-0.5 p-1.5 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide leading-tight mb-1">
                        {stat.title}
                      </CardTitle>
                      <div className="text-lg font-bold text-white drop-shadow-md leading-tight group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                    </div>
                    <CardIcon variant={(['blue','green','orange','purple'] as const)[index % 4]} className="w-10 h-10 group-hover:rotate-12">
                      <Icon className="h-5 w-5" />
                    </CardIcon>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 p-1.5 relative z-10">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ultra Enhanced Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl blur-xl"></div>
            <TabsList className="relative bg-background/80 backdrop-blur-xl border-2 border-muted/50 p-1.5 rounded-2xl grid w-full grid-cols-3 shadow-lg">
              <TabsTrigger 
                value="history" 
                className="rounded-xl px-4 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <Mail className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('communications.history')}
              </TabsTrigger>
              <TabsTrigger 
                value="templates" 
                className="rounded-xl px-4 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <Sparkles className="h-4 w-4 mr-2 hidden sm:inline" />
                {t('communications.templates')}
              </TabsTrigger>
              <TabsTrigger 
                value="automated" 
                className="rounded-xl px-4 py-3 font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-xl hover:bg-muted/50 text-xs sm:text-sm"
              >
                <Zap className="h-4 w-4 mr-2 hidden sm:inline" />
                <span className="hidden sm:inline">{t('communications.automated')}</span>
                <span className="sm:hidden">{t('communications.auto')}</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="history" className="mt-0">
            <Card className="border-2 border-muted/50 shadow-xl bg-gradient-to-br from-background/95 via-background to-background/95 backdrop-blur-xl">
              <CardHeader className="p-4 sm:p-6 border-b-2 border-muted/30">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {t('communications.recent_messages')}
                    </CardTitle>
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:gap-4 w-full md:w-auto">
                    <Badge variant="outline" className="font-bold justify-center min-w-[120px]">
                      {filteredMessages.length}/{messages.length} {t('communications.messages')}
                    </Badge>
                    <div className="relative w-full sm:w-72">
                      <SearchIcon className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? 'right-3' : 'left-3')} />
                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder={language === 'ar' ? 'ابحث في الرسائل...' : 'Search messages...'}
                        className={cn(
                          'pl-9 pr-3',
                          isRTL && 'text-right pr-9 pl-3'
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="block sm:hidden">
                  {/* Mobile Card View */}
                  <div className="space-y-4 p-4">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                    ) : filteredMessages.length > 0 ? (
                      filteredMessages.map((message) => (
                        <Card key={message.id} className="group relative overflow-hidden border-2 border-muted hover:border-blue-300 dark:hover:border-blue-700 p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-bold text-sm flex items-center gap-2">
                                {message.type === 'SMS' ? (
                                  <MessageSquareIcon className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <Mail className="h-4 w-4 text-purple-500" />
                                )}
                                {message.patient}
                              </div>
                              <Badge variant={
                                message.status === 'Sent' ? 'default' :
                                message.status === 'Delivered' || message.status === 'Read' ? 'secondary' :
                                'destructive'
                              } className="font-bold">
                                {getStatusLabel(message.status as unknown as string)}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="p-3 rounded-lg bg-muted/30 backdrop-blur-sm">
                                <span className="font-bold text-muted-foreground">{t('communications.type')}:</span>{' '}
                                <span className="font-medium">{message.type === 'SMS' ? t('communications.sms') : t('communications.email')}</span>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/30 backdrop-blur-sm">
                                <span className="font-bold text-muted-foreground">{t('communications.content')}:</span>{' '}
                                <span className="font-medium">{message.content.length > 50 ? `${message.content.substring(0, 50)}...` : message.content}</span>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/30 backdrop-blur-sm" dir="ltr">
                                <span className="font-bold text-muted-foreground">{t('common.phone')}:</span>{' '}
                                <span className="font-medium">
                                  {message.patientPhone ? (
                                    <span className="font-mono tracking-tight">{message.patientPhone}</span>
                                  ) : t('common.na')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">{new Date(message.sent).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <Card className="text-center py-12 border-2 border-dashed">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                            <MessageSquareIcon className="h-12 w-12 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold mb-1">{t('communications.no_messages_found')}</h3>
                            <p className="text-xs text-muted-foreground">{t('communications.send_first_message')}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
                
                <div className="hidden sm:block">
                  {/* Desktop Table View */}
                  <div className="rounded-xl border-2 border-muted/50 overflow-hidden">
                    <Table
                      dir={isRTL ? 'rtl' : 'ltr'}
                      className={cn(
                        isRTL
                          ? 'text-right [&_th]:text-right [&_td]:text-right'
                          : 'text-left [&_th]:text-left [&_td]:text-left'
                      )}
                    >
                      <TableHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                        <TableRow className="hover:bg-transparent border-b-2 border-muted/50">
                          <TableHead className="whitespace-nowrap font-bold text-foreground">{t('communications.patient')}</TableHead>
                          <TableHead className="whitespace-nowrap font-bold text-foreground">{t('common.phone')}</TableHead>
                          <TableHead className="whitespace-nowrap font-bold text-foreground">{t('communications.type')}</TableHead>
                          <TableHead className="whitespace-nowrap font-bold text-foreground">{t('communications.content')}</TableHead>
                          <TableHead className="whitespace-nowrap font-bold text-foreground">{t('communications.status')}</TableHead>
                          <TableHead className="whitespace-nowrap font-bold text-foreground">{t('communications.sent')}</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                      ) : filteredMessages.length > 0 ? (
                        filteredMessages.map((message: any) => (
                          <TableRow key={message.id} className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 dark:hover:from-blue-950/20 dark:hover:to-purple-950/10 transition-all duration-300">
                            <TableCell className="font-bold whitespace-nowrap">{message.patient}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {message.patientPhone ? (
                                <span dir="ltr" className="font-mono text-sm tracking-tight">
                                  {message.patientPhone}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">{t('common.na')}</span>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {message.type === "SMS" ? (
                                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <MessageSquareIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                ) : (
                                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                  </div>
                                )}
                                <span className="font-medium">{message.type === 'SMS' ? t('communications.sms') : t('communications.email')}</span>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap max-w-xs">
                              <div className="font-medium truncate">{message.content}</div>
                              {message.subContent && <div className="text-xs text-muted-foreground truncate">{message.subContent}</div>}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge
                                variant={
                                  message.status === "Sent"
                                    ? "outline"
                                    : "default"
                                }
                                className={cn(
                                  "capitalize font-bold",
                                  (message.status === "Delivered" || message.status === "Read") && "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700",
                                )}
                              >
                                {message.status === 'Sent' ? (
                                  <Clock className={cn(isRTL ? 'ml-1' : 'mr-1', 'h-3 w-3')} />
                                ) : (
                                  <CheckCircle2 className={cn(isRTL ? 'ml-1' : 'mr-1', 'h-3 w-3')} />
                                )}
                                {getStatusLabel(message.status as unknown as string)}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-medium text-muted-foreground">{new Date(message.sent).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center gap-4">
                              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                                <MessageSquareIcon className="h-12 w-12 text-blue-500" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold mb-1">{t('communications.no_messages_found')}</h3>
                                <p className="text-sm text-muted-foreground">{t('communications.send_first_message')}</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="templates" className="mt-0">
             {templates.length > 0 ? (
              <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.name} className="group relative flex flex-col overflow-hidden border-2 border-muted hover:border-purple-300 dark:hover:border-purple-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <CardHeader className="p-3 sm:p-4 relative z-10">
                      <CardTitle className="flex items-center justify-between text-sm sm:text-base font-black">
                        <span className="truncate mr-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{template.name}</span>
                        <Badge variant="outline" className="text-xs font-bold border-2 border-purple-200 dark:border-purple-800">
                          {template.type}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-xs font-medium mt-1">{template.subject}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-grow p-3 sm:p-4 pt-0 relative z-10">
                      <div className="p-3 rounded-xl bg-muted/30 backdrop-blur-sm">
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {template.body}
                        </p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-end gap-2 p-3 sm:p-4 pt-0 relative z-10">
                      <Button variant="outline" size="sm" disabled className="font-bold border-2 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                        <Pencil className={cn(isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2', 'h-3 w-3')} />
                        <span className="hidden sm:inline">{t('communications.edit')}</span>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setTemplateToDelete(template)} className="font-bold shadow-lg hover:shadow-xl">
                        <Trash2 className={cn(isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2', 'h-3 w-3')} />
                        <span className="hidden sm:inline">{t('communications.delete')}</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed border-muted shadow-xl">
                <CardContent className="h-48 text-center flex items-center justify-center p-4 sm:p-6">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                        <Sparkles className="h-12 w-12 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold mb-1">{t('communications.no_templates_found')}</h3>
                        <p className="text-xs text-muted-foreground">Create your first template to get started</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="automated" className="mt-0">
            <Card className="border-2 border-dashed border-muted shadow-xl">
              <CardContent className="h-48 text-center flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-pink-500/10">
                      <Zap className="h-12 w-12 text-orange-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1">{t('communications.no_automated_messages')}</h3>
                    <p className="text-xs text-muted-foreground">Automated workflows coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={!!templateToDelete} onOpenChange={(isOpen) => !isOpen && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('communications.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('communications.template_delete_warning')} "{templateToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}
