"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { appointmentTypesData } from "@/lib/data";

const chartConfig = {
  value: {
    label: "Appointments",
  },
  "Check-up": { label: "Check-up", color: "hsl(var(--chart-1))" },
  Cleaning: { label: "Cleaning", color: "hsl(var(--chart-2))" },
  Filling: { label: "Filling", color: "hsl(var(--chart-3))" },
  Crown: { label: "Crown", color: "hsl(var(--chart-4))" },
  "Root Canal": { label: "Root Canal", color: "hsl(var(--chart-5))" },
  Other: { label: "Other", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

export default function AppointmentTypesChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={appointmentTypesData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
        >
          {appointmentTypesData.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
