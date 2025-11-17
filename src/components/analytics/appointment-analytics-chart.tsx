
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useLanguage } from '@/contexts/LanguageContext';

interface AppointmentAnalyticsChartProps {
    data: { time: string; appointments: number; noShows: number; cancellations: number; }[]
}

export default function AppointmentAnalyticsChart({ data }: AppointmentAnalyticsChartProps) {
  const { language, t } = useLanguage();
  const chartConfig: ChartConfig = {
    appointments: { label: t('appointments.title'), color: "hsl(var(--chart-1))" },
    noShows: { label: t('reports.appointment_show_rate'), color: "hsl(var(--chart-5))" },
    cancellations: { label: t('appointments.filter.cancelled'), color: "hsl(var(--chart-3))" },
  };
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
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
          tickFormatter={(v) => String(v)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v) => new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(Number(v))}
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
