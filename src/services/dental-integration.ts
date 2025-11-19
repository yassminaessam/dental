"use client";

// Client-safe DentalIntegrationService using Neon database
import type { ClinicalImage, MedicalRecord } from '@/lib/types';

export type ToothCondition = string;

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
    toothNumber: number
  ): Promise<void> {
    try {
      // Update the clinical image in Neon database to link it to a tooth
      const response = await fetch(`/api/clinical-images/${imageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toothNumber }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to link image to tooth');
      }
    } catch (error) {
      console.error('Error linking image to tooth:', error);
      throw error;
    }
  }

  static async getPatientImages(patient: string): Promise<ClinicalImage[]> {
    try {
      // Fetch clinical images from Neon database API
      const response = await fetch('/api/clinical-images');
      if (!response.ok) return [];
      
      const { images } = await response.json();
      return images.filter((img: ClinicalImage) => img.patient === patient);
    } catch (error) {
      console.error('Error fetching patient images:', error);
      return [];
    }
  }

  static async getToothImages(toothNumber: number, patient: string): Promise<ClinicalImage[]> {
    try {
      // Fetch clinical images from Neon database API filtered by tooth number
      const response = await fetch('/api/clinical-images');
      if (!response.ok) return [];
      
      const { images } = await response.json();
      
      // Filter images by tooth number and patient
      return images.filter((img: ClinicalImage) => 
        img.toothNumber === toothNumber && img.patient === patient
      );
    } catch (error) {
      console.error('Error fetching tooth images:', error);
      return [];
    }
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
    patientId: string,
    patientName: string,
    imageData: ClinicalImage,
    linkedToothNumber?: number
  ): Promise<string> {
    try {
      // Create medical record in Neon database for the image
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: patientName,
          patientId: patientId,
          type: 'Clinical Note',
          complaint: `Clinical imaging documentation${linkedToothNumber ? ` for Tooth #${linkedToothNumber}` : ''}`,
          provider: 'Dental System',
          providerId: null,
          date: new Date().toISOString(),
          status: 'Final',
          notes: this.generateImageRecordContent(imageData, linkedToothNumber),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create image record');
      }
      
      const { record } = await response.json();
      return record.id;
    } catch (error) {
      console.error('Error creating image record:', error);
      throw error;
    }
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
