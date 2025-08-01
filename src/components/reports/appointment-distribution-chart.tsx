
"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

const chartConfig = {
  "Check-up": { label: "Check-up", color: "hsl(var(--chart-1))" },
  Cleaning: { label: "Cleaning", color: "hsl(var(--chart-2))" },
  Filling: { label: "Filling", color: "hsl(var(--chart-3))" },
  Crown: { label: "Crown", color: "hsl(var(--chart-4))" },
  Other: { label: "Other", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

interface AppointmentDistributionChartProps {
    data: { type: string; count: number; color: string }[];
}

export default function AppointmentDistributionChart({ data }: AppointmentDistributionChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={data}
          dataKey="count"
          nameKey="type"
          innerRadius={50}
          outerRadius={100}
          strokeWidth={2}
        >
          {data.map((entry) => (
            <Cell key={`cell-${entry.type}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
