
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
import { Mail, MessageSquare as MessageSquareIcon, CheckCircle2, Clock, Pencil, Trash2, Loader2 } from "lucide-react";
import { NewMessageDialog } from "@/components/communications/new-message-dialog";
import { NewTemplateDialog, Template } from "@/components/communications/new-template-dialog";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { listDocuments, setDocument, deleteDocument } from '@/lib/data-client';
import type { Message } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CommunicationsPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [templateToDelete, setTemplateToDelete] = React.useState<Template | null>(null);
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
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
        const [messageData, templateData] = await Promise.all([
          listDocuments<Message>('messages'),
          listDocuments<Template>('templates'),
        ]);
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
      setMessages(prev => [newMessage, ...prev]);
      toast({
        title: t('communications.toast.message_sent'),
        description: t('communications.toast.message_sent_desc'),
      });
    } catch (error) {
      toast({ title: t('communications.toast.error_sending_message'), variant: 'destructive' });
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
      <main className="flex w-full flex-1 flex-col gap-6 sm:gap-8 p-6 sm:p-8 max-w-screen-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Elite Communications Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
                <MessageSquareIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Communication Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('communications.title')}
            </h1>
            <p className="text-muted-foreground font-medium">
              Elite Messaging System
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <NewTemplateDialog onSave={handleSaveTemplate} />
            <NewMessageDialog onSend={handleSendMessage} />
          </div>
        </div>

        {/* Elite Communications Stats */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          {communicationsPageStats.map((stat, index) => {
            const cardStyles = ['metric-card-blue', 'metric-card-green', 'metric-card-orange', 'metric-card-purple'];
            const cardStyle = cardStyles[index % cardStyles.length];
            
            return (
              <Card 
                key={stat.title}
                className={cn(
                  "relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer group",
                  cardStyle
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                      {stat.title}
                    </CardTitle>
                    <div className={cn("text-2xl font-bold text-white drop-shadow-sm")}>
                      {stat.value}
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                    <MessageSquareIcon className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 relative z-10">
                  <p className="text-xs text-white/80 font-medium">
                    {stat.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                    <span className="text-xs text-white/70 font-medium">Live</span>
                  </div>
                </CardContent>
                
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/20 to-transparent" />
              </Card>
            );
          })}
        </div>

        {/* Elite Communications Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="bg-background/60 backdrop-blur-sm border border-border/50 p-1 rounded-xl grid w-full grid-cols-3">
            <TabsTrigger 
              value="history" 
              className="rounded-lg px-4 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg text-xs sm:text-sm"
            >
              {t('communications.history')}
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className="rounded-lg px-4 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg text-xs sm:text-sm"
            >
              {t('communications.templates')}
            </TabsTrigger>
            <TabsTrigger 
              value="automated" 
              className="rounded-lg px-4 py-3 font-semibold transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">{t('communications.automated')}</span>
              <span className="sm:hidden">{t('communications.auto')}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">{t('communications.recent_messages')}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="block sm:hidden">
                  {/* Mobile Card View */}
                  <div className="space-y-4 p-4">
                    {loading ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((message) => (
                        <Card key={message.id} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-medium text-sm">{message.patient}</div>
                            <Badge variant={
                              message.status === 'Sent' ? 'default' :
                              message.status === 'Delivered' || message.status === 'Read' ? 'secondary' :
                              'destructive'
                            }>
                              {getStatusLabel(message.status as unknown as string)}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">{t('communications.type')}:</span> {message.type === 'SMS' ? t('communications.sms') : t('communications.email')}
                            </div>
                            <div>
                              <span className="font-medium">{t('communications.content')}:</span> {message.content.length > 50 ? `${message.content.substring(0, 50)}...` : message.content}
                            </div>
                            <div>
                              <span className="font-medium">{t('communications.sent')}:</span> {new Date(message.sent).toLocaleDateString()}
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquareIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-semibold">{t('communications.no_messages_found')}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{t('communications.send_first_message')}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="hidden sm:block">
                  {/* Desktop Table View */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">{t('communications.patient')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('communications.type')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('communications.content')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('communications.status')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('communications.sent')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></TableCell></TableRow>
                      ) : messages.length > 0 ? (
                        messages.map((message: any) => (
                          <TableRow key={message.id}>
                            <TableCell className="font-medium whitespace-nowrap">{message.patient}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {message.type === "SMS" ? (
                                  <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span>{message.type === 'SMS' ? t('communications.sms') : t('communications.email')}</span>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap max-w-xs truncate">
                              <div className="font-medium">{message.content}</div>
                              {message.subContent && <div className="text-xs text-muted-foreground">{message.subContent}</div>}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge
                                variant={
                                  message.status === "Sent"
                                    ? "outline"
                                    : "default"
                                }
                                className={cn(
                                  "capitalize",
                                  (message.status === "Delivered" || message.status === "Read") && "bg-foreground text-background hover:bg-foreground/80",
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
                            <TableCell className="whitespace-nowrap">{new Date(message.sent).toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <MessageSquareIcon className="h-12 w-12 text-muted-foreground mb-2" />
                              <h3 className="text-sm font-semibold">{t('communications.no_messages_found')}</h3>
                              <p className="text-sm text-muted-foreground">{t('communications.send_first_message')}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="templates" className="mt-4">
             {templates.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.name} className="flex flex-col">
                    <CardHeader className="p-4 sm:p-6">
                      <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                        <span className="truncate mr-2">{template.name}</span>
                        <Badge variant="outline" className="text-xs">{template.type}</Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">{template.subject}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow p-4 sm:p-6 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {template.body}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 p-4 sm:p-6 pt-0">
                      <Button variant="outline" size="sm" disabled>
                        <Pencil className={cn(isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2', 'h-3 w-3')} />
                        <span className="hidden sm:inline">{t('communications.edit')}</span>
                      </Button>
                       <Button variant="destructive" size="sm" onClick={() => setTemplateToDelete(template)}>
                        <Trash2 className={cn(isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2', 'h-3 w-3')} />
                        <span className="hidden sm:inline">{t('communications.delete')}</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-4 sm:p-6">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : t('communications.no_templates_found')}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="automated">"
            <Card>
              <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                {t('communications.no_automated_messages')}
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
