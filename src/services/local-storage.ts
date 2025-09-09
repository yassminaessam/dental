/**
 * Local File Storage Service
 * 
 * This service stores files locally on the server file system
 * and tracks file metadata in the Neon PostgreSQL database
 */

import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Ensure upload directories exist
async function ensureUploadDirectories() {
  const directories = [
    path.join(UPLOAD_DIR, 'clinical-images'),
    path.join(UPLOAD_DIR, 'profile-images'),
    path.join(UPLOAD_DIR, 'documents'),
    path.join(UPLOAD_DIR, 'temp')
  ];

  for (const dir of directories) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
}

// Initialize storage
ensureUploadDirectories().catch(console.error);

// File metadata model (to be added to Prisma schema)
interface FileRecord {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  category: string;
  uploadedBy?: string;
  patientId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Local Storage Service
 */
export class LocalStorageService {
  
  /**
   * Upload a file to local storage
   */
  static async uploadFile(
    file: File,
    category: string,
    options: {
      patientId?: string;
      uploadedBy?: string;
      customName?: string;
    } = {}
  ): Promise<string> {
    try {
      // Validate file
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`);
      }

      // Generate unique filename
      const fileExtension = path.extname(file.name);
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');
      const fileName = options.customName || 
        `${timestamp}_${randomId}${fileExtension}`;

      // Determine storage path
      const categoryDir = path.join(UPLOAD_DIR, category);
      const filePath = path.join(categoryDir, fileName);

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save file to disk
      await fs.writeFile(filePath, buffer);
      console.log(`File saved locally: ${filePath}`);

      // Save metadata to database
      await this.saveFileMetadata({
        originalName: file.name,
        fileName,
        filePath: path.relative(process.cwd(), filePath),
        mimeType: file.type,
        size: file.size,
        category,
        patientId: options.patientId,
        uploadedBy: options.uploadedBy
      });

      // Return public URL
      const publicUrl = `/api/files/${category}/${fileName}`;
      console.log(`File uploaded successfully: ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error('Local storage upload error:', error);
      throw error;
    }
  }

  /**
   * Delete a file from local storage
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract file info from URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const category = urlParts[urlParts.length - 2];

      if (!fileName || !category) {
        console.warn('Could not parse file URL:', fileUrl);
        return;
      }

      // Get file record from database
      const fileRecord = await this.getFileByName(fileName);
      if (!fileRecord) {
        console.warn('File record not found:', fileName);
        return;
      }

      // Delete physical file
      const fullPath = path.join(process.cwd(), fileRecord.filePath);
      try {
        await fs.unlink(fullPath);
        console.log(`File deleted from disk: ${fullPath}`);
      } catch (error) {
        console.warn('Could not delete physical file:', error);
      }

      // Delete database record
      await this.deleteFileMetadata(fileRecord.id);
      console.log(`File metadata deleted: ${fileName}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw - deletion failures shouldn't break the app
    }
  }

  /**
   * Replace an existing file
   */
  static async replaceFile(
    oldFileUrl: string,
    newFile: File,
    category: string,
    options: {
      patientId?: string;
      uploadedBy?: string;
    } = {}
  ): Promise<string> {
    try {
      // Upload new file first
      const newFileUrl = await this.uploadFile(newFile, category, options);
      
      // Delete old file (don't wait for it)
      if (oldFileUrl) {
        this.deleteFile(oldFileUrl).catch(err => 
          console.warn('Failed to delete old file:', err)
        );
      }
      
      return newFileUrl;
    } catch (error) {
      console.error('Error replacing file:', error);
      throw error;
    }
  }

  /**
   * Get file stream for serving
   */
  static async getFileStream(category: string, fileName: string) {
    try {
      const fileRecord = await this.getFileByName(fileName);
      if (!fileRecord) {
        throw new Error('File not found');
      }

      const fullPath = path.join(process.cwd(), fileRecord.filePath);
      
      // Check if file exists
      try {
        await fs.access(fullPath);
      } catch {
        throw new Error('Physical file not found');
      }

      return {
        filePath: fullPath,
        mimeType: fileRecord.mimeType,
        originalName: fileRecord.originalName,
        size: fileRecord.size
      };
    } catch (error) {
      console.error('Error getting file stream:', error);
      throw error;
    }
  }

