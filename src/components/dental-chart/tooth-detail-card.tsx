
'use client';

import type { Tooth, ToothCondition } from '@/app/dental-chart/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toothNames } from '@/lib/data/dental-chart-data';
import { Search, X } from 'lucide-react';

const conditionOptions: { value: ToothCondition, label: string }[] = [
    { value: 'healthy', label: 'Healthy' },
    { value: 'cavity', label: 'Cavity' },
    { value: 'filling', label: 'Filling' },
    { value: 'crown', label: 'Crown' },
    { value: 'missing', label: 'Missing' },
    { value: 'root-canal', label: 'Root Canal' },
];

interface ToothDetailCardProps {
    tooth: Tooth | null;
    onUpdateCondition: (toothId: number, condition: ToothCondition) => void;
    onViewHistory: (tooth: Tooth) => void;
    onClose: () => void;
}

export function ToothDetailCard({ tooth, onUpdateCondition, onViewHistory, onClose }: ToothDetailCardProps) {

    if (!tooth) {
        return (
            <Card className="flex h-full flex-col items-center justify-center p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Select a Tooth</h3>
                <p className="mt-1 text-center text-sm text-muted-foreground">
                    Click on any tooth in the chart to view details and manage conditions.
                </p>
            </Card>
        );
    }

    return (
        <Card className="relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
            <CardHeader>
                <CardTitle>Tooth #{tooth.id}</CardTitle>
                <CardDescription>{toothNames[tooth.id] || 'Unknown Tooth'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium">Current Condition</h4>
                        <p className="capitalize text-muted-foreground">{tooth.condition.replace('-', ' ')}</p>
                    </div>
                    <div>
                        <h4 className="mb-2 font-medium">Update Condition</h4>
                        <Select
                            value={tooth.condition}
                            onValueChange={(value: ToothCondition) => onUpdateCondition(tooth.id, value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                                {conditionOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div>
                        <h4 className="font-medium">History</h4>
                        <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                            {tooth.history.length > 0 ? (
                                tooth.history.slice(-3).reverse().map((entry, index) => (
                                    <div key={index}>
                                        <p><strong>{entry.date}:</strong> <span className="capitalize">{entry.condition.replace('-', ' ')}</span></p>
                                        <p className="text-xs pl-2">- {entry.notes}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No history for this tooth.</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => onViewHistory(tooth)}>
                    View Full History
                </Button>
            </CardFooter>
        </Card>
    );
}
