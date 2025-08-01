import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

// Generic function to fetch all documents from a collection
export async function getCollection<T>(collectionName: string): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

// Generic function to add a document to a collection
export async function addDocument<T extends DocumentData>(collectionName: string, data: T): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), data);
  return docRef.id;
}

// Generic function to set a document with a specific ID
export async function setDocument<T extends DocumentData>(collectionName: string, id: string, data: T): Promise<void> {
  await setDoc(doc(db, collectionName, id), data);
}

// Generic function to update a document
export async function updateDocument<T extends DocumentData>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
  await updateDoc(doc(db, collectionName, id), data);
}

// Generic function to delete a document
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}
