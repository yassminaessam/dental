
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PurchaseOrder } from '@/app/suppliers/page';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

interface ViewPurchaseOrderDialogProps {
  order: PurchaseOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPurchaseOrderDialog({ order, open, onOpenChange }: ViewPurchaseOrderDialogProps) {
  const { t, language } = useLanguage();
  if (!order) return null;
  const currency = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP' });
  const formatDate = (value?: string | null) => {
    if (!value) return t('common.na');
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-EG');
  };
  const statusLabel = (s: string) => {
    switch (s) {
      case 'Shipped': return t('suppliers.status.shipped');
      case 'Delivered': return t('suppliers.status.delivered');
      case 'Cancelled': return t('suppliers.status.cancelled');
      default: return s;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('suppliers.purchase_order_title')}: {order.id}</DialogTitle>
          <DialogDescription>
            {t('suppliers.supplier')}: {order.supplierName} · {t('suppliers.order_date')}: {formatDate(order.orderDate)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold">{t('suppliers.supplier')}</h4>
              <p className="text-muted-foreground">{order.supplierName}</p>
            </div>
            <div>
              <h4 className="font-semibold">{t('suppliers.order_date')}</h4>
              <p className="text-muted-foreground">{formatDate(order.orderDate)}</p>
            </div>
            <div>
              <h4 className="font-semibold">{t('suppliers.expected_delivery')}</h4>
              <p className="text-muted-foreground">{formatDate(order.deliveryDate)}</p>
            </div>
          </div>
           <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold">{t('common.status')}</h4>
              <Badge variant={order.status === 'Cancelled' ? 'destructive' : 'outline'}>{statusLabel(order.status)}</Badge>
            </div>
            <div>
              <h4 className="font-semibold">{t('suppliers.total')}</h4>
              <p className="font-mono text-muted-foreground">{currency.format(Number(order.total))}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">{t('suppliers.order_items')}</h4>
            <ScrollArea className="h-48 mt-2 rounded-md border">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>{t('inventory.item')}</TableHead>
                        <TableHead className="text-right">{t('suppliers.quantity')}</TableHead>
                        <TableHead className="text-right">{t('suppliers.unit_price')}</TableHead>
                        <TableHead className="text-right">{t('suppliers.subtotal')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(order.items ?? []).map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.description}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{currency.format(item.unitPrice)}</TableCell>
                                <TableCell className="text-right">{currency.format(item.quantity * item.unitPrice)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
