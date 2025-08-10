
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
import { useLanguage } from '@/contexts/LanguageContext';

interface ToothHistoryDialogProps {
  tooth: Tooth | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToothHistoryDialog({ tooth, open, onOpenChange }: ToothHistoryDialogProps) {
  const { t } = useLanguage();
  if (!tooth) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('dental_chart.full_history_for_tooth', { id: tooth.id })}</DialogTitle>
          <DialogDescription>
            {toothNames[tooth.id] || t('dental_chart.unknown_tooth')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-72">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('common.date')}</TableHead>
                        <TableHead>{t('dental_chart.condition')}</TableHead>
                        <TableHead>{t('dental_chart.notes')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tooth.history.length > 0 ? (
                        tooth.history.slice().reverse().map((entry, index) => (
                            <TableRow key={index}>
                                <TableCell>{entry.date}</TableCell>
                                <TableCell className="capitalize">
                                  {(() => {
                                    switch (entry.condition) {
                                      case 'healthy': return t('dental_chart.healthy');
                                      case 'cavity': return t('dental_chart.cavity');
                                      case 'filling': return t('dental_chart.filled');
                                      case 'crown': return t('dental_chart.crowned');
                                      case 'missing': return t('dental_chart.missing');
                                      case 'root-canal': return t('dental_chart.root_canal');
                                    }
                                  })()}
                                </TableCell>
                                <TableCell>{entry.notes}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                {t('dental_chart.no_history_for_tooth', { id: tooth.id })}
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
