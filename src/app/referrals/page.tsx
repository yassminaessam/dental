
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { referralPageStats, initialOutgoingReferralsData, initialSpecialistNetwork } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Search, Send, Eye } from "lucide-react";
import { AddSpecialistDialog } from "@/components/referrals/add-specialist-dialog";
import { NewReferralDialog } from "@/components/referrals/new-referral-dialog";

export type Referral = {
  id: string;
  patient: string;
  specialist: string;
  specialty: string;
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'scheduled' | 'completed' | 'pending' | 'cancelled';
  date: string;
  apptDate: string | null;
};

export type Specialist = {
  id: string;
  name: string;
  specialty: string;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = React.useState<Referral[]>(initialOutgoingReferralsData);
  const [specialists, setSpecialists] = React.useState<Specialist[]>(initialSpecialistNetwork);

  const handleSaveReferral = (data: any) => {
    const newReferral: Referral = {
      id: `REF-${Math.floor(100 + Math.random() * 900).toString().padStart(3, '0')}`,
      patient: data.patient,
      specialist: data.specialist,
      specialty: specialists.find(s => s.name === data.specialist)?.specialty || 'Unknown',
      reason: data.reason,
      urgency: data.urgency,
      status: 'pending',
      date: new Date().toLocaleDateString(),
      apptDate: null,
    };
    setReferrals(prev => [newReferral, ...prev]);
  };

  const handleSaveSpecialist = (data: any) => {
    const newSpecialist: Specialist = {
      id: `SPEC-${Math.floor(100 + Math.random() * 900)}`,
      ...data,
    };
    setSpecialists(prev => [newSpecialist, ...prev]);
  };

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Referral Management</h1>
          <div className="flex items-center gap-2">
            <AddSpecialistDialog onSave={handleSaveSpecialist} />
            <NewReferralDialog onSave={handleSaveReferral} specialists={specialists} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {referralPageStats.map((stat) => (
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

        <Tabs defaultValue="outgoing">
          <TabsList>
            <TabsTrigger value="outgoing">Outgoing Referrals</TabsTrigger>
            <TabsTrigger value="incoming">Incoming Referrals</TabsTrigger>
            <TabsTrigger value="network">Specialist Network</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="outgoing" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Outgoing Referrals</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search referrals..."
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Specialist</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Referral Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.length > 0 ? (
                      referrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell className="font-medium">{referral.patient}</TableCell>
                          <TableCell>
                            <div className="font-medium">{referral.specialist}</div>
                            <div className="text-xs text-muted-foreground">{referral.specialty}</div>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">{referral.reason}</TableCell>
                          <TableCell>
                            <Badge variant={referral.urgency === 'urgent' ? 'destructive' : 'outline'} className="capitalize">
                              {referral.urgency}
                            </Badge>
                          </TableCell>
                          <TableCell>
                             <Badge
                                variant={
                                    referral.status === 'scheduled'
                                    ? 'default'
                                    : 'outline'
                                }
                                className={cn(
                                    "capitalize",
                                    referral.status === 'scheduled' && 'bg-foreground text-background hover:bg-foreground/80',
                                    referral.status === 'completed' && 'bg-green-100 text-green-800 border-transparent hover:bg-green-100/80',
                                )}
                                >
                                {referral.status}
                                </Badge>
                          </TableCell>
                          <TableCell>
                            <div>{referral.date}</div>
                            {referral.apptDate && <div className="text-xs text-muted-foreground">{referral.apptDate}</div>}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-3 w-3" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Send className="mr-2 h-3 w-3" />
                                Follow Up
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No outgoing referrals found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="incoming">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    No incoming referrals found.
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="network">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    No specialists in network found.
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="analytics">
             <Card>
                <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                    Referral analytics will be available here.
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
