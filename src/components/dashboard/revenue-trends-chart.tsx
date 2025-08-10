
"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useLanguage } from "@/contexts/LanguageContext";

interface RevenueTrendsChartProps {
    data: { month: string; revenue: number; expenses: number }[];
}

export default function RevenueTrendsChart({ data }: RevenueTrendsChartProps) {
  const { t } = useLanguage();
  const chartConfig: ChartConfig = {
    revenue: {
      label: t('common.revenue'),
      color: "hsl(var(--chart-1))",
    },
    expenses: {
      label: t('common.expenses'),
      color: "hsl(var(--chart-5))",
    },
  };
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          top: 20,
          left: 12,
          right: 12,
          bottom: 0,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value}`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Line
          dataKey="revenue"
          type="monotone"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-revenue)", strokeWidth: 2, stroke: "hsl(var(--card))" }}
        />
        <Line
          dataKey="expenses"
          type="monotone"
          stroke="var(--color-expenses)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-expenses)", strokeWidth: 2, stroke: "hsl(var(--card))" }}
        />
      </LineChart>
    </ChartContainer>
  );
}
