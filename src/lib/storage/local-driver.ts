import type { StorageDriver, UploadParams, UploadResult } from './index';
import { safeSegment, getExtension } from './index';
import path from 'path';
import { promises as fs } from 'fs';

export class LocalStorageDriver implements StorageDriver {
  readonly name = 'local';
  private readonly publicDir = path.join(process.cwd(), 'public');

  isConfigured(): boolean {
    return true; // local disk is always available on server runtime
  }

  getPublicUrl(relPath: string): string {
    return `/${relPath}`.replace(/(?<!:)\/+/g, '/');
  }

  private buildPath(params: UploadParams): { rel: string; abs: string; fileName: string } {
    const category = safeSegment(params.category || 'uploads');
    const sub = params.subPath ? params.subPath.split('/').map(safeSegment).join('/') : '';
    const ext = getExtension(params.fileName || params.originalName);
    const baseNameRaw = params.fileName ? params.fileName.replace(/\.[^.]+$/, '') : params.originalName.replace(/\.[^.]+$/, '');
    const baseName = safeSegment(baseNameRaw) || 'file';
    const fileName = ext ? `${baseName}.${ext}` : baseName;
    const rel = [category, sub, fileName].filter(Boolean).join('/');
    const abs = path.join(this.publicDir, rel);
    return { rel, abs, fileName };
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    const { rel, abs } = this.buildPath(params);
    const dir = path.dirname(abs);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(abs, params.buffer);
    const contentType = params.contentType || 'application/octet-stream';
    return {
      url: this.getPublicUrl(rel),
      path: rel,
      size: params.buffer.length,
      contentType,
      driver: this.name,
    };
  }

  async delete(pathOrUrl: string): Promise<void> {
    let rel = pathOrUrl;
    if (rel.startsWith('http')) {
      const url = new URL(rel);
      rel = url.pathname.replace(/^\//, '');
    } else if (rel.startsWith('/')) {
      rel = rel.slice(1);
    }
    const abs = path.join(this.publicDir, rel);
    await fs.unlink(abs).catch(() => {});
  }
}

export function createLocalDriver(): LocalStorageDriver {
  return new LocalStorageDriver();
}
