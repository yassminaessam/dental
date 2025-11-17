
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
import { useLanguage } from '@/contexts/LanguageContext';

interface ExpensesByCategoryChartProps {
    data: { name: string; value: number; color: string }[];
}

export default function ExpensesByCategoryChart({ data }: ExpensesByCategoryChartProps) {
  const { t } = useLanguage();
  const chartConfig: ChartConfig = {
    Salaries: { label: t('financial.category.salary'), color: "hsl(var(--chart-1))" },
    Supplies: { label: t('financial.category.supplies'), color: "hsl(var(--chart-2))" },
    Rent: { label: t('financial.category.rent'), color: "hsl(var(--chart-3))" },
    Marketing: { label: t('financial.category.marketing'), color: "hsl(var(--chart-4))" },
    Utilities: { label: t('financial.category.utilities'), color: "hsl(var(--chart-5))" },
    Other: { label: t('financial.category.other'), color: "hsl(var(--muted))" },
  } satisfies ChartConfig;
  const chartData = data.length > 0 ? data : [{ name: t('common.no_data'), value: 1, color: "hsl(var(--muted))" }];
  
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
