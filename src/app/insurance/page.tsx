
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
import { initialInsuranceClaimsData, insurancePageStats } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Download, Search, CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import { NewClaimDialog } from "@/components/insurance/new-claim-dialog";
import { useToast } from '@/hooks/use-toast';

export type Claim = {
  id: string;
  patient: string;
  patientId: string;
  insurance: string;
  procedure: string;
  procedureCode: string;
  amount: string;
  approvedAmount: string | null;
  status: 'Approved' | 'Processing' | 'Denied';
  statusReason?: string;
  submitDate: string;
};

export default function InsurancePage() {
  const [claims, setClaims] = React.useState<Claim[]>(initialInsuranceClaimsData);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const { toast } = useToast();

  const handleSaveClaim = (data: any) => {
    const newClaim: Claim = {
      id: `CLM-${Math.floor(100 + Math.random() * 900).toString().padStart(3, '0')}`,
      patient: data.patient,
      patientId: 'DC' + Math.floor(100000000 + Math.random() * 900000000),
      insurance: data.insurance,
      procedure: data.procedure,
      procedureCode: data.procedureCode,
      amount: `$${parseFloat(data.amount).toFixed(2)}`,
      approvedAmount: null,
      status: 'Processing',
      submitDate: new Date(data.submitDate).toLocaleDateString(),
    };
    setClaims(prev => [newClaim, ...prev]);
    toast({
      title: "Claim Submitted",
      description: `New claim for ${newClaim.patient} has been submitted for processing.`,
    });
  };

  const filteredClaims = React.useMemo(() => {
    return claims
      .filter(claim =>
        claim.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.procedure.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(claim =>
        statusFilter === 'all' || claim.status.toLowerCase() === statusFilter
      );
  }, [claims, searchTerm, statusFilter]);

  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Insurance Claims</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Claims
            </Button>
            <NewClaimDialog onSave={handleSaveClaim} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {insurancePageStats.map((stat) => (
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

        <Tabs defaultValue="claims-management">
          <TabsList>
            <TabsTrigger value="claims-management">
              Claims Management
            </TabsTrigger>
            <TabsTrigger value="insurance-providers">
              Insurance Providers
            </TabsTrigger>
            <TabsTrigger value="claims-reports">Claims Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="claims-management" className="mt-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <CardTitle>Insurance Claims</CardTitle>
                <div className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search claims..."
                      className="w-full rounded-lg bg-background pl-8 lg:w-[336px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Insurance</TableHead>
                      <TableHead>Procedure</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submit Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.length > 0 ? (
                      filteredClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">
                            {claim.id}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{claim.patient}</div>
                            <div className="text-xs text-muted-foreground">{claim.patientId}</div>
                          </TableCell>
                          <TableCell>{claim.insurance}</TableCell>
                          <TableCell>
                            <div className="font-medium">{claim.procedure}</div>
                             <div className="text-xs text-muted-foreground">{claim.procedureCode}</div>
                          </TableCell>
                          <TableCell>
                            <div>{claim.amount}</div>
                            {claim.approvedAmount && (
                                <div className="text-xs text-green-600">Approved: {claim.approvedAmount}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                claim.status === "Approved" ? "default" : 
                                claim.status === "Denied" ? "destructive" : "outline"
                              }
                              className={cn(
                                "capitalize",
                                claim.status === 'Approved' && 'bg-foreground text-background hover:bg-foreground/80',
                                claim.status === 'Denied' && 'bg-red-600 text-white border-transparent hover:bg-red-600/80',
                              )}
                            >
                               {claim.status === 'Approved' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                               {claim.status === 'Processing' && <Clock className="mr-1 h-3 w-3" />}
                               {claim.status === 'Denied' && <XCircle className="mr-1 h-3 w-3" />}
                               {claim.status}
                            </Badge>
                            {claim.statusReason && (
                                <div className="text-xs text-red-600 mt-1">{claim.statusReason}</div>
                            )}
                          </TableCell>
                          <TableCell>{claim.submitDate}</TableCell>
                          <TableCell className="text-right">
                             <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-3 w-3" />
                                View
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No claims found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="insurance-providers">
            <Card>
              <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                Insurance provider information will be available here.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="claims-reports">
            <Card>
              <CardContent className="h-48 text-center text-muted-foreground flex items-center justify-center p-6">
                Claims reports will be available here.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
