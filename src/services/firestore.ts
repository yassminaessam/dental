
// DEPRECATED: This file is deprecated in favor of the new database service using Neon PostgreSQL
// Please use src/services/database.ts instead
// This file now acts as a pure compatibility layer routing all calls to the database service

import { 
  getCollection as neonGetCollection,
  addDocument as neonAddDocument,
  setDocument as neonSetDocument,
  updateDocument as neonUpdateDocument,
  deleteDocument as neonDeleteDocument,
  listenToCollection as neonListenToCollection
} from './database';

// Collection name mapping from Firebase collections to Prisma models
const COLLECTION_MAPPING: { [key: string]: string } = {
  'patients': 'patient',
  'appointments': 'appointment',
  'treatments': 'treatment',
  'users': 'user',
  'invoices': 'invoice',
  'staff': 'staff',
  'inventory': 'inventoryItem',
  'medical-records': 'medicalRecord',
  'clinical-images': 'clinicalImage',
  'tooth-image-links': 'toothImageLink',
  'insurance-claims': 'insuranceClaim',
  'insurance-providers': 'insuranceProvider',
  'purchase-orders': 'purchaseOrder',
  'suppliers': 'supplier',
  'medications': 'medication',
  'prescriptions': 'prescription',
  'messages': 'message',
  'referrals': 'referral',
  'specialists': 'specialist',
  'portal-users': 'portalUser',
  'shared-documents': 'sharedDocument',
  'transactions': 'transaction',
  'clinic-settings': 'clinicSettings',
  'dental-charts': 'dentalChart',
  'patient-promotions': 'promotion',
  'patient-portal-content': 'portalContent'
};

function mapCollectionName(collectionName: string): string {
  return COLLECTION_MAPPING[collectionName] || collectionName;
}

// Generic function to fetch all documents from a collection
export async function getCollection<T>(collectionName: string): Promise<T[]> {
  const mappedName = mapCollectionName(collectionName);
  return neonGetCollection<T>(mappedName as any);
}

// Generic function to listen to a collection in real-time
export function listenToCollection<T>(
    collectionName: string, 
    callback: (data: T[]) => void,
    onError: (error: Error) => void
): () => void {
    const mappedName = mapCollectionName(collectionName);
    return neonListenToCollection<T>(mappedName as any, callback, onError);
}

// Generic function to add a document to a collection
export async function addDocument<T>(
  collectionName: string, 
  data: any
): Promise<string> {
  const mappedName = mapCollectionName(collectionName);
  const result = await neonAddDocument<T>(mappedName as any, data);
  return (result as any).id;
}

// Generic function to set a document with a specific ID
export async function setDocument<T>(
  collectionName: string, 
  id: string, 
  data: any
): Promise<void> {
  const mappedName = mapCollectionName(collectionName);
  await neonSetDocument<T>(mappedName as any, id, data);
}

// Generic function to update a document
export async function updateDocument<T>(
  collectionName: string, 
  id: string, 
  data: any
): Promise<void> {
  const mappedName = mapCollectionName(collectionName);
  await neonUpdateDocument<T>(mappedName as any, id, data);
}

// Generic function to delete a document
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const mappedName = mapCollectionName(collectionName);
  await neonDeleteDocument(mappedName as any, id);
}
