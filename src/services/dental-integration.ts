'use client';

import { setDocument, getCollection, updateDocument } from '@/services/firestore.server';
import type { MedicalRecord } from '@/app/medical-records/page';
import type { Tooth, ToothCondition } from '@/app/dental-chart/page';
import type { ClinicalImage } from '@/app/medical-records/page';

export interface DentalTreatmentRecord {
  patient: string;
  type: string;
  complaint: string;
  provider: string;
  date: string;
  status: 'Final' | 'Draft';
  content: string;
  toothNumber?: number;
  toothCondition?: ToothCondition;
  previousCondition?: ToothCondition;
  treatmentType: 'condition_change' | 'treatment_plan' | 'follow_up' | 'clinical_image';
  relatedImageIds?: string[];
}

export interface ToothImageLink {
  imageId: string;
  toothNumber: number;
  patient: string;
  linkDate: string;
  imageType: string;
}

export class DentalIntegrationService {
  
  /**
   * Automatically create a medical record when tooth condition changes
   */
  static async createTreatmentRecord(
    patientId: string, 
    patientName: string,
    toothId: number, 
    oldCondition: ToothCondition, 
    newCondition: ToothCondition,
    notes?: string
  ): Promise<string> {
    const treatmentRecord: DentalTreatmentRecord = {
      patient: patientName,
      type: 'Treatment Plan',
      complaint: `Tooth #${toothId} condition change: ${oldCondition} → ${newCondition}`,
      provider: 'Dental System',
      date: new Date().toLocaleDateString(),
      status: 'Final',
      content: this.generateTreatmentContent(toothId, oldCondition, newCondition, notes),
      toothNumber: toothId,
      toothCondition: newCondition,
      previousCondition: oldCondition,
      treatmentType: 'condition_change'
    };

    const recordId = `dental_${patientId}_${toothId}_${Date.now()}`;
    await setDocument('medical-records', recordId, treatmentRecord);
    return recordId;
  }

  /**
   * Link clinical images to specific tooth numbers
   */
  static async linkImageToTooth(
    imageId: string, 
    toothNumber: number, 
    patient: string, 
    imageType: string
  ): Promise<void> {
    const linkData: ToothImageLink = {
      imageId,
      toothNumber,
      patient,
      linkDate: new Date().toLocaleDateString(),
      imageType
    };

    await setDocument('tooth-image-links', `${imageId}_${toothNumber}`, linkData);
  }

  /**
   * Get all images for a patient
   */
  static async getPatientImages(patient: string): Promise<ClinicalImage[]> {
    try {
      console.log('Fetching all images for patient:', patient);
      const images = await getCollection('clinical-images') as ClinicalImage[];
      return images.filter(image => image.patient === patient);
    } catch (error) {
      console.error('Error fetching patient images:', error);
      return [];
    }
  }

  /**
   * Get all images linked to a specific tooth
   */
  static async getToothImages(toothNumber: number, patient: string): Promise<ClinicalImage[]> {
    try {
      console.log('Fetching tooth images for tooth:', toothNumber, 'patient:', patient);
      
      const links = await getCollection('tooth-image-links') as ToothImageLink[];
      console.log('All tooth-image-links:', links);
      
      const relevantLinks = links.filter(link => 
        link.toothNumber === toothNumber && link.patient === patient
      );
      console.log('Relevant links for this tooth:', relevantLinks);

      if (relevantLinks.length === 0) {
        console.log('No links found for this tooth');
        return [];
      }

      const images = await getCollection('clinical-images') as ClinicalImage[];
      console.log('All clinical images:', images);
      
      const filteredImages = images.filter(image => 
        relevantLinks.some(link => link.imageId === image.id)
      );
      console.log('Filtered images for this tooth:', filteredImages);
      
      return filteredImages;
    } catch (error) {
      console.error('Error fetching tooth images:', error);
      return [];
    }
  }

