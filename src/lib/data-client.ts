// Thin client for interacting with collection/document REST API endpoints.
// Replaces legacy firestore service usage in client components.

export interface QueryOptions {
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

function buildQuery(opts?: QueryOptions): string {
  if (!opts?.params) return '';
  const q = Object.entries(opts.params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return q ? `?${q}` : '';
}

async function handleJson(res: Response) {
  if (res.ok) return res.json();
  let detail: any = undefined;
  try { detail = await res.json(); } catch {}
  const msg = detail?.error || detail?.message || `Request failed (${res.status})`;
  const err = new Error(msg);
  (err as any).status = res.status;
  (err as any).detail = detail;
  throw err;
}

// List documents (collection GET)
export async function listDocuments<T = any>(collection: string, opts?: QueryOptions): Promise<T[]> {
  const res = await fetch(`/api/collections/${collection}${buildQuery(opts)}`, { signal: opts?.signal });
  const data = await handleJson(res);
  // Accept multiple shapes for backward compatibility:
  // 1) Array of documents
  // 2) { items: T[] }
  // 3) { docs: T[] } (older shape)
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    if (Array.isArray((data as any).items)) return (data as any).items as T[];
    if (Array.isArray((data as any).docs)) return (data as any).docs as T[];
  }
  // Fallback to empty list to avoid runtime errors
  return [] as T[];
}

// Get a single document
export async function getDocument<T = any>(collection: string, id: string): Promise<T | null> {
  // Use generic collections endpoint to support collections without direct Prisma models
  const res = await fetch(`/api/collections/${collection}/${id}`);
  if (res.status === 404) return null;
  const data = await handleJson(res);
  if (data && typeof data === 'object' && 'document' in data) {
    return (data as any).document as T ?? null;
  }
  return data as T;
}

// Create or overwrite (PATCH used in current API as upsert)
export async function setDocument<T = any>(collection: string, id: string, data: any): Promise<T> {
  // PUT upsert on collections endpoint
  const res = await fetch(`/api/collections/${collection}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleJson(res);
}

// Update (PUT) existing document (partial semantics server-side)
export async function updateDocument<T = any>(collection: string, id: string, data: any): Promise<T> {
  // PATCH for partial updates
  const res = await fetch(`/api/collections/${collection}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleJson(res);
}

// Delete document
export async function deleteDocument(collection: string, id: string): Promise<void> {
  const res = await fetch(`/api/collections/${collection}/${id}`, { method: 'DELETE' });
  if (res.status === 404) return; // idempotent
  await handleJson(res);
}
