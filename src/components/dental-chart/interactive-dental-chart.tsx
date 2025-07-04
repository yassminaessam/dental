
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const upperJawTeeth = [
  { id: 18, x: 50, y: 50 }, { id: 17, x: 80, y: 45 }, { id: 16, x: 110, y: 42 }, { id: 15, x: 140, y: 40 }, { id: 14, x: 170, y: 40 }, { id: 13, x: 200, y: 42 }, { id: 12, x: 230, y: 45 }, { id: 11, x: 260, y: 50 },
  { id: 21, x: 290, y: 50 }, { id: 22, x: 320, y: 45 }, { id: 23, x: 350, y: 42 }, { id: 24, x: 380, y: 40 }, { id: 25, x: 410, y: 40 }, { id: 26, x: 440, y: 42 }, { id: 27, x: 470, y: 45 }, { id: 28, x: 500, y: 50 },
];

const lowerJawTeeth = [
  { id: 48, x: 50, y: 150 }, { id: 47, x: 80, y: 155 }, { id: 46, x: 110, y: 158 }, { id: 45, x: 140, y: 160 }, { id: 44, x: 170, y: 160 }, { id: 43, x: 200, y: 158 }, { id: 42, x: 230, y: 155 }, { id: 41, x: 260, y: 150 },
  { id: 31, x: 290, y: 150 }, { id: 32, x: 320, y: 155 }, { id: 33, x: 350, y: 158 }, { id: 34, x: 380, y: 160 }, { id: 35, x: 410, y: 160 }, { id: 36, x: 440, y: 158 }, { id: 37, x: 470, y: 155 }, { id: 38, x: 500, y: 150 },
];

const legendItems = [
    { name: 'Healthy', color: 'bg-green-500' },
    { name: 'Cavity', color: 'bg-red-500' },
    { name: 'Filled', color: 'bg-blue-500' },
    { name: 'Crowned', color: 'bg-purple-500' },
    { name: 'Missing', color: 'bg-gray-500' },
    { name: 'Root Canal', color: 'bg-yellow-500' },
];


const Tooth = ({ id, x, y }: { id: number; x: number; y: number }) => (
  <g className="cursor-pointer group">
    <circle cx={x} cy={y} r="12" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" className="group-hover:fill-accent transition-colors" />
    <text x={x} y={y + 3} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" className="select-none font-medium group-hover:fill-accent-foreground">
      {id}
    </text>
  </g>
);


export default function InteractiveDentalChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Dental Chart</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <svg viewBox="0 0 550 220" className="w-full">
          <text x="275" y="20" textAnchor="middle" className="text-sm font-semibold fill-muted-foreground">Upper Jaw (Maxilla)</text>
          <path d="M 30 60 Q 275 100 520 60" stroke="hsl(var(--border))" fill="none" strokeWidth="1" />
          {upperJawTeeth.map(tooth => <Tooth key={tooth.id} {...tooth} />)}

          <text x="275" y="195" textAnchor="middle" className="text-sm font-semibold fill-muted-foreground">Lower Jaw (Mandible)</text>
          <path d="M 30 140 Q 275 100 520 140" stroke="hsl(var(--border))" fill="none" strokeWidth="1" />
          {lowerJawTeeth.map(tooth => <Tooth key={tooth.id} {...tooth} />)}
        </svg>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
          {legendItems.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`h-3 w-3 rounded-full ${item.color}`} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
