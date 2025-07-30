
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

interface ViewPurchaseOrderDialogProps {
  order: PurchaseOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPurchaseOrderDialog({ order, open, onOpenChange }: ViewPurchaseOrderDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Purchase Order: {order.id}</DialogTitle>
          <DialogDescription>
            For {order.supplier} on {order.orderDate}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 text-sm">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold">Supplier</h4>
              <p className="text-muted-foreground">{order.supplier}</p>
            </div>
            <div>
              <h4 className="font-semibold">Order Date</h4>
              <p className="text-muted-foreground">{order.orderDate}</p>
            </div>
            <div>
              <h4 className="font-semibold">Expected Delivery</h4>
              <p className="text-muted-foreground">{order.deliveryDate || 'N/A'}</p>
            </div>
          </div>
           <div className="grid grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold">Status</h4>
              <Badge variant={order.status === 'Cancelled' ? 'destructive' : 'outline'}>{order.status}</Badge>
            </div>
            <div>
              <h4 className="font-semibold">Total</h4>
              <p className="font-mono text-muted-foreground">{order.total}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">Order Items</h4>
            <ScrollArea className="h-48 mt-2 rounded-md border">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{item.description}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
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
