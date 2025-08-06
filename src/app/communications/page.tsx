
'use client';

import React from 'react';
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
import { getCollection, setDocument, deleteDocument } from '@/services/firestore';
import type { Message } from '@/lib/types';

export default function CommunicationsPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [templateToDelete, setTemplateToDelete] = React.useState<Template | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [messageData, templateData] = await Promise.all([
          getCollection<Message>('messages'),
          getCollection<Template>('templates'),
        ]);
        setMessages(messageData);
        setTemplates(templateData);
      } catch (error) {
        toast({ title: 'Error fetching data', variant: 'destructive' });
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
      { title: "Messages Sent (All Time)", value: totalMessages, description: "Total messages sent via Email & SMS" },
      { title: "Templates Created", value: totalTemplates, description: "Reusable message templates" },
      { title: "Delivered Rate", value: `${deliveredRate.toFixed(1)}%`, description: "Successful delivery rate", valueClassName: "text-green-600" },
      { title: "Automations", value: 0, description: "Automated message workflows" }
    ];
  }, [messages, templates]);
  
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
        title: "Message Sent",
        description: `A new ${newMessage.type} has been sent to ${newMessage.patient}.`,
      });
    } catch (error) {
      toast({ title: 'Error sending message', variant: 'destructive' });
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
        title: "Template Saved",
        description: `The "${data.name}" template has been saved.`,
      });
    } catch (error) {
       toast({ title: 'Error saving template', variant: 'destructive' });
    }
  };

  const handleDeleteTemplate = async () => {
    if (templateToDelete) {
      try {
        await deleteDocument('templates', templateToDelete.id);
        setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
        toast({
          title: "Template Deleted",
          description: `The "${templateToDelete.name}" template has been deleted.`,
          variant: "destructive",
        });
        setTemplateToDelete(null);
      } catch(e) {
        toast({ title: 'Error deleting template', variant: 'destructive' });
      }
    }
  };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">Communications</h1>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <NewTemplateDialog onSave={handleSaveTemplate} />
            <NewMessageDialog onSend={handleSendMessage} />
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {communicationsPageStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={cn("text-lg sm:text-2xl font-bold", stat.valueClassName)}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Message </span>History
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm">Templates</TabsTrigger>
            <TabsTrigger value="automated" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Automated</span>
              <span className="sm:hidden">Auto</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Recent Messages</CardTitle>
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
                              message.status === 'Delivered' ? 'secondary' :
                              'destructive'
                            }>
                              {message.status}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">Type:</span> {message.type}
                            </div>
                            <div>
                              <span className="font-medium">Content:</span> {message.content.length > 50 ? `${message.content.substring(0, 50)}...` : message.content}
                            </div>
                            <div>
                              <span className="font-medium">Sent:</span> {new Date(message.sent).toLocaleDateString()}
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquareIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-semibold">No messages found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Send your first message to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="hidden sm:block">
                  {/* Desktop Table View */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Patient</TableHead>
                        <TableHead className="whitespace-nowrap">Type</TableHead>
                        <TableHead className="whitespace-nowrap">Content</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Sent</TableHead>
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
                                <span>{message.type}</span>
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
                                {message.status === "Sent" ? (
                                  <Clock className="mr-1 h-3 w-3" />
                                ) : (
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                )}
                                {message.status}
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
                              <h3 className="text-sm font-semibold">No messages found</h3>
                              <p className="text-sm text-muted-foreground">
                                Send your first message to get started.
                              </p>
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
                        <Pencil className="mr-1 sm:mr-2 h-3 w-3" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                       <Button variant="destructive" size="sm" onClick={() => setTemplateToDelete(template)}>
                        <Trash2 className="mr-1 sm:mr-2 h-3 w-3" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-4 sm:p-6">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : 'No templates found. Create one to get started.'}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="automated">"
            <Card>
              <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                No automated messages configured.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={!!templateToDelete} onOpenChange={(isOpen) => !isOpen && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template
              "{templateToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}
