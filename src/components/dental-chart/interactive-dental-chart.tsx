
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Tooth, ToothCondition } from "@/app/dental-chart/page";

const upperJawTeeth = [
  { id: 18, x: 50, y: 50 }, { id: 17, x: 80, y: 45 }, { id: 16, x: 110, y: 42 }, { id: 15, x: 140, y: 40 }, { id: 14, x: 170, y: 40 }, { id: 13, x: 200, y: 42 }, { id: 12, x: 230, y: 45 }, { id: 11, x: 260, y: 50 },
  { id: 21, x: 290, y: 50 }, { id: 22, x: 320, y: 45 }, { id: 23, x: 350, y: 42 }, { id: 24, x: 380, y: 40 }, { id: 25, x: 410, y: 40 }, { id: 26, x: 440, y: 42 }, { id: 27, x: 470, y: 45 }, { id: 28, x: 500, y: 50 },
];

const lowerJawTeeth = [
  { id: 48, x: 50, y: 150 }, { id: 47, x: 80, y: 155 }, { id: 46, x: 110, y: 158 }, { id: 45, x: 140, y: 160 }, { id: 44, x: 170, y: 160 }, { id: 43, x: 200, y: 158 }, { id: 42, x: 230, y: 155 }, { id: 41, x: 260, y: 150 },
  { id: 31, x: 290, y: 150 }, { id: 32, x: 320, y: 155 }, { id: 33, x: 350, y: 158 }, { id: 34, x: 380, y: 160 }, { id: 35, x: 410, y: 160 }, { id: 36, x: 440, y: 158 }, { id: 37, x: 470, y: 155 }, { id: 38, x: 500, y: 150 },
];

const conditionColors: Record<ToothCondition, string> = {
    healthy: 'fill-green-200',
    cavity: 'fill-red-500',
    filling: 'fill-blue-500',
    crown: 'fill-purple-500',
    missing: 'fill-gray-400',
    'root-canal': 'fill-yellow-500'
};

interface ToothProps {
  id: number;
  x: number;
  y: number;
  condition: ToothCondition;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: (id: number) => void;
}

const ToothComponent = ({ id, x, y, condition, isSelected, isHighlighted, onSelect }: ToothProps) => {
    const colorClass = conditionColors[condition] || 'fill-card';
    return (
        <g className="cursor-pointer group" onClick={() => onSelect(id)}>
            <circle 
                cx={x} cy={y} r="12" 
                className={cn(
                    colorClass, 
                    'stroke-border transition-all',
                    isSelected ? 'stroke-primary stroke-2' : 'stroke-1',
                    isHighlighted && !isSelected && 'stroke-black stroke-2'
                )}
            />
            <text x={x} y={y + 3} textAnchor="middle" fontSize="10" 
                className={cn(
                    'select-none font-medium',
                    condition === 'missing' || condition === 'cavity' || condition === 'filling' || condition === 'crown' ? 'fill-white' : 'fill-muted-foreground'
                )}
            >
            {id}
            </text>
        </g>
    )
};

interface InteractiveDentalChartProps {
    chartData: Record<number, Tooth>;
    selectedToothId: number | null;
    highlightedCondition: ToothCondition | 'all';
    onToothSelect: (toothId: number) => void;
}

export default function InteractiveDentalChart({ chartData, selectedToothId, highlightedCondition, onToothSelect }: InteractiveDentalChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Dental Chart</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <svg viewBox="0 0 550 220" className="w-full">
          <text x="275" y="20" textAnchor="middle" className="text-sm font-semibold fill-muted-foreground">Upper Jaw (Maxilla)</text>
          <path d="M 30 60 Q 275 100 520 60" stroke="hsl(var(--border))" fill="none" strokeWidth="1" />
          {upperJawTeeth.map(tooth => {
            const currentCondition = chartData[tooth.id]?.condition || 'healthy';
            return (
              <ToothComponent 
                  key={tooth.id} 
                  {...tooth} 
                  condition={currentCondition}
                  isSelected={selectedToothId === tooth.id}
                  isHighlighted={highlightedCondition !== 'all' && currentCondition === highlightedCondition}
                  onSelect={onToothSelect}
              />
            )
          })}

          <text x="275" y="195" textAnchor="middle" className="text-sm font-semibold fill-muted-foreground">Lower Jaw (Mandible)</text>
          <path d="M 30 140 Q 275 100 520 140" stroke="hsl(var(--border))" fill="none" strokeWidth="1" />
          {lowerJawTeeth.map(tooth => {
             const currentCondition = chartData[tooth.id]?.condition || 'healthy';
             return (
               <ToothComponent 
                  key={tooth.id} 
                  {...tooth} 
                  condition={currentCondition}
                  isSelected={selectedToothId === tooth.id}
                  isHighlighted={highlightedCondition !== 'all' && currentCondition === highlightedCondition}
                  onSelect={onToothSelect}
              />
            )
          })}
        </svg>
      </CardContent>
    </Card>
  );
}
