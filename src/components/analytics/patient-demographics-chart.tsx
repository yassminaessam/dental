
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useLanguage } from '@/contexts/LanguageContext';

interface PatientDemographicsChartProps {
  data: { ageGroup: string; count: number }[];
}

export default function PatientDemographicsChart({ data }: PatientDemographicsChartProps) {
  const { language, t } = useLanguage();
  const chartConfig: ChartConfig = {
    count: {
      label: t('patients.title'),
      color: "hsl(var(--chart-1))",
    },
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
          dataKey="ageGroup"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
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
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
