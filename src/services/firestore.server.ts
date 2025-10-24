// Firestore compatibility layer backed by Postgres (Prisma)
// Provides collection/document helpers over a JSONB table to remove Firebase.

import prisma from '@/lib/db';
import { UsersService } from '@/services/users';
import type { User } from '@/lib/types';

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
  if (col === 'users') {
    const rows = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return { docs: rows.map((u) => ({ id: u.id, data: () => u })) };
  }
  const rows = await prisma.collectionDoc.findMany({ where: { collection: col }, orderBy: { createdAt: 'desc' } });
  return { docs: rows.map(r => ({ id: r.id, data: () => r.data })) };
}

export async function getDoc(ref: DocRef): Promise<{ exists: () => boolean; data: () => any }> {
  if (ref.__col === 'users') {
    const u = await prisma.user.findUnique({ where: { id: ref.__id } });
    return u ? { exists: () => true, data: () => u } : { exists: () => false, data: () => null };
  }
  const row = await prisma.collectionDoc.findUnique({ where: { collection_id: { collection: ref.__col, id: ref.__id } } });
  return row ? { exists: () => true, data: () => row.data } : { exists: () => false, data: () => null };
}

export function onSnapshot(colRef: ColRef, next: (qs: QS) => void, error?: (e: any) => void) {
  getDocs(colRef).then(next).catch(err => error?.(err));
  return () => { /* no-op */ };
}

export async function getCollection<T>(collectionName: string): Promise<T[]> {
  if (collectionName === 'users') {
    const rows = await UsersService.listAll();
    return rows as unknown as T[];
  }
  const rows = await prisma.collectionDoc.findMany({ where: { collection: collectionName }, orderBy: { createdAt: 'desc' } });
  return rows.map(r => ({ id: r.id, ...(r.data as any) } as T));
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

export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  if (collectionName === 'users') {
    const created = await UsersService.create(data as unknown as User & { password: string });
    return created.id;
  }
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  await prisma.collectionDoc.create({ data: { collection: collectionName, id, data: data as any } });
  return id;
}

export async function setDocument<T extends DocumentData>(
  collectionName: string,
  id: string,
  data: T
): Promise<void> {
  if (collectionName === 'users') {
    await UsersService.update(id, data as unknown as Partial<User>);
    return;
  }
  await prisma.collectionDoc.upsert({
    where: { collection_id: { collection: collectionName, id } },
    create: { collection: collectionName, id, data: data as any },
    update: { data: data as any },
  });
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  id: string,
  patch: Partial<T>
): Promise<void> {
  if (collectionName === 'users') {
    await UsersService.update(id, patch as unknown as Partial<User>);
    return;
  }
  const existing = await prisma.collectionDoc.findUnique({ where: { collection_id: { collection: collectionName, id } } });
  if (!existing) throw new Error(`Document not found: ${collectionName}/${id}`);
  const next = { ...(existing.data as any), ...(patch as any) };
  await prisma.collectionDoc.update({ where: { collection_id: { collection: collectionName, id } }, data: { data: next } });
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  if (collectionName === 'users') {
    await UsersService.update(id, { isActive: false });
    return;
  }
  await prisma.collectionDoc.delete({ where: { collection_id: { collection: collectionName, id } } });
}
