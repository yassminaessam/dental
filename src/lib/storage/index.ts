// Generic storage abstraction interface to allow pluggable backends (FTPS, S3, local, mock)
// Minimal surface area required by current application flows.

export interface UploadParams {
  /** Raw bytes to store */
  buffer: Buffer;
  /** Original filename (used only for deriving extension) */
  originalName: string;
  /** Optional explicit content type (fallback detected or default application/octet-stream) */
  contentType?: string;
  /** Optional logical bucket/category e.g. clinical-images, profile-images */
  category?: string;
  /** Optional sub path (e.g. patient id) */
  subPath?: string;
  /** Optional override for the final stored file name */
  fileName?: string;
}

export interface UploadResult {
  url: string;        // Public URL to access asset
  path: string;       // Relative path inside storage root
  size: number;       // Bytes stored
  contentType: string;// Resolved content type
  driver: string;     // Driver id (ftps, mock, s3, etc.)
}

export interface StorageDriver {
  readonly name: string; // short id
  /** Returns true if the driver has enough env/config to operate */
  isConfigured(): boolean;
  /** Upload new object returning its public URL */
  upload(params: UploadParams): Promise<UploadResult>;
  /** Delete object if exists (should not throw if missing) */
  delete(pathOrUrl: string): Promise<void>;
  /** Build a public URL from internal relative path */
  getPublicUrl(path: string): string;
}

// Utility: sanitize file name segments to avoid traversal & unsafe chars
export function safeSegment(input: string): string {
  return input
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9._-]/g, '')
    .replace(/\.+/g, '.') // collapse multiple dots
    .slice(0, 120) || 'file';
}

// Derive extension from original name
export function getExtension(name: string): string {
  const m = /\.([A-Za-z0-9]+)$/.exec(name);
  return m ? m[1].toLowerCase() : '';
}
