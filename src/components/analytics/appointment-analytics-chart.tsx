
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { appointmentAnalyticsData } from "@/lib/data";

const chartConfig = {
  appointments: {
    label: "Appointments",
    color: "hsl(var(--chart-1))",
  },
  noShows: {
    label: "No Shows",
    color: "hsl(var(--chart-5))",
  },
  cancellations: {
    label: "Cancellations",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function AppointmentAnalyticsChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <BarChart
        accessibilityLayer
        data={appointmentAnalyticsData}
        margin={{
          top: 20,
          left: 12,
          right: 12,
          bottom: 5,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Legend />
        <Bar dataKey="appointments" fill="var(--color-appointments)" radius={4} />
        <Bar dataKey="noShows" fill="var(--color-noShows)" radius={4} />
        <Bar dataKey="cancellations" fill="var(--color-cancellations)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