  /**
   * List files by category
   */
  static async listFiles(category: string): Promise<FileRecord[]> {
    try {
      // For now, return empty array since we haven't added the file table to Prisma schema yet
      // This would be implemented once we add the File model to the database
      return [];
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  /**
   * Save file metadata to database
   */
  private static async saveFileMetadata(metadata: Omit<FileRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      // For now, we'll store in a simple JSON file until we add File model to Prisma
      const metadataFile = path.join(UPLOAD_DIR, 'metadata.json');
      let allMetadata: FileRecord[] = [];
      
      try {
        const existingData = await fs.readFile(metadataFile, 'utf-8');
        allMetadata = JSON.parse(existingData);
      } catch {
        // File doesn't exist or is invalid, start fresh
      }

      const fileRecord: FileRecord = {
        id: crypto.randomUUID(),
        ...metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      allMetadata.push(fileRecord);
      await fs.writeFile(metadataFile, JSON.stringify(allMetadata, null, 2));
      
      console.log('File metadata saved:', fileRecord.fileName);
    } catch (error) {
      console.error('Error saving file metadata:', error);
    }
  }

  /**
   * Get file metadata by filename
   */
  private static async getFileByName(fileName: string): Promise<FileRecord | null> {
    try {
      const metadataFile = path.join(UPLOAD_DIR, 'metadata.json');
      const data = await fs.readFile(metadataFile, 'utf-8');
      const allMetadata: FileRecord[] = JSON.parse(data);
      
      return allMetadata.find(file => file.fileName === fileName) || null;
    } catch {
      return null;
    }
  }

  /**
   * Delete file metadata
   */
  private static async deleteFileMetadata(fileId: string) {
    try {
      const metadataFile = path.join(UPLOAD_DIR, 'metadata.json');
      const data = await fs.readFile(metadataFile, 'utf-8');
      const allMetadata: FileRecord[] = JSON.parse(data);
      
      const filteredMetadata = allMetadata.filter(file => file.id !== fileId);
      await fs.writeFile(metadataFile, JSON.stringify(filteredMetadata, null, 2));
    } catch (error) {
      console.error('Error deleting file metadata:', error);
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats() {
    try {
      const metadataFile = path.join(UPLOAD_DIR, 'metadata.json');
      const data = await fs.readFile(metadataFile, 'utf-8');
      const allMetadata: FileRecord[] = JSON.parse(data);
      
      const totalSize = allMetadata.reduce((sum, file) => sum + file.size, 0);
      const filesByCategory = allMetadata.reduce((acc, file) => {
        acc[file.category] = (acc[file.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalFiles: allMetadata.length,
        totalSize,
        totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
        filesByCategory,
        uploadDir: UPLOAD_DIR
      };
    } catch {
      return {
        totalFiles: 0,
        totalSize: 0,
        totalSizeMB: 0,
        filesByCategory: {},
        uploadDir: UPLOAD_DIR
      };
    }
  }
}

// Clinical Images Storage
export const clinicalImagesLocalStorage = {
  async uploadClinicalImage(
    file: File,
    patientId: string,
    imageType: string,
    uploadedBy?: string
  ): Promise<string> {
    const customName = `${patientId}_${imageType}_${Date.now()}_${file.name}`;
    return await LocalStorageService.uploadFile(file, 'clinical-images', {
      patientId,
      uploadedBy,
      customName
    });
  },

  async replaceClinicalImage(
    oldImageUrl: string,
    newFile: File,
    patientId: string,
    imageType: string,
    uploadedBy?: string
  ): Promise<string> {
    return await LocalStorageService.replaceFile(oldImageUrl, newFile, 'clinical-images', {
      patientId,
      uploadedBy
    });
  },

  async deleteClinicalImage(imageUrl: string): Promise<void> {
    return await LocalStorageService.deleteFile(imageUrl);
  }
};

// Profile Images Storage
export const profileImagesLocalStorage = {
  async uploadProfileImage(file: File, userId: string): Promise<string> {
    const customName = `${userId}_profile_${Date.now()}_${file.name}`;
    return await LocalStorageService.uploadFile(file, 'profile-images', {
      uploadedBy: userId,
      customName
    });
  },

  async replaceProfileImage(oldImageUrl: string, newFile: File, userId: string): Promise<string> {
    return await LocalStorageService.replaceFile(oldImageUrl, newFile, 'profile-images', {
      uploadedBy: userId
    });
  },

  async deleteProfileImage(imageUrl: string): Promise<void> {
    return await LocalStorageService.deleteFile(imageUrl);
  }
};

// Documents Storage
export const documentsLocalStorage = {
  async uploadDocument(
    file: File,
    patientId: string,
    documentType: string,
    uploadedBy?: string
  ): Promise<string> {
    const customName = `${patientId}_${documentType}_${Date.now()}_${file.name}`;
    return await LocalStorageService.uploadFile(file, 'documents', {
      patientId,
      uploadedBy,
      customName
    });
  },

  async replaceDocument(
    oldDocUrl: string,
    newFile: File,
    patientId: string,
    documentType: string,
    uploadedBy?: string
  ): Promise<string> {
    return await LocalStorageService.replaceFile(oldDocUrl, newFile, 'documents', {
      patientId,
      uploadedBy
    });
  },

  async deleteDocument(docUrl: string): Promise<void> {
    return await LocalStorageService.deleteFile(docUrl);
  }
};

export default LocalStorageService;