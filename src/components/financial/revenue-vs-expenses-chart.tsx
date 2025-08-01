"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-5))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface RevenueVsExpensesChartProps {
  data: { month: string; revenue: number; expenses: number; profit: number }[];
}

export default function RevenueVsExpensesChart({ data }: RevenueVsExpensesChartProps) {
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
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `EGP ${value / 1000}k`}
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
          dataKey="profit"
          type="monotone"
          stroke="var(--color-profit)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-profit)", strokeWidth: 2, stroke: "hsl(var(--card))" }}
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
