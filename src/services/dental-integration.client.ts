// Client-safe DentalIntegrationService replacement. Uses fetch endpoints
// to avoid bundling Prisma in the browser.
"use client";

export interface ToothImage {
  id: string;
  toothId: string;
  imageUrl?: string;
  caption?: string;
  takenAt?: string;
}

export interface ToothMedicalRecord {
  id: string;
  toothId: string;
  type?: string;
  notes?: string;
  createdAt?: string;
}

export class DentalIntegrationService {
  static async getToothImages(toothId: string): Promise<ToothImage[]> {
    const res = await fetch(`/api/dental/tooth-images?toothId=${encodeURIComponent(toothId)}`);
    if (!res.ok) throw new Error('Failed to load tooth images');
    const json = await res.json();
    const items: ToothImage[] = json.items || [];
    return items.filter(i => i.toothId === toothId);
  }

  static async getToothMedicalRecords(toothId: string): Promise<ToothMedicalRecord[]> {
    const res = await fetch(`/api/dental/tooth-records?toothId=${encodeURIComponent(toothId)}`);
    if (!res.ok) throw new Error('Failed to load tooth medical records');
    const json = await res.json();
    const items: ToothMedicalRecord[] = json.items || [];
    return items.filter(r => r.toothId === toothId);
  }

  static async createTreatmentRecord(record: Omit<ToothMedicalRecord, 'id'>): Promise<string> {
    const res = await fetch('/api/dental/tooth-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error('Failed to create tooth medical record');
    const json = await res.json();
    return json.id as string;
  }
}

export default DentalIntegrationService;