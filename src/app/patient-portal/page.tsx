
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
import { patientMessagesData, patientPortalPageStats } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Settings, Search, User, Eye, Reply, Circle, CheckCircle2 } from "lucide-react";
import { NewMessageDialog } from "@/components/communications/new-message-dialog";

export default function PatientPortalPage() {
  return (
    <DashboardLayout>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Patient Portal Management</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Portal Settings
            </Button>
            <NewMessageDialog 
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

        <Tabs defaultValue="messages">
          <TabsList>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="requests">Appointment Requests</TabsTrigger>
            <TabsTrigger value="users">Portal Users</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="settings">Portal Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="messages" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
                <CardTitle>Patient Messages</CardTitle>
                <div className="relative">
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
                        <TableRow key={message.id} className={message.status === 'Unread' ? 'bg-accent' : ''}>
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
                                    <Circle className="h-3 w-3 text-blue-500 fill-blue-500" /> : 
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                }
                                <span>{message.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-3 w-3" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
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
          <TabsContent value="requests">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    No appointment requests found.
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
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    Portal settings will be available here.
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
