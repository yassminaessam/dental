// Neon-based File Storage Service
// Replaces Firebase Storage with local/S3 storage and Neon database tracking

import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export interface FileUploadOptions {
  userId: string;
  category: 'patient_photo' | 'medical_document' | 'dental_image' | 'insurance_doc' | 'prescription' | 'other';
  patientId?: string;
  treatmentId?: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export interface StoredFile {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: string;
  storageType: 'local' | 's3' | 'firebase';
  storagePath: string;
  url: string;
  userId: string;
  patientId?: string;
  treatmentId?: string;
  uploadedAt: Date;
  isActive: boolean;
}

export interface FileSearchFilters {
  userId?: string;
  patientId?: string;
  treatmentId?: string;
  category?: string;
  mimeType?: string;
  isActive?: boolean;
}

class NeonFileStorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB
  private readonly allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  constructor() {
    this.ensureUploadDirectory();
  }

  /**
   * Upload a file and store metadata in Neon database
   */
  async uploadFile(options: FileUploadOptions): Promise<StoredFile> {
    try {
      // Validate file
      this.validateFile(options);

      // Generate unique filename
      const fileExtension = this.getFileExtension(options.originalName);
      const uniqueFileName = this.generateUniqueFileName(fileExtension);
      
      // Determine storage path based on category
      const categoryPath = this.getCategoryPath(options.category);
      const fullPath = path.join(this.uploadDir, categoryPath);
      
      // Ensure category directory exists
      await this.ensureDirectory(fullPath);
      
      const filePath = path.join(fullPath, uniqueFileName);
      
      // Save file to local storage
      await fs.writeFile(filePath, options.buffer);
      
      // Calculate file hash for integrity
      const fileHash = this.calculateFileHash(options.buffer);
      
      // Save file metadata to database
      const fileRecord = await prisma.$queryRaw`
        INSERT INTO file_storage (
          id, user_id, patient_id, treatment_id, file_name, original_name,
          mime_type, size, category, storage_type, storage_path, file_hash,
          uploaded_at, is_active
        ) VALUES (
          ${this.generateId()}, ${options.userId}, ${options.patientId || null}, 
          ${options.treatmentId || null}, ${uniqueFileName}, ${options.originalName},
          ${options.mimeType}, ${options.size}, ${options.category}, 'local',
          ${path.relative(this.uploadDir, filePath)}, ${fileHash},
          NOW(), true
        ) RETURNING *
      ` as any[];

      const file = fileRecord[0];
      
      return this.mapToStoredFile(file);

    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<StoredFile | null> {
    try {
      const files = await prisma.$queryRaw`
        SELECT * FROM file_storage 
        WHERE id = ${fileId} AND is_active = true
      ` as any[];

      if (!files || files.length === 0) {
        return null;
      }

      return this.mapToStoredFile(files[0]);

    } catch (error) {
      console.error('Get file error:', error);
      return null;
    }
  }

  /**
   * Get file buffer for download
   */
  async getFileBuffer(fileId: string): Promise<{ buffer: Buffer; file: StoredFile } | null> {
    try {
      const file = await this.getFile(fileId);
      
      if (!file) {
        return null;
      }

      const fullPath = path.join(this.uploadDir, file.storagePath);
      const buffer = await fs.readFile(fullPath);

      return { buffer, file };

    } catch (error) {
      console.error('Get file buffer error:', error);
      return null;
    }
  }

  /**
   * Search files with filters
   */
  async searchFiles(filters: FileSearchFilters, limit = 50, offset = 0): Promise<StoredFile[]> {
    try {
      const whereConditions = ['is_active = true'];
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.userId) {
        whereConditions.push(`user_id = $${paramIndex}`);
        params.push(filters.userId);
        paramIndex++;
      }

      if (filters.patientId) {
        whereConditions.push(`patient_id = $${paramIndex}`);
        params.push(filters.patientId);
        paramIndex++;
      }

      if (filters.treatmentId) {
        whereConditions.push(`treatment_id = $${paramIndex}`);
        params.push(filters.treatmentId);
        paramIndex++;
      }

      if (filters.category) {
        whereConditions.push(`category = $${paramIndex}`);
        params.push(filters.category);
        paramIndex++;
      }

      if (filters.mimeType) {
        whereConditions.push(`mime_type LIKE $${paramIndex}`);
        params.push(`%${filters.mimeType}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.join(' AND ');
      
      params.push(limit, offset);
      
      const query = `
        SELECT * FROM file_storage 
        WHERE ${whereClause}
        ORDER BY uploaded_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const files = await prisma.$queryRawUnsafe(query, ...params) as any[];

      return files.map(file => this.mapToStoredFile(file));

    } catch (error) {
      console.error('Search files error:', error);
      return [];
    }
  }

  /**
   * Get files for a patient
   */
  async getPatientFiles(patientId: string): Promise<StoredFile[]> {
    return this.searchFiles({ patientId });
  }

  /**
   * Get files for a treatment
   */
  async getTreatmentFiles(treatmentId: string): Promise<StoredFile[]> {
    return this.searchFiles({ treatmentId });
  }

  /**
   * Delete file (soft delete)
   */
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      const result = await prisma.$executeRaw`
        UPDATE file_storage 
        SET is_active = false, deleted_at = NOW(), deleted_by = ${userId}
        WHERE id = ${fileId} AND is_active = true
      `;

      return result > 0;

    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  }

  /**
   * Permanently delete file (remove from disk and database)
   */
  async permanentlyDeleteFile(fileId: string): Promise<boolean> {
    try {
      const file = await this.getFile(fileId);
      
      if (!file) {
        return false;
      }

      // Delete from disk
      const fullPath = path.join(this.uploadDir, file.storagePath);
      
      try {
        await fs.unlink(fullPath);
      } catch (diskError) {
        console.warn('Could not delete file from disk:', diskError);
      }

      // Delete from database
      await prisma.$executeRaw`
        DELETE FROM file_storage WHERE id = ${fileId}
      `;

      return true;

    } catch (error) {
      console.error('Permanent delete file error:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByCategory: Record<string, number>;
    filesByType: Record<string, number>;
  }> {
    try {
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_files,
          SUM(size) as total_size,
          category,
          mime_type
        FROM file_storage 
        WHERE is_active = true
        GROUP BY category, mime_type
      ` as any[];

      const result = {
        totalFiles: 0,
        totalSize: 0,
        filesByCategory: {} as Record<string, number>,
        filesByType: {} as Record<string, number>
      };

      stats.forEach((stat: any) => {
        result.totalFiles += parseInt(stat.total_files);
        result.totalSize += parseInt(stat.total_size || 0);
        
        result.filesByCategory[stat.category] = 
          (result.filesByCategory[stat.category] || 0) + parseInt(stat.total_files);
        
        result.filesByType[stat.mime_type] = 
          (result.filesByType[stat.mime_type] || 0) + parseInt(stat.total_files);
      });

      return result;

    } catch (error) {
      console.error('Get storage stats error:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        filesByCategory: {},
        filesByType: {}
      };
    }
  }

  /**
   * Clean up orphaned files (files on disk without database records)
   */
  async cleanupOrphanedFiles(): Promise<{ deletedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let deletedCount = 0;

    try {
      // Get all files from database
      const dbFiles = await prisma.$queryRaw`
        SELECT storage_path FROM file_storage WHERE storage_type = 'local'
      ` as any[];

      const dbPaths = new Set(dbFiles.map(f => f.storage_path));

      // Scan upload directory
      const allFiles = await this.getAllFilesRecursive(this.uploadDir);

      for (const filePath of allFiles) {
        const relativePath = path.relative(this.uploadDir, filePath);
        
        if (!dbPaths.has(relativePath)) {
          try {
            await fs.unlink(filePath);
            deletedCount++;
          } catch (error) {
            errors.push(`Could not delete ${filePath}: ${error}`);
          }
        }
      }

    } catch (error) {
      errors.push(`Cleanup error: ${error}`);
    }

    return { deletedCount, errors };
  }

  // Private helper methods

  private validateFile(options: FileUploadOptions): void {
    if (options.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.allowedMimeTypes.includes(options.mimeType)) {
      throw new Error(`File type ${options.mimeType} is not allowed`);
    }

    if (!options.originalName || options.originalName.trim() === '') {
      throw new Error('Original filename is required');
    }
  }

  private getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }

  private generateUniqueFileName(extension: string): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}_${random}${extension}`;
  }

  private getCategoryPath(category: string): string {
    const categoryPaths = {
      'patient_photo': 'patients/photos',
      'medical_document': 'medical/documents',
      'dental_image': 'dental/images',
      'insurance_doc': 'insurance/documents',
      'prescription': 'prescriptions',
      'other': 'other'
    };

    return categoryPaths[category as keyof typeof categoryPaths] || 'other';
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private calculateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private mapToStoredFile(file: any): StoredFile {
    return {
      id: file.id,
      fileName: file.file_name,
      originalName: file.original_name,
      mimeType: file.mime_type,
      size: parseInt(file.size),
      category: file.category,
      storageType: file.storage_type,
      storagePath: file.storage_path,
      url: `/api/files/${file.id}`,
      userId: file.user_id,
      patientId: file.patient_id,
      treatmentId: file.treatment_id,
      uploadedAt: file.uploaded_at,
      isActive: file.is_active
    };
  }

  private async getAllFilesRecursive(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getAllFilesRecursive(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory ${dir}:`, error);
    }
    
    return files;
  }
}

export const neonFileStorage = new NeonFileStorageService();
export default neonFileStorage;