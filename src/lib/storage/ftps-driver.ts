import type { StorageDriver, UploadParams, UploadResult } from './index';
import { safeSegment, getExtension } from './index';

// We import dynamically to avoid adding dependency if driver not used at runtime.
async function getFtpClient() {
  const mod = await import('basic-ftp');
  return new mod.Client();
}

function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`FTPS driver missing required env var: ${name}`);
  return value;
}

export class FtpsStorageDriver implements StorageDriver {
  readonly name = 'ftps';

  private readonly host = process.env.FTPS_HOST;
  private readonly user = process.env.FTPS_USER;
  private readonly password = process.env.FTPS_PASSWORD;
  private readonly baseDir = process.env.FTPS_BASE_DIR || '/';
  private readonly publicBase = (process.env.PUBLIC_ASSETS_BASE || '').replace(/\/$/, '');

  isConfigured(): boolean {
    return !!(this.host && this.user && this.password && this.publicBase);
  }

  getPublicUrl(path: string): string {
    if (!this.publicBase) throw new Error('PUBLIC_ASSETS_BASE not configured');
    return `${this.publicBase}/${path}`.replace(/(?<!:)\/+/g, '/');
  }

  private buildPath(params: UploadParams): { rel: string; abs: string; fileName: string } {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(now.getUTCDate()).padStart(2, '0');
    const category = safeSegment(params.category || 'uploads');
    const sub = params.subPath ? params.subPath.split('/').map(safeSegment).join('/') : '';
    const ext = getExtension(params.fileName || params.originalName);
    const random = cryptoRandom(12);
    const baseName = params.fileName ? safeSegment(params.fileName.replace(/\.[^.]+$/, '')) : random;
    const fileName = ext ? `${baseName}.${ext}` : baseName;
    const rel = [category, yyyy, mm, dd, sub, fileName].filter(Boolean).join('/');
    const abs = `${this.baseDir.replace(/\/$/, '')}/${rel}`;
    return { rel, abs, fileName };
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    if (!this.isConfigured()) throw new Error('FTPS storage not configured');
    const { rel, abs } = this.buildPath(params);
    const client = await getFtpClient();
    client.ftp.verbose = false;
    try {
      await client.access({
        host: required('FTPS_HOST', this.host),
        user: required('FTPS_USER', this.user),
        password: required('FTPS_PASSWORD', this.password),
        secure: true,
        secureOptions: { rejectUnauthorized: false } // shared hosting often lacks full chain
      });

      // Ensure directory chain exists
      const dirPath = abs.substring(0, abs.lastIndexOf('/'));
      await client.ensureDir(dirPath);

      // Upload from buffer
      const { Readable } = await import('stream');
      const stream = Readable.from(params.buffer);
      await client.uploadFrom(stream as any, abs);
    } finally {
      client.close();
    }

    const contentType = params.contentType || guessContentType(params.originalName);
    return {
      url: this.getPublicUrl(rel),
      path: rel,
      size: params.buffer.length,
      contentType,
      driver: this.name
    };
  }

  async delete(pathOrUrl: string): Promise<void> {
    if (!this.isConfigured()) return; // silently ignore
    // Convert URL to relative if needed
    let rel = pathOrUrl;
    if (rel.startsWith('http')) {
      const idx = rel.indexOf(this.publicBase);
      if (idx >= 0) {
        rel = rel.substring(this.publicBase.length).replace(/^\//, '');
      }
    }
    const abs = `${this.baseDir.replace(/\/$/, '')}/${rel}`;
    const client = await getFtpClient();
    try {
      await client.access({
        host: required('FTPS_HOST', this.host),
        user: required('FTPS_USER', this.user),
        password: required('FTPS_PASSWORD', this.password),
        secure: true,
        secureOptions: { rejectUnauthorized: false }
      });
      await client.remove(abs).catch(() => {}); // ignore missing
    } finally {
      client.close();
    }
  }
}

function cryptoRandom(len: number): string {
  try {
    const { randomBytes } = require('crypto');
    return randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
  } catch {
    return Math.random().toString(16).slice(2, 2 + len);
  }
}

function guessContentType(name: string): string {
  const ext = getExtension(name);
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    case 'pdf': return 'application/pdf';
    case 'svg': return 'image/svg+xml';
    default: return 'application/octet-stream';
  }
}

export function createFtpsDriver(): FtpsStorageDriver {
  return new FtpsStorageDriver();
}
