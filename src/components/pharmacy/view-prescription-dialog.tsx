
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Prescription } from '@/app/pharmacy/page';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock, Download, Printer, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { generatePrescriptionPDF, downloadPrescriptionPDF, printPrescription } from '@/services/prescription-pdf';
import { toast } from 'sonner';

interface ViewPrescriptionDialogProps {
  prescription: Prescription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPrescriptionDialog({ prescription, open, onOpenChange }: ViewPrescriptionDialogProps) {
  const { t } = useLanguage();
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  if (!prescription) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printPrescription({
        id: prescription.id,
        patientName: prescription.patientName,
        doctorName: prescription.doctorName,
        medicationName: prescription.medicationName,
        strength: prescription.strength,
        dosage: prescription.dosage,
        instructions: prescription.instructions,
        duration: prescription.duration,
        refills: prescription.refills,
        createdAt: prescription.createdAt,
      });
      toast.success(t('pharmacy.print_started'));
    } catch (error) {
      console.error('Error printing prescription:', error);
      toast.error(t('pharmacy.print_error'));
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await generatePrescriptionPDF({
        id: prescription.id,
        patientName: prescription.patientName,
        doctorName: prescription.doctorName,
        medicationName: prescription.medicationName,
        strength: prescription.strength,
        dosage: prescription.dosage,
        instructions: prescription.instructions,
        duration: prescription.duration,
        refills: prescription.refills,
        createdAt: prescription.createdAt,
      });
      
      const filename = `prescription-${prescription.id.slice(0, 8)}-${prescription.patientName.replace(/\s+/g, '_')}.pdf`;
      downloadPrescriptionPDF(blob, filename);
      toast.success(t('pharmacy.download_success'));
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error(t('pharmacy.download_error'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('pharmacy.prescription_details')}: {prescription.id.slice(0, 8).toUpperCase()}</DialogTitle>
          <DialogDescription>
            {t('pharmacy.prescribed_by_on', {
              doctor: prescription.doctorName,
              date: prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : ''
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">{t('common.patient')}</h4>
              <p className="text-muted-foreground">{prescription.patientName}</p>
            </div>
            <div>
              <h4 className="font-semibold">{t('common.doctor')}</h4>
              <p className="text-muted-foreground">{prescription.doctorName}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">{t('pharmacy.medication')}</h4>
            <p className="text-muted-foreground">{prescription.medicationName} ({prescription.strength})</p>
          </div>
          <div>
            <h4 className="font-semibold">{t('pharmacy.instructions')}</h4>
            <p className="text-muted-foreground">{prescription.dosage}</p>
            {prescription.instructions && (
              <p className="text-muted-foreground mt-1">{prescription.instructions}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{prescription.duration}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">{t('pharmacy.refills')}</h4>
              <p className="text-muted-foreground">{prescription.refills}</p>
            </div>
            <div>
              <h4 className="font-semibold">{t('common.status')}</h4>
              <div>
                <Badge
                    variant={prescription.status === 'Active' ? 'default' : 'outline'}
                    className={cn(
                        prescription.status === 'Active' && 'bg-foreground text-background hover:bg-foreground/80',
                        prescription.status === 'Completed' && 'bg-green-100 text-green-800 border-transparent'
                    )}
                    >
                    {prescription.status === 'Active' ? <Clock className="mr-1 h-3 w-3" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {prescription.status === 'Active' ? t('common.active') : t('common.completed')}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t('pharmacy.download_pdf')}
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
          >
            {isPrinting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            {t('pharmacy.print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
