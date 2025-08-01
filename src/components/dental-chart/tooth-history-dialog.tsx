
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Tooth } from '@/app/dental-chart/page';
import { toothNames } from '@/lib/data/dental-chart-data';
import { ScrollArea } from '../ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface ToothHistoryDialogProps {
  tooth: Tooth | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToothHistoryDialog({ tooth, open, onOpenChange }: ToothHistoryDialogProps) {
  if (!tooth) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Full History for Tooth #{tooth.id}</DialogTitle>
          <DialogDescription>
            {toothNames[tooth.id] || 'Unknown Tooth'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tooth.history.length > 0 ? (
                        tooth.history.slice().reverse().map((entry, index) => (
                            <TableRow key={index}>
                                <TableCell>{entry.date}</TableCell>
                                <TableCell className="capitalize">{entry.condition.replace('-', ' ')}</TableCell>
                                <TableCell>{entry.notes}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                No history found for this tooth.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
