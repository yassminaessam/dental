'use client';

const BASE_PATH = '/api/collections';
const DOCS_BASE_PATH = '/api/documents';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method: HttpMethod;
  body?: unknown;
}

async function request<TResponse>(path: string, options: RequestOptions): Promise<TResponse> {
  const response = await fetch(path, {
    method: options.method,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let details: unknown = null;
    try {
      details = await response.json();
    } catch (error) {
      details = null;
    }
    const message = typeof details === 'object' && details && 'error' in details ? (details as { error?: string }).error : undefined;
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

function buildPath(collection: string, id?: string) {
  return id ? `${BASE_PATH}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}` : `${BASE_PATH}/${encodeURIComponent(collection)}`;
}

function buildDocPath(collection: string, id?: string) {
  return id ? `${DOCS_BASE_PATH}/${encodeURIComponent(collection)}/${encodeURIComponent(id)}` : `${DOCS_BASE_PATH}/${encodeURIComponent(collection)}`;
}

// Some collections are backed by direct Prisma models and live under /api/documents
// rather than the generic Firestore-like /api/collections abstraction.
function isDirectDocCollection(collection: string) {
  return collection === 'clinic-settings' || collection === 'clinicSettings';
}

export function generateDocumentId(prefix?: string): string {
  const base = globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return prefix ? `${prefix}_${base}` : base;
}

export async function listCollection<T>(collection: string): Promise<T[]> {
  const result = await request<{ items?: T[]; data?: T[] }>(buildPath(collection), { method: 'GET' });
  return result.items ?? result.data ?? [];
}

export const getCollection = listCollection;

export async function getDocument<T>(collection: string, id: string): Promise<T | null> {
  // Prefer direct documents endpoint for special collections
  if (isDirectDocCollection(collection)) {
    const res = await fetch(buildDocPath(collection, id), { method: 'GET' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    // documents endpoint returns the object directly (not wrapped)
    const data = (await res.json()) as T;
    return data ?? null;
  }
  const result = await request<{ document?: T }>(buildPath(collection, id), { method: 'GET' });
  return result.document ?? null;
}

export async function getDoc<T>(collection: string, id: string) {
  const document = await getDocument<T>(collection, id);
  const exists = Boolean(document);
  return {
    exists: () => exists,
    data: () => document,
  } as const;
}

export const readDocument = getDocument;

export async function createDocument<T extends Record<string, unknown>>(collection: string, data: T & { id?: string }) {
  const payload = { ...data };
  const response = await request<{ id: string }>(buildPath(collection), {
    method: 'POST',
    body: payload,
  });
  return response.id;
}

export async function setDocument<T extends Record<string, unknown>>(collection: string, id: string, data: T) {
  if (isDirectDocCollection(collection)) {
    // documents endpoint accepts full object and returns updated entity
    await request<unknown>(buildDocPath(collection, id), {
      method: 'PUT',
      body: data,
    });
    return;
  }
  await request<unknown>(buildPath(collection, id), { method: 'PUT', body: data });
}

export async function updateDocument<T extends Record<string, unknown>>(collection: string, id: string, patch: Partial<T>) {
  if (isDirectDocCollection(collection)) {
    await request<unknown>(buildDocPath(collection, id), { method: 'PATCH', body: patch });
    return;
  }
  await request<unknown>(buildPath(collection, id), { method: 'PATCH', body: patch });
}

export const patchDocument = updateDocument;

export async function deleteDocument(collection: string, id: string) {
  if (isDirectDocCollection(collection)) {
    await request<unknown>(buildDocPath(collection, id), { method: 'DELETE' });
    return;
  }
  await request<unknown>(buildPath(collection, id), { method: 'DELETE' });
}

export const removeDocument = deleteDocument;

export async function saveDocument<T extends Record<string, unknown>>(collection: string, data: T & { id?: string }) {
  if (data.id) {
    const { id, ...rest } = data;
    await setDocument(collection, id, rest as T);
    return id;
  }
  return createDocument(collection, data);
}
