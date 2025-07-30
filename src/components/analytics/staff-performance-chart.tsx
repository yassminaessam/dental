
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { staffPerformanceData } from "@/lib/data";

const chartConfig = {
  appointments: {
    label: "Appointments",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function StaffPerformanceChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <BarChart
        accessibilityLayer
        data={staffPerformanceData}
        layout="vertical"
        margin={{
          top: 20,
          left: 12,
          right: 12,
          bottom: 5,
        }}
      >
        <CartesianGrid horizontal={false} />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="appointments" fill="var(--color-appointments)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
