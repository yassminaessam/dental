import type { StorageDriver, UploadParams, UploadResult } from './index';
import { safeSegment, getExtension } from './index';
import { Client } from 'basic-ftp';
import path from 'path';

export interface FTPConfig {
  host: string;
  user: string;
  password: string;
  secure: boolean; // true for FTPS
  basePath: string; // e.g., '/www/dental.adsolutions-eg.com/assets'
  publicUrl: string; // e.g., 'https://dental.adsolutions-eg.com/assets'
}

export class FTPStorageDriver implements StorageDriver {
  readonly name = 'ftp';
  private config: FTPConfig;

  constructor(config: FTPConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return !!(
      this.config.host &&
      this.config.user &&
      this.config.password &&
      this.config.basePath &&
      this.config.publicUrl
    );
  }

  getPublicUrl(relPath: string): string {
    // Convert relative path to public URL
    // e.g., clinical-images/patient-001/image.jpg
    // → https://dental.adsolutions-eg.com/assets/clinical-images/patient-001/image.jpg
    return `${this.config.publicUrl}/${relPath}`.replace(/([^:]\/)\/+/g, '$1');
  }

  private buildPath(params: UploadParams): { rel: string; remote: string; fileName: string } {
    const category = safeSegment(params.category || 'uploads');
    const sub = params.subPath ? params.subPath.split('/').map(safeSegment).join('/') : '';
    const ext = getExtension(params.fileName || params.originalName);
    const baseNameRaw = params.fileName ? params.fileName.replace(/\.[^.]+$/, '') : params.originalName.replace(/\.[^.]+$/, '');
    const baseName = safeSegment(baseNameRaw) || 'file';
    const fileName = ext ? `${baseName}.${ext}` : baseName;
    
    // Relative path for URL
    const rel = [category, sub, fileName].filter(Boolean).join('/');
    
    // Remote FTP path
    const remote = path.posix.join(this.config.basePath, rel);
    
    return { rel, remote, fileName };
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    const { rel, remote, fileName } = this.buildPath(params);
    console.log('🔹 FTP Upload Starting...');
    console.log('  Relative path:', rel);
    console.log('  Remote path:', remote);
    console.log('  File name:', fileName);
    console.log('  File size:', params.buffer.length, 'bytes');
    
    const client = new Client();
    client.ftp.verbose = true; // Always enable verbose logging

    try {
      console.log('🔹 Connecting to FTP server:', this.config.host);
      console.log('  User:', this.config.user);
      console.log('  Secure:', this.config.secure);
      
      // Connect to FTP server
      await client.access({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        secure: this.config.secure,
        secureOptions: {
          rejectUnauthorized: false, // Accept self-signed certificates
        },
      });
      
      console.log('✅ FTP connection established');

      // Create directory structure
      const remoteDir = path.posix.dirname(remote);
      console.log('🔹 Creating directory:', remoteDir);
      try {
        await client.ensureDir(remoteDir);
        console.log('✅ Directory ready');
      } catch (error) {
        console.warn('⚠️ Could not create directory, it may already exist:', error);
      }

      // Upload file
      console.log('🔹 Starting file upload to:', remote);
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(params.buffer);
      
      await client.uploadFrom(bufferStream, remote);
      console.log('✅ File uploaded successfully');

      const contentType = params.contentType || 'application/octet-stream';
      const url = this.getPublicUrl(rel);
      console.log('✅ Public URL:', url);

      return {
        url,
        path: rel,
        size: params.buffer.length,
        contentType,
        driver: this.name,
      };
    } catch (error) {
      console.error('❌ FTP upload error:', error);
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      throw new Error(`FTP upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      console.log('🔹 Closing FTP connection');
      client.close();
    }
  }

  async delete(pathOrUrl: string): Promise<void> {
    const client = new Client();
    client.ftp.verbose = process.env.NODE_ENV === 'development';

    try {
      // Extract relative path from URL or use as-is
      let rel = pathOrUrl;
      if (rel.startsWith('http')) {
        const url = new URL(rel);
        rel = url.pathname.replace(/^\/assets\//, ''); // Remove /assets/ prefix
      } else if (rel.startsWith('/assets/')) {
        rel = rel.replace(/^\/assets\//, '');
      } else if (rel.startsWith('/')) {
        rel = rel.slice(1);
      }

      const remote = path.posix.join(this.config.basePath, rel);

      // Connect to FTP server
      await client.access({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        secure: this.config.secure,
        secureOptions: {
          rejectUnauthorized: false,
        },
      });

      // Delete file
      await client.remove(remote);
    } catch (error) {
      console.warn('FTP delete warning:', error);
      // Don't throw error if file doesn't exist
    } finally {
      client.close();
    }
  }
}

export function createFTPDriver(config: FTPConfig): FTPStorageDriver {
  return new FTPStorageDriver(config);
}
