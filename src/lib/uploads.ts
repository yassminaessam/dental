// Client-side helper for uploading files to the Next.js /api/uploads endpoint.

export interface UploadOptions {
  category?: string; // logical grouping (defaults to 'uploads')
  subPath?: string;  // optional subdirectory (e.g. patient id)
  signal?: AbortSignal;
}

export interface UploadResponse {
  url: string;
  path: string;
  driver: string;
}

export async function uploadFileToServer(file: File, opts: UploadOptions = {}): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  if (opts.category) form.append('category', opts.category);
  if (opts.subPath) form.append('subPath', opts.subPath);

  const res = await fetch('/api/uploads', {
    method: 'POST',
    body: form,
    signal: opts.signal,
  });

  if (!res.ok) {
    let msg = 'Upload failed';
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json();
}
