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
  return handleJson(res);
}

// Get a single document
export async function getDocument<T = any>(collection: string, id: string): Promise<T | null> {
  const res = await fetch(`/api/documents/${collection}/${id}`);
  if (res.status === 404) return null;
  return handleJson(res);
}

// Create or overwrite (PATCH used in current API as upsert)
export async function setDocument<T = any>(collection: string, id: string, data: any): Promise<T> {
  const res = await fetch(`/api/documents/${collection}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleJson(res);
}

// Update (PUT) existing document (partial semantics server-side)
export async function updateDocument<T = any>(collection: string, id: string, data: any): Promise<T> {
  const res = await fetch(`/api/documents/${collection}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleJson(res);
}

// Delete document
export async function deleteDocument(collection: string, id: string): Promise<void> {
  const res = await fetch(`/api/documents/${collection}/${id}`, { method: 'DELETE' });
  if (res.status === 404) return; // idempotent
  await handleJson(res);
}
