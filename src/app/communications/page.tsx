
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
import { communicationsPageStats, initialRecentMessagesData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare as MessageSquareIcon, CheckCircle2, Clock, Pencil, Trash2 } from "lucide-react";
import { NewMessageDialog } from "@/components/communications/new-message-dialog";
import { NewTemplateDialog, Template } from "@/components/communications/new-template-dialog";
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export type Message = {
  id: string;
  patient: string;
  type: 'SMS' | 'Email';
  content: string;
  subContent: string | null;
  status: 'Sent' | 'Delivered' | 'Read';
  sent: string;
};

export default function CommunicationsPage() {
  const [messages, setMessages] = React.useState<Message[]>(initialRecentMessagesData);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [templateToDelete, setTemplateToDelete] = React.useState<Template | null>(null);
  const { toast } = useToast();
  
  const handleSendMessage = (data: any) => {
    const newMessage: Message = {
      id: `MSG-${Math.floor(100 + Math.random() * 900).toString().padStart(3, '0')}`,
      patient: data.patient,
      type: data.type,
      content: data.subject,
      subContent: data.message,
      status: 'Sent',
      sent: new Date().toLocaleString(),
    };
    setMessages(prev => [newMessage, ...prev]);
    toast({
      title: "Message Sent",
      description: `A new ${newMessage.type} has been sent to ${newMessage.patient}.`,
    });
  };

  const handleSaveTemplate = (data: Template) => {
    setTemplates(prev => [...prev, data]);
    toast({
      title: "Template Saved",
      description: `The "${data.name}" template has been saved.`,
    });
  };

  const handleDeleteTemplate = () => {
    if (templateToDelete) {
      setTemplates(prev => prev.filter(t => t.name !== templateToDelete.name));
      toast({
        title: "Template Deleted",
        description: `The "${templateToDelete.name}" template has been deleted.`,
        variant: "destructive",
      });
      setTemplateToDelete(null);
    }
  };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Communications</h1>
          <div className="flex items-center gap-2">
            <NewTemplateDialog onSave={handleSaveTemplate} />
            <NewMessageDialog onSend={handleSendMessage} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {communicationsPageStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", stat.valueClassName)}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">Message History</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="automated">Automated Messages</TabsTrigger>
          </TabsList>
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.length > 0 ? (
                      messages.map((message: any) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.patient}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {message.type === "SMS" ? (
                                <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Mail className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span>{message.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{message.content}</div>
                            {message.subContent && <div className="text-xs text-muted-foreground">{message.subContent}</div>}
                          </TableCell>
                          <TableCell>
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
                          <TableCell>{message.sent}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No messages found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="templates" className="mt-4">
             {templates.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <Card key={template.name} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{template.name}</span>
                        <Badge variant="outline">{template.type}</Badge>
                      </CardTitle>
                      <CardDescription>{template.subject}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {template.body}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Pencil className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                       <Button variant="destructive" size="sm" onClick={() => setTemplateToDelete(template)}>
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                  No templates found. Create one to get started.
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="automated">
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
