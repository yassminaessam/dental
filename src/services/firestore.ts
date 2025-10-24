'use client';

import {
  createDocument as apiCreateDocument,
  deleteDocument as apiDeleteDocument,
  generateDocumentId,
  getDocument as apiGetDocument,
  listCollection as apiListCollection,
  setDocument as apiSetDocument,
  updateDocument as apiUpdateDocument,
} from '@/lib/collections-client';

export const db = {} as any; // placeholder to keep call sites unchanged

export type DocumentData = Record<string, any>;

type DocRef = { __type: 'doc'; __col: string; __id: string };
type ColRef = { __type: 'col'; __col: string };

export function collection(_db: any, collectionName: string): ColRef {
  return { __type: 'col', __col: collectionName };
}

export function doc(_db: any, collectionName: string, id: string): DocRef {
  return { __type: 'doc', __col: collectionName, __id: id };
}

export function query<T>(arg: T, ..._rest: any[]): T { return arg; }
export function where(..._args: any[]): any { return {}; }

export function writeBatch(_dbHandle: any) {
  const ops: Array<() => Promise<void>> = [];
  return {
    set(ref: DocRef, data: any) { ops.push(async () => { await setDocument(ref.__col, ref.__id, data); }); },
    update(ref: DocRef, data: any) { ops.push(async () => { await updateDocument(ref.__col, ref.__id, data); }); },
    delete(ref: DocRef) { ops.push(async () => { await deleteDocument(ref.__col, ref.__id); }); },
    async commit() { for (const op of ops) await op(); }
  };
}

type QSDoc = { id: string; data: () => any; ref?: DocRef };
type QS = { docs: QSDoc[] };

export async function getDocs(colRef: ColRef | any): Promise<QS> {
  const col = (colRef && colRef.__col) || '';
  const rows = await apiListCollection<Record<string, unknown>>(col);
  return {
    docs: rows.map((row) => ({
      id: String((row as Record<string, unknown>).id ?? ''),
      data: () => row,
    })),
  };
}

export async function getDoc(ref: DocRef): Promise<{ exists: () => boolean; data: () => any }> {
  const document = await apiGetDocument<Record<string, unknown>>(ref.__col, ref.__id);
  return document
    ? { exists: () => true, data: () => document }
    : { exists: () => false, data: () => null };
}

export function onSnapshot(colRef: ColRef, next: (qs: QS) => void, error?: (e: any) => void) {
  getDocs(colRef).then(next).catch(err => error?.(err));
  return () => { /* no-op */ };
}

export async function getCollection<T>(collectionName: string): Promise<T[]> {
  return apiListCollection<T>(collectionName);
}

export function listenToCollection<T>(
  collectionName: string,
  callback: (data: T[]) => void,
  onError: (error: Error) => void
): () => void {
  (async () => {
    try {
      const data = await getCollection<T>(collectionName);
      callback(data);
    } catch (e: any) {
      onError(e);
    }
  })();
  return () => {};
}

export async function addDocument<T extends DocumentData>(collectionName: string, data: T): Promise<string> {
  return apiCreateDocument(collectionName, data);
}

export async function setDocument<T extends DocumentData>(
  collectionName: string,
  id: string,
  data: T
): Promise<void> {
  await apiSetDocument(collectionName, id, data);
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  id: string,
  patch: Partial<T>
): Promise<void> {
  await apiUpdateDocument(collectionName, id, patch);
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  await apiDeleteDocument(collectionName, id);
}

export { generateDocumentId };
