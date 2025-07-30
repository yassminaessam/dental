
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
import { patientMessagesData, patientPortalPageStats, initialAppointmentsData, type PatientMessage } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Settings, Search, User, Eye, Reply, Circle, CheckCircle2, Check, X } from "lucide-react";
import { NewMessageDialog } from "@/components/communications/new-message-dialog";
import { useToast } from '@/hooks/use-toast';
import { ViewMessageDialog } from '@/components/patient-portal/view-message-dialog';
import type { Appointment } from '@/app/appointments/page';

export default function PatientPortalPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('messages');
  const [selectedMessage, setSelectedMessage] = React.useState<PatientMessage | null>(null);
  const [isReplyOpen, setIsReplyOpen] = React.useState(false);
  const [replyData, setReplyData] = React.useState<{ patientName: string; subject: string } | null>(null);
  const [appointments, setAppointments] = React.useState<Appointment[]>(initialAppointmentsData);

  const pendingRequests = React.useMemo(() => {
    return appointments.filter(appt => appt.status === 'Pending');
  }, [appointments]);

  const handleRequestStatusChange = (appointmentId: string, newStatus: 'Confirmed' | 'Cancelled') => {
    const updatedAppointments = appointments.map(appt =>
      appt.id === appointmentId ? { ...appt, status: newStatus } : appt
    );
    setAppointments(updatedAppointments);
    // This is a mock, in a real app you'd likely update a central store or refetch
    initialAppointmentsData.splice(0, initialAppointmentsData.length, ...updatedAppointments);
    
    toast({
      title: `Request ${newStatus === 'Confirmed' ? 'Approved' : 'Declined'}`,
      description: `Appointment ${appointmentId} has been marked as ${newStatus}.`,
      variant: newStatus === 'Cancelled' ? 'destructive' : undefined,
    });
  };

  const handleReply = (message: PatientMessage) => {
    setReplyData({
      patientName: message.patient,
      subject: `Re: ${message.subject}`,
    });
    setIsReplyOpen(true);
  };
  
  const handleSendMessage = (data: any) => {
    toast({
      title: "Message Sent",
      description: `A new ${data.type} has been sent to ${data.patient}.`,
    });
  };


  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Patient Portal Management</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setActiveTab('settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Portal Settings
            </Button>
            <NewMessageDialog 
              onSend={handleSendMessage}
              triggerButtonText="Send Message"
              dialogTitle="Send a New Message"
              dialogDescription="Compose and send a message to a patient."
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {patientPortalPageStats(pendingRequests.length).map((stat) => (
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="requests">
              Appointment Requests
              {pendingRequests.length > 0 && <Badge className="ml-2 bg-primary text-primary-foreground">{pendingRequests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="users">Portal Users</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="settings">Portal Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="messages" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Patient Messages</CardTitle>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search messages..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Patient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientMessagesData.length > 0 ? (
                      patientMessagesData.map((message) => (
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
                            <Badge variant="outline" className="capitalize">{message.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={message.priority === 'high' ? 'destructive' : 'secondary'}
                              className="capitalize"
                            >
                              {message.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{message.date}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                                {message.status === 'Unread' ? 
                                    <Circle className="h-3 w-3 text-primary fill-primary" /> : 
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                }
                                <span>{message.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedMessage(message)}>
                                <Eye className="mr-2 h-3 w-3" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleReply(message)}>
                                <Reply className="mr-2 h-3 w-3" />
                                Reply
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No messages found.
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
                  <CardTitle>Pending Appointment Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.length > 0 ? (
                        pendingRequests.map(request => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.patient}</TableCell>
                            <TableCell>{request.doctor}</TableCell>
                            <TableCell>{request.dateTime.toLocaleString()}</TableCell>
                            <TableCell>{request.type}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleRequestStatusChange(request.id, 'Confirmed')}>
                                  <Check className="mr-2 h-4 w-4" /> Approve
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleRequestStatusChange(request.id, 'Cancelled')}>
                                  <X className="mr-2 h-4 w-4" /> Decline
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No pending appointment requests found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="users">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    No portal users found.
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="documents">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    No documents found.
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="settings">
             <Card>
                <CardHeader>
                    <CardTitle>Portal Settings</CardTitle>
                    <p className="text-muted-foreground">Configure patient portal settings here.</p>
                </CardHeader>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    Portal settings form will be available here.
                </CardContent>
             </Card>
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
