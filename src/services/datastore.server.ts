// Prisma-backed datastore providing document-style helpers for existing features.
// Ensure this module is server-only and never bundled on the client.
import 'server-only';

import prisma from '@/lib/db';
import { UsersService } from '@/services/users';
import type { User } from '@/lib/types';

type PrismaUser = Awaited<ReturnType<typeof prisma.user.findMany>>[number];
type PrismaCollectionDoc = Awaited<ReturnType<typeof prisma.collectionDoc.findMany>>[number];

export const db = {} as unknown; // placeholder to keep legacy call sites unchanged

export type DocumentData = Record<string, any>;

type DocRef = { __type: 'doc'; __col: string; __id: string };
type ColRef = { __type: 'col'; __col: string };

declare const crypto: { randomUUID?: () => string };

export function collection(_db: unknown, collectionName: string): ColRef {
  return { __type: 'col', __col: collectionName };
}

export function doc(_db: unknown, collectionName: string, id: string): DocRef {
  return { __type: 'doc', __col: collectionName, __id: id };
}

export function query<T>(arg: T, ..._rest: unknown[]): T {
  return arg;
}
export function where(..._args: unknown[]): Record<string, never> {
  return {};
}

export function writeBatch(_dbHandle: unknown) {
  const ops: Array<() => Promise<void>> = [];
  return {
    set(ref: DocRef, data: unknown) {
      ops.push(async () => {
        await setDocument(ref.__col, ref.__id, data as DocumentData);
      });
    },
    update(ref: DocRef, data: unknown) {
      ops.push(async () => {
        await updateDocument(ref.__col, ref.__id, data as DocumentData);
      });
    },
    delete(ref: DocRef) {
      ops.push(async () => {
        await deleteDocument(ref.__col, ref.__id);
      });
    },
    async commit() {
      for (const op of ops) await op();
    }
  };
}

type QSDoc = { id: string; data: () => unknown; ref?: DocRef };
type QS = { docs: QSDoc[] };

export async function getDocs(colRef: ColRef | unknown): Promise<QS> {
  const col = (colRef as ColRef | undefined)?.__col ?? '';
  if (col === 'users') {
    const rows = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return {
      docs: rows.map((u: PrismaUser): QSDoc => ({ id: u.id, data: () => u }))
    };
  }
  const rows = await prisma.collectionDoc.findMany({
    where: { collection: col },
    orderBy: { createdAt: 'desc' }
  });
  return {
    docs: rows.map((r: PrismaCollectionDoc): QSDoc => ({ id: r.id, data: () => r.data }))
  };
}

export async function getDoc(ref: DocRef): Promise<{ exists: () => boolean; data: () => unknown }>
{
  if (ref.__col === 'users') {
    const u = await prisma.user.findUnique({ where: { id: ref.__id } });
    return u ? { exists: () => true, data: () => u } : { exists: () => false, data: () => null };
  }
  const row = await prisma.collectionDoc.findUnique({
    where: { collection_id: { collection: ref.__col, id: ref.__id } }
  });
  return row ? { exists: () => true, data: () => row.data } : { exists: () => false, data: () => null };
}

export function onSnapshot(colRef: ColRef, next: (qs: QS) => void, error?: (e: Error) => void) {
  getDocs(colRef)
    .then(next)
    .catch((err) => error?.(err));
  return () => {
    /** noop */
  };
}

export async function getCollection<T>(collectionName: string): Promise<T[]> {
  if (collectionName === 'users') {
    const rows = await UsersService.listAll();
    return rows as unknown as T[];
  }
  const rows = await prisma.collectionDoc.findMany({
    where: { collection: collectionName },
    orderBy: { createdAt: 'desc' }
  });
  return rows.map((r: PrismaCollectionDoc) => ({
    id: r.id,
    ...(r.data as Record<string, unknown>)
  } as T));
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
    } catch (e) {
      onError(e as Error);
    }
  })();
  return () => {};
}

export async function addDocument<T extends DocumentData>(collectionName: string, data: T): Promise<string> {
  if (collectionName === 'users') {
    const created = await UsersService.create(data as unknown as User & { password: string });
    return created.id;
  }
  const id = crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  await prisma.collectionDoc.create({ data: { collection: collectionName, id, data } });
  return id;
}

export async function setDocument<T extends DocumentData>(collectionName: string, id: string, data: T): Promise<void> {
  if (collectionName === 'users') {
    await UsersService.update(id, data as unknown as Partial<User>);
    return;
  }
  await prisma.collectionDoc.upsert({
    where: { collection_id: { collection: collectionName, id } },
    create: { collection: collectionName, id, data },
    update: { data }
  });
}

export async function updateDocument<T extends DocumentData>(collectionName: string, id: string, patch: Partial<T>): Promise<void> {
  if (collectionName === 'users') {
    await UsersService.update(id, patch as unknown as Partial<User>);
    return;
  }
  const existing = await prisma.collectionDoc.findUnique({
    where: { collection_id: { collection: collectionName, id } }
  });
  if (!existing) throw new Error(`Document not found: ${collectionName}/${id}`);
  const next = { ...(existing.data as Record<string, unknown>), ...(patch as Record<string, unknown>) };
  await prisma.collectionDoc.update({
    where: { collection_id: { collection: collectionName, id } },
    data: { data: next as unknown as any }
  });
}

export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  if (collectionName === 'users') {
    await UsersService.update(id, { isActive: false });
    return;
  }
  await prisma.collectionDoc.delete({ where: { collection_id: { collection: collectionName, id } } });
}

// New Prisma-first helpers (preferred over the Firestore-compatible API above).

export function generateDocumentId(prefix?: string): string {
  const base = crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return prefix ? `${prefix}_${base}` : base;
}

export async function listCollection<T>(collectionName: string): Promise<T[]> {
  return getCollection<T>(collectionName);
}

export async function readDocument<T>(collectionName: string, id: string): Promise<T | null> {
  const snapshot = await getDoc({ __type: 'doc', __col: collectionName, __id: id });
  if (!snapshot.exists()) return null;
  const value = snapshot.data();
  return (value ? ({ id, ...(value as Record<string, unknown>) } as T) : null);
}

export async function saveDocument<T extends DocumentData>(collectionName: string, id: string, data: T): Promise<void> {
  await setDocument(collectionName, id, data);
}

export async function createDocument<T extends DocumentData>(collectionName: string, data: T & { id?: string }): Promise<string> {
  if (data.id) {
    await setDocument(collectionName, data.id, data);
    return data.id;
  }
  return addDocument(collectionName, data);
}

export async function patchDocument<T extends DocumentData>(collectionName: string, id: string, patch: Partial<T>): Promise<void> {
  await updateDocument(collectionName, id, patch);
}

export async function removeDocument(collectionName: string, id: string): Promise<void> {
  await deleteDocument(collectionName, id);
}
