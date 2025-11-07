
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Tooth, ToothCondition } from "@/app/dental-chart/page";
import { useLanguage } from "@/contexts/LanguageContext";
import { Activity } from "lucide-react";

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
            {/* Glow effect for selected tooth */}
            {isSelected && (
                <circle 
                    cx={x} cy={y} r="16" 
                    className="fill-primary opacity-20 animate-pulse"
                />
            )}
            
            {/* Main tooth circle */}
            <circle 
                cx={x} cy={y} r="12" 
                className={cn(
                    colorClass, 
                    'transition-all duration-300 drop-shadow-md',
                    'group-hover:r-[14]',
                    isSelected ? 'stroke-primary stroke-[3] drop-shadow-xl' : 'stroke-border stroke-[1.5]',
                    isHighlighted && !isSelected && 'stroke-black dark:stroke-white stroke-[2.5] animate-pulse'
                )}
                style={{
                    filter: isSelected ? 'drop-shadow(0 0 8px hsl(var(--primary)))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
            />
            
            {/* Tooth number */}
            <text 
                x={x} 
                y={y + 4} 
                textAnchor="middle" 
                fontSize="10" 
                className={cn(
                    'select-none font-bold pointer-events-none',
                    condition === 'missing' || condition === 'cavity' || condition === 'filling' || condition === 'crown' || condition === 'root-canal' 
                        ? 'fill-white drop-shadow-sm' 
                        : 'fill-muted-foreground'
                )}
            >
                {id}
            </text>
            
            {/* Hover ring */}
            <circle 
                cx={x} cy={y} r="15" 
                className="fill-none stroke-primary stroke-1 opacity-0 group-hover:opacity-50 transition-opacity duration-300"
            />
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
  const { t } = useLanguage();
  return (
    <Card className="group relative border-2 border-muted hover:border-cyan-200 dark:hover:border-cyan-900 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden bg-gradient-to-br from-background via-background to-cyan-50/10 dark:to-cyan-950/5">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 group-hover:from-cyan-500/20 group-hover:to-blue-500/20 transition-colors">
            <Activity className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
            {t('dental_chart.interactive_chart')}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 flex flex-col items-center p-6">
        <div className="w-full max-w-4xl bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-inner">
          <svg viewBox="0 0 550 220" className="w-full drop-shadow-lg">
            {/* Upper Jaw Label */}
            <text x="275" y="20" textAnchor="middle" className="text-sm font-bold fill-indigo-600 dark:fill-indigo-400 tracking-wide">
              {t('dental_chart.upper_jaw')}
            </text>
            
            {/* Upper Jaw Curve - Enhanced */}
            <defs>
              <linearGradient id="upperJawGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="lowerJawGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            
            <path d="M 30 60 Q 275 100 520 60" stroke="url(#upperJawGradient)" fill="none" strokeWidth="2" className="drop-shadow-md" />
            
            {/* Upper Teeth */}
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

            {/* Lower Jaw Label */}
            <text x="275" y="195" textAnchor="middle" className="text-sm font-bold fill-indigo-600 dark:fill-indigo-400 tracking-wide">
              {t('dental_chart.lower_jaw')}
            </text>
            
            {/* Lower Jaw Curve - Enhanced */}
            <path d="M 30 140 Q 275 100 520 140" stroke="url(#lowerJawGradient)" fill="none" strokeWidth="2" className="drop-shadow-md" />
            
            {/* Lower Teeth */}
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
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary-foreground shadow-md"></div>
            <span className="font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full bg-black/50 border-2 border-black shadow-md"></div>
            <span className="font-medium">Highlighted</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
