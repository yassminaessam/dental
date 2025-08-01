
"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

const chartConfig = {
  Salaries: { label: "Salaries", color: "hsl(var(--chart-1))" },
  Supplies: { label: "Supplies", color: "hsl(var(--chart-2))" },
  Rent: { label: "Rent", color: "hsl(var(--chart-3))" },
  Marketing: { label: "Marketing", color: "hsl(var(--chart-4))" },
  Utilities: { label: "Utilities", color: "hsl(var(--chart-5))" },
  Other: { label: "Other", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

interface ExpensesByCategoryChartProps {
    data: { name: string; value: number; color: string }[];
}

export default function ExpensesByCategoryChart({ data }: ExpensesByCategoryChartProps) {
  const chartData = data.length > 0 ? data : [{ name: "No Data", value: 1, color: "hsl(var(--muted))" }];
  
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-full"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
          {chartData.map((entry) => (
             <Cell key={`cell-${entry.name}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartLegend
            content={<ChartLegendContent nameKey="name" />}
            className="-mt-4 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
