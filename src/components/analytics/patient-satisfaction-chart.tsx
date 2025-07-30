
"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { patientSatisfactionData } from "@/lib/data";

const chartConfig = {
  score: {
    label: "Satisfaction Score",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function PatientSatisfactionChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <AreaChart
        accessibilityLayer
        data={patientSatisfactionData}
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
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          domain={[4.0, 5.0]}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <defs>
            <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0.1}/>
            </linearGradient>
        </defs>
        <Area
          dataKey="score"
          type="natural"
          fill="url(#fillScore)"
          stroke="var(--color-score)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