  /**
   * Get all medical records related to a specific tooth
   */
  static async getToothMedicalRecords(toothNumber: number, patient: string): Promise<MedicalRecord[]> {
    try {
      const records = await getCollection('medical-records') as (MedicalRecord & DentalTreatmentRecord)[];
      return records.filter(record => 
        record.toothNumber === toothNumber && record.patient === patient
      );
    } catch (error) {
      console.error('Error fetching tooth medical records:', error);
      return [];
    }
  }

  /**
   * Create follow-up record for treatment completion
   */
  static async createFollowUpRecord(
    patientId: string,
    patientName: string,
    toothId: number,
    treatmentNotes: string,
    nextAppointment?: string
  ): Promise<string> {
    const followUpRecord: DentalTreatmentRecord = {
      patient: patientName,
      type: 'Clinical Note',
      complaint: `Follow-up treatment for Tooth #${toothId}`,
      provider: 'Dental System',
      date: new Date().toLocaleDateString(),
      status: 'Final',
      content: this.generateFollowUpContent(toothId, treatmentNotes, nextAppointment),
      toothNumber: toothId,
      treatmentType: 'follow_up'
    };

    const recordId = `followup_${patientId}_${toothId}_${Date.now()}`;
    await setDocument('medical-records', recordId, followUpRecord);
    return recordId;
  }

  /**
   * Generate treatment plan content based on tooth condition change
   */
  private static generateTreatmentContent(
    toothId: number, 
    oldCondition: ToothCondition, 
    newCondition: ToothCondition,
    notes?: string
  ): string {
    const toothName = this.getToothName(toothId);
    const treatmentPlan = this.getTreatmentPlan(newCondition);
    
    return `
DENTAL TREATMENT PLAN - Tooth #${toothId}
============================================

Tooth: ${toothName}
Previous Condition: ${oldCondition.replace('-', ' ').toUpperCase()}
Current Condition: ${newCondition.replace('-', ' ').toUpperCase()}
Date: ${new Date().toLocaleDateString()}

CLINICAL FINDINGS:
- Tooth #${toothId} condition changed from ${oldCondition} to ${newCondition}
${notes ? `- Additional Notes: ${notes}` : ''}

TREATMENT PLAN:
${treatmentPlan}

NEXT STEPS:
- Schedule treatment appointment
- Take pre-treatment clinical images if needed
- Patient education on condition and treatment
- Follow-up assessment post-treatment

Generated automatically from Dental Chart update.
    `.trim();
  }

  /**
   * Generate follow-up content
   */
  private static generateFollowUpContent(
    toothId: number, 
    treatmentNotes: string,
    nextAppointment?: string
  ): string {
    const toothName = this.getToothName(toothId);
    
    return `
TREATMENT FOLLOW-UP - Tooth #${toothId}
=====================================

Tooth: ${toothName}
Date: ${new Date().toLocaleDateString()}

TREATMENT COMPLETED:
${treatmentNotes}

STATUS:
- Treatment completed successfully
- Patient advised on post-treatment care
- No immediate complications observed

${nextAppointment ? `NEXT APPOINTMENT: ${nextAppointment}` : 'NEXT APPOINTMENT: To be scheduled as needed'}

RECOMMENDATIONS:
- Continue regular oral hygiene
- Monitor for any discomfort or complications
- Return for regular checkups
    `.trim();
  }

  /**
   * Get treatment plan based on condition
   */
  private static getTreatmentPlan(condition: ToothCondition): string {
    const plans = {
      'cavity': `
- Prepare tooth for filling procedure
- Remove decayed material
- Apply appropriate filling material (composite/amalgam)
- Check bite and polish
- Post-treatment care instructions`,
      
      'filling': `
- Assessment of existing filling
- Replacement if necessary
- Check for secondary decay
- Verify proper fit and function`,
      
      'crown': `
- Tooth preparation for crown placement
- Impression taking
- Temporary crown placement
- Permanent crown fitting and cementation
- Bite adjustment`,
      
      'root-canal': `
- Endodontic treatment planning
- Root canal procedure
- Canal cleaning and shaping
- Filling and sealing of canals
- Crown placement if indicated`,
      
      'missing': `
- Replacement options evaluation
- Implant consultation if applicable
- Bridge or partial denture planning
- Adjacent teeth assessment`,
      
      'healthy': `
- Maintain current oral hygiene
- Regular preventive care
- Monitor for any changes
- Continue routine checkups`
    };

    return plans[condition] || 'Standard dental care protocol';
  }

