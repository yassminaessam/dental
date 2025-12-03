'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  CreditCard, 
  Loader2,
  ExternalLink,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

type SupplierDetails = {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  category?: string | null;
  paymentTerms?: string | null;
  rating?: number | null;
  status: 'Active' | 'Inactive';
};

interface SupplierInfoDialogProps {
  supplierId?: string | null;
  supplierName?: string | null;
  itemName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierInfoDialog({ 
  supplierId, 
  supplierName,
  itemName,
  open, 
  onOpenChange 
}: SupplierInfoDialogProps) {
  const { t, isRTL } = useLanguage();
  const [supplier, setSupplier] = React.useState<SupplierDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && supplierId) {
      setLoading(true);
      setError(null);
      fetch(`/api/suppliers/${supplierId}`)
        .then(res => {
          if (!res.ok) throw new Error('Supplier not found');
          return res.json();
        })
        .then(data => {
          setSupplier(data.supplier);
        })
        .catch(err => {
          console.error('Failed to fetch supplier:', err);
          setError(t('inventory.supplier_not_found'));
        })
        .finally(() => setLoading(false));
    } else if (open && !supplierId) {
      setSupplier(null);
      setError(null);
    }
  }, [open, supplierId, t]);

  const renderStars = (rating: number | null | undefined) => {
    const value = rating ?? 0;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-gray-300 dark:text-gray-600"
            )}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {value > 0 ? `${value}/5` : t('common.na')}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t('inventory.supplier_info')}
          </DialogTitle>
          {itemName && (
            <DialogDescription className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('inventory.supplier_for_item')}: <strong>{itemName}</strong>
            </DialogDescription>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : !supplierId ? (
          <div className="py-6 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium mb-1">{t('inventory.no_supplier_assigned')}</p>
            <p className="text-sm text-muted-foreground">
              {supplierName || t('inventory.no_supplier_info')}
            </p>
          </div>
        ) : supplier ? (
          <div className="space-y-4">
            {/* Supplier Name & Status */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{supplier.name}</h3>
                {supplier.category && (
                  <p className="text-sm text-muted-foreground">{supplier.category}</p>
                )}
              </div>
              <Badge variant={supplier.status === 'Active' ? 'default' : 'secondary'}>
                {supplier.status === 'Active' ? t('common.active') : t('common.inactive')}
              </Badge>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t('suppliers.contact_info') || 'Contact Information'}
              </h4>
              
              {supplier.phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('suppliers.phone') || t('common.phone')}</p>
                    <a 
                      href={`tel:${supplier.phone}`} 
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {supplier.phone}
                    </a>
                  </div>
                </div>
              )}

              {supplier.email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('suppliers.email') || 'Email'}</p>
                    <a 
                      href={`mailto:${supplier.email}`} 
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {supplier.email}
                    </a>
                  </div>
                </div>
              )}

              {supplier.address && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('suppliers.address') || 'Address'}</p>
                    <p className="text-sm font-medium">{supplier.address}</p>
                  </div>
                </div>
              )}

              {!supplier.phone && !supplier.email && !supplier.address && (
                <p className="text-sm text-muted-foreground italic">
                  {t('inventory.no_contact_info')}
                </p>
              )}
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t('suppliers.payment_terms')}
                </p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {supplier.paymentTerms || t('common.na')}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t('suppliers.rating') || 'Rating'}
                </p>
                {renderStars(supplier.rating)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {supplier.phone && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${supplier.phone}`}>
                    <Phone className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('common.call') || 'Call'}
                  </a>
                </Button>
              )}
              {supplier.email && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${supplier.email}`}>
                    <Mail className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                    {t('common.email') || 'Email'}
                  </a>
                </Button>
              )}
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => {
                  window.location.href = `/suppliers?highlight=${supplier.id}`;
                }}
              >
                <ExternalLink className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {t('inventory.view_supplier_page') || 'View Supplier'}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
