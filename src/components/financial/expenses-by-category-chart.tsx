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
import { expensesByCategoryData } from "@/lib/data";

const chartConfig = {
  Salaries: { label: "Salaries", color: "hsl(var(--chart-1))" },
  Supplies: { label: "Supplies", color: "hsl(var(--chart-2))" },
  Rent: { label: "Rent", color: "hsl(var(--chart-3))" },
  Marketing: { label: "Marketing", color: "hsl(var(--chart-4))" },
  Other: { label: "Other", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

export default function ExpensesByCategoryChart() {
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
          data={expensesByCategoryData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
          {expensesByCategoryData.map((entry) => (
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
