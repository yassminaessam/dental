"use client";

// Client-safe DentalIntegrationService. Replaces legacy Prisma-coupled implementation.
import { listCollection, createDocument, generateDocumentId } from '@/lib/collections-client';
import type { ClinicalImage, MedicalRecord } from '@/lib/types';

export type ToothCondition = string; // Simplified placeholder

// Extend base MedicalRecord with tooth-specific metadata without redefining core fields.
export interface DentalTreatmentRecord extends MedicalRecord {
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
  static async createTreatmentRecord(
    patientId: string,
    patientName: string,
    toothId: number,
    oldCondition: ToothCondition,
    newCondition: ToothCondition,
    notes?: string
  ): Promise<string> {
    try {
      // Create medical record in Neon database
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: patientName,
          patientId: patientId,
          type: 'Treatment Plan',
          complaint: `Tooth #${toothId} condition change: ${oldCondition} → ${newCondition}`,
          provider: 'Dental System',
          providerId: null,
          date: new Date().toISOString(),
          status: 'Final',
          notes: this.generateTreatmentContent(toothId, oldCondition, newCondition, notes),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create medical record');
      }
      
      const { record } = await response.json();
      return record.id;
    } catch (error) {
      console.error('Error creating treatment record:', error);
      throw error;
    }
  }

  static async linkImageToTooth(
    imageId: string,
    toothNumber: number,
    patient: string,
    imageType: string
  ): Promise<string> {
    const link: ToothImageLink = {
      imageId,
      toothNumber,
      patient,
      linkDate: new Date().toISOString(),
      imageType
    };
    return createDocument('tooth-image-links', link as unknown as Record<string, unknown>);
  }

  static async getPatientImages(patient: string): Promise<ClinicalImage[]> {
    const images = await listCollection<ClinicalImage>('clinical-images');
    return images.filter(img => img.patient === patient);
  }

  static async getToothImages(toothNumber: number, patient: string): Promise<ClinicalImage[]> {
    const links = await listCollection<ToothImageLink>('tooth-image-links');
    const relevantIds = links
      .filter(l => l.toothNumber === toothNumber && l.patient === patient)
      .map(l => l.imageId);
    if (relevantIds.length === 0) return [];
    const images = await listCollection<ClinicalImage>('clinical-images');
    return images.filter(img => relevantIds.includes(img.id));
  }

  static async getToothMedicalRecords(toothNumber: number, patient: string): Promise<MedicalRecord[]> {
    try {
      // Fetch all medical records from Neon database
      const response = await fetch('/api/medical-records');
      if (!response.ok) return [];
      
      const { records } = await response.json();
      
      // Filter records that mention this tooth number in the complaint or notes
      return records.filter((r: MedicalRecord) => 
        r.patient === patient && 
        (r.complaint?.includes(`Tooth #${toothNumber}`) || r.notes?.includes(`Tooth #${toothNumber}`))
      );
    } catch (error) {
      console.error('Error fetching tooth medical records:', error);
      return [];
    }
  }

  static async createFollowUpRecord(
    patientId: string,
    patientName: string,
    toothId: number,
    treatmentNotes: string,
    nextAppointment?: string
  ): Promise<string> {
    try {
      // Create follow-up record in Neon database
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: patientName,
          patientId: patientId,
          type: 'Clinical Note',
          complaint: `Follow-up treatment for Tooth #${toothId}`,
          provider: 'Dental System',
          providerId: null,
          date: new Date().toISOString(),
          status: 'Final',
          notes: this.generateFollowUpContent(toothId, treatmentNotes, nextAppointment),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create follow-up record');
      }
      
      const { record } = await response.json();
      return record.id;
    } catch (error) {
      console.error('Error creating follow-up record:', error);
      throw error;
    }
  }

  static async createImageRecord(
    patientName: string,
    imageData: ClinicalImage,
    linkedToothNumber?: number
  ): Promise<string> {
    const record: DentalTreatmentRecord = {
      id: generateDocumentId('mr'),
      patient: patientName,
      type: 'Clinical Note',
      complaint: `Clinical imaging documentation${linkedToothNumber ? ` for Tooth #${linkedToothNumber}` : ''}`,
      provider: 'Dental System',
      date: new Date().toISOString(),
      status: 'Final',
      notes: this.generateImageRecordContent(imageData, linkedToothNumber),
      toothNumber: linkedToothNumber,
      treatmentType: 'clinical_image',
      relatedImageIds: [imageData.id]
    };
    return createDocument('medical-records', record as unknown as Record<string, unknown>);
  }

  private static generateTreatmentContent(
    toothId: number,
    oldCondition: ToothCondition,
    newCondition: ToothCondition,
    notes?: string
  ): string {
    return [
      `Tooth #${toothId} condition changed: ${oldCondition} → ${newCondition}`,
      notes ? `Notes: ${notes}` : null,
      'Plan: Schedule treatment; capture images; patient education.'
    ].filter(Boolean).join('\n');
  }

  private static generateFollowUpContent(
    toothId: number,
    treatmentNotes: string,
    nextAppointment?: string
  ): string {
    return [
      `Follow-up for Tooth #${toothId}`,
      `Treatment Notes: ${treatmentNotes}`,
      `Next Appointment: ${nextAppointment || 'TBD'}`
    ].join('\n');
  }

  private static generateImageRecordContent(
    imageData: ClinicalImage,
    toothNumber?: number
  ): string {
    return [
      `Image ${imageData.id} (${imageData.type}) date ${imageData.date}`,
      toothNumber ? `Linked Tooth: #${toothNumber}` : 'General documentation',
      imageData.caption ? `Caption: ${imageData.caption}` : null
    ].filter(Boolean).join('\n');
  }
}

export default DentalIntegrationService;
