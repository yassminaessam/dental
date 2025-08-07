
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

// Generic function to fetch all documents from a collection
export async function getCollection<T>(collectionName: string): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

// Generic function to listen to a collection in real-time
export function listenToCollection<T>(
    collectionName: string, 
    callback: (data: T[]) => void,
    onError: (error: Error) => void
): () => void {
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
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, data as any);
}

// Generic function to update a document
export async function updateDocument<T extends DocumentData>(
  collectionName: string, 
  id: string, 
  data: PartialWithFieldValue<T>
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data as any);
}

// Generic function to delete a document
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}
