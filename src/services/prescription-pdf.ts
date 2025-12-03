import { jsPDF } from 'jspdf';

interface PrescriptionData {
  id: string;
  patientName: string;
  patientPhone?: string;
  doctorName: string;
  medicationName: string;
  strength?: string;
  dosage?: string;
  instructions?: string;
  duration?: string;
  refills: number;
  createdAt?: string;
}

interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email?: string;
  logo?: string;
}

const defaultClinicInfo: ClinicInfo = {
  name: 'Cairo Dental Clinic',
  address: 'Cairo, Egypt',
  phone: '+20 123 456 789',
  email: 'info@cairodental.com',
};

export async function generatePrescriptionPDF(
  prescription: PrescriptionData,
  clinicInfo: ClinicInfo = defaultClinicInfo,
  language: 'en' | 'ar' = 'en'
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // Prescription paper size
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Colors
  const primaryColor: [number, number, number] = [0, 120, 180];
  const textColor: [number, number, number] = [50, 50, 50];
  const lightGray: [number, number, number] = [150, 150, 150];

  // Helper to add text
  const addText = (text: string, x: number, y: number, options: { size?: number; color?: [number, number, number]; style?: string; align?: 'left' | 'center' | 'right' | 'justify' } = {}) => {
    doc.setFontSize(options.size || 10);
    const color = options.color || textColor;
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', options.style || 'normal');
    doc.text(text, x, y, options.align ? { align: options.align } : undefined);
  };

  // Header - Clinic Info
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(clinicInfo.name, pageWidth / 2, 10, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(clinicInfo.address, pageWidth / 2, 16, { align: 'center' });
  doc.text(`Tel: ${clinicInfo.phone}`, pageWidth / 2, 21, { align: 'center' });

  yPos = 35;

  // Prescription Title
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIPTION', pageWidth / 2, yPos, { align: 'center' });
  
  // Rx Symbol
  doc.setFontSize(24);
  doc.text('℞', margin, yPos + 5);

  yPos += 15;

  // Divider line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 10;

  // Patient & Date Info
  const dateStr = prescription.createdAt 
    ? new Date(prescription.createdAt).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  addText('Date:', margin, yPos, { style: 'bold', size: 9, color: lightGray });
  addText(dateStr, margin + 15, yPos, { size: 9 });
  
  addText('Rx No:', pageWidth - margin - 30, yPos, { style: 'bold', size: 9, color: lightGray });
  addText(prescription.id.slice(0, 8).toUpperCase(), pageWidth - margin, yPos, { size: 9, align: 'right' });

  yPos += 8;

  addText('Patient:', margin, yPos, { style: 'bold', size: 9, color: lightGray });
  addText(prescription.patientName, margin + 18, yPos, { size: 10, style: 'bold' });

  if (prescription.patientPhone) {
    yPos += 6;
    addText('Phone:', margin, yPos, { style: 'bold', size: 9, color: lightGray });
    addText(prescription.patientPhone, margin + 18, yPos, { size: 9 });
  }

  yPos += 10;

  // Medication Section
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 3, 3, 'F');

  yPos += 8;

  addText('Medication:', margin + 5, yPos, { style: 'bold', size: 9, color: lightGray });
  yPos += 6;
  
  const medText = prescription.strength 
    ? `${prescription.medicationName} (${prescription.strength})`
    : prescription.medicationName;
  addText(medText, margin + 5, yPos, { size: 12, style: 'bold', color: primaryColor });

  yPos += 8;

  if (prescription.dosage) {
    addText('Dosage:', margin + 5, yPos, { style: 'bold', size: 9, color: lightGray });
    addText(prescription.dosage, margin + 22, yPos, { size: 10 });
    yPos += 6;
  }

  if (prescription.duration) {
    addText('Duration:', margin + 5, yPos, { style: 'bold', size: 9, color: lightGray });
    addText(prescription.duration, margin + 24, yPos, { size: 10 });
    yPos += 6;
  }

  yPos += 10;

  // Instructions Section
  if (prescription.instructions) {
    addText('Instructions:', margin, yPos, { style: 'bold', size: 10 });
    yPos += 6;
    
    // Word wrap instructions
    const maxWidth = pageWidth - 2 * margin;
    const lines = doc.splitTextToSize(prescription.instructions, maxWidth);
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    lines.forEach((line: string) => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });
  }

  yPos += 5;

  // Refills
  addText(`Refills: ${prescription.refills}`, margin, yPos, { size: 9 });

  yPos += 15;

  // Divider
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 10;

  // Doctor Signature Area
  addText('Prescribing Physician:', margin, yPos, { style: 'bold', size: 9, color: lightGray });
  yPos += 6;
  addText(`Dr. ${prescription.doctorName}`, margin, yPos, { size: 11, style: 'bold' });

  yPos += 15;

  // Signature line
  doc.setDrawColor(...textColor);
  doc.line(margin, yPos, margin + 50, yPos);
  addText('Signature', margin + 15, yPos + 5, { size: 8, color: lightGray });

  // Footer
  const footerY = pageHeight - 15;
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  addText('This prescription is valid for 30 days from the date of issue.', pageWidth / 2, footerY, { 
    size: 7, 
    color: lightGray, 
    align: 'center' 
  });
  addText(`Generated by ${clinicInfo.name} Management System`, pageWidth / 2, footerY + 4, { 
    size: 6, 
    color: lightGray, 
    align: 'center' 
  });

  return doc.output('blob');
}

export function downloadPrescriptionPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function printPrescription(prescription: PrescriptionData, clinicInfo?: ClinicInfo) {
  const blob = await generatePrescriptionPDF(prescription, clinicInfo);
  const url = URL.createObjectURL(blob);
  
  // Open in new window for printing
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  
  // Clean up after a delay
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
