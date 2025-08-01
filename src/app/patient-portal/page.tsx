
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
import { Settings, Search, User, Eye, Reply, Circle, CheckCircle2, Check, X, FileText, Trash2, KeyRound, Loader2 } from "lucide-react";
import { NewMessageDialog } from "@/components/communications/new-message-dialog";
import { useToast } from '@/hooks/use-toast';
import { ViewMessageDialog } from '@/components/patient-portal/view-message-dialog';
import type { Appointment } from '@/app/appointments/page';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getCollection, updateDocument, deleteDocument, setDocument } from '@/services/firestore';
import type { Message } from '@/app/communications/page';

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

export type PatientMessage = {
    id: string;
    patient: string;
    subject: string;
    snippet: string;
    fullMessage: string;
    category: 'treatment' | 'appointment' | 'billing' | 'other';
    priority: 'high' | 'normal' | 'low';
    date: string;
    status: 'Unread' | 'Read';
};


export default function PatientPortalPage() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('messages');
  
  const [messages, setMessages] = React.useState<PatientMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = React.useState<PatientMessage | null>(null);
  const [isReplyOpen, setIsReplyOpen] = React.useState(false);
  const [replyData, setReplyData] = React.useState<{ patientName: string; subject: string } | null>(null);

  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [portalUsers, setPortalUsers] = React.useState<PortalUser[]>([]);
  const [sharedDocuments, setSharedDocuments] = React.useState<SharedDocument[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [msgData, apptData, userData, docData] = await Promise.all([
          getCollection<PatientMessage>('patient-messages'),
          getCollection<Appointment>('appointments'),
          getCollection<PortalUser>('portal-users'),
          getCollection<SharedDocument>('shared-documents'),
        ]);
        setMessages(msgData);
        setAppointments(apptData.map(a => ({...a, dateTime: new Date(a.dateTime) })));
        setPortalUsers(userData);
        setSharedDocuments(docData);
      } catch (error) {
        toast({ title: 'Error fetching portal data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);


  const pendingRequests = React.useMemo(() => {
    return appointments.filter(appt => appt.status === 'Pending');
  }, [appointments]);

  const patientPortalPageStats = React.useMemo(() => {
    const unreadMessages = messages.filter(m => m.status === 'Unread').length;
    return [
      { title: "Active Portal Users", value: portalUsers.length, description: "Patients with portal access" },
      { title: "Unread Messages", value: unreadMessages, description: "New messages from patients", valueClassName: "text-orange-500" },
      { title: "Pending Requests", value: pendingRequests.length, description: "Appointment requests to review", valueClassName: "text-red-500" },
      { title: "Shared Documents", value: sharedDocuments.length, description: "Documents available to patients" },
    ];
  }, [messages, portalUsers, pendingRequests, sharedDocuments]);


  const handleRequestStatusChange = async (appointmentId: string, newStatus: 'Confirmed' | 'Cancelled') => {
    try {
        await updateDocument('appointments', appointmentId, { status: newStatus });
        setAppointments(prev => prev.map(appt =>
          appt.id === appointmentId ? { ...appt, status: newStatus } : appt
        ));
        toast({
          title: `Request ${newStatus === 'Confirmed' ? 'Approved' : 'Declined'}`,
          description: `Appointment ${appointmentId} has been marked as ${newStatus}.`,
          variant: newStatus === 'Cancelled' ? 'destructive' : undefined,
        });
    } catch (error) {
        toast({ title: 'Error updating request status', variant: 'destructive' });
    }
  };

  const handleReply = (message: PatientMessage) => {
    setReplyData({
      patientName: message.patient,
      subject: `Re: ${message.subject}`,
    });
    setIsReplyOpen(true);
  };
  
  const handleSendMessage = async (data: any) => {
    try {
      const newMessage: Message = {
        id: `MSG-${Date.now()}`,
        patient: data.patient,
        type: data.type,
        content: data.subject,
        subContent: data.message,
        status: 'Sent',
        sent: new Date().toLocaleString(),
      };
      await setDocument('messages', newMessage.id, newMessage);
      toast({
        title: "Message Sent",
        description: `A new ${data.type} has been sent to ${data.patient}.`,
      });
    } catch(e) {
        toast({ title: 'Error sending message', variant: 'destructive' });
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
            title: "User Status Updated",
            description: `${user.name}'s portal access has been ${newStatus.toLowerCase()}.`,
            variant: newStatus === 'Deactivated' ? 'destructive' : undefined
        });
    } catch (e) {
        toast({ title: 'Error updating user status', variant: 'destructive' });
    }
  };

  const handleResetPassword = (userName: string) => {
    toast({
        title: "Password Reset Sent",
        description: `A password reset link has been sent to ${userName}.`
    });
  };

  const handleRevokeDocument = async (docId: string) => {
    const doc = sharedDocuments.find(d => d.id === docId);
    if (!doc) return;
    try {
        await deleteDocument('shared-documents', docId);
        setSharedDocuments(prev => prev.filter(d => d.id !== docId));
        toast({
            title: "Document Access Revoked",
            description: `Access to "${doc.name}" has been revoked for ${doc.patient}.`,
            variant: "destructive",
        });
    } catch (e) {
        toast({ title: 'Error revoking document', variant: 'destructive' });
    }
  };
  
  const handleSaveChanges = () => {
    toast({
        title: "Settings Saved",
        description: "Your patient portal settings have been successfully updated.",
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
          {patientPortalPageStats.map((stat) => (
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
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-5">
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
          <TabsContent value="users" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Portal Users</CardTitle>
                    <CardDescription>Manage patient access to the portal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
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
                                        <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleUserStatusChange(user.id)}>
                                                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.name)}>
                                                <KeyRound className="mr-2 h-4 w-4" /> Reset Password
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
                    <CardTitle>Shared Documents</CardTitle>
                    <CardDescription>Manage documents shared with patients via the portal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Document Name</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Shared On</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
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
                                        <Badge variant="secondary">{doc.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-2 h-4 w-4" /> View Document
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleRevokeDocument(doc.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Revoke Access
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
                    <CardTitle>Portal Settings</CardTitle>
                    <p className="text-muted-foreground">Configure patient portal features and access.</p>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Access & Registration</h3>
                    <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                      <div className="flex flex-col">
                        <Label htmlFor="allow-registration">Allow New Patient Registration</Label>
                        <span className="text-sm text-muted-foreground">
                          Allow new users to register for the portal directly.
                        </span>
                      </div>
                      <Switch id="allow-registration" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                      <div className="flex flex-col">
                        <Label htmlFor="auto-enroll">Automatically Enroll New Patients</Label>
                        <span className="text-sm text-muted-foreground">
                          Send a portal invitation to every new patient added to the system.
                        </span>
                      </div>
                      <Switch id="auto-enroll" />
                    </div>
                  </div>

                   <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Features</h3>
                     <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                      <div className="flex flex-col">
                        <Label htmlFor="allow-booking">Online Appointment Booking</Label>
                        <span className="text-sm text-muted-foreground">
                          Allow patients to request new appointments through the portal.
                        </span>
                      </div>
                      <Switch id="allow-booking" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                      <div className="flex flex-col">
                        <Label htmlFor="allow-messaging">Secure Messaging</Label>
                        <span className="text-sm text-muted-foreground">
                          Enable two-way secure messaging between patients and staff.
                        </span>
                      </div>
                      <Switch id="allow-messaging" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between space-x-4 rounded-md border p-4">
                      <div className="flex flex-col">
                        <Label htmlFor="show-billing">Show Billing Information</Label>
                        <span className="text-sm text-muted-foreground">
                          Allow patients to view their invoices and payment history.
                        </span>
                      </div>
                      <Switch id="show-billing" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                </CardFooter>
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
