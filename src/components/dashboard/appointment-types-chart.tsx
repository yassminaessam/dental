
"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";

const chartConfig = {
  "Check-up": { label: "Check-up", color: "hsl(var(--chart-1))" },
  Cleaning: { label: "Cleaning", color: "hsl(var(--chart-2))" },
  Filling: { label: "Filling", color: "hsl(var(--chart-3))" },
  Crown: { label: "Crown", color: "hsl(var(--chart-4))" },
  "Root Canal": { label: "Root Canal", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig;

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name
}: any) => {
  const radius = outerRadius * 1.25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      className="text-xs text-muted-foreground"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name} ${Math.round(percent * 100)}%`}
    </text>
  );
};

interface AppointmentTypesChartProps {
    data: { name: string; value: number; color: string }[];
}

export default function AppointmentTypesChart({ data }: AppointmentTypesChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[300px]"
    >
      <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
        >
          {data.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
