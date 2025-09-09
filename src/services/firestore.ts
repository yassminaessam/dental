
// DEPRECATED: This file is deprecated in favor of the new database service using Neon PostgreSQL
// Please use src/services/database.ts instead

import { 
  getCollection as neonGetCollection,
  addDocument as neonAddDocument,
  setDocument as neonSetDocument,
  updateDocument as neonUpdateDocument,
  deleteDocument as neonDeleteDocument,
  listenToCollection as neonListenToCollection
} from './database';

// Legacy Firebase imports - keeping for backwards compatibility during migration
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  WithFieldValue,
  PartialWithFieldValue,
} from 'firebase/firestore';

// Migration flag - set to true to use new Neon database, false to use Firebase
const USE_NEON_DATABASE = process.env.USE_NEON_DATABASE === 'true';

// Generic function to fetch all documents from a collection
export async function getCollection<T>(collectionName: string): Promise<T[]> {
  if (USE_NEON_DATABASE) {
    return neonGetCollection<T>(collectionName as any);
  }
  
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

// Generic function to listen to a collection in real-time
export function listenToCollection<T>(
    collectionName: string, 
    callback: (data: T[]) => void,
    onError: (error: Error) => void
): () => void {
    if (USE_NEON_DATABASE) {
      return neonListenToCollection<T>(collectionName as any, callback, onError);
    }
    
    const q = collection(db, collectionName);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        callback(data);
    }, (error) => {
        console.error(`Error listening to ${collectionName}: `, error);
        onError(error);
    });
    return unsubscribe;
}

// Generic function to add a document to a collection
export async function addDocument<T extends DocumentData>(
  collectionName: string, 
  data: WithFieldValue<T>
): Promise<string> {
  if (USE_NEON_DATABASE) {
    const result = await neonAddDocument<T>(collectionName as any, data);
    return (result as any).id;
  }
  
  const collectionRef = collection(db, collectionName);
  const docRef = await addDoc(collectionRef, data as any);
  return docRef.id;
}

// Generic function to set a document with a specific ID
export async function setDocument<T extends DocumentData>(
  collectionName: string, 
  id: string, 
  data: WithFieldValue<T>
): Promise<void> {
  if (USE_NEON_DATABASE) {
    await neonSetDocument<T>(collectionName as any, id, data);
    return;
  }
  
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, data as any);
}

// Generic function to update a document
export async function updateDocument<T extends DocumentData>(
  collectionName: string, 
  id: string, 
  data: PartialWithFieldValue<T>
): Promise<void> {
  if (USE_NEON_DATABASE) {
    await neonUpdateDocument<T>(collectionName as any, id, data);
    return;
  }
  
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data as any);
}

// Generic function to delete a document
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  if (USE_NEON_DATABASE) {
    await neonDeleteDocument(collectionName as any, id);
    return;
  }
  
  await deleteDoc(doc(db, collectionName, id));
}
