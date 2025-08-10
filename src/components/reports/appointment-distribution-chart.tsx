
"use client";

import { Pie, PieChart, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useLanguage } from '@/contexts/LanguageContext';

export default function AppointmentDistributionChart({ data }: AppointmentDistributionChartProps) {
  const { t } = useLanguage();
  const chartConfig = {
    "Check-up": { label: t('appointments.type'), color: "hsl(var(--chart-1))" },
    Cleaning: { label: t('appointments.type'), color: "hsl(var(--chart-2))" },
    Filling: { label: t('appointments.type'), color: "hsl(var(--chart-3))" },
    Crown: { label: t('appointments.type'), color: "hsl(var(--chart-4))" },
    Other: { label: t('common.other') || 'Other', color: "hsl(var(--muted))" },
  } satisfies ChartConfig;
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

interface AppointmentDistributionChartProps {
  data: { type: string; count: number; color: string }[];
}