  /**
   * Get tooth name by number (simplified)
   */
  private static getToothName(toothId: number): string {
    const toothNames: Record<number, string> = {
      11: 'Upper Right Central Incisor', 12: 'Upper Right Lateral Incisor',
      13: 'Upper Right Canine', 14: 'Upper Right First Premolar',
      15: 'Upper Right Second Premolar', 16: 'Upper Right First Molar',
      17: 'Upper Right Second Molar', 18: 'Upper Right Third Molar',
      21: 'Upper Left Central Incisor', 22: 'Upper Left Lateral Incisor',
      23: 'Upper Left Canine', 24: 'Upper Left First Premolar',
      25: 'Upper Left Second Premolar', 26: 'Upper Left First Molar',
      27: 'Upper Left Second Molar', 28: 'Upper Left Third Molar',
      31: 'Lower Left Central Incisor', 32: 'Lower Left Lateral Incisor',
      33: 'Lower Left Canine', 34: 'Lower Left First Premolar',
      35: 'Lower Left Second Premolar', 36: 'Lower Left First Molar',
      37: 'Lower Left Second Molar', 38: 'Lower Left Third Molar',
      41: 'Lower Right Central Incisor', 42: 'Lower Right Lateral Incisor',
      43: 'Lower Right Canine', 44: 'Lower Right First Premolar',
      45: 'Lower Right Second Premolar', 46: 'Lower Right First Molar',
      47: 'Lower Right Second Molar', 48: 'Lower Right Third Molar'
    };
    
    return toothNames[toothId] || `Tooth #${toothId}`;
  }

  /**
   * Create image-based medical record
   */
  static async createImageRecord(
    patientName: string,
    imageData: ClinicalImage,
    linkedToothNumber?: number
  ): Promise<string> {
    const imageRecord: DentalTreatmentRecord = {
      patient: patientName,
      type: 'Clinical Note',
      complaint: `Clinical imaging documentation${linkedToothNumber ? ` for Tooth #${linkedToothNumber}` : ''}`,
      provider: 'Dental System',
      date: new Date().toLocaleDateString(),
      status: 'Final',
      content: this.generateImageRecordContent(imageData, linkedToothNumber),
      toothNumber: linkedToothNumber,
      treatmentType: 'clinical_image',
      relatedImageIds: [imageData.id]
    };

    const recordId = `image_record_${imageData.id}_${Date.now()}`;
    await setDocument('medical-records', recordId, imageRecord);
    return recordId;
  }

  /**
   * Generate content for image-based records
   */
  private static generateImageRecordContent(
    imageData: ClinicalImage,
    toothNumber?: number
  ): string {
    return `
CLINICAL IMAGING DOCUMENTATION
=============================

Image Type: ${imageData.type}
Date: ${imageData.date}
${toothNumber ? `Related Tooth: #${toothNumber} (${this.getToothName(toothNumber)})` : 'General Documentation'}

CLINICAL NOTES:
${imageData.caption || 'Clinical image for diagnostic purposes'}

IMAGE DETAILS:
- Image ID: ${imageData.id}
- File Type: Clinical Image
- Quality: Diagnostic Grade

CLINICAL ASSESSMENT:
- Image captured for documentation
- Part of comprehensive dental examination
${toothNumber ? `- Specific evaluation of tooth #${toothNumber}` : '- General oral health assessment'}

Generated automatically from clinical image upload.
    `.trim();
  }
}
