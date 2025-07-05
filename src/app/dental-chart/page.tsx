
'use client';
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import { dentalChartPatients, dentalChartStats } from "@/lib/data";
import { Download, Printer, RotateCw, Search, User } from "lucide-react";
import InteractiveDentalChart from "@/components/dental-chart/interactive-dental-chart";

export default function DentalChartPage() {
  return (
    <DashboardLayout>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Dental Chart</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <RotateCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              Patient Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {dentalChartPatients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search teeth..."
                className="w-full rounded-lg bg-background pl-8"
              />
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="cavities">Cavities</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="crowned">Crowned</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="root_canal">Root Canal</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {dentalChartStats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className={`h-3 w-3 rounded-full ${stat.color} flex-shrink-0`}></span>
                <div>
                  <div className="text-sm text-muted-foreground">{stat.name}</div>
                  <div className="text-lg font-bold">{stat.count}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <InteractiveDentalChart />
          </div>
          <div className="lg:col-span-1">
            <Card className="flex h-full flex-col items-center justify-center p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Select a Tooth</h3>
                <p className="mt-1 text-center text-sm text-muted-foreground">
                    Click on any tooth in the chart to view details and manage conditions.
                </p>
            </Card>
          </div>
        </div>

      </main>
    </DashboardLayout>
  );
}
