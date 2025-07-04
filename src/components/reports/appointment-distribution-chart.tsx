"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { reportsAppointmentDistributionData } from "@/lib/data";

const chartConfig = {
  "Check-up": { label: "Check-up", color: "hsl(var(--chart-1))" },
  Cleaning: { label: "Cleaning", color: "hsl(var(--chart-2))" },
  Filling: { label: "Filling", color: "hsl(var(--chart-3))" },
  Crown: { label: "Crown", color: "hsl(var(--chart-4))" },
  Other: { label: "Other", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

export default function AppointmentDistributionChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={reportsAppointmentDistributionData}
          dataKey="count"
          nameKey="type"
          innerRadius={50}
          outerRadius={100}
          strokeWidth={2}
        >
          {reportsAppointmentDistributionData.map((entry) => (
            <Cell key={`cell-${entry.type}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
