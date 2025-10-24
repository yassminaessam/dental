"use client";

import {
  generateDocumentId,
  listCollection,
  readDocument,
  saveDocument,
  patchDocument,
  removeDocument,
} from '@/lib/collections-client';
import type {
  ClinicalImage,
  MedicalRecord,
  MedicalRecordStatus,
  MedicalRecordTemplate,
} from '@/lib/types';

const RECORDS_COLLECTION = 'medical-records';
const IMAGES_COLLECTION = 'clinical-images';
const TEMPLATES_COLLECTION = 'templates';

export interface MedicalRecordCreateInput {
  patient: string;
  type: string;
  complaint?: string;
  provider: string;
  date: string;
  status?: MedicalRecordStatus;
  notes?: string;
}

export type MedicalRecordUpdateInput = MedicalRecord;

export interface ClinicalImageCreateInput {
  patient: string;
  type: string;
  date: string;
  imageUrl: string;
  caption?: string;
}

export type ClinicalImageUpdateInput = Partial<ClinicalImage>;

export interface MedicalRecordTemplateCreateInput {
  name: string;
  type: string;
  content: string;
}

export type MedicalRecordTemplateUpdateInput = MedicalRecordTemplate;

export async function listMedicalRecords(): Promise<MedicalRecord[]> {
  return listCollection<MedicalRecord>(RECORDS_COLLECTION);
}

export async function getMedicalRecord(id: string): Promise<MedicalRecord | null> {
  return readDocument<MedicalRecord>(RECORDS_COLLECTION, id);
}

export async function createMedicalRecord(input: MedicalRecordCreateInput): Promise<MedicalRecord> {
  const record: MedicalRecord = {
    id: generateDocumentId('MR'),
    patient: input.patient,
    type: input.type,
    complaint: input.complaint ?? '',
    provider: input.provider,
    date: input.date,
    status: input.status ?? 'Final',
    notes: input.notes ?? '',
  };

  await saveDocument(RECORDS_COLLECTION, record.id, record);
  return record;
}

export async function updateMedicalRecord(record: MedicalRecordUpdateInput): Promise<MedicalRecord> {
  await saveDocument(RECORDS_COLLECTION, record.id, record);
  return record;
}

export async function patchMedicalRecord(id: string, patch: Partial<MedicalRecord>): Promise<void> {
  await patchDocument<MedicalRecord>(RECORDS_COLLECTION, id, patch);
}

export async function removeMedicalRecord(id: string): Promise<void> {
  await removeDocument(RECORDS_COLLECTION, id);
}

export async function listClinicalImages(): Promise<ClinicalImage[]> {
  return listCollection<ClinicalImage>(IMAGES_COLLECTION);
}

export async function createClinicalImage(input: ClinicalImageCreateInput): Promise<ClinicalImage> {
  const image: ClinicalImage = {
    id: generateDocumentId('IMG'),
    ...input,
  };

  await saveDocument(IMAGES_COLLECTION, image.id, image);
  return image;
}

export async function updateClinicalImage(image: ClinicalImage): Promise<ClinicalImage> {
  await saveDocument(IMAGES_COLLECTION, image.id, image);
  return image;
}

export async function patchClinicalImage(id: string, patch: ClinicalImageUpdateInput): Promise<void> {
  await patchDocument<ClinicalImage>(IMAGES_COLLECTION, id, patch);
}

export async function removeClinicalImage(id: string): Promise<void> {
  await removeDocument(IMAGES_COLLECTION, id);
}

export async function listMedicalRecordTemplates(): Promise<MedicalRecordTemplate[]> {
  return listCollection<MedicalRecordTemplate>(TEMPLATES_COLLECTION);
}

export async function createMedicalRecordTemplate(
  input: MedicalRecordTemplateCreateInput,
): Promise<MedicalRecordTemplate> {
  const template: MedicalRecordTemplate = {
    id: generateDocumentId('TPL'),
    ...input,
  };

  await saveDocument(TEMPLATES_COLLECTION, template.id, template);
  return template;
}

export async function updateMedicalRecordTemplate(
  template: MedicalRecordTemplateUpdateInput,
): Promise<MedicalRecordTemplate> {
  await saveDocument(TEMPLATES_COLLECTION, template.id, template);
  return template;
}

export async function removeMedicalRecordTemplate(id: string): Promise<void> {
  await removeDocument(TEMPLATES_COLLECTION, id);
}
