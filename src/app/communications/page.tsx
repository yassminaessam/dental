
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { communicationsPageStats, recentMessagesData } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare as MessageSquareIcon, CheckCircle2, Clock } from "lucide-react";
import { NewMessageDialog } from "@/components/communications/new-message-dialog";
import { NewTemplateDialog } from "@/components/communications/new-template-dialog";

export default function CommunicationsPage() {
  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Communications</h1>
          <div className="flex items-center gap-2">
            <NewTemplateDialog />
            <NewMessageDialog />
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
                    {recentMessagesData.length > 0 ? (
                      recentMessagesData.map((message: any) => (
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
          <TabsContent value="templates">
            <Card>
              <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                No templates found.
              </CardContent>
            </Card>
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
    </DashboardLayout>
  );
}
