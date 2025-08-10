
"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useLanguage } from '@/contexts/LanguageContext';

function useChartConfig(): ChartConfig {
  const { t } = useLanguage();
  return {
    count: {
      label: t('treatments.title'),
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;
}

interface TreatmentVolumeChartProps {
    data: { month: string; count: number }[];
}

export default function TreatmentVolumeChart({ data }: TreatmentVolumeChartProps) {
  const { language } = useLanguage();
  const chartConfig = useChartConfig();
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <LineChart
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
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(v) => String(v).slice(0, 3)}
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
        <Line
          dataKey="count"
          type="monotone"
          stroke="var(--color-count)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-count)", strokeWidth: 2, stroke: "hsl(var(--card))" }}
        />
      </LineChart>
    </ChartContainer>
  );
}

    