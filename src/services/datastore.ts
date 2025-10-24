"use client";

export {
  db,
  collection,
  doc,
  query,
  where,
  writeBatch,
  getDocs,
  getDoc,
  onSnapshot,
  getCollection,
  listenToCollection,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  generateDocumentId,
} from '@/services/firestore';

export {
  listCollection,
  readDocument,
  saveDocument,
  createDocument,
  patchDocument,
  removeDocument,
} from '@/lib/collections-client';

